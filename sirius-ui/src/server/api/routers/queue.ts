/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import amqp, { type Connection, type Channel } from "amqplib";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@sirius-rabbitmq:5672/";

const ALLOWED_QUEUES = [
  "scan",
  "scan_control",
  "agent_commands",
  "agent_response",
  "terminal",
  "terminal_response",
  "engine.commands",
  "admin_commands",
] as const;

const QueueNameSchema = z.enum(ALLOWED_QUEUES);

export const QUEUE_OPTIONS = {
  durable: false,
  autoDelete: false,
  exclusive: false,
} as const;

export const queueRouter = createTRPCRouter({
  sendMsg: protectedProcedure
    .input(z.object({ queue: QueueNameSchema, message: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const { queue, message } = input;
      await handleSendMsg(queue, message);
      return true;
    }),
});

export async function handleSendMsg(
  queue: string,
  message: string
): Promise<void> {
  const connection: Connection = await amqp.connect(RABBITMQ_URL);
  let channel: Channel | null = null;

  try {
    channel = await connection.createChannel();

    await channel.assertQueue(queue, QUEUE_OPTIONS);
    channel.sendToQueue(queue, Buffer.from(message));
  } finally {
    try {
      if (channel) await channel.close();
    } catch { /* channel may already be closed */ }
    try {
      await connection.close();
    } catch { /* connection may already be closed */ }
  }
}

export async function waitForResponse(queue: string): Promise<string> {
  let connection: Connection | null = null;
  let channel: Channel | null = null;

  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    // Assert queue first
    await channel.assertQueue(queue, QUEUE_OPTIONS);

    const currentChannel = channel;

    // Only consume one message at a time to avoid race conditions
    await currentChannel.prefetch(1);

    // Set up consumer to wait for the next response (FIFO ordering)
    // NOTE: We intentionally do NOT purge the queue here.
    // Purging before consume can delete the actual response (too slow).
    // Purging after consume can pick up stale messages (original bug).
    // Instead we rely on FIFO ordering: each handleSendMsg+waitForResponse
    // pair is called sequentially, so responses arrive in order.
    const responsePromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Command timed out"));
      }, 30000);

      if (!currentChannel) {
        clearTimeout(timeout);
        reject(new Error("Channel is not available"));
        return;
      }

      currentChannel.consume(queue, (msg) => {
        if (msg) {
          clearTimeout(timeout);
          const content = msg.content.toString();
          currentChannel.ack(msg);
          resolve(content);
        }
      });
    });

    return await responsePromise;
  } finally {
    try {
      // Clean up resources
      if (channel) {
        await channel.close();
      }
      if (connection) {
        await connection.close();
      }
    } catch (error) {
      console.error("[Queue] Error closing connection:", error);
    }
  }
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import amqp, { type Connection, type Channel } from "amqplib";

export const queueRouter = createTRPCRouter({
  // Sends a message to the queue
  sendMsg: publicProcedure
    .input(z.object({ queue: z.string(), message: z.string() }))
    .mutation(async ({ input }) => {
      const { queue, message } = input;
      try {
        await handleSendMsg(queue, message);
      } catch (error) {
        console.error("Error setting value:", error);
      }

      return true;
    }),
});

// Update queue settings to match Go
export const QUEUE_OPTIONS = {
  durable: false, // Match Go settings
  autoDelete: false,
  exclusive: false,
};

export async function handleSendMsg(
  queue: string,
  message: string
): Promise<void> {
  let connection: Connection;
  try {
    connection = await amqp.connect(
      "amqp://guest:guest@sirius-rabbitmq:5672/"
    );
  } catch (connErr) {
    throw connErr;
  }
  const channel: Channel = await connection.createChannel();

  try {
    await channel.assertQueue(queue, {
      durable: false,
      autoDelete: false,
      exclusive: false,
    });

    channel.sendToQueue(queue, Buffer.from(message));
  } finally {
    setTimeout(() => {
      connection.close();
    }, 500);
  }
}

export async function waitForResponse(queue: string): Promise<string> {
  let connection: Connection | null = null;
  let channel: Channel | null = null;

  try {
    connection = await amqp.connect("amqp://guest:guest@sirius-rabbitmq:5672/");
    channel = await connection.createChannel();

    // Assert queue first
    await channel.assertQueue(queue, {
      durable: false,
      autoDelete: false,
      exclusive: false,
    });

    // Capture channel in closure to ensure type safety
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

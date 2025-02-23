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
  const connection: Connection = await amqp.connect(
    "amqp://guest:guest@sirius-rabbitmq:5672/"
  );
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
  const connection: Connection = await amqp.connect(
    "amqp://guest:guest@sirius-rabbitmq:5672/"
  );
  const channel: Channel = await connection.createChannel();

  try {
    // Assert queue first
    await channel.assertQueue(queue, {
      durable: false,
      autoDelete: false,
      exclusive: false,
    });

    // Purge existing messages from the queue
    await channel.purgeQueue(queue);

    // Set up consumer after purging
    const responsePromise = new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("Command timed out"));
      }, 10000);

      channel.consume(queue, (msg) => {
        if (msg) {
          clearTimeout(timeout);
          channel.ack(msg);
          resolve(msg.content.toString());
        }
      });
    });

    return await responsePromise;
  } finally {
    try {
      await connection.close();
    } catch (error) {
      console.error("[Queue] Error closing connection:", error);
    }
  }
}

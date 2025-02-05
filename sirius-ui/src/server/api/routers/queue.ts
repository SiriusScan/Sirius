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
        console.log("Scan started successfully");
      } catch (error) {
        console.error("Error setting value:", error);
      }

      return true;
    }),
});

async function handleSendMsg(queue: string, message: string): Promise<void> {
  const connection: Connection = await amqp.connect("amqp://guest:guest@sirius-rabbitmq:5672/");
  const channel: Channel = await connection.createChannel();

  // await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(message));
  console.log(`Message sent to queue [${queue}]: ${message}`);

  setTimeout(() => {
    connection.close();
  }, 500);
}
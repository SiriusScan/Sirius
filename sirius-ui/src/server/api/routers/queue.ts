import { safeErrorForLogging } from "~/server/safeErrorForLogging";
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { randomUUID } from "node:crypto";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import amqp, { type Connection, type Channel } from "amqplib";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ?? "amqp://guest:guest@sirius-rabbitmq:5672/";

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
    } catch {
      /* channel may already be closed */
    }
    try {
      await connection.close();
    } catch {
      /* connection may already be closed */
    }
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

      void currentChannel
        .consume(queue, (msg) => {
          if (msg) {
            clearTimeout(timeout);
            const content = msg.content.toString();
            currentChannel.ack(msg);
            resolve(content);
          }
        })
        .catch(reject);
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
      console.error(
        "[Queue] Error closing connection:",
        safeErrorForLogging(error)
      );
    }
  }
}

/**
 * Agent RPCs never consume the legacy shared agent_response queue. Each request
 * has a private, connection-owned reply queue and a matching correlation ID.
 * The agent server must publish replies without declaring this exclusive queue.
 */
export async function requestAgentResponse(
  message: Record<string, unknown>
): Promise<string> {
  const correlationId = randomUUID();
  const responseQueue = `agent_response.rpc.${correlationId}`;
  let connection: Connection | null = null;
  let channel: Channel | null = null;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let transportFailure: unknown;
  let failTransport = (error: unknown) => {
    transportFailure = error;
  };
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    // amqplib emits errors separately from rejected operations. Handle them
    // during setup too, so a lost socket cannot become an uncaught event.
    connection.on("error", (error: unknown) => failTransport(error));
    connection.on("close", () =>
      failTransport(new Error("Agent reply connection closed"))
    );
    channel = await connection.createChannel();
    channel.on("error", (error: unknown) => failTransport(error));
    channel.on("close", () =>
      failTransport(new Error("Agent reply channel closed"))
    );
    const currentChannel = channel;
    await currentChannel.assertQueue("agent_commands", QUEUE_OPTIONS);
    await currentChannel.assertQueue(responseQueue, {
      durable: false,
      autoDelete: true,
      exclusive: true,
    });
    const response = new Promise<string>((resolve, reject) => {
      let waiting = true;
      const fail = (error: unknown) => {
        waiting = false;
        reject(error);
      };
      failTransport = fail;
      if (transportFailure !== undefined) {
        fail(transportFailure);
        return;
      }
      timeout = setTimeout(
        () => fail(new Error("Agent command acknowledgement timed out")),
        30000
      );
      // Consume before publishing, including for an immediate backend response.
      void currentChannel
        .consume(responseQueue, (msg) => {
          if (!waiting) return;
          if (!msg) {
            fail(new Error("Agent reply consumer cancelled"));
            return;
          }
          try {
            currentChannel.ack(msg);
          } catch (error) {
            fail(error);
            return;
          }
          let envelope: unknown;
          try {
            envelope = JSON.parse(msg.content.toString());
          } catch {
            return;
          }
          if (
            !envelope ||
            typeof envelope !== "object" ||
            Array.isArray(envelope)
          )
            return;
          const reply = envelope as Record<string, unknown>;
          if (reply.correlationId !== correlationId) return;
          if (!("response" in reply)) {
            fail(new Error("Invalid correlated agent response"));
            return;
          }
          waiting = false;
          resolve(JSON.stringify(reply.response));
        })
        .then(() => {
          if (!waiting) return;
          currentChannel.sendToQueue(
            "agent_commands",
            Buffer.from(
              JSON.stringify({
                ...message,
                noReply: false,
                responseQueue,
                correlationId,
              })
            )
          );
        })
        .catch(fail);
    });
    return await response;
  } finally {
    if (timeout) clearTimeout(timeout);
    try {
      if (channel) await channel.close();
    } catch {
      /* already closed */
    }
    try {
      if (connection) await connection.close();
    } catch {
      /* already closed */
    }
  }
}

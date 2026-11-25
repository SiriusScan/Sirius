import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { handleSendMsg, QueueResponseTimeoutError, waitForResponse } from "./queue";
import { valkey } from "~/server/valkey";

// Define target types
const TargetType = z.enum(["engine", "agent"]);
type TargetType = z.infer<typeof TargetType>;

// Define queue names
const ENGINE_COMMAND_QUEUE = "terminal";
const ENGINE_RESPONSE_QUEUE = "terminal_response";
const AGENT_COMMAND_QUEUE = "agent_commands";
const AGENT_RESPONSE_QUEUE = "agent_response";

// ── Command History persistence (Valkey) ──────────────────────────────────────
const HISTORY_KEY_PREFIX = "terminal:history:";
const HISTORY_MAX_ENTRIES = 500;

/** Zod schema matching CommandHistoryEntry for validation */
const CommandHistoryEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(), // ISO string, converted to Date on the client
  command: z.string(),
  target: z.object({
    type: TargetType,
    id: z.string().optional(),
    name: z.string().optional(),
  }),
  output: z.string(),
  success: z.boolean(),
  durationMs: z.number().optional(),
  multiExec: z
    .object({
      agentCount: z.number(),
      succeeded: z.number(),
      failed: z.number(),
      cancelled: z.number(),
      results: z.array(
        z.object({
          agentId: z.string(),
          agentName: z.string().optional(),
          output: z.string(),
          success: z.boolean(),
        })
      ),
    })
    .optional(),
});

interface CommandMessage {
  command: string;
  userId: string;
  timestamp: string;
  target?: {
    type: TargetType;
    id?: string;
  };
  responseQueue?: string;
}

const POLL_INTERVAL = 500; // ms
const POLL_TIMEOUT = 30000; // ms

async function pollCommandResponse(commandId: string): Promise<string | null> {
  const startTime = Date.now();
  // Key format should match command.CommandResponse.GenerateKey()
  // which is typically "cmd:response:{agent_id}:{command_id}"
  // The commandId here IS the agentId:timestamp string.
  const parts = commandId.split(":");
  if (parts.length < 2) {
    // Basic check for agentId:timestamp format
    console.error("[Terminal] Invalid command ID for response polling");
    return null;
  }
  const agentId = parts[0];
  const valkeyKey = `cmd:response:${agentId}:${commandId}`;

  let storeReadFailed = false;

  while (Date.now() - startTime < POLL_TIMEOUT) {
    try {
      const response = await valkey.get(valkeyKey);
      if (response) return response;
    } catch {
      storeReadFailed = true;
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  console.warn("[Terminal] Command response polling timed out", {
    storeReadFailed,
  });
  return null;
}

export const terminalRouter = createTRPCRouter({
  executeCommand: protectedProcedure
    .input(
      z.object({
        command: z.string(),
        target: z.object({
          type: TargetType,
          id: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!input.command.trim()) {
          return { success: false, output: "Empty command" };
        }

        const timestamp = new Date().toISOString();
        let queueName: string;
        let responseQueue: string;
        let message: CommandMessage;

        if (input.target.type === "engine") {
          queueName = ENGINE_COMMAND_QUEUE;
          responseQueue = ENGINE_RESPONSE_QUEUE;
          message = {
            command: input.command,
            userId: ctx.session.user.id,
            timestamp,
            responseQueue,
          };
        } else {
          // Agent command
          queueName = AGENT_COMMAND_QUEUE;
          responseQueue = AGENT_RESPONSE_QUEUE; // Expect initial ack here
          message = {
            command: input.command,
            userId: ctx.session.user.id,
            timestamp,
            target: input.target,
            // Agent service determines final response delivery (Valkey)
          };
        }

        await handleSendMsg(queueName, JSON.stringify(message));

        const response = await waitForResponse(responseQueue);
        if (!response) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Command acknowledgement timed out",
          });
        }

        if (input.target.type === "engine") {
          return { success: true, output: response };
        }

        // Agent command: Parse acknowledgement and poll Valkey
        const responseObj = JSON.parse(response);
        if (responseObj.error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Command rejected",
          });
        }

        // Acknowledegement received, now poll Valkey for actual output
        if (input.target.id) {
          // Construct the command ID used by the backend (agentId:timestamp)
          const commandIdForPolling = `${input.target.id}:${timestamp}`;
          const output = await pollCommandResponse(commandIdForPolling);
          if (!output) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Command response polling timed out",
            });
          }
          // Assume output in Valkey is the final, plain text response
          // Parse the JSON response string from Valkey
          try {
            const parsedResponse = JSON.parse(output);

            // Check the status and extract relevant field
            if (parsedResponse.status === "completed") {
              return { success: true, output: parsedResponse.output ?? "" };
            } else if (parsedResponse.status === "failed") {
              // Return the error message as output for the terminal to display
              return {
                success: false, // Indicate failure
                output:
                  parsedResponse.error ?? "Command failed with unknown error",
              };
            } else {
              // Handle other statuses (e.g., pending, running) if needed,
              // or treat as unexpected.
              console.warn("[Terminal] Received unexpected command status");
              return {
                success: false,
                output: `Command status: ${parsedResponse.status}`,
              };
            }
          } catch {
            console.error("[Terminal] Failed to parse command response from storage");
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to parse command response from storage",
            });
          }
        } else {
          // Should not happen if target is agent, but handle defensively
          return {
            success: true,
            output: "Command acknowledged, but no agent ID for polling.",
          };
        }
      } catch (error) {
        console.error("[Terminal] Failed to execute command", {
          targetType: input.target.type,
        });
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof QueueResponseTimeoutError
            ? "Command timed out"
            : "Failed to execute command",
        });
      }
    }),

  // ── Command History CRUD (Valkey-backed) ──────────────────────────────────

  /** Fetch all history entries for the current user */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    const key = `${HISTORY_KEY_PREFIX}${ctx.session.user.id}`;
    try {
      const raw = await valkey.lrange(key, 0, HISTORY_MAX_ENTRIES - 1);
      return raw.map((json) => {
        const parsed = JSON.parse(json) as z.infer<typeof CommandHistoryEntrySchema>;
        return parsed;
      });
    } catch {
      console.error("[Terminal:getHistory] Failed to load history");
      return [];
    }
  }),

  /** Persist a new history entry (prepend to list, trim to max) */
  addHistoryEntry: protectedProcedure
    .input(CommandHistoryEntrySchema)
    .mutation(async ({ input, ctx }) => {
      const key = `${HISTORY_KEY_PREFIX}${ctx.session.user.id}`;
      try {
        await valkey.lpush(key, JSON.stringify(input));
        await valkey.ltrim(key, 0, HISTORY_MAX_ENTRIES - 1);
        return { success: true };
      } catch {
        console.error("[Terminal:addHistoryEntry] Failed to save");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save history entry",
        });
      }
    }),

  /** Delete a single history entry by id */
  deleteHistoryEntry: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const key = `${HISTORY_KEY_PREFIX}${ctx.session.user.id}`;
      try {
        // Read all, filter out the target, rewrite.
        // This is acceptable for a capped list of <=500 entries.
        const raw = await valkey.lrange(key, 0, -1);
        const remaining = raw.filter((json) => {
          try {
            const entry = JSON.parse(json) as { id?: string };
            return entry.id !== input.entryId;
          } catch {
            return true;
          }
        });
        // Atomic replace
        const pipeline = valkey.pipeline();
        pipeline.del(key);
        if (remaining.length > 0) {
          pipeline.rpush(key, ...remaining);
        }
        await pipeline.exec();
        return { success: true };
      } catch {
        console.error("[Terminal:deleteHistoryEntry] Failed");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete history entry",
        });
      }
    }),

  /** Purge all history for the current user */
  clearHistory: protectedProcedure.mutation(async ({ ctx }) => {
    const key = `${HISTORY_KEY_PREFIX}${ctx.session.user.id}`;
    try {
      await valkey.del(key);
      return { success: true };
    } catch {
      console.error("[Terminal:clearHistory] Failed");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to clear history",
      });
    }
  }),
});

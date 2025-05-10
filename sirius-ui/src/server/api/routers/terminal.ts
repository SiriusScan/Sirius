import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { handleSendMsg, waitForResponse } from "./queue";
import { valkey } from "~/server/valkey";

// Define target types
const TargetType = z.enum(["engine", "agent"]);
type TargetType = z.infer<typeof TargetType>;

// Define queue names
const ENGINE_COMMAND_QUEUE = "terminal";
const ENGINE_RESPONSE_QUEUE = "terminal_response";
const AGENT_COMMAND_QUEUE = "agent_commands";
const AGENT_RESPONSE_QUEUE = "agent_response";

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
    console.error(
      `[Terminal:pollCommandResponse] Invalid commandId format for polling: ${commandId}`
    );
    return null;
  }
  const agentId = parts[0];
  const valkeyKey = `cmd:response:${agentId}:${commandId}`;

  console.log(
    `[Terminal:pollCommandResponse] Starting polling for key: ${valkeyKey} (using commandId: ${commandId})`
  );

  while (Date.now() - startTime < POLL_TIMEOUT) {
    try {
      const response = await valkey.get(valkeyKey);
      console.log(
        `[Terminal:pollCommandResponse] Polling ${valkeyKey}. Result:`,
        response ? `'${response}'` : null
      );
      if (response) {
        console.log(
          `[Terminal:pollCommandResponse] Found response for ${valkeyKey}`
        );
        return response;
      }
    } catch (error) {
      console.error(
        `[Terminal:pollCommandResponse] Error getting key ${valkeyKey} from Valkey:`,
        error
      );
      // Decide if we should stop polling on error or just log and continue
      // For now, let's continue polling
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  console.log(
    `[Terminal:pollCommandResponse] Polling timed out for key: ${valkeyKey}`
  );
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
        console.log("[Terminal] Executing command:", input.command);
        console.log("[Terminal] Target:", input.target);

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

        console.log(`[Terminal] Sending message to ${queueName}:`, message);
        await handleSendMsg(queueName, JSON.stringify(message));
        console.log(
          `[Terminal] Message sent, waiting for response on ${responseQueue}`
        );

        const response = await waitForResponse(responseQueue);
        if (!response) {
          throw new Error("Command acknowledgement timed out");
        }

        if (input.target.type === "engine") {
          return { success: true, output: response };
        }

        // Agent command: Parse acknowledgement and poll Valkey
        const responseObj = JSON.parse(response);
        if (responseObj.error) {
          throw new Error(`Command rejected: ${responseObj.error}`);
        }

        // Acknowledegement received, now poll Valkey for actual output
        if (input.target.id) {
          // Construct the command ID used by the backend (agentId:timestamp)
          const commandIdForPolling = `${input.target.id}:${timestamp}`;
          console.log(
            `[Terminal] Polling Valkey for agent command response using commandId: ${commandIdForPolling}`
          );
          const output = await pollCommandResponse(commandIdForPolling);
          if (!output) {
            throw new Error("Command response polling timed out");
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
              console.warn(
                `[Terminal] Received unexpected status from Valkey: ${parsedResponse.status}`,
                parsedResponse
              );
              return {
                success: false,
                output: `Command status: ${parsedResponse.status}`,
              };
            }
          } catch (parseError) {
            console.error(
              "[Terminal] Failed to parse Valkey response JSON:",
              parseError,
              "Raw data:",
              output
            );
            throw new Error("Failed to parse command response from storage");
          }
        } else {
          // Should not happen if target is agent, but handle defensively
          return {
            success: true,
            output: "Command acknowledged, but no agent ID for polling.",
          };
        }
      } catch (error) {
        console.error("[Terminal] Failed to execute command:", error);
        const message =
          error instanceof Error ? error.message : "Failed to execute command";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),

  listAgents: protectedProcedure.query(async ({ ctx }) => {
    try {
      const message = JSON.stringify({
        action: "list_agents",
        userId: ctx.session.user.id,
        timestamp: new Date().toISOString(),
      });

      await handleSendMsg(AGENT_COMMAND_QUEUE, message);
      // Wait on the dedicated agent response queue
      const response = await waitForResponse(AGENT_RESPONSE_QUEUE);

      try {
        const agents = JSON.parse(response);
        if (!Array.isArray(agents)) {
          console.error(
            "[Terminal] Invalid agent list response format:",
            response
          );
          return [];
        }
        return agents.map((id) => ({
          id,
          name: id, // Use ID as name for now
          status: "online",
          lastSeen: new Date().toISOString(),
        }));
      } catch (error) {
        console.error("[Terminal] Failed to parse agent list response:", error);
        return [];
      }
    } catch (error) {
      console.error("[Terminal] Failed to list agents:", error);
      const message =
        error instanceof Error ? error.message : "Failed to list agents";
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
    }
  }),

  initializeSession: protectedProcedure
    .input(
      z.object({
        target: z.object({
          type: TargetType,
          id: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const sessionId = crypto.randomUUID();

        // Only initialize session for agent targets
        if (input.target.type === "agent") {
          if (!input.target.id) {
            throw new Error("Agent ID is required for agent session");
          }

          const agentId = input.target.id;
          console.log(
            `[Terminal:initializeSession] Attempting to initialize session for agent: ${agentId}`
          );

          const message = JSON.stringify({
            action: "initialize_session",
            agentId: agentId,
            userId: ctx.session.user.id,
            sessionId,
            timestamp: new Date().toISOString(),
          });

          try {
            await handleSendMsg(AGENT_COMMAND_QUEUE, message);
            console.log(
              `[Terminal:initializeSession] Message sent to ${AGENT_COMMAND_QUEUE}, waiting on ${AGENT_RESPONSE_QUEUE}`
            );

            // Wait on the dedicated agent response queue
            const response = await waitForResponse(AGENT_RESPONSE_QUEUE);
            console.log(
              `[Terminal:initializeSession] Received response on ${AGENT_RESPONSE_QUEUE}:`,
              response
            );

            if (!response) {
              // This case might be less likely if waitForResponse throws on timeout
              console.error(
                "[Terminal:initializeSession] Received null/empty response"
              );
              throw new Error(
                "Received empty response during session initialization"
              );
            }

            // Try parsing the response
            let responseObj: {
              success?: boolean;
              error?: string;
              message?: string;
            } = {};
            try {
              responseObj = JSON.parse(response);
              console.log(
                "[Terminal:initializeSession] Parsed response object:",
                responseObj
              );
            } catch (parseError) {
              console.error(
                "[Terminal:initializeSession] Failed to parse response JSON:",
                parseError,
                "Raw response:",
                response
              );
              throw new Error(
                "Failed to parse session initialization response from backend"
              );
            }

            // Check for backend-reported errors
            if (responseObj.error) {
              console.warn(
                `[Terminal:initializeSession] Backend reported error: ${responseObj.error}`
              );
              // Check specifically for agent not found error
              if (responseObj.error.includes("not found")) {
                throw new Error(`Agent ${agentId} not found`);
              }
              throw new Error(`Initialization failed: ${responseObj.error}`);
            }

            // If no error field and parsing succeeded, assume success
            console.log(
              `[Terminal:initializeSession] Initialization successful for agent: ${agentId}`
            );
          } catch (waitError) {
            // Catch errors from handleSendMsg or waitForResponse (like timeout)
            console.error(
              `[Terminal:initializeSession] Error during wait/send for agent ${agentId}:`,
              waitError
            );
            if (
              waitError instanceof Error &&
              waitError.message.includes("timed out")
            ) {
              throw new Error(
                "Session initialization timed out waiting for backend response"
              );
            }
            if (
              waitError instanceof Error &&
              waitError.message.includes("not found")
            ) {
              throw waitError; // Re-throw specific agent not found error if it bubbles up here
            }
            throw new Error(
              "Failed during session initialization communication"
            ); // General comms error
          }
        }

        // Return success for both engine (no-op) and successful agent init
        return {
          sessionId,
          startTime: new Date().toISOString(),
          target: input.target,
        };
      } catch (error) {
        console.error("[Terminal] Failed to initialize session:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to initialize terminal session";
        // Propagate specific 'Agent not found' error
        if (message.includes("not found")) {
          throw new TRPCError({ code: "NOT_FOUND", message });
        }
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),
});

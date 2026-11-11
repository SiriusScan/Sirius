import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { requestAgentResponse } from "./queue";
import { valkey } from "~/server/valkey";
import {
  assertAgentDispatchActive,
  updateAgentDispatch,
} from "~/server/agentScanDispatchState";

// ValKey key prefixes
const AGENT_SCAN_KEY_PREFIX = "agent_scan:";

interface AgentScanDispatchResult {
  scanId: string;
  dispatchedAgents: string[];
  failedAgents: { id: string; error: string }[];
  totalDispatched: number;
}

interface AgentScanStatusResult {
  scanId: string;
  status:
    | "pending"
    | "dispatching"
    | "running"
    | "completed"
    | "cancelled"
    | "failed";
  totalAgents: number;
  completedAgents: number;
  failedAgents: number;
  agentStatuses: {
    agentId: string;
    status: string;
    hostsFound: number;
    vulnerabilitiesFound: number;
    error?: string;
  }[];
}

/**
 * Fetches the list of connected agents from ValKey (set by the Go agent server).
 * Falls back to RabbitMQ if ValKey key is not available.
 * Returns an array of agent ID strings.
 */
async function getConnectedAgents(): Promise<string[]> {
  try {
    let shouldFallbackToRabbitMq = true;

    // Primary: read from ValKey (avoids shared RabbitMQ queue race conditions)
    const valkeyResult = await valkey.get("connected_agents");
    if (valkeyResult !== null) {
      const agents: unknown = JSON.parse(valkeyResult);
      if (
        Array.isArray(agents) &&
        agents.every(
          (agent) => typeof agent === "string" && agent.trim().length > 0
        )
      ) {
        shouldFallbackToRabbitMq = false;
        console.log(
          `[AgentScan] Got ${agents.length} connected agents from ValKey`
        );
        return agents as string[];
      }
      throw new Error("Invalid connected agent roster");
    }

    // Fallback: use RabbitMQ only when ValKey state is missing.
    if (shouldFallbackToRabbitMq) {
      console.log(
        "[AgentScan] ValKey connected_agents not found, falling back to RabbitMQ"
      );
      const message = {
        action: "list_agents",
        userId: "system",
        timestamp: new Date().toISOString(),
      };

      const response = await requestAgentResponse(message);

      const agents: unknown = JSON.parse(response);
      if (
        !Array.isArray(agents) ||
        !agents.every(
          (agent) => typeof agent === "string" && agent.trim().length > 0
        )
      ) {
        console.error(
          "[AgentScan] Invalid agent list response format:",
          response
        );
        throw new Error("Invalid connected agent roster");
      }
      return agents as string[];
    }

    return [];
  } catch (error) {
    console.error(
      "[AgentScan] Failed to list agents:",
      safeErrorForLogging(error)
    );
    throw error;
  }
}

/**
 * Dispatches a scan command to a single agent via the agent_commands queue.
 */
async function dispatchToAgent(
  agentId: string,
  scanId: string,
  _mode: string,
  concurrency: number,
  timeout: number,
  templateFilter?: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    // Build the command string based on mode
    let command = "internal:template-scan --all";
    command += ` --scan-id=${scanId}`;
    command += ` --workers=${concurrency}`;
    command += ` --timeout=${timeout}`;

    if (templateFilter && templateFilter.length > 0) {
      command += ` --templates=${templateFilter.join(",")}`;
    }

    const message = {
      command,
      userId: "system",
      timestamp: new Date().toISOString(),
      target: {
        type: "agent",
        id: agentId,
      },
    };

    console.log(`[AgentScan] Dispatching to agent ${agentId}: ${command}`);

    const response = await requestAgentResponse(message);
    const responseObj = z
      .object({ success: z.boolean(), error: z.string().optional() })
      .parse(JSON.parse(response));

    if (!responseObj.success || responseObj.error) {
      return {
        success: false,
        error: responseObj.error ?? "Agent command rejected",
      };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown dispatch error";
    console.error(
      `[AgentScan] Failed to dispatch to agent ${agentId}:`,
      safeErrorForLogging(error)
    );
    return { success: false, error: message };
  }
}

export const agentScanRouter = createTRPCRouter({
  /**
   * Dispatch agent scans to one or more connected agents.
   * This is called alongside network scan dispatch when a profile has agent_scan enabled.
   */
  dispatchAgentScan: protectedProcedure
    .input(
      z.object({
        scanId: z.string().trim().min(1),
        agentIds: z.array(z.string().trim().min(1)), // empty = all connected agents
        mode: z.enum(["comprehensive", "templates-only", "scripts-only"]),
        timeout: z.number().default(300),
        concurrency: z.number().default(5),
        templateFilter: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }): Promise<AgentScanDispatchResult> => {
      try {
        console.log(
          `[AgentScan] Dispatching agent scan for scanId: ${input.scanId}`
        );

        const dispatchId = randomUUID();
        let targetAgents: string[];
        try {
          targetAgents = [
            ...new Set(
              input.agentIds.length > 0
                ? input.agentIds
                : await getConnectedAgents()
            ),
          ];
        } catch (error) {
          // Discovery failure is not a successful zero-agent scan.
          await updateAgentDispatch(valkey, {
            scanId: input.scanId,
            dispatchId,
            mode: input.mode,
            targetAgents: [],
            phase: "discovery_failed",
            error:
              error instanceof Error ? error.message : "Agent discovery failed",
          });
          throw error;
        }

        // Register the entire roster before any command can produce a callback.
        // The server owns both representations; the browser never writes a
        // post-dispatch snapshot back over concurrent results.
        await updateAgentDispatch(valkey, {
          scanId: input.scanId,
          dispatchId,
          mode: input.mode,
          targetAgents,
          phase: "prepare",
        });

        const dispatchedAgents: string[] = [];
        const failedAgents: { id: string; error: string }[] = [];

        // Dispatch sequentially; each acknowledgement has a private reply queue.
        // Retry once on "not connected" errors (transient stream reconnection)
        for (const agentId of targetAgents) {
          await assertAgentDispatchActive(valkey, input.scanId, dispatchId);
          let result = await dispatchToAgent(
            agentId,
            input.scanId,
            input.mode,
            input.concurrency,
            input.timeout,
            input.templateFilter
          );

          // Retry once if agent was transiently disconnected
          if (!result.success && result.error?.includes("not connected")) {
            console.log(
              `[AgentScan] Retrying dispatch to ${agentId} after transient disconnect`
            );
            await new Promise((r) => setTimeout(r, 1000)); // Wait 1s for reconnection
            await assertAgentDispatchActive(valkey, input.scanId, dispatchId);
            result = await dispatchToAgent(
              agentId,
              input.scanId,
              input.mode,
              input.concurrency,
              input.timeout,
              input.templateFilter
            );
          }

          if (result.success) {
            dispatchedAgents.push(agentId);
          } else {
            failedAgents.push({
              id: agentId,
              error: result.error ?? "Unknown error",
            });
          }
        }

        // Seal even an empty roster or all-failed dispatch. This merges fast
        // results and only closes the whole scan when every enabled subscan ends.
        await updateAgentDispatch(valkey, {
          scanId: input.scanId,
          dispatchId,
          mode: input.mode,
          targetAgents,
          phase: "seal",
          failedAgents,
        });

        console.log(
          `[AgentScan] Dispatched to ${dispatchedAgents.length} agents, ${failedAgents.length} failed`
        );

        return {
          scanId: input.scanId,
          dispatchedAgents,
          failedAgents,
          totalDispatched: dispatchedAgents.length,
        };
      } catch (error) {
        console.error(
          "[AgentScan] Failed to dispatch agent scan:",
          safeErrorForLogging(error)
        );
        const message =
          error instanceof Error
            ? error.message
            : "Failed to dispatch agent scan";
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
      }
    }),

  /**
   * Get the status of an agent scan dispatch.
   * Used for polling agent scan progress.
   */
  getAgentScanStatus: protectedProcedure
    .input(z.object({ scanId: z.string() }))
    .query(async ({ input }): Promise<AgentScanStatusResult | null> => {
      try {
        const statusKey = AGENT_SCAN_KEY_PREFIX + input.scanId;
        const statusStr = await valkey.get(statusKey);

        if (!statusStr) {
          return null;
        }

        const status = JSON.parse(statusStr) as AgentScanStatusResult;
        return status;
      } catch (error) {
        console.error(
          "[AgentScan] Failed to get agent scan status:",
          safeErrorForLogging(error)
        );
        return null;
      }
    }),
});

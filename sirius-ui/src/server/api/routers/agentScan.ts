import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { handleSendMsg, waitForResponse } from "./queue";
import { valkey } from "~/server/valkey";

// Queue constants (shared with terminal.ts)
const AGENT_COMMAND_QUEUE = "agent_commands";
const AGENT_RESPONSE_QUEUE = "agent_response";

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
  status: "pending" | "running" | "completed" | "partial" | "failed";
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
    // Primary: read from ValKey (avoids shared RabbitMQ queue race conditions)
    const valkeyResult = await valkey.get("connected_agents");
    if (valkeyResult) {
      const agents = JSON.parse(valkeyResult);
      if (Array.isArray(agents)) {
        console.log(`[AgentScan] Got ${agents.length} connected agents from ValKey`);
        return agents as string[];
      }
    }

    // Fallback: use RabbitMQ (legacy path)
    console.log("[AgentScan] ValKey connected_agents not found, falling back to RabbitMQ");
    const message = JSON.stringify({
      action: "list_agents",
      userId: "system",
      timestamp: new Date().toISOString(),
    });

    await handleSendMsg(AGENT_COMMAND_QUEUE, message);
    const response = await waitForResponse(AGENT_RESPONSE_QUEUE);

    const agents = JSON.parse(response);
    if (!Array.isArray(agents)) {
      console.error("[AgentScan] Invalid agent list response format:", response);
      return [];
    }
    return agents as string[];
  } catch (error) {
    console.error("[AgentScan] Failed to list agents:", error);
    return [];
  }
}

/**
 * Dispatches a scan command to a single agent via the agent_commands queue.
 */
async function dispatchToAgent(
  agentId: string,
  scanId: string,
  mode: string,
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

    const message = JSON.stringify({
      command,
      userId: "system",
      timestamp: new Date().toISOString(),
      target: {
        type: "agent",
        id: agentId,
      },
    });

    console.log(
      `[AgentScan] Dispatching to agent ${agentId}: ${command}`
    );

    await handleSendMsg(AGENT_COMMAND_QUEUE, message);

    // Wait for acknowledgement
    const response = await waitForResponse(AGENT_RESPONSE_QUEUE);
    const responseObj = JSON.parse(response);

    if (responseObj.error) {
      return { success: false, error: responseObj.error };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown dispatch error";
    console.error(
      `[AgentScan] Failed to dispatch to agent ${agentId}:`,
      error
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
        scanId: z.string(),
        agentIds: z.array(z.string()), // empty = all connected agents
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

        // Determine which agents to target
        let targetAgents = input.agentIds;

        if (targetAgents.length === 0) {
          // Get all connected agents
          targetAgents = await getConnectedAgents();
          console.log(
            `[AgentScan] Auto-detected ${targetAgents.length} connected agents`
          );
        }

        if (targetAgents.length === 0) {
          console.warn("[AgentScan] No agents connected, skipping agent scan");
          // Store empty status in ValKey
          const statusKey = AGENT_SCAN_KEY_PREFIX + input.scanId;
          await valkey.set(
            statusKey,
            JSON.stringify({
              scanId: input.scanId,
              status: "completed",
              totalAgents: 0,
              completedAgents: 0,
              failedAgents: 0,
              agentStatuses: [],
              message: "No agents connected",
            }),
            "EX",
            3600 // 1 hour TTL
          );

          return {
            scanId: input.scanId,
            dispatchedAgents: [],
            failedAgents: [],
            totalDispatched: 0,
          };
        }

        const dispatchedAgents: string[] = [];
        const failedAgents: { id: string; error: string }[] = [];

        // Dispatch to each agent sequentially to avoid queue conflicts
        // Retry once on "not connected" errors (transient stream reconnection)
        for (const agentId of targetAgents) {
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
              error: result.error || "Unknown error",
            });
          }
        }

        // Store dispatch metadata in ValKey
        const statusKey = AGENT_SCAN_KEY_PREFIX + input.scanId;
        const initialStatus = {
          scanId: input.scanId,
          status: dispatchedAgents.length > 0 ? "running" : "failed",
          mode: input.mode,
          totalAgents: dispatchedAgents.length,
          completedAgents: 0,
          failedAgents: failedAgents.length,
          agentStatuses: [
            ...dispatchedAgents.map((id) => ({
              agentId: id,
              status: "running",
              hostsFound: 0,
              vulnerabilitiesFound: 0,
            })),
            ...failedAgents.map((f) => ({
              agentId: f.id,
              status: "failed",
              hostsFound: 0,
              vulnerabilitiesFound: 0,
              error: f.error,
            })),
          ],
          dispatchedAt: new Date().toISOString(),
        };

        await valkey.set(
          statusKey,
          JSON.stringify(initialStatus),
          "EX",
          3600 // 1 hour TTL
        );

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
        console.error("[AgentScan] Failed to dispatch agent scan:", error);
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
        console.error("[AgentScan] Failed to get agent scan status:", error);
        return null;
      }
    }),
});

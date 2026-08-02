import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { ScanResult, SubScan } from "~/types/scanTypes";
import { handleSendMsg, waitForResponse } from "~/server/api/routers/queue";
import { valkey } from "~/server/valkey";
import {
  ACTIVE_SCAN_STATUSES,
  CURRENT_SCAN_KEY,
  decodeScanState,
  encodeScanState,
  mintScanId,
  ownedConnectedAgentsKey,
  ownedLatestKey,
  ownedOwnerKey,
  ownedStateKey,
  ownedStatusKey,
} from "~/server/api/shared/ownedScan";

const AGENT_COMMAND_QUEUE = "agent_commands";
const AGENT_RESPONSE_QUEUE = "agent_response";
const AGENT_SCAN_KEY_PREFIX = "agent_scan:";

const targetSchema = z.object({
  value: z.string().min(1),
  type: z.enum([
    "single_ip",
    "ip_range",
    "cidr",
    "dns_name",
    "dns_wildcard",
  ]),
});

const agentScanConfigSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["comprehensive", "templates-only", "scripts-only"]),
  agent_ids: z.array(z.string()),
  timeout: z.number().default(300),
  concurrency: z.number().default(5),
  template_filter: z.array(z.string()).optional(),
});

async function getCurrentScan(): Promise<ScanResult | null> {
  const raw = await valkey.get(CURRENT_SCAN_KEY);
  if (!raw) return null;
  return decodeScanState(raw);
}

async function readOwnedConnectedAgents(
  subjectId: string,
  role: string
): Promise<string[]> {
  // Students: owned list only. Admin/staff: global inventory for Community compat.
  const key =
    role === "student"
      ? ownedConnectedAgentsKey(subjectId)
      : "connected_agents";
  const raw = await valkey.get(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

async function dispatchToAgent(
  agentId: string,
  scanId: string,
  mode: string,
  concurrency: number,
  timeout: number,
  templateFilter?: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
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
      target: { type: "agent", id: agentId },
    });

    await handleSendMsg(AGENT_COMMAND_QUEUE, message);

    // Best-effort ack; do not hard-fail the whole owned start on slow agents.
    try {
      const response = await waitForResponse(AGENT_RESPONSE_QUEUE);
      const responseObj = JSON.parse(response) as { error?: string };
      if (responseObj.error) {
        return { success: false, error: responseObj.error };
      }
    } catch {
      // Ack timeout — treat as dispatched; agent may still run.
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown dispatch error",
    };
  }
}

async function resolveOwnedScanId(
  subjectId: string,
  role: string,
  scanId?: string
): Promise<{ scanId: string; owner: string }> {
  let resolvedId = scanId;
  if (!resolvedId) {
    const latest = await valkey.get(ownedLatestKey(subjectId));
    if (!latest) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No owned scan found",
      });
    }
    resolvedId = latest;
  }

  const owner = await valkey.get(ownedOwnerKey(resolvedId));
  if (!owner) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Scan ownership not found",
    });
  }

  if (role !== "admin" && owner !== subjectId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not the owner of this scan",
    });
  }

  return { scanId: resolvedId, owner };
}

export interface CancelScanResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

export interface ForceStopResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

export interface ResetScanResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

export const scannerRouter = createTRPCRouter({
  /**
   * Start an owner-scoped scan. Owner is always derived from session subjectId.
   * Everyone (student + admin) uses this path for the Scanner page.
   * Admin also mirrors to currentScan for Community / legacy tooling.
   */
  startOwnedScan: protectedProcedure
    .input(
      z.object({
        targets: z.array(targetSchema),
        templateId: z.string().min(1),
        priority: z.number().int().min(1).max(10).default(3),
        agentScanConfig: agentScanConfigSchema.optional(),
        skipNetworkScan: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const owner = ctx.session.user.subjectId;
      const role = ctx.session.user.role;

      const latestId = await valkey.get(ownedLatestKey(owner));
      if (latestId) {
        const existingStatus = await valkey.get(ownedStatusKey(latestId));
        if (existingStatus && ACTIVE_SCAN_STATUSES.has(existingStatus)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "An active scan is already running for this user",
          });
        }
      }

      const scanId = mintScanId();
      const hasNetworkScan =
        input.targets.length > 0 && !input.skipNetworkScan;
      const hasAgentScan = input.agentScanConfig?.enabled ?? false;

      if (!hasNetworkScan && !hasAgentScan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Scan requires network targets and/or agent scan",
        });
      }

      const subScans: Record<string, SubScan> = {};
      if (hasNetworkScan) {
        subScans.network = {
          type: "network",
          enabled: true,
          status: "running",
          progress: { completed: 0, total: 0, label: "hosts" },
        };
      }
      if (hasAgentScan) {
        subScans.agent = {
          type: "agent",
          enabled: true,
          status: "dispatching",
          progress: { completed: 0, total: 0, label: "agents" },
          metadata: {
            mode: input.agentScanConfig?.mode ?? "comprehensive",
            dispatched_agents: [],
            agent_statuses: [],
          },
        };
      }

      const scan: ScanResult = {
        id: scanId,
        status: "running",
        targets: input.targets.map((t) => t.value),
        hosts: [],
        hosts_completed: 0,
        vulnerabilities: [],
        start_time: new Date().toISOString(),
        sub_scans: subScans,
      };

      const encoded = encodeScanState(scan);
      await valkey.set(ownedStateKey(scanId), encoded);
      await valkey.set(ownedOwnerKey(scanId), owner);
      await valkey.set(ownedLatestKey(owner), scanId);
      await valkey.set(ownedStatusKey(scanId), "running");

      // Community compat: admin mirrors into currentScan; students never touch it.
      if (role === "admin") {
        await valkey.set(CURRENT_SCAN_KEY, encoded);
      }

      if (hasNetworkScan) {
        const scanRequest = {
          id: scanId,
          targets: input.targets,
          options: { template_id: input.templateId },
          priority: input.priority,
          owner_subject_id: owner,
        };
        await handleSendMsg("scan", JSON.stringify(scanRequest));
      }

      if (hasAgentScan && input.agentScanConfig) {
        try {
          const connected = await readOwnedConnectedAgents(owner, role);
          const ownedSet = new Set(connected);
          let targetAgents = input.agentScanConfig.agent_ids;

          if (targetAgents.length === 0) {
            targetAgents = connected;
          } else if (role === "student") {
            const forbidden = targetAgents.filter((id) => !ownedSet.has(id));
            if (forbidden.length > 0) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: "Cannot dispatch to agents you do not own",
              });
            }
          }

          const dispatchedAgents: string[] = [];
          const failedAgents: { id: string; error: string }[] = [];

          for (const agentId of targetAgents) {
            const result = await dispatchToAgent(
              agentId,
              scanId,
              input.agentScanConfig.mode,
              input.agentScanConfig.concurrency,
              input.agentScanConfig.timeout,
              input.agentScanConfig.template_filter
            );
            if (result.success) {
              dispatchedAgents.push(agentId);
            } else {
              failedAgents.push({
                id: agentId,
                error: result.error || "Unknown error",
              });
            }
          }

          await valkey.set(
            AGENT_SCAN_KEY_PREFIX + scanId,
            JSON.stringify({
              scanId,
              status: dispatchedAgents.length > 0 ? "running" : "failed",
              mode: input.agentScanConfig.mode,
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
            }),
            "EX",
            3600
          );

          // Merge dispatch metadata into owned scan:state (and admin mirror).
          const latestRaw = await valkey.get(ownedStateKey(scanId));
          if (latestRaw) {
            const current = decodeScanState(latestRaw);
            if (current.sub_scans?.agent) {
              const agentSS = current.sub_scans.agent;
              const meta = (agentSS.metadata ?? {}) as Record<string, unknown>;
              meta.dispatched_agents = dispatchedAgents;
              meta.agent_statuses = dispatchedAgents.map((id) => ({
                agent_id: id,
                status: "running",
                hosts_found: 0,
                vulnerabilities_found: 0,
              }));
              agentSS.metadata = meta;
              agentSS.progress.total = dispatchedAgents.length;
              if (agentSS.status === "dispatching") {
                agentSS.status = "running";
              }
              const updated = encodeScanState(current);
              await valkey.set(ownedStateKey(scanId), updated);
              if (role === "admin") {
                await valkey.set(CURRENT_SCAN_KEY, updated);
              }
            }
          }
        } catch (agentErr) {
          if (agentErr instanceof TRPCError) throw agentErr;
          console.error(
            "[scanner.startOwnedScan] Agent dispatch failed:",
            agentErr
          );
          // Network scan (if any) continues; do not fail the whole start.
        }
      }

      return { scanId, status: "running" as const };
    }),

  /**
   * Poll the caller's latest owned scan workspace (blank for new students).
   */
  getLatestOwnedScan: protectedProcedure.query(async ({ ctx }) => {
    const subjectId = ctx.session.user.subjectId;
    const scanId = await valkey.get(ownedLatestKey(subjectId));
    if (!scanId) {
      return null;
    }

    const owner = await valkey.get(ownedOwnerKey(scanId));
    if (!owner) {
      return null;
    }
    if (owner !== subjectId && ctx.session.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Not the owner of this scan",
      });
    }

    const stateRaw = await valkey.get(ownedStateKey(scanId));
    if (!stateRaw) {
      return null;
    }

    const state = decodeScanState(stateRaw);
    const status =
      (await valkey.get(ownedStatusKey(scanId))) ?? state.status ?? null;

    return {
      scanId,
      status,
      scan: state,
    };
  }),

  cancelOwnedScan: protectedProcedure
    .input(
      z
        .object({
          scanId: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }): Promise<CancelScanResponse> => {
      try {
        const { scanId } = await resolveOwnedScanId(
          ctx.session.user.subjectId,
          ctx.session.user.role,
          input?.scanId
        );

        await valkey.set(ownedStatusKey(scanId), "cancelling");

        const stateRaw = await valkey.get(ownedStateKey(scanId));
        if (stateRaw) {
          const state = decodeScanState(stateRaw);
          if (state.status === "running" || state.status === "pending") {
            state.status = "cancelling";
            await valkey.set(ownedStateKey(scanId), encodeScanState(state));
          }
        }

        await handleSendMsg(
          "scan_control",
          JSON.stringify({
            action: "cancel",
            scan_id: scanId,
            timestamp: new Date().toISOString(),
          })
        );

        return {
          success: true,
          message: "Scan cancellation requested",
          status: "cancelling",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error cancelling owned scan:", error);
        return {
          success: false,
          message: "Failed to cancel scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  forceStopOwnedScan: protectedProcedure
    .input(
      z
        .object({
          scanId: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ ctx, input }): Promise<ForceStopResponse> => {
      try {
        const { scanId } = await resolveOwnedScanId(
          ctx.session.user.subjectId,
          ctx.session.user.role,
          input?.scanId
        );

        await handleSendMsg(
          "scan_control",
          JSON.stringify({
            action: "force_cancel",
            scan_id: scanId,
            timestamp: new Date().toISOString(),
          })
        ).catch(() => {});

        await valkey.set(ownedStatusKey(scanId), "cancelled");

        const stateRaw = await valkey.get(ownedStateKey(scanId));
        if (stateRaw) {
          const state = decodeScanState(stateRaw);
          state.status = "cancelled";
          state.end_time = new Date().toISOString();
          if (state.sub_scans) {
            for (const sub of Object.values(state.sub_scans)) {
              if (sub.status === "running" || sub.status === "dispatching") {
                sub.status = "failed";
              }
            }
          }
          await valkey.set(ownedStateKey(scanId), encodeScanState(state));
        }

        return {
          success: true,
          message: "Scan force stopped",
          status: "cancelled",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error force stopping owned scan:", error);
        return {
          success: false,
          message: "Failed to force stop scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Clear the caller's latest-scan pointer (blank slate). Historical state keys remain.
   */
  resetOwnedWorkspace: protectedProcedure.mutation(
    async ({ ctx }): Promise<ResetScanResponse> => {
      try {
        const subjectId = ctx.session.user.subjectId;
        await valkey.del(ownedLatestKey(subjectId));

        // Admin also clears Community currentScan when resetting their workspace.
        if (ctx.session.user.role === "admin") {
          await valkey.del(CURRENT_SCAN_KEY);
        }

        return {
          success: true,
          message: "Owned workspace reset",
          status: "idle",
        };
      } catch (error) {
        console.error("Error resetting owned workspace:", error);
        return {
          success: false,
          message: "Failed to reset owned workspace",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  ),

  // --- Legacy currentScan path (admin / Community) ---

  cancelScan: protectedProcedure
    .input(
      z
        .object({
          scanId: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }): Promise<CancelScanResponse> => {
      try {
        const current = await getCurrentScan();
        const scanId = input?.scanId ?? current?.id;

        const cancelCommand = JSON.stringify({
          action: "cancel",
          scan_id: scanId ?? "",
          timestamp: new Date().toISOString(),
        });
        await handleSendMsg("scan_control", cancelCommand);

        if (current && current.id === scanId && current.status === "running") {
          current.status = "cancelling";
          await valkey.set(CURRENT_SCAN_KEY, encodeScanState(current));
        }

        return {
          success: true,
          message: "Scan cancellation requested",
          status: "cancelling",
        };
      } catch (error) {
        console.error("Error cancelling scan:", error);
        return {
          success: false,
          message: "Failed to cancel scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  forceStopScan: protectedProcedure
    .input(
      z
        .object({
          scanId: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }): Promise<ForceStopResponse> => {
      try {
        const cancelCommand = JSON.stringify({
          action: "force_cancel",
          scan_id: input?.scanId ?? "",
          timestamp: new Date().toISOString(),
        });
        await handleSendMsg("scan_control", cancelCommand).catch(() => {});

        const current = await getCurrentScan();
        if (current) {
          current.status = "cancelled";
          current.end_time = new Date().toISOString();
          if (current.sub_scans) {
            for (const sub of Object.values(current.sub_scans)) {
              if (sub.status === "running" || sub.status === "dispatching") {
                sub.status = "failed";
              }
            }
          }
          await valkey.set(CURRENT_SCAN_KEY, encodeScanState(current));
        }

        return {
          success: true,
          message: "Scan force stopped",
          status: "cancelled",
        };
      } catch (error) {
        console.error("Error force stopping scan:", error);
        return {
          success: false,
          message: "Failed to force stop scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Reset scan dashboard state - Tier 3 last resort: directly clears ValKey
  resetScanState: protectedProcedure.mutation(
    async (): Promise<ResetScanResponse> => {
      try {
        await valkey.del(CURRENT_SCAN_KEY);

        return {
          success: true,
          message: "Scan state reset",
          status: "idle",
        };
      } catch (error) {
        console.error("Error resetting scan state:", error);
        return {
          success: false,
          message: "Failed to reset scan state",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  ),
});

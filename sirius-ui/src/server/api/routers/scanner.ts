import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { ScanResult } from "~/types/scanTypes";
import { handleSendMsg, QueuePublishError } from "~/server/api/routers/queue";
import { createInitialScan } from "~/utils/scanSubmission";
import { valkey } from "~/server/valkey";

const CURRENT_SCAN_KEY = "currentScan";

function decodeScanState(raw: string): ScanResult {
  return JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as ScanResult;
}

function encodeScanState(state: ScanResult): string {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

async function getCurrentScan(): Promise<ScanResult | null> {
  const raw = await valkey.get(CURRENT_SCAN_KEY);
  if (!raw) return null;
  return decodeScanState(raw);
}

async function compareAndSetCurrentScan(expected: string, state: ScanResult) {
  await valkey.eval(
    `if redis.call("GET", KEYS[1]) == ARGV[1] then
       return redis.call("SET", KEYS[1], ARGV[2])
     end`,
    1,
    CURRENT_SCAN_KEY,
    expected,
    encodeScanState(state)
  );
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
  submitNetworkScan: protectedProcedure
    .input(
      z.object({
        scanId: z.string().regex(/^scan-\d+-[a-z0-9]{1,9}$/),
        targets: z.array(
          z.object({
            value: z.string().min(1),
            type: z.enum(["single_ip", "ip_range", "cidr", "dns_name", "dns_wildcard"]),
          })
        ).min(1),
        templateId: z.string(),
        priority: z.number(),
        agentMode: z.enum(["comprehensive", "templates-only", "scripts-only"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { scanId, targets, templateId, priority, agentMode } = input;
      const scan = createInitialScan(
        scanId,
        targets.map(({ value }) => value),
        true,
        agentMode
      );
      const initialState = encodeScanState(scan);

      try {
        await valkey.set(CURRENT_SCAN_KEY, initialState);
      } catch (error) {
        console.error("Failed to record scan submission", scanId, error);
        return { outcome: "not_recorded" } as const;
      }

      try {
        await handleSendMsg(
          "scan",
          JSON.stringify({
            id: scanId,
            targets,
            options: { template_id: templateId },
            priority,
          })
        );
        return { outcome: "submitted", scan } as const;
      } catch (error) {
        console.error("Failed to publish scan submission", scanId, error);
        if (!(error instanceof QueuePublishError) || error.sendAttempted) {
          return { outcome: "unconfirmed", scan } as const;
        }

        // This attempt had no send. A later state may already belong to a
        // replacement, cancellation, or worker update.
        const subScans = scan.sub_scans ?? {};
        for (const subScan of Object.values(subScans)) {
          subScan.status = "failed";
          subScan.metadata = {
            ...subScan.metadata,
            submission_error: "not_published",
          };
        }
        await compareAndSetCurrentScan(initialState, {
          ...scan,
          status: "failed",
          end_time: new Date().toISOString(),
        }).catch((stateError: unknown) => {
          console.error("Failed to record scan submission failure", scanId, stateError);
        });
        return { outcome: "failed" } as const;
      }
    }),

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
        const raw = await valkey.get(CURRENT_SCAN_KEY);
        const current = raw ? decodeScanState(raw) : null;
        const scanId = input?.scanId ?? current?.id;

        const cancelCommand = JSON.stringify({
          action: "cancel",
          scan_id: scanId ?? "",
          timestamp: new Date().toISOString(),
        });
        await handleSendMsg("scan_control", cancelCommand);

        if (
          raw &&
          current &&
          current.id === scanId &&
          (current.status === "running" || current.status === "pending")
        ) {
          await compareAndSetCurrentScan(raw, { ...current, status: "cancelling" });
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

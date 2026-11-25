import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { apiClient } from "~/server/api/shared/apiClient";
import type { ScanResult } from "~/types/scanTypes";
import { handleSendMsg } from "~/server/api/routers/queue";
import { valkey } from "~/server/valkey";
import { createCancelScanProcedure } from "./scanner-cancellation";

export type { CancelScanResponse } from "./scanner-cancellation";

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

type NetworkScanAdmissionReceipt = {
  scan_id: string;
  outcome: "submitted" | "unconfirmed" | "busy" | "failed" | "not_recorded";
  scan?: ScanResult;
};

export const scannerRouter = createTRPCRouter({
  submitNetworkScan: protectedProcedure
    .input(
      z.object({
        scanId: z.string().regex(/^scan-\d{1,20}-[a-z0-9]{1,9}$/),
        targets: z.array(z.object({
          value: z.string().min(1),
          type: z.enum(["single_ip", "ip_range", "cidr", "dns_name", "dns_wildcard"]),
        })).min(1),
        templateId: z.string(),
        priority: z.number().int(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { status, data } = await apiClient.post<NetworkScanAdmissionReceipt>(
          "/api/v1/scans/submit",
          {
            scan_id: input.scanId,
            targets: input.targets,
            template_id: input.templateId,
            priority: input.priority,
          },
          { validateStatus: () => true }
        );

        if (status === 404 || status === 405) {
          return { outcome: "unsupported" } as const;
        }
        if (status === 400 || status === 401 || status === 403 || status === 413) {
          return { outcome: "rejected" } as const;
        }
        if (data?.scan_id === input.scanId) {
          if (
            status === 202 &&
            (data.outcome === "submitted" || data.outcome === "unconfirmed") &&
            data.scan?.id === input.scanId &&
            data.scan.status === "pending"
          ) {
            return { outcome: data.outcome, scan: data.scan } as const;
          }
          if (
            (status === 409 && data.outcome === "busy") ||
            (status === 502 && data.outcome === "failed") ||
            (status === 503 && data.outcome === "not_recorded")
          ) {
            return { outcome: data.outcome } as const;
          }
        }
      } catch {
        // A lost API response leaves delivery unknown. Never retry or log the
        // request config, which contains the service credential.
      }
      return { outcome: "unconfirmed" } as const;
    }),

  cancelScan: createCancelScanProcedure({
    loadScan: getCurrentScan,
    publishCancel: (message) => handleSendMsg("scan_control", message),
    writeScan: async (scan) => {
      await valkey.set(CURRENT_SCAN_KEY, encodeScanState(scan));
    },
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

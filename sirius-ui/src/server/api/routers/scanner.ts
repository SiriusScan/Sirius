import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { apiClient } from "~/server/api/shared/apiClient";
import { CURRENT_SCAN_KEY, currentScanStore } from "~/server/currentScan";
import type { ScanResult } from "~/types/scanTypes";
import { handleSendMsg } from "~/server/api/routers/queue";
import { valkey } from "~/server/valkey";
import { createCancelScanProcedure, createForceStopScanProcedure } from "./scanner-cancellation";

export type { CancelScanResponse, ForceStopResponse } from "./scanner-cancellation";

function decodeScanState(raw: string): ScanResult {
  return JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as ScanResult;
}

function encodeScanState(state: ScanResult): string {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

async function loadCurrentScan() {
  const raw = await currentScanStore.read();
  return raw ? { raw, scan: decodeScanState(raw) } : null;
}

async function compareAndSetScan(expected: string, scan: ScanResult): Promise<boolean> {
  return currentScanStore.compareAndSet(expected, encodeScanState(scan));
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
    loadScan: loadCurrentScan,
    publishCancel: (message) => handleSendMsg("scan_control", message),
    markCancelling: compareAndSetScan,
  }),

  forceStopScan: createForceStopScanProcedure({
    loadScan: loadCurrentScan,
    publishCancel: (message) => handleSendMsg("scan_control", message),
    markCancelled: compareAndSetScan,
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

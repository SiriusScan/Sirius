import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { ScanResult } from "~/types/scanTypes";
import { handleSendMsg } from "~/server/api/routers/queue";
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

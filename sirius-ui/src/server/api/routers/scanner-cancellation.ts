import { z } from "zod";
import { protectedProcedure } from "~/server/api/trpc";
import type { ScanResult } from "~/types/scanTypes";

export interface CancelScanResponse {
  success: boolean;
  message: string;
  status?: string;
  error?: string;
}

interface ScanCancellationDependencies {
  loadScan: () => Promise<ScanResult | null>;
  publishCancel: (message: string) => Promise<void>;
  writeScan: (scan: ScanResult) => Promise<void>;
}

export function createCancelScanProcedure({
  loadScan,
  publishCancel,
  writeScan,
}: ScanCancellationDependencies) {
  return protectedProcedure
    .input(z.object({ scanId: z.string().optional() }).optional())
    .mutation(async ({ input }): Promise<CancelScanResponse> => {
      try {
        const current = await loadScan();
        const scanId = input?.scanId ?? current?.id;
        if (!scanId) {
          return { success: false, message: "No scan to stop" };
        }

        await publishCancel(JSON.stringify({
          action: "cancel",
          scan_id: scanId,
          timestamp: new Date().toISOString(),
        }));

        if (current?.id === scanId && current.status === "running") {
          await writeScan({ ...current, status: "cancelling" });
          return {
            success: true,
            message: "Scan cancellation requested",
            status: "cancelling",
          };
        }

        // The worker settles pending scans, including those still in the queue.
        return {
          success: true,
          message: "Scan cancellation requested. Waiting for scanner confirmation.",
        };
      } catch (error) {
        console.error("Error cancelling scan:", error);
        return {
          success: false,
          message: "Failed to cancel scan",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });
}

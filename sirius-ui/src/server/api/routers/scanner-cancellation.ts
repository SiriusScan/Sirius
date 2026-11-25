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
  loadScan: () => Promise<{ raw: string; scan: ScanResult } | null>;
  publishCancel: (message: string) => Promise<void>;
  markCancelling: (expected: string, scan: ScanResult) => Promise<boolean>;
}

export function createCancelScanProcedure({
  loadScan,
  publishCancel,
  markCancelling,
}: ScanCancellationDependencies) {
  return protectedProcedure
    .input(z.object({ scanId: z.string().optional() }).optional())
    .mutation(async ({ input }): Promise<CancelScanResponse> => {
      let current;
      try {
        current = await loadScan();
      } catch {
        console.error("Could not read current scan for cancellation");
        return {
          success: false,
          message: "Could not read the current scan. No cancellation request was sent.",
        };
      }

      const scanId = input?.scanId ?? current?.scan.id;
      if (!scanId) {
        return { success: false, message: "No scan to stop" };
      }

      try {
        await publishCancel(JSON.stringify({
          action: "cancel",
          scan_id: scanId,
          timestamp: new Date().toISOString(),
        }));
      } catch {
        // The shared publisher does not expose which phase failed.
        console.error("Could not confirm scan cancellation publication");
        return {
          success: false,
          message: "Could not confirm whether the cancellation request was sent.",
        };
      }

      if (current && current.scan.id === scanId && current.scan.status === "running") {
        try {
          const updated = await markCancelling(current.raw, {
            ...current.scan,
            status: "cancelling",
          });
          if (updated) {
            return {
              success: true,
              message: "Scan cancellation requested",
              status: "cancelling",
            };
          }
        } catch {
          console.error("Could not record scan cancellation in the current scan");
        }
      }

      // The worker settles pending scans and any state that changed during the request.
      return {
        success: true,
        message: "Scan cancellation requested. Waiting for scanner confirmation.",
      };
    });
}

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

export type ForceStopResponse = CancelScanResponse;

interface ScanForceStopDependencies {
  loadScan: ScanCancellationDependencies["loadScan"];
  publishCancel: ScanCancellationDependencies["publishCancel"];
  markCancelled: ScanCancellationDependencies["markCancelling"];
}

export function createForceStopScanProcedure({
  loadScan,
  publishCancel,
  markCancelled,
}: ScanForceStopDependencies) {
  return protectedProcedure
    .input(z.object({ scanId: z.string().min(1).optional() }).optional())
    .mutation(async ({ input }): Promise<ForceStopResponse> => {
      let current;
      try {
        current = await loadScan();
      } catch {
        return {
          success: false,
          message: "Could not read the current scan. No force-stop request was sent.",
        };
      }

      if (!current?.scan.id) {
        return input?.scanId
          ? { success: false, message: "The requested scan is no longer current." }
          : { success: true, message: "No scan data found.", status: "idle" };
      }
      const { scan, raw } = current;
      if (input?.scanId !== undefined && input.scanId !== scan.id) {
        return { success: false, message: "The requested scan is no longer current." };
      }
      if (scan.status === "completed" || scan.status === "cancelled" || scan.status === "failed") {
        return { success: true, message: `Scan is already ${scan.status}.`, status: scan.status };
      }

      try {
        await publishCancel(JSON.stringify({
          action: "force_cancel",
          scan_id: scan.id,
          timestamp: new Date().toISOString(),
        }));
      } catch {
        return {
          success: false,
          message: "Could not confirm whether the force-stop request was sent.",
        };
      }

      const next: ScanResult = {
        ...scan,
        status: "cancelled",
        end_time: new Date().toISOString(),
      };
      if (scan.sub_scans) {
        next.sub_scans = Object.fromEntries(Object.entries(scan.sub_scans).map(([key, sub]) => [
          key,
          sub.status === "running" || sub.status === "dispatching"
            ? { ...sub, status: "failed" as const }
            : sub,
        ]));
      }

      try {
        if (await markCancelled(raw, next)) {
          return {
            success: true,
            message: "Force-stop request sent. Dashboard status is cancelled.",
            status: "cancelled",
          };
        }
      } catch {
        console.error("Could not record force-stop in the current scan");
      }
      return {
        success: true,
        message: "Force-stop request sent. Waiting for scanner confirmation.",
      };
    });
}

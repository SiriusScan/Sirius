import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type {
  ScanResult,
  VulnerabilitySummary,
} from "~/types/scanTypes";
import { API_BASE_URL } from "~/server/api/shared/apiClient";

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
  getLatestScan: publicProcedure.query(async () => {
    try {
      // For now, return a base64 encoded mock scan result
      // This will be replaced with actual scan data later
      const mockScanResult: ScanResult = {
        id: "1",
        status: "completed",
        targets: ["192.168.1.0/24"],
        hosts: [
          { id: "host-1", ip: "192.168.1.10" },
          { id: "host-2", ip: "192.168.1.11" },
        ],
        hosts_completed: 2,
        start_time: new Date().toISOString(),
        vulnerabilities: [
          {
            id: "vuln-1",
            severity: "high",
            title: "Sample Vulnerability",
            description: "This is a sample vulnerability description",
          },
        ],
      };

      // Encode the result as base64 (matching the expected format)
      const encodedResult = Buffer.from(
        JSON.stringify(mockScanResult)
      ).toString("base64");
      return encodedResult;
    } catch (error) {
      console.error("Error fetching latest scan:", error);
      return null;
    }
  }),

  startScan: publicProcedure
    .input(
      z.object({
        targets: z.array(z.string()),
        options: z.object({}).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement actual scan starting logic
        console.log("Starting scan for targets:", input.targets);

        const scanResult: ScanResult = {
          id: Date.now().toString(),
          status: "running",
          targets: input.targets,
          hosts: [],
          hosts_completed: 0,
          start_time: new Date().toISOString(),
          vulnerabilities: [],
        };

        return scanResult;
      } catch (error) {
        console.error("Error starting scan:", error);
        throw new Error("Failed to start scan");
      }
    }),

  getScanStatus: publicProcedure
    .input(z.object({ scanId: z.string() }))
    .query(async ({ input }) => {
      try {
        // TODO: Implement actual scan status checking
        console.log("Checking scan status for ID:", input.scanId);

        return {
          id: input.scanId,
          status: "completed" as const,
          progress: 100,
        };
      } catch (error) {
        console.error("Error fetching scan status:", error);
        return null;
      }
    }),

  // Cancel the current running scan
  cancelScan: publicProcedure
    .input(
      z
        .object({
          scanId: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }): Promise<CancelScanResponse> => {
      try {
        console.log("Cancelling scan:", input?.scanId || "current");

        const response = await fetch(`${API_BASE_URL}/api/v1/scans/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scan_id: input?.scanId,
          }),
        });

        const data = (await response.json()) as CancelScanResponse;

        if (!response.ok) {
          return {
            success: false,
            message: data.error || "Failed to cancel scan",
            error: data.error,
          };
        }

        return {
          success: true,
          message: data.message || "Scan cancellation requested",
          status: data.status,
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

  // Force stop the scan - Tier 2 escalation when graceful stop fails
  forceStopScan: publicProcedure
    .input(
      z
        .object({
          scanId: z.string().optional(),
        })
        .optional()
    )
    .mutation(async ({ input }): Promise<ForceStopResponse> => {
      try {
        console.log("Force stopping scan:", input?.scanId || "current");

        const response = await fetch(
          `${API_BASE_URL}/api/v1/scans/force-stop`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              scan_id: input?.scanId,
            }),
          }
        );

        const data = (await response.json()) as ForceStopResponse;

        if (!response.ok) {
          return {
            success: false,
            message: data.error || "Failed to force stop scan",
            error: data.error,
          };
        }

        return {
          success: true,
          message: data.message || "Scan force stopped",
          status: data.status,
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

  // Reset scan dashboard state - Tier 3 last resort
  resetScanState: publicProcedure.mutation(
    async (): Promise<ResetScanResponse> => {
      try {
        console.log("Resetting scan state");

        const response = await fetch(`${API_BASE_URL}/api/v1/scans/reset`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = (await response.json()) as ResetScanResponse;

        if (!response.ok) {
          return {
            success: false,
            message: data.error || "Failed to reset scan state",
            error: data.error,
          };
        }

        return {
          success: true,
          message: data.message || "Scan state reset",
          status: data.status,
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

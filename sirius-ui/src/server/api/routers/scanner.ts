import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";

const API_BASE_URL = env.SIRIUS_API_URL || "http://localhost:9001";

export interface ScanResult {
  id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelling" | "cancelled";
  targets: string[];
  hosts: string[];
  hostsCompleted: number;
  vulnerabilities: VulnerabilitySummary[];
}

export interface VulnerabilitySummary {
  id: string;
  severity: string;
  title: string;
  description: string;
}

export interface CancelScanResponse {
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
        hosts: ["192.168.1.10", "192.168.1.11"],
        hostsCompleted: 2,
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
          hostsCompleted: 0,
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
      z.object({
        scanId: z.string().optional(),
      }).optional()
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

        const data = await response.json() as CancelScanResponse;

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
});

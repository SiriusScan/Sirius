import { z } from "zod";
import axios from "axios";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { apiClient } from "~/server/api/shared/apiClient";

/**
 * Statistics router - handles vulnerability statistics, trends, and snapshots
 * This router proxies requests to the Go API backend
 */

// Types matching Go API responses
export type VulnerabilityCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  total: number;
};

export type Snapshot = {
  snapshot_id: string;
  timestamp: string;
  counts: VulnerabilityCounts;
  by_host?: Array<{
    host_id: string;
    hostname: string;
    counts: VulnerabilityCounts;
  }>;
  metadata?: {
    source: string;
    version: string;
  };
};

export type VulnerableHost = {
  hostId: string;
  hostname: string;
  hostIp: string;
  totalVulnerabilities: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  weightedRiskScore: number;
  lastUpdated: string;
};

export const statisticsRouter = createTRPCRouter({
  /**
   * Create a snapshot of current vulnerability counts
   */
  createSnapshot: protectedProcedure.mutation(async () => {
    try {
      const response = await apiClient.post<{
        message: string;
        snapshot: Snapshot;
      }>("/api/v1/statistics/vulnerability-snapshot");

      return {
        success: true,
        message: response.data.message,
        snapshot: response.data.snapshot,
      };
    } catch (error) {
      console.error("Error creating snapshot:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error || "Failed to create snapshot"
        );
      }
      throw new Error("Failed to create snapshot");
    }
  }),

  /**
   * Get vulnerability trends over time (from snapshots)
   */
  getVulnerabilityTrends: protectedProcedure
    .input(
      z
        .object({
          days: z.number().min(1).max(10).optional().default(7),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const limit = input?.days ?? 7;

        const response = await apiClient.get<{
          snapshots: Snapshot[];
          limit_requested: number;
          snapshots_returned: number;
        }>("/api/v1/statistics/vulnerability-trends", {
          params: { limit },
        });

        return {
          trends: response.data.snapshots.map((snapshot) => ({
            id: snapshot.snapshot_id,
            timestamp: new Date(snapshot.timestamp),
            counts: snapshot.counts,
          })),
          days: limit,
        };
      } catch (error) {
        console.error("Error fetching vulnerability trends:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error ||
              "Failed to fetch vulnerability trends"
          );
        }
        throw new Error("Failed to fetch vulnerability trends");
      }
    }),

  /**
   * List all snapshots
   */
  listSnapshots: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(30),
        })
        .optional()
    )
    .query(async () => {
      try {
        const response = await apiClient.get<{
          available_snapshot_ids: string[];
          count: number;
        }>("/api/v1/statistics/vulnerability-snapshots");

        return {
          snapshots: response.data.available_snapshot_ids,
          total: response.data.count,
        };
      } catch (error) {
        console.error("Error listing snapshots:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error || "Failed to list snapshots"
          );
        }
        throw new Error("Failed to list snapshots");
      }
    }),

  /**
   * Get most vulnerable hosts
   */
  getMostVulnerableHosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).optional().default(5),
        refresh: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      try {
        const { limit, refresh } = input;

        const response = await apiClient.get<{
          hosts: Array<{
            hostId: string;
            hostIp: string;
            hostname: string;
            totalVulnerabilities: number;
            weightedRiskScore: number;
            severityCounts: {
              critical: number;
              high: number;
              medium: number;
              low: number;
              informational: number;
            };
            lastUpdated: string;
          }>;
          totalHosts: number;
          cached: boolean;
          cachedAt?: string;
          ttl: number;
        }>("/api/v1/statistics/hosts/most-vulnerable", {
          params: { limit, refresh },
        });

        return {
          hosts: response.data.hosts,
          total: response.data.totalHosts,
          cached: response.data.cached,
          cachedAt: response.data.cachedAt,
        };
      } catch (error) {
        console.error("Error fetching most vulnerable hosts:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error ||
              "Failed to fetch most vulnerable hosts"
          );
        }
        throw new Error("Failed to fetch most vulnerable hosts");
      }
    }),
});

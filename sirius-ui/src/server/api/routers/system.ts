import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { apiClient } from "~/server/api/shared/apiClient";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { SystemHealthResponse } from "~/services/healthCheckService";

const resourceSchema = z.object({
  name: z.string(),
  telemetry_status: z.enum(["fresh", "stale", "missing", "invalid", "unavailable"]),
  observed_at: z.string().datetime({ offset: true }).optional(),
  measurements: z.object({
    cpu_percent: z.number().optional(),
    memory_usage_bytes: z.number().optional(),
    memory_limit_bytes: z.number().optional(),
    memory_percent: z.number().optional(),
    network_rx_bytes: z.number().optional(),
    network_tx_bytes: z.number().optional(),
    disk_read_bytes: z.number().optional(),
    disk_write_bytes: z.number().optional(),
    disk_usage_bytes: z.number().optional(),
    disk_total_bytes: z.number().optional(),
    disk_percent: z.number().optional(),
    process_count: z.number().optional(),
    file_descriptors: z.number().optional(),
    load_average_1m: z.number().optional(),
    load_average_5m: z.number().optional(),
    load_average_15m: z.number().optional(),
  }),
  cpu_percent: z.number(),
  memory_usage: z.string(),
  memory_percent: z.number(),
  network_io: z.string(),
  disk_usage: z.string(),
  disk_percent: z.number(),
  process_count: z.number(),
  file_descriptors: z.number(),
  load_average_1m: z.number(),
  load_average_5m: z.number(),
  load_average_15m: z.number(),
  uptime: z.string(),
  collector_started_at: z.string().datetime({ offset: true }).optional(),
  collector_uptime_seconds: z.number().optional(),
});

const observationsSchema = z.object({
  availability: z.enum(["available", "partial", "unavailable"]),
  timestamp: z.string().datetime({ offset: true }),
  freshness_seconds: z.number().positive(),
  containers: z.array(resourceSchema),
  summary: z.object({
    total_containers: z.number(),
    fresh_containers: z.number(),
    running_containers: z.number(),
    stale_containers: z.number(),
    missing_containers: z.number(),
    invalid_containers: z.number(),
    unavailable_containers: z.number(),
    latest_observed_at: z.string().datetime({ offset: true }).optional(),
    peak_cpu_percent: z.number().optional(),
    observed_memory_bytes: z.number().optional(),
  }),
});

export const systemRouter = createTRPCRouter({
  resources: protectedProcedure.query(async () => {
    try {
      const { data } = await apiClient.get<unknown>("/api/v1/system/resources");
      return observationsSchema.parse(data);
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "System resource telemetry is unavailable.",
      });
    }
  }),

  health: protectedProcedure.query(async () => {
    try {
      const { data } = await apiClient.get<SystemHealthResponse>("/api/v1/system/health");
      return data;
    } catch {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Service health probes are unavailable.",
      });
    }
  }),
});

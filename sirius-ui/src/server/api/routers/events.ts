import { z } from "zod";
import axios from "axios";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";

/**
 * Events router - handles security and system events
 * This router proxies requests to the Go API backend
 */

// Create axios instance for Go API
const apiClient = axios.create({
  baseURL: env.SIRIUS_API_URL || "http://localhost:9001",
  timeout: 10000,
});

// Types matching Go API Event model
export type Event = {
  id: number;
  event_id: string;
  timestamp: string;
  service: string;
  subcomponent?: string;
  event_type: string;
  severity: "info" | "warning" | "error" | "critical";
  title: string;
  description?: string;
  metadata?: any;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
};

export type EventStats = {
  total_events: number;
  by_severity: Record<string, number>;
  by_service: Record<string, number>;
  by_type: Record<string, number>;
  recent_events: Event[];
};

export const eventsRouter = createTRPCRouter({
  /**
   * Get events with optional filters
   */
  getEvents: publicProcedure
    .input(
      z
        .object({
          service: z.string().optional(),
          severity: z.string().optional(),
          event_type: z.string().optional(),
          entity_type: z.string().optional(),
          entity_id: z.string().optional(),
          start_time: z.string().optional(),
          end_time: z.string().optional(),
          limit: z.number().min(1).max(500).optional().default(50),
          offset: z.number().min(0).optional().default(0),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const params: Record<string, string | number> = {
          limit: input?.limit ?? 50,
          offset: input?.offset ?? 0,
        };

        if (input?.service) params.service = input.service;
        if (input?.severity) params.severity = input.severity;
        if (input?.event_type) params.event_type = input.event_type;
        if (input?.entity_type) params.entity_type = input.entity_type;
        if (input?.entity_id) params.entity_id = input.entity_id;
        if (input?.start_time) params.start_time = input.start_time;
        if (input?.end_time) params.end_time = input.end_time;

        const response = await apiClient.get<{
          events: Event[];
          total: number;
          limit: number;
          offset: number;
        }>("/api/v1/events", {
          params,
        });

        return {
          events: response.data.events,
          total: response.data.total,
          limit: response.data.limit,
          offset: response.data.offset,
        };
      } catch (error) {
        console.error("Error fetching events:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error || "Failed to fetch events"
          );
        }
        throw new Error("Failed to fetch events");
      }
    }),

  /**
   * Get event statistics
   */
  getEventStats: publicProcedure.query(async () => {
    try {
      const response = await apiClient.get<EventStats>(
        "/api/v1/events/stats"
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching event statistics:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.error || "Failed to fetch event statistics"
        );
      }
      throw new Error("Failed to fetch event statistics");
    }
  }),

  /**
   * Get recent events (convenience method)
   */
  getRecentEvents: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const limit = input?.limit ?? 50;

        const response = await apiClient.get<{
          events: Event[];
          total: number;
          limit: number;
          offset: number;
        }>("/api/v1/events", {
          params: {
            limit,
            offset: 0,
          },
        });

        return {
          events: response.data.events,
          total: response.data.total,
        };
      } catch (error) {
        console.error("Error fetching recent events:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error || "Failed to fetch recent events"
          );
        }
        throw new Error("Failed to fetch recent events");
      }
    }),

  /**
   * Get events by severity
   */
  getEventsBySeverity: publicProcedure
    .input(
      z.object({
        severity: z.enum(["info", "warning", "error", "critical"]),
        limit: z.number().min(1).max(100).optional().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const { severity, limit } = input;

        const response = await apiClient.get<{
          severity: string;
          events: Event[];
          count: number;
        }>(`/api/v1/events/by-severity/${severity}`, {
          params: { limit },
        });

        return {
          events: response.data.events,
          count: response.data.count,
          severity: response.data.severity,
        };
      } catch (error) {
        console.error("Error fetching events by severity:", error);
        if (axios.isAxiosError(error)) {
          throw new Error(
            error.response?.data?.error ||
              "Failed to fetch events by severity"
          );
        }
        throw new Error("Failed to fetch events by severity");
      }
    }),
});


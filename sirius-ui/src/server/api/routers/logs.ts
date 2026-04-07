import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { API_BASE_URL, apiFetch } from "~/server/api/shared/apiClient";

const listInput = z.object({
  service: z.string().optional(),
  level: z.string().optional(),
  subcomponent: z.string().optional(),
  limit: z.number().int().positive().max(500).optional(),
  offset: z.number().int().min(0).optional(),
  search: z.string().optional(),
});

export const logsRouter = createTRPCRouter({
  /** Proxies GET /api/v1/logs with session auth (no internal key in the browser). */
  list: protectedProcedure.input(listInput).query(async ({ input }) => {
    const params = new URLSearchParams();
    if (input.service) params.append("service", input.service);
    if (input.level) params.append("level", input.level);
    if (input.subcomponent)
      params.append("subcomponent", input.subcomponent);
    if (input.search) params.append("search", input.search);
    if (input.limit != null) params.append("limit", String(input.limit));
    if (input.offset != null) params.append("offset", String(input.offset));

    const url = `${API_BASE_URL}/api/v1/logs?${params.toString()}`;
    const res = await apiFetch(url, { method: "GET" });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(errBody || `logs list failed (${res.status})`);
    }
    return res.json() as Promise<{
      logs: unknown[];
      total: number;
      limit: number;
      offset: number;
    }>;
  }),

  stats: protectedProcedure.query(async () => {
    const url = `${API_BASE_URL}/api/v1/logs/stats`;
    const res = await apiFetch(url, { method: "GET" });
    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(errBody || `logs stats failed (${res.status})`);
    }
    return res.json();
  }),
});

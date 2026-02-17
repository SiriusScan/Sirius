import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { apiClient } from "~/server/api/shared/apiClient";

/**
 * TRPC router for managing API keys.
 *
 * Uses protectedProcedure for authenticated API key management.
 * Access control is enforced at the Go API layer via the API key middleware.
 */
export const apikeysRouter = createTRPCRouter({
  /** Generate a new API key. The raw key is returned exactly once. */
  createKey: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1, "Label is required").max(64),
      })
    )
    .mutation(async ({ input }) => {
      const response = await apiClient.post<{
        key: string;
        meta: {
          id: string;
          label: string;
          prefix: string;
          created_by: string;
          created_at: string;
          last_used_at: string;
        };
      }>("/api/v1/keys", { label: input.label });

      return response.data;
    }),

  /** List all API keys (metadata only – raw keys are never returned). */
  listKeys: protectedProcedure.query(async () => {
    const response = await apiClient.get<{
      keys: Array<{
        id: string;
        label: string;
        prefix: string;
        created_by: string;
        created_at: string;
        last_used_at: string;
      }>;
    }>("/api/v1/keys");

    return response.data.keys;
  }),

  /** Revoke (delete) an API key by its hash ID. */
  revokeKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await apiClient.delete(`/api/v1/keys/${input.id}`);
      return { success: true };
    }),
});

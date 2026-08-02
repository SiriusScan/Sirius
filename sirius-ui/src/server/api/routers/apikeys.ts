import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { apiClient } from "~/server/api/shared/apiClient";

type APIKeyMeta = {
  id: string;
  label: string;
  prefix: string;
  created_by: string;
  created_at: string;
  last_used_at: string;
  owner_subject_id?: string;
  scopes?: string[];
};

/**
 * TRPC router for managing API keys.
 *
 * Uses protectedProcedure for authenticated API key management.
 * Owner scoping is enforced server-side: students always filter by their
 * subjectId; client-supplied owner overrides are never accepted.
 */
export const apikeysRouter = createTRPCRouter({
  /** Generate a new API key. The raw key is returned exactly once. */
  createKey: protectedProcedure
    .input(
      z.object({
        label: z.string().min(1, "Label is required").max(64),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const response = await apiClient.post<{
        key: string;
        meta: APIKeyMeta;
      }>("/api/v1/keys", {
        label: input.label,
        owner_subject_id: ctx.session.user.subjectId,
        scopes: ["agent:enroll"],
      });

      return response.data;
    }),

  /** List API keys (metadata only – raw keys are never returned). */
  listKeys: protectedProcedure.query(async ({ ctx }) => {
    const params =
      ctx.session.user.role === "student"
        ? { owner_subject_id: ctx.session.user.subjectId }
        : undefined;

    const response = await apiClient.get<{ keys: APIKeyMeta[] }>(
      "/api/v1/keys",
      { params }
    );

    return response.data.keys;
  }),

  /** Revoke (delete) an API key by its hash ID. */
  revokeKey: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const params =
        ctx.session.user.role === "student"
          ? { owner_subject_id: ctx.session.user.subjectId }
          : undefined;

      await apiClient.delete(`/api/v1/keys/${input.id}`, { params });
      return { success: true };
    }),
});

/**
 * Synthetic routers for the contract compatibility harness.
 *
 * These are built from the public procedure builders, exactly as a private
 * build's routers are, and are contributed through the `registered-routers.ts`
 * slot so they load after `trpc.ts` has initialized.
 */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const syntheticWidgetsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ limit: z.number().int().positive().default(5) }))
    .query(({ ctx, input }) => ({
      subjectId: ctx.principal?.subjectId ?? null,
      limit: input.limit,
    })),
});

export const syntheticWidgetAdminRouter = createTRPCRouter({
  rename: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) => ({
      subjectId: ctx.principal?.subjectId ?? null,
      name: input.name,
    })),
});

export const syntheticServerRouters = {
  syntheticWidgets: syntheticWidgetsRouter,
  syntheticWidgetAdmin: syntheticWidgetAdminRouter,
};

import { exampleRouter } from "~/server/api/routers/example";
import { hostRouter } from "~/server/api/routers/host";
import { vulnerabilityRouter } from "~/server/api/routers/vulnerability";
//import { queueRouter } from "~/server/api/routers/queue";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  host: hostRouter,
  vulnerability: vulnerabilityRouter,
  //queue: queueRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

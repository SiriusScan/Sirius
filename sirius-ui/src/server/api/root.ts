import { exampleRouter } from "~/server/api/routers/example";
import { hostRouter } from "~/server/api/routers/host";
import { vulnerabilityRouter } from "~/server/api/routers/vulnerability";
import { storeRouter } from "~/server/api/routers/store";
import { queueRouter } from "~/server/api/routers/queue";
import { userRouter } from "~/server/api/routers/user";
import { terminalRouter } from "~/server/api/routers/terminal";
import { agentRouter } from "~/server/api/routers/agent";
import { scannerRouter } from "~/server/api/routers/scanner";
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
  store: storeRouter,
  queue: queueRouter,
  user: userRouter,
  terminal: terminalRouter,
  agent: agentRouter,
  scanner: scannerRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

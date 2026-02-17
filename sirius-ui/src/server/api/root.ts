import { hostRouter } from "~/server/api/routers/host";
import { vulnerabilityRouter } from "~/server/api/routers/vulnerability";
import { storeRouter } from "~/server/api/routers/store";
import { queueRouter } from "~/server/api/routers/queue";
import { userRouter } from "~/server/api/routers/user";
import { terminalRouter } from "~/server/api/routers/terminal";
import { agentRouter } from "~/server/api/routers/agent";
import { scannerRouter } from "~/server/api/routers/scanner";
import { templatesRouter } from "~/server/api/routers/templates";
import { scriptsRouter } from "~/server/api/routers/scripts";
import { agentTemplatesRouter } from "~/server/api/routers/agent-templates";
import { repositoriesRouter } from "~/server/api/routers/repositories";
import { statisticsRouter } from "~/server/api/routers/statistics";
import { eventsRouter } from "~/server/api/routers/events";
import { agentScanRouter } from "~/server/api/routers/agentScan";
import { apikeysRouter } from "~/server/api/routers/apikeys";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  host: hostRouter,
  vulnerability: vulnerabilityRouter,
  store: storeRouter,
  queue: queueRouter,
  user: userRouter,
  terminal: terminalRouter,
  agent: agentRouter,
  scanner: scannerRouter,
  templates: templatesRouter,
  scripts: scriptsRouter,
  agentTemplates: agentTemplatesRouter,
  repositories: repositoriesRouter,
  statistics: statisticsRouter,
  events: eventsRouter,
  agentScan: agentScanRouter,
  apikeys: apikeysRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

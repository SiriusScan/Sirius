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
import { logsRouter } from "~/server/api/routers/logs";
import { createTRPCRouter } from "~/server/api/trpc";
import { serverExtensionRegistry } from "~/server/extensions";
import { registeredServerRouters } from "~/server/extensions/registered-routers";

/**
 * This is the primary router for your server.
 *
 * Community routers are listed here; a private build contributes additional
 * namespaces through `registeredServerRouters`. Both are spread as object
 * literals so tRPC keeps inferring the client-side types for every namespace.
 */
const routers = {
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
  logs: logsRouter,
  ...registeredServerRouters,
};

// Every composed namespace must be declared by a server extension, and every
// declared namespace must be composed. This rejects an overlay that ships a
// router without declaring its capability requirements, or declares a namespace
// it never serves, at startup rather than at request time.
serverExtensionRegistry.assertRouterNamespaces(Object.keys(routers));

export const appRouter = createTRPCRouter(routers);

// export type definition of API
export type AppRouter = typeof appRouter;

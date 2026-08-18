import { communityPrincipalResolver } from "./principal";
import type { SiriusServerExtension } from "./types";

/**
 * Community's server contributions.
 *
 * Every namespace merged into the application router is declared here, together
 * with the capability a caller needs to reach it. Capability names come from
 * `documentation/product/edition-boundary.yaml`; this file must not invent new
 * ones.
 */
export const communityServerExtension: SiriusServerExtension = {
  id: "community.server",
  version: "1.0.0",
  order: 0,
  principalResolver: communityPrincipalResolver,
  routerNamespaces: [
    { namespace: "host", requiredCapabilities: ["api.hosts"] },
    {
      namespace: "vulnerability",
      requiredCapabilities: ["api.vulnerabilities"],
    },
    { namespace: "store", requiredCapabilities: ["storage.valkey"] },
    { namespace: "queue", requiredCapabilities: ["messaging.queues"] },
    { namespace: "user", requiredCapabilities: ["auth.local_users"] },
    { namespace: "terminal", requiredCapabilities: ["ui.terminal"] },
    { namespace: "agent", requiredCapabilities: ["agents.remote"] },
    { namespace: "scanner", requiredCapabilities: ["api.scan_control"] },
    { namespace: "templates", requiredCapabilities: ["api.templates"] },
    { namespace: "scripts", requiredCapabilities: ["engine.scanner"] },
    {
      namespace: "agentTemplates",
      requiredCapabilities: ["api.agent_templates"],
    },
    {
      namespace: "repositories",
      requiredCapabilities: ["api.agent_templates"],
    },
    { namespace: "statistics", requiredCapabilities: ["api.statistics"] },
    { namespace: "events", requiredCapabilities: ["api.events"] },
    { namespace: "agentScan", requiredCapabilities: ["engine.agent_runtime"] },
    { namespace: "apikeys", requiredCapabilities: ["auth.api_keys"] },
    { namespace: "logs", requiredCapabilities: ["api.events"] },
  ],
};

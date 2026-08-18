/**
 * Pinned v1 extension contract.
 *
 * The shapes below are transcribed from the contract as frozen at Core
 * 823a80f663e585db775da4ce58b27ac0e5dcfbd2. They are then assigned to the
 * current types, so a consumer written against v1 must still compile:
 *
 * - removing or renaming a field fails here;
 * - narrowing a field's type fails here;
 * - adding a required field fails here;
 * - adding an optional field is additive and still compiles.
 *
 * Do not update these shapes to match a breaking change. If the contract must
 * change, add to it.
 */
import {
  createApiCapabilityProvider,
  hasRequiredCapabilities,
} from "~/ui/extensions";
import type {
  SiriusCapabilityProviderDefinition,
  SiriusCapabilitySnapshot,
  SiriusPrincipal,
  SiriusUIExtension,
} from "~/ui/extensions";
import {
  assertPrincipalCapabilities,
  createServerExtensionRegistry,
  resolvePrincipal,
} from "..";
import type {
  SiriusPrincipalResolver,
  SiriusServerExtension,
  SiriusServerRouterNamespace,
  SiriusSessionEnricher,
} from "..";
import type { Session } from "next-auth";

interface V1Principal {
  subjectId: string;
  displayName?: string | null;
  capabilities: readonly string[];
}

interface V1CapabilitySnapshot {
  principal: V1Principal;
  source: string;
}

interface V1CapabilityProviderDefinition {
  id: string;
  initialSnapshot: V1CapabilitySnapshot;
  load?: () => Promise<V1CapabilitySnapshot>;
}

interface V1RouterNamespace {
  namespace: string;
  requiredCapabilities?: readonly string[];
}

interface V1PrincipalResolver {
  id: string;
  resolve: (input: { session: Session | null }) => Promise<V1Principal | null>;
}

interface V1SessionEnricher {
  id: string;
  enrich: (
    session: Session,
    principal: V1Principal | null,
  ) => Session | Promise<Session>;
}

interface V1ServerExtension {
  id: string;
  version: string;
  order?: number;
  routerNamespaces?: readonly V1RouterNamespace[];
  principalResolver?: V1PrincipalResolver;
  sessionEnrichers?: readonly V1SessionEnricher[];
}

const v1Principal: V1Principal = {
  subjectId: "subject:v1",
  displayName: "V1",
  capabilities: ["api.hosts"],
};

const v1Snapshot: V1CapabilitySnapshot = {
  principal: v1Principal,
  source: "v1",
};

const v1Resolver: V1PrincipalResolver = {
  id: "v1.identity",
  resolve: () => Promise.resolve(v1Principal),
};

const v1Enricher: V1SessionEnricher = {
  id: "v1.session",
  enrich: (session) => session,
};

const v1Extension: V1ServerExtension = {
  id: "v1.server",
  version: "1.0.0",
  order: 50,
  routerNamespaces: [
    { namespace: "v1Widgets", requiredCapabilities: ["v1.widgets.read"] },
    { namespace: "v1Undeclared" },
  ],
  principalResolver: v1Resolver,
  sessionEnrichers: [v1Enricher],
};

// Server contract: a v1 consumer's values must satisfy the current types.
const principal: SiriusPrincipal = v1Principal;
const snapshot: SiriusCapabilitySnapshot = v1Snapshot;
const namespaces: readonly SiriusServerRouterNamespace[] =
  v1Extension.routerNamespaces ?? [];
const resolver: SiriusPrincipalResolver = v1Resolver;
const enricher: SiriusSessionEnricher = v1Enricher;
const extension: SiriusServerExtension = v1Extension;

// Registry construction and the enforcement helpers must keep their v1 shapes.
const registry = createServerExtensionRegistry([extension]);
const resolvedRequirements: readonly string[] =
  registry.getRequiredCapabilitiesForProcedure("v1Widgets.list");
const authoritativeResolver: SiriusPrincipalResolver = registry.principalResolver;
const declaredNamespaces: readonly SiriusServerRouterNamespace[] =
  registry.routerNamespaces;
const enrichers: readonly SiriusSessionEnricher[] = registry.sessionEnrichers;
registry.assertRouterNamespaces(["v1Widgets", "v1Undeclared"]);

const resolution: Promise<SiriusPrincipal | null> = resolvePrincipal(resolver, {
  session: null,
});
assertPrincipalCapabilities(v1Principal, ["api.hosts"]);
const allowed: boolean = hasRequiredCapabilities(v1Principal.capabilities, [
  "api.hosts",
]);

// Browser contract: the UI extension and capability provider shapes.
const v1UIExtension: SiriusUIExtension = {
  id: "v1.ui",
  version: "1.0.0",
  order: 50,
  navigation: [],
  routes: [
    {
      id: "v1.ui.widgets",
      path: "/v1-widgets",
      requiredCapabilities: ["v1.widgets.read"],
    },
  ],
  dashboardWidgets: [],
  settingsPanels: [],
};
const v1Provider: V1CapabilityProviderDefinition = {
  id: "v1.provider",
  initialSnapshot: v1Snapshot,
  load: () => Promise.resolve(v1Snapshot),
};
const provider: SiriusCapabilityProviderDefinition = v1Provider;
const apiProvider: SiriusCapabilityProviderDefinition =
  createApiCapabilityProvider({ endpoint: "/api/v1/capabilities" });

export {
  allowed,
  apiProvider,
  authoritativeResolver,
  declaredNamespaces,
  enricher,
  enrichers,
  extension,
  namespaces,
  principal,
  provider,
  resolution,
  resolvedRequirements,
  resolver,
  snapshot,
  v1UIExtension,
};

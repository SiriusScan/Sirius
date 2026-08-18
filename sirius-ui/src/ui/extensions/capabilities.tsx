import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  SiriusCapability,
  SiriusCapabilityProviderDefinition,
  SiriusCapabilitySnapshot,
  SiriusPrincipal,
} from "./types";

/**
 * Community capabilities are available without a license or entitlement
 * service. Keep this list aligned with the public edition-boundary catalog.
 */
export const COMMUNITY_CAPABILITIES: readonly SiriusCapability[] = [
  "scanning.core",
  "inventory.hosts",
  "findings.vulnerabilities",
  "api.public_rest",
  "ui.dashboard_shell",
  "auth.local_users",
  "auth.api_keys",
  "messaging.queues",
  "storage.postgres_core",
  "storage.valkey",
  "migrations.core",
  "extensions.module_registry",
  "ui.scanner",
  "ui.vulnerabilities",
  "ui.environment",
  "ui.terminal",
  "api.hosts",
  "api.vulnerabilities",
  "api.templates",
  "api.agent_templates",
  "api.events",
  "api.snapshots",
  "api.statistics",
  "api.scan_control",
  "engine.scanner",
  "engine.agent_runtime",
  "agents.remote",
  "reporting.basic_export",
];

export const communityPrincipal: SiriusPrincipal = {
  subjectId: "community",
  displayName: "Community",
  capabilities: COMMUNITY_CAPABILITIES,
};

export const communityCapabilitySnapshot: SiriusCapabilitySnapshot = {
  principal: communityPrincipal,
  source: "community",
};

export const communityCapabilityProvider: SiriusCapabilityProviderDefinition = {
  id: "community",
  initialSnapshot: communityCapabilitySnapshot,
  load: () => Promise.resolve(communityCapabilitySnapshot),
};

export function hasRequiredCapabilities(
  availableCapabilities: readonly SiriusCapability[],
  requiredCapabilities: readonly SiriusCapability[] = [],
): boolean {
  if (requiredCapabilities.length === 0) {
    return true;
  }

  const available = new Set(availableCapabilities);
  return requiredCapabilities.every((capability) => available.has(capability));
}

interface CapabilityContextValue {
  principal: SiriusPrincipal;
  source: string;
  loading: boolean;
  error: Error | null;
  has: (capability: SiriusCapability) => boolean;
  hasAll: (capabilities: readonly SiriusCapability[]) => boolean;
}

const defaultCapabilityContext: CapabilityContextValue = {
  principal: communityPrincipal,
  source: communityCapabilitySnapshot.source,
  loading: false,
  error: null,
  has: (capability) =>
    hasRequiredCapabilities(communityPrincipal.capabilities, [capability]),
  hasAll: (capabilities) =>
    hasRequiredCapabilities(communityPrincipal.capabilities, capabilities),
};

const CapabilityContext = createContext<CapabilityContextValue>(
  defaultCapabilityContext,
);

interface SiriusCapabilityProviderProps {
  definition: SiriusCapabilityProviderDefinition;
  children?: React.ReactNode;
}

/**
 * Supplies the neutral principal/capability context used by UI extensions.
 *
 * Community uses a static provider. A private build can supply a provider
 * whose `load` function reads its authenticated entitlement endpoint. A
 * failed load retains the provider's initial snapshot. API-backed providers
 * default that snapshot to an empty capability set so provider failures are
 * fail-closed unless a caller explicitly supplies a different initial state.
 */
export const SiriusCapabilityProvider = ({
  definition,
  children,
}: SiriusCapabilityProviderProps) => {
  const [snapshot, setSnapshot] = useState(definition.initialSnapshot);
  const [loading, setLoading] = useState(Boolean(definition.load));
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    setSnapshot(definition.initialSnapshot);
    setError(null);
    setLoading(Boolean(definition.load));

    if (!definition.load) {
      return () => {
        active = false;
      };
    }

    void definition
      .load()
      .then((nextSnapshot) => {
        if (!active) {
          return;
        }

        setSnapshot(nextSnapshot);
        setLoading(false);
      })
      .catch((cause: unknown) => {
        if (!active) {
          return;
        }

        setError(
          cause instanceof Error
            ? cause
            : new Error("Capability provider failed to load"),
        );
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [definition]);

  const has = useCallback(
    (capability: SiriusCapability) =>
      hasRequiredCapabilities(snapshot.principal.capabilities, [capability]),
    [snapshot.principal.capabilities],
  );

  const hasAll = useCallback(
    (capabilities: readonly SiriusCapability[]) =>
      hasRequiredCapabilities(snapshot.principal.capabilities, capabilities),
    [snapshot.principal.capabilities],
  );

  const value = useMemo<CapabilityContextValue>(
    () => ({
      principal: snapshot.principal,
      source: snapshot.source,
      loading,
      error,
      has,
      hasAll,
    }),
    [error, has, hasAll, loading, snapshot.principal, snapshot.source],
  );

  return (
    <CapabilityContext.Provider value={value}>
      {children}
    </CapabilityContext.Provider>
  );
};

export const useCapabilities = (): CapabilityContextValue =>
  useContext(CapabilityContext);

interface CapabilityGateProps {
  requiredCapabilities: readonly SiriusCapability[];
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export const CapabilityGate = ({
  requiredCapabilities,
  children,
  fallback = null,
}: CapabilityGateProps) => {
  const { loading, hasAll } = useCapabilities();

  if (loading && requiredCapabilities.length > 0) {
    return <>{fallback}</>;
  }

  return hasAll(requiredCapabilities) ? <>{children}</> : <>{fallback}</>;
};

interface ApiCapabilityProviderOptions {
  endpoint: string;
  initialSnapshot?: SiriusCapabilitySnapshot;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCapabilitySnapshot(
  payload: unknown,
  providerID: string,
): SiriusCapabilitySnapshot {
  if (!isRecord(payload)) {
    throw new Error("Capability endpoint returned an invalid response");
  }

  const principalPayload = isRecord(payload.principal)
    ? payload.principal
    : payload;
  const subjectID = principalPayload.subjectId;
  const displayName = principalPayload.displayName;
  const capabilities = principalPayload.capabilities;

  if (
    typeof subjectID !== "string" ||
    (typeof displayName !== "string" && displayName !== null) ||
    !Array.isArray(capabilities) ||
    !capabilities.every((capability) => typeof capability === "string")
  ) {
    throw new Error("Capability endpoint returned an invalid principal");
  }

  return {
    principal: {
      subjectId: subjectID,
      displayName,
      capabilities,
    },
    source: providerID,
  };
}

function createFailClosedCapabilitySnapshot(
  providerID: string,
): SiriusCapabilitySnapshot {
  return {
    principal: {
      subjectId: "",
      displayName: null,
      capabilities: [],
    },
    source: providerID,
  };
}

/**
 * Helper for a build-time extension that gets its capabilities from an API.
 * The endpoint and its authorization policy remain outside Community.
 *
 * API-backed providers default to an empty capability snapshot. If loading
 * fails, the provider therefore remains fail-closed rather than inheriting
 * the Community capability catalog.
 */
export function createApiCapabilityProvider({
  endpoint,
  initialSnapshot,
}: ApiCapabilityProviderOptions): SiriusCapabilityProviderDefinition {
  const providerID = `api:${endpoint}`;

  return {
    id: providerID,
    initialSnapshot:
      initialSnapshot ?? createFailClosedCapabilitySnapshot(providerID),
    load: async () => {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(
          `Capability endpoint returned HTTP ${response.status}`,
        );
      }

      return parseCapabilitySnapshot(await response.json(), providerID);
    },
  };
}

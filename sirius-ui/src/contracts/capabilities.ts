/**
 * Neutral capability and principal contracts.
 *
 * These primitives are shared by the browser registry (`~/ui/extensions`) and
 * the server registry (`~/server/extensions`), so this module must stay free of
 * React and of any server-only import. Keeping one definition here prevents the
 * informative UI gating catalog and the authoritative server enforcement
 * catalog from drifting apart.
 *
 * A capability is an opaque string. Core never interprets it as a role, a
 * license tier, or an edition name.
 */

export type SiriusCapability = string;

/**
 * An opaque subject plus the capabilities it currently holds.
 *
 * Core does not know whether a subject is an operator, a service account, or a
 * member of some private tenancy model. Only the resolving edition does.
 */
export interface SiriusPrincipal {
  subjectId: string;
  displayName?: string | null;
  capabilities: readonly SiriusCapability[];
}

export interface SiriusCapabilitySnapshot {
  principal: SiriusPrincipal;
  source: string;
}

export interface SiriusCapabilityProviderDefinition {
  id: string;
  initialSnapshot: SiriusCapabilitySnapshot;
  load?: () => Promise<SiriusCapabilitySnapshot>;
}

/**
 * Community capabilities are available without a license or entitlement
 * service. Keep this list aligned with the community entries in
 * `documentation/product/edition-boundary.yaml`, which is the source of truth.
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

/**
 * The principal used when no capability source could be established. It holds
 * nothing, so every gated contribution is denied.
 */
export const anonymousPrincipal: SiriusPrincipal = {
  subjectId: "",
  displayName: null,
  capabilities: [],
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

/**
 * Returns the required capabilities the principal does not hold. A missing
 * principal holds nothing, so every required capability is reported.
 */
export function missingCapabilities(
  principal: SiriusPrincipal | null,
  requiredCapabilities: readonly SiriusCapability[] = [],
): readonly SiriusCapability[] {
  const available = new Set(principal?.capabilities ?? []);
  return requiredCapabilities.filter(
    (capability) => !available.has(capability),
  );
}

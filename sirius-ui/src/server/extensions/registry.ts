import type { SiriusCapability } from "~/contracts/capabilities";
import { communityPrincipalResolver } from "./principal";
import type {
  SiriusPrincipalResolver,
  SiriusServerExtension,
  SiriusServerRouterNamespace,
  SiriusSessionEnricher,
} from "./types";

export interface SiriusServerExtensionRegistry {
  readonly extensions: readonly SiriusServerExtension[];
  readonly routerNamespaces: readonly SiriusServerRouterNamespace[];
  readonly principalResolver: SiriusPrincipalResolver;
  readonly sessionEnrichers: readonly SiriusSessionEnricher[];
  getRequiredCapabilitiesForNamespace: (
    namespace: string,
  ) => readonly SiriusCapability[];
  getRequiredCapabilitiesForProcedure: (
    path: string,
  ) => readonly SiriusCapability[];
  assertRouterNamespaces: (namespaces: readonly string[]) => void;
}

const DEFAULT_EXTENSION_ORDER = 1000;

function compareExtensions(
  left: SiriusServerExtension,
  right: SiriusServerExtension,
): number {
  const orderDifference =
    (left.order ?? DEFAULT_EXTENSION_ORDER) -
    (right.order ?? DEFAULT_EXTENSION_ORDER);
  return orderDifference === 0
    ? left.id.localeCompare(right.id)
    : orderDifference;
}

function requireNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must not be empty`);
  }
}

function assertUniqueIDs(
  contributions: readonly { id: string }[],
  label: string,
): void {
  const seen = new Set<string>();
  for (const contribution of contributions) {
    requireNonEmpty(contribution.id, `${label} id`);
    if (seen.has(contribution.id)) {
      throw new Error(`Duplicate ${label} id: ${contribution.id}`);
    }
    seen.add(contribution.id);
  }
}

function assertUniqueNamespaces(
  namespaces: readonly SiriusServerRouterNamespace[],
): void {
  const seen = new Set<string>();
  for (const entry of namespaces) {
    requireNonEmpty(entry.namespace, "Router namespace");
    if (seen.has(entry.namespace)) {
      throw new Error(`Duplicate router namespace: ${entry.namespace}`);
    }
    seen.add(entry.namespace);
  }
}

/**
 * Build the immutable compile-time server registry.
 *
 * The caller supplies Community plus any build-selected contributions.
 * Validation happens before the registry is exposed so a conflicting overlay
 * fails during build/startup rather than serving ambiguous procedures or
 * ambiguous authorization at runtime.
 */
export function createServerExtensionRegistry(
  extensions: readonly SiriusServerExtension[],
): SiriusServerExtensionRegistry {
  const orderedExtensions = [...extensions].sort(compareExtensions);
  assertUniqueIDs(orderedExtensions, "server extension");

  const routerNamespaces = orderedExtensions.flatMap(
    (extension) => extension.routerNamespaces ?? [],
  );
  assertUniqueNamespaces(routerNamespaces);

  const sessionEnrichers = orderedExtensions.flatMap(
    (extension) => extension.sessionEnrichers ?? [],
  );
  assertUniqueIDs(sessionEnrichers, "session enricher");

  const principalResolvers = orderedExtensions
    .map((extension) => extension.principalResolver)
    .filter(
      (resolver): resolver is SiriusPrincipalResolver => resolver !== undefined,
    );

  if (principalResolvers.length > 1) {
    throw new Error(
      "Only one principal resolver may be registered in a build",
    );
  }

  const capabilitiesByNamespace = new Map<string, readonly SiriusCapability[]>(
    routerNamespaces.map((entry) => [
      entry.namespace,
      entry.requiredCapabilities ?? [],
    ]),
  );

  const registry: SiriusServerExtensionRegistry = {
    extensions: Object.freeze([...orderedExtensions]),
    routerNamespaces: Object.freeze([...routerNamespaces]),
    principalResolver: principalResolvers[0] ?? communityPrincipalResolver,
    sessionEnrichers: Object.freeze([...sessionEnrichers]),
    getRequiredCapabilitiesForNamespace: (namespace) =>
      capabilitiesByNamespace.get(namespace) ?? [],
    getRequiredCapabilitiesForProcedure: (path) =>
      registry.getRequiredCapabilitiesForNamespace(path.split(".")[0] ?? ""),
    assertRouterNamespaces: (namespaces) => {
      const declared = new Set(capabilitiesByNamespace.keys());

      for (const namespace of namespaces) {
        if (!declared.has(namespace)) {
          throw new Error(
            `Router namespace ${namespace} is not declared by any server extension`,
          );
        }
      }

      const composed = new Set(namespaces);
      for (const namespace of declared) {
        if (!composed.has(namespace)) {
          throw new Error(
            `Declared router namespace ${namespace} is missing from the application router`,
          );
        }
      }
    },
  };

  return Object.freeze(registry);
}

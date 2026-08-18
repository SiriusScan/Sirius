import { communityCapabilityProvider } from "./capabilities";
import type {
  SiriusCapabilityProviderDefinition,
  SiriusUIDashboardWidget,
  SiriusUIExtension,
  SiriusUINavigationItem,
  SiriusUIRoute,
  SiriusUISettingsPanel,
} from "./types";

export interface SiriusUIExtensionRegistry {
  readonly extensions: readonly SiriusUIExtension[];
  readonly navigationItems: readonly SiriusUINavigationItem[];
  readonly routes: readonly SiriusUIRoute[];
  readonly dashboardWidgets: readonly SiriusUIDashboardWidget[];
  readonly settingsPanels: readonly SiriusUISettingsPanel[];
  readonly capabilityProvider: SiriusCapabilityProviderDefinition;
  getRouteForPath: (path: string) => SiriusUIRoute | undefined;
  getRequiredCapabilitiesForPath: (
    path: string,
  ) => readonly string[];
}

const DEFAULT_EXTENSION_ORDER = 1000;

function contributionOrder(
  contribution: { order?: number; id: string },
): number {
  return contribution.order ?? DEFAULT_EXTENSION_ORDER;
}

function compareContributions(
  left: { order?: number; id: string },
  right: { order?: number; id: string },
): number {
  const orderDifference =
    contributionOrder(left) - contributionOrder(right);
  return orderDifference === 0
    ? left.id.localeCompare(right.id)
    : orderDifference;
}

function sorted<T extends { order?: number; id: string }>(
  contributions: readonly T[],
): readonly T[] {
  return [...contributions].sort(compareContributions);
}

function requireNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} must not be empty`);
  }
}

function assertUnique<T extends { id: string }>(
  contributions: readonly T[],
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

function routePatterns(route: SiriusUIRoute): readonly string[] {
  return route.matchPaths && route.matchPaths.length > 0
    ? route.matchPaths
    : [route.path];
}

function matchesPath(path: string, pattern: string): boolean {
  return path === pattern || path.startsWith(`${pattern}/`);
}

function matchingPatternLength(
  path: string,
  route: SiriusUIRoute,
): number | undefined {
  const matchingPattern = routePatterns(route)
    .filter((pattern) => matchesPath(path, pattern))
    .sort((left, right) => right.length - left.length)[0];

  return matchingPattern?.length;
}

function assertUniqueRoutePatterns(routes: readonly SiriusUIRoute[]): void {
  const seen = new Set<string>();
  for (const route of routes) {
    requireNonEmpty(route.path, `Route ${route.id} path`);
    for (const pattern of routePatterns(route)) {
      requireNonEmpty(pattern, `Route ${route.id} path`);
      if (seen.has(pattern)) {
        throw new Error(`Duplicate UI route path: ${pattern}`);
      }
      seen.add(pattern);
    }
  }
}

/**
 * Build the immutable compile-time UI registry.
 *
 * The caller supplies Community plus any build-selected extension
 * contributions. Validation happens before the registry is exposed so a
 * conflicting Pro overlay fails during build/startup instead of producing
 * ambiguous navigation or route authorization at runtime.
 */
export function createUIExtensionRegistry(
  extensions: readonly SiriusUIExtension[],
): SiriusUIExtensionRegistry {
  const orderedExtensions = sorted(extensions);
  assertUnique(orderedExtensions, "UI extension");

  const navigationItems = orderedExtensions.flatMap(
    (extension) => extension.navigation ?? [],
  );
  const routes = orderedExtensions.flatMap(
    (extension) => extension.routes ?? [],
  );
  const dashboardWidgets = orderedExtensions.flatMap(
    (extension) => extension.dashboardWidgets ?? [],
  );
  const settingsPanels = orderedExtensions.flatMap(
    (extension) => extension.settingsPanels ?? [],
  );

  assertUnique(navigationItems, "navigation contribution");
  assertUnique(routes, "route contribution");
  assertUnique(dashboardWidgets, "dashboard widget contribution");
  assertUnique(settingsPanels, "settings panel contribution");
  assertUniqueRoutePatterns(routes);

  const capabilityProviders = orderedExtensions
    .map((extension) => extension.capabilityProvider)
    .filter(
      (
        provider,
      ): provider is SiriusCapabilityProviderDefinition =>
        provider !== undefined,
    );

  if (capabilityProviders.length > 1) {
    throw new Error(
      "Only one UI capability provider may be registered in a build",
    );
  }

  const registry: SiriusUIExtensionRegistry = {
    extensions: Object.freeze([...orderedExtensions]),
    navigationItems: Object.freeze(sorted(navigationItems)),
    routes: Object.freeze(sorted(routes)),
    dashboardWidgets: Object.freeze(sorted(dashboardWidgets)),
    settingsPanels: Object.freeze(sorted(settingsPanels)),
    capabilityProvider:
      capabilityProviders[0] ?? communityCapabilityProvider,
    getRouteForPath: (path) => {
      let bestMatch: SiriusUIRoute | undefined;
      let bestLength = -1;

      for (const route of routes) {
        const currentLength = matchingPatternLength(path, route);
        if (
          currentLength !== undefined &&
          currentLength > bestLength
        ) {
          bestMatch = route;
          bestLength = currentLength;
        }
      }

      return bestMatch;
    },
    getRequiredCapabilitiesForPath: (path) => {
      const route = registry.getRouteForPath(path);
      return route?.requiredCapabilities ?? [];
    },
  };

  return Object.freeze(registry);
}

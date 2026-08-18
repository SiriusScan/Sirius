import type React from "react";
import type {
  SiriusCapability,
  SiriusCapabilityProviderDefinition,
} from "~/contracts/capabilities";

/**
 * The neutral capability/principal primitives are shared with the server
 * registry, so they live in `~/contracts/capabilities` and are re-exported here
 * for consumers of the UI extension contract.
 */
export type {
  SiriusCapability,
  SiriusCapabilityProviderDefinition,
  SiriusCapabilitySnapshot,
  SiriusPrincipal,
} from "~/contracts/capabilities";

export interface SiriusNavigationIconProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  stroke?: string;
  fill?: string;
}

export type SiriusNavigationIcon = React.ComponentType<SiriusNavigationIconProps>;

export interface SiriusUINavigationItem {
  id: string;
  label: string;
  href: string;
  matchPaths: readonly string[];
  icon: SiriusNavigationIcon;
  requiredCapabilities?: readonly SiriusCapability[];
  order?: number;
}

export interface SiriusUIRoute {
  id: string;
  path: string;
  matchPaths?: readonly string[];
  requiredCapabilities?: readonly SiriusCapability[];
  order?: number;
}

export interface SiriusUIDashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType;
  requiredCapabilities?: readonly SiriusCapability[];
  order?: number;
}

export interface SiriusUISettingsPanel {
  id: string;
  title: string;
  component: React.ComponentType;
  requiredCapabilities?: readonly SiriusCapability[];
  order?: number;
}

/**
 * A compile-time UI extension contribution.
 *
 * Community registers its own declarations, while a Pro build overlays
 * `registered.ts` with additional declarations. The registry is assembled
 * during module evaluation; no runtime plugin loading is involved.
 */
export interface SiriusUIExtension {
  id: string;
  version: string;
  order?: number;
  navigation?: readonly SiriusUINavigationItem[];
  routes?: readonly SiriusUIRoute[];
  dashboardWidgets?: readonly SiriusUIDashboardWidget[];
  settingsPanels?: readonly SiriusUISettingsPanel[];
  capabilityProvider?: SiriusCapabilityProviderDefinition;
}

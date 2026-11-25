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
  /**
   * Where the sidebar shows the item. "main" (default) follows the primary
   * navigation; "footer" pins it to the bottom of the sidebar. Without footer
   * contributions the sidebar renders exactly as Community ships it.
   */
  placement?: "main" | "footer";
}

/**
 * A link added to the account menu (the avatar in the top-right corner),
 * after Community's own items. Without contributions the menu is unchanged.
 */
export interface SiriusUIUserMenuItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
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

/**
 * An extra tab on the Settings page, after Community's own tabs. Without
 * contributions the Settings page renders exactly as Community ships it.
 */
export interface SiriusUISettingsPanel {
  id: string;
  title: string;
  component: React.ComponentType;
  icon?: React.ComponentType<{ className?: string }>;
  requiredCapabilities?: readonly SiriusCapability[];
  order?: number;
}

/** Where a console command runs: the Sirius engine or one enrolled agent. */
export type SiriusConsoleTarget =
  | { type: "engine" }
  | { type: "agent"; id: string; name?: string };

export interface SiriusConsoleCommandResult {
  output: string;
  success: boolean;
  durationMs: number;
}

export interface SiriusConsoleCommandRequest {
  command: string;
  target: SiriusConsoleTarget;
  /** Short attribution written above the command in the terminal. */
  label?: string;
  /** Switch to the terminal view while the command runs. Defaults to true. */
  reveal?: boolean;
}

/**
 * The hosting operator console, as seen by an extension console view.
 *
 * Commands run through the console's own executor: they appear in the
 * terminal while they run and are recorded in History like typed commands.
 * Server procedures stay responsible for authorization.
 */
export interface SiriusConsoleController {
  readonly activeView: string;
  /** Show a built-in view ("terminal", "history", "agent") or an extension view. */
  showView: (id: string) => void;
  runCommand: (
    request: SiriusConsoleCommandRequest,
  ) => Promise<SiriusConsoleCommandResult>;
}

export interface SiriusConsoleViewProps {
  console: SiriusConsoleController;
  /** False while another console view is shown; the view stays mounted. */
  active: boolean;
}

/**
 * An additional view hosted inside the operator console's header and content
 * area. Without contributions the console renders exactly as Community ships
 * it. IDs are unique and cannot reuse "terminal", "history" or "agent".
 */
export interface SiriusConsoleView {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<SiriusConsoleViewProps>;
  /** Tab position relative to the built-in views. Defaults to "end". */
  placement?: "start" | "end";
  /** Open this view when the console mounts. At most one view may set it. */
  initial?: boolean;
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
  consoleViews?: readonly SiriusConsoleView[];
  userMenuItems?: readonly SiriusUIUserMenuItem[];
  capabilityProvider?: SiriusCapabilityProviderDefinition;
}

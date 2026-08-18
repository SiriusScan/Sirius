import AgentIcon from "~/components/icons/AgentIcon";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";
import ScanIcon from "~/components/icons/ScanIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import type { SiriusUIExtension } from "./types";

/**
 * The public Community UI is itself an extension contribution. Keeping these
 * declarations in the same registry as build-selected contributions lets a
 * Pro image append navigation and guarded routes without editing Sidebar or
 * Layout.
 */
export const communityUIExtension: SiriusUIExtension = {
  id: "community.ui",
  version: "1.0.0",
  order: 0,
  navigation: [
    {
      id: "community.scanner",
      label: "Scanner",
      href: "/scanner",
      matchPaths: ["/scanner"],
      icon: ScanIcon,
      requiredCapabilities: ["ui.scanner"],
      order: 10,
    },
    {
      id: "community.vulnerabilities",
      label: "Vulnerabilities",
      href: "/vulnerabilities",
      matchPaths: ["/vulnerabilities", "/vulnerability"],
      icon: VulnerabilityIcon,
      requiredCapabilities: ["ui.vulnerabilities"],
      order: 20,
    },
    {
      id: "community.environment",
      label: "Environment",
      href: "/environment",
      matchPaths: ["/environment", "/host"],
      icon: EnvironmentIcon,
      requiredCapabilities: ["ui.environment"],
      order: 30,
    },
    {
      id: "community.terminal",
      label: "Terminal",
      href: "/terminal",
      matchPaths: ["/terminal"],
      icon: AgentIcon,
      requiredCapabilities: ["ui.terminal"],
      order: 40,
    },
  ],
  routes: [
    {
      id: "community.dashboard",
      path: "/dashboard",
      requiredCapabilities: ["ui.dashboard_shell"],
      order: 10,
    },
    {
      id: "community.scanner",
      path: "/scanner",
      requiredCapabilities: ["ui.scanner"],
      order: 20,
    },
    {
      id: "community.vulnerabilities",
      path: "/vulnerabilities",
      requiredCapabilities: ["ui.vulnerabilities"],
      order: 30,
    },
    {
      id: "community.vulnerability",
      path: "/vulnerability",
      requiredCapabilities: ["ui.vulnerabilities"],
      order: 40,
    },
    {
      id: "community.environment",
      path: "/environment",
      requiredCapabilities: ["ui.environment"],
      order: 50,
    },
    {
      id: "community.host",
      path: "/host",
      requiredCapabilities: ["ui.environment"],
      order: 60,
    },
    {
      id: "community.terminal",
      path: "/terminal",
      requiredCapabilities: ["ui.terminal"],
      order: 70,
    },
    {
      id: "community.settings",
      path: "/settings",
      requiredCapabilities: ["ui.dashboard_shell"],
      order: 80,
    },
    {
      id: "community.system-monitor",
      path: "/system-monitor",
      requiredCapabilities: ["ui.dashboard_shell"],
      order: 90,
    },
    {
      id: "community.template-page",
      path: "/template-page",
      requiredCapabilities: ["ui.scanner"],
      order: 100,
    },
    {
      id: "community.finding",
      path: "/finding",
      requiredCapabilities: ["findings.vulnerabilities"],
      order: 110,
    },
  ],
};

/**
 * HostTabs — the host page's underline tabs (kit PageTabs), held in the URL
 * as `?tab=overview|vulnerabilities|system|network|history` (ADR-6), so a
 * tab can be linked and restored with Back. Rendered in HostHeader's tabs
 * slot; read the active tab with useHostTab().
 */

import React, { useMemo } from "react";
import { PageTabs, usePageTab } from "~/components/shared/PageTabs";
import { DEFAULT_HOST_TAB, HOST_TABS, hostTabs, type HostTab } from "./hostModel";

interface HostTabsProps {
  /** Open findings (server count), shown on Vulnerabilities. */
  vulnerabilityCount?: number;
  /** Open ports, shown on Network. */
  portCount?: number;
}

export function useHostTab(): HostTab {
  return usePageTab(HOST_TABS, DEFAULT_HOST_TAB);
}

export const HostTabs: React.FC<HostTabsProps> = ({ vulnerabilityCount, portCount }) => {
  const tabs = useMemo(
    () => hostTabs({ findings: vulnerabilityCount, ports: portCount }),
    [vulnerabilityCount, portCount],
  );
  return <PageTabs tabs={tabs} defaultTab={DEFAULT_HOST_TAB} aria-label="Host sections" />;
};

export default HostTabs;

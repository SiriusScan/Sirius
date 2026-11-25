/**
 * System Monitor (R11): /system-monitor?tab=services|resources|logs
 *
 *   - Services: one health source per service (container status plus the
 *     API's health probe, one query), a "k of n services running and
 *     healthy" banner, a card per service and recent system issues
 *     (system-category events at warning and above, grouped by route).
 *   - Resources: per-container CPU, memory, disk and uptime from the same
 *     query.
 *   - Logs: the centralized application log.
 *
 * One Refresh action; everything else refreshes every 5 s while the page is
 * visible. Each tab renders in its own error boundary, so a crash in one tab
 * shows an error block there instead of taking down the app.
 */

import { type NextPage } from "next";
import React, { useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import Layout from "~/components/Layout";
import { Button } from "~/components/lib/ui/button";
import { cn } from "~/components/lib/utils";
import { PageHeader } from "~/components/shared/PageHeader";
import { PageTabs, usePageTab, type PageTab } from "~/components/shared/PageTabs";
import { LogDashboard } from "~/components/LogDashboard";
import { SystemResourcesDashboard } from "~/components/SystemResourcesDashboard";
import { ServicesTab } from "~/components/system-monitor/ServicesTab";
import { TabBoundary } from "~/components/system-monitor/TabBoundary";
import {
  AUTO_REFRESH_LABEL,
  useInvalidateSystemStatus,
} from "~/components/system-monitor/useSystemStatus";
import { api } from "~/utils/api";

type MonitorTab = "services" | "resources" | "logs";

const TAB_IDS: readonly MonitorTab[] = ["services", "resources", "logs"];
const DEFAULT_TAB: MonitorTab = "services";

const TABS: readonly (PageTab & { id: MonitorTab })[] = [
  { id: "services", label: "Services" },
  { id: "resources", label: "Resources" },
  { id: "logs", label: "Logs" },
];

const TAB_LABELS: Record<MonitorTab, string> = {
  services: "Services",
  resources: "Resources",
  logs: "Logs",
};

function useRefreshAll(): [() => void, boolean] {
  const utils = api.useContext();
  const invalidateStatus = useInvalidateSystemStatus();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    // Only queries a mounted tab is watching refetch; the rest go stale.
    void Promise.allSettled([
      invalidateStatus(),
      utils.events.getRecentEvents.invalidate(),
      utils.logs.invalidate(),
    ]).finally(() => setRefreshing(false));
  };
  return [refresh, refreshing];
}

const SystemMonitor: NextPage = () => {
  const tab = usePageTab(TAB_IDS, DEFAULT_TAB);
  const [refresh, refreshing] = useRefreshAll();

  return (
    <Layout title="System Monitor">
      <div className="relative z-20 -mt-14 space-y-4">
        <PageHeader
          icon={Activity}
          title="System Monitor"
          actions={
            <>
              <span className="hidden text-[11px] text-gray-500 md:inline">
                {AUTO_REFRESH_LABEL.charAt(0).toUpperCase() + AUTO_REFRESH_LABEL.slice(1)}
              </span>
              <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
                <RefreshCw className={cn("mr-2 h-4 w-4", refreshing && "animate-spin")} aria-hidden />
                Refresh
              </Button>
            </>
          }
          tabs={<PageTabs tabs={TABS} defaultTab={DEFAULT_TAB} aria-label="System Monitor sections" />}
        />

        <div role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <TabBoundary key={tab} label={TAB_LABELS[tab]}>
            {tab === "services" && <ServicesTab />}
            {tab === "resources" && <SystemResourcesDashboard />}
            {tab === "logs" && <LogDashboard />}
          </TabBoundary>
        </div>
      </div>
    </Layout>
  );
};

export default SystemMonitor;

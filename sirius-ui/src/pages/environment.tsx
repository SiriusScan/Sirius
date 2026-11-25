/**
 * Environment — the inventory every scan fills (R04).
 *
 *   - PageHeader: "<n> hosts · <m> open findings" from useSummaryStats
 *     (ADR-2), Add host and Start scan
 *   - PageTabs in ?tab=hosts|software (ADR-6)
 *   - A banner when a scan has added hosts since the viewer last looked
 *     (ADR-1)
 *   - The hosts table, sorted by the server's risk score (ADR-3)
 *
 * `/environment?add=` opens Add host; `?add=<ip>` opens it pre-filled (from a
 * host that isn't in the inventory yet).
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Play, Plus, RefreshCw } from "lucide-react";
import Layout from "~/components/Layout";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { HostForm } from "~/components/environment/HostForm";
import { EnvironmentSoftwareInventory } from "~/components/environment/EnvironmentSoftwareInventory";
import { NewHostsBanner } from "~/components/environment/NewHostsBanner";
import { useNewHosts } from "~/components/environment/useNewHosts";
import {
  newHostsBannerText,
  scanTimeForNewHosts,
} from "~/components/environment/hostsTableModel";
import { PageHeader, HeaderChip } from "~/components/shared/PageHeader";
import { PageTabs, usePageTab, type PageTab } from "~/components/shared/PageTabs";
import { EmptyState } from "~/components/shared/EmptyState";
import { api } from "~/utils/api";
import { invalidateSummary, useSummaryStats } from "~/hooks/useSummaryStats";

// ── SEO ──────────────────────────────────────────────────────────────────────
export const metadata = {
  title: "Environment | Sirius",
  description: "View and manage hosts in your environment",
};

const TAB_IDS = ["hosts", "software"] as const;
type EnvironmentTab = (typeof TAB_IDS)[number];

const plural = (n: number, word: string) =>
  `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;

const secondaryAction =
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-violet-500/25 px-3 text-xs font-medium text-gray-200 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60";
const primaryAction =
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-3 text-xs font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60";

const Environment = () => {
  const router = useRouter();
  const utils = api.useContext();

  // ── Add host ────────────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  // `?add=` opens the empty form; `?add=<ip>` opens it pre-filled.
  const addRequested = router.isReady && typeof router.query.add === "string";
  const addIp = addRequested ? (router.query.add as string).trim() : "";
  useEffect(() => {
    if (addRequested) setCreating(true);
  }, [addRequested]);
  const closeCreate = useCallback(() => {
    setCreating(false);
    if (addRequested) void router.replace("/environment", undefined, { shallow: true });
  }, [addRequested, router]);

  // ── Data ────────────────────────────────────────────────────────────────
  // Same key and options as useEnvironmentData, so the cache is shared.
  const hostsQuery = api.host.getEnvironmentSummary.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
  const summaryQuery = useSummaryStats();
  const summary = summaryQuery.data;
  const rows = hostsQuery.data;

  // The summary polls; when it reports a change in the inventory (a scan
  // added a host or findings), reload the host rows so the table agrees.
  const { refetch: refetchHosts } = hostsQuery;
  const inventoryKey = summary
    ? [summary.hosts.total, summary.findings.open, summary.lastScan?.finishedAt ?? ""].join("|")
    : null;
  const seenInventoryKey = useRef<string | null>(null);
  useEffect(() => {
    if (!inventoryKey) return;
    const previous = seenInventoryKey.current;
    seenInventoryKey.current = inventoryKey;
    if (previous !== null && previous !== inventoryKey) void refetchHosts();
  }, [inventoryKey, refetchHosts]);

  const refreshAll = useCallback(() => {
    void refetchHosts();
    void invalidateSummary(utils);
  }, [refetchHosts, utils]);

  // ── New hosts banner ────────────────────────────────────────────────────
  const { hosts: newHosts, marker: lastSeenMarker, dismiss: acknowledgeNew } = useNewHosts(rows);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const newIps = useMemo(
    () => (newHosts.length > 0 ? new Set(newHosts.map((h) => h.ip)) : null),
    [newHosts],
  );
  useEffect(() => {
    if (!newIps) setShowNewOnly(false);
  }, [newIps]);
  const bannerText = newIps
    ? newHostsBannerText(
        newIps.size,
        scanTimeForNewHosts(newHosts, summary?.lastScan),
        lastSeenMarker,
      )
    : null;
  const dismissNew = useCallback(() => {
    setShowNewOnly(false);
    acknowledgeNew();
  }, [acknowledgeNew]);

  // ── Tabs ────────────────────────────────────────────────────────────────
  const tab = usePageTab<EnvironmentTab>(TAB_IDS, "hosts");
  const hostCount = summary?.hosts.total ?? rows?.length;
  const tabs = useMemo<PageTab[]>(
    () => [
      { id: "hosts", label: "Hosts", ...(hostCount !== undefined ? { count: hostCount } : {}) },
      { id: "software", label: "Software" },
    ],
    [hostCount],
  );

  // ── Add host form ───────────────────────────────────────────────────────
  if (creating) {
    return (
      <Layout>
        <div className="relative z-20 -mt-14 space-y-6">
          <HostForm
            mode="create"
            initialData={addIp ? { ip: addIp } : undefined}
            onCancel={closeCreate}
            onSuccess={() => {
              closeCreate();
              refreshAll();
            }}
          />
        </div>
      </Layout>
    );
  }

  const inventoryEmpty = !!rows && rows.length === 0;
  const loadFailed = hostsQuery.isError && !rows;

  return (
    <Layout>
      <div className="relative z-20 -mt-14 space-y-4">
        <PageHeader
          icon={<EnvironmentIcon width="20px" height="20px" className="fill-violet-400 text-violet-400" />}
          title="Environment"
          meta={
            summary ? (
              <HeaderChip>
                {plural(summary.hosts.total, "host")} · {plural(summary.findings.open, "open finding")}
              </HeaderChip>
            ) : undefined
          }
          actions={
            <>
              <button type="button" onClick={() => setCreating(true)} className={secondaryAction}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Add host</span>
                <span className="sr-only sm:hidden">Add host</span>
              </button>
              <Link href="/scanner" className={primaryAction}>
                <Play className="h-3.5 w-3.5" aria-hidden />
                <span className="hidden sm:inline">Start scan</span>
                <span className="sr-only sm:hidden">Start scan</span>
              </Link>
            </>
          }
          tabs={<PageTabs tabs={tabs} defaultTab="hosts" aria-label="Environment sections" />}
        />

        {tab === "hosts" && (
          <>
            {loadFailed ? (
              <EmptyState
                variant="error"
                title="Couldn't load hosts"
                reason="The Sirius API didn't answer. The rest of the app still works."
                primary={{ label: "Retry", icon: RefreshCw, onClick: refreshAll }}
              />
            ) : inventoryEmpty ? (
              <EmptyState
                variant="no-data"
                title="No hosts yet"
                reason="Run a scan and every host it finds is added here."
                primary={{ label: "Start a scan", icon: Play, href: "/scanner" }}
                secondary={{ label: "Add host", icon: Plus, onClick: () => setCreating(true) }}
              />
            ) : (
              <>
                {bannerText && (
                  <NewHostsBanner
                    text={bannerText}
                    showingNew={showNewOnly}
                    onToggleShowNew={() => setShowNewOnly((v) => !v)}
                    onDismiss={dismissNew}
                  />
                )}
                <section className="scanner-section scanner-section-padding" aria-label="Hosts">
                  <EnvironmentDataTable
                    rows={rows ?? []}
                    loading={!rows}
                    severityCounts={summary?.findings.bySeverity}
                    onlyIps={showNewOnly ? newIps : null}
                    onClearOnlyIps={() => setShowNewOnly(false)}
                  />
                </section>
              </>
            )}
          </>
        )}

        {tab === "software" && <EnvironmentSoftwareInventory />}
      </div>
    </Layout>
  );
};

export default Environment;

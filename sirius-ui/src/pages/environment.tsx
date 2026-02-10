/**
 * Environment Page — Table-First Orchestrator
 *
 * Decluttered, operator-grade environment view:
 *   - Sticky header with stat pills (hosts, vulns, critical)
 *   - Compact context bar: Most Vulnerable Hosts (horizontal) + Environment Snapshot
 *   - Table View | Software Inventory tabs — immediately visible
 *   - Data consolidated in useEnvironmentData hook
 *   - Tab persistence via localStorage
 */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { columns } from "~/components/EnvironmentDataTableColumns";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";
import { HostForm } from "~/components/environment/HostForm";
import { EnvironmentSoftwareInventory } from "~/components/environment/EnvironmentSoftwareInventory";
import { MostVulnerableHostsCompact } from "~/components/environment/MostVulnerableHostsCompact";
import { ActiveConstellationV2Loader } from "~/components/loaders";
import { useEnvironmentData, type EnvironmentViewTab } from "~/hooks/useEnvironmentData";
import { cn } from "~/components/lib/utils";
import {
  Server,
  ShieldAlert,
  Target,
  AlertTriangle,
  Activity,
} from "lucide-react";

// ── SEO ──────────────────────────────────────────────────────────────────────
export const metadata = {
  title: "Environment | Sirius",
  description: "View and manage hosts in your environment",
};

// ── Persistence key ──────────────────────────────────────────────────────────
const STORAGE_KEY = "sirius-env-active-tab";

// ── Tab definitions ──────────────────────────────────────────────────────────
const tabs: Array<{ id: EnvironmentViewTab; label: string }> = [
  { id: "table", label: "Table View" },
  { id: "software", label: "Software Inventory" },
];

// ── Page Component ───────────────────────────────────────────────────────────
const Environment = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [activeTab, setActiveTab] = useState<EnvironmentViewTab>("table");
  const { data, rawSoftwareStats, isLoading, isError, error, refetch } =
    useEnvironmentData();

  // Persist active tab
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && tabs.some((t) => t.id === stored)) {
        setActiveTab(stored as EnvironmentViewTab);
      }
    } catch {
      /* noop */
    }
  }, []);

  const handleTabChange = useCallback((tab: EnvironmentViewTab) => {
    setActiveTab(tab);
    try {
      localStorage.setItem(STORAGE_KEY, tab);
    } catch {
      /* noop */
    }
  }, []);

  // ── Create mode early return ────────────────────────────────────────────
  if (viewMode === "create") {
    return (
      <Layout>
        <div className="relative z-20 -mt-14 space-y-6">
          <HostForm
            mode="create"
            onCancel={() => setViewMode("list")}
            onSuccess={() => {
              setViewMode("list");
              refetch();
            }}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative z-20 -mt-14 space-y-4">
        {/* ── Sticky Header ─────────────────────────────────────────────── */}
        <div className="sticky top-2 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
          <div className="flex items-center gap-3">
            {/* Icon container */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
              <EnvironmentIcon
                width="24px"
                height="24px"
                className="fill-violet-400"
              />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Environment
            </h1>

            {/* Stat pills: Hosts, Total Vulns, Critical */}
            {data && (
              <div className="ml-2 flex items-center gap-3">
                {/* Hosts */}
                <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
                  <Server className="h-4 w-4 text-violet-400" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-white">
                      {data.totalHosts}
                    </span>
                    <span className="text-xs text-violet-300/60">hosts</span>
                  </div>
                </div>

                {/* Total Vulns */}
                <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
                  <Target className="h-4 w-4 text-violet-400" />
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-semibold text-white">
                      {data.vulnCounts.total}
                    </span>
                    <span className="text-xs text-violet-300/60">
                      vulnerabilities
                    </span>
                  </div>
                </div>

                {/* Critical */}
                {data.vulnCounts.critical > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-semibold text-red-400">
                        {data.vulnCounts.critical}
                      </span>
                      <span className="text-xs text-violet-300/60">
                        critical
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Add Host button */}
            <div className="flex shrink-0 items-center gap-2 pr-14">
              <button
                onClick={() => setViewMode("create")}
                className="flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:border-violet-500/30 hover:bg-violet-500/20"
              >
                + Add Host
              </button>
            </div>
          </div>
        </div>

        {/* ── Loading / Error states ────────────────────────────────────── */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <ActiveConstellationV2Loader
              size="xl"
              label="Loading hosts and vulnerability data..."
            />
          </div>
        )}

        {isError && !isLoading && (
          <div className="scanner-section border-red-500/30 p-4 text-red-400">
            <p>Error loading data: {error}</p>
            <button
              onClick={refetch}
              className="mt-2 text-sm text-violet-400 hover:text-violet-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!isLoading && !isError && (!data || data.totalHosts === 0) && (
          <div className="flex flex-col items-center justify-center rounded-lg border border-violet-500/20 bg-gray-900/30 p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10">
              <EnvironmentIcon
                width="24px"
                height="24px"
                className="fill-gray-500"
              />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-200">
              No hosts found
            </h3>
            <p className="text-sm text-gray-500">
              Add hosts to your environment to start tracking vulnerabilities.
            </p>
            <button
              onClick={() => setViewMode("create")}
              className="mt-4 rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600"
            >
              Add First Host
            </button>
          </div>
        )}

        {/* ── Data content ──────────────────────────────────────────────── */}
        {!isLoading && !isError && data && data.totalHosts > 0 && (
          <>
            {/* ── Context Bar: MVH + Environment Snapshot ───────────────── */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Left 2/3: Compact horizontal Most Vulnerable Hosts */}
              <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-4 backdrop-blur-sm lg:col-span-2">
                <div className="mb-2 flex items-center gap-2">
                  <Server className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Most Vulnerable Hosts</span>
                </div>
                <MostVulnerableHostsCompact limit={3} />
              </div>

              {/* Right 1/3: Environment Snapshot */}
              <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-4 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-violet-400" />
                  <span className="text-sm font-medium text-white">Environment Snapshot</span>
                </div>
                <div className="space-y-3">
                  {/* OS Distribution */}
                  <div>
                    <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-500">
                      OS Distribution
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(data.osDistribution)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([os, count]) => (
                          <div
                            key={os}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="truncate text-gray-300">
                              {os}
                            </span>
                            <span className="ml-2 whitespace-nowrap text-xs text-gray-500">
                              {count} {count === 1 ? "host" : "hosts"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-1.5 border-t border-violet-500/10 pt-2">
                    {data.lastScanDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Last Scan</span>
                        <span className="text-gray-300">
                          {data.lastScanDate}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        Software Packages
                      </span>
                      <span className="text-gray-300">
                        {data.softwareStats?.totalPackages ?? 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Risky Hosts</span>
                      <span
                        className={cn(
                          "font-medium",
                          data.riskyHosts > 0
                            ? "text-red-400"
                            : "text-green-400",
                        )}
                      >
                        {data.riskyHosts}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-1.5 border-t border-violet-500/10 pt-2">
                    <button
                      onClick={() => void router.push("/scanner")}
                      className="flex w-full items-center gap-2 rounded-md border border-violet-500/20 bg-gray-800/50 px-3 py-1.5 text-left text-sm text-gray-300 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10"
                    >
                      <Target className="h-3.5 w-3.5 text-violet-400" />
                      Run Scan
                    </button>
                    <button
                      onClick={() => void router.push("/vulnerabilities")}
                      className="flex w-full items-center gap-2 rounded-md border border-violet-500/20 bg-gray-800/50 px-3 py-1.5 text-left text-sm text-gray-300 transition-colors hover:border-violet-500/40 hover:bg-violet-500/10"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-violet-400" />
                      View Vulnerabilities
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tab Bar ───────────────────────────────────────────────── */}
            <div className="border-b border-violet-500/10">
              <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "relative whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "border-violet-500 text-violet-300"
                        : "border-transparent text-gray-500 hover:border-violet-500/20 hover:text-gray-300",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            <div>
              {activeTab === "table" && (
                <div className="scanner-table-wrapper">
                  <EnvironmentDataTable
                    columns={columns}
                    data={data.hosts}
                    onRefresh={refetch}
                  />
                </div>
              )}
              {activeTab === "software" && (
                <EnvironmentSoftwareInventory
                  softwareStats={rawSoftwareStats}
                  hosts={data.hosts}
                />
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Environment;

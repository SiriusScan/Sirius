/**
 * useEnvironmentData — Consolidated data hook for the Environment page.
 *
 * Mirrors the useHostData / useDashboardData pattern:
 *   - Host rows from host.getEnvironmentSummary, each carrying the server's
 *     riskScore / riskBand / counts (ADR-3), open ports and data freshness
 *   - Page-level counts from useSummaryStats (ADR-2), never re-derived here
 *   - Software stats for the Software tab
 */

import { useMemo } from "react";
import { api } from "~/utils/api";
import { type EnvironmentHostRow } from "~/server/api/routers/host";
import { useSummaryStats } from "~/hooks/useSummaryStats";
import type {
  SeverityCounts as RiskSeverityCounts,
  SummaryStats,
} from "~/types/riskSummary";

export type { EnvironmentHostRow };

// ─── Types ───────────────────────────────────────────────────────────────────

export type EnvironmentViewTab = "table" | "software";

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  total: number;
}

export interface EnvironmentPageData {
  /** Host rows with server risk, counts, open ports and freshness. */
  hosts: EnvironmentHostRow[];
  totalHosts: number;
  activeHosts: number;
  /** Hosts whose risk band is critical or high (ADR-3). */
  riskyHosts: number;
  /** Unique CVEs by severity, as /vulnerabilities counts them (summary). */
  vulnCounts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  /** Open host findings across the inventory by severity (summary). */
  openFindings: { total: number; bySeverity: RiskSeverityCounts };
  softwareStats: {
    totalPackages: number;
    totalHosts: number;
    publishers: number;
    architectures: number;
    topSoftware: Array<{ publisher: string; count: number }>;
    architectureDistribution: Record<string, number>;
  } | null;
  /** Newest scan time across hosts (ISO), or null when none reported. */
  lastScanDate: string | null;
  osDistribution: Record<string, number>;
  /** Per-host open findings by severity, keyed by IP (server counts). */
  hostSeverityMap: Record<string, SeverityCounts>;
}

export interface UseEnvironmentDataReturn {
  data: EnvironmentPageData | null;
  /** The shared summary (ADR-2), for headers that need more counts. */
  summary: SummaryStats | undefined;
  rawSoftwareStats: any;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Per-host severity breakdown from the server's counts. */
function buildHostSeverityMap(
  hosts: EnvironmentHostRow[],
): Record<string, SeverityCounts> {
  const map: Record<string, SeverityCounts> = {};
  for (const host of hosts) {
    map[host.ip] = {
      critical: host.counts.critical,
      high: host.counts.high,
      medium: host.counts.medium,
      low: host.counts.low,
      informational: host.counts.info,
      total: host.openFindings,
    };
  }
  return map;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEnvironmentData(): UseEnvironmentDataReturn {
  // 1. Host rows
  const environmentQuery = api.host.getEnvironmentSummary.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Page counts: the one summary every page reads (ADR-2)
  const summaryQuery = useSummaryStats();

  // 3. Software stats (sequential — waits for hosts)
  const softwareStatsQuery = api.host.getEnvironmentSoftwareStats.useQuery(
    undefined,
    {
      enabled: !environmentQuery.isLoading,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  // ── Loading / error ────────────────────────────────────────────────────
  const isLoading =
    environmentQuery.isLoading ||
    summaryQuery.isLoading ||
    softwareStatsQuery.isLoading;

  const queryError =
    environmentQuery.error || summaryQuery.error || softwareStatsQuery.error;

  // ── Hosts (straight from environment summary) ─────────────────────────
  const hosts = useMemo<EnvironmentHostRow[]>(
    () => environmentQuery.data ?? [],
    [environmentQuery.data],
  );

  const summary = summaryQuery.data;

  // ── Aggregated data ────────────────────────────────────────────────────
  const data = useMemo<EnvironmentPageData | null>(() => {
    if (isLoading || hosts.length === 0) return null;

    const hostSeverityMap = buildHostSeverityMap(hosts);

    // OS distribution
    const osDistribution: Record<string, number> = {};
    hosts.forEach((h) => {
      const os = h.os || "Unknown";
      osDistribution[os] = (osDistribution[os] || 0) + 1;
    });

    const riskyHosts = hosts.filter(
      (h) => h.riskBand === "critical" || h.riskBand === "high",
    ).length;

    const unique = summary?.vulnerabilities;
    const vulnCounts = {
      total: unique?.unique ?? 0,
      critical: unique?.bySeverity.critical ?? 0,
      high: unique?.bySeverity.high ?? 0,
      medium: unique?.bySeverity.medium ?? 0,
      low: unique?.bySeverity.low ?? 0,
      informational: unique?.bySeverity.info ?? 0,
    };

    const openFindings = {
      total: summary?.findings.open ?? 0,
      bySeverity: summary?.findings.bySeverity ?? {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
      },
    };

    // Software stats
    const sw = softwareStatsQuery.data as any;
    const softwareStats = sw
      ? {
          totalPackages: sw.total_packages || 0,
          totalHosts: sw.total_hosts || 0,
          publishers: sw.top_software?.length || 0,
          architectures: Object.keys(sw.architecture_distribution || {}).length,
          topSoftware: sw.top_software || [],
          architectureDistribution: sw.architecture_distribution || {},
        }
      : null;

    // Newest scan across hosts (real observation times only)
    const scanTimes = hosts
      .map((h) => (h.lastScan ? Date.parse(h.lastScan.time) : NaN))
      .filter((t) => Number.isFinite(t));
    const lastScanDate =
      scanTimes.length > 0 ? new Date(Math.max(...scanTimes)).toISOString() : null;

    return {
      hosts,
      totalHosts: summary?.hosts.total ?? hosts.length,
      activeHosts: hosts.length,
      riskyHosts,
      vulnCounts,
      openFindings,
      softwareStats,
      lastScanDate,
      osDistribution,
      hostSeverityMap,
    };
  }, [hosts, isLoading, summary, softwareStatsQuery.data]);

  // ── Refetch ────────────────────────────────────────────────────────────
  const refetch = () => {
    void environmentQuery.refetch();
    void summaryQuery.refetch();
    void softwareStatsQuery.refetch();
  };

  return {
    data,
    summary,
    rawSoftwareStats: softwareStatsQuery.data,
    isLoading,
    isError: !!queryError,
    error: queryError?.message || null,
    refetch,
  };
}

/**
 * useEnvironmentData — Consolidated data hook for the Environment page.
 *
 * Mirrors the useHostData / useDashboardData pattern:
 *   - Fetches hosts, vulnerabilities, and software stats via tRPC
 *   - Computes per-host severity breakdowns from vulnerabilities[]
 *   - Computes aggregate statistics (OS distribution, risky hosts)
 *   - Returns a single typed object for the page orchestrator
 */

import { useMemo } from "react";
import { api } from "~/utils/api";
import { type EnvironmentTableData } from "~/server/api/routers/host";

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
  hosts: EnvironmentTableData[];
  totalHosts: number;
  activeHosts: number;
  riskyHosts: number;
  vulnCounts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  softwareStats: {
    totalPackages: number;
    totalHosts: number;
    publishers: number;
    architectures: number;
    topSoftware: Array<{ publisher: string; count: number }>;
    architectureDistribution: Record<string, number>;
  } | null;
  lastScanDate: string | null;
  osDistribution: Record<string, number>;
  hostSeverityMap: Record<string, SeverityCounts>;
}

export interface UseEnvironmentDataReturn {
  data: EnvironmentPageData | null;
  rawSoftwareStats: any;
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  refetch: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Compute per-host severity breakdown from the embedded vulnerabilities[] */
function buildHostSeverityMap(
  hosts: EnvironmentTableData[],
): Record<string, SeverityCounts> {
  const map: Record<string, SeverityCounts> = {};
  for (const host of hosts) {
    const counts: SeverityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
      total: 0,
    };
    if (host.vulnerabilities && host.vulnerabilities.length > 0) {
      for (const v of host.vulnerabilities) {
        const sev = v.severity?.toLowerCase() ?? "";
        if (sev === "critical") counts.critical++;
        else if (sev === "high") counts.high++;
        else if (sev === "medium") counts.medium++;
        else if (sev === "low") counts.low++;
        else counts.informational++;
        counts.total++;
      }
    } else {
      // Fallback — use the pre-computed vulnerabilityCount
      counts.total = host.vulnerabilityCount ?? 0;
    }
    map[host.ip] = counts;
  }
  return map;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useEnvironmentData(): UseEnvironmentDataReturn {
  // 1. Fetch hosts
  const environmentQuery = api.host.getEnvironmentSummary.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // 2. Fetch vulnerability counts (sequential — waits for hosts)
  const vulnerabilityQuery = api.vulnerability.getAllVulnerabilities.useQuery(
    undefined,
    {
      enabled: !environmentQuery.isLoading,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  // 3. Fetch software stats (sequential — waits for hosts)
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
    vulnerabilityQuery.isLoading ||
    softwareStatsQuery.isLoading;

  const queryError =
    environmentQuery.error ||
    vulnerabilityQuery.error ||
    softwareStatsQuery.error;

  // ── Hosts (straight from environment summary) ─────────────────────────
  const hosts = useMemo<EnvironmentTableData[]>(() => {
    if (!environmentQuery.data || environmentQuery.data.length === 0) return [];
    return environmentQuery.data;
  }, [environmentQuery.data]);

  // ── Aggregated data ────────────────────────────────────────────────────
  const data = useMemo<EnvironmentPageData | null>(() => {
    if (isLoading || hosts.length === 0) return null;

    // Per-host severity breakdown (computed from embedded vulnerabilities[])
    const hostSeverityMap = buildHostSeverityMap(hosts);

    // OS distribution
    const osDistribution: Record<string, number> = {};
    hosts.forEach((h) => {
      const os = h.os || "Unknown";
      osDistribution[os] = (osDistribution[os] || 0) + 1;
    });

    // Risk / active counts
    const riskyHosts = hosts.filter(
      (h) => (h.vulnerabilityCount ?? 0) > 20,
    ).length;
    const activeHosts = hosts.filter(
      (h) => (h as any).status !== "offline",
    ).length;

    // Vuln counts — prefer the dedicated vulnerability endpoint when it returns a non-zero
    // catalog; otherwise aggregate from embedded host data (avoids "0 vulns" in the header
    // when the aggregate endpoint is empty but hosts still list findings).
    const vulnData = vulnerabilityQuery.data as any;
    const fromHosts = Object.values(hostSeverityMap).reduce(
      (acc, c) => ({
        total: acc.total + c.total,
        critical: acc.critical + c.critical,
        high: acc.high + c.high,
        medium: acc.medium + c.medium,
        low: acc.low + c.low,
        informational: acc.informational + c.informational,
      }),
      {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 0,
      },
    );
    const api = vulnData?.counts;
    const vulnCounts =
      api && (api.total ?? 0) > 0
        ? {
            total: api.total || 0,
            critical: api.critical || 0,
            high: api.high || 0,
            medium: api.medium || 0,
            low: api.low || 0,
            informational: api.informational || 0,
          }
        : fromHosts.total > 0
          ? fromHosts
          : api
            ? {
                total: api.total || 0,
                critical: api.critical || 0,
                high: api.high || 0,
                medium: api.medium || 0,
                low: api.low || 0,
                informational: api.informational || 0,
              }
            : fromHosts;

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

    // Last scan date
    const scanDates = hosts
      .filter((h) => (h as any).lastScanDate)
      .map((h) => new Date((h as any).lastScanDate).getTime());
    const lastScanDate =
      scanDates.length > 0
        ? new Date(Math.max(...scanDates)).toLocaleDateString()
        : null;

    return {
      hosts,
      totalHosts: hosts.length,
      activeHosts,
      riskyHosts,
      vulnCounts,
      softwareStats,
      lastScanDate,
      osDistribution,
      hostSeverityMap,
    };
  }, [hosts, isLoading, vulnerabilityQuery.data, softwareStatsQuery.data]);

  // ── Refetch ────────────────────────────────────────────────────────────
  const refetch = () => {
    void environmentQuery.refetch();
    void vulnerabilityQuery.refetch();
    void softwareStatsQuery.refetch();
  };

  return {
    data,
    rawSoftwareStats: softwareStatsQuery.data,
    isLoading,
    isError: !!queryError,
    error: queryError?.message || null,
    refetch,
  };
}

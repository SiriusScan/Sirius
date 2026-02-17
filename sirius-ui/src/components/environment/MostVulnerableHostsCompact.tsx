/**
 * MostVulnerableHostsCompact — Horizontal layout for the environment page.
 *
 * Self-fetching via api.statistics.getMostVulnerableHosts (same endpoint
 * as the dashboard's TopVulnerableHostsWidget but rendered as a compact
 * horizontal card row instead of a vertical list).
 *
 * Target height: ~140px total — keeps the table above the fold.
 */

import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { getSeverityColors } from "~/utils/severityTheme";
import { Server, ChevronRight, RefreshCw } from "lucide-react";

interface MostVulnerableHostsCompactProps {
  limit?: number;
  className?: string;
}

interface HostData {
  hostId: string;
  hostname?: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  weightedScore?: number;
}

// Rank badge colors — top 3 get special treatment
const getRankBadgeClass = (rank: number): string => {
  if (rank === 1)
    return "bg-gradient-to-br from-red-600 to-red-700 text-white ring-1 ring-red-500/50";
  if (rank === 2)
    return "bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-1 ring-orange-500/50";
  if (rank === 3)
    return "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white ring-1 ring-yellow-500/50";
  return "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30";
};

// Compact host card — fits in a horizontal row
const CompactHostCard: React.FC<{
  rank: number;
  host: HostData;
  onClick: () => void;
}> = ({ rank, host, onClick }) => {
  const total = host.total || 1;
  const critPct = (host.critical / total) * 100;
  const highPct = (host.high / total) * 100;
  const medPct = (host.medium / total) * 100;
  const lowPct = (host.low / total) * 100;
  const infoPct = (host.informational / total) * 100;

  return (
    <button
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-lg border border-violet-500/20 bg-gray-900/50 p-3 text-left backdrop-blur-sm transition-all duration-200 hover:border-violet-500/40 hover:bg-gray-900/70 hover:shadow-lg hover:shadow-violet-500/5"
    >
      {/* Rank badge */}
      <div
        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${getRankBadgeClass(rank)}`}
      >
        {rank}
      </div>

      {/* Host info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-white">
              {host.hostname || host.hostId}
            </div>
            {host.hostname && (
              <div className="truncate text-[10px] text-gray-500">
                {host.hostId}
              </div>
            )}
          </div>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <span className="text-sm font-medium text-violet-300">
              {host.total}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-violet-400 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </div>

        {/* Thin severity stacked bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
          <div className="flex h-full">
            {host.critical > 0 && (
              <div
                className={`${getSeverityColors("critical").base} transition-all duration-500`}
                style={{ width: `${critPct}%` }}
                title={`${host.critical} Critical`}
              />
            )}
            {host.high > 0 && (
              <div
                className={`${getSeverityColors("high").base} transition-all duration-500`}
                style={{ width: `${highPct}%` }}
                title={`${host.high} High`}
              />
            )}
            {host.medium > 0 && (
              <div
                className={`${getSeverityColors("medium").base} transition-all duration-500`}
                style={{ width: `${medPct}%` }}
                title={`${host.medium} Medium`}
              />
            )}
            {host.low > 0 && (
              <div
                className={`${getSeverityColors("low").base} transition-all duration-500`}
                style={{ width: `${lowPct}%` }}
                title={`${host.low} Low`}
              />
            )}
            {host.informational > 0 && (
              <div
                className={`${getSeverityColors("informational").base} transition-all duration-500`}
                style={{ width: `${infoPct}%` }}
                title={`${host.informational} Informational`}
              />
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const MostVulnerableHostsCompactComponent: React.FC<
  MostVulnerableHostsCompactProps
> = ({ limit = 3, className = "" }) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = api.useContext();

  const {
    data: rawData,
    isLoading,
    error,
    refetch,
  } = api.statistics.getMostVulnerableHosts.useQuery(
    { limit, refresh: false },
    { refetchOnWindowFocus: false, staleTime: 300_000 },
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await utils.statistics.getMostVulnerableHosts.invalidate();
      await utils.client.statistics.getMostVulnerableHosts.query({
        limit,
        refresh: true,
      });
      await refetch();
    } catch (err) {
      console.error("Failed to refresh vulnerable hosts:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const hosts = useMemo<HostData[]>(() => {
    if (!rawData?.hosts) return [];
    return rawData.hosts.map((h) => ({
      hostId: h.hostIp,
      hostname: h.hostname,
      total: h.totalVulnerabilities,
      critical: h.severityCounts?.critical || 0,
      high: h.severityCounts?.high || 0,
      medium: h.severityCounts?.medium || 0,
      low: h.severityCounts?.low || 0,
      informational: h.severityCounts?.informational || 0,
      weightedScore: h.weightedRiskScore,
    }));
  }, [rawData]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-14" />
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {[...Array(limit)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-violet-500/20 bg-gray-900/50 p-3"
            >
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={className}>
        <div className="text-sm text-red-500">
          Failed to load vulnerable hosts
        </div>
        <button
          onClick={() => void handleRefresh()}
          className="mt-1 text-xs text-violet-400 hover:text-violet-300"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (hosts.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-6 ${className}`}
      >
        <Server className="mb-2 h-6 w-6 text-violet-400/50" />
        <p className="text-xs text-gray-500">No vulnerable hosts found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Subheading + refresh */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Top {hosts.length} most vulnerable{" "}
          {hosts.length === 1 ? "host" : "hosts"}
        </span>
        <button
          onClick={() => void handleRefresh()}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "..." : "Refresh"}
        </button>
      </div>

      {/* Horizontal card row */}
      <div className="grid gap-2 md:grid-cols-3">
        {hosts.map((host, i) => (
          <CompactHostCard
            key={host.hostId}
            rank={i + 1}
            host={host}
            onClick={() => void router.push(`/host/${host.hostId}`)}
          />
        ))}
      </div>
    </div>
  );
};

export const MostVulnerableHostsCompact = React.memo(
  MostVulnerableHostsCompactComponent,
);

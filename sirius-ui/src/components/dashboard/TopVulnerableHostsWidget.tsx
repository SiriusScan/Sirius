import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { Server, ChevronRight, RefreshCw } from "lucide-react";

interface TopVulnerableHostsWidgetProps {
  className?: string;
  height?: number;
  limit?: number;
  onRefresh?: () => void;
}

interface HostVulnerabilityData {
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

interface HostCardProps {
  rank: number;
  host: HostVulnerabilityData;
  onClick: () => void;
  animationDelay: number;
}

// Severity color mapping
const SEVERITY_COLORS = {
  critical: {
    bg: "bg-red-600",
    text: "text-red-600",
    badge: "bg-red-600/20 text-red-400 border-red-600/30",
  },
  high: {
    bg: "bg-orange-500",
    text: "text-orange-500",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  medium: {
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  low: {
    bg: "bg-green-500",
    text: "text-green-500",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  informational: {
    bg: "bg-blue-500",
    text: "text-blue-500",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
};

// Rank badge styling - top 3 get special treatment
const getRankBadgeClass = (rank: number): string => {
  if (rank === 1) {
    return "bg-gradient-to-br from-red-600 to-red-700 text-white ring-2 ring-red-500/50";
  }
  if (rank === 2) {
    return "bg-gradient-to-br from-orange-500 to-orange-600 text-white ring-2 ring-orange-500/50";
  }
  if (rank === 3) {
    return "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white ring-2 ring-yellow-500/50";
  }
  return "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30";
};

// Compact severity legend component
const SeverityLegend: React.FC = () => {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
      <span className="text-muted-foreground">Severity:</span>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
        <span className="text-muted-foreground">Critical</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
        <span className="text-muted-foreground">High</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="text-muted-foreground">Medium</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="text-muted-foreground">Low</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        <span className="text-muted-foreground">Info</span>
      </div>
    </div>
  );
};

// Individual host card component
const HostCard: React.FC<HostCardProps> = ({
  rank,
  host,
  onClick,
  animationDelay,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate percentages for stacked bar
  const total = host.total;
  const criticalPercent = (host.critical / total) * 100;
  const highPercent = (host.high / total) * 100;
  const mediumPercent = (host.medium / total) * 100;
  const lowPercent = (host.low / total) * 100;
  const infoPercent = (host.informational / total) * 100;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group w-full cursor-pointer rounded-lg border border-violet-500/20 bg-gray-900/50 p-3 text-left backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-violet-500/40 hover:bg-gray-900/70 hover:shadow-lg hover:shadow-violet-500/5"
      style={{
        animation: `fade-in-up 0.3s ease-out ${animationDelay}s both`,
      }}
      aria-label={`View details for ${
        host.hostname || host.hostId
      } - Rank ${rank} - ${host.total} vulnerabilities`}
    >
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div
          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-transform duration-200 group-hover:scale-110 ${getRankBadgeClass(
            rank
          )}`}
        >
          {rank}
        </div>

        {/* Host Information */}
        <div className="flex-1 space-y-2">
          {/* Host Name and Total */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-white">
                {host.hostname || host.hostId}
              </div>
              {host.hostname && (
                <div className="text-xs text-muted-foreground">
                  {host.hostId}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-sm font-medium text-violet-300">
                  {host.total} total
                </div>
                {host.weightedScore !== undefined && (
                  <div className="text-xs text-muted-foreground">
                    Risk: {host.weightedScore.toFixed(2)}
                  </div>
                )}
              </div>
              <ChevronRight
                className={`h-4 w-4 text-violet-400 transition-transform duration-200 ${
                  isHovered ? "translate-x-1" : ""
                }`}
              />
            </div>
          </div>

          {/* Stacked Bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-800">
            <div className="flex h-full">
              {host.critical > 0 && (
                <div
                  className={`${SEVERITY_COLORS.critical.bg} transition-all duration-500`}
                  style={{ width: `${criticalPercent}%` }}
                  title={`${host.critical} Critical`}
                />
              )}
              {host.high > 0 && (
                <div
                  className={`${SEVERITY_COLORS.high.bg} transition-all duration-500`}
                  style={{ width: `${highPercent}%` }}
                  title={`${host.high} High`}
                />
              )}
              {host.medium > 0 && (
                <div
                  className={`${SEVERITY_COLORS.medium.bg} transition-all duration-500`}
                  style={{ width: `${mediumPercent}%` }}
                  title={`${host.medium} Medium`}
                />
              )}
              {host.low > 0 && (
                <div
                  className={`${SEVERITY_COLORS.low.bg} transition-all duration-500`}
                  style={{ width: `${lowPercent}%` }}
                  title={`${host.low} Low`}
                />
              )}
              {host.informational > 0 && (
                <div
                  className={`${SEVERITY_COLORS.informational.bg} transition-all duration-500`}
                  style={{ width: `${infoPercent}%` }}
                  title={`${host.informational} Informational`}
                />
              )}
            </div>
          </div>

          {/* Severity Count Badges */}
          <div className="flex flex-wrap gap-1.5">
            {host.critical > 0 && (
              <span
                className={`rounded border px-1.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS.critical.badge}`}
              >
                {host.critical} Crit
              </span>
            )}
            {host.high > 0 && (
              <span
                className={`rounded border px-1.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS.high.badge}`}
              >
                {host.high} High
              </span>
            )}
            {host.medium > 0 && (
              <span
                className={`rounded border px-1.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS.medium.badge}`}
              >
                {host.medium} Med
              </span>
            )}
            {host.low > 0 && (
              <span
                className={`rounded border px-1.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS.low.badge}`}
              >
                {host.low} Low
              </span>
            )}
            {host.informational > 0 && (
              <span
                className={`rounded border px-1.5 py-0.5 text-xs font-medium ${SEVERITY_COLORS.informational.badge}`}
              >
                {host.informational} Info
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

// Helper function for relative time display
function formatRelativeTime(timestamp?: string): string {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const TopVulnerableHostsWidgetComponent: React.FC<
  TopVulnerableHostsWidgetProps
> = ({ className = "", height, limit = 5, onRefresh }) => {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const utils = api.useContext();

  // Fetch real data from API
  const {
    data: vulnerableHostsData,
    isLoading,
    error,
    refetch,
  } = api.statistics.getMostVulnerableHosts.useQuery(
    { limit, refresh: false },
    {
      refetchOnWindowFocus: false,
      staleTime: 300000, // 5 minutes
    }
  );

  // Manual refresh handler - forces backend cache invalidation via refresh=true
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate tRPC query cache
      await utils.statistics.getMostVulnerableHosts.invalidate();
      // Fetch with refresh=true to invalidate backend Valkey cache
      await utils.client.statistics.getMostVulnerableHosts.query({
        limit,
        refresh: true, // Force backend cache invalidation
      });
      // Refetch to update React Query cache
      await refetch();
      onRefresh?.();
    } catch (err) {
      console.error("Failed to refresh vulnerable hosts:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Transform API data to component format
  const topHosts = useMemo<HostVulnerabilityData[]>(() => {
    if (!vulnerableHostsData?.hosts) {
      console.log("TopVulnerableHostsWidget: No hosts data", {
        vulnerableHostsData,
      });
      return [];
    }

    console.log("TopVulnerableHostsWidget: Processing hosts", {
      hostCount: vulnerableHostsData.hosts.length,
      hosts: vulnerableHostsData.hosts,
    });

    return vulnerableHostsData.hosts.map((host) => ({
      hostId: host.hostIp,
      hostname: host.hostname,
      total: host.totalVulnerabilities,
      critical: host.severityCounts?.critical || 0,
      high: host.severityCounts?.high || 0,
      medium: host.severityCounts?.medium || 0,
      low: host.severityCounts?.low || 0,
      informational: host.severityCounts?.informational || 0,
      weightedScore: host.weightedRiskScore,
    }));
  }, [vulnerableHostsData]);

  const handleHostClick = (hostId: string) => {
    router.push(`/host/${hostId}`);
  };

  // Show loading state
  if (isLoading) {
    return <TopVulnerableHostsWidgetSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-red-500">
              Failed to load vulnerable hosts data
            </div>
            {error.message && (
              <div className="text-xs text-red-400/70">{error.message}</div>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no data (but not if error)
  if (!vulnerableHostsData) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Loading vulnerable hosts...
          </div>
        </div>
      </div>
    );
  }

  if (topHosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 ring-1 ring-violet-500/20">
          <Server className="h-8 w-8 text-violet-400" />
        </div>
        <p className="text-sm font-medium text-white">
          No vulnerable hosts found
        </p>
        <p className="text-xs text-muted-foreground">
          Run a scan to discover vulnerabilities
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with Cache Info and Refresh Button */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          Top {vulnerableHostsData.total} most vulnerable{" "}
          {vulnerableHostsData.total === 1 ? "host" : "hosts"}
          {vulnerableHostsData.cached && vulnerableHostsData.cachedAt && (
            <span className="ml-2 text-xs text-muted-foreground">
              (Cached {formatRelativeTime(vulnerableHostsData.cachedAt)})
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1 text-xs text-primary transition-colors hover:underline disabled:opacity-50"
          title="Refresh vulnerability data"
        >
          <RefreshCw
            className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Severity Legend */}
      <SeverityLegend />

      {/* Host Cards */}
      <div className="space-y-2">
        {topHosts.map((host, index) => (
          <HostCard
            key={host.hostId}
            rank={index + 1}
            host={host}
            onClick={() => handleHostClick(host.hostId)}
            animationDelay={index * 0.05}
          />
        ))}
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const TopVulnerableHostsWidget = React.memo(
  TopVulnerableHostsWidgetComponent
);

// Loading skeleton
export const TopVulnerableHostsWidgetSkeleton: React.FC<{
  height?: number;
}> = ({ height }) => {
  return (
    <div className="flex flex-col space-y-3">
      {/* Header skeleton */}
      <div className="mb-2 flex items-center justify-between">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Legend skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>

      {/* Host card skeletons */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex gap-3 rounded-lg border border-violet-500/20 bg-gray-900/50 p-3"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

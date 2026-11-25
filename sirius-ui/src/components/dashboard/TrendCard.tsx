/**
 * TrendCard (R01) — the vulnerability trend from saved snapshots. With fewer
 * than two snapshots there is nothing to compare, so the card collapses to
 * one line ("The trend chart appears after the second snapshot. One snapshot
 * so far (…).") beside Create snapshot. From two snapshots on it shows the
 * existing chart.
 */

import React from "react";
import { Activity } from "lucide-react";
import { api } from "~/utils/api";
import { CreateSnapshotButton } from "./CreateSnapshotButton";
import { DashboardPanel } from "./DashboardPanel";
import { VulnerabilityTrendChart, VulnerabilityTrendChartSkeleton } from "./VulnerabilityTrendChart";
import { TREND_SNAPSHOT_LIMIT, trendCollapsedText, trendState } from "./dashboardModel";
import { Skeleton } from "~/components/lib/ui/skeleton";

export function TrendCard({ className }: { className?: string }) {
  // Same query (and cache entry) the chart reads.
  const { data, isLoading, error } = api.statistics.getVulnerabilityTrends.useQuery(
    { days: TREND_SNAPSHOT_LIMIT },
    { refetchOnWindowFocus: false, staleTime: 300_000 },
  );

  if (isLoading) {
    return (
      <DashboardPanel icon={Activity} title="Trend" className={className}>
        <Skeleton className="h-4 w-2/3" />
      </DashboardPanel>
    );
  }

  if (error) {
    return (
      <DashboardPanel icon={Activity} title="Trend" className={className} action={<CreateSnapshotButton />}>
        <p role="alert" className="text-sm text-gray-400">
          Couldn&apos;t load snapshots.
          {error.message && <span className="block text-xs text-gray-500">{error.message}</span>}
        </p>
      </DashboardPanel>
    );
  }

  const state = trendState(data?.trends);

  if (state.kind === "collapsed") {
    return (
      <DashboardPanel icon={Activity} title="Trend" className={className}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-400">{trendCollapsedText(state)}</p>
          <CreateSnapshotButton />
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel icon={Activity} title="Trend" className={className} action={<CreateSnapshotButton />}>
      {data ? <VulnerabilityTrendChart height={280} /> : <VulnerabilityTrendChartSkeleton height={280} />}
    </DashboardPanel>
  );
}

export default TrendCard;

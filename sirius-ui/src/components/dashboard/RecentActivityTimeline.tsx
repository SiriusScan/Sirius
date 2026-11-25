/**
 * RecentActivityTimeline — the Dashboard's "Security events" list (R01,
 * ADR-5). It asks the events API for the security category only (scans,
 * hosts, findings); request errors and performance metrics are system
 * telemetry and live in System Monitor.
 *
 * Each row is a short title, one line from the event's own metadata
 * (securityEvents.ts) and the time. Rows that name a host or a CVE link to it.
 */

import React, { useMemo } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bug, CheckCircle2, Play, Radar, Server, Activity } from "lucide-react";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { cn } from "~/components/lib/utils";
import { api } from "~/utils/api";
import { formatDateTime } from "~/utils/formatDateTime";
import { toSecurityEventRow, type SecurityEventKind, type SecurityEventRow } from "./securityEvents";

export interface RecentActivityTimelineProps {
  /** Events to show. Default 5. */
  limit?: number;
  className?: string;
}

const KIND_ICON: Record<SecurityEventKind, LucideIcon> = {
  scan_started: Play,
  scan_completed: CheckCircle2,
  host_discovered: Radar,
  host_created: Server,
  finding: Bug,
  other: Activity,
};

function EventRow({ row }: { row: SecurityEventRow }) {
  const Icon = KIND_ICON[row.kind];
  const content = (
    <>
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
        <Icon className="h-3.5 w-3.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-medium text-white">{row.title}</span>
          <time
            dateTime={row.timestamp}
            title={formatDateTime(row.timestamp, "long")}
            className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-gray-500"
          >
            {formatDateTime(row.timestamp)}
          </time>
        </span>
        {row.detail && (
          <span className="block truncate text-xs text-gray-500" title={row.detail}>
            {row.detail}
          </span>
        )}
      </span>
    </>
  );
  const rowClass = "flex items-start gap-3 py-2.5";
  if (row.href) {
    return (
      <Link
        href={row.href}
        className={cn(
          rowClass,
          "-mx-1 rounded-md px-1 transition-colors hover:bg-violet-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
        )}
      >
        {content}
      </Link>
    );
  }
  return <div className={rowClass}>{content}</div>;
}

const RecentActivityTimelineComponent: React.FC<RecentActivityTimelineProps> = ({
  limit = 5,
  className,
}) => {
  const { data, isLoading, error } = api.events.getRecentEvents.useQuery(
    { limit, category: "security" },
    { refetchInterval: 30_000 },
  );

  const rows = useMemo(() => (data?.events ?? []).map(toSecurityEventRow), [data]);

  if (isLoading) return <RecentActivityTimelineSkeleton rows={Math.min(limit, 5)} className={className} />;

  if (error) {
    return (
      <p role="alert" className={cn("py-2 text-sm text-gray-400", className)}>
        Couldn&apos;t load security events.
        {error.message && <span className="block text-xs text-gray-500">{error.message}</span>}
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <p className={cn("py-2 text-sm text-gray-400", className)}>
        No security events yet. Scans, new hosts and findings show up here.
      </p>
    );
  }

  return (
    <ol className={cn("divide-y divide-violet-500/10", className)}>
      {rows.map((row) => (
        <li key={row.id}>
          <EventRow row={row} />
        </li>
      ))}
    </ol>
  );
};

export const RecentActivityTimeline = React.memo(RecentActivityTimelineComponent);

export const RecentActivityTimelineSkeleton: React.FC<{ rows?: number; className?: string }> = ({
  rows = 5,
  className,
}) => (
  <div className={cn("divide-y divide-violet-500/10", className)} aria-hidden>
    {Array.from({ length: rows }, (_, i) => (
      <div key={i} className="flex items-start gap-3 py-2.5">
        <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);

export default RecentActivityTimeline;

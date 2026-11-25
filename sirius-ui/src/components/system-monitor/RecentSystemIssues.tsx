/**
 * RecentSystemIssues — system-category events at warning and above,
 * grouped by route (R11, ADR-5):
 *
 *   [Warning] GET /host/{ip}/sources → 404  ×3 · sirius-api        Nov 21, 12:14 PM
 *
 * Reads api.events.getRecentEvents({ category: "system" }) and groups with
 * ./systemIssues. Has its own loading, empty and error states.
 */

import React, { useId, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { EmptyState } from "~/components/shared/EmptyState";
import { severityColors } from "~/components/shared/severity";
import { formatDateTime } from "~/utils/formatDateTime";
import {
  ISSUE_SEVERITY_LABELS,
  ISSUE_SEVERITY_SCALE,
  groupSystemIssues,
  type IssueSeverity,
  type SystemIssue,
} from "./systemIssues";
import { AUTO_REFRESH_MS } from "./useSystemStatus";

/** How many recent events the issue list is built from (the procedure's max). */
export const ISSUE_EVENT_WINDOW = 100;
const COLLAPSED_ROWS = 8;

function IssueSeverityTag({ severity }: { severity: IssueSeverity }) {
  const colors = severityColors(ISSUE_SEVERITY_SCALE[severity]);
  return (
    <span
      className={cn(
        "inline-flex w-[4.5rem] shrink-0 justify-center rounded px-1.5 py-0.5 text-[11px] font-medium ring-1",
        colors.bg,
        colors.text,
        colors.ring,
      )}
    >
      {ISSUE_SEVERITY_LABELS[severity]}
    </span>
  );
}

function IssueRow({ issue }: { issue: SystemIssue }) {
  return (
    <li className="flex min-w-0 items-center gap-3 py-2.5">
      <IssueSeverityTag severity={issue.severity} />
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span
          className={cn(
            "min-w-0 break-all text-gray-100",
            issue.isRequest ? "font-mono text-xs font-semibold" : "text-sm",
          )}
        >
          {issue.label}
        </span>
        <span className="whitespace-nowrap text-[11px] text-gray-500">
          {issue.count > 1 && <span className="tabular-nums">×{issue.count} · </span>}
          {issue.service}
        </span>
      </div>
      <time
        dateTime={issue.latest}
        title={formatDateTime(issue.latest, "long")}
        className="shrink-0 whitespace-nowrap text-[11px] tabular-nums text-gray-500"
      >
        {formatDateTime(issue.latest)}
      </time>
    </li>
  );
}

export interface RecentSystemIssuesViewProps {
  /** Grouped issues; undefined until the first answer. */
  issues: readonly SystemIssue[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error?: { message: string } | null;
  onRetry: () => void;
  className?: string;
}

/** The "Recent system issues" panel for one result (presentational). */
export function RecentSystemIssuesView({
  issues,
  isLoading,
  isFetching,
  error,
  onRetry,
  className,
}: RecentSystemIssuesViewProps) {
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);

  let body: React.ReactNode;
  if (issues) {
    const shown = expanded ? issues : issues.slice(0, COLLAPSED_ROWS);
    body =
      issues.length === 0 ? (
        <EmptyState
          variant="no-data"
          size="compact"
          framed={false}
          icon={CheckCircle2}
          title="No recent system issues"
          reason={`No warnings or errors among the latest ${ISSUE_EVENT_WINDOW} system events.`}
        />
      ) : (
        <>
          <ul className="divide-y divide-violet-500/10">
            {shown.map((issue) => (
              <IssueRow key={issue.key} issue={issue} />
            ))}
          </ul>
          {issues.length > COLLAPSED_ROWS && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              {expanded ? "Show fewer" : `Show all ${issues.length} issues`}
            </button>
          )}
        </>
      );
  } else if (isLoading) {
    body = (
      <div className="space-y-3 py-2" aria-busy="true" aria-label="Loading system issues">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-5 w-[4.5rem] bg-gray-800/70" />
            <Skeleton className="h-4 flex-1 bg-gray-800/70" />
            <Skeleton className="h-4 w-24 bg-gray-800/70" />
          </div>
        ))}
      </div>
    );
  } else {
    body = (
      <EmptyState
        variant="error"
        size="compact"
        framed={false}
        title="Couldn't load system issues"
        reason={error?.message ? error.message : "The events service didn't answer."}
        primary={{ label: isFetching ? "Retrying…" : "Retry", icon: RefreshCw, onClick: onRetry }}
      />
    );
  }

  return (
    <section aria-labelledby={headingId} className={cn("scanner-section p-4", className)}>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 id={headingId} className="flex items-center gap-2 text-sm font-semibold text-white">
          <AlertTriangle className="h-4 w-4 text-violet-400" aria-hidden />
          Recent system issues
        </h2>
        <p className="text-[11px] text-gray-500">
          Warnings and errors from the latest {ISSUE_EVENT_WINDOW} system events · grouped by route
        </p>
      </div>
      {issues && error && (
        <p className="mb-1 text-[11px] text-amber-400/90">
          Last refresh failed: {error.message}. Showing the previous list.
        </p>
      )}
      {body}
    </section>
  );
}

export function RecentSystemIssues({ className }: { className?: string }) {
  const query = api.events.getRecentEvents.useQuery(
    { category: "system", limit: ISSUE_EVENT_WINDOW },
    { refetchInterval: AUTO_REFRESH_MS, keepPreviousData: true, retry: 1 },
  );
  const issues = useMemo(
    () => (query.data ? groupSystemIssues(query.data.events) : undefined),
    [query.data],
  );
  return (
    <RecentSystemIssuesView
      issues={issues}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => void query.refetch()}
      className={className}
    />
  );
}

export default RecentSystemIssues;

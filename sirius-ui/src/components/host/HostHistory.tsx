/**
 * HostHistory — the History tab: the host's accepted reports in the caller's
 * scope, newest first and paged by the API's cursor, then the host's
 * discovery. Each report shows what it submitted; assessment coverage is
 * always unknown, so an empty submission never reads as "assessed clean".
 * A failed older page keeps the entries already shown and offers a retry.
 * The sources that have reported are listed below. Times use the shared
 * formatter.
 */

import React, { useMemo, useState } from "react";
import { History, RefreshCw, RotateCw } from "lucide-react";
import { api } from "~/utils/api";
import { Button } from "~/components/lib/ui/button";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { SECTION_HEADER } from "~/utils/themeConstants";
import { formatDateTime } from "~/utils/formatDateTime";
import type { SourceFreshness } from "~/types/riskSummary";
import { historyTimeline, rescanHref, submittedItemsLabel } from "./hostModel";

interface HostHistoryProps {
  hostIp: string;
  /** Per-source report times from the host query (freshness.sources). */
  sourceFreshness?: readonly SourceFreshness[];
}

function HistorySkeleton() {
  return (
    <div className="scanner-section scanner-section-padding" aria-busy="true">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-3 w-3 animate-pulse rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-700" />
              <div className="h-3 w-48 animate-pulse rounded bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const HostHistory: React.FC<HostHistoryProps> = ({ hostIp, sourceFreshness = [] }) => {
  // The host whose older-page request failed (reset when the host changes).
  const [failedPageHost, setFailedPageHost] = useState<string>();
  const query = api.host.getHostHistory.useInfiniteQuery(
    { ip: hostIp },
    {
      getNextPageParam: (lastPage) => lastPage.next_cursor,
      enabled: !!hostIp,
      staleTime: 30000,
      retry: (failures, error) => error.data?.code === "INTERNAL_SERVER_ERROR" && failures < 2,
    },
  );

  const pages = useMemo(() => query.data?.pages ?? [], [query.data?.pages]);
  const timeline = useMemo(() => historyTimeline(pages.flatMap((page) => page.timeline)), [pages]);
  const reportCount = timeline.filter((entry) => entry.report).length;
  const sources = useMemo(() => {
    const names = new Set<string>(pages.flatMap((page) => page.sources));
    for (const s of sourceFreshness) names.add(s.name);
    return [...names];
  }, [pages, sourceFreshness]);

  if (query.isLoading) return <HistorySkeleton />;

  const code = query.error?.data?.code;
  const denied = code === "UNAUTHORIZED" || code === "FORBIDDEN";
  if (pages.length === 0 || denied || code === "NOT_FOUND") {
    return (
      <section className="scanner-section scanner-section-padding" aria-label="Activity timeline">
        <h3 className={`${SECTION_HEADER} mb-4`}>Activity timeline</h3>
        <EmptyState
          variant={code === "NOT_FOUND" ? "not-found" : "error"}
          size="compact"
          framed={false}
          title={
            denied ? "No access to this history" : code === "NOT_FOUND" ? "Host unavailable" : "History unavailable"
          }
          reason={
            denied
              ? "You don’t have access to this host history."
              : code === "NOT_FOUND"
              ? "This host is unavailable."
              : "Accepted report history is unavailable."
          }
          primary={
            denied || code === "NOT_FOUND"
              ? undefined
              : {
                  label: query.isFetching ? "Retrying…" : "Retry",
                  icon: RefreshCw,
                  onClick: () => void query.refetch(),
                }
          }
        />
      </section>
    );
  }

  const olderReportsError = failedPageHost === hostIp;
  const loadOlderReports = async () => {
    setFailedPageHost(undefined);
    try {
      await query.fetchNextPage({ throwOnError: true });
    } catch {
      setFailedPageHost(hostIp);
    }
  };

  return (
    <div className="space-y-4">
      <section className="scanner-section scanner-section-padding" aria-label="Activity timeline">
        <h3 className={`${SECTION_HEADER} mb-4`}>Activity timeline</h3>

        {reportCount === 0 && (
          <EmptyState
            variant="no-data"
            size="compact"
            framed={false}
            icon={History}
            title="No accepted reports yet"
            reason="No accepted reports are recorded for this host. Reports from scans of this host are listed here."
            primary={{ label: "Rescan host", icon: RotateCw, href: rescanHref(hostIp) }}
            className={cn(timeline.length > 0 && "mb-4")}
          />
        )}

        {timeline.length > 0 && (
          <div className="relative">
            <div className="absolute bottom-2 left-[5px] top-2 w-px bg-violet-500/20" aria-hidden />
            <ol className="space-y-4">
              {timeline.map((event) => (
                <li key={event.key} className="relative flex gap-3 pl-5">
                  <div
                    className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-violet-500/40 bg-gray-900"
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-gray-300">{event.label}</span>
                      {event.source && <SourceBadge source={event.source} />}
                      {event.report?.sourceVersion && (
                        <span className="text-[10px] text-gray-500">{event.report.sourceVersion}</span>
                      )}
                    </div>
                    {event.details && <p className="mt-0.5 text-xs text-gray-500">{event.details}</p>}
                    {event.report && (
                      <p className="mt-0.5 text-xs text-gray-500">
                        {submittedItemsLabel(event.report.submittedItems)} · Assessment coverage unknown
                      </p>
                    )}
                    {event.time ? (
                      <time
                        dateTime={event.time}
                        title={formatDateTime(event.time, "long")}
                        className="mt-0.5 block text-[10px] text-gray-500"
                      >
                        {formatDateTime(event.time)}
                      </time>
                    ) : (
                      <span className="mt-0.5 block text-[10px] text-gray-500">Time unknown</span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}

        {olderReportsError && (
          <p className="mt-4 text-xs text-amber-400/90" role="status">
            Older reports couldn’t be loaded. The reports above are unchanged.
          </p>
        )}

        {query.isRefetchError && !olderReportsError && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-xs text-amber-400/90" role="status">
              The report history couldn’t be refreshed. Showing the previous result.
            </p>
            <Button variant="outline" size="sm" onClick={() => void query.refetch()} disabled={query.isFetching}>
              <RefreshCw className={cn("mr-2 h-3.5 w-3.5", query.isFetching && "animate-spin")} aria-hidden />
              Retry refresh
            </Button>
          </div>
        )}

        {query.hasNextPage && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            disabled={query.isFetchingNextPage}
            onClick={() => void loadOlderReports()}
          >
            {query.isFetchingNextPage
              ? "Loading…"
              : olderReportsError
              ? "Retry older reports"
              : "Load older reports"}
          </Button>
        )}
      </section>

      {sources.length > 0 && (
        <section className="scanner-section scanner-section-padding" aria-label="Discovery sources">
          <h3 className={`${SECTION_HEADER} mb-3`}>Discovery sources</h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <SourceBadge key={source} source={source} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HostHistory;

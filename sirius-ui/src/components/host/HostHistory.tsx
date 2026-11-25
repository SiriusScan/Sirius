import { Clock, RefreshCw } from "lucide-react";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { api } from "~/utils/api";
import { SECTION_HEADER } from "~/utils/themeConstants";

interface HostHistoryProps {
  hostIp: string;
}

const buttonClass =
  "flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20 disabled:opacity-50";

export function HostHistory({ hostIp }: HostHistoryProps) {
  const query = api.host.getHostHistory.useInfiniteQuery(
    { ip: hostIp },
    {
      getNextPageParam: (lastPage) => lastPage.next_cursor,
      enabled: !!hostIp,
      staleTime: 30000,
      retry: (failures, error) =>
        error.data?.code === "INTERNAL_SERVER_ERROR" && failures < 2,
    },
  );

  if (query.isLoading) {
    return (
      <div className="scanner-section scanner-section-padding text-sm text-gray-400" role="status">
        Loading report history…
      </div>
    );
  }

  const pages = query.data?.pages ?? [];
  const code = query.error?.data?.code;
  const denied = code === "UNAUTHORIZED" || code === "FORBIDDEN";
  if (pages.length === 0 || denied || code === "NOT_FOUND") {
    return (
      <div className="scanner-section scanner-section-padding space-y-3">
        <h3 className={SECTION_HEADER}>Activity Timeline</h3>
        <p className="text-sm text-gray-300" role="status">
          {denied
            ? "You don’t have access to this host history."
            : code === "NOT_FOUND"
              ? "This host is unavailable."
              : "Accepted report history is unavailable."}
        </p>
        {!denied && code !== "NOT_FOUND" && (
          <button type="button" className={buttonClass} onClick={() => void query.refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        )}
      </div>
    );
  }

  const events = pages.flatMap((page) => page.timeline);
  const reports = events.filter((event) => event.event_type === "report_accepted");
  const discovery = events.find((event) => event.event_type === "host_discovery");
  const timeline = discovery ? [...reports, discovery] : reports;
  const sources = Array.from(new Set(pages.flatMap((page) => page.sources)));

  return (
    <div className="space-y-4">
      <div className="scanner-section scanner-section-padding">
        <h3 className={`${SECTION_HEADER} mb-4`}>Activity Timeline</h3>

        {reports.length === 0 && (
          <p className="mb-3 text-sm text-gray-400">No accepted reports recorded for this host.</p>
        )}

        <ul className="space-y-3">
          {timeline.map((event) => (
            <li key={event.id} className="rounded border border-violet-500/15 bg-gray-900/50 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-200">
                  {event.event_type === "report_accepted" ? "Report accepted" : "Host discovered"}
                </span>
                {event.report && event.source && <SourceBadge source={event.source} />}
                {event.report?.source_version && (
                  <span className="text-xs text-gray-400">{event.report.source_version}</span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <HistoryTime value={event.timestamp} />
              </div>
              {event.report && (
                <div className="mt-2 space-y-1 text-xs text-gray-400">
                  <p>
                    Submitted items{event.report.submitted_item_count === null
                      ? " unknown"
                      : ` ${event.report.submitted_item_count.toLocaleString()}`}
                  </p>
                  <p>Assessment coverage unknown</p>
                </div>
              )}
            </li>
          ))}
        </ul>

        {query.isRefetchError && (
          <div className="mt-3 flex items-center gap-2">
            <p className="text-xs text-amber-300" role="status">
              The report journal could not be refreshed.
            </p>
            <button type="button" className={buttonClass} onClick={() => void query.refetch()}>
              Retry refresh
            </button>
          </div>
        )}
        {query.hasNextPage && (
          <button
            type="button"
            className={`${buttonClass} mt-4`}
            disabled={query.isFetchingNextPage}
            onClick={() => void query.fetchNextPage()}
          >
            {query.isFetchingNextPage ? "Loading…" : "Load older reports"}
          </button>
        )}
      </div>

      {sources.length > 0 && (
        <div className="scanner-section scanner-section-padding">
          <h3 className={`${SECTION_HEADER} mb-3`}>Report Sources</h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => <SourceBadge key={source} source={source} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryTime({ value }: { value: string | null }) {
  if (!value) return "Time unknown";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Time unknown";
  return <time dateTime={value}>{date.toLocaleString()}</time>;
}

export default HostHistory;

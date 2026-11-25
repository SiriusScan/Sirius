/**
 * LogDashboard — System Monitor › Logs: the centralized application log
 * (GET /api/v1/logs through the session-authenticated `api.logs` router).
 *
 * Fixed for R11 ("logs tab safe"): the service and level lists used to read
 * `logs` before it was declared, which threw on every render and took the
 * whole app down. Filters now reset paging, search is debounced, and
 * loading, empty and error states are explicit. The page's Refresh and its
 * 5 s auto-refresh cover this tab, so it has no refresh button of its own.
 */

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, AlertTriangle, Bug, FileText, Info, RefreshCw, Search, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/lib/ui/table";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Skeleton } from "~/components/lib/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import { severityColors } from "~/components/shared/severity";
import { AUTO_REFRESH_MS } from "~/components/system-monitor/useSystemStatus";
import { formatDateTime } from "~/utils/formatDateTime";
import type { LogEntry, LogStatsResponse } from "~/services/logService";
import { api } from "~/utils/api";

interface LogDashboardProps {
  className?: string;
}

const PAGE_SIZE = 50;
const ALL = "all";
const LEVELS = ["error", "warn", "info", "debug"] as const;
const LEVEL_LABELS: Record<string, string> = { error: "Error", warn: "Warning", info: "Info", debug: "Debug" };

function useDebounced<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

function LevelTag({ level }: { level: string }) {
  const Icon =
    level === "error" ? AlertCircle : level === "warn" ? AlertTriangle : level === "debug" ? Bug : Info;
  const colors =
    level === "error"
      ? severityColors("high")
      : level === "warn"
      ? severityColors("medium")
      : level === "info"
      ? severityColors("info")
      : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium ring-1",
        colors ? [colors.bg, colors.text, colors.ring] : "bg-gray-800 text-gray-400 ring-gray-700",
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {LEVEL_LABELS[level] ?? level}
    </span>
  );
}

function metadataText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[object]";
    }
  }
  return String(value);
}

function StatTile({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="scanner-section p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={cn("mt-2 text-2xl font-bold tabular-nums text-white", className)}>
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

export const LogDashboard: React.FC<LogDashboardProps> = ({ className }) => {
  const [offset, setOffset] = useState(0);
  const [serviceFilter, setServiceFilter] = useState<string>(ALL);
  const [levelFilter, setLevelFilter] = useState<string>(ALL);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const search = useDebounced(searchQuery.trim(), 300);

  // A new filter starts from the first page.
  useEffect(() => {
    setOffset(0);
  }, [serviceFilter, levelFilter, search]);

  const listInput = useMemo(
    () => ({
      limit: PAGE_SIZE,
      offset,
      service: serviceFilter === ALL ? undefined : serviceFilter,
      level: levelFilter === ALL ? undefined : levelFilter,
      search: search || undefined,
    }),
    [offset, serviceFilter, levelFilter, search],
  );

  const logsQuery = api.logs.list.useQuery(listInput, {
    refetchInterval: AUTO_REFRESH_MS,
    keepPreviousData: true,
    retry: 1,
  });
  const statsQuery = api.logs.stats.useQuery(undefined, {
    refetchInterval: AUTO_REFRESH_MS,
    keepPreviousData: true,
    retry: 1,
  });

  const logs = useMemo(() => (logsQuery.data?.logs ?? []) as LogEntry[], [logsQuery.data]);
  const total = logsQuery.data?.total ?? 0;
  const stats = statsQuery.data as LogStatsResponse | null | undefined;

  // Every service the log store knows, plus any on this page.
  const services = useMemo(() => {
    const names = new Set<string>(Object.keys(stats?.service_stats ?? {}));
    logs.forEach((log) => log.service && names.add(log.service));
    if (serviceFilter !== ALL) names.add(serviceFilter);
    return [...names].sort();
  }, [stats, logs, serviceFilter]);

  const filtersActive = serviceFilter !== ALL || levelFilter !== ALL || searchQuery.trim() !== "";
  const clearFilters = () => {
    setServiceFilter(ALL);
    setLevelFilter(ALL);
    setSearchQuery("");
  };

  const firstShown = total === 0 ? 0 : offset + 1;
  const lastShown = Math.min(offset + logs.length, total);

  let table: React.ReactNode;
  if (logsQuery.data) {
    table =
      logs.length === 0 ? (
        <EmptyState
          variant="no-data"
          size="compact"
          framed={false}
          icon={FileText}
          title={filtersActive ? "No log entries match these filters" : "No log entries yet"}
          reason={
            filtersActive
              ? "Try another service, level or search."
              : "Sirius services write here as they run."
          }
          primary={filtersActive ? { label: "Clear filters", icon: X, onClick: clearFilters } : undefined}
        />
      ) : (
        <>
          <div className="rounded-md border border-violet-500/10">
            <Table>
              <TableHeader>
                <TableRow className="border-violet-500/20 hover:bg-transparent">
                  <TableHead className="w-44">Time</TableHead>
                  <TableHead className="w-24">Level</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Component</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => {
                  const metadata = log.metadata ? Object.entries(log.metadata) : [];
                  return (
                    <TableRow key={log.id ?? `${log.timestamp}-${index}`} className="border-violet-500/10">
                      <TableCell
                        className="whitespace-nowrap text-xs tabular-nums text-gray-300"
                        title={formatDateTime(log.timestamp, "long")}
                      >
                        {formatDateTime(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <LevelTag level={String(log.level ?? "")} />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-300">{log.service}</TableCell>
                      <TableCell className="font-mono text-xs text-gray-400">{log.subcomponent}</TableCell>
                      <TableCell>
                        <div className="max-w-xl truncate text-sm text-gray-100" title={log.message}>
                          {log.message}
                        </div>
                        {metadata.length > 0 && (
                          <div className="mt-1 truncate text-[11px] text-gray-500">
                            {metadata.slice(0, 2).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {metadataText(value)}
                              </span>
                            ))}
                            {metadata.length > 2 && "…"}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Showing {firstShown.toLocaleString("en-US")}–{lastShown.toLocaleString("en-US")} of{" "}
              {total.toLocaleString("en-US")}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                disabled={offset === 0 || logsQuery.isFetching}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + PAGE_SIZE)}
                disabled={offset + PAGE_SIZE >= total || logsQuery.isFetching}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      );
  } else if (logsQuery.isLoading) {
    table = (
      <div className="space-y-2" aria-busy="true" aria-label="Loading log entries">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full bg-gray-800/60" />
        ))}
      </div>
    );
  } else {
    table = (
      <EmptyState
        variant="error"
        size="compact"
        framed={false}
        title="Couldn't load log entries"
        reason={logsQuery.error?.message || "The log service didn't answer."}
        primary={{
          label: logsQuery.isFetching ? "Retrying…" : "Retry",
          icon: RefreshCw,
          onClick: () => void logsQuery.refetch(),
        }}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatTile label="Total entries" value={stats.total_logs ?? 0} />
          <StatTile label="Services" value={Object.keys(stats.service_stats ?? {}).length} />
          <StatTile label="Errors" value={stats.level_stats?.error ?? 0} className={severityColors("high").text} />
          <StatTile label="Warnings" value={stats.level_stats?.warn ?? 0} className={severityColors("medium").text} />
        </div>
      )}

      <section className="scanner-section p-4" aria-label="Log entries">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,12rem)_minmax(0,10rem)_minmax(0,1fr)_auto] md:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400">Service</span>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger aria-label="Service">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400">Level</span>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger aria-label="Level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All levels</SelectItem>
                {LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {LEVEL_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium text-gray-400">Search</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-2.5 top-3 h-4 w-4 text-gray-500" aria-hidden />
              <Input
                placeholder="Search messages"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </span>
          </label>

          <Button variant="outline" onClick={clearFilters} disabled={!filtersActive}>
            Clear filters
          </Button>
        </div>

        {logsQuery.data && logsQuery.error && (
          <p className="mb-2 text-xs text-amber-400/90">
            Last refresh failed: {logsQuery.error.message}. Showing the previous entries.
          </p>
        )}
        {table}
      </section>
    </div>
  );
};

export default LogDashboard;

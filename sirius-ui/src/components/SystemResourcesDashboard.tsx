/**
 * SystemResourcesDashboard — System Monitor › Resources: per-container CPU,
 * memory, network, disk and collector uptime as each container's system
 * monitor observed them.
 *
 * Reads the same `system.status` query as the Services tab (one source), so
 * a container shows the same numbers on both tabs. Each collector's
 * telemetry state is shown as is: fresh rows show their readings, stale rows
 * keep their last readings (dimmed, out of the totals), and missing, invalid
 * or unreadable collectors show no numbers at all. A reading the collector
 * didn't take reads "—"; a measured zero reads 0. An empty or failed source
 * shows an EmptyState with a next step instead of a spinner.
 *
 * The restart action and per-container log preview were removed: both
 * called the Go API from the browser without the internal API key, so they
 * always failed (401). They need server procedures before they come back.
 */

import React, { useState } from "react";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/lib/ui/table";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import { formatDateTime } from "~/utils/formatDateTime";
import { StatusPill } from "~/components/system-monitor/ServiceCard";
import {
  NOT_MEASURED_NOTE,
  formatPercent,
  telemetryBadge,
  type ServiceStatusRow,
  type SystemStatus,
} from "~/components/system-monitor/systemStatus";
import { useSystemStatus } from "~/components/system-monitor/useSystemStatus";

interface SystemResourceProps {
  className?: string;
}

const EMPTY = "—";

function Tile({ label, value, detail, title }: { label: string; value: string; detail?: string; title?: string }) {
  return (
    <div className="scanner-section p-4" title={title}>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-2 truncate text-2xl font-bold tabular-nums text-white">{value}</p>
      {detail && <p className="mt-0.5 truncate text-xs text-gray-500">{detail}</p>}
    </div>
  );
}

/** A thin usage bar; neutral violet, since usage isn't a severity. */
function UsageBar({ percent }: { percent: number }) {
  const width = Math.max(0, Math.min(100, percent));
  return (
    <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-gray-800" aria-hidden>
      <div className="h-full rounded-full bg-violet-500/70" style={{ width: `${width}%` }} />
    </div>
  );
}

function telemetryPill(service: ServiceStatusRow) {
  const badge = telemetryBadge(service);
  const observedAt = service.container?.observedAt;
  return (
    <span title={observedAt ? `Last observed ${formatDateTime(observedAt, "long")}` : undefined}>
      <StatusPill label={badge.label} tone={badge.tone} />
    </span>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-0.5 text-sm tabular-nums text-gray-200">{value}</dd>
    </div>
  );
}

function ContainerRow({
  service,
  expanded,
  onToggle,
}: {
  service: ServiceStatusRow;
  expanded: boolean;
  onToggle: () => void;
}) {
  const c = service.container;
  const stale = c?.telemetry === "stale";
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <>
      <TableRow
        className={cn("border-violet-500/10", c && "cursor-pointer")}
        onClick={c ? onToggle : undefined}
        aria-expanded={c ? expanded : undefined}
      >
        <TableCell className="font-mono text-sm text-gray-100">
          <span className="flex items-center gap-2">
            {c ? (
              <button
                type="button"
                aria-label={`${expanded ? "Hide" : "Show"} details for ${service.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle();
                }}
                className="rounded text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                <Chevron className="h-4 w-4" aria-hidden />
              </button>
            ) : (
              <span className="w-4" aria-hidden />
            )}
            {service.id}
          </span>
        </TableCell>
        <TableCell>{telemetryPill(service)}</TableCell>
        <TableCell
          title={c?.cpuPercent === null ? NOT_MEASURED_NOTE : undefined}
          className={cn(stale && "opacity-60")}
        >
          {c?.cpuPercent != null ? (
            <>
              <span className="tabular-nums text-gray-200">{formatPercent(c.cpuPercent)}</span>
              <UsageBar percent={c.cpuPercent} />
            </>
          ) : (
            <span className="text-gray-600">{EMPTY}</span>
          )}
        </TableCell>
        <TableCell
          title={c?.memoryUsage === null ? NOT_MEASURED_NOTE : undefined}
          className={cn(stale && "opacity-60")}
        >
          {c?.memoryUsage ? (
            <>
              <span className="tabular-nums text-gray-200">{c.memoryUsage}</span>
              {c.memoryPercent !== null && (
                <span className="ml-1.5 text-xs tabular-nums text-gray-500">{formatPercent(c.memoryPercent)}</span>
              )}
              {c.memoryPercent !== null && <UsageBar percent={c.memoryPercent} />}
            </>
          ) : (
            <span className="text-gray-600">{EMPTY}</span>
          )}
        </TableCell>
        <TableCell className={cn("font-mono text-xs text-gray-300", stale && "opacity-60")}>{c?.networkIO ?? EMPTY}</TableCell>
        <TableCell className={cn("font-mono text-xs text-gray-300", stale && "opacity-60")}>{c?.diskUsed ?? EMPTY}</TableCell>
        <TableCell className={cn("font-mono text-xs text-gray-300", stale && "opacity-60")}>{c?.uptime ? c.uptime : EMPTY}</TableCell>
      </TableRow>
      {c && expanded && (
        <TableRow className="border-violet-500/10 bg-gray-900/40 hover:bg-gray-900/40">
          <TableCell colSpan={7} className="px-10 py-3">
            <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <Detail
                label={stale ? "Last observed (stale)" : "Observed"}
                value={<span title={formatDateTime(c.observedAt, "long")}>{formatDateTime(c.observedAt)}</span>}
              />
              <Detail label="Processes" value={c.processCount ?? EMPTY} />
              <Detail label="File descriptors" value={c.fileDescriptors ?? EMPTY} />
              <Detail
                label="Host load (1, 5, 15 min)"
                value={
                  c.loadAverage
                    ? `${c.loadAverage.m1.toFixed(2)} · ${c.loadAverage.m5.toFixed(2)} · ${c.loadAverage.m15.toFixed(2)}`
                    : EMPTY
                }
              />
              <Detail label="Block I/O" value={<span className="font-mono text-xs">{c.blockIO ?? EMPTY}</span>} />
            </dl>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function ResourcesContent({ status }: { status: SystemStatus }) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const { containers } = status;
  const totals = containers.totals;
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const total = status.services.length;
  const notice =
    containers.reporting === 0
      ? "No collector has a fresh observation. Showing last observations; current totals are unavailable."
      : containers.reporting < total
      ? "Totals include only collectors with fresh observations."
      : null;

  return (
    <div className="space-y-4">
      {notice && (
        <p role="status" className="text-xs text-amber-400/90">
          {notice}
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile
          label="Containers reporting"
          value={`${containers.reporting} of ${total}`}
          detail={[
            `${totals.running} running`,
            containers.stale > 0 ? `${containers.stale} stale` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
          title={
            containers.freshnessSeconds
              ? `Fresh means observed in the last ${containers.freshnessSeconds} s.`
              : undefined
          }
        />
        <Tile
          label="Peak CPU"
          value={formatPercent(totals.peakCpuPercent)}
          detail={totals.peakCpuPercent === null ? "No fresh CPU reading" : "Highest fresh reading"}
        />
        <Tile
          label="Memory"
          value={totals.observedMemory ?? EMPTY}
          detail={totals.observedMemory === null ? "No fresh memory reading" : "Sum of fresh readings"}
        />
        <Tile
          label="Latest observation"
          value={containers.latestObservedAt ? formatDateTime(containers.latestObservedAt) : EMPTY}
          title={containers.latestObservedAt ? formatDateTime(containers.latestObservedAt, "long") : undefined}
          detail={`Checked ${formatDateTime(status.checkedAt)}`}
        />
      </div>

      <section className="scanner-section p-4" aria-label="Container resources">
        <Table>
          <TableHeader>
            <TableRow className="border-violet-500/20 hover:bg-transparent">
              <TableHead>Container</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>CPU</TableHead>
              <TableHead>Memory</TableHead>
              <TableHead>Network I/O</TableHead>
              <TableHead>Disk used</TableHead>
              <TableHead>Collector uptime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status.services.map((service) => (
              <ContainerRow
                key={service.id}
                service={service}
                expanded={expanded.has(service.id)}
                onToggle={() => toggle(service.id)}
              />
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function ResourcesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading container resources">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 bg-gray-800/60" />
        ))}
      </div>
      <Skeleton className="h-64 bg-gray-800/60" />
    </div>
  );
}

export interface SystemResourcesViewProps {
  status: SystemStatus | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error?: { message: string } | null;
  onRetry: () => void;
  className?: string;
}

/** The Resources tab for one `system.status` result (presentational). */
export function SystemResourcesView({ status, isLoading, isFetching, error, onRetry, className }: SystemResourcesViewProps) {
  const retry = { label: isFetching ? "Retrying…" : "Retry", icon: RefreshCw, onClick: onRetry };

  let content: React.ReactNode;
  if (status) {
    if (!status.containers.ok) {
      content = (
        <EmptyState
          variant="error"
          title="Container metrics unavailable"
          reason={status.containers.message ?? "The API couldn't read container metrics."}
          primary={retry}
        />
      );
    } else if (status.containers.observed === 0) {
      content = (
        <EmptyState
          variant="no-data"
          title="No container metrics yet"
          reason="Each Sirius container runs a system monitor that reports CPU, memory and uptime to Valkey every 5 s. None has reported yet."
          primary={{ ...retry, label: isFetching ? "Checking…" : "Check again" }}
        />
      );
    } else {
      content = <ResourcesContent status={status} />;
    }
  } else if (isLoading) {
    content = <ResourcesSkeleton />;
  } else {
    content = (
      <EmptyState
        variant="error"
        title="Couldn't load container resources"
        reason={error?.message ?? "The status service didn't answer."}
        primary={retry}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {status && error && (
        <p className="text-xs text-amber-400/90">
          Last refresh failed: {error.message}. Showing the previous result.
        </p>
      )}
      {content}
    </div>
  );
}

export const SystemResourcesDashboard: React.FC<SystemResourceProps> = ({ className }) => {
  const query = useSystemStatus();
  return (
    <SystemResourcesView
      status={query.data}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      error={query.error}
      onRetry={() => void query.refetch()}
      className={className}
    />
  );
};

export default SystemResourcesDashboard;

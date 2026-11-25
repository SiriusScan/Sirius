/**
 * ServiceCard — one Sirius service on System Monitor › Services (R11):
 * name, role, a "Running · healthy" badge from its health probe, and CPU,
 * memory and collector uptime from its container's monitor. Missing halves
 * are said plainly ("No container metrics", "Not checked"); a stale
 * observation says when it was taken; nothing stays "loading".
 */

import React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import { formatDateTime } from "~/utils/formatDateTime";
import {
  NOT_MEASURED,
  NOT_MEASURED_NOTE,
  formatPercent,
  serviceBadge,
  type ServiceStatusRow,
  type StatusTone,
} from "./systemStatus";

export const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  ok: { pill: "border-green-500/30 bg-green-500/10 text-green-400", dot: "bg-green-400" },
  warn: { pill: "border-amber-500/30 bg-amber-500/10 text-amber-400", dot: "bg-amber-400" },
  bad: { pill: "border-red-500/30 bg-red-500/10 text-red-400", dot: "bg-red-400" },
  muted: { pill: "border-gray-600/50 bg-gray-800/60 text-gray-400", dot: "bg-gray-500" },
};

export function StatusPill({ label, tone, className }: { label: string; tone: StatusTone; className?: string }) {
  const classes = TONE_CLASSES[tone];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium",
        classes.pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", classes.dot)} aria-hidden />
      {label}
    </span>
  );
}

function Metric({ label, value, title }: { label: string; value: string; title?: string }) {
  return (
    <span className="whitespace-nowrap" title={title}>
      <span className="text-gray-500">{label}</span>{" "}
      <span className="font-medium tabular-nums text-gray-200">{value}</span>
    </span>
  );
}

export interface ServiceCardProps {
  service: ServiceStatusRow;
  /** False when the health probe as a whole didn't answer (the banner says so). */
  healthAnswered: boolean;
  onRetry: () => void;
  retrying?: boolean;
  className?: string;
}

export function ServiceCard({ service, healthAnswered, onRetry, retrying, className }: ServiceCardProps) {
  const badge = serviceBadge(service);
  const { container, probe } = service;
  // The probe answered for the system but said nothing about this service.
  const missingProbe = healthAnswered && !probe;

  return (
    <article
      aria-label={service.id}
      data-service={service.id}
      data-state={service.state}
      className={cn("scanner-section flex min-w-0 flex-col gap-1.5 p-4", className)}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <h3 className="truncate font-mono text-sm font-bold text-white" title={service.id}>
          {service.id}
        </h3>
        <StatusPill label={badge.label} tone={badge.tone} />
      </div>

      {service.role && <p className="truncate text-xs text-gray-400">{service.role}</p>}

      {service.state === "down" && probe?.message && (
        <p className="line-clamp-2 break-words text-xs text-red-300/90" title={probe.message}>
          {probe.message}
        </p>
      )}

      {container ? (
        <div className="mt-auto space-y-1 pt-1">
          {container.telemetry === "stale" && (
            <p className="text-[11px] text-amber-400/90" title={formatDateTime(container.observedAt, "long")}>
              Stale observation · last observed {formatDateTime(container.observedAt)}
            </p>
          )}
          <div
            className={cn(
              "flex flex-wrap gap-x-3 gap-y-1 text-[11px]",
              container.telemetry === "stale" && "opacity-60",
            )}
          >
            <Metric
              label="CPU"
              value={formatPercent(container.cpuPercent)}
              title={container.cpuPercent === null ? NOT_MEASURED_NOTE : undefined}
            />
            <Metric
              label="Memory"
              value={container.memoryUsage ?? NOT_MEASURED}
              title={container.memoryUsage === null ? NOT_MEASURED_NOTE : undefined}
            />
            {container.uptime && <Metric label="Up" value={container.uptime} title="Collector uptime" />}
          </div>
        </div>
      ) : (
        <p className="mt-auto pt-1 text-[11px] text-gray-500">
          {service.telemetry === "invalid"
            ? "No container metrics: the last report was invalid"
            : service.telemetry === "unavailable"
            ? "No container metrics: telemetry unavailable"
            : "No container metrics"}
        </p>
      )}

      {missingProbe && (
        <EmptyState
          variant="error"
          size="compact"
          framed={false}
          className="mt-2 rounded-md border border-red-500/20 bg-red-500/5 py-3"
          title="No health result"
          reason="The health probe answered but didn't include this service."
          primary={{ label: retrying ? "Retrying…" : "Retry", icon: RefreshCw, onClick: onRetry }}
        />
      )}
    </article>
  );
}

export default ServiceCard;

/**
 * ServicesTab — System Monitor › Services (R11): a summary banner
 * ("6 of 6 services running and healthy"), one card per service, and recent
 * system issues. Every card reads the same `system.status` query, so the
 * banner and the cards can't disagree.
 */

import React from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { EmptyState } from "~/components/shared/EmptyState";
import { formatDateTime } from "~/utils/formatDateTime";
import { ServiceCard } from "./ServiceCard";
import { RecentSystemIssues } from "./RecentSystemIssues";
import {
  SERVICE_CATALOG,
  summaryLine,
  summaryTone,
  type StatusTone,
  type SystemStatus,
} from "./systemStatus";
import { AUTO_REFRESH_LABEL, useSystemStatus } from "./useSystemStatus";

const BANNER_TONE: Record<StatusTone, { frame: string; icon: string; Icon: typeof CheckCircle2 }> = {
  ok: { frame: "border-green-500/25 bg-green-500/[0.06]", icon: "text-green-400", Icon: CheckCircle2 },
  warn: { frame: "border-amber-500/25 bg-amber-500/[0.06]", icon: "text-amber-400", Icon: AlertTriangle },
  bad: { frame: "border-red-500/25 bg-red-500/[0.06]", icon: "text-red-400", Icon: XCircle },
  muted: { frame: "border-violet-500/20 bg-gray-900/20", icon: "text-gray-400", Icon: AlertTriangle },
};

function RetryButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-violet-500/20 px-2.5 py-1 text-xs text-gray-200 transition-colors hover:bg-violet-500/10 disabled:opacity-60"
    >
      <RefreshCw className={cn("h-3.5 w-3.5", busy && "animate-spin")} aria-hidden />
      {busy ? "Retrying…" : "Retry"}
    </button>
  );
}

function StatusBanner({
  status,
  refreshError,
  onRetry,
  busy,
}: {
  status: SystemStatus;
  refreshError?: string;
  onRetry: () => void;
  busy: boolean;
}) {
  const tone = BANNER_TONE[summaryTone(status)];
  const updated = formatDateTime(status.checkedAt, "long");
  const noMetrics = !status.containers.ok || status.containers.observed === 0;
  const onlyStale = !noMetrics && status.containers.reporting === 0;

  return (
    <div className={cn("rounded-lg border px-4 py-3", tone.frame)} role="status" aria-live="polite">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <div className="flex min-w-[16rem] flex-1 items-center gap-2">
          <tone.Icon className={cn("h-4 w-4 shrink-0", tone.icon)} aria-hidden />
          <p className="min-w-0 text-sm font-medium text-white">
            {status.health.ok ? summaryLine(status.summary) : "The health probe didn't answer"}
          </p>
        </div>
        <p className="text-[11px] text-gray-400">
          Container status plus health probe · Updated {updated} · {AUTO_REFRESH_LABEL}
        </p>
        {(!status.health.ok || refreshError) && <RetryButton onClick={onRetry} busy={busy} />}
      </div>
      {!status.health.ok && status.health.message && (
        <p className="mt-1.5 pl-6 text-xs text-red-300/90">{status.health.message}</p>
      )}
      {noMetrics && (
        <p className="mt-1.5 pl-6 text-xs text-gray-400">
          {status.containers.ok
            ? "No container has reported CPU, memory or uptime yet. The system monitor in each container sends them to Valkey."
            : `Container metrics are unavailable. ${status.containers.message ?? ""}`.trim()}
        </p>
      )}
      {onlyStale && (
        <p className="mt-1.5 pl-6 text-xs text-amber-400/90">
          No container has a fresh observation. The cards show each one's last observation.
        </p>
      )}
      {refreshError && (
        <p className="mt-1.5 pl-6 text-xs text-amber-400/90">
          Last refresh failed: {refreshError}. Showing the previous result.
        </p>
      )}
    </div>
  );
}

/** Lets a short last row fill the width on wide screens (6 cards = 4 + 2). */
function lastRowSpan(index: number, count: number): string | undefined {
  const remainder = count % 4;
  if (remainder === 0 || index < count - remainder) return undefined;
  if (remainder === 2) return "xl:col-span-2";
  if (remainder === 1) return "xl:col-span-4";
  return undefined;
}

function ServicesSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading service status">
      <Skeleton className="h-12 w-full bg-gray-800/60" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SERVICE_CATALOG.map((service, i) => (
          <div
            key={service.id}
            className={cn("scanner-section space-y-2 p-4", lastRowSpan(i, SERVICE_CATALOG.length))}
          >
            <div className="flex justify-between gap-2">
              <Skeleton className="h-4 w-28 bg-gray-800/70" />
              <Skeleton className="h-4 w-24 bg-gray-800/70" />
            </div>
            <Skeleton className="h-3 w-32 bg-gray-800/70" />
            <Skeleton className="h-3 w-44 bg-gray-800/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

export interface ServicesStatusSectionProps {
  status: SystemStatus | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error?: { message: string } | null;
  onRetry: () => void;
}

/** The banner and service cards for one `system.status` result (presentational). */
export function ServicesStatusSection({ status, isLoading, isFetching, error, onRetry }: ServicesStatusSectionProps) {
  const busy = isFetching;
  if (status) {
    const healthAnswered = status.health.ok;
    if (!healthAnswered && status.containers.observed === 0) {
      // Nothing to show per service: one section-level error.
      return (
        <EmptyState
          variant="error"
          title="Couldn't check the services"
          reason={
            status.health.message
              ? `The health probe didn't answer: ${status.health.message}`
              : "The health probe didn't answer and no container reported metrics."
          }
          primary={{ label: busy ? "Retrying…" : "Retry", icon: RefreshCw, onClick: onRetry }}
        />
      );
    }
    return (
      <>
        <StatusBanner status={status} refreshError={error?.message} onRetry={onRetry} busy={busy} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {status.services.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              healthAnswered={healthAnswered}
              onRetry={onRetry}
              retrying={busy}
              className={lastRowSpan(i, status.services.length)}
            />
          ))}
        </div>
      </>
    );
  }
  if (isLoading) return <ServicesSkeleton />;
  return (
    <EmptyState
      variant="error"
      title="Couldn't load service status"
      reason={error?.message ? error.message : "The status service didn't answer. The rest of Sirius still works."}
      primary={{ label: busy ? "Retrying…" : "Retry", icon: RefreshCw, onClick: onRetry }}
    />
  );
}

export function ServicesTab() {
  const query = useSystemStatus();
  return (
    <div className="space-y-4">
      <ServicesStatusSection
        status={query.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        onRetry={() => void query.refetch()}
      />
      <RecentSystemIssues />
    </div>
  );
}

export default ServicesTab;

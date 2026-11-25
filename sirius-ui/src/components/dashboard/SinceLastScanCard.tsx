/**
 * SinceLastScanCard (R01) — the Dashboard's headline: when the last scan
 * finished, and the hero stats read from `useSummaryStats()` (ADR-2): hosts,
 * open findings and the highest risk (ADR-3, the server's 0–10 score).
 *
 * The mockup's deltas ("+1 new", "Fixed since last scan") need snapshot
 * history the API does not have, so they are left out. The notes shown are
 * the last scan's own counts, labelled as such.
 */

import React from "react";
import { Clock } from "lucide-react";
import { cn } from "~/components/lib/utils";
import type { SummaryStats } from "~/types/riskSummary";
import { riskBandLabel } from "~/utils/riskBand";
import { severityColors } from "~/components/shared/severity";
import { hostHref } from "~/components/shared/HostCell";
import { PanelLink } from "./DashboardPanel";
import { hostLabel, lastScanHeading, lastScanMeta, lastScanNote } from "./dashboardModel";

function Stat({
  label,
  value,
  note,
  link,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  link?: { href: string; label: string };
  valueClassName?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-lg border border-violet-500/15 bg-gray-950/30 px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1 flex min-w-0 items-baseline gap-2">
        <span className={cn("text-2xl font-bold leading-8 tabular-nums text-white", valueClassName)}>{value}</span>
        {note && <span className="min-w-0 truncate text-xs text-gray-400">{note}</span>}
      </div>
      {link && (
        <div className="mt-1">
          <PanelLink href={link.href}>{link.label}</PanelLink>
        </div>
      )}
    </div>
  );
}

export function SinceLastScanCard({ summary }: { summary: SummaryStats }) {
  const { lastScan, highestRisk } = summary;
  const heading = lastScanHeading(lastScan);
  const meta = lastScanMeta(lastScan);
  const fmt = (n: number) => n.toLocaleString("en-US");

  const riskText =
    highestRisk && highestRisk.riskBand !== "none"
      ? severityColors(highestRisk.riskBand).text
      : "text-gray-400";

  return (
    <section aria-label={heading.title} className="scanner-section p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <h2 className="flex min-w-0 items-start gap-2 text-sm font-semibold text-white">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          <span className="min-w-0">
            {heading.title}
            {heading.when && <span className="font-normal text-gray-300"> · {heading.when}</span>}
          </span>
        </h2>
        {meta && (
          <span
            className="truncate text-xs text-gray-500"
            title={lastScan?.targets?.length ? lastScan.targets.join(", ") : undefined}
          >
            {meta}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Hosts"
          value={fmt(summary.hosts.total)}
          note={lastScanNote(lastScan, lastScan?.hostsFound)}
          link={{ href: "/environment", label: "Open Environment" }}
        />
        <Stat
          label="Open findings"
          value={fmt(summary.findings.open)}
          note={lastScanNote(lastScan, lastScan?.findings)}
          link={{ href: "/vulnerabilities", label: "Review findings" }}
        />
        {highestRisk ? (
          <Stat
            label="Highest risk"
            value={highestRisk.riskScore.toFixed(1)}
            valueClassName={riskText}
            note={
              <span title={highestRisk.riskCve ? `Set by ${highestRisk.riskCve}` : undefined}>
                <span className={riskText}>{riskBandLabel(highestRisk.riskBand)}</span>
                <span className="text-gray-400"> · {hostLabel(highestRisk)}</span>
              </span>
            }
            link={{ href: hostHref(highestRisk.ip), label: "Open host" }}
          />
        ) : (
          <Stat
            label="Highest risk"
            value="—"
            valueClassName="text-gray-500"
            note={summary.findings.open > 0 ? "No finding has a score" : "No open findings"}
          />
        )}
      </div>
    </section>
  );
}

export default SinceLastScanCard;

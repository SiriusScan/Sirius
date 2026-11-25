/**
 * FixTheseFirstCard (R01) — the summary's top open findings, highest CVSS
 * first (`summary.topFindings`, ADR-2): CVE, severity, CVSS with a small
 * bar, the clean summary (ADR-4) and how many hosts it is open on. Each
 * row opens the CVE page.
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Wrench } from "lucide-react";
import { cn } from "~/components/lib/utils";
import type { TopFinding } from "~/types/riskSummary";
import { getCvssBarColor, getCvssTextColor } from "~/utils/severityTheme";
import { SeverityTag } from "~/components/shared/SeverityTag";
import { vulnerabilityHref } from "~/components/shared/vulnTableModel";
import { DashboardPanel, PanelLink, PanelNote } from "./DashboardPanel";
import { plural } from "./dashboardModel";

function Cvss({ score }: { score: number }) {
  if (!(Number.isFinite(score) && score > 0)) return <span className="text-xs text-gray-600">—</span>;
  const value = Math.min(score, 10);
  return (
    <span className="flex items-center gap-2">
      <span className={cn("w-7 text-xs font-semibold tabular-nums", getCvssTextColor(value))}>
        {value.toFixed(1)}
      </span>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-gray-800" aria-hidden>
        <span
          className={cn("block h-full rounded-full", getCvssBarColor(value))}
          style={{ width: `${value * 10}%` }}
        />
      </span>
    </span>
  );
}

export function FixTheseFirstCard({
  findings,
  className,
}: {
  findings: readonly TopFinding[];
  className?: string;
}) {
  const router = useRouter();

  return (
    <DashboardPanel
      icon={Wrench}
      title="Fix these first"
      action={<PanelLink href="/vulnerabilities">All findings</PanelLink>}
      className={className}
    >
      {findings.length === 0 ? (
        <PanelNote>No open findings.</PanelNote>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[36rem] table-fixed text-left">
            <colgroup>
              <col className="w-36" />
              <col className="w-24" />
              <col className="w-24" />
              <col />
              <col className="w-20" />
            </colgroup>
            <thead>
              <tr className="border-b border-violet-500/10 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-1 pb-2 font-semibold">CVE</th>
                <th scope="col" className="px-1 pb-2 font-semibold">Severity</th>
                <th scope="col" className="px-1 pb-2 font-semibold">CVSS</th>
                <th scope="col" className="px-1 pb-2 font-semibold">Summary</th>
                <th scope="col" className="px-1 pb-2 text-right font-semibold">Hosts</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => {
                const href = vulnerabilityHref(f.id);
                const hosts = f.hosts > 0 ? plural(f.hosts, "host") : undefined;
                return (
                  <tr
                    key={f.id}
                    className="cursor-pointer border-b border-violet-500/10 transition-colors last:border-0 hover:bg-violet-500/5"
                    onClick={(e) => {
                      // Let a text selection or a click on the link itself behave normally.
                      if ((e.target as HTMLElement).closest("a")) return;
                      if (window.getSelection()?.toString()) return;
                      void router.push(href);
                    }}
                  >
                    <td className="px-1 py-2.5">
                      <Link
                        href={href}
                        className="block truncate font-mono text-xs font-semibold text-white transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                        title={hosts ? `${f.id} · open on ${hosts}` : f.id}
                      >
                        {f.id}
                      </Link>
                    </td>
                    <td className="px-1 py-2.5">
                      <SeverityTag severity={f.severity} />
                    </td>
                    <td className="px-1 py-2.5">
                      <Cvss score={f.cvss} />
                    </td>
                    <td className="px-1 py-2.5">
                      {f.summary ? (
                        <span className="block truncate text-xs text-gray-300" title={f.summary}>
                          {f.summary}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">No description yet</span>
                      )}
                    </td>
                    <td className="px-1 py-2.5 text-right">
                      {hosts ? (
                        <span
                          className="inline-flex items-center rounded border border-violet-500/15 bg-gray-950/40 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-gray-400"
                          title={`Open on ${hosts}`}
                        >
                          {hosts}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardPanel>
  );
}

export default FixTheseFirstCard;

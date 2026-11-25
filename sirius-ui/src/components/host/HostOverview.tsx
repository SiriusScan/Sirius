/**
 * HostOverview (R05) — the host at a glance, every number from the server:
 *
 *   Risk            the server's 0–10 score (highest open CVSS, ADR-3) and the
 *                   CVE that sets it
 *   Open findings   severity tiles; a level opens the Vulnerabilities tab
 *                   filtered to it (counts are shown once, here)
 *   Data freshness  last scan, each source's latest report, first seen
 *   Top findings    the five highest-CVSS findings with clean summaries
 *   Open ports      ports from scan data, plus the software the scanner matched
 *   System          agent data, or one "needs the agent" state
 */

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Activity, Clock, Cpu, Gauge, ListOrdered, Network } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { RiskScore } from "~/components/shared/RiskScore";
import { SeverityStrip } from "~/components/shared/SeverityStrip";
import { SeverityTag } from "~/components/shared/SeverityTag";
import { SourceBadge } from "~/components/shared/SourceBadge";
import {
  DEFAULT_VULN_SORT,
  sortVulnRows,
  vulnerabilityHref,
  type VulnRow,
} from "~/components/shared/vulnTableModel";
import type { HostPageDataWithRisk } from "~/hooks/useHostData";
import { formatDateTime } from "~/utils/formatDateTime";
import { getCvssBarColor, getCvssTextColor } from "~/utils/severityTheme";
import { CardLink, FactRow, HostCard } from "./HostCard";
import {
  findingToVulnRow,
  hostSeverityHref,
  hostTabHref,
  lastScanDetail,
  matchedSoftware,
  plural,
  riskCaption,
  sourceName,
} from "./hostModel";
import { NeedsAgentState } from "./NeedsAgentState";
import type { AgentDataState } from "./useHostAgentData";

const TOP_FINDINGS = 5;
const PORTS_SHOWN = 6;
const SOFTWARE_SHOWN = 4;

interface HostOverviewProps {
  host: HostPageDataWithRisk;
  agent: AgentDataState;
}

export const HostOverview: React.FC<HostOverviewProps> = ({ host, agent }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <RiskCard host={host} className="xl:col-span-3" />
        <OpenFindingsCard host={host} className="md:order-last md:col-span-2 xl:order-none xl:col-span-6" />
        <FreshnessCard host={host} className="xl:col-span-3" />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <TopFindingsCard host={host} className="xl:col-span-2" />
        <div className="min-w-0 space-y-4">
          <OpenPortsCard host={host} />
          <SystemCard ip={host.ip} agent={agent} />
        </div>
      </div>
    </div>
  );
};

// ─── Risk ───────────────────────────────────────────────────────────────────

function RiskCard({ host, className }: { host: HostPageDataWithRisk; className?: string }) {
  const caption = riskCaption(host);
  return (
    <HostCard icon={Gauge} title="Risk" className={className}>
      <RiskScore
        size="lg"
        score={host.riskScore}
        caption={
          <>
            <span className="block">{caption.text}</span>
            {caption.cve && (
              <span className="mt-0.5 block">
                Set by{" "}
                <Link
                  href={vulnerabilityHref(caption.cve)}
                  className="font-mono text-violet-300 transition-colors hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                >
                  {caption.cve}
                </Link>
              </span>
            )}
          </>
        }
      />
    </HostCard>
  );
}

// ─── Open findings ──────────────────────────────────────────────────────────

function OpenFindingsCard({ host, className }: { host: HostPageDataWithRisk; className?: string }) {
  const ip = host.ip;
  const getHref = useMemo(() => (s: Parameters<typeof hostSeverityHref>[1]) => hostSeverityHref(ip, s), [ip]);
  return (
    <HostCard
      icon={Activity}
      title="Open findings"
      className={className}
      note={
        host.openFindings > 0
          ? "Open findings on this host. Select a level to filter the Vulnerabilities tab."
          : "No open findings recorded on this host. Assessment coverage is unknown."
      }
    >
      <SeverityStrip
        variant="tiles"
        counts={host.counts}
        getHref={getHref}
        aria-label="Open findings by severity"
        className="grid-cols-3 sm:grid-cols-5"
      />
    </HostCard>
  );
}

// ─── Data freshness ─────────────────────────────────────────────────────────

function When({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatDateTime(iso, "long")} className="whitespace-nowrap">
      {formatDateTime(iso)}
    </time>
  );
}

function FreshnessCard({ host, className }: { host: HostPageDataWithRisk; className?: string }) {
  const { lastScan, sources } = host.freshness;
  const firstSeen = host.freshness.firstSeen ?? host.firstSeen;
  return (
    <HostCard icon={Clock} title="Data freshness" className={className}>
      <dl className="space-y-2">
        <FactRow label="Last scan">
          {lastScan ? (
            <>
              <When iso={lastScan.time} />
              <span className="text-gray-400"> · {lastScanDetail(lastScan)}</span>
            </>
          ) : (
            <span className="text-gray-500">No scan has reported on this host yet</span>
          )}
        </FactRow>
        <FactRow label="Sources">
          {sources.length > 0 ? (
            <ul className="space-y-0.5">
              {sources.map((s) => (
                <li key={s.name} className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <span className="min-w-0 break-words">{sourceName(s)}</span>
                  <span className="text-gray-400">
                    <When iso={s.lastSeen} />
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-gray-500">None yet</span>
          )}
        </FactRow>
        <FactRow label="First seen">
          {firstSeen ? <When iso={firstSeen} /> : <span className="text-gray-500">—</span>}
        </FactRow>
      </dl>
    </HostCard>
  );
}

// ─── Top findings ───────────────────────────────────────────────────────────

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

function TopFindingsCard({ host, className }: { host: HostPageDataWithRisk; className?: string }) {
  const router = useRouter();
  // Same order as the Vulnerabilities tab's table: CVSS, then severity.
  const rows = useMemo<VulnRow[]>(
    () => sortVulnRows(host.findings.map(findingToVulnRow), DEFAULT_VULN_SORT).slice(0, TOP_FINDINGS),
    [host.findings],
  );

  return (
    <HostCard
      icon={ListOrdered}
      title="Top findings"
      className={className}
      action={
        host.openFindings > 0 ? (
          <CardLink href={hostTabHref(host.ip, "vulnerabilities")}>
            All {host.openFindings.toLocaleString("en-US")}
          </CardLink>
        ) : undefined
      }
    >
      {rows.length === 0 ? (
        <p className="py-2 text-sm text-gray-400">
          No open findings recorded on this host. Assessment coverage is unknown.
        </p>
      ) : (
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[32rem] table-fixed text-left">
            <colgroup>
              <col className="w-40" />
              <col className="w-24" />
              <col className="w-24" />
              <col />
            </colgroup>
            <thead>
              <tr className="border-b border-violet-500/10 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-1 pb-2 font-semibold">CVE</th>
                <th scope="col" className="px-1 pb-2 font-semibold">Severity</th>
                <th scope="col" className="px-1 pb-2 font-semibold">CVSS</th>
                <th scope="col" className="px-1 pb-2 font-semibold">Summary</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const href = vulnerabilityHref(row.id);
                return (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-violet-500/10 transition-colors last:border-0 hover:bg-violet-500/5"
                    onClick={(e) => {
                      // Let a text selection or the link itself behave normally.
                      if ((e.target as HTMLElement).closest("a")) return;
                      if (window.getSelection()?.toString()) return;
                      void router.push(href);
                    }}
                  >
                    <td className="px-1 py-2.5">
                      <Link
                        href={href}
                        className="block truncate font-mono text-xs font-semibold text-white transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                        title={row.id}
                      >
                        {row.id}
                      </Link>
                    </td>
                    <td className="px-1 py-2.5">
                      <SeverityTag severity={row.severity} />
                    </td>
                    <td className="px-1 py-2.5">
                      <Cvss score={row.cvss} />
                    </td>
                    <td className="px-1 py-2.5">
                      {row.summary ? (
                        <span className="block truncate text-xs text-gray-300" title={row.summary}>
                          {row.summary}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">No description yet</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </HostCard>
  );
}

// ─── Open ports ─────────────────────────────────────────────────────────────

function OpenPortsCard({ host }: { host: HostPageDataWithRisk }) {
  const ports = host.openPorts;
  const software = useMemo(() => matchedSoftware(host.findings), [host.findings]);
  const anyService = ports.some((p) => Boolean(p.service) || Boolean(p.version));

  return (
    <HostCard
      icon={Network}
      title="Open ports"
      action={
        ports.length > PORTS_SHOWN ? (
          <CardLink href={hostTabHref(host.ip, "network")}>All {ports.length}</CardLink>
        ) : undefined
      }
      note={
        ports.length > 0 && !anyService
          ? "The scan records ports without service names. Software comes from the scanner's matches."
          : undefined
      }
    >
      {ports.length === 0 ? (
        <p className="py-1 text-sm text-gray-400">No open ports recorded.</p>
      ) : (
        <ul className="divide-y divide-violet-500/10">
          {ports.slice(0, PORTS_SHOWN).map((p) => {
            const service = [p.service, p.version].filter(Boolean).join(" ");
            return (
              <li key={`${p.port}/${p.protocol}`} className="flex items-center gap-3 py-1.5 text-xs">
                <span className="w-20 shrink-0 font-mono font-semibold text-white">
                  {p.port}/{p.protocol}
                </span>
                <span className="min-w-0 flex-1 truncate text-gray-400">{service}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {(p.sources ?? []).map((s) => (
                    <SourceBadge key={s} source={s} className="px-1.5 text-[10px]" />
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {software.length > 0 && (
        <div className="mt-3 border-t border-violet-500/10 pt-3">
          <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            Software the scanner matched
          </h3>
          <ul className="space-y-1">
            {software.slice(0, SOFTWARE_SHOWN).map((s) => (
              <li key={s.label} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="min-w-0 truncate text-gray-200" title={s.label}>
                  {s.label}
                </span>
                <span className="shrink-0 tabular-nums text-gray-500">{plural(s.findings, "finding")}</span>
              </li>
            ))}
            {software.length > SOFTWARE_SHOWN && (
              <li className="text-[11px] text-gray-500">
                and {plural(software.length - SOFTWARE_SHOWN, "more product")}
              </li>
            )}
          </ul>
        </div>
      )}
    </HostCard>
  );
}

// ─── System ─────────────────────────────────────────────────────────────────

function SystemCard({ ip, agent }: { ip: string; agent: AgentDataState }) {
  return (
    <HostCard
      icon={Cpu}
      title="System"
      action={
        agent.status === "present" ? (
          <CardLink href={hostTabHref(ip, "system")}>Details</CardLink>
        ) : undefined
      }
    >
      {agent.status === "loading" ? (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-3 w-2/3 bg-gray-800" />
          <Skeleton className="h-3 w-1/2 bg-gray-800" />
          <Skeleton className="h-3 w-3/5 bg-gray-800" />
        </div>
      ) : agent.status === "none" ? (
        <NeedsAgentState agentInstalled={agent.agentInstalled} />
      ) : (
        <dl className="space-y-1.5">
          <FactRow label="Packages">{agent.data.packages.toLocaleString("en-US")}</FactRow>
          <FactRow label="Users">{agent.data.users.toLocaleString("en-US")}</FactRow>
          <FactRow label="Services">
            {agent.data.services.total > 0
              ? `${agent.data.services.running} running of ${agent.data.services.total}`
              : "—"}
          </FactRow>
          {agent.data.cpuCores !== undefined && (
            <FactRow label="CPU">{plural(agent.data.cpuCores, "core")}</FactRow>
          )}
          {agent.data.memoryGb !== undefined && (
            <FactRow label="Memory">{agent.data.memoryGb.toFixed(1)} GB</FactRow>
          )}
          {agent.data.collectedAt && (
            <FactRow label="Collected">
              <When iso={agent.data.collectedAt} />
            </FactRow>
          )}
        </dl>
      )}
    </HostCard>
  );
}

export default HostOverview;

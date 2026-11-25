/**
 * HostOverview — the host's dashboard tab, every number from the server
 * (useHostData):
 *
 *   Row 1 — hero cards: Open findings · Packages + Open ports · Risk score
 *           (the server's 0–10 score: the highest open CVSS)
 *   Row 2 — left 2/3:  severity breakdown (a level opens the Vulnerabilities
 *                      tab filtered to it) and the top findings
 *           right 1/3: system summary, open ports with the service a scan
 *                      recorded, discovery sources and recent activity
 */

import React, { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock,
  Cpu,
  HardDrive,
  Network,
  Package,
  Server,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { DashboardHeroCard } from "~/components/dashboard/DashboardHeroCard";
import { cn } from "~/components/lib/utils";
import { SeverityStrip } from "~/components/shared/SeverityStrip";
import { SeverityTag } from "~/components/shared/SeverityTag";
import { SourceBadge } from "~/components/shared/SourceBadge";
import {
  DEFAULT_VULN_SORT,
  sortVulnRows,
  vulnerabilityHref,
} from "~/components/shared/vulnTableModel";
import type { HostPageDataWithRisk } from "~/hooks/useHostData";
import { formatDateTime } from "~/utils/formatDateTime";
import { riskBandLabel } from "~/utils/riskBand";
import { getCvssTextColor } from "~/utils/severityTheme";
import {
  AGENT_HREF,
  findingToVulnRow,
  hostSeverityHref,
  hostTabHref,
  lastScanDetail,
  openPortServices,
  osLabel,
  plural,
  realText,
  riskCaption,
} from "./hostModel";
import type { AgentDataState } from "./useHostAgentData";

const TOP_FINDINGS = 5;
const PORTS_SHOWN = 8;

const CARD = "rounded-lg border border-violet-500/20 bg-gray-900/50 backdrop-blur-sm";
const CARD_TITLE = "text-sm font-semibold uppercase tracking-wide text-violet-300";
const LINK =
  "flex items-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40";

interface HostOverviewProps {
  host: HostPageDataWithRisk;
  agent: AgentDataState;
}

export const HostOverview: React.FC<HostOverviewProps> = ({ host, agent }) => {
  const ports = useMemo(
    () => openPortServices(host.openPorts, host.findings),
    [host.openPorts, host.findings],
  );
  const packages = agent.status === "present" ? agent.data.packages : undefined;
  const topServices = [...new Set(ports.map((p) => realText(p.service)).filter(Boolean))].slice(0, 3);
  const caption = riskCaption(host);

  return (
    <div className="space-y-6">
      {/* ── Row 1: hero cards ─────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardHeroCard
          title="Open findings"
          value={host.openFindings.toLocaleString("en-US")}
          icon={Target}
          subtitle={
            host.openFindings > 0
              ? `${host.counts.critical} critical, ${host.counts.high} high`
              : "Assessment coverage unknown"
          }
          variant={host.counts.critical > 0 ? "critical" : "default"}
        />

        <div className="group relative overflow-hidden rounded-lg border border-violet-500/20 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-opacity-40 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 grid grid-cols-2 divide-x divide-violet-500/10">
            <HeroHalf
              icon={Package}
              title="Packages"
              value={packages?.toLocaleString("en-US") ?? "—"}
              subtitle={
                agent.status === "loading" ? "Loading…" : packages !== undefined ? "Installed" : "Needs the agent"
              }
              className="pr-5"
            />
            <HeroHalf
              icon={Network}
              title="Open ports"
              value={ports.length.toLocaleString("en-US")}
              subtitle={
                topServices.length > 0
                  ? topServices.join(", ")
                  : ports.length > 0
                    ? "Discovered services"
                    : "No open ports"
              }
              className="pl-5"
            />
          </div>
        </div>

        <DashboardHeroCard
          title="Risk score"
          value={host.openFindings > 0 ? host.riskScore.toFixed(1) : "—"}
          icon={Shield}
          subtitle={
            host.openFindings > 0 ? `${riskBandLabel(host.riskBand)} · ${caption}` : caption
          }
          variant={host.riskBand === "critical" ? "critical" : "default"}
        />
      </div>

      {/* ── Row 2 ─────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <SeverityBreakdown host={host} />
          <TopFindings host={host} />
        </div>

        <div className="min-w-0 space-y-6">
          <SystemSummary host={host} agent={agent} />
          <OpenPorts ip={host.ip} ports={ports} />
          <DiscoverySources host={host} />
          <RecentActivity host={host} />
        </div>
      </div>
    </div>
  );
};

// ─── Row 1 ──────────────────────────────────────────────────────────────────

function HeroHalf({
  icon: Icon,
  title,
  value,
  subtitle,
  className,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <span className="text-sm font-medium uppercase tracking-wide text-violet-300">
        <Icon className="mr-2 inline-block h-4 w-4" aria-hidden />
        {title}
      </span>
      <div className="mb-1 mt-3">
        <span className="text-5xl font-bold tabular-nums text-white">{value}</span>
      </div>
      <div className="truncate text-sm text-gray-400" title={subtitle}>
        {subtitle}
      </div>
    </div>
  );
}

// ─── Left column ────────────────────────────────────────────────────────────

function SeverityBreakdown({ host }: { host: HostPageDataWithRisk }) {
  const ip = host.ip;
  const getHref = useMemo(
    () => (s: Parameters<typeof hostSeverityHref>[1]) => hostSeverityHref(ip, s),
    [ip],
  );
  return (
    <section className={cn(CARD, "p-6")}>
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-violet-400" aria-hidden />
        <h2 className="text-lg font-semibold text-violet-300">Severity breakdown</h2>
      </div>
      {host.openFindings > 0 ? (
        <SeverityStrip
          variant="tiles"
          counts={host.counts}
          getHref={getHref}
          aria-label="Open findings by severity"
          className="grid-cols-3 sm:grid-cols-5"
        />
      ) : (
        <p className="flex items-center gap-2 py-4 text-sm text-gray-400">
          <Shield className="h-5 w-5 text-gray-500" aria-hidden />
          No open findings recorded. Assessment coverage is unknown.
        </p>
      )}
    </section>
  );
}

function TopFindings({ host }: { host: HostPageDataWithRisk }) {
  const router = useRouter();
  // Same order as the Vulnerabilities tab: CVSS, then severity.
  const rows = useMemo(
    () => sortVulnRows(host.findings.map(findingToVulnRow), DEFAULT_VULN_SORT).slice(0, TOP_FINDINGS),
    [host.findings],
  );

  return (
    <section className={CARD}>
      <div className="flex items-center justify-between border-b border-violet-500/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-violet-400" aria-hidden />
          <h2 className="text-lg font-semibold text-violet-300">Top findings</h2>
        </div>
        {host.openFindings > 0 && (
          <Link href={hostTabHref(host.ip, "vulnerabilities")} className={LINK}>
            View all {plural(host.openFindings, "open finding")}
            <ChevronRight className="h-3 w-3" aria-hidden />
          </Link>
        )}
      </div>

      {rows.length > 0 ? (
        <ul className="divide-y divide-gray-800/50">
          {rows.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => void router.push(vulnerabilityHref(row.id))}
                className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-gray-800/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/40"
              >
                <SeverityTag severity={row.severity} className="shrink-0" />
                <span className="shrink-0 font-mono text-xs font-semibold text-gray-200">{row.id}</span>
                <span
                  className={cn("min-w-0 flex-1 truncate text-xs", row.summary ? "text-gray-400" : "text-gray-600")}
                  title={row.summary || undefined}
                >
                  {row.summary || "No description yet"}
                </span>
                {row.cvss > 0 && (
                  <span
                    className={cn("shrink-0 text-xs font-semibold tabular-nums", getCvssTextColor(row.cvss))}
                    title="CVSS"
                  >
                    {Math.min(row.cvss, 10).toFixed(1)}
                  </span>
                )}
                <span className="flex shrink-0 gap-1">
                  {(row.sources ?? []).map((s) => (
                    <SourceBadge key={s} source={s} />
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex items-center gap-2 px-6 py-6 text-sm text-gray-400">
          <Shield className="h-4 w-4 text-gray-500" aria-hidden />
          No open findings to display
        </p>
      )}
    </section>
  );
}

// ─── Right column ───────────────────────────────────────────────────────────

function SideCard({
  icon: Icon,
  title,
  badge,
  children,
}: {
  icon: React.ElementType;
  title: string;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(CARD, "p-5")}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-violet-400" aria-hidden />
        <h2 className={CARD_TITLE}>{title}</h2>
        {badge !== undefined && badge > 0 && (
          <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 shrink-0 text-gray-500" aria-hidden />
      <span className="w-20 shrink-0 text-gray-500">{label}</span>
      <span className="truncate text-gray-300" title={value}>
        {value}
      </span>
    </div>
  );
}

function SystemSummary({ host, agent }: { host: HostPageDataWithRisk; agent: AgentDataState }) {
  return (
    <SideCard icon={Server} title="System summary">
      <div className="space-y-3">
        <InfoRow icon={Server} label="Hostname" value={realText(host.hostname) ?? "—"} />
        <InfoRow icon={Cpu} label="OS" value={osLabel(host.os, host.osversion) ?? "Unknown"} />
        {agent.status === "present" ? (
          <>
            <InfoRow icon={Package} label="Packages" value={agent.data.packages.toLocaleString("en-US")} />
            <InfoRow icon={Users} label="Users" value={agent.data.users.toLocaleString("en-US")} />
            <InfoRow
              icon={Activity}
              label="Services"
              value={
                agent.data.services.total > 0
                  ? `${agent.data.services.running} running of ${agent.data.services.total}`
                  : "—"
              }
            />
            {agent.data.cpuCores !== undefined && (
              <InfoRow icon={Cpu} label="CPU" value={plural(agent.data.cpuCores, "core")} />
            )}
            {agent.data.memoryGb !== undefined && (
              <InfoRow icon={HardDrive} label="Memory" value={`${agent.data.memoryGb.toFixed(1)} GB`} />
            )}
          </>
        ) : agent.status === "none" ? (
          <p className="pt-1 text-xs text-gray-500">
            {agent.agentInstalled
              ? "The agent hasn't reported packages, users or services yet."
              : "Packages, users and services need the Sirius agent."}{" "}
            <Link href={AGENT_HREF} className="text-violet-400 transition-colors hover:text-violet-300">
              {agent.agentInstalled ? "Open the agent console" : "Get the agent"}
            </Link>
          </p>
        ) : null}
      </div>
    </SideCard>
  );
}

function OpenPorts({ ip, ports }: { ip: string; ports: ReturnType<typeof openPortServices> }) {
  return (
    <SideCard icon={Network} title="Open ports" badge={ports.length}>
      {ports.length > 0 ? (
        <div className="space-y-1.5">
          {ports.slice(0, PORTS_SHOWN).map((p) => (
            <div
              key={`${p.port}/${p.protocol}`}
              className="flex items-center gap-2 rounded border border-violet-500/5 bg-gray-800/30 px-3 py-1.5"
            >
              <span className="font-mono text-xs font-semibold text-white">{p.port}</span>
              <span className="text-[10px] uppercase text-gray-500">{p.protocol}</span>
              <span
                className="min-w-0 flex-1 truncate text-right text-xs text-gray-400"
                title={p.serviceDetail ?? p.serviceLabel}
              >
                {p.serviceLabel}
              </span>
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            </div>
          ))}
          {ports.length > PORTS_SHOWN && (
            <Link href={hostTabHref(ip, "network")} className={cn(LINK, "justify-center pt-1 text-[11px]")}>
              +{ports.length - PORTS_SHOWN} more ports
            </Link>
          )}
        </div>
      ) : (
        <span className="text-xs text-gray-500">No open ports recorded</span>
      )}
    </SideCard>
  );
}

function When({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatDateTime(iso, "long")} className="whitespace-nowrap">
      {formatDateTime(iso)}
    </time>
  );
}

function DiscoverySources({ host }: { host: HostPageDataWithRisk }) {
  const { sources } = host.freshness;
  return (
    <SideCard icon={Target} title="Discovery sources">
      {sources.length > 0 ? (
        <ul className="space-y-2.5">
          {sources.map((s) => (
            <li key={s.name} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                <SourceBadge source={s.name} />
                {s.version && <span className="truncate text-gray-500">{s.version}</span>}
              </span>
              <span className="shrink-0 text-gray-400">
                <When iso={s.lastSeen} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-xs text-gray-500">No sources</span>
      )}
    </SideCard>
  );
}

function ActivityItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/40" aria-hidden />
      <div className="min-w-0">
        <div className="text-gray-500">{label}</div>
        <div className="text-gray-300">{children}</div>
      </div>
    </div>
  );
}

function RecentActivity({ host }: { host: HostPageDataWithRisk }) {
  const { lastScan } = host.freshness;
  const firstSeen = host.freshness.firstSeen ?? host.firstSeen;
  return (
    <SideCard icon={Clock} title="Recent activity">
      <div className="space-y-2.5">
        <ActivityItem label="Last scan">
          {lastScan ? (
            <>
              <When iso={lastScan.time} />
              <span className="text-gray-500"> · {lastScanDetail(lastScan)}</span>
            </>
          ) : (
            "No scan has reported on this host yet"
          )}
        </ActivityItem>
        <ActivityItem label="First discovered">{firstSeen ? <When iso={firstSeen} /> : "Unknown"}</ActivityItem>
        <ActivityItem label="Open findings">{host.openFindings.toLocaleString("en-US")}</ActivityItem>
      </div>
      <Link href={hostTabHref(host.ip, "history")} className={cn(LINK, "mt-3 text-[11px]")}>
        View full history
        <ChevronRight className="h-3 w-3" aria-hidden />
      </Link>
    </SideCard>
  );
}

export default HostOverview;

/**
 * HostOverview — "Host Dashboard" tab
 *
 * Mirrors the main Dashboard structure:
 *   Row 1 — Hero cards (Vulnerabilities / Open Ports / Risk Score)
 *   Row 2 — Two-column layout
 *     Left 2/3:  Severity breakdown + top vulnerabilities mini-table
 *     Right 1/3: System summary + source coverage + recent activity
 */

import React from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
  Shield,
  Server,
  Target,
  AlertTriangle,
  Activity,
  Network,
  Users,
  Package,
  Clock,
  Cpu,
  HardDrive,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { DashboardHeroCard } from "~/components/dashboard/DashboardHeroCard";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";
import { SourceBadge } from "~/components/shared/SourceBadge";
import type { HostPageData, DeduplicatedVulnerability } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeRiskScore(counts: {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}): number {
  // Weighted formula matching backend logic
  const score =
    counts.critical * 10 +
    counts.high * 7 +
    counts.medium * 4 +
    counts.low * 1;
  return Math.min(10, parseFloat((score / Math.max(1, counts.critical + counts.high + counts.medium + counts.low + counts.informational)).toFixed(1)));
}

function getRiskLabel(score: number): string {
  if (score === 0) return "Clean";
  if (score < 2) return "Low";
  if (score < 5) return "Medium";
  if (score < 8) return "High";
  return "Critical";
}

function getRiskVariant(score: number): "success" | "default" | "critical" {
  if (score === 0) return "success";
  if (score >= 8) return "critical";
  return "default";
}

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Never";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return "Just now";
  } catch {
    return "Unknown";
  }
}

function getSeverityColor(severity: string): string {
  const s = severity.toUpperCase();
  if (s.includes("CRIT")) return "text-red-400";
  if (s.includes("HIGH")) return "text-orange-400";
  if (s.includes("MED")) return "text-amber-400";
  if (s.includes("LOW")) return "text-green-400";
  return "text-blue-400";
}

function getSeverityBg(severity: string): string {
  const s = severity.toUpperCase();
  if (s.includes("CRIT")) return "bg-red-500/15";
  if (s.includes("HIGH")) return "bg-orange-500/15";
  if (s.includes("MED")) return "bg-amber-500/15";
  if (s.includes("LOW")) return "bg-green-500/15";
  return "bg-blue-500/15";
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface HostOverviewProps {
  host: HostPageData;
  vulnerabilities?: DeduplicatedVulnerability[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export const HostOverview: React.FC<HostOverviewProps> = ({
  host,
  vulnerabilities = [],
}) => {
  const router = useRouter();

  // Fetch enhanced data for system summary
  const { data: softwareInventory } =
    api.host.getHostSoftwareInventory.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip, staleTime: 60000 },
    );

  const { data: systemFingerprint } =
    api.host.getHostSystemFingerprint.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip, staleTime: 60000 },
    );

  const { data: softwareStats } = api.host.getHostSoftwareStats.useQuery(
    { ip: host.ip },
    { enabled: !!host.ip, staleTime: 60000 },
  );

  // ── Computed values ────────────────────────────────────────────────────
  const softwarePackages =
    softwareInventory?.package_count || softwareStats?.total_packages || 0;
  const userAccounts =
    systemFingerprint?.fingerprint?.users?.users?.length || 0;

  const servicesArray = Array.isArray(systemFingerprint?.fingerprint?.services)
    ? systemFingerprint.fingerprint.services
    : [];
  const runningServices = servicesArray.filter(
    (s: { status: string }) =>
      s.status?.toLowerCase() === "running" ||
      s.status?.toLowerCase() === "active",
  ).length;

  const cpuCores = systemFingerprint?.fingerprint?.hardware?.cpu?.cores || 0;
  const totalMemoryGB =
    systemFingerprint?.fingerprint?.hardware?.memory?.total_gb || 0;

  const lastScanTime =
    softwareInventory?.collected_at || systemFingerprint?.collected_at;

  const riskScore = computeRiskScore(host.severityCounts);
  const riskLabel = getRiskLabel(riskScore);

  // Top 5 most critical vulnerabilities for the mini table
  const topVulns = [...vulnerabilities]
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
    .slice(0, 5);

  // Port service summary for hero card subtitle
  const topServices = host.ports
    .filter((p) => p.service?.name)
    .map((p) => p.service!.name!)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ══════════════════════════════════════════════════════════════════
          ROW 1 — Hero Cards (3 across)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-6 md:grid-cols-3">
        <DashboardHeroCard
          title="Vulnerabilities"
          value={host.vulnerabilityCount}
          icon={Target}
          subtitle={
            host.vulnerabilityCount > 0
              ? `${host.severityCounts.critical} critical, ${host.severityCounts.high} high`
              : "No known vulnerabilities"
          }
          variant={host.severityCounts.critical > 0 ? "critical" : host.vulnerabilityCount === 0 ? "success" : "default"}
        />

        {/* Asset Metrics — dual bubble: Open Ports + Packages */}
        <div className="group relative overflow-hidden rounded-lg border border-violet-500/20 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-opacity-40 hover:shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 grid grid-cols-2 divide-x divide-violet-500/10">
            {/* Packages */}
            <div className="pr-5">
              <span className="text-sm font-medium uppercase tracking-wide text-violet-300">
                <Package className="mr-2 inline-block h-4 w-4" />
                Packages
              </span>
              <div className="mb-1 mt-3">
                <span className="text-5xl font-bold tabular-nums text-white">
                  {softwarePackages.toLocaleString()}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {softwarePackages > 0 ? "Installed" : "Not scanned"}
              </div>
            </div>
            {/* Open Ports */}
            <div className="pl-5">
              <span className="text-sm font-medium uppercase tracking-wide text-violet-300">
                <Network className="mr-2 inline-block h-4 w-4" />
                Open Ports
              </span>
              <div className="mb-1 mt-3">
                <span className="text-5xl font-bold tabular-nums text-white">
                  {host.portCount}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {topServices.length > 0
                  ? topServices.join(", ")
                  : host.portCount > 0
                  ? "Discovered services"
                  : "No open ports"}
              </div>
            </div>
          </div>
        </div>

        <DashboardHeroCard
          title="Risk Score"
          value={riskScore.toFixed(1)}
          icon={Shield}
          subtitle={riskLabel}
          variant={getRiskVariant(riskScore)}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          ROW 2 — Two-Column Layout
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Left Column (2/3) ─────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Severity Breakdown */}
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-violet-300">
                Severity Breakdown
              </h2>
            </div>
            {host.vulnerabilityCount > 0 ? (
              <VulnerabilitySeverityCardsHorizontal
                counts={host.severityCounts}
              />
            ) : (
              <div className="flex items-center gap-2 py-4">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-emerald-400">
                  No vulnerabilities detected — system is clean
                </span>
              </div>
            )}
          </div>

          {/* Top Vulnerabilities Mini-table */}
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-violet-500/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-violet-300">
                  Top Vulnerabilities
                </h2>
              </div>
              {host.vulnerabilityCount > 5 && (
                <button
                  onClick={() => {
                    /* The tab change must be done via parent — push a pseudo-anchor instead */
                  }}
                  className="flex items-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300"
                >
                  View all {host.vulnerabilityCount}
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>

            {topVulns.length > 0 ? (
              <div className="divide-y divide-gray-800/50">
                {topVulns.map((vuln, i) => (
                  <button
                    key={vuln.cve || i}
                    onClick={() => {
                      const id = vuln.cve;
                      if (id) void router.push(`/vulnerability?id=${encodeURIComponent(id)}`);
                    }}
                    className="flex w-full items-center gap-3 px-6 py-3 text-left transition-colors hover:bg-gray-800/30"
                  >
                    {/* Severity badge */}
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getSeverityBg(vuln.severity)} ${getSeverityColor(vuln.severity)}`}
                    >
                      {vuln.severity.replace("INFORMATIONAL", "INFO")}
                    </span>

                    {/* CVE ID */}
                    <span className="shrink-0 font-mono text-xs text-gray-300">
                      {vuln.cve || "N/A"}
                    </span>

                    {/* Description */}
                    <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
                      {vuln.description || vuln.title || "—"}
                    </span>

                    {/* Source badges */}
                    <div className="flex shrink-0 gap-1">
                      {vuln.sources.map((s) => (
                        <SourceBadge key={s} source={s} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-6 py-6">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-gray-500">
                  No vulnerabilities to display
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Column (1/3) ────────────────────────────────────── */}
        <div className="space-y-6 lg:col-span-1">
          {/* System Summary */}
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-violet-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                System Summary
              </h2>
            </div>
            <div className="space-y-3">
              <InfoRow icon={<Server className="h-3.5 w-3.5 text-gray-500" />} label="Hostname" value={host.hostname || "—"} />
              <InfoRow icon={<Cpu className="h-3.5 w-3.5 text-gray-500" />} label="OS" value={host.os ? `${host.os}${host.osversion ? ` ${host.osversion}` : ""}` : "Unknown"} />
              <InfoRow icon={<Package className="h-3.5 w-3.5 text-gray-500" />} label="Packages" value={softwarePackages.toLocaleString()} />
              <InfoRow icon={<Users className="h-3.5 w-3.5 text-gray-500" />} label="Users" value={String(userAccounts)} />
              <InfoRow icon={<Activity className="h-3.5 w-3.5 text-gray-500" />} label="Services" value={`${runningServices} running`} />
              {cpuCores > 0 && (
                <InfoRow icon={<Cpu className="h-3.5 w-3.5 text-gray-500" />} label="CPU" value={`${cpuCores} cores`} />
              )}
              {totalMemoryGB > 0 && (
                <InfoRow icon={<HardDrive className="h-3.5 w-3.5 text-gray-500" />} label="Memory" value={`${totalMemoryGB.toFixed(1)} GB`} />
              )}
            </div>
          </div>

          {/* Open Ports */}
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-violet-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                  Open Ports
                </h2>
                {host.portCount > 0 && (
                  <span className="rounded-full bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                    {host.portCount}
                  </span>
                )}
              </div>
            </div>
            {host.ports.length > 0 ? (
              <div className="space-y-1.5">
                {host.ports.slice(0, 8).map((port) => (
                  <div
                    key={`${port.number}-${port.protocol}`}
                    className="flex items-center justify-between rounded border border-violet-500/5 bg-gray-800/30 px-3 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-white">
                        {port.number}
                      </span>
                      <span className="text-[10px] uppercase text-gray-500">
                        {port.protocol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {port.service?.name && (
                        <span className="text-xs text-gray-400">
                          {port.service.name}
                          {port.service.version ? ` ${port.service.version}` : ""}
                        </span>
                      )}
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          port.state === "open"
                            ? "bg-emerald-400"
                            : "bg-gray-600"
                        }`}
                      />
                    </div>
                  </div>
                ))}
                {host.ports.length > 8 && (
                  <div className="pt-1 text-center text-[11px] text-gray-500">
                    +{host.ports.length - 8} more ports
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500">No open ports detected</span>
            )}
          </div>

          {/* Source Coverage */}
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                Source Coverage
              </h2>
            </div>
            {host.sources.length > 0 ? (
              <div className="space-y-2.5">
                {host.sources.map((source) => (
                  <div
                    key={source}
                    className="flex items-center justify-between"
                  >
                    <SourceBadge source={source} />
                    <span className="text-[10px] text-gray-500">
                      {formatRelativeTime(lastScanTime)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-gray-500">No sources</span>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-5 backdrop-blur-sm">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-violet-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wide text-violet-300">
                Recent Activity
              </h2>
            </div>
            <div className="space-y-2.5">
              <ActivityItem
                label="Last data collection"
                value={formatRelativeTime(lastScanTime)}
              />
              <ActivityItem
                label="First discovered"
                value={formatRelativeTime(host.createdAt)}
              />
              <ActivityItem
                label="Risk posture"
                value={
                  host.vulnerabilityCount === 0
                    ? "Clean — no known vulnerabilities"
                    : `${host.severityCounts.critical} critical, ${host.severityCounts.high} high, ${host.severityCounts.medium + host.severityCounts.low + host.severityCounts.informational} other`
                }
              />
            </div>
            {/* Link to full History tab */}
            <button
              className="mt-3 flex items-center gap-1 text-[11px] text-violet-400 transition-colors hover:text-violet-300"
              onClick={() => {
                /* Parent handles tab switching — this is cosmetic */
              }}
            >
              View full history
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {icon}
      <span className="w-20 shrink-0 text-gray-500">{label}</span>
      <span className="truncate text-gray-300">{value}</span>
    </div>
  );
}

function ActivityItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500/40" />
      <div>
        <div className="text-gray-500">{label}</div>
        <div className="text-gray-300">{value}</div>
      </div>
    </div>
  );
}

export default HostOverview;

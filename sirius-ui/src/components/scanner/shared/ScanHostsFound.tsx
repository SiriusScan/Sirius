/**
 * ScanHostsFound — the hosts this scan found (R03): each host's name, IP,
 * OS, severity bar and risk for this scan, its open ports, whether it is in
 * the inventory (ADR-1: scanned hosts are saved automatically) and a way to
 * open it.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, ChevronUp, Loader2, Plus, Server } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { cn } from "~/components/lib/utils";
import { HostCell, hostHref } from "~/components/shared/HostCell";
import type { ScanHostRow } from "~/hooks/useScanDataMapping";
import type { HostFreshnessEntry, OpenPort } from "~/types/riskSummary";
import { formatDateTime } from "~/utils/formatDateTime";
import { compareRisk } from "~/utils/risk";
import { ScanSection } from "./ScanSection";
import { inventoryBadge, knownText, type InventoryBadge } from "./scanRunModel";

const PREVIEW_HOSTS = 8;
const MAX_PORT_CHIPS = 6;

export interface ScanHostsFoundProps {
  hosts: readonly ScanHostRow[];
  /** host.getHostFreshness answers, by IP (saved time, last scan). */
  freshnessByIp: ReadonlyMap<string, HostFreshnessEntry>;
  scanId?: string;
  scanStart?: string;
  scanActive: boolean;
}

function portLabel(p: OpenPort): string {
  const base = `${p.port}/${p.protocol || "tcp"}`;
  return p.service ? `${base} ${p.service}` : base;
}

function PortChips({ ports }: { ports: readonly OpenPort[] }) {
  if (ports.length === 0) return null;
  const shown = ports.slice(0, MAX_PORT_CHIPS);
  const rest = ports.slice(MAX_PORT_CHIPS);
  return (
    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Open ports">
      {shown.map((p) => (
        <li
          key={`${p.port}/${p.protocol}`}
          className="rounded border border-gray-700/70 bg-gray-900/60 px-1.5 py-0.5 font-mono text-[11px] text-gray-300"
        >
          {portLabel(p)}
        </li>
      ))}
      {rest.length > 0 && (
        <li className="text-[11px] text-gray-500" title={rest.map(portLabel).join(", ")}>
          +{rest.length} more
        </li>
      )}
    </ul>
  );
}

function InventoryStatus({ badge, ip }: { badge: InventoryBadge; ip: string }) {
  const base = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px]";
  switch (badge.kind) {
    case "saved":
    case "updated":
      return (
        <span
          className={cn(base, "border border-emerald-500/25 bg-emerald-500/10 text-emerald-300")}
          title={formatDateTime(badge.time, "long")}
        >
          <Check className="h-3 w-3" aria-hidden />
          {badge.label} {formatDateTime(badge.time)}
        </span>
      );
    case "since":
      return (
        <span
          className={cn(base, "border border-violet-500/20 bg-violet-500/5 text-gray-300")}
          title={formatDateTime(badge.time, "long")}
        >
          <Check className="h-3 w-3 text-violet-400" aria-hidden />
          {badge.label} {formatDateTime(badge.time)}
        </span>
      );
    case "listed":
      return (
        <span className={cn(base, "border border-violet-500/20 bg-violet-500/5 text-gray-300")}>
          <Check className="h-3 w-3 text-violet-400" aria-hidden />
          {badge.label}
        </span>
      );
    case "pending":
      return (
        <span className={cn(base, "border border-gray-700/70 text-gray-500")}>
          <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
          {badge.label}
        </span>
      );
    case "missing":
      return (
        <span className="inline-flex items-center gap-2">
          <span className={cn(base, "border border-amber-500/25 bg-amber-500/10 text-amber-300")}>{badge.label}</span>
          <Link
            href={`/environment?add=${encodeURIComponent(ip)}`}
            className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300"
          >
            <Plus className="h-3 w-3" aria-hidden />
            Add host
          </Link>
        </span>
      );
  }
}

function HostRow({
  host,
  badge,
}: {
  host: ScanHostRow;
  badge: InventoryBadge;
}) {
  return (
    <li className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:gap-4">
      <HostCell
        className="md:w-80 md:shrink-0 lg:w-96"
        host={{
          ip: host.ip,
          hostname: knownText(host.hostname),
          os: knownText(host.os),
          counts: host.counts,
          riskScore: host.riskScore,
        }}
      />
      {/* Also the spacer that pushes the status right on wide screens. */}
      <div className={cn("min-w-0 flex-1", host.openPorts.length === 0 && "hidden md:block")}>
        <PortChips ports={host.openPorts} />
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <InventoryStatus badge={badge} ip={host.ip} />
        <Button asChild variant="outline" size="sm">
          <Link href={hostHref(host.ip)}>
            <ArrowRight className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Open host
          </Link>
        </Button>
      </div>
    </li>
  );
}

export function ScanHostsFound({ hosts, freshnessByIp, scanId, scanStart, scanActive }: ScanHostsFoundProps) {
  const [showAll, setShowAll] = useState(false);
  const sorted = useMemo(() => [...hosts].sort(compareRisk), [hosts]);
  const shown = showAll ? sorted : sorted.slice(0, PREVIEW_HOSTS);

  return (
    <ScanSection
      icon={Server}
      title="Hosts found"
      count={hosts.length}
      aside={
        <Link href="/environment" className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300">
          Open in Environment
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      }
    >
      {hosts.length === 0 ? (
        <p className="text-sm text-gray-500">
          {scanActive ? "No hosts reported yet." : "This scan found no live hosts."}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-violet-500/10">
            {shown.map((host) => {
              const fresh = freshnessByIp.get(host.ip);
              return (
                <HostRow
                  key={host.ip}
                  host={host}
                  badge={inventoryBadge({
                    inInventory: host.inInventory || fresh?.inInventory === true,
                    savedAt: fresh?.savedAt,
                    lastScan: fresh?.lastScan,
                    scanId,
                    scanStart,
                    scanActive,
                  })}
                />
              );
            })}
          </ul>
          {sorted.length > PREVIEW_HOSTS && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 rounded text-xs text-violet-400 hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              aria-expanded={showAll}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                  Show fewer
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  Show all {sorted.length.toLocaleString("en-US")} hosts
                </>
              )}
            </button>
          )}
        </>
      )}
    </ScanSection>
  );
}

export default ScanHostsFound;

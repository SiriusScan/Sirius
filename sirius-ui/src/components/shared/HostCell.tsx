/**
 * HostCell — one host in a list: hostname (or IP) in bold, the IP in grey
 * mono, the OS, then a stacked severity bar and the host's RiskScore. The
 * whole cell links to /host/<ip>.
 *
 *   <HostCell host={{ ip: "192.0.2.12", hostname: "web-01.example",
 *     os: "Linux", counts, riskScore: 8.1 }} />
 *
 * `riskScore` is the API's 0–10 score (ADR-3); the cell never computes it.
 */

import React from "react";
import Link from "next/link";
import { cn } from "~/components/lib/utils";
import { RiskScore } from "./RiskScore";
import { SeverityStrip } from "./SeverityStrip";
import type { SeverityCounts } from "./severity";

export interface HostCellHost {
  ip: string;
  hostname?: string | null;
  os?: string | null;
  counts: SeverityCounts;
  /** 0–10 from the API; null or undefined shows "—". */
  riskScore: number | null | undefined;
}

export interface HostCellProps {
  host: HostCellHost;
  className?: string;
}

export function hostHref(ip: string): string {
  return `/host/${encodeURIComponent(ip)}`;
}

export function HostCell({ host, className }: HostCellProps) {
  const hostname = host.hostname?.trim();
  const named = !!hostname && hostname !== host.ip;
  const os = host.os?.trim();

  return (
    <Link
      href={hostHref(host.ip)}
      className={cn(
        "group block min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
        className,
      )}
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <span
          className={cn(
            "truncate text-sm font-semibold text-white transition-colors group-hover:text-violet-200",
            !named && "font-mono",
          )}
        >
          {named ? hostname : host.ip}
        </span>
        {named && <span className="shrink-0 font-mono text-xs text-gray-500">{host.ip}</span>}
        {os && <span className="truncate text-xs text-gray-500">{os}</span>}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <SeverityStrip variant="bar" counts={host.counts} className="min-w-[4rem] flex-1" />
        <RiskScore size="sm" score={host.riskScore} />
      </div>
    </Link>
  );
}

export default HostCell;

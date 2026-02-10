/**
 * HostHeader — v4 sticky header following the standard pattern used by
 * Dashboard, Vulnerability Navigator, Scanner, and Console pages.
 *
 * sticky top-2 · glassmorphism · icon container with ring · 2xl bold title
 */

import React from "react";
import { useRouter } from "next/router";
import {
  Server,
  RefreshCw,
  Pencil,
  ChevronRight,
  Monitor,
} from "lucide-react";
import { SourceBadge } from "~/components/shared/SourceBadge";
import type { HostPageData } from "./types";

interface HostHeaderProps {
  host: HostPageData;
  onEdit?: () => void;
}

export const HostHeader: React.FC<HostHeaderProps> = ({ host, onEdit }) => {
  const router = useRouter();

  const handleScanNow = () => {
    void router.push(`/scanner?target=${encodeURIComponent(host.ip)}`);
  };

  return (
    <div className="sticky top-2 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
      <div className="flex items-center gap-3">
        {/* Standard v4 icon container */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
          <Server className="h-6 w-6 text-violet-400" />
        </div>

        {/* Title area with inline breadcrumb */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => void router.push("/environment")}
              className="shrink-0 text-sm text-gray-500 transition-colors hover:text-violet-400"
            >
              Environment
            </button>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-600" />
            <h1 className="truncate text-2xl font-bold tracking-tight text-white">
              {host.hostname || host.ip}
            </h1>
          </div>

          {/* Metadata row */}
          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-400">
            <span className="font-mono">{host.ip}</span>

            {/* OS badge */}
            {host.os && (
              <span className="flex items-center gap-1 rounded border border-violet-500/10 bg-gray-900/50 px-1.5 py-0.5 text-[10px] font-medium text-gray-400">
                <Monitor className="h-3 w-3" />
                {host.os}
                {host.osversion ? ` ${host.osversion}` : ""}
              </span>
            )}

            {/* Vuln count pill */}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                host.vulnerabilityCount === 0
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-yellow-500/15 text-yellow-400"
              }`}
            >
              {host.vulnerabilityCount === 0
                ? "Clean"
                : `${host.vulnerabilityCount} vulns`}
            </span>

            {/* Port count */}
            {host.portCount > 0 && (
              <span className="rounded-full bg-gray-800/80 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                {host.portCount} ports
              </span>
            )}

            {/* Source badges */}
            {host.sources.length > 0 && (
              <div className="flex items-center gap-1">
                {host.sources.map((source) => (
                  <SourceBadge key={source} source={source} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Actions (right side) */}
        <div className="flex shrink-0 items-center gap-2 pr-14">
          <button
            className="flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:border-violet-500/30 hover:bg-violet-500/20"
            onClick={handleScanNow}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Scan Now
          </button>

          {onEdit && (
            <button
              className="flex items-center gap-1.5 rounded-md border border-violet-500/10 px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-violet-500/20 hover:text-gray-300"
              onClick={onEdit}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostHeader;

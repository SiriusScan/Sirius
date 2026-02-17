import React from "react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { Clock, RefreshCw, Activity } from "lucide-react";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { SECTION_HEADER } from "~/utils/themeConstants";

interface HostHistoryProps {
  hostIp: string;
}

export const HostHistory: React.FC<HostHistoryProps> = ({ hostIp }) => {
  const router = useRouter();

  const { data: historyData, isLoading } = api.host.getHostHistory.useQuery(
    { ip: hostIp },
    { enabled: !!hostIp, staleTime: 30000 },
  );

  const handleScanNow = () => {
    void router.push(`/scanner?target=${encodeURIComponent(hostIp)}`);
  };

  const timeline = historyData?.timeline ?? [];
  const sources = historyData?.sources ?? [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-3 w-3 animate-pulse rounded-full bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-32 animate-pulse rounded bg-gray-700" />
                <div className="h-3 w-48 animate-pulse rounded bg-gray-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <div className="scanner-section scanner-section-padding">
        <h3 className={`${SECTION_HEADER} mb-4`}>Activity Timeline</h3>

        {timeline.length > 0 ? (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-violet-500/20" />

            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative flex gap-3 pl-5">
                  {/* Dot */}
                  <div className="absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-violet-500/40 bg-gray-900" />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-300">
                        {formatEventType(event.event_type)}
                      </span>
                      {event.source && (
                        <SourceBadge source={event.source} />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {event.details}
                    </p>
                    <time className="mt-0.5 block text-[10px] text-gray-600">
                      {formatTimestamp(event.timestamp)}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyTimeline onScan={handleScanNow} />
        )}
      </div>

      {/* ── Source Coverage ──────────────────────────────────────────────── */}
      {sources.length > 0 && (
        <div className="scanner-section scanner-section-padding">
          <h3 className={`${SECTION_HEADER} mb-3`}>Discovery Sources</h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <SourceBadge key={source} source={source} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function EmptyTimeline({ onScan }: { onScan: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/10 bg-gray-900/50">
        <Activity className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-400">No scan history available</p>
        <p className="mt-1 text-xs text-gray-600">
          Run a scan to begin tracking this host&apos;s history
        </p>
      </div>
      <button
        onClick={onScan}
        className="flex items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Scan Now
      </button>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatEventType(type: string): string {
  const map: Record<string, string> = {
    host_discovery: "Host Discovered",
    scan_completed: "Scan Completed",
    vulnerability_found: "Vulnerability Found",
    port_discovered: "Port Discovered",
    software_installed: "Software Installed",
    configuration_change: "Configuration Change",
  };
  return (
    map[type] ??
    type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatTimestamp(ts: string): string {
  if (!ts) return "Unknown";
  try {
    const date = new Date(ts);
    return date.toLocaleString();
  } catch {
    return ts;
  }
}

export default HostHistory;

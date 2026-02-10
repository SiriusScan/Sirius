import React from "react";
import { api } from "~/utils/api";
import { Network, Wifi, Globe, RefreshCw } from "lucide-react";
import { useRouter } from "next/router";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { SECTION_HEADER } from "~/utils/themeConstants";
import type { HostPageData, DeduplicatedPort } from "./types";

interface HostNetworkProps {
  host: HostPageData;
}

export const HostNetwork: React.FC<HostNetworkProps> = ({ host }) => {
  const router = useRouter();

  // Fetch fingerprint for network interface data
  const { data: systemFingerprint } =
    api.host.getHostSystemFingerprint.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip, staleTime: 60000 },
    );

  const interfaces =
    systemFingerprint?.fingerprint?.network?.interfaces ?? [];
  const dnsServers =
    systemFingerprint?.fingerprint?.network?.dns_servers ?? [];
  const ports = host.ports;

  const handleScanNow = () => {
    void router.push(`/scanner?target=${encodeURIComponent(host.ip)}`);
  };

  return (
    <div className="space-y-4">
      {/* ── Network Interfaces ──────────────────────────────────────────── */}
      <div className="scanner-section scanner-section-padding">
        <h3 className={`${SECTION_HEADER} mb-3`}>Network Interfaces</h3>
        {interfaces.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-violet-500/10 text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Name</th>
                  <th className="pb-2 pr-4 font-medium">MAC</th>
                  <th className="pb-2 pr-4 font-medium">IPv4</th>
                  <th className="pb-2 font-medium">IPv6</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {interfaces.map(
                  (
                    iface: {
                      name: string;
                      mac: string;
                      ipv4: string[];
                      ipv6: string[];
                    },
                    idx: number,
                  ) => (
                    <tr key={idx} className="text-gray-300">
                      <td className="py-2 pr-4 font-mono font-medium text-white">
                        {iface.name}
                      </td>
                      <td className="py-2 pr-4 font-mono text-gray-400">
                        {iface.mac || "—"}
                      </td>
                      <td className="py-2 pr-4 font-mono">
                        {iface.ipv4?.join(", ") || "—"}
                      </td>
                      <td className="py-2 font-mono text-gray-500">
                        {iface.ipv6?.length
                          ? iface.ipv6.slice(0, 2).join(", ") +
                            (iface.ipv6.length > 2
                              ? ` +${iface.ipv6.length - 2}`
                              : "")
                          : "—"}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Network className="h-5 w-5 text-gray-600" />}
            message="No network interface data available"
            action={handleScanNow}
          />
        )}

        {/* DNS Servers */}
        {dnsServers.length > 0 && (
          <div className="mt-3 border-t border-violet-500/5 pt-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
              DNS Servers
            </span>
            <div className="mt-1 flex flex-wrap gap-2">
              {dnsServers.map((dns: string) => (
                <span
                  key={dns}
                  className="rounded border border-violet-500/10 bg-gray-900/50 px-2 py-0.5 font-mono text-xs text-gray-400"
                >
                  {dns}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Open Ports ──────────────────────────────────────────────────── */}
      <div className="scanner-section scanner-section-padding">
        <div className="mb-3 flex items-center justify-between">
          <h3 className={SECTION_HEADER}>
            Ports
            {ports.length > 0 && (
              <span className="ml-2 text-gray-500">({ports.length})</span>
            )}
          </h3>
        </div>
        {ports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-violet-500/10 text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Port</th>
                  <th className="pb-2 pr-4 font-medium">Protocol</th>
                  <th className="pb-2 pr-4 font-medium">State</th>
                  <th className="pb-2 pr-4 font-medium">Service</th>
                  <th className="pb-2 font-medium">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {ports
                  .sort((a, b) => a.number - b.number)
                  .map((port: DeduplicatedPort) => (
                    <tr key={port.number} className="text-gray-300">
                      <td className="py-1.5 pr-4 font-mono font-medium text-white">
                        {port.number}
                      </td>
                      <td className="py-1.5 pr-4 font-mono text-gray-400">
                        {port.protocol}
                      </td>
                      <td className="py-1.5 pr-4">
                        <PortStateBadge state={port.state} />
                      </td>
                      <td className="py-1.5 pr-4 text-gray-400">
                        {port.service?.name
                          ? `${port.service.name}${port.service.version ? ` ${port.service.version}` : ""}`
                          : "—"}
                      </td>
                      <td className="py-1.5">
                        <div className="flex flex-wrap gap-1">
                          {port.sources.map((s) => (
                            <SourceBadge key={s} source={s} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Wifi className="h-5 w-5 text-gray-600" />}
            message="No ports detected"
            action={handleScanNow}
          />
        )}
      </div>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function PortStateBadge({ state }: { state: string }) {
  const lower = state?.toLowerCase();
  const colorMap: Record<string, string> = {
    open: "bg-emerald-500/15 text-emerald-400",
    closed: "bg-red-500/15 text-red-400",
    filtered: "bg-yellow-500/15 text-yellow-400",
  };
  const cls = colorMap[lower] ?? "bg-gray-800 text-gray-400";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {state}
    </span>
  );
}

function EmptyState({
  icon,
  message,
  action,
}: {
  icon: React.ReactNode;
  message: string;
  action: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      {icon}
      <p className="text-xs text-gray-500">{message}</p>
      <button
        onClick={action}
        className="flex items-center gap-1 rounded border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
      >
        <RefreshCw className="h-3 w-3" />
        Run a scan
      </button>
    </div>
  );
}

export default HostNetwork;

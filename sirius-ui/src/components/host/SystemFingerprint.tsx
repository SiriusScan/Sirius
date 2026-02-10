import React from "react";
import { api } from "~/utils/api";
import {
  Cpu,
  HardDrive,
  Database,
  Network,
  Server,
  Info,
} from "lucide-react";
import { SECTION_HEADER } from "~/utils/themeConstants";

interface SystemFingerprintProps {
  hostIp: string;
}

const SystemFingerprint: React.FC<SystemFingerprintProps> = ({ hostIp }) => {
  const {
    data: fingerprintData,
    isLoading,
    isError,
    refetch,
  } = api.host.getHostSystemFingerprint.useQuery(
    { ip: hostIp },
    { enabled: !!hostIp, staleTime: 300000 },
  );

  const formatSize = (gb?: number): string => {
    if (!gb) return "—";
    if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb.toFixed(1)} GB`;
  };

  const formatDuration = (ms?: number): string => {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  // Error
  if (isError || !fingerprintData) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="flex flex-col items-center gap-3 py-6">
          <Server className="h-6 w-6 text-gray-600" />
          <p className="text-sm text-gray-500">Failed to load fingerprint data</p>
          <button
            onClick={() => void refetch()}
            className="rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 hover:bg-violet-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { fingerprint } = fingerprintData;

  return (
    <div className="space-y-4">
      {/* Metric strip */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <FPMetric icon={<Cpu className="h-3.5 w-3.5 text-blue-400" />} label="CPU Cores" value={fingerprint.hardware?.cpu?.cores ?? "—"} />
        <FPMetric icon={<Database className="h-3.5 w-3.5 text-emerald-400" />} label="Memory" value={formatSize(fingerprint.hardware?.memory?.total_gb)} />
        <FPMetric icon={<HardDrive className="h-3.5 w-3.5 text-orange-400" />} label="Storage" value={fingerprint.hardware?.storage?.length ?? 0} />
        <FPMetric icon={<Network className="h-3.5 w-3.5 text-violet-400" />} label="Interfaces" value={fingerprint.network?.interfaces?.length ?? 0} />
      </div>

      {/* Hardware */}
      {fingerprint.hardware && (
        <div className="scanner-section scanner-section-padding">
          <h4 className={`${SECTION_HEADER} mb-3`}>Hardware</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* CPU */}
            {fingerprint.hardware.cpu && (
              <div className="space-y-1.5 rounded-lg border border-violet-500/5 bg-gray-900/30 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  <Cpu className="h-3 w-3" /> CPU
                </div>
                <FPRow label="Model" value={fingerprint.hardware.cpu.model} />
                <FPRow label="Cores" value={fingerprint.hardware.cpu.cores} />
                <FPRow label="Architecture" value={fingerprint.hardware.cpu.architecture} />
              </div>
            )}

            {/* Memory */}
            {fingerprint.hardware.memory && (
              <div className="space-y-1.5 rounded-lg border border-violet-500/5 bg-gray-900/30 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  <Database className="h-3 w-3" /> Memory
                </div>
                <FPRow label="Total" value={formatSize(fingerprint.hardware.memory.total_gb)} />
                {fingerprint.hardware.memory.available_gb !== undefined && (
                  <FPRow label="Available" value={formatSize(fingerprint.hardware.memory.available_gb)} />
                )}
              </div>
            )}
          </div>

          {/* Storage table */}
          {fingerprint.hardware.storage && fingerprint.hardware.storage.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                <HardDrive className="h-3 w-3" /> Storage Devices
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-violet-500/10 text-left text-gray-500">
                      <th className="pb-2 pr-4 font-medium">Device</th>
                      <th className="pb-2 pr-4 font-medium">Size</th>
                      <th className="pb-2 pr-4 font-medium">Type</th>
                      <th className="pb-2 font-medium">Filesystem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-500/5">
                    {fingerprint.hardware.storage.map((device, idx) => (
                      <tr key={idx} className="text-gray-300">
                        <td className="py-1.5 pr-4 font-mono text-white">{device.device}</td>
                        <td className="py-1.5 pr-4">{formatSize(device.size_gb)}</td>
                        <td className="py-1.5 pr-4">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            device.type?.toLowerCase() === "ssd"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : device.type?.toLowerCase() === "hdd"
                                ? "bg-orange-500/15 text-orange-400"
                                : "bg-gray-800 text-gray-400"
                          }`}>
                            {device.type || "Unknown"}
                          </span>
                        </td>
                        <td className="py-1.5 text-gray-500">{device.filesystem || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network */}
      {fingerprint.network && (
        <div className="scanner-section scanner-section-padding">
          <h4 className={`${SECTION_HEADER} mb-3`}>Network</h4>

          {/* DNS */}
          {fingerprint.network.dns_servers?.length > 0 && (
            <div className="mb-3">
              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                DNS Servers
              </span>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {fingerprint.network.dns_servers.map((dns, idx) => (
                  <span key={idx} className="rounded border border-violet-500/10 bg-gray-900/50 px-2 py-0.5 font-mono text-xs text-gray-400">
                    {dns}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interfaces */}
          {fingerprint.network.interfaces?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-violet-500/10 text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Interface</th>
                    <th className="pb-2 pr-4 font-medium">MAC</th>
                    <th className="pb-2 pr-4 font-medium">IPv4</th>
                    <th className="pb-2 font-medium">IPv6</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-500/5">
                  {fingerprint.network.interfaces.map((iface, idx) => (
                    <tr key={idx} className="text-gray-300">
                      <td className="py-1.5 pr-4 font-mono font-medium text-white">{iface.name}</td>
                      <td className="py-1.5 pr-4 font-mono text-gray-400">{iface.mac || "—"}</td>
                      <td className="py-1.5 pr-4 font-mono">{iface.ipv4?.join(", ") || "—"}</td>
                      <td className="py-1.5 font-mono text-gray-500">
                        {iface.ipv6?.length
                          ? iface.ipv6.slice(0, 2).join(", ") + (iface.ipv6.length > 2 ? ` +${iface.ipv6.length - 2}` : "")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Collection info */}
      <div className="flex items-center gap-2 text-[10px] text-gray-600">
        <Info className="h-3 w-3" />
        <span>
          Collected from {fingerprintData.source} •{" "}
          {fingerprintData.collected_at ? new Date(fingerprintData.collected_at).toLocaleString() : "—"} •{" "}
          {formatDuration(fingerprintData.collection_duration_ms)}
        </span>
      </div>
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function FPMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="scanner-section flex items-center gap-2 px-3 py-2">
      {icon}
      <div>
        <div className="text-sm font-semibold text-white">{value}</div>
        <div className="text-[10px] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function FPRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-300">{value ?? "—"}</span>
    </div>
  );
}

export default SystemFingerprint;

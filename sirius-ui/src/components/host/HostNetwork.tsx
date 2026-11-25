/**
 * HostNetwork — the Network tab: open ports from scan data (with the sources
 * that saw each) and the network interfaces the agent reports. Interfaces
 * need the agent; a scan-only host says so once instead of an empty table.
 */

import React, { useMemo } from "react";
import { RotateCw } from "lucide-react";
import { api } from "~/utils/api";
import { EmptyState } from "~/components/shared/EmptyState";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { SECTION_HEADER } from "~/utils/themeConstants";
import { NeedsAgentState } from "./NeedsAgentState";
import { openPortServices, readAgentNetwork, rescanHref, type PortWithService } from "./hostModel";
import type { AgentDataState } from "./useHostAgentData";
import type { DeduplicatedPort } from "./types";
import type { HostPageDataWithRisk } from "~/hooks/useHostData";

interface HostNetworkProps {
  host: HostPageDataWithRisk;
  agent: AgentDataState;
}

export const HostNetwork: React.FC<HostNetworkProps> = ({ host, agent }) => {
  const hasAgentData = agent.status === "present";

  // Interfaces come from the agent's fingerprint (cached by useHostAgentData).
  const fingerprintQuery = api.host.getHostSystemFingerprint.useQuery(
    { ip: host.ip },
    { enabled: !!host.ip && hasAgentData, staleTime: 60000 },
  );
  const fingerprintData: unknown = fingerprintQuery.data;
  const { interfaces, dnsServers } = useMemo(() => readAgentNetwork(fingerprintData), [fingerprintData]);

  const ports = useMemo(
    () => [...host.ports].sort((a, b) => a.number - b.number || a.protocol.localeCompare(b.protocol)),
    [host.ports],
  );
  // Port-level service metadata first, the findings' service as fallback.
  const services = useMemo(() => {
    const byKey = new Map<string, PortWithService>();
    for (const p of openPortServices(host.openPorts, host.findings)) {
      if (p.serviceLabel) byKey.set(`${p.port}/${p.protocol}`, p);
    }
    return byKey;
  }, [host.openPorts, host.findings]);
  const anyService = services.size > 0;

  return (
    <div className="space-y-4">
      {/* ── Open ports ─────────────────────────────────────────────────── */}
      <section className="scanner-section scanner-section-padding" aria-label="Open ports">
        <h3 className={`${SECTION_HEADER} mb-3`}>
          Open ports
          {ports.length > 0 && <span className="ml-2 text-gray-500">({ports.length})</span>}
        </h3>
        {ports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-violet-500/10 text-left text-gray-500">
                  <th scope="col" className="pb-2 pr-4 font-medium">Port</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Protocol</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">State</th>
                  {anyService && <th scope="col" className="pb-2 pr-4 font-medium">Service</th>}
                  <th scope="col" className="pb-2 font-medium">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {ports.map((port: DeduplicatedPort) => {
                  const service = services.get(`${port.number}/${port.protocol}`);
                  return (
                    <tr key={`${port.number}/${port.protocol}`} className="text-gray-300">
                      <td className="py-1.5 pr-4 font-mono font-medium text-white">{port.number}</td>
                      <td className="py-1.5 pr-4 font-mono text-gray-400">{port.protocol}</td>
                      <td className="py-1.5 pr-4">
                        <PortStateBadge state={port.state} />
                      </td>
                      {anyService && (
                        <td
                          className="max-w-[28rem] truncate py-1.5 pr-4 text-gray-300"
                          title={service ? service.serviceDetail ?? service.serviceLabel : undefined}
                        >
                          {service?.serviceLabel ?? <span className="text-gray-600">—</span>}
                        </td>
                      )}
                      <td className="py-1.5">
                        <div className="flex flex-wrap gap-1">
                          {port.sources.map((s) => (
                            <SourceBadge key={s} source={s} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!anyService && (
              <p className="mt-3 text-[11px] text-gray-500">
                No service has been identified on these ports yet.
              </p>
            )}
          </div>
        ) : (
          <EmptyState
            variant="no-data"
            size="compact"
            framed={false}
            title="No open ports recorded"
            reason="Scans of this host haven't reported an open port."
            primary={{ label: "Rescan host", icon: RotateCw, href: rescanHref(host.ip) }}
          />
        )}
      </section>

      {/* ── Network interfaces (agent) ─────────────────────────────────── */}
      <section className="scanner-section scanner-section-padding" aria-label="Network interfaces">
        <h3 className={`${SECTION_HEADER} mb-3`}>Network interfaces</h3>
        {agent.status === "none" ? (
          <NeedsAgentState
            agentInstalled={agent.agentInstalled}
            title="Interfaces need the agent"
            reason="A network scan sees open ports only. Install the Sirius agent to list interfaces and DNS servers."
          />
        ) : agent.status === "loading" ? (
          <p className="py-2 text-xs text-gray-500">Loading…</p>
        ) : interfaces.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-violet-500/10 text-left text-gray-500">
                  <th scope="col" className="pb-2 pr-4 font-medium">Name</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">MAC</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">IPv4</th>
                  <th scope="col" className="pb-2 font-medium">IPv6</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {interfaces.map((iface, idx) => (
                  <tr key={`${iface.name}-${idx}`} className="text-gray-300">
                    <td className="py-2 pr-4 font-mono font-medium text-white">{iface.name}</td>
                    <td className="py-2 pr-4 font-mono text-gray-400">{iface.mac ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono">{iface.ipv4.length ? iface.ipv4.join(", ") : "—"}</td>
                    <td className="py-2 font-mono text-gray-500">
                      {iface.ipv6.length
                        ? iface.ipv6.slice(0, 2).join(", ") +
                          (iface.ipv6.length > 2 ? ` +${iface.ipv6.length - 2}` : "")
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-2 text-xs text-gray-500">The agent hasn&apos;t reported any interfaces.</p>
        )}

        {dnsServers.length > 0 && (
          <div className="mt-3 border-t border-violet-500/5 pt-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">DNS servers</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {dnsServers.map((dns) => (
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
      </section>
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
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>{state || "—"}</span>;
}

export default HostNetwork;

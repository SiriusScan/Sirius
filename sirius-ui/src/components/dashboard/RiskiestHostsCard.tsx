/**
 * RiskiestHostsCard (R01) — the summary's riskiest hosts (`riskiestHosts`,
 * top 5 by the server's risk score, then critical and high counts; ADR-3),
 * each a HostCell linking to /host/<ip>. The full list lives in Environment.
 */

import React from "react";
import { Server } from "lucide-react";
import type { RiskiestHost } from "~/types/riskSummary";
import { HostCell } from "~/components/shared/HostCell";
import { DashboardPanel, PanelLink, PanelNote } from "./DashboardPanel";

/** The API uses "Unknown" as a placeholder; HostCell should show nothing. */
function real(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v && v.toLowerCase() !== "unknown" ? v : undefined;
}

export function RiskiestHostsCard({
  hosts,
  className,
}: {
  hosts: readonly RiskiestHost[];
  className?: string;
}) {
  return (
    <DashboardPanel
      icon={Server}
      title="Riskiest hosts"
      className={className}
      footer={<PanelLink href="/environment">View all hosts in Environment</PanelLink>}
    >
      {hosts.length === 0 ? (
        <PanelNote>No host has open findings.</PanelNote>
      ) : (
        <ul className="divide-y divide-violet-500/10">
          {hosts.map((host) => (
            <li key={host.ip} className="py-2.5 first:pt-0 last:pb-0">
              <HostCell
                host={{
                  ip: host.ip,
                  hostname: real(host.hostname),
                  os: real(host.os),
                  counts: host.counts,
                  riskScore: host.riskScore,
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  );
}

export default RiskiestHostsCard;

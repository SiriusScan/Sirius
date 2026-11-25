/**
 * EnvironmentDataTableColumns — the Environment hosts table's columns and
 * cells (R04): Host (HostCell), Open ports, Findings, Last scan, Sources and
 * the open-host action. Every value is real scan data from the API; a cell
 * with nothing to show renders "—".
 */

import React from "react";
import { cn } from "~/components/lib/utils";
import { HostCell } from "~/components/shared/HostCell";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { severityColors } from "~/components/shared/severity";
import { HostRowActions } from "~/components/HostRowActions";
import { formatDateTime } from "~/utils/formatDateTime";
import {
  displayHostname,
  displayOs,
  findingsLabel,
  portLabel,
  portsTitle,
  type HostRow,
  type HostSortKey,
} from "~/components/environment/hostsTableModel";

export type HostColumnId = "host" | "ports" | "findings" | "lastScan" | "sources" | "actions";

export interface HostColumn {
  id: HostColumnId;
  label: string;
  /** Header click sorts by this key. */
  sortKey?: HostSortKey;
  /** Shown as the header's title, e.g. what "Host" sorts by. */
  sortTitle?: string;
  /** <col> width class. */
  col: string;
  align?: "right";
}

export const HOST_COLUMNS: readonly HostColumn[] = [
  { id: "host", label: "Host", sortKey: "risk", sortTitle: "Sort by risk score", col: "w-[36%]" },
  { id: "ports", label: "Open ports", sortKey: "ports", col: "w-48" },
  { id: "findings", label: "Findings", sortKey: "findings", col: "w-44" },
  { id: "lastScan", label: "Last scan", sortKey: "lastScan", col: "w-36" },
  { id: "sources", label: "Sources", col: "w-40" },
  { id: "actions", label: "", col: "w-12", align: "right" },
];

const Dash = () => <span className="text-gray-600">—</span>;

const MAX_PORTS = 4;

export function OpenPortsCell({ host }: { host: HostRow }) {
  const ports = host.openPorts;
  if (ports.length === 0) return <Dash />;
  const shown = ports.slice(0, MAX_PORTS);
  const more = ports.length - shown.length;
  return (
    <span className="flex flex-wrap items-center gap-1" title={portsTitle(ports)}>
      {shown.map((p) => (
        <span
          key={`${p.port}/${p.protocol}`}
          className="inline-flex items-center rounded border border-gray-700/70 bg-gray-800/60 px-1.5 py-0.5 font-mono text-[11px] leading-none text-gray-300"
        >
          {portLabel(p)}
        </span>
      ))}
      {more > 0 && <span className="text-[11px] text-gray-500">+{more}</span>}
    </span>
  );
}

export function FindingsCell({ host }: { host: HostRow }) {
  const label = findingsLabel(host);
  if (!label.top && host.openFindings <= 0) {
    return <span className="text-xs text-gray-500">{label.open}</span>;
  }
  return (
    <span className="whitespace-nowrap text-xs text-gray-200 tabular-nums">
      {label.open}
      {label.top && (
        <>
          <span className="text-gray-600"> · </span>
          <span className={severityColors(label.top.severity).text}>{label.top.text}</span>
        </>
      )}
    </span>
  );
}

export function LastScanCell({ host }: { host: HostRow }) {
  const scan = host.lastScan;
  if (!scan) {
    return (
      <span className="text-gray-600" title="No scan has reported on this host">
        —
      </span>
    );
  }
  const by = [scan.source, scan.version].filter(Boolean).join(" ");
  const title = [
    `${formatDateTime(scan.time, "long")} by ${by}`,
    scan.profile && `Profile ${scan.profile}`,
  ]
    .filter(Boolean)
    .join("\n");
  return (
    <span className="whitespace-nowrap text-xs text-gray-300" title={title}>
      {formatDateTime(scan.time)}
    </span>
  );
}

const MAX_SOURCES = 3;

export function SourcesCell({ host }: { host: HostRow }) {
  const sources = host.sources;
  if (sources.length === 0) return <Dash />;
  const shown = sources.slice(0, MAX_SOURCES);
  const more = sources.length - shown.length;
  return (
    <span className="flex flex-wrap items-center gap-1" title={sources.join(", ")}>
      {shown.map((s) => (
        <SourceBadge key={s} source={s} className="px-1.5 text-[10px]" />
      ))}
      {more > 0 && <span className="text-[10px] text-gray-500">+{more}</span>}
    </span>
  );
}

export function HostColumnCell({ column, host }: { column: HostColumnId; host: HostRow }) {
  switch (column) {
    case "host":
      return (
        <HostCell
          host={{
            ip: host.ip,
            hostname: displayHostname(host),
            os: displayOs(host),
            counts: host.counts,
            riskScore: host.riskScore,
          }}
        />
      );
    case "ports":
      return <OpenPortsCell host={host} />;
    case "findings":
      return <FindingsCell host={host} />;
    case "lastScan":
      return <LastScanCell host={host} />;
    case "sources":
      return <SourcesCell host={host} />;
    case "actions":
      return (
        <div className={cn("flex justify-end")}>
          <HostRowActions host={{ ip: host.ip, hostname: displayHostname(host) }} />
        </div>
      );
  }
}

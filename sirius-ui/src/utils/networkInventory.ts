const reasons = {
  local_error: "Local submission error",
  http_rejected: "Inventory API rejection",
  timeout: "Timed out",
  transport_error: "Connection error",
  http_unconfirmed: "Inventory API response could not confirm acceptance",
} as const;

type Reason = keyof typeof reasons;
type ReasonCounts = Partial<Record<Reason, number>>;

const reasonGroups = {
  rejected: ["local_error", "http_rejected"],
  unknown: ["timeout", "transport_error", "http_unconfirmed"],
} as const satisfies Record<string, readonly Reason[]>;

const labels = {
  complete: "All network inventory reports accepted",
  incomplete: "Network inventory incomplete",
  unavailable: "Network inventory could not be confirmed",
  untracked: "Network inventory persistence untracked",
  provisional: "Network inventory summary is provisional",
  no_attempts: "No network inventory reports attempted",
} as const;

export interface NetworkInventorySummary {
  version: 1;
  finalized: boolean;
  attempted: number;
  accepted: number;
  rejected: number;
  unknown: number;
  reasons?: ReasonCounts;
}

export interface NetworkInventoryStatus {
  status: keyof typeof labels;
  summary?: NetworkInventorySummary;
}

export interface LiveScanExport {
  scanId?: string;
  networkInventory: NetworkInventoryStatus | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function parseSummary(raw: unknown): NetworkInventorySummary | null {
  if (!isRecord(raw) || raw.version !== 1) return null;
  const { finalized, attempted, accepted, rejected, unknown } = raw;
  if (
    typeof finalized !== "boolean" ||
    !isCount(attempted) ||
    !isCount(accepted) ||
    !isCount(rejected) ||
    !isCount(unknown) ||
    attempted !== accepted + rejected + unknown
  ) {
    return null;
  }

  if (raw.interrupted !== undefined && (
    typeof raw.interrupted !== "boolean" || (raw.interrupted && finalized)
  )) return null;

  const summary: NetworkInventorySummary = {
    version: 1, finalized, attempted, accepted, rejected, unknown,
  };
  if (raw.reasons === undefined) return summary;
  const rawReasons = raw.reasons;
  if (!isRecord(rawReasons)) return null;
  const counts: ReasonCounts = {};
  for (const group of ["rejected", "unknown"] as const) {
    let total = 0;
    for (const reason of reasonGroups[group]) {
      const count = rawReasons[reason];
      if (count === undefined) continue;
      if (!isCount(count)) return null;
      if (count > 0) {
        counts[reason] = count;
        total += count;
      }
    }
    if (total > summary[group]) return null;
  }
  if (Object.keys(counts).length > 0) summary.reasons = counts;
  return summary;
}

export function projectNetworkInventory(scan: unknown): NetworkInventoryStatus | null {
  if (!isRecord(scan) || scan.status === "idle") return null;
  const untracked = { status: "untracked" } as const;
  const unavailable = { status: "unavailable" } as const;
  const subScans = scan.sub_scans;
  if (subScans === undefined || subScans === null) return untracked;
  if (!isRecord(subScans)) return unavailable;
  const { network, agent } = subScans;
  if (network === undefined) {
    return isRecord(agent) && agent.enabled === true ? null : untracked;
  }
  if (!isRecord(network)) return unavailable;
  if (network.enabled === false) return null;
  if (network.metadata === undefined) return untracked;
  if (!isRecord(network.metadata)) return unavailable;
  if (network.metadata.inventory_reports === undefined) return untracked;

  if (network.enabled !== true) return unavailable;

  const summary = parseSummary(network.metadata.inventory_reports);
  if (!summary || (summary.finalized && network.status !== "completed")) {
    return unavailable;
  }
  if (!summary.finalized) return { status: "provisional", summary };
  if (summary.attempted === 0) return { status: "no_attempts", summary };
  if (summary.rejected > 0) return { status: "incomplete", summary };
  if (summary.unknown > 0) return { status: "unavailable", summary };
  return { status: "complete", summary };
}

export function describeNetworkInventory({ status, summary }: NetworkInventoryStatus) {
  const label = labels[status];
  if (!summary) return { label };
  const counts = `${summary.attempted} attempted, ${summary.accepted} accepted, ${summary.rejected} rejected, ${summary.unknown} unconfirmed`;
  const reasonLabels = (Object.keys(reasons) as Reason[]).flatMap((reason) => {
    const count = summary.reasons?.[reason];
    return count ? [`${reasons[reason]} (${count})`] : [];
  });
  return { label, counts, reasons: reasonLabels.join(" · ") };
}

export function createLiveScanExport(scan: unknown): LiveScanExport {
  const id = isRecord(scan) ? scan.id : undefined;
  return {
    scanId: typeof id === "string" && id.trim() ? id : undefined,
    networkInventory: projectNetworkInventory(scan),
  };
}

export function liveScanExportFields({ scanId, networkInventory }: LiveScanExport) {
  const fields: Record<string, string | number | boolean> = { data_source: "live_scan" };
  if (scanId) fields.scan_id = scanId;
  if (!networkInventory) return fields;
  fields.network_inventory_status = networkInventory.status;
  const summary = networkInventory.summary;
  if (!summary) return fields;
  return {
    ...fields,
    network_inventory_finalized: summary.finalized,
    network_inventory_attempted: summary.attempted,
    network_inventory_accepted: summary.accepted,
    network_inventory_rejected: summary.rejected,
    network_inventory_unknown: summary.unknown,
    network_inventory_reasons: describeNetworkInventory(networkInventory).reasons ?? "",
  };
}

export function serializeLiveScanExport(
  format: "csv" | "json",
  rows: Record<string, unknown>[],
  fields: Record<string, string | number | boolean>,
): string {
  const withMetadata = rows.map((row) => ({ ...row, ...fields }));
  if (format === "json") return JSON.stringify(withMetadata, null, 2);

  const columns = Object.keys(withMetadata[0] ?? fields);
  const csvCell = (value: unknown) => {
    const cell = value == null ? "" : String(value);
    return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
  };
  return [
    columns.map(csvCell).join(","),
    ...withMetadata.map((row) => columns.map((key) => csvCell(row[key])).join(",")),
  ].join("\n");
}

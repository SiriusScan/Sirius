/**
 * hostsTableModel.ts — the Environment hosts table's pure parts (R04):
 * search and filters, sorting by the server's risk score, CSV export, cell
 * labels and the "new hosts" banner. Tested in hostsTableModel.test.ts.
 *
 * Risk comes from the API (ADR-3): rows carry `riskScore`, `riskBand` and
 * `counts`, and this file only orders and labels them.
 */

import { compareRisk } from "~/utils/risk";
import { formatDateTime } from "~/utils/formatDateTime";
import type { HostLastScan, OpenPort } from "~/types/riskSummary";
import { SEVERITIES, type Severity, type SeverityCounts } from "~/components/shared/severity";

/** The fields of a host.getEnvironmentSummary row the table uses. */
export interface HostRow {
  ip: string;
  /** The API sends the placeholder "Unknown" when there is no hostname. */
  hostname?: string | null;
  /** The API sends the placeholder "Unknown" when there is no OS. */
  os?: string | null;
  /** 0–10 from the API; the browser never computes it. */
  riskScore: number;
  counts: SeverityCounts;
  openFindings: number;
  openPorts: readonly OpenPort[];
  /** Sources that reported on the host ("nmap", "naabu", "agent", "manual"). */
  sources: readonly string[];
  /** When the host entered the inventory (ISO), or null. */
  firstSeen: string | null;
  /** Newest observation by a scan source, or null when no scan reported. */
  lastScan: HostLastScan | null;
}

// ── Display helpers ─────────────────────────────────────────────────────────

const PLACEHOLDERS = new Set(["", "unknown", "n/a", "none"]);

/** A real value, or undefined for empty strings and API placeholders. */
export function realText(value: string | null | undefined): string | undefined {
  const text = value?.trim();
  if (!text || PLACEHOLDERS.has(text.toLowerCase())) return undefined;
  return text;
}

export const displayHostname = (row: Pick<HostRow, "hostname">) => realText(row.hostname);
export const displayOs = (row: Pick<HostRow, "os">) => realText(row.os);

/** "22" for TCP, "53/udp" for anything else. */
export function portLabel(port: Pick<OpenPort, "port" | "protocol">): string {
  const protocol = (port.protocol || "tcp").toLowerCase();
  return protocol === "tcp" ? String(port.port) : `${port.port}/${protocol}`;
}

/** "22/tcp, 80/tcp" for a hover title or CSV. */
export function portsTitle(ports: readonly OpenPort[]): string {
  return ports.map((p) => `${p.port}/${(p.protocol || "tcp").toLowerCase()}`).join(", ");
}

export interface FindingsLabel {
  /** "162 open", or "No open findings". */
  open: string;
  /** The most severe of critical or high, when the host has any. */
  top?: { severity: Severity; count: number; text: string };
}

/** "162 open · 3 high": open findings plus the critical (else high) count. */
export function findingsLabel(row: Pick<HostRow, "openFindings" | "counts">): FindingsLabel {
  if (!(row.openFindings > 0)) return { open: "No open findings" };
  const open = `${row.openFindings.toLocaleString("en-US")} open`;
  for (const severity of ["critical", "high"] as const) {
    const count = row.counts[severity] ?? 0;
    if (count > 0) {
      return { open, top: { severity, count, text: `${count.toLocaleString("en-US")} ${severity}` } };
    }
  }
  return { open };
}

// ── Filtering ───────────────────────────────────────────────────────────────

export interface HostFilters {
  /** Matches the hostname, IP or OS. */
  search?: string;
  /** Hosts with at least one open finding at any of these levels. */
  severities?: readonly Severity[];
  /** Exact OS names (as displayOs returns them); OS_UNKNOWN for hosts without one. */
  os?: readonly string[];
  /** Hosts reported by any of these sources. */
  sources?: readonly string[];
  /** Only these IPs (the "Show new hosts" filter). */
  onlyIps?: ReadonlySet<string> | null;
}

/** The OS filter value for hosts the scans could not fingerprint. */
export const OS_UNKNOWN = "__unknown__";

export function filterHosts<T extends HostRow>(rows: readonly T[], filters: HostFilters = {}): T[] {
  const q = (filters.search ?? "").trim().toLowerCase();
  const severities = filters.severities ?? [];
  const os = filters.os ?? [];
  const sources = filters.sources ?? [];
  const only = filters.onlyIps;
  return rows.filter((row) => {
    if (only && !only.has(row.ip)) return false;
    if (severities.length > 0 && !severities.some((s) => (row.counts[s] ?? 0) > 0)) return false;
    if (os.length > 0 && !os.includes(displayOs(row) ?? OS_UNKNOWN)) return false;
    if (sources.length > 0 && !row.sources.some((s) => sources.includes(s))) return false;
    if (!q) return true;
    return (
      row.ip.toLowerCase().includes(q) ||
      (displayHostname(row) ?? "").toLowerCase().includes(q) ||
      (displayOs(row) ?? "").toLowerCase().includes(q)
    );
  });
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

function optionsFrom(values: string[], labelFor: (v: string) => string): FilterOption[] {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: labelFor(value), count }))
    .sort((a, b) => {
      // "Unknown" last; otherwise most hosts first, then A→Z.
      if (a.value === OS_UNKNOWN) return 1;
      if (b.value === OS_UNKNOWN) return -1;
      return b.count - a.count || a.label.localeCompare(b.label);
    });
}

/** The OS values present, with host counts, for the Filters popover. */
export function osOptions(rows: readonly HostRow[]): FilterOption[] {
  return optionsFrom(
    rows.map((r) => displayOs(r) ?? OS_UNKNOWN),
    (v) => (v === OS_UNKNOWN ? "Not identified" : v),
  );
}

/** The sources present, with host counts, for the Filters popover. */
export function sourceOptions(rows: readonly HostRow[]): FilterOption[] {
  return optionsFrom(
    rows.flatMap((r) => [...new Set(r.sources)]),
    (v) => v,
  );
}

// ── Sorting ─────────────────────────────────────────────────────────────────

export type HostSortKey = "risk" | "ports" | "findings" | "lastScan";
export type SortDirection = "asc" | "desc";
export interface HostSort {
  key: HostSortKey;
  dir: SortDirection;
}

export const DEFAULT_HOST_SORT: HostSort = { key: "risk", dir: "desc" };

export const SORT_LABELS: Record<HostSortKey, string> = {
  risk: "risk score",
  ports: "open ports",
  findings: "open findings",
  lastScan: "last scan",
};

function timeOf(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** IPv4 in numeric order (10.0.0.2 before 10.0.0.10). */
export function compareIp(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0 && Number.isFinite(d)) return d;
  }
  return a.localeCompare(b);
}

function sortValue(row: HostRow, key: HostSortKey): number | null {
  switch (key) {
    case "risk":
      return Number.isFinite(row.riskScore) ? row.riskScore : null;
    case "ports":
      return row.openPorts.length;
    case "findings":
      return row.openFindings;
    case "lastScan":
      return timeOf(row.lastScan?.time);
  }
}

/**
 * Sorts a copy. The default is the server's risk score, highest first, with
 * ties broken as the API ranks hosts (critical count, then high count).
 * Missing values go last either way; final ties fall back to the IP.
 */
export function sortHosts<T extends HostRow>(rows: readonly T[], sort: HostSort = DEFAULT_HOST_SORT): T[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = sortValue(a, sort.key);
    const bv = sortValue(b, sort.key);
    if (av !== bv) {
      if (av === null) return 1;
      if (bv === null) return -1;
      return (av - bv) * sign;
    }
    const risk = compareRisk(a, b);
    if (risk !== 0) return risk;
    return compareIp(a.ip, b.ip);
  });
}

/** Clicking a column sorts it highest/newest first; again flips it. */
export function nextHostSort(current: HostSort, key: HostSortKey): HostSort {
  if (current.key === key) return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  return { key, dir: "desc" };
}

/** "3 hosts · sorted by risk score" (and "lowest first" when ascending). */
export function hostsFooterLabel(count: number, sort: HostSort, total?: number): string {
  const n = `${count.toLocaleString("en-US")} host${count === 1 ? "" : "s"}`;
  const of = total !== undefined && total !== count ? ` of ${total.toLocaleString("en-US")}` : "";
  const dir =
    sort.dir === "asc" ? (sort.key === "lastScan" ? ", oldest first" : ", lowest first") : "";
  return `${n}${of} · sorted by ${SORT_LABELS[sort.key]}${dir}`;
}

// ── CSV export ──────────────────────────────────────────────────────────────

const CSV_HEADERS = [
  "Hostname",
  "IP",
  "OS",
  "Risk score",
  "Open findings",
  "Critical",
  "High",
  "Medium",
  "Low",
  "Info",
  "Open ports",
  "Last scan",
  "Last scan source",
  "Sources",
  "First seen",
];

/**
 * One CSV field: quoted when needed, and prefixed with ' when it starts
 * like a spreadsheet formula (host names come from scanned networks).
 */
export function csvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The given rows as CSV, in the order shown. Times stay ISO for tools. */
export function hostsCsv(rows: readonly HostRow[]): string {
  const lines = [CSV_HEADERS.map(csvField).join(",")];
  for (const row of rows) {
    lines.push(
      [
        displayHostname(row) ?? "",
        row.ip,
        displayOs(row) ?? "",
        Number.isFinite(row.riskScore) ? row.riskScore.toFixed(1) : "",
        row.openFindings,
        ...SEVERITIES.map((s) => row.counts[s] ?? 0),
        portsTitle(row.openPorts),
        row.lastScan?.time ?? "",
        row.lastScan?.source ?? "",
        row.sources.join(" "),
        row.firstSeen ?? "",
      ]
        .map(csvField)
        .join(","),
    );
  }
  return `${lines.join("\r\n")}\r\n`;
}

/** "sirius-hosts-2026-11-21.csv" for the viewer's local date. */
export function hostsCsvFilename(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `sirius-hosts-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`;
}

// ── New hosts since the viewer last looked ──────────────────────────────────

/** localStorage key holding the newest first-seen time the viewer has seen. */
export const LAST_SEEN_KEY = "environment.lastSeenAt";

/** Marker for "the viewer saw an empty inventory": every later host is new. */
export const EMPTY_INVENTORY_MARKER = "1970-01-01T00:00:00.000Z";

/** The newest first-seen time among the rows (ISO), or null. */
export function latestFirstSeen(rows: readonly Pick<HostRow, "firstSeen">[]): string | null {
  let best: number | null = null;
  for (const row of rows) {
    const t = timeOf(row.firstSeen);
    if (t !== null && (best === null || t > best)) best = t;
  }
  return best === null ? null : new Date(best).toISOString();
}

/**
 * The marker to store on a first visit: everything listed now counts as
 * seen. Comparing server times with server times avoids clock skew.
 */
export function initialMarker(rows: readonly Pick<HostRow, "firstSeen">[]): string {
  return latestFirstSeen(rows) ?? EMPTY_INVENTORY_MARKER;
}

/** The later of the stored marker and the newest host, for "dismiss". */
export function advanceMarker(
  marker: string | null,
  rows: readonly Pick<HostRow, "firstSeen">[],
): string {
  const latest = timeOf(latestFirstSeen(rows));
  const current = timeOf(marker);
  const best = Math.max(latest ?? -Infinity, current ?? -Infinity);
  return Number.isFinite(best) ? new Date(best).toISOString() : EMPTY_INVENTORY_MARKER;
}

/**
 * Hosts a scan added after the marker: first seen later than it, and
 * reported by a scan source (a host added by hand has no scan time).
 */
export function newHostsSince<T extends Pick<HostRow, "firstSeen" | "lastScan">>(
  rows: readonly T[],
  marker: string | null | undefined,
): T[] {
  const since = timeOf(marker);
  if (since === null) return [];
  return rows.filter((row) => {
    const t = timeOf(row.firstSeen);
    return t !== null && t > since && !!row.lastScan;
  });
}

/** The scan the summary reports, as far as the banner needs it. */
export interface BannerScan {
  startedAt?: string;
  finishedAt?: string;
}

/** A host saved this long before the scan's recorded start still belongs to it. */
const SCAN_START_SLACK_MS = 60_000;
/** Hosts are saved while a scan runs; allow for late ingest after it ends. */
const SCAN_END_SLACK_MS = 10 * 60_000;

/**
 * The time of the scan that added every one of the new hosts, or null when
 * they can't all be tied to the last scan (then the banner names no scan).
 */
export function scanTimeForNewHosts(
  newRows: readonly Pick<HostRow, "firstSeen">[],
  scan: BannerScan | null | undefined,
): string | null {
  if (!scan || newRows.length === 0) return null;
  const start = timeOf(scan.startedAt);
  if (start === null) return null;
  const end = timeOf(scan.finishedAt);
  const inScan = newRows.every((row) => {
    const t = timeOf(row.firstSeen);
    if (t === null) return false;
    if (t < start - SCAN_START_SLACK_MS) return false;
    return end === null || t <= end + SCAN_END_SLACK_MS;
  });
  if (!inScan) return null;
  return scan.finishedAt ?? scan.startedAt ?? null;
}

/**
 * "1 new host from the scan at Nov 21, 12:04 PM was added automatically."
 * Without a scan to name, it says since when (or nothing, after an empty
 * inventory).
 */
export function newHostsBannerText(
  count: number,
  scanTime: string | null,
  marker: string | null | undefined,
  format: (iso: string) => string = (iso) => formatDateTime(iso),
): string {
  const hosts = `${count.toLocaleString("en-US")} new host${count === 1 ? "" : "s"}`;
  const verb = count === 1 ? "was" : "were";
  if (scanTime) return `${hosts} from the scan at ${format(scanTime)} ${verb} added automatically.`;
  if (marker && marker !== EMPTY_INVENTORY_MARKER && timeOf(marker) !== null) {
    return `${hosts} from scans since ${format(marker)} ${verb} added automatically.`;
  }
  return `${hosts} from scans ${verb} added automatically.`;
}

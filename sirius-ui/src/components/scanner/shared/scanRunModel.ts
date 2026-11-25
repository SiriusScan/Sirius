/**
 * scanRunModel.ts — the Scanner page's pure parts (R03): the run card's
 * title, targets, elapsed time, steps and profile; this scan's findings as
 * VulnTable rows; and each found host's inventory badge.
 *
 * Everything here reads the scanner's own state (ValKey `currentScan`) or the
 * server's answers. Nothing is invented: a step, a percentage or a profile
 * that the scan state does not carry is left out. Tested in
 * scanRunModel.test.ts.
 */

import type { ScanResult, ScanTargetEntry, SubScan } from "~/types/scanTypes";
import type { HostLastScan } from "~/types/riskSummary";
import {
  SEVERITIES,
  emptySeverityCounts,
  severityRank,
  type Severity,
  type SeverityCounts,
} from "~/components/shared/severity";
import type { VulnRow } from "~/components/shared/vulnTableModel";
import { combinePortServices } from "~/utils/portService";

/* ------------------------------------------------------------------ */
/*  Status                                                             */
/* ------------------------------------------------------------------ */

const ENDED: ReadonlySet<string> = new Set(["completed", "cancelled", "failed"]);

/** The scanner has finished with this scan (completed, stopped or failed). */
export function isScanEnded(status: unknown): boolean {
  return typeof status === "string" && ENDED.has(status);
}

/** Card title for the scan's status. */
export function runTitle(status: string | undefined): string {
  switch (status) {
    case "running":
      return "Running scan";
    case "cancelling":
      return "Stopping scan";
    case "completed":
      return "Scan completed";
    case "cancelled":
      return "Scan stopped";
    case "failed":
      return "Scan failed";
    case "pending":
      return "Scan pending";
    default:
      return "Scan";
  }
}

/* ------------------------------------------------------------------ */
/*  Targets                                                            */
/* ------------------------------------------------------------------ */

/** Each target as entered: an IP, a range, a CIDR or a hostname. */
export function scanTargetLabels(targets: readonly ScanTargetEntry[] | null | undefined): string[] {
  const out: string[] = [];
  for (const t of targets ?? []) {
    const label =
      typeof t === "string" ? t : t ? t.ip ?? t.value ?? t.hostname ?? t.id ?? "" : "";
    const trimmed = label.trim();
    if (trimmed && !out.includes(trimmed)) out.push(trimmed);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/*  Time                                                               */
/* ------------------------------------------------------------------ */

/** The trimmed text, or undefined when it is blank. */
function orUndefined(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function timeOf(value: string | null | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  // Go's zero time ("0001-01-01T00:00:00Z") parses to a negative epoch.
  return Number.isFinite(t) && t > 0 ? t : null;
}

/**
 * Milliseconds from start to end (or to `now` while the scan runs); null
 * when the start is unknown. Never negative.
 */
export function elapsedMs(
  start: string | null | undefined,
  end: string | null | undefined,
  now: number = Date.now(),
): number | null {
  const s = timeOf(start);
  if (s === null) return null;
  const e = timeOf(end) ?? now;
  return Math.max(0, e - s);
}

/**
 * How long the scan has run (live, while active) or ran (start to end once
 * ended). Null when the start is unknown, or when an ended scan has no end
 * time, rather than a guess.
 */
export function scanDurationMs(
  start: string | null | undefined,
  end: string | null | undefined,
  active: boolean,
  now: number = Date.now(),
): number | null {
  if (active) return elapsedMs(start, undefined, now);
  return timeOf(end) === null ? null : elapsedMs(start, end);
}

/** "0:05", "23:41", "1:02:03". */
export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

/* ------------------------------------------------------------------ */
/*  Steps (from the scan's own sub-scans)                              */
/* ------------------------------------------------------------------ */

export type StepState = "done" | "running" | "pending" | "failed" | "stopped";

export interface ScanStep {
  id: string;
  label: string;
  state: StepState;
  /** "0 of 1 hosts", when the scanner reports counters. */
  detail?: string;
}

const SUB_SCAN_LABELS: Record<string, { label: string; unit: string }> = {
  network: { label: "Network scan", unit: "hosts" },
  agent: { label: "Agent scan", unit: "agents" },
  cloud: { label: "Cloud scan", unit: "resources" },
  application: { label: "App scan", unit: "endpoints" },
};

const SUB_SCAN_ORDER = ["network", "agent", "cloud", "application"];

function subScanLabel(key: string): string {
  return SUB_SCAN_LABELS[key]?.label ?? `${key.charAt(0).toUpperCase()}${key.slice(1)} scan`;
}

function nonNegative(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/** "0 of 1 hosts", or undefined while the scanner has reported no counters. */
export function subScanDetail(key: string, sub: Pick<SubScan, "progress"> | null | undefined): string | undefined {
  const total = nonNegative(sub?.progress?.total);
  const completed = nonNegative(sub?.progress?.completed);
  if (total === 0 && completed === 0) return undefined;
  const unit = orUndefined(sub?.progress?.label) ?? SUB_SCAN_LABELS[key]?.unit ?? "items";
  return total > 0 ? `${Math.min(completed, total)} of ${total} ${unit}` : `${completed} ${unit}`;
}

function subScanState(subStatus: string | undefined, scanStatus: string | undefined): StepState {
  switch (subStatus) {
    case "completed":
      return "done";
    case "failed":
      return "failed";
    case "cancelled":
      return "stopped";
    case "running":
    case "dispatching":
      return isScanEnded(scanStatus) ? "stopped" : "running";
    default:
      return isScanEnded(scanStatus) ? "stopped" : "pending";
  }
}

/**
 * One step per sub-scan the scan state carries (network, agent…), in a
 * stable order, then the final step. The scanner does not report finer
 * phases (discovery, port enumeration, vulnerability checks), so none are
 * shown. Empty when the state has no sub-scans.
 */
export function scanSteps(scan: Partial<Pick<ScanResult, "status" | "sub_scans">> | null | undefined): ScanStep[] {
  const subs = scan?.sub_scans;
  if (!subs || typeof subs !== "object") return [];
  const keys = Object.keys(subs)
    .filter((k) => subs[k] && subs[k]!.enabled !== false)
    .sort((a, b) => {
      const ia = SUB_SCAN_ORDER.indexOf(a);
      const ib = SUB_SCAN_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });
  if (keys.length === 0) return [];

  const status = scan?.status;
  const steps: ScanStep[] = keys.map((key) => {
    const sub = subs[key]!;
    const detail = subScanDetail(key, sub);
    return {
      id: key,
      label: subScanLabel(key),
      state: subScanState(sub.status as string | undefined, status),
      ...(detail ? { detail } : {}),
    };
  });

  const final: ScanStep =
    status === "completed"
      ? { id: "end", label: "Complete", state: "done" }
      : status === "cancelled"
        ? { id: "end", label: "Stopped", state: "stopped" }
        : status === "failed"
          ? { id: "end", label: "Failed", state: "failed" }
          : { id: "end", label: "Complete", state: "pending" };
  steps.push(final);
  return steps;
}

/** The step to describe beside the progress bar: the first one still running. */
export function currentStep(steps: readonly ScanStep[]): ScanStep | undefined {
  return steps.find((s) => s.state === "running") ?? steps.find((s) => s.state === "pending" && s.id !== "end");
}

/* ------------------------------------------------------------------ */
/*  Profile                                                            */
/* ------------------------------------------------------------------ */

function stringField(record: unknown, key: string): string | undefined {
  if (!record || typeof record !== "object") return undefined;
  const value = (record as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/**
 * The profile this scan runs with, when something real records it: a
 * `profile_id` / `template_id` on the scan state (the scanner keeps fields
 * it does not know), or the `template:<id>` the scanner wrote into a host's
 * source config for this scan id. Undefined otherwise.
 */
export function scanProfileId(
  scan: unknown,
  lastScans: ReadonlyArray<HostLastScan | null | undefined> = [],
): string | undefined {
  const direct =
    stringField(scan, "profile_id") ??
    stringField(scan, "template_id") ??
    stringField((scan as { options?: unknown } | null)?.options, "profile_id") ??
    stringField((scan as { options?: unknown } | null)?.options, "template_id");
  if (direct) return direct;
  const scanId = stringField(scan, "id");
  if (!scanId) return undefined;
  for (const last of lastScans) {
    if (last?.scanId === scanId && last.profile) return last.profile;
  }
  return undefined;
}

export interface ProfileInfo {
  id: string;
  name: string;
  /** Enabled scripts in the profile, when the profile is known. */
  scripts?: number;
}

/** The profile's name and script count; the id alone when it is not listed. */
export function profileInfo(
  id: string | undefined,
  profiles: ReadonlyArray<{ id: string; name?: string; enabled_scripts?: readonly string[] | null }> | null | undefined,
): ProfileInfo | undefined {
  if (!id) return undefined;
  const p = profiles?.find((x) => x.id === id);
  if (!p) return { id, name: id };
  return {
    id,
    name: orUndefined(p.name) ?? id,
    ...(Array.isArray(p.enabled_scripts) ? { scripts: p.enabled_scripts.length } : {}),
  };
}

/** "High Risk Scan · 14 scripts". */
export function profileLabel(info: ProfileInfo): string {
  if (info.scripts === undefined) return info.name;
  return `${info.name} · ${info.scripts} script${info.scripts === 1 ? "" : "s"}`;
}

/* ------------------------------------------------------------------ */
/*  Findings                                                           */
/* ------------------------------------------------------------------ */

/** What this page needs from a scan finding (useScanDataMapping's ScanVulnRow). */
export interface ScanFindingInput {
  id: string;
  severityKey: Severity;
  cvss: number;
  summary?: string;
  host_id?: string;
  component?: { label: string } | null;
  /** Port / service from the finding's own fields (formatPortService). */
  portService?: string;
}

/** Findings by severity, one per host and CVE, as the scan reported them. */
export function scanSeverityCounts(findings: readonly Pick<ScanFindingInput, "severityKey">[]): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const f of findings) {
    if (SEVERITIES.includes(f.severityKey)) counts[f.severityKey]++;
    else counts.info++;
  }
  return counts;
}

/**
 * One VulnTable row per CVE: the highest CVSS and severity any host
 * reported, the first clean summary, how many hosts this scan found it on,
 * and the port/service — the one label when every host agrees, else
 * "80/tcp · 2 versions" with each host's label in the cell's tooltip.
 */
export function aggregateScanFindings(findings: readonly ScanFindingInput[]): VulnRow[] {
  const byId = new Map<string, { row: VulnRow; hosts: Map<string, string | undefined> }>();
  findings.forEach((f, index) => {
    const id = orUndefined(f.id) ?? "Unknown";
    const cvss = Number.isFinite(f.cvss) && f.cvss > 0 ? f.cvss : 0;
    const hostKey = orUndefined(f.host_id) ?? `#${index}`;
    const label = orUndefined(f.portService) ?? orUndefined(f.component?.label);
    const entry = byId.get(id);
    if (!entry) {
      byId.set(id, {
        row: { id, severity: f.severityKey, cvss, summary: f.summary?.trim() ?? "" },
        hosts: new Map([[hostKey, label]]),
      });
      return;
    }
    if (!entry.hosts.get(hostKey)) entry.hosts.set(hostKey, label);
    const row = entry.row;
    if (cvss > row.cvss) row.cvss = cvss;
    if (severityRank(f.severityKey) > severityRank(row.severity)) row.severity = f.severityKey;
    if (!row.summary && f.summary?.trim()) row.summary = f.summary.trim();
  });
  return [...byId.values()].map(({ row, hosts }) => {
    const { label, detail } = combinePortServices([...hosts.entries()]);
    return {
      ...row,
      ...(label ? { portService: label } : {}),
      ...(detail ? { portServiceDetail: detail } : {}),
      hosts: hosts.size,
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Inventory badge                                                    */
/* ------------------------------------------------------------------ */

export type InventoryBadge =
  | { kind: "saved" | "updated" | "since"; label: string; time: string }
  | { kind: "listed" | "pending" | "missing"; label: string };

/**
 * What to say about a found host and the inventory (ADR-1):
 * - saved:   the host record was created during this scan.
 * - updated: it already existed and this scan wrote to it (its newest
 *            source config carries this scan id).
 * - since:   it was already in the inventory.
 * - listed:  in the inventory, times not loaded yet.
 * - pending: not there yet while the scan runs.
 * - missing: not there after the scan ended.
 */
export function inventoryBadge(input: {
  inInventory: boolean;
  savedAt?: string | null;
  lastScan?: HostLastScan | null;
  scanId?: string;
  scanStart?: string;
  scanActive: boolean;
}): InventoryBadge {
  if (!input.inInventory) {
    return input.scanActive
      ? { kind: "pending", label: "Not saved yet" }
      : { kind: "missing", label: "Not in inventory" };
  }
  const saved = timeOf(input.savedAt);
  const start = timeOf(input.scanStart);
  if (saved !== null && start !== null && saved >= start && input.savedAt) {
    return { kind: "saved", label: "Saved to inventory", time: input.savedAt };
  }
  if (input.scanId && input.lastScan?.scanId === input.scanId && timeOf(input.lastScan.time) !== null) {
    return { kind: "updated", label: "Updated in inventory", time: input.lastScan.time };
  }
  if (saved !== null && input.savedAt) {
    return { kind: "since", label: "In inventory since", time: input.savedAt };
  }
  return { kind: "listed", label: "In inventory" };
}

/* ------------------------------------------------------------------ */
/*  Hosts                                                              */
/* ------------------------------------------------------------------ */

/** The scanner and older rows use "unknown" for "not known"; show nothing. */
export function knownText(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  if (!v) return undefined;
  return v.toLowerCase() === "unknown" ? undefined : v;
}

/** "/scanner?target=a,b": the Scanner form, pre-filled. */
export function rescanHref(targets: readonly string[]): string {
  return `/scanner?target=${encodeURIComponent(targets.join(","))}`;
}

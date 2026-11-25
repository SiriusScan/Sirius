/**
 * dashboardModel.ts — the Dashboard's pure decisions (R01/R02), kept out of
 * React so they are tested without a browser (dashboardModel.test.ts).
 *
 * Every number here comes from `statistics.getSummary` (ADR-2); nothing is
 * derived from list queries and nothing is invented. A field the summary
 * does not carry is left out rather than guessed.
 */

import type { SummaryLastScan, SummaryStats } from "~/types/riskSummary";
import {
  formatDateTime,
  toDate,
  type DateInput,
  type FormatDateTimeOptions,
} from "~/utils/formatDateTime";
import { formatSeverityParam, type Severity } from "~/components/shared/severity";

/* ------------------------------------------------------------------ */
/*  First run (R02)                                                    */
/* ------------------------------------------------------------------ */

/** No hosts and no open findings: show the starter cards, not empty widgets. */
export function isFirstRun(summary: Pick<SummaryStats, "hosts" | "findings">): boolean {
  return summary.hosts.total === 0 && summary.findings.open === 0;
}

/* ------------------------------------------------------------------ */
/*  Wording helpers                                                    */
/* ------------------------------------------------------------------ */

/** "1 target", "3 targets", "1,204 findings". */
export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

const UUID_PREFIX = /^[0-9a-f]{8}-[0-9a-f]{4}-/i;

/** "eec1dfcc-2e64-…" -> "eec1dfcc"; other ids are kept, long ones cut. */
export function shortScanId(id: string | null | undefined): string | undefined {
  const value = id?.trim();
  if (!value) return undefined;
  if (UUID_PREFIX.test(value)) return value.slice(0, 8);
  return value.length > 24 ? `${value.slice(0, 23)}…` : value;
}

/** "192.0.2.12", "192.0.2.12, 10.0.0.0/24", "a, b and 3 more". */
export function targetsLabel(targets: readonly string[] | undefined): string | undefined {
  const list = (targets ?? []).map((t) => t.trim()).filter(Boolean);
  if (list.length === 0) return undefined;
  if (list.length <= 2) return list.join(", ");
  return `${list.slice(0, 2).join(", ")} and ${list.length - 2} more`;
}

/* ------------------------------------------------------------------ */
/*  Last scan                                                          */
/* ------------------------------------------------------------------ */

export type ScanPhase = "running" | "finished" | "stopped" | "failed" | "unknown";

const RUNNING = new Set(["pending", "running", "cancelling"]);

/** Where the last scan stands, from the scanner's own status. */
export function scanPhase(scan: Pick<SummaryLastScan, "status" | "finishedAt">): ScanPhase {
  const status = (scan.status ?? "").toLowerCase();
  if (status === "failed") return "failed";
  if (status === "cancelled") return "stopped";
  if (RUNNING.has(status)) return "running";
  if (status === "completed" || scan.finishedAt) return "finished";
  return "unknown";
}

type Fmt = (value: DateInput) => string;

function withTime(word: string, value: DateInput, fmt: Fmt): string {
  return toDate(value) ? `${word} ${fmt(value)}` : word;
}

export interface LastScanHeading {
  /** "Since the last scan", "Scan in progress", or "Inventory" with no scan. */
  title: string;
  /** "finished Nov 21, 12:04 PM", "started …"; absent when nothing is known. */
  when?: string;
}

/** The "Since the last scan" card's heading. */
export function lastScanHeading(
  scan: SummaryLastScan | null | undefined,
  fmt: Fmt = (v) => formatDateTime(v),
): LastScanHeading {
  if (!scan) return { title: "Inventory" };
  const phase = scanPhase(scan);
  switch (phase) {
    case "running":
      return {
        title: "Scan in progress",
        ...(toDate(scan.startedAt) ? { when: withTime("started", scan.startedAt, fmt) } : {}),
      };
    case "finished":
      return { title: "Since the last scan", when: withTime("finished", scan.finishedAt, fmt) };
    case "stopped":
      return { title: "Since the last scan", when: withTime("stopped", scan.finishedAt, fmt) };
    case "failed":
      return {
        title: "Since the last scan",
        when: withTime("failed", scan.finishedAt ?? scan.startedAt, fmt),
      };
    default:
      return {
        title: "Since the last scan",
        ...(toDate(scan.startedAt) ? { when: withTime("started", scan.startedAt, fmt) } : {}),
      };
  }
}

/** "Scan eec1dfcc · 1 target"; parts the summary does not carry are left out. */
export function lastScanMeta(scan: SummaryLastScan | null | undefined): string | undefined {
  if (!scan) return undefined;
  const parts: string[] = [];
  const id = shortScanId(scan.id);
  if (id) parts.push(`Scan ${id}`);
  const targets = (scan.targets ?? []).filter((t) => t.trim());
  if (targets.length > 0) parts.push(plural(targets.length, "target"));
  return parts.length ? parts.join(" · ") : undefined;
}

/** The header chip's time: when the last scan ended. Undefined while it runs. */
export function lastScanEndedAt(scan: SummaryLastScan | null | undefined): string | undefined {
  if (!scan || scanPhase(scan) === "running") return undefined;
  return toDate(scan.finishedAt) ? scan.finishedAt : undefined;
}

/**
 * A count the last scan reported, worded for a stat's note ("1 in the last
 * scan", "4 so far" while it runs). Undefined when the scan did not report it.
 */
export function lastScanNote(
  scan: SummaryLastScan | null | undefined,
  value: number | undefined,
): string | undefined {
  if (!scan || typeof value !== "number" || !Number.isFinite(value) || value < 0) return undefined;
  const n = value.toLocaleString("en-US");
  return scanPhase(scan) === "running" ? `${n} so far in this scan` : `${n} in the last scan`;
}

/* ------------------------------------------------------------------ */
/*  Links                                                              */
/* ------------------------------------------------------------------ */

/**
 * Vulnerabilities filtered to one level, in the kit's `?severity=` format
 * (useSeverityParam / parseSeverityParam, e.g. `?severity=high`).
 */
export function severityHref(severity: Severity): string {
  const value = formatSeverityParam([severity]);
  return value ? `/vulnerabilities?severity=${value}` : "/vulnerabilities";
}

/** A host's display name: the hostname when it is real, otherwise the IP. */
export function hostLabel(host: { ip: string; hostname?: string | null }): string {
  const name = host.hostname?.trim();
  return name && name !== host.ip && name.toLowerCase() !== "unknown" ? name : host.ip;
}

/* ------------------------------------------------------------------ */
/*  Trend (collapsed until two snapshots exist)                        */
/* ------------------------------------------------------------------ */

/** Snapshots the trend reads (statistics.getVulnerabilityTrends `days`, a count). */
export const TREND_SNAPSHOT_LIMIT = 7;

export type TrendState =
  | { kind: "chart"; count: number }
  | { kind: "collapsed"; count: 0 }
  | { kind: "collapsed"; count: 1; latest?: Date };

/** The chart only says something once there are two snapshots to compare. */
export function trendState(
  trends: ReadonlyArray<{ timestamp: DateInput }> | null | undefined,
): TrendState {
  const dated = (trends ?? [])
    .map((t) => toDate(t.timestamp))
    .filter((d): d is Date => d !== null);
  const count = trends?.length ?? 0;
  if (count >= 2) return { kind: "chart", count };
  if (count === 1) return { kind: "collapsed", count: 1, ...(dated[0] ? { latest: dated[0] } : {}) };
  return { kind: "collapsed", count: 0 };
}

/** "The trend chart appears after the second snapshot. One snapshot so far (…)." */
export function trendCollapsedText(
  state: Extract<TrendState, { kind: "collapsed" }>,
  options?: FormatDateTimeOptions,
): string {
  const lead = "The trend chart appears after the second snapshot.";
  if (state.count === 0) return `${lead} No snapshots yet.`;
  if (!state.latest) return `${lead} One snapshot so far.`;
  return `${lead} One snapshot so far (${formatDateTime(state.latest, "short", options)}).`;
}

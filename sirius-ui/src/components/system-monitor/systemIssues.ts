/**
 * systemIssues — "Recent system issues" on System Monitor (R11, ADR-5).
 *
 * Takes system-category events (api.events.getRecentEvents({category:
 * "system"})), keeps warning and above, and groups repeats so one failing
 * route reads as one line:
 *
 *   "GET /host/127.0.0.1/sources - 404" ×34  ->  GET /host/{ip}/sources → 404 ×34 · sirius-api
 *
 * Pure; tested in systemIssues.test.ts.
 */

import type { Severity } from "~/components/shared/severity";

export type IssueSeverity = "warning" | "error" | "critical";

export const ISSUE_SEVERITIES: readonly IssueSeverity[] = ["critical", "error", "warning"];

export const ISSUE_SEVERITY_LABELS: Record<IssueSeverity, string> = {
  critical: "Critical",
  error: "Error",
  warning: "Warning",
};

/** Event severity -> the shared severity scale, for colours from severityTheme. */
export const ISSUE_SEVERITY_SCALE: Record<IssueSeverity, Severity> = {
  critical: "critical",
  error: "high",
  warning: "medium",
};

const RANK: Record<IssueSeverity, number> = { warning: 1, error: 2, critical: 3 };

export function issueSeverity(raw: unknown): IssueSeverity | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase();
  if (value === "warn") return "warning";
  return value === "warning" || value === "error" || value === "critical" ? value : null;
}

/** The fields of an events-router Event this module reads. */
export interface SystemEventLike {
  event_id?: string;
  timestamp?: string;
  service?: string;
  severity?: string;
  title?: string;
}

export interface SystemIssue {
  key: string;
  /** "GET /host/{ip}/sources → 404" or the event's first line. */
  label: string;
  /** True when the label is a request line (shown in mono). */
  isRequest: boolean;
  severity: IssueSeverity;
  count: number;
  service: string;
  /** Newest occurrence (ISO). */
  latest: string;
}

const HTTP_TITLE = /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\S+)\s+-\s+(\d{3})$/i;
const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}(?:\/\d{1,2})?$/;
const IPV6 = /^[0-9a-f]*:[0-9a-f:.]*$/i;
const CVE = /CVE-\d{4}-\d{4,}/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX_ID = /^[0-9a-f]{16,}$/i;
const NUMERIC = /^\d+$/;
const PREFIXED_ID = /^(?:evt|req|scan|job)_[\w-]+$/i;

function decode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function normalizeSegment(raw: string): string {
  const segment = decode(raw);
  if (segment === "") return segment;
  if (IPV4.test(segment) || (segment.split(":").length >= 3 && IPV6.test(segment))) return "{ip}";
  if (CVE.test(segment)) return "{cve}";
  if (UUID.test(segment) || HEX_ID.test(segment) || NUMERIC.test(segment) || PREFIXED_ID.test(segment)) {
    return "{id}";
  }
  return raw;
}

/** "/host/192.0.2.12/sources?x=1" -> "/host/{ip}/sources" */
export function normalizeRoute(path: string): string {
  const bare = path.split(/[?#]/)[0] ?? path;
  return bare.split("/").map(normalizeSegment).join("/");
}

const MAX_LABEL = 120;

/** The label an event is grouped by. */
export function issueLabel(title: string | undefined): { label: string; isRequest: boolean } {
  const text = (title ?? "").trim();
  const http = HTTP_TITLE.exec(text);
  if (http) {
    return {
      label: `${http[1]!.toUpperCase()} ${normalizeRoute(http[2]!)} → ${http[3]}`,
      isRequest: true,
    };
  }
  const firstLine = (text.split(/\r?\n/)[0] ?? "").replace(/\s+/g, " ").trim();
  if (!firstLine) return { label: "Untitled event", isRequest: false };
  const label = firstLine.length > MAX_LABEL ? `${firstLine.slice(0, MAX_LABEL - 1)}…` : firstLine;
  return { label, isRequest: false };
}

function time(value: string | undefined): number {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? 0 : t;
}

/**
 * Groups warning-and-above events by (service, label), newest group first.
 * Each group keeps its highest severity, its count and its newest time.
 */
export function groupSystemIssues(events: readonly SystemEventLike[] | null | undefined): SystemIssue[] {
  const groups = new Map<string, SystemIssue>();
  for (const event of events ?? []) {
    const severity = issueSeverity(event.severity);
    if (!severity) continue;
    const { label, isRequest } = issueLabel(event.title);
    const trimmed = event.service?.trim();
    const service = trimmed ? trimmed : "unknown service";
    const key = `${service}\u0000${label}`;
    const latest = event.timestamp ?? "";
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, { key, label, isRequest, severity, count: 1, service, latest });
      continue;
    }
    existing.count += 1;
    if (RANK[severity] > RANK[existing.severity]) existing.severity = severity;
    if (time(latest) > time(existing.latest)) existing.latest = latest;
  }
  return [...groups.values()].sort(
    (a, b) => time(b.latest) - time(a.latest) || b.count - a.count || a.label.localeCompare(b.label),
  );
}

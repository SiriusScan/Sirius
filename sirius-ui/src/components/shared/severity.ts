/**
 * severity.ts — the kit's severity vocabulary and helpers.
 *
 * One `Severity` type, ordered most to least severe, plus converters from the
 * shapes the app already has ({ critical, high, medium, low, informational },
 * "CRITICAL", "Informational", ...). Colours come only from
 * ~/utils/severityTheme.ts.
 */

import { SEVERITY_COLORS, type SeverityColorSet } from "~/utils/severityTheme";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type SeverityCounts = Record<Severity, number>;

/** Most to least severe. */
export const SEVERITIES: readonly Severity[] = ["critical", "high", "medium", "low", "info"];

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

const ALIASES: Record<string, Severity> = {
  critical: "critical",
  crit: "critical",
  high: "high",
  medium: "medium",
  med: "medium",
  moderate: "medium",
  low: "low",
  info: "info",
  informational: "info",
  information: "info",
  none: "info",
};

export function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && (SEVERITIES as readonly string[]).includes(value);
}

/** "CRITICAL", " High ", "informational" -> a Severity; null when unknown. */
export function parseSeverity(raw: unknown): Severity | null {
  if (typeof raw !== "string") return null;
  return ALIASES[raw.trim().toLowerCase()] ?? null;
}

/** Like parseSeverity, but unknown and empty values become "info". */
export function normalizeSeverity(raw: unknown): Severity {
  return parseSeverity(raw) ?? "info";
}

export function severityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity];
}

/** 4 for critical down to 0 for info, for sorting. */
export function severityRank(severity: Severity): number {
  return SEVERITIES.length - 1 - SEVERITIES.indexOf(severity);
}

/** The colour set for a level, from ~/utils/severityTheme.ts. */
export function severityColors(severity: Severity): SeverityColorSet {
  return SEVERITY_COLORS[severity];
}

export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

function asCount(value: unknown): number {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

/**
 * Converts an existing counts object to SeverityCounts. Accepts any key
 * spelling (`informational`, `INFO`, `Critical`); other keys such as `total`
 * are ignored. When a level appears under its canonical key and an alias,
 * the canonical key wins rather than the two being added.
 */
export function toSeverityCounts(
  source: Readonly<Record<string, unknown>> | null | undefined,
): SeverityCounts {
  const counts = emptySeverityCounts();
  if (!source) return counts;
  const fromCanonical = new Set<Severity>();
  for (const [key, value] of Object.entries(source)) {
    const lower = key.trim().toLowerCase();
    const severity = ALIASES[lower];
    if (!severity) continue;
    if (lower === severity) {
      counts[severity] = asCount(value);
      fromCanonical.add(severity);
    } else if (!fromCanonical.has(severity)) {
      counts[severity] = asCount(value);
    }
  }
  return counts;
}

/** Counts items by severity; unknown severities count as info. */
export function countBySeverity<T>(
  items: readonly T[] | null | undefined,
  getSeverity: (item: T) => unknown = (item) => (item as { severity?: unknown })?.severity,
): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const item of items ?? []) counts[normalizeSeverity(getSeverity(item))] += 1;
  return counts;
}

export function totalCount(counts: SeverityCounts): number {
  return SEVERITIES.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
}

/** The most severe level with a non-zero count, or null when all are zero. */
export function highestSeverity(counts: SeverityCounts): Severity | null {
  return SEVERITIES.find((s) => counts[s] > 0) ?? null;
}

/* ------------------------------------------------------------------ */
/*  Severity filters in the URL (?severity=high,critical)              */
/* ------------------------------------------------------------------ */

/** Reads `?severity=high,critical` (or repeated params) in canonical order. */
export function parseSeverityParam(raw: string | readonly string[] | null | undefined): Severity[] {
  if (!raw) return [];
  const parts = (typeof raw === "string" ? [raw] : raw).flatMap((v) => v.split(","));
  const found = new Set(parts.map(parseSeverity).filter((s): s is Severity => s !== null));
  return SEVERITIES.filter((s) => found.has(s));
}

/** The query value for a selection; undefined when nothing is selected. */
export function formatSeverityParam(selected: readonly Severity[]): string | undefined {
  const ordered = SEVERITIES.filter((s) => selected.includes(s));
  return ordered.length ? ordered.join(",") : undefined;
}

/** Adds or removes one level, keeping canonical order. */
export function toggleSeverity(selected: readonly Severity[], severity: Severity): Severity[] {
  const next = selected.includes(severity)
    ? selected.filter((s) => s !== severity)
    : [...selected, severity];
  return SEVERITIES.filter((s) => next.includes(s));
}

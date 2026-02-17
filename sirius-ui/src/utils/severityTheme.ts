/**
 * severityTheme.ts — Single source of truth for severity colors.
 *
 * Every component that renders severity-related colors (badges, charts,
 * filter pills, borders, progress bars, etc.) MUST import from this
 * module instead of defining inline color maps.
 *
 * Palette: dark-only v0.4 — no `dark:` prefixes.
 */

import { normalizeSeverity, type Severity } from "~/utils/riskScoreCalculator";

/* ------------------------------------------------------------------ */
/*  Canonical severity levels                                          */
/* ------------------------------------------------------------------ */

export const SEVERITY_LEVELS = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
] as const;

export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

/* ------------------------------------------------------------------ */
/*  Canonical color definitions                                        */
/* ------------------------------------------------------------------ */

export const SEVERITY_COLORS = {
  critical: {
    text: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500",
    hex: "#ef4444",            // red-500
    ring: "ring-red-500/30",
    base: "bg-red-500",
    cardBg: "bg-red-600",      // deeper shade for solid card backgrounds
    cardHex: "#dc2626",        // red-600
  },
  high: {
    text: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500",
    hex: "#f97316",            // orange-500
    ring: "ring-orange-500/30",
    base: "bg-orange-500",
    cardBg: "bg-orange-600",
    cardHex: "#ea580c",        // orange-600
  },
  medium: {
    text: "text-amber-400",
    bg: "bg-amber-500/20",
    border: "border-amber-500",
    hex: "#f59e0b",            // amber-500 — warmer golden tone for dark UIs
    ring: "ring-amber-500/30",
    base: "bg-amber-500",
    cardBg: "bg-amber-600",
    cardHex: "#d97706",        // amber-600
  },
  low: {
    text: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500",
    hex: "#22c55e",            // green-500
    ring: "ring-green-500/30",
    base: "bg-green-500",
    cardBg: "bg-green-600",
    cardHex: "#16a34a",        // green-600
  },
  info: {
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500",
    hex: "#3b82f6",            // blue-500
    ring: "ring-blue-500/30",
    base: "bg-blue-500",
    cardBg: "bg-blue-600",
    cardHex: "#2563eb",        // blue-600
  },
} as const;

/* ------------------------------------------------------------------ */
/*  Type for a single severity color set                               */
/* ------------------------------------------------------------------ */

export type SeverityColorSet = (typeof SEVERITY_COLORS)[SeverityLevel];

/* ------------------------------------------------------------------ */
/*  Accessor helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Resolve any raw severity string to a canonical key, then return
 * the full color set. Falls back to "info" for unknown values.
 */
export function getSeverityColors(raw: string): SeverityColorSet {
  const key = normalizeSeverity(raw) as SeverityLevel;
  return SEVERITY_COLORS[key] ?? SEVERITY_COLORS.info;
}

/**
 * Get the canonical hex color for a severity level.
 * Useful for chart datasets, SVG fills, and canvas rendering.
 */
export function getSeverityHex(raw: string): string {
  return getSeverityColors(raw).hex;
}

/**
 * Get badge classes (bg + text) for a severity level.
 * Returns the standard pill / badge appearance.
 */
export function getSeverityBadgeClasses(raw: string): {
  bg: string;
  text: string;
} {
  const c = getSeverityColors(raw);
  return { bg: c.bg, text: c.text };
}

/**
 * Get filter-pill classes for a severity toggle button.
 * `active` controls whether the chip is in the "selected" state.
 */
export function getSeverityFilterClasses(
  raw: string,
  active: boolean,
): { bg: string; text: string; ring: string } {
  const c = getSeverityColors(raw);
  return {
    bg: active ? c.bg : c.bg.replace("/20", "/10"),
    text: c.text,
    ring: active ? c.ring : "",
  };
}

/**
 * Return an ordered array of { key, hex } for charts that render
 * all five severity levels as dataset colors.
 */
export function getSeverityChartColors(): Array<{
  key: SeverityLevel;
  hex: string;
}> {
  return SEVERITY_LEVELS.map((key) => ({
    key,
    hex: SEVERITY_COLORS[key].hex,
  }));
}

/**
 * Get bar / progress-bar background class for a numeric CVSS score.
 * Maps the score to its severity bucket and returns the `base` class.
 */
export function getCvssBarColor(score: number): string {
  if (score >= 9.0) return SEVERITY_COLORS.critical.base;
  if (score >= 7.0) return SEVERITY_COLORS.high.base;
  if (score >= 4.0) return SEVERITY_COLORS.medium.base;
  if (score > 0) return SEVERITY_COLORS.low.base;
  return SEVERITY_COLORS.info.base;
}

/**
 * Get text color class for a numeric CVSS / risk score.
 */
export function getCvssTextColor(score: number): string {
  if (score >= 9.0) return SEVERITY_COLORS.critical.text;
  if (score >= 7.0) return SEVERITY_COLORS.high.text;
  if (score >= 4.0) return SEVERITY_COLORS.medium.text;
  if (score > 0) return SEVERITY_COLORS.low.text;
  return SEVERITY_COLORS.info.text;
}

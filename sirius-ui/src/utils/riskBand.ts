/**
 * riskBand — the band for a 0–10 score (ADR-3): 9+ critical, 7+ high,
 * 4+ medium, above 0 low, 0 none. The same bands as CVSS severity.
 *
 * The score itself comes from the API (a host's highest open CVSS). The
 * browser only names its band; it never computes a risk score.
 */

import type { Severity } from "~/components/shared/severity";

export type RiskBand = Severity | "none";

export function riskBand(score: number | null | undefined): RiskBand {
  if (typeof score !== "number" || !Number.isFinite(score) || score <= 0) return "none";
  if (score >= 9) return "critical";
  if (score >= 7) return "high";
  if (score >= 4) return "medium";
  return "low";
}

const BAND_LABELS: Record<RiskBand, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
  none: "None",
};

/** Sentence-case label for a band: "High", "None". */
export function riskBandLabel(band: RiskBand): string {
  return BAND_LABELS[band];
}

export default riskBand;

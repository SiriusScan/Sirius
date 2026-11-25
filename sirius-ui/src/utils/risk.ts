/**
 * risk.ts — the one risk scale (ADR-3), computed on the server.
 *
 * A host's risk score is the highest CVSS among its open findings (0–10, one
 * decimal). A finding without a CVSS counts at its severity's floor
 * (critical 9.0, high 7.0, medium 4.0, low 0.1, info 0). The band uses the
 * same cut-offs as CVSS severity (see riskBand.ts).
 *
 * Pure and dependency-free so tRPC routers can import it. Pages read the
 * `riskScore` / `riskBand` the API returns; they do not call this.
 */

import { riskBand, type RiskBand } from "./riskBand";
import type {
  RiskSeverity,
  SeverityCounts,
} from "../types/riskSummary";

export { riskBand };
export type { RiskBand, RiskSeverity, SeverityCounts };

/** A finding as far as risk is concerned. Extra fields are ignored. */
export interface RiskFinding {
  /** CVSS base score 0–10. 0, negative or missing means "unknown". */
  cvss?: number | null;
  /** Severity label from the source, in any case ("HIGH", "informational"). */
  severity?: string | null;
  /** Identifier (CVE) used to name the finding that sets the score. */
  id?: string | null;
}

/** Score a finding counts at when it has no CVSS. */
export const SEVERITY_FLOOR: Readonly<Record<RiskSeverity, number>> = {
  critical: 9.0,
  high: 7.0,
  medium: 4.0,
  low: 0.1,
  info: 0,
};

export const SEVERITY_ORDER: readonly RiskSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
  "info",
];

/** A fresh all-zero counts object. */
export function emptySeverityCounts(): SeverityCounts {
  return { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
}

/** Round to one decimal, clamped to 0–10. */
export function roundScore(score: number): number {
  if (!Number.isFinite(score) || score <= 0) return 0;
  return Math.round(Math.min(score, 10) * 10) / 10;
}

/**
 * Normalise a source severity label. Returns null when the label is empty or
 * not a severity, so callers can tell "unknown" from "info".
 */
export function normalizeSeverityLabel(
  raw: string | null | undefined,
): RiskSeverity | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  if (s.startsWith("crit")) return "critical";
  if (s === "high" || s === "important") return "high";
  if (s.startsWith("med") || s === "moderate") return "medium";
  if (s === "low") return "low";
  if (s === "info" || s === "informational" || s === "none") return "info";
  return null;
}

function validCvss(cvss: number | null | undefined): number | null {
  if (typeof cvss !== "number" || !Number.isFinite(cvss) || cvss <= 0) {
    return null;
  }
  return Math.min(cvss, 10);
}

/**
 * The score one finding contributes: its CVSS, else its severity's floor,
 * else 0. One decimal.
 */
export function findingScore(finding: RiskFinding): number {
  const cvss = validCvss(finding.cvss);
  if (cvss !== null) return roundScore(cvss);
  const label = normalizeSeverityLabel(finding.severity);
  return label ? SEVERITY_FLOOR[label] : 0;
}

/**
 * The severity a finding is counted under: the band of its CVSS when it has
 * one, else its source label, else info.
 */
export function findingSeverity(finding: RiskFinding): RiskSeverity {
  const cvss = validCvss(finding.cvss);
  if (cvss !== null) {
    const band = riskBand(roundScore(cvss));
    return band === "none" ? "info" : band;
  }
  return normalizeSeverityLabel(finding.severity) ?? "info";
}

/** Open findings counted by severity. */
export function severityCounts(findings: readonly RiskFinding[]): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const f of findings) counts[findingSeverity(f)]++;
  return counts;
}

/** Highest finding score among a host's open findings (0 when none). */
export function hostRiskScore(findings: readonly RiskFinding[]): number {
  let max = 0;
  for (const f of findings) {
    const score = findingScore(f);
    if (score > max) max = score;
  }
  return roundScore(max);
}

export interface HostRisk {
  /** 0–10, one decimal: the highest CVSS among open findings. */
  riskScore: number;
  riskBand: RiskBand;
  /** The finding that sets the score, when one does. */
  riskCve?: string;
  /** Open findings by severity. */
  counts: SeverityCounts;
  /** Number of open findings. */
  openFindings: number;
}

/** Score, band, the finding behind it, and counts in one pass. */
export function hostRisk(findings: readonly RiskFinding[]): HostRisk {
  const counts = emptySeverityCounts();
  let max = 0;
  let riskCve: string | undefined;
  for (const f of findings) {
    counts[findingSeverity(f)]++;
    const score = findingScore(f);
    // The first finding at the top score names it (input order breaks ties).
    if (score > max) {
      max = score;
      riskCve = f.id || undefined;
    } else if (score === max && score > 0 && !riskCve && f.id) {
      riskCve = f.id;
    }
  }
  const riskScore = roundScore(max);
  return {
    riskScore,
    riskBand: riskBand(riskScore),
    ...(riskScore > 0 && riskCve ? { riskCve } : {}),
    counts,
    openFindings: findings.length,
  };
}

/** Anything rankable: a score and counts. */
export interface RankableRisk {
  riskScore: number;
  counts: Pick<SeverityCounts, "critical" | "high">;
}

/**
 * Sort comparator for "most at risk first": riskScore desc, then critical
 * count desc, then high count desc. Stable for ties beyond that.
 */
export function compareRisk(a: RankableRisk, b: RankableRisk): number {
  if (b.riskScore !== a.riskScore) return b.riskScore - a.riskScore;
  if (b.counts.critical !== a.counts.critical) {
    return b.counts.critical - a.counts.critical;
  }
  return b.counts.high - a.counts.high;
}

/** Add counts into an accumulator (mutates and returns `into`). */
export function addSeverityCounts(
  into: SeverityCounts,
  add: SeverityCounts,
): SeverityCounts {
  for (const key of SEVERITY_ORDER) into[key] += add[key];
  return into;
}

/** Map the API's counts to the legacy `informational` shape older views use. */
export function toLegacySeverityCounts(counts: SeverityCounts): {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
} {
  return {
    critical: counts.critical,
    high: counts.high,
    medium: counts.medium,
    low: counts.low,
    informational: counts.info,
  };
}

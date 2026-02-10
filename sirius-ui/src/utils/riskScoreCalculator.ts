/**
 * Risk Score Calculator Utility
 *
 * Client-side utilities for calculating and displaying risk scores
 * following the same priority system as the backend.
 */

import type { Severity, TemplateInfo } from "~/types/agentTemplateTypes";
import {
  getCvssBarColor as getCVSSBarColorTheme,
  getCvssTextColor,
  getSeverityBadgeClasses,
} from "~/utils/severityTheme";

/**
 * Severity to risk score mapping (fallback method)
 * Matches the backend implementation
 */
const SEVERITY_SCORE_MAP: Record<Severity, number> = {
  critical: 9.5,
  high: 7.5,
  medium: 5.0,
  low: 2.0,
  info: 0.0,
};

/**
 * Calculate risk score from severity
 */
export function severityToRiskScore(severity: Severity): number {
  return SEVERITY_SCORE_MAP[severity] ?? 0.0;
}

/**
 * Get severity level from risk score
 */
export function riskScoreToSeverity(score: number): Severity {
  if (score >= 9.0) return "critical";
  if (score >= 7.0) return "high";
  if (score >= 4.0) return "medium";
  if (score > 0) return "low";
  return "info";
}

/**
 * Validate risk score is in valid range (0.0-10.0)
 */
export function validateRiskScore(score: number): boolean {
  return score >= 0.0 && score <= 10.0;
}

/**
 * Validate CVSS vector format
 * Note: Full parsing happens on backend, this is just format checking
 */
export function validateCVSSVector(vector: string): boolean {
  return vector.startsWith("CVSS:3.0/") || vector.startsWith("CVSS:3.1/");
}

/**
 * Calculate preview risk score using priority system
 * This mimics the backend calculation but doesn't do full CVSS parsing
 *
 * Returns { score, source, valid }
 */
export function calculatePreviewRiskScore(
  templateInfo: Partial<TemplateInfo>
): {
  score: number;
  source: "custom_score" | "cvss_vector" | "cvss_score" | "severity_mapping";
  valid: boolean;
} {
  // Priority 1: Custom risk score
  if (
    templateInfo.risk_score !== undefined &&
    templateInfo.risk_score !== null &&
    validateRiskScore(templateInfo.risk_score)
  ) {
    return {
      score: templateInfo.risk_score,
      source: "custom_score",
      valid: true,
    };
  }

  // Priority 2: CVSS vector (validation only, calculation happens on backend)
  if (
    templateInfo.cvss_vector &&
    validateCVSSVector(templateInfo.cvss_vector)
  ) {
    return {
      score: 0, // Placeholder - backend will calculate
      source: "cvss_vector",
      valid: true,
    };
  }

  // Priority 3: CVSS score
  if (
    templateInfo.cvss_score !== undefined &&
    templateInfo.cvss_score !== null &&
    validateRiskScore(templateInfo.cvss_score)
  ) {
    return {
      score: templateInfo.cvss_score,
      source: "cvss_score",
      valid: true,
    };
  }

  // Priority 4: Severity mapping
  if (templateInfo.severity) {
    return {
      score: severityToRiskScore(templateInfo.severity),
      source: "severity_mapping",
      valid: true,
    };
  }

  // No valid scoring method found
  return {
    score: 0,
    source: "severity_mapping",
    valid: false,
  };
}

/**
 * Format risk score for display (one decimal place)
 */
export function formatRiskScore(score: number): string {
  return score.toFixed(1);
}

/**
 * Get color class for risk score display (canonical dark-only palette)
 */
export function getRiskScoreColor(score: number): string {
  return getCvssTextColor(score);
}

/**
 * Get background color class for risk score badge
 */
export function getRiskScoreBgColor(score: number): string {
  if (score >= 9.0) return "bg-red-900";
  if (score >= 7.0) return "bg-orange-900";
  if (score >= 4.0) return "bg-amber-900";
  if (score > 0) return "bg-blue-900";
  return "bg-gray-900";
}

/**
 * Get human-readable source name for risk score calculation method
 */
export function getRiskScoreSourceLabel(
  source: "custom_score" | "cvss_vector" | "cvss_score" | "severity_mapping"
): string {
  switch (source) {
    case "custom_score":
      return "Custom Score";
    case "cvss_vector":
      return "CVSS Vector";
    case "cvss_score":
      return "CVSS Score";
    case "severity_mapping":
      return "Severity Mapping";
  }
}

/**
 * Parse CVSS vector to extract version and basic info
 * Returns null if invalid format
 */
export function parseCVSSVectorInfo(vector: string): {
  version: string;
  metrics: Record<string, string>;
} | null {
  if (!validateCVSSVector(vector)) {
    return null;
  }

  const parts = vector.split("/");
  if (parts.length < 2) {
    return null;
  }

  const version = parts[0] ?? ""; // e.g., "CVSS:3.1"
  const metrics: Record<string, string> = {};

  // Parse metric:value pairs
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const [metric, value] = part.split(":");
    if (metric && value) {
      metrics[metric] = value;
    }
  }

  return { version, metrics };
}

/**
 * Get CVSS metric label
 */
export function getCVSSMetricLabel(metric: string): string {
  const labels: Record<string, string> = {
    AV: "Attack Vector",
    AC: "Attack Complexity",
    PR: "Privileges Required",
    UI: "User Interaction",
    S: "Scope",
    C: "Confidentiality",
    I: "Integrity",
    A: "Availability",
  };
  return labels[metric] ?? metric;
}

/**
 * Get CVSS metric value label
 */
export function getCVSSValueLabel(metric: string, value: string): string {
  const labels: Record<string, Record<string, string>> = {
    AV: { N: "Network", A: "Adjacent", L: "Local", P: "Physical" },
    AC: { L: "Low", H: "High" },
    PR: { N: "None", L: "Low", H: "High" },
    UI: { N: "None", R: "Required" },
    S: { U: "Unchanged", C: "Changed" },
    C: { H: "High", L: "Low", N: "None" },
    I: { H: "High", L: "Low", N: "None" },
    A: { H: "High", L: "Low", N: "None" },
  };

  return labels[metric]?.[value] ?? value;
}

// ─── Centralized severity utilities ─────────────────────────────────────────
// These replace duplicated severity logic scattered across scanner components.

/**
 * Normalize a raw severity string to the canonical Severity type.
 * Handles uppercase, mixed case, partial matches ("CRIT" → "critical"), and
 * alternate labels ("INFORMATIONAL" → "info").
 */
export function normalizeSeverity(raw: string): Severity {
  if (!raw) return "info";
  const upper = raw.toUpperCase().trim();
  if (upper.includes("CRIT")) return "critical";
  if (upper.includes("HIGH")) return "high";
  if (upper.includes("MED")) return "medium";
  if (upper.includes("LOW")) return "low";
  return "info";
}

/**
 * Get a numeric priority for a severity value (for sorting).
 * Higher number = higher severity.
 */
export function getSeverityPriority(severity: string): number {
  const normalized = normalizeSeverity(severity);
  const priorities: Record<Severity, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
    info: 0,
  };
  return priorities[normalized];
}

/**
 * Severity badge color classes (bg + text) keyed by canonical severity.
 * These are full Tailwind class strings so they are compiled correctly.
 */
const SEVERITY_BADGE_COLORS: Record<Severity, { bg: string; text: string }> = {
  critical: {
    bg: "bg-red-900/20",
    text: "text-red-300",
  },
  high: {
    bg: "bg-orange-900/20",
    text: "text-orange-300",
  },
  medium: {
    bg: "bg-amber-900/20",
    text: "text-amber-300",
  },
  low: {
    bg: "bg-green-900/20",
    text: "text-green-300",
  },
  info: {
    bg: "bg-blue-900/20",
    text: "text-blue-300",
  },
};

/**
 * Get badge color classes for a severity string.
 * Normalizes the input automatically.
 */
export function getSeverityBadgeColors(severity: string): {
  bg: string;
  text: string;
} {
  return SEVERITY_BADGE_COLORS[normalizeSeverity(severity)];
}

/**
 * Get a human-readable severity label from any raw severity string.
 * Returns title-cased canonical form: "Critical", "High", "Medium", "Low", "Info".
 */
export function getSeverityLabel(severity: string): string {
  const normalized = normalizeSeverity(severity);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Get Tailwind background color class for a CVSS score bar.
 */
export function getCVSSBarColor(score: number): string {
  if (score >= 9.0) return "bg-red-500";
  if (score >= 7.0) return "bg-orange-500";
  if (score >= 4.0) return "bg-amber-500";
  if (score > 0) return "bg-green-500";
  return "bg-blue-500";
}

/* ------------------------------------------------------------------ */
/*  Unified risk level determination                                   */
/* ------------------------------------------------------------------ */

/**
 * Determine a host's risk level from the highest CVSS score (preferred)
 * or a vulnerability count fallback.
 *
 * This is the **single source of truth** for CVSS-to-risk mapping
 * plus the count-based heuristic used when detailed CVSS data is
 * unavailable.
 *
 * @param maxCvss    Highest CVSS score among the host's vulnerabilities (0-10).
 * @param vulnCount  Total vulnerability count (used as fallback).
 * @returns Canonical risk level string: "critical" | "high" | "medium" | "low" | "info"
 */
export function getRiskLevel(maxCvss?: number, vulnCount?: number): string {
  // Prefer CVSS-based determination
  if (maxCvss !== undefined && maxCvss > 0) {
    if (maxCvss >= 9.0) return "critical";
    if (maxCvss >= 7.0) return "high";
    if (maxCvss >= 4.0) return "medium";
    return "low";
  }
  // Fallback: count-based heuristic
  const count = vulnCount ?? 0;
  if (count > 50) return "critical";
  if (count > 20) return "high";
  if (count > 5) return "medium";
  if (count > 0) return "low";
  return "info";
}









/**
 * Risk Score Calculator Utility
 *
 * Client-side utilities for calculating and displaying risk scores
 * following the same priority system as the backend.
 */

import type { Severity, TemplateInfo } from "~/types/agentTemplateTypes";

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
 * Get color class for risk score display
 */
export function getRiskScoreColor(score: number): string {
  if (score >= 9.0) return "text-red-600 dark:text-red-400";
  if (score >= 7.0) return "text-orange-600 dark:text-orange-400";
  if (score >= 4.0) return "text-yellow-600 dark:text-yellow-400";
  if (score > 0) return "text-blue-600 dark:text-blue-400";
  return "text-gray-600 dark:text-gray-400";
}

/**
 * Get background color class for risk score badge
 */
export function getRiskScoreBgColor(score: number): string {
  if (score >= 9.0) return "bg-red-100 dark:bg-red-900";
  if (score >= 7.0) return "bg-orange-100 dark:bg-orange-900";
  if (score >= 4.0) return "bg-yellow-100 dark:bg-yellow-900";
  if (score > 0) return "bg-blue-100 dark:bg-blue-900";
  return "bg-gray-100 dark:bg-gray-900";
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













/**
 * SeverityBadge — v0.4 dark-only severity badge and filter pill.
 *
 * All color values sourced from ~/utils/severityTheme.ts.
 */

import React from "react";
import { cn } from "~/components/lib/utils";
import { getSeverityBadgeClasses, getSeverityColors, SEVERITY_COLORS, type SeverityLevel } from "~/utils/severityTheme";
import { getSeverityLabel, normalizeSeverity } from "~/utils/riskScoreCalculator";

/* ------------------------------------------------------------------ */
/*  Exported helpers                                                   */
/* ------------------------------------------------------------------ */

/**
 * Get risk badge color classes using the canonical dark palette.
 * Uses `normalizeSeverity` so inputs like "INFORMATIONAL", "INFO",
 * "informational", etc. all resolve correctly.
 */
export function getScannerRiskColors(level: string): {
  bg: string;
  text: string;
} {
  return getSeverityBadgeClasses(level);
}

/* ------------------------------------------------------------------ */
/*  Filter-pill palette (derived from severityTheme)                   */
/* ------------------------------------------------------------------ */

function getFilterColors(severity: string) {
  const c = getSeverityColors(severity);
  return {
    bg: c.bg.replace("/20", "/10"),
    text: c.text,
    activeBg: c.bg,
    ring: c.ring.replace("/30", "/40"),
  };
}

/* ------------------------------------------------------------------ */
/*  SeverityBadge component                                            */
/* ------------------------------------------------------------------ */

export interface SeverityBadgeProps {
  severity: string;
  className?: string;
  /**
   * Kept for backward compatibility — both variants now use the same
   * canonical dark-only palette from severityTheme.ts.
   * @default "default"
   */
  variant?: "default" | "scanner";
}

/**
 * Render a severity/risk pill badge.
 *
 * ```tsx
 * <SeverityBadge severity="critical" />
 * <SeverityBadge severity="HIGH" />
 * ```
 */
export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  className,
}) => {
  const colors = getSeverityBadgeClasses(severity);
  const label = getSeverityLabel(severity);

  return (
    <div
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-center text-xs font-medium",
        colors.bg,
        colors.text,
        className,
      )}
    >
      {label}
    </div>
  );
};

/**
 * Render a risk-level badge (alias for SeverityBadge — same color system).
 * Accepts risk levels like "critical", "high", etc.
 */
export const RiskBadge: React.FC<SeverityBadgeProps> = (props) => (
  <SeverityBadge {...props} />
);

/* ------------------------------------------------------------------ */
/*  SeverityFilterPill — clickable severity toggle for filter bars     */
/* ------------------------------------------------------------------ */

export interface SeverityFilterPillProps {
  severity: string;
  count: number;
  active: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Clickable severity pill used in filter bars (v0.4 dark-only palette).
 *
 * ```tsx
 * <SeverityFilterPill severity="CRITICAL" count={3} active={true} onClick={toggle} />
 * ```
 */
export const SeverityFilterPill: React.FC<SeverityFilterPillProps> = ({
  severity,
  count,
  active,
  onClick,
  className,
}) => {
  const colors = getFilterColors(severity);
  const label = getSeverityLabel(severity).toUpperCase();

  return (
    <button
      disabled={count === 0}
      className={cn(
        "relative flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
        colors.text,
        active ? `${colors.activeBg} ring-1 ${colors.ring}` : colors.bg,
        count === 0 && "cursor-not-allowed opacity-40",
        "hover:opacity-90",
        className,
      )}
      onClick={onClick}
    >
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-xs font-medium",
          active ? "bg-white/10" : "bg-white/5",
        )}
      >
        {count}
      </span>
    </button>
  );
};

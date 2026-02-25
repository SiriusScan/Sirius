/**
 * CvssScore — v0.4 CVSS score display with progress bar.
 *
 * Consolidates the duplicated CVSS rendering logic from
 * VulnerabilityCommandTable, VulnerabilityTableColumns,
 * VulnerabilityTableSourceColumns, and VulnerabilityTable.
 *
 * Usage:
 *   <CvssScore score={7.5} />
 *   <CvssScore score={9.2} size="lg" />
 */

import React from "react";
import { cn } from "~/components/lib/utils";

/* ------------------------------------------------------------------ */
/*  Score-to-color mapping (dark-only, v0.4)                           */
/* ------------------------------------------------------------------ */

function getBarColor(score: number): string {
  if (score >= 9.0) return "bg-[#8c1c1c]";
  if (score >= 7.0) return "bg-red-600";
  if (score >= 4.0) return "bg-amber-500";
  if (score > 0) return "bg-green-500";
  return "bg-blue-500";
}

function getTextColor(score: number): string {
  if (score >= 9.0) return "text-red-400";
  if (score >= 7.0) return "text-red-500";
  if (score >= 4.0) return "text-amber-500";
  if (score > 0) return "text-green-400";
  return "text-blue-400";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface CvssScoreProps {
  score: number;
  /** "sm" = compact table cell (default). "lg" = larger display. */
  size?: "sm" | "lg";
  /** Show the numeric label alongside the bar. Default: true. */
  showLabel?: boolean;
  /** Width of the progress bar. Default: "w-12". */
  barWidth?: string;
  className?: string;
}

export const CvssScore: React.FC<CvssScoreProps> = ({
  score,
  size = "sm",
  showLabel = true,
  barWidth = "w-12",
  className,
}) => {
  const barColor = getBarColor(score);
  const textColor = getTextColor(score);
  const pct = Math.min(score * 10, 100);

  return (
    <div className={cn("flex items-center", className)}>
      {showLabel && (
        <span
          className={cn(
            "mr-2 font-medium",
            textColor,
            size === "sm" ? "text-xs" : "text-sm",
          )}
        >
          {score.toFixed(1)}
        </span>
      )}
      <div
        className={cn(
          "rounded-full bg-gray-800",
          barWidth,
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn(
            "rounded-full",
            barColor,
            size === "sm" ? "h-1.5" : "h-2",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/**
 * SeveritySummary — v0.4 compact severity breakdown with distribution bar.
 *
 * Designed to sit neatly between the sticky header and the main content.
 * Compact layout with severity chips and a distribution bar.
 *
 * Usage:
 *   <SeveritySummary counts={{ critical: 1, high: 9, medium: 11, low: 4, informational: 1 }} />
 */

import React from "react";
import { cn } from "~/components/lib/utils";
import { type SeverityCounts } from "~/components/vulnerability/types";
import { SEVERITY_COLORS } from "~/utils/severityTheme";

/* ------------------------------------------------------------------ */
/*  Severity palette (derived from severityTheme)                      */
/* ------------------------------------------------------------------ */

const SEVERITY_CONFIG = [
  {
    key: "critical" as const,
    label: "Critical",
    bg: SEVERITY_COLORS.critical.bg.replace("/20", "/15"),
    text: SEVERITY_COLORS.critical.text,
    bar: SEVERITY_COLORS.critical.base,
    ring: SEVERITY_COLORS.critical.ring.replace("/30", "/25"),
  },
  {
    key: "high" as const,
    label: "High",
    bg: SEVERITY_COLORS.high.bg.replace("/20", "/15"),
    text: SEVERITY_COLORS.high.text,
    bar: SEVERITY_COLORS.high.base,
    ring: SEVERITY_COLORS.high.ring.replace("/30", "/25"),
  },
  {
    key: "medium" as const,
    label: "Medium",
    bg: SEVERITY_COLORS.medium.bg.replace("/20", "/15"),
    text: SEVERITY_COLORS.medium.text,
    bar: SEVERITY_COLORS.medium.base,
    ring: SEVERITY_COLORS.medium.ring.replace("/30", "/25"),
  },
  {
    key: "low" as const,
    label: "Low",
    bg: SEVERITY_COLORS.low.bg.replace("/20", "/15"),
    text: SEVERITY_COLORS.low.text,
    bar: SEVERITY_COLORS.low.base,
    ring: SEVERITY_COLORS.low.ring.replace("/30", "/25"),
  },
  {
    key: "informational" as const,
    label: "Info",
    bg: SEVERITY_COLORS.info.bg.replace("/20", "/15"),
    text: SEVERITY_COLORS.info.text,
    bar: SEVERITY_COLORS.info.base,
    ring: SEVERITY_COLORS.info.ring.replace("/30", "/25"),
  },
];

/* ------------------------------------------------------------------ */
/*  Component props                                                    */
/* ------------------------------------------------------------------ */

export interface SeveritySummaryProps {
  counts: SeverityCounts;
  /** "horizontal" = side-by-side (default). "vertical" = stacked column. */
  layout?: "horizontal" | "vertical";
  /** Show the severity distribution bar. Default: true. */
  showBar?: boolean;
  /** Optional title above the cards. */
  title?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  SeveritySummary                                                    */
/* ------------------------------------------------------------------ */

export const SeveritySummary: React.FC<SeveritySummaryProps> = ({
  counts,
  layout = "horizontal",
  showBar = true,
  title,
  className,
}) => {
  const total =
    counts.total ??
    counts.critical +
      counts.high +
      counts.medium +
      counts.low +
      counts.informational;

  return (
    <div
      className={cn(
        "rounded-lg border border-violet-500/10 bg-gray-900/30 px-4 py-3",
        className,
      )}
    >
      {title && (
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">
          {title}
        </span>
      )}

      {/* Severity chips */}
      <div
        className={cn(
          "gap-2",
          layout === "horizontal"
            ? "flex items-center"
            : "flex flex-col",
        )}
      >
        {SEVERITY_CONFIG.map(({ key, label, bg, text, ring }) => {
          const count = counts[key];
          if (count === 0) return null;
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 ring-1",
                bg,
                ring,
              )}
            >
              <span className={cn("text-lg font-bold tabular-nums", text)}>
                {count}
              </span>
              <span className={cn("text-xs font-medium", text)}>{label}</span>
            </div>
          );
        })}

        {/* Distribution bar (inline, right of chips) */}
        {showBar && total > 0 && layout === "horizontal" && (
          <div className="ml-auto flex h-2 w-48 overflow-hidden rounded-full bg-gray-800/60">
            {SEVERITY_CONFIG.map(({ key, bar }) => {
              const pct = (counts[key] / total) * 100;
              if (pct === 0) return null;
              return (
                <div
                  key={key}
                  className={cn("h-2", bar)}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Distribution bar (below chips, for vertical layout) */}
      {showBar && total > 0 && layout === "vertical" && (
        <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
          {SEVERITY_CONFIG.map(({ key, bar }) => {
            const pct = (counts[key] / total) * 100;
            if (pct === 0) return null;
            return (
              <div
                key={key}
                className={cn("h-1.5", bar)}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

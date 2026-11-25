/**
 * SeverityStrip — the one severity breakdown, in three variants:
 *
 * - "tiles":   five coloured count tiles (Dashboard, Host overview).
 * - "compact": pill filters "Critical 0 · High 3 · Medium 155 · Low 4 · Info 0"
 *              for a table toolbar; the selected levels are highlighted.
 * - "bar":     a thin stacked bar (inside HostCell); not interactive.
 *
 * Clicking a level calls onSelect (or follows getHref); the page decides
 * what selection means, usually filtering its table. Zero-count levels are
 * muted and not clickable. One strip per page. Colours come only from
 * ~/utils/severityTheme.ts.
 */

import React from "react";
import Link from "next/link";
import { cn } from "~/components/lib/utils";
import {
  SEVERITIES,
  SEVERITY_LABELS,
  severityColors,
  totalCount,
  type Severity,
  type SeverityCounts,
} from "./severity";

export type SeverityStripVariant = "tiles" | "bar" | "compact";

export interface SeverityStripProps {
  counts: SeverityCounts;
  variant?: SeverityStripVariant;
  /** Levels currently selected (highlighted). */
  selected?: readonly Severity[];
  onSelect?: (severity: Severity) => void;
  /** Make each non-zero level a link instead, e.g. to a filtered list. */
  getHref?: (severity: Severity) => string;
  className?: string;
  "aria-label"?: string;
}

const fmt = (n: number) => n.toLocaleString("en-US");

function describe(counts: SeverityCounts): string {
  return SEVERITIES.map((s) => `${SEVERITY_LABELS[s]} ${fmt(counts[s] ?? 0)}`).join(", ");
}

/** A button, a link or a static element, depending on what the strip allows. */
function LevelControl({
  severity,
  count,
  selected,
  onSelect,
  getHref,
  className,
  children,
}: {
  severity: Severity;
  count: number;
  selected: boolean;
  onSelect?: (s: Severity) => void;
  getHref?: (s: Severity) => string;
  className: string;
  children: React.ReactNode;
}) {
  const label = `${SEVERITY_LABELS[severity]}: ${fmt(count)}`;
  if (count > 0 && getHref) {
    return (
      <Link href={getHref(severity)} className={className} aria-label={label} data-severity={severity}>
        {children}
      </Link>
    );
  }
  if (onSelect) {
    return (
      <button
        type="button"
        className={className}
        disabled={count === 0}
        aria-pressed={selected}
        aria-label={label}
        data-severity={severity}
        onClick={() => count > 0 && onSelect(severity)}
      >
        {children}
      </button>
    );
  }
  return (
    <div className={className} aria-label={label} data-severity={severity}>
      {children}
    </div>
  );
}

function SeverityBar({ counts, className, label }: { counts: SeverityCounts; className?: string; label?: string }) {
  const total = totalCount(counts);
  return (
    <div
      role="img"
      aria-label={label ?? describe(counts)}
      title={describe(counts)}
      className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-gray-800", className)}
    >
      {total > 0 &&
        SEVERITIES.map((s) => {
          const n = counts[s] ?? 0;
          if (n <= 0) return null;
          return (
            <div
              key={s}
              className={cn("h-full", severityColors(s).base)}
              style={{ width: `${(n / total) * 100}%` }}
            />
          );
        })}
    </div>
  );
}

export function SeverityStrip({
  counts,
  variant = "tiles",
  selected = [],
  onSelect,
  getHref,
  className,
  "aria-label": ariaLabel,
}: SeverityStripProps) {
  if (variant === "bar") {
    return <SeverityBar counts={counts} className={className} label={ariaLabel} />;
  }

  const interactive = !!onSelect || !!getHref;
  const anySelected = selected.length > 0;

  if (variant === "compact") {
    return (
      <div
        role="group"
        aria-label={ariaLabel ?? "Severity"}
        className={cn("flex flex-wrap items-center gap-1.5", className)}
      >
        {SEVERITIES.map((s) => {
          const n = counts[s] ?? 0;
          const isSelected = selected.includes(s);
          const c = severityColors(s);
          return (
            <LevelControl
              key={s}
              severity={s}
              count={n}
              selected={isSelected}
              onSelect={onSelect}
              getHref={getHref}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-medium tabular-nums transition-colors",
                n === 0
                  ? "cursor-default border-gray-800 text-gray-600"
                  : isSelected
                    ? cn(c.bg, c.text, c.border)
                    : "border-gray-700/70 text-gray-300",
                n > 0 && interactive && !isSelected && "hover:border-gray-600 hover:bg-gray-800/60 hover:text-white",
                n > 0 && interactive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
              )}
            >
              {n > 0 && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", c.base)} aria-hidden />}
              <span>{SEVERITY_LABELS[s]}</span>
              <span className={cn(n > 0 && !isSelected && "text-gray-400")}>{fmt(n)}</span>
            </LevelControl>
          );
        })}
      </div>
    );
  }

  // tiles
  return (
    <div
      role="group"
      aria-label={ariaLabel ?? "Severity"}
      className={cn("grid grid-cols-5 gap-2", className)}
    >
      {SEVERITIES.map((s) => {
        const n = counts[s] ?? 0;
        const isSelected = selected.includes(s);
        const c = severityColors(s);
        return (
          <LevelControl
            key={s}
            severity={s}
            count={n}
            selected={isSelected}
            onSelect={onSelect}
            getHref={getHref}
            className={cn(
              "flex min-w-0 flex-col items-center justify-center rounded-lg px-2 py-3 text-center transition-all duration-150",
              n === 0
                ? "cursor-default bg-gray-800/40 text-gray-500 ring-1 ring-inset ring-gray-700/50"
                : cn(c.cardBg, "text-white shadow-sm shadow-black/25"),
              n > 0 && interactive && "hover:shadow-md hover:shadow-black/30 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70",
              n > 0 && isSelected && "ring-2 ring-white/70",
              n > 0 && anySelected && !isSelected && "opacity-60",
            )}
          >
            <span className="text-2xl font-bold leading-8 tabular-nums">{fmt(n)}</span>
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                n === 0 ? "text-gray-500" : "text-white/75",
              )}
            >
              {SEVERITY_LABELS[s]}
            </span>
          </LevelControl>
        );
      })}
    </div>
  );
}

export default SeverityStrip;

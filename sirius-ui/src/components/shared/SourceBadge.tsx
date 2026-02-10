import React from "react";
import { cn } from "~/components/lib/utils";

/**
 * Canonical color mapping for scan/discovery sources.
 *
 * Each source maps to a Tailwind color family used across three style variants:
 *   - badge:  dark bg + light text  (inline labels) — v0.4 dark-only
 *   - solid:  saturated bg + border  (timeline markers, progress bars)
 *   - ring:   ring color only        (for focus / outline treatments)
 */
const SOURCE_COLOR_FAMILIES: Record<string, string> = {
  nmap: "blue",
  rustscan: "orange",
  naabu: "cyan",
  agent: "green",
  manual: "purple",
};

/** Resolve a source name to its Tailwind color family, defaulting to "gray". */
export function getSourceColorFamily(source: string): string {
  return SOURCE_COLOR_FAMILIES[source.toLowerCase()] ?? "gray";
}

/* ------------------------------------------------------------------ */
/*  Pre-built class strings — v0.4 dark-only                           */
/* ------------------------------------------------------------------ */

const BADGE_CLASSES: Record<string, string> = {
  blue: "bg-blue-500/15 text-blue-300",
  orange: "bg-orange-500/15 text-orange-300",
  cyan: "bg-cyan-500/15 text-cyan-300",
  green: "bg-green-500/15 text-green-300",
  purple: "bg-purple-500/15 text-purple-300",
  gray: "bg-gray-500/15 text-gray-300",
  indigo: "bg-indigo-500/15 text-indigo-300",
};

const SOLID_CLASSES: Record<string, string> = {
  blue: "bg-blue-500 border-blue-600",
  orange: "bg-orange-500 border-orange-600",
  cyan: "bg-cyan-500 border-cyan-600",
  green: "bg-green-500 border-green-600",
  purple: "bg-purple-500 border-purple-600",
  gray: "bg-gray-500 border-gray-600",
  indigo: "bg-indigo-500 border-indigo-600",
};

/**
 * Return Tailwind classes for a given scan source and style variant.
 *
 * @param source  - The scan source name (e.g. "nmap", "agent")
 * @param variant - "badge" for dark labels, "solid" for saturated markers
 */
export function getSourceColor(
  source: string,
  variant: "badge" | "solid" = "badge",
): string {
  const family = getSourceColorFamily(source);
  return variant === "solid"
    ? (SOLID_CLASSES[family] ?? SOLID_CLASSES.gray!)
    : (BADGE_CLASSES[family] ?? BADGE_CLASSES.gray!);
}

/* ------------------------------------------------------------------ */
/*  SourceBadge component                                              */
/* ------------------------------------------------------------------ */

export interface SourceBadgeProps {
  source: string;
  className?: string;
  /** @default "badge" */
  variant?: "badge" | "solid";
}

/**
 * Render a small pill badge for a scan / discovery source.
 *
 * ```tsx
 * <SourceBadge source="nmap" />
 * <SourceBadge source="agent" variant="solid" />
 * ```
 */
export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source,
  className,
  variant = "badge",
}) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        getSourceColor(source, variant),
        className,
      )}
    >
      {source}
    </span>
  );
};

/**
 * SeverityTag — a small severity label ("High") for table cells and
 * headers. Accepts a Severity or any existing spelling ("CRITICAL",
 * "informational"). Colours come only from ~/utils/severityTheme.ts.
 */

import React from "react";
import { cn } from "~/components/lib/utils";
import { normalizeSeverity, severityColors, severityLabel } from "./severity";

export interface SeverityTagProps {
  /** A Severity, or any existing spelling ("CRITICAL", "informational"). */
  severity: string;
  className?: string;
}

export function SeverityTag({ severity, className }: SeverityTagProps) {
  const level = normalizeSeverity(severity);
  const c = severityColors(level);
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium leading-4 ring-1 ring-inset",
        c.bg,
        c.text,
        c.ring,
        className,
      )}
    >
      {severityLabel(level)}
    </span>
  );
}

export default SeverityTag;

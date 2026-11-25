/**
 * ScanSection — one card on the Scanner page (R03): a small icon, a title
 * with an optional count, an aside on the right, then the body. Uses the
 * existing scanner-section classes.
 */

import React, { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "~/components/lib/utils";

export interface ScanSectionProps {
  icon: LucideIcon;
  title: React.ReactNode;
  /** Shown after the title as "(n)". */
  count?: number;
  /** Right side of the title row: a note, a link or buttons. */
  aside?: React.ReactNode;
  /** The violet-tinted primary card (the run card and the form). */
  primary?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function ScanSection({
  icon: Icon,
  title,
  count,
  aside,
  primary = false,
  className,
  children,
}: ScanSectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        primary ? "scanner-section-primary" : "scanner-section",
        "scanner-section-padding",
        className,
      )}
    >
      <div className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-2", children ? "mb-4" : undefined)}>
        <h2 id={headingId} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
          <Icon className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          <span className="truncate">{title}</span>
          {count !== undefined && (
            <span className="font-normal tabular-nums text-gray-500">({count.toLocaleString("en-US")})</span>
          )}
        </h2>
        {aside && <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

export default ScanSection;

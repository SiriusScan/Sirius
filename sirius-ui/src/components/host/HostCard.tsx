/**
 * HostCard — one card on the host page (R05): the existing `scanner-section`
 * frame with a small violet icon and title, an optional action at the right
 * (e.g. "All 162 →") and an optional footnote.
 */

import React, { useId } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "~/components/lib/utils";

export interface HostCardProps {
  icon: LucideIcon;
  title: React.ReactNode;
  action?: React.ReactNode;
  /** Small grey note under the body. */
  note?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function HostCard({
  icon: Icon,
  title,
  action,
  note,
  children,
  className,
  bodyClassName,
}: HostCardProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={cn("scanner-section flex min-w-0 flex-col p-4", className)}
    >
      <div className="mb-3 flex min-h-[1.75rem] items-center justify-between gap-3">
        <h2 id={headingId} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
          <Icon className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          <span className="truncate">{title}</span>
        </h2>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className={cn("min-w-0 flex-1", bodyClassName)}>{children}</div>
      {note && <p className="mt-3 text-[11px] leading-4 text-gray-500">{note}</p>}
    </section>
  );
}

/** "All 162 →": a small violet text link. */
export function CardLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 rounded text-xs font-medium text-violet-400 transition-colors hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
        className,
      )}
    >
      {children}
      <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
    </Link>
  );
}

/** A label / value row (freshness, system summary). */
export function FactRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-3 text-xs leading-5", className)}>
      <dt className="text-gray-500">{label}</dt>
      <dd className="min-w-0 text-gray-200">{children}</dd>
    </div>
  );
}

export default HostCard;

/**
 * DashboardPanel — one Dashboard card (R01): the existing `scanner-section`
 * frame with a small icon + title row, an optional action at the right and
 * an optional footer link. PanelLink is the "Open Environment →" style link.
 */

import React, { useId } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "~/components/lib/utils";

export interface DashboardPanelProps {
  icon: LucideIcon;
  title: React.ReactNode;
  /** Right side of the title row, e.g. a PanelLink or a button. */
  action?: React.ReactNode;
  /** Under the body, e.g. "View all hosts in Environment →". */
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function DashboardPanel({
  icon: Icon,
  title,
  action,
  footer,
  children,
  className,
}: DashboardPanelProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={cn("scanner-section flex min-w-0 flex-col p-4", className)}>
      <div className="mb-3 flex min-h-[1.75rem] items-center justify-between gap-3">
        <h2 id={headingId} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
          <Icon className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
          <span className="truncate">{title}</span>
        </h2>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
      {footer && <div className="mt-3">{footer}</div>}
    </section>
  );
}

/** "Open Environment →": a small violet text link. */
export function PanelLink({
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

/** A one-line note inside a panel when there is nothing to list. */
export function PanelNote({ children }: { children: React.ReactNode }) {
  return <p className="py-2 text-sm text-gray-400">{children}</p>;
}

export default DashboardPanel;

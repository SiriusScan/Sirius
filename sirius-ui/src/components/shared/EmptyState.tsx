/**
 * EmptyState — one shared block for "nothing here yet", "needs the agent",
 * "not found" and "couldn't load". Icon, a title, a one-line reason and one
 * primary next step (plus an optional secondary one).
 *
 *   <EmptyState variant="no-data" title="No hosts yet"
 *     reason="Run a scan and every host it finds is added here."
 *     primary={{ label: "Start a scan", icon: Play, href: "/scanner" }} />
 *
 * `size="compact"` fits inside a card; `framed={false}` drops the section
 * border when the parent already draws one.
 */

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Radar, SearchX, User } from "lucide-react";
import { cn } from "~/components/lib/utils";

export type EmptyStateVariant = "no-data" | "needs-agent" | "not-found" | "error";

export interface EmptyStateAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  reason: React.ReactNode;
  primary?: EmptyStateAction;
  secondary?: EmptyStateAction;
  icon?: LucideIcon;
  /** "compact" for a block inside a card. Default "default". */
  size?: "default" | "compact";
  /** Draw the section border and background. Default true. */
  framed?: boolean;
  className?: string;
}

const VARIANT_ICON: Record<EmptyStateVariant, LucideIcon> = {
  "no-data": Radar,
  "needs-agent": User,
  "not-found": SearchX,
  error: AlertTriangle,
};

const actionClass = {
  primary:
    "inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
  secondary:
    "inline-flex items-center gap-2 rounded-md border border-violet-500/20 px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
};

function ActionButton({
  action,
  kind,
  compact,
}: {
  action: EmptyStateAction;
  kind: keyof typeof actionClass;
  compact: boolean;
}) {
  const Icon = action.icon;
  const className = cn(actionClass[kind], compact && "px-3 py-1.5 text-xs");
  const content = (
    <>
      {Icon && <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />}
      {action.label}
    </>
  );
  if (action.href) {
    return (
      <Link href={action.href} className={className} onClick={action.onClick}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={action.onClick} className={className}>
      {content}
    </button>
  );
}

export function EmptyState({
  variant,
  title,
  reason,
  primary,
  secondary,
  icon,
  size = "default",
  framed = true,
  className,
}: EmptyStateProps) {
  const Icon = icon ?? VARIANT_ICON[variant];
  const compact = size === "compact";
  const hasActions = primary !== undefined || secondary !== undefined;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        framed && "scanner-section",
        compact ? "px-4 py-6" : "px-6 py-12",
        className,
      )}
      role={variant === "error" ? "alert" : undefined}
      data-empty-state={variant}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-xl ring-1",
          compact ? "mb-3 h-9 w-9" : "mb-4 h-12 w-12",
          variant === "error"
            ? "bg-red-500/10 text-red-400 ring-red-500/20"
            : "bg-violet-500/10 text-violet-300 ring-violet-500/20",
        )}
      >
        <Icon className={compact ? "h-4 w-4" : "h-6 w-6"} aria-hidden />
      </div>
      <h2 className={cn("font-semibold text-white", compact ? "text-sm" : "text-base")}>{title}</h2>
      <p className={cn("max-w-md text-gray-400", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>{reason}</p>
      {hasActions && (
        <div
          className={cn(
            "flex flex-wrap items-center justify-center gap-3",
            compact ? "mt-4" : "mt-6",
          )}
        >
          {primary && <ActionButton action={primary} kind="primary" compact={compact} />}
          {secondary && <ActionButton action={secondary} kind="secondary" compact={compact} />}
        </div>
      )}
    </div>
  );
}

export default EmptyState;

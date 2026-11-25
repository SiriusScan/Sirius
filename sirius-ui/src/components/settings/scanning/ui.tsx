/**
 * Small building blocks shared by the Settings › Scanning sections (R10):
 * the section frame (the existing scanner-section card), table header and
 * cell styles, a neutral chip and a confirm dialog.
 */

import React, { useId } from "react";
import type { LucideIcon } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";

export interface SettingsSectionProps {
  icon: LucideIcon;
  title: React.ReactNode;
  /** One short line under the title. */
  description?: React.ReactNode;
  /** Right side of the title row, e.g. "+ New profile". */
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function SettingsSection({
  icon: Icon,
  title,
  description,
  actions,
  className,
  children,
}: SettingsSectionProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={cn("scanner-section min-w-0", className)}>
      <div className="flex min-h-[3.25rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-2 pt-3">
        <div className="min-w-0">
          <h2 id={headingId} className="flex min-w-0 items-center gap-2 text-sm font-semibold text-white">
            <Icon className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
            <span className="truncate">{title}</span>
          </h2>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

/** Uppercase column header text, as in the mockup tables. */
export const TH = "px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500";
/** A body cell. */
export const TD = "px-4 py-2.5 align-middle text-xs text-gray-300";
/** A table row with the hairline rule the scanner tables use. */
export const TR = "border-t border-violet-500/10";

/** A small neutral chip: profile type, branch, repository, category. */
export function Chip({
  children,
  mono = false,
  title,
  className,
}: {
  children: React.ReactNode;
  mono?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex max-w-full items-center truncate whitespace-nowrap rounded border border-gray-700/80 bg-gray-800/70 px-1.5 py-0.5 text-[11px] leading-4 text-gray-300",
        mono && "font-mono",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** "+ New profile" style header button. */
export function HeaderButton({
  icon: Icon,
  children,
  onClick,
  disabled,
  title,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <Button size="sm" onClick={onClick} disabled={disabled} title={title} className="h-8 gap-1.5 px-3 text-xs">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {children}
    </Button>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

/** A destructive confirmation, in place of window.confirm. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  busy = false,
  onConfirm,
  onOpenChange,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-gray-700 bg-gray-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-gray-400">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Rows of grey bars while a table loads. */
export function SkeletonRows({ rows = 4, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-2 px-4 pb-4 pt-1", className)} aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-7 animate-pulse rounded bg-gray-800/70" />
      ))}
    </div>
  );
}

/** An error inside a section: the shared EmptyState, compact and unframed. */
export function SectionError({
  title,
  reason,
  onRetry,
}: {
  title: string;
  reason: React.ReactNode;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      variant="error"
      size="compact"
      framed={false}
      title={title}
      reason={reason}
      {...(onRetry ? { primary: { label: "Retry", onClick: onRetry, icon: RefreshCw } } : {})}
    />
  );
}

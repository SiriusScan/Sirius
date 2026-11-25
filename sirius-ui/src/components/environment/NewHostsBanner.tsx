/**
 * NewHostsBanner — "1 new host from the scan at 12:04 PM was added
 * automatically." (R04, ADR-1). "Show new hosts" filters the table to them;
 * the close button acknowledges them.
 */

import React from "react";
import { CheckCircle2, X } from "lucide-react";
import { cn } from "~/components/lib/utils";

export interface NewHostsBannerProps {
  text: string;
  /** The table shows only the new hosts. */
  showingNew: boolean;
  onToggleShowNew: () => void;
  onDismiss: () => void;
  className?: string;
}

export function NewHostsBanner({
  text,
  showingNew,
  onToggleShowNew,
  onDismiss,
  className,
}: NewHostsBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-green-500/25 bg-green-500/[0.06] px-4 py-2.5 text-sm text-green-200",
        className,
      )}
    >
      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-400" aria-hidden />
      <p className="min-w-0 flex-1">{text}</p>
      <button
        type="button"
        onClick={onToggleShowNew}
        aria-pressed={showingNew}
        className="shrink-0 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium text-green-300 transition-colors hover:bg-green-500/10 hover:text-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
      >
        {showingNew ? "Show all hosts" : "Show new hosts"}
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        title="Dismiss"
        className="shrink-0 rounded-md p-1 text-green-300/70 transition-colors hover:bg-green-500/10 hover:text-green-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500/40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

export default NewHostsBanner;

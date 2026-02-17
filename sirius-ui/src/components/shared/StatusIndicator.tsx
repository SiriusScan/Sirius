/**
 * StatusIndicator — v0.4 status dot with optional glow effect.
 *
 * Provides a consistent online/offline/stale indicator used across
 * agent cards, detail views, and info panels.
 *
 * Usage:
 *   <StatusIndicator status="online" />
 *   <StatusIndicator status="offline" size="lg" glow />
 */

import React from "react";
import { cn } from "~/components/lib/utils";

/* ------------------------------------------------------------------ */
/*  Status palette                                                     */
/* ------------------------------------------------------------------ */

export type StatusValue = "online" | "stale" | "offline";

const STATUS_STYLES: Record<
  StatusValue,
  { bg: string; glow: string; text: string }
> = {
  online: {
    bg: "bg-emerald-400",
    glow: "shadow-[0_0_6px_rgba(52,211,153,0.4)]",
    text: "text-emerald-400",
  },
  stale: {
    bg: "bg-yellow-400",
    glow: "shadow-[0_0_6px_rgba(250,204,21,0.3)]",
    text: "text-yellow-400",
  },
  offline: {
    bg: "bg-red-400",
    glow: "shadow-[0_0_6px_rgba(248,113,113,0.3)]",
    text: "text-red-400",
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export interface StatusIndicatorProps {
  status: StatusValue;
  /** "sm" = 2×2 (default). "md" = 2.5×2.5. "lg" = 3×3. */
  size?: "sm" | "md" | "lg";
  /** Show the ambient glow effect. Default: false. */
  glow?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<StatusIndicatorProps["size"]>, string> = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = "sm",
  glow = false,
  className,
}) => {
  const styles = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-block rounded-full",
        SIZE_CLASSES[size],
        styles.bg,
        glow && styles.glow,
        className,
      )}
    />
  );
};

/**
 * Helper to resolve an agent-like status string to a StatusValue.
 * Accepts "online", "offline", "stale", or any casing thereof.
 */
export function resolveStatus(raw?: string): StatusValue {
  if (!raw) return "offline";
  const lower = raw.toLowerCase().trim();
  if (lower === "online") return "online";
  if (lower === "stale") return "stale";
  return "offline";
}

/**
 * Get the text color class for a status value.
 */
export function getStatusTextColor(status: StatusValue): string {
  return STATUS_STYLES[status].text;
}

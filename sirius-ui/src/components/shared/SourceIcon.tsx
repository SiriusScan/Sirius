import React from "react";
import { Bot, Wifi, type LucideIcon } from "lucide-react";
import { cn } from "~/components/lib/utils";

/* ------------------------------------------------------------------ */
/*  Scan-source icon registry                                          */
/* ------------------------------------------------------------------ */

export interface SourceIconConfig {
  icon: LucideIcon;
  color: string;
  label: string;
}

export const SOURCE_ICON_REGISTRY: Record<string, SourceIconConfig> = {
  agent: { icon: Bot, color: "text-cyan-400", label: "Agent" },
  network: { icon: Wifi, color: "text-violet-400", label: "Network" },
};

/* ------------------------------------------------------------------ */
/*  Single source icon (with optional tooltip + label)                 */
/* ------------------------------------------------------------------ */

export interface SourceIconProps {
  source: string;
  /** Pixel size for the icon (passed to lucide's `size` prop). @default 16 */
  size?: number;
  /** Show a text label next to the icon. @default false */
  showLabel?: boolean;
  /** Extra classes on the outer wrapper. */
  className?: string;
}

/**
 * Render a single scan-source icon with hover tooltip.
 *
 * ```tsx
 * <SourceIcon source="agent" />
 * <SourceIcon source="network" showLabel />
 * ```
 */
export const SourceIcon: React.FC<SourceIconProps> = ({
  source,
  size = 16,
  showLabel = false,
  className,
}) => {
  const cfg = SOURCE_ICON_REGISTRY[source];
  if (!cfg) return null;

  const Icon = cfg.icon;

  return (
    <div className={cn("group relative flex items-center gap-1.5", className)}>
      <Icon size={size} className={cfg.color} />
      {showLabel && (
        <span className={cn("text-xs", cfg.color.replace("400", "300"))}>
          {cfg.label}
        </span>
      )}
      {/* Hover tooltip */}
      <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-gray-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {cfg.label}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Multi-source icon row                                              */
/* ------------------------------------------------------------------ */

export interface SourceIconRowProps {
  sources: string[];
  /** Pixel size for each icon. @default 16 */
  size?: number;
  className?: string;
}

/**
 * Render a row of source icons for a host/vulnerability discovered by
 * one or more sources. Includes a combined title attribute.
 *
 * ```tsx
 * <SourceIconRow sources={["agent", "network"]} />
 * ```
 */
export const SourceIconRow: React.FC<SourceIconRowProps> = ({
  sources,
  size = 16,
  className,
}) => {
  if (!sources || sources.length === 0) return null;

  const title = sources
    .map((s) => SOURCE_ICON_REGISTRY[s]?.label ?? s)
    .join(" + ");

  return (
    <div className={cn("flex items-center gap-2", className)} title={title}>
      {sources.map((source) => (
        <SourceIcon key={source} source={source} size={size} />
      ))}
    </div>
  );
};

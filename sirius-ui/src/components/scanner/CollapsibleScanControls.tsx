import React from "react";
import { cn } from "~/components/lib/utils";

interface CollapsibleScanControlsProps {
  collapsed: boolean;
  hasScanResult: boolean;
  children: React.ReactNode;
}

/**
 * Visually hides scan controls without unmounting them.
 *
 * The target input owns transient editing state. Keeping the subtree mounted
 * while results are shown preserves the submitted targets for the next scan.
 */
export function CollapsibleScanControls({
  collapsed,
  hasScanResult,
  children,
}: CollapsibleScanControlsProps) {
  const hidden = collapsed && hasScanResult;

  return (
    <div
      hidden={hidden}
      className={cn(
        "scanner-section-primary scanner-section-padding space-y-4 overflow-hidden",
        hidden
          ? "-mt-6 mb-0 max-h-0 py-0 opacity-0"
          : "max-h-[800px] opacity-100 animate-in fade-in-50 slide-in-from-top-2",
      )}
    >
      {children}
    </div>
  );
}

import React from "react";
import { cn } from "~/components/lib/utils";
import { LayoutList, Command, LayoutGrid } from "lucide-react";
import { type ViewMode } from "~/components/vulnerability/types";

// Re-export ViewMode so existing imports keep working
export type { ViewMode };

interface ViewSelectorProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  className?: string;
}

const VIEW_OPTIONS: { mode: ViewMode; icon: typeof LayoutList; label: string }[] = [
  { mode: "table", icon: LayoutList, label: "Table" },
  { mode: "command", icon: Command, label: "Command Table" },
  { mode: "grouped", icon: LayoutGrid, label: "Grouped" },
];

/**
 * ViewModeSelector — v0.4 dark-only view mode toggle.
 */
export const ViewModeSelector: React.FC<ViewSelectorProps> = ({
  viewMode,
  onViewChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {VIEW_OPTIONS.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={cn(
            "flex h-8 items-center rounded-md px-3 text-sm transition-all",
            viewMode === mode
              ? "bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/30"
              : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-300",
          )}
        >
          <Icon className="mr-1.5 h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  );
};

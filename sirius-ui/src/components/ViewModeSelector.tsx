import React from "react";
import { cn } from "~/components/lib/utils";
import { LayoutList, Command, LayoutGrid } from "lucide-react";
import { type ViewMode } from "~/components/VulnerabilityTableViews";

interface ViewSelectorProps {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  className?: string;
}

/**
 * ViewModeSelector - A reusable component for switching between different view modes
 *
 * @param viewMode - The current view mode
 * @param onViewChange - Callback function when view mode changes
 * @param className - Optional additional classes
 */
export const ViewModeSelector: React.FC<ViewSelectorProps> = ({
  viewMode,
  onViewChange,
  className,
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <button
        onClick={() => onViewChange("table")}
        className={cn(
          "flex h-9 items-center rounded-md px-3 text-sm",
          viewMode === "table"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
            : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <LayoutList className="mr-1.5 h-4 w-4" />
        Table
      </button>
      <button
        onClick={() => onViewChange("command")}
        className={cn(
          "flex h-9 items-center rounded-md px-3 text-sm",
          viewMode === "command"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
            : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <Command className="mr-1.5 h-4 w-4" />
        Command Table
      </button>
      <button
        onClick={() => onViewChange("grouped")}
        className={cn(
          "flex h-9 items-center rounded-md px-3 text-sm",
          viewMode === "grouped"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
            : "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        )}
      >
        <LayoutGrid className="mr-1.5 h-4 w-4" />
        Grouped
      </button>
    </div>
  );
};

import React from "react";
import { cn } from "~/components/lib/utils";

export interface ScanNavigatorProps {
  handleViewNavigator: (view: string) => void;
  view: string;
}

export const ScanNavigator: React.FC<ScanNavigatorProps> = ({
  handleViewNavigator,
  view,
}) => {
  return (
    <nav className="flex gap-2 overflow-x-auto py-2">
      <button
        onClick={() => handleViewNavigator("scan")}
        className={cn(
          "whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
          view === "scan"
            ? "bg-violet-500/20 text-violet-300 shadow-sm ring-1 ring-violet-500/30"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
        )}
      >
        Scan Monitor
      </button>
      <button
        onClick={() => handleViewNavigator("profiles")}
        className={cn(
          "whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
          view === "profiles"
            ? "bg-violet-500/20 text-violet-300 shadow-sm ring-1 ring-violet-500/30"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
        )}
      >
        Profiles
      </button>
      <button
        onClick={() => handleViewNavigator("advanced")}
        className={cn(
          "whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
          view === "advanced"
            ? "bg-violet-500/20 text-violet-300 shadow-sm ring-1 ring-violet-500/30"
            : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
        )}
      >
        Advanced
      </button>
    </nav>
  );
};

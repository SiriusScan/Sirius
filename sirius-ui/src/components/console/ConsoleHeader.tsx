import React from "react";
import { cn } from "~/components/lib/utils";
import { Terminal, Clock, UserCog, Wifi, WifiOff } from "lucide-react";
import type { ConsoleView } from "./types";

interface ConsoleHeaderProps {
  activeView: ConsoleView;
  onViewChange: (view: ConsoleView) => void;
  agentCount: number;
  onlineCount: number;
}

const VIEW_TABS: {
  id: ConsoleView;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "history", label: "History", icon: Clock },
  { id: "agent", label: "Agent", icon: UserCog },
];

export const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({
  activeView,
  onViewChange,
  agentCount,
  onlineCount,
}) => {
  const offlineCount = agentCount - onlineCount;

  return (
    <div className="sticky top-2 z-30 mb-4 border-b border-violet-500/20 bg-gray-900/95 px-4 pb-4 pt-3 shadow-lg shadow-black/20 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-3">
        {/* Icon + Title group */}
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
            <Terminal className="h-6 w-6 text-violet-400" />
          </div>
          <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight text-white">
            Operator Console
          </h1>
        </div>

        {/* Tabs with icons */}
        <nav className="ml-1 flex shrink-0 items-center gap-1">
          {VIEW_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onViewChange(id)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                activeView === id
                  ? "bg-violet-500/20 text-white ring-1 ring-violet-500/30"
                  : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Status indicators -- right side (pr-14 to avoid avatar overlap) */}
        <div className="flex shrink-0 items-center gap-3 pr-14">
          <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
            <Wifi className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">
              {onlineCount} online
            </span>
          </div>

          {offlineCount > 0 && (
            <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5">
              <WifiOff className="h-4 w-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300">
                {offlineCount} offline
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
            <span className="text-sm font-semibold text-white">
              {agentCount}
            </span>
            <span className="text-xs text-violet-300/60">
              agent{agentCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

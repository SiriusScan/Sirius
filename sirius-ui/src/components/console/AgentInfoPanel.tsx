import React from "react";
import { cn } from "~/components/lib/utils";
import {
  RefreshCw,
  StickyNote,
  Tag,
  Server,
  ChevronRight,
} from "lucide-react";
import type { DisplayedAgentDetails } from "./types";

interface AgentInfoPanelProps {
  agentId: string;
  details: DisplayedAgentDetails;
  isDetailsLoading: boolean;
  tags: string[];
  note: string;
  onRefresh: () => void;
  onViewDetails: () => void;
}

export const AgentInfoPanel: React.FC<AgentInfoPanelProps> = ({
  agentId,
  details,
  isDetailsLoading,
  tags,
  note,
  onRefresh,
  onViewDetails,
}) => {
  const formatLastSeen = (isoString: string | null | undefined): string => {
    if (!isoString) return "Never";
    try {
      const date = new Date(isoString);
      const seconds = Math.round((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.round(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  const isOnline = details.status?.toLowerCase() === "online";

  return (
    <div className="border-t border-violet-500/20 bg-gray-900/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white">
            {details.name || details.id}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div
              className={cn(
                "h-2 w-2 rounded-full",
                isOnline ? "bg-emerald-400" : "bg-red-400"
              )}
            />
            <span className="text-[11px] text-gray-400">
              {isOnline
                ? "Online"
                : `Offline (${formatLastSeen(details.lastSeen)})`}
            </span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isDetailsLoading}
          className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isDetailsLoading && "animate-spin")}
          />
        </button>
      </div>

      {/* Quick-glance info */}
      <div className="space-y-2 px-4 pb-2">
        {/* System summary */}
        {(details.primaryIp || details.osArch) && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Server className="h-3 w-3 shrink-0 text-gray-400" />
            <span className="truncate">
              {[details.primaryIp, details.osArch].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}

        {/* Tag chips (read-only) */}
        {tags.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Tag className="h-3 w-3 shrink-0 text-gray-400" />
            <div className="flex flex-wrap gap-1 overflow-hidden">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-block rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 4 && (
                <span className="text-[10px] text-gray-500">
                  +{tags.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Note indicator */}
        {note && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <StickyNote className="h-3 w-3 shrink-0 text-amber-500/60" />
            <span className="truncate">{note}</span>
          </div>
        )}
      </div>

      {/* View details link */}
      <div className="border-t border-violet-500/10 px-4 py-2">
        <button
          onClick={onViewDetails}
          className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-medium text-violet-300/80 transition-colors hover:bg-violet-500/10 hover:text-violet-300"
        >
          View details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};

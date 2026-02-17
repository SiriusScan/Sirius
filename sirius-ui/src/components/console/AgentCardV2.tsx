import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { cn } from "~/components/lib/utils";
import {
  ExternalLink,
  CheckSquare,
  Square,
  Clock,
  StickyNote,
  Tag,
  X,
} from "lucide-react";
import type { Agent } from "./types";

// ─── Stale detection (Phase 1.4) ────────────────────────────────────────────

export type AgentFreshness = "online" | "stale" | "offline";

export function getAgentFreshness(agent: Agent): AgentFreshness {
  if (agent.status?.toLowerCase() !== "online") return "offline";
  if (!agent.lastSeen) return "online";
  const elapsed = Date.now() - new Date(agent.lastSeen).getTime();
  if (elapsed > 30 * 60 * 1000) return "offline"; // > 30 min
  if (elapsed > 5 * 60 * 1000) return "stale"; // > 5 min
  return "online";
}

// ─── Component ──────────────────────────────────────────────────────────────

interface AgentCardV2Props {
  agent: Agent;
  isSelected: boolean;
  isMultiSelected?: boolean;
  multiSelectMode?: boolean;
  tags?: string[];
  hasNote?: boolean;
  onClick: () => void;
  onMultiSelectToggle?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onRemoveTag?: (tag: string) => void;
}

export const AgentCardV2: React.FC<AgentCardV2Props> = ({
  agent,
  isSelected,
  isMultiSelected = false,
  multiSelectMode = false,
  tags,
  hasNote,
  onClick,
  onMultiSelectToggle,
  onContextMenu,
  onRemoveTag,
}) => {
  const router = useRouter();
  const freshness = useMemo(() => getAgentFreshness(agent), [agent]);

  const displayName = agent.host?.hostname || agent.name || agent.id;
  const displayIp = agent.host?.ip || "No IP";
  const displayOs = agent.host?.os || "Unknown";

  const handleHostNavigation = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (typeof window !== "undefined" && agent.host?.ip) {
        void router.push(`/host/${agent.host.ip}`);
      }
    },
    [router, agent.host?.ip]
  );

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMultiSelectToggle?.();
    },
    [onMultiSelectToggle]
  );

  const statusDotClasses = useMemo(() => {
    switch (freshness) {
      case "online":
        return "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]";
      case "stale":
        return "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.3)]";
      case "offline":
        return "bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.3)]";
    }
  }, [freshness]);

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={cn(
        "group w-full rounded-lg border p-3 text-left transition-all duration-150",
        freshness === "offline" && "opacity-60",
        isSelected
          ? "border-violet-500/40 bg-violet-500/10"
          : "border-violet-500/10 bg-gray-900/30 hover:border-violet-500/25 hover:bg-gray-900/50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Multi-select checkbox */}
        {multiSelectMode && (
          <button
            onClick={handleCheckboxClick}
            className="flex-shrink-0 text-gray-400 transition-colors hover:text-violet-300"
          >
            {isMultiSelected ? (
              <CheckSquare className="h-4 w-4 text-violet-400" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>
        )}

        {/* Status indicator */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <div className={cn("h-2.5 w-2.5 rounded-full", statusDotClasses)} />
          {freshness === "stale" && (
            <Clock className="h-3 w-3 text-amber-400" />
          )}
        </div>

        {/* Agent info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-white">
              {displayName}
            </span>
            {hasNote && (
              <StickyNote className="h-3 w-3 flex-shrink-0 text-yellow-500/60" />
            )}
          </div>
          <div className="truncate text-xs text-gray-400">
            {displayIp} &middot; {displayOs}
          </div>
        </div>

        {/* Host link */}
        <button
          onClick={handleHostNavigation}
          disabled={!agent.host?.ip}
          className={cn(
            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded opacity-0 transition-all group-hover:opacity-100",
            agent.host?.ip
              ? "text-gray-500 hover:bg-violet-500/10 hover:text-violet-300"
              : "cursor-not-allowed text-gray-300"
          )}
          title={agent.host?.ip ? `View host ${displayIp}` : "No host IP"}
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tags row */}
      {tags && tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="group/tag inline-flex items-center gap-0.5 rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300"
            >
              <Tag className="h-2 w-2" />
              {tag}
              {onRemoveTag && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTag(tag);
                  }}
                  className="ml-0.5 hidden rounded-sm hover:text-red-300 group-hover/tag:inline-flex"
                >
                  <X className="h-2 w-2" />
                </button>
              )}
            </span>
          ))}
        </div>
      )}
    </button>
  );
};

import React, { useState, useMemo, useCallback, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "~/components/lib/utils";
import {
  Search,
  Users,
  Apple,
  Monitor,
  Laptop,
  ListChecks,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  List,
  Network,
  Clock,
  Bookmark,
  CheckSquare,
  Square,
  MinusSquare,
} from "lucide-react";
import { toast } from "sonner";
import { AgentCardV2, getAgentFreshness } from "./AgentCardV2";
import { AgentInfoPanel } from "./AgentInfoPanel";
import { filterAgents } from "./useSmartFilter";
import type {
  Agent,
  DisplayedAgentDetails,
  AgentGroup,
  SavedFilter,
  GroupingMode,
} from "./types";

// ─── Types ──────────────────────────────────────────────────────────────────

type OsFilter = "all" | "darwin" | "windows" | "linux" | "stale";

interface AgentPanelProps {
  agents: Agent[] | undefined;
  isLoading: boolean;
  selectedAgentId: string | null;
  agentDetails: DisplayedAgentDetails | null;
  isDetailsLoading: boolean;
  multiSelectMode: boolean;
  multiSelectedIds: Set<string>;
  // Tags & Notes & Groups from persistence
  agentTags: Record<string, string[]>;
  agentGroups: AgentGroup[];
  agentNotes: Record<string, string>;
  savedFilters: SavedFilter[];
  groupingMode: GroupingMode;
  // Callbacks
  onAgentSelect: (agentId: string) => void;
  onMultiSelectToggle: (agentId: string) => void;
  onMultiSelectModeToggle: () => void;
  onRefreshDetails: (agentId: string) => void;
  onRunScan: (agentId: string) => void;
  onContextMenu: (agentId: string, e: React.MouseEvent) => void;
  // Tag/Note/Group/Filter callbacks
  onAddTag: (agentId: string, tag: string) => void;
  onRemoveTag: (agentId: string, tag: string) => void;
  onSetNote: (agentId: string, note: string) => void;
  onSaveFilter: (filter: SavedFilter) => void;
  onRemoveSavedFilter: (id: string) => void;
  onSetGroupingMode: (mode: GroupingMode) => void;
  onViewHost: (agentId: string) => void;
  onViewDetails: () => void;
  onSetMultiSelected: (ids: Set<string>) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSubnet(ip: string | undefined): string {
  if (!ip) return "Unknown";
  const parts = ip.split(".");
  if (parts.length !== 4) return "Unknown";
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
}

function getOsCategory(os: string | undefined): string {
  if (!os) return "Unknown";
  const lower = os.toLowerCase();
  if (lower.includes("darwin") || lower.includes("mac")) return "macOS";
  if (lower.includes("windows")) return "Windows";
  if (lower.includes("linux")) return "Linux";
  return "Other";
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AgentPanel: React.FC<AgentPanelProps> = ({
  agents,
  isLoading,
  selectedAgentId,
  agentDetails,
  isDetailsLoading,
  multiSelectMode,
  multiSelectedIds,
  agentTags,
  agentGroups,
  agentNotes,
  savedFilters,
  groupingMode,
  onAgentSelect,
  onMultiSelectToggle,
  onMultiSelectModeToggle,
  onRefreshDetails,
  onRunScan,
  onContextMenu,
  onAddTag,
  onRemoveTag,
  onSetNote,
  onSaveFilter,
  onRemoveSavedFilter,
  onSetGroupingMode,
  onViewHost,
  onViewDetails,
  onSetMultiSelected,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [osFilter, setOsFilter] = useState<OsFilter>("all");
  const [savingFilter, setSavingFilter] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );
  const parentRef = useRef<HTMLDivElement>(null);

  // ── Compute stats ───────────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!agents) return { total: 0, online: 0, offline: 0, windows: 0, linux: 0, mac: 0, stale: 0 };
    let online = 0,
      offline = 0,
      windows = 0,
      linux = 0,
      mac = 0,
      stale = 0;
    agents.forEach((a) => {
      const freshness = getAgentFreshness(a);
      if (freshness === "online") online++;
      else offline++;
      if (freshness === "stale") stale++;
      const os = (a.host?.os ?? "").toLowerCase();
      if (os.includes("windows")) windows++;
      else if (os.includes("linux")) linux++;
      else if (os.includes("darwin") || os.includes("mac")) mac++;
    });
    return { total: agents.length, online, offline, windows, linux, mac, stale };
  }, [agents]);

  const connectivityPct =
    stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 0;

  // ── Filter agents ───────────────────────────────────────────────────────

  const filteredAgents = useMemo(() => {
    if (!agents) return [];

    // First apply smart filter (structured query)
    let result = filterAgents(agents, searchTerm, agentTags, agentGroups);

    // Then apply OS / stale pill filter
    if (osFilter === "stale") {
      result = result.filter((a) => getAgentFreshness(a) === "stale");
    } else if (osFilter !== "all") {
      result = result.filter((a) =>
        a.host?.os?.toLowerCase().includes(osFilter)
      );
    }

    return result;
  }, [agents, searchTerm, osFilter, agentTags, agentGroups]);

  // ── Group agents for hierarchical view ────────────────────────────────

  const groupedAgents = useMemo(() => {
    if (groupingMode === "flat") {
      return [{ key: "__flat__", label: "", agents: filteredAgents }];
    }

    const groups: Record<string, Agent[]> = {};

    filteredAgents.forEach((agent) => {
      let key: string;
      switch (groupingMode) {
        case "os":
          key = getOsCategory(agent.host?.os);
          break;
        case "network":
          key = getSubnet(agent.host?.ip);
          break;
        case "group": {
          const agentGroupNames = agentGroups
            .filter((g) => g.agentIds.includes(agent.id))
            .map((g) => g.name);
          key = agentGroupNames.length > 0 ? agentGroupNames[0]! : "Ungrouped";
          break;
        }
        default:
          key = "All";
      }
      (groups[key] ??= []).push(agent);
    });

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, agents]) => ({
        key,
        label: key,
        agents,
      }));
  }, [filteredAgents, groupingMode, agentGroups]);

  // ── Build flat list for virtualizer ───────────────────────────────────

  type VirtualItem =
    | { type: "header"; key: string; label: string; count: number; onlineCount: number }
    | { type: "agent"; agent: Agent };

  const virtualItems = useMemo((): VirtualItem[] => {
    const items: VirtualItem[] = [];
    groupedAgents.forEach((group) => {
      if (groupingMode !== "flat") {
        const onlineInGroup = group.agents.filter(
          (a) => getAgentFreshness(a) !== "offline"
        ).length;
        items.push({
          type: "header",
          key: group.key,
          label: group.label,
          count: group.agents.length,
          onlineCount: onlineInGroup,
        });
      }
      if (groupingMode === "flat" || !collapsedGroups.has(group.key)) {
        group.agents.forEach((agent) => {
          items.push({ type: "agent", agent });
        });
      }
    });
    return items;
  }, [groupedAgents, groupingMode, collapsedGroups]);

  // ── Virtualizer ─────────────────────────────────────────────────────────

  const virtualizer = useVirtualizer({
    count: virtualItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = virtualItems[index];
      if (!item) return 80;
      if (item.type === "header") return 36;
      // Base card height: wrapper py-1 (8px) + card p-3 (24px) + border (2px)
      // + name line (~21px) + detail line (~18px) = ~73px base
      const tagCount = (agentTags[item.agent.id] ?? []).length;
      if (tagCount === 0) return 76;
      // Each tag is ~55px wide avg (icon + text + padding). Row width ~240px usable.
      // ~4 tags per row. Each row adds ~22px (gap + chip height).
      const rows = Math.ceil(tagCount / 4);
      return 76 + 6 + rows * 22; // 6px mt-1.5
    },
    overscan: 10,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const toggleGroupCollapse = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const handleSaveFilter = useCallback(() => {
    if (filterName.trim() && searchTerm.trim()) {
      onSaveFilter({
        id: `filter-${Date.now()}`,
        name: filterName.trim(),
        query: searchTerm,
      });
      setFilterName("");
      setSavingFilter(false);
      toast.success("Filter saved!");
    }
  }, [filterName, searchTerm, onSaveFilter]);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col border-r border-violet-500/20 bg-gray-900/50">
      {/* Agent Count Summary Bar (Phase 1.3) */}
      <div className="border-b border-violet-500/20 px-4 py-2">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-gray-300">
            {stats.online}
            <span className="text-gray-400"> / {stats.total} online</span>
          </span>
          <div className="flex items-center gap-2 text-gray-500">
            {stats.windows > 0 && <span>{stats.windows} Win</span>}
            {stats.linux > 0 && <span>{stats.linux} Lin</span>}
            {stats.mac > 0 && <span>{stats.mac} Mac</span>}
          </div>
        </div>
        {/* Connectivity bar */}
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              connectivityPct >= 80
                ? "bg-emerald-500"
                : connectivityPct >= 50
                ? "bg-yellow-500"
                : "bg-red-500"
            )}
            style={{ width: `${connectivityPct}%` }}
          />
        </div>
      </div>

      {/* Agent List Header with Search + Filters */}
      <div className="border-b border-violet-500/20 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Agents
          </span>
          <div className="flex items-center gap-1">
            {/* Grouping mode selector */}
            <select
              value={groupingMode}
              onChange={(e) =>
                onSetGroupingMode(e.target.value as GroupingMode)
              }
              className="rounded border border-violet-500/10 bg-gray-900 px-1 py-0.5 text-[10px] text-gray-400 outline-none transition-colors hover:border-violet-500/20 hover:text-gray-300 [&>option]:bg-gray-900 [&>option]:text-gray-300"
              title="Group by..."
            >
              <option value="flat">Flat</option>
              <option value="os">By OS</option>
              <option value="network">By Network</option>
              <option value="group">By Group</option>
            </select>
            <button
              onClick={onMultiSelectModeToggle}
              className={cn(
                "rounded p-1 transition-colors",
                multiSelectMode
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
              )}
              title={
                multiSelectMode ? "Exit multi-select" : "Multi-select mode"
              }
            >
              <ListChecks className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Smart filter input */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Filter... (os:windows status:online ip:10.*)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 w-full rounded-md border border-violet-500/10 bg-gray-900/50 pl-8 pr-8 text-xs text-white placeholder-gray-500 outline-none transition-colors focus:border-violet-500/30 focus:ring-1 focus:ring-violet-500/20"
          />
          {searchTerm && (
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5">
              <button
                onClick={() => setSavingFilter(true)}
                className="rounded p-0.5 text-gray-500 hover:text-violet-300"
                title="Save filter"
              >
                <Save className="h-3 w-3" />
              </button>
              <button
                onClick={() => setSearchTerm("")}
                className="rounded p-0.5 text-gray-500 hover:text-gray-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Save filter dialog */}
        {savingFilter && (
          <div className="mt-2 flex items-center gap-1">
            <input
              autoFocus
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveFilter();
                if (e.key === "Escape") setSavingFilter(false);
              }}
              placeholder="Filter name..."
              className="h-6 flex-1 rounded border border-violet-500/20 bg-gray-800 px-2 text-[10px] text-white outline-none"
            />
            <button
              onClick={handleSaveFilter}
              className="rounded bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300"
            >
              Save
            </button>
          </div>
        )}

        {/* Saved filter pills */}
        {savedFilters.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {savedFilters.map((f) => (
              <button
                key={f.id}
                onClick={() => setSearchTerm(f.query)}
                className="group flex items-center gap-1 rounded bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-300 transition-colors hover:bg-violet-500/20"
              >
                <Bookmark className="h-2 w-2" />
                {f.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSavedFilter(f.id);
                  }}
                  className="hidden text-gray-500 hover:text-red-400 group-hover:inline"
                >
                  <X className="h-2 w-2" />
                </button>
              </button>
            ))}
          </div>
        )}

        {/* OS + Stale filter pills */}
        <div className="mt-2 flex flex-wrap gap-1">
          {(
            [
              { key: "all" as const, label: "All", icon: Users },
              { key: "darwin" as const, label: "Mac", icon: Apple },
              { key: "windows" as const, label: "Win", icon: Monitor },
              { key: "linux" as const, label: "Linux", icon: Laptop },
              { key: "stale" as const, label: "Stale", icon: Clock },
            ]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setOsFilter(key)}
              className={cn(
                "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
                osFilter === key
                  ? key === "stale"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:bg-gray-800 hover:text-gray-400"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
              {key === "stale" && stats.stale > 0 && (
                <span className="text-amber-400">({stats.stale})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Multi-select toolbar */}
      {multiSelectMode && (
        <MultiSelectToolbar
          filteredCount={filteredAgents.length}
          selectedCount={multiSelectedIds.size}
          allFilteredSelected={
            filteredAgents.length > 0 &&
            filteredAgents.every((a) => multiSelectedIds.has(a.id))
          }
          onSelectAllFiltered={() => {
            const ids = new Set(multiSelectedIds);
            filteredAgents.forEach((a) => ids.add(a.id));
            onSetMultiSelected(ids);
          }}
          onDeselectAll={() => onSetMultiSelected(new Set())}
          onInvertSelection={() => {
            const ids = new Set<string>();
            filteredAgents.forEach((a) => {
              if (!multiSelectedIds.has(a.id)) ids.add(a.id);
            });
            onSetMultiSelected(ids);
          }}
        />
      )}

      {/* Virtualized Agent List */}
      <div ref={parentRef} className="flex-1 overflow-y-auto">
        {isLoading && !agents && (
          <div className="py-8 text-center text-xs text-gray-500">
            Loading agents...
          </div>
        )}
        {!isLoading && filteredAgents.length === 0 && (
          <div className="py-8 text-center text-xs text-gray-500">
            {searchTerm || osFilter !== "all"
              ? "No matching agents"
              : "No agents available"}
          </div>
        )}
        {filteredAgents.length > 0 && (
          <div
            style={{ height: `${virtualizer.getTotalSize()}px`, position: "relative" }}
          >
            {virtualizer.getVirtualItems().map((vRow) => {
              const item = virtualItems[vRow.index];
              if (!item) return null;

              if (item.type === "header") {
                const isCollapsed = collapsedGroups.has(item.key);
                return (
                  <div
                    key={`header-${item.key}`}
                    ref={virtualizer.measureElement}
                    data-index={vRow.index}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vRow.start}px)`,
                    }}
                  >
                    <button
                      onClick={() => toggleGroupCollapse(item.key)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 hover:bg-gray-800/30 hover:text-gray-300"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {item.label}
                      <span className="ml-auto font-normal text-gray-400">
                        {item.onlineCount}/{item.count}
                      </span>
                    </button>
                  </div>
                );
              }

              const agent = item.agent;
              return (
                <div
                  key={agent.id}
                  ref={virtualizer.measureElement}
                  data-index={vRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${vRow.start}px)`,
                  }}
                  className="px-3 py-1"
                >
                  <AgentCardV2
                    agent={agent}
                    isSelected={agent.id === selectedAgentId}
                    isMultiSelected={multiSelectedIds.has(agent.id)}
                    multiSelectMode={multiSelectMode}
                    tags={agentTags[agent.id]}
                    hasNote={!!agentNotes[agent.id]}
                    onClick={() => onAgentSelect(agent.id)}
                    onMultiSelectToggle={() => onMultiSelectToggle(agent.id)}
                    onContextMenu={(e) => onContextMenu(agent.id, e)}
                    onRemoveTag={(tag) => onRemoveTag(agent.id, tag)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Agent Info Panel -- compact summary */}
      {selectedAgentId && agentDetails && (
        <AgentInfoPanel
          agentId={selectedAgentId}
          details={agentDetails}
          isDetailsLoading={isDetailsLoading}
          tags={agentTags[selectedAgentId] ?? []}
          note={agentNotes[selectedAgentId] ?? ""}
          onRefresh={() => onRefreshDetails(selectedAgentId)}
          onViewDetails={onViewDetails}
        />
      )}
    </div>
  );
};

// ─── Multi-Select Toolbar ──────────────────────────────────────────────────

const MultiSelectToolbar: React.FC<{
  filteredCount: number;
  selectedCount: number;
  allFilteredSelected: boolean;
  onSelectAllFiltered: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
}> = ({
  filteredCount,
  selectedCount,
  allFilteredSelected,
  onSelectAllFiltered,
  onDeselectAll,
  onInvertSelection,
}) => {
  const CheckIcon = allFilteredSelected
    ? CheckSquare
    : selectedCount > 0
    ? MinusSquare
    : Square;

  return (
    <div className="flex items-center gap-2 border-b border-violet-500/20 bg-violet-500/5 px-4 py-2">
      {/* Select all / deselect all toggle */}
      <button
        onClick={allFilteredSelected ? onDeselectAll : onSelectAllFiltered}
        className="flex items-center gap-1.5 text-xs font-medium text-violet-300 transition-colors hover:text-violet-200"
        title={allFilteredSelected ? "Deselect all" : "Select all filtered"}
      >
        <CheckIcon className="h-3.5 w-3.5" />
        {allFilteredSelected ? "Deselect all" : "Select all"}
      </button>

      <span className="text-[10px] text-gray-400">|</span>

      {/* Invert */}
      <button
        onClick={onInvertSelection}
        className="text-[10px] text-gray-500 transition-colors hover:text-violet-300"
        title="Invert selection"
      >
        Invert
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Selection count */}
      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
        {selectedCount}/{filteredCount}
      </span>
    </div>
  );
};

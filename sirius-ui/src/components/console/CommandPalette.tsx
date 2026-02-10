import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { cn } from "~/components/lib/utils";
import {
  Search,
  Terminal,
  Users,
  Tag,
  Clock,
  Filter,
  FolderOpen,
  X,
} from "lucide-react";
import Fuse from "fuse.js";
import type { Agent, AgentGroup, SavedFilter } from "./types";

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  category: "command" | "agent" | "group" | "filter" | "history";
  icon: React.ElementType;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  agents: Agent[];
  groups: AgentGroup[];
  savedFilters: SavedFilter[];
  commandHistory: string[];
  onSelectAgent: (agentId: string) => void;
  onSelectGroup: (groupId: string) => void;
  onApplyFilter: (query: string) => void;
  onExecuteCommand: (command: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  command: Terminal,
  agent: Users,
  group: FolderOpen,
  filter: Filter,
  history: Clock,
};

const CATEGORY_LABELS: Record<string, string> = {
  command: "Commands",
  agent: "Agents",
  group: "Groups",
  filter: "Saved Filters",
  history: "History",
};

const BUILT_IN_COMMANDS = [
  { name: "help", description: "Show help message" },
  { name: "clear", description: "Clear terminal" },
  { name: "agents", description: "List available agents" },
  { name: "target", description: "Show current target" },
  { name: "use engine", description: "Switch to engine target" },
  { name: "status", description: "Show system status" },
  { name: "version", description: "Show terminal version" },
  { name: "history", description: "Show command history" },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  agents,
  groups,
  savedFilters,
  commandHistory,
  onSelectAgent,
  onSelectGroup,
  onApplyFilter,
  onExecuteCommand,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build all items
  const allItems = useMemo((): PaletteItem[] => {
    const items: PaletteItem[] = [];

    // Commands
    BUILT_IN_COMMANDS.forEach((cmd) => {
      items.push({
        id: `cmd-${cmd.name}`,
        label: cmd.name,
        description: cmd.description,
        category: "command",
        icon: Terminal,
        action: () => onExecuteCommand(cmd.name),
      });
    });

    // Agents
    agents.forEach((agent) => {
      const name = agent.host?.hostname || agent.name || agent.id;
      items.push({
        id: `agent-${agent.id}`,
        label: name,
        description: `${agent.host?.ip ?? "No IP"} · ${agent.host?.os ?? "Unknown"} · ${agent.status ?? "unknown"}`,
        category: "agent",
        icon: Users,
        action: () => onSelectAgent(agent.id),
      });
    });

    // Groups
    groups.forEach((group) => {
      items.push({
        id: `group-${group.id}`,
        label: group.name,
        description: `${group.agentIds.length} agents`,
        category: "group",
        icon: FolderOpen,
        action: () => onSelectGroup(group.id),
      });
    });

    // Saved filters
    savedFilters.forEach((filter) => {
      items.push({
        id: `filter-${filter.id}`,
        label: filter.name,
        description: filter.query,
        category: "filter",
        icon: Filter,
        action: () => onApplyFilter(filter.query),
      });
    });

    // Recent history (last 10 unique)
    const uniqueHistory = [...new Set(commandHistory)].slice(0, 10);
    uniqueHistory.forEach((cmd, i) => {
      items.push({
        id: `history-${i}`,
        label: cmd,
        category: "history",
        icon: Clock,
        action: () => onExecuteCommand(cmd),
      });
    });

    return items;
  }, [
    agents,
    groups,
    savedFilters,
    commandHistory,
    onSelectAgent,
    onSelectGroup,
    onApplyFilter,
    onExecuteCommand,
  ]);

  // Fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ["label", "description"],
        threshold: 0.4,
        includeScore: true,
      }),
    [allItems]
  );

  const results = useMemo(() => {
    if (!query.trim()) {
      // Show commands + recent history when no query
      return allItems.filter(
        (i) => i.category === "command" || i.category === "history"
      );
    }
    return fuse.search(query).map((r) => r.item);
  }, [query, allItems, fuse]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          selected.action();
          onClose();
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [results, selectedIndex, onClose]
  );

  // Scroll selected into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  if (!isOpen) return null;

  // Group results by category
  const groupedResults: { category: string; items: PaletteItem[] }[] = [];
  const categoryOrder = ["command", "agent", "group", "filter", "history"];
  let flatIndex = 0;
  const indexMap = new Map<number, number>(); // flatIdx -> grouped item real idx

  for (const cat of categoryOrder) {
    const catItems = results.filter((r) => r.category === cat);
    if (catItems.length > 0) {
      groupedResults.push({ category: cat, items: catItems });
      catItems.forEach(() => {
        indexMap.set(flatIndex, flatIndex);
        flatIndex++;
      });
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2">
        <div className="overflow-hidden rounded-xl border border-violet-500/20 bg-gray-900 shadow-2xl shadow-black/40">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-violet-500/20 px-4 py-3">
            <Search className="h-5 w-5 text-violet-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands, agents, groups, filters..."
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
            />
            <kbd className="rounded border border-gray-700 bg-gray-800 px-1.5 py-0.5 text-[10px] text-gray-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                No results found
              </div>
            ) : (
              <>
                {groupedResults.map(({ category, items }) => (
                  <div key={category} className="mb-2">
                    <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {CATEGORY_LABELS[category] ?? category}
                    </div>
                    {items.map((item) => {
                      const itemFlatIndex = results.indexOf(item);
                      const isSelected = itemFlatIndex === selectedIndex;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            item.action();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemFlatIndex)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            isSelected
                              ? "bg-violet-500/15 text-white"
                              : "text-gray-300 hover:bg-gray-800/60"
                          )}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0 text-gray-500" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">
                              {item.label}
                            </div>
                            {item.description && (
                              <div className="truncate text-xs text-gray-500">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <kbd className="rounded border border-gray-700 bg-gray-800 px-1 py-0.5 text-[9px] text-gray-400">
                              Enter
                            </kbd>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 border-t border-violet-500/10 px-4 py-2 text-[10px] text-gray-400">
            <span>
              <kbd className="rounded border border-gray-700 bg-gray-800 px-1 text-[9px]">
                ↑↓
              </kbd>{" "}
              Navigate
            </span>
            <span>
              <kbd className="rounded border border-gray-700 bg-gray-800 px-1 text-[9px]">
                Enter
              </kbd>{" "}
              Select
            </span>
            <span>
              <kbd className="rounded border border-gray-700 bg-gray-800 px-1 text-[9px]">
                Esc
              </kbd>{" "}
              Close
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

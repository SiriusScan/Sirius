import React, { useCallback, useState } from "react";
import { cn } from "~/components/lib/utils";
import { Plus, X, Edit2, Check } from "lucide-react";
import type { TerminalTab } from "./types";

interface TerminalTabsProps {
  tabs: TerminalTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
  onRenameTab: (id: string, name: string) => void;
}

export const TerminalTabs: React.FC<TerminalTabsProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
  onRenameTab,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startRename = useCallback(
    (e: React.MouseEvent, tab: TerminalTab) => {
      e.stopPropagation();
      setEditingId(tab.id);
      setEditValue(tab.name);
    },
    []
  );

  const commitRename = useCallback(() => {
    if (editingId && editValue.trim()) {
      onRenameTab(editingId, editValue.trim());
    }
    setEditingId(null);
  }, [editingId, editValue, onRenameTab]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commitRename();
      if (e.key === "Escape") setEditingId(null);
    },
    [commitRename]
  );

  return (
    <div className="flex items-center gap-0.5 border-b border-violet-500/20 bg-gray-900/30 px-2">
      <div className="flex flex-1 items-center gap-0.5 overflow-x-auto py-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingId === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                "group flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                isActive
                  ? "bg-violet-500/15 text-white ring-1 ring-violet-500/25"
                  : "text-gray-500 hover:bg-gray-800/60 hover:text-gray-300"
              )}
            >
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={commitRename}
                    className="w-20 bg-transparent text-xs text-white outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      commitRename();
                    }}
                    className="text-emerald-400"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="max-w-[100px] truncate">{tab.name}</span>
                  <span className="text-[10px] text-gray-400">
                    {tab.target.type === "engine"
                      ? "eng"
                      : tab.target.name?.slice(0, 8) ?? "agent"}
                  </span>
                </>
              )}

              {/* Tab actions (visible on hover) */}
              {!isEditing && (
                <div className="ml-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={(e) => startRename(e, tab)}
                    className="rounded p-0.5 text-gray-500 hover:text-gray-300"
                    title="Rename tab"
                  >
                    <Edit2 className="h-2.5 w-2.5" />
                  </button>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCloseTab(tab.id);
                      }}
                      className="rounded p-0.5 text-gray-500 hover:text-red-400"
                      title="Close tab"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New tab button */}
      {tabs.length < 10 && (
        <button
          onClick={onAddTab}
          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-400"
          title="New tab (Alt+T)"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  TerminalPersistenceState,
  Target,
  ConsoleView,
  AgentGroup,
  SavedFilter,
  TerminalTab,
  GroupingMode,
  OutputAnnotation,
} from "./types";

const STORAGE_KEY = "terminal_state_v1";
const DEBOUNCE_MS = 500;

const DEFAULT_STATE: TerminalPersistenceState = {
  version: 1,
  commandHistory: [],
  selectedTarget: { type: "engine" },
  activeView: "terminal",
  fontSize: 14,
  sidebarWidth: 288, // w-72 = 18rem = 288px
  sidebarCollapsed: false,
  timestampMode: false,
  concurrencyLimit: 50,
  agentTags: {},
  agentGroups: [],
  agentNotes: {},
  savedFilters: [],
  tabs: [{ id: "main", name: "Main", target: { type: "engine" } }],
  activeTabId: "main",
  groupingMode: "flat",
  annotations: [],
};

function loadState(): TerminalPersistenceState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TerminalPersistenceState>;
    if (parsed.version !== 1) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: TerminalPersistenceState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded or private browsing
  }
}

export function useTerminalPersistence() {
  const [state, setState] = useState<TerminalPersistenceState>(loadState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced persist
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveState(state), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state]);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setCommandHistory = useCallback((history: string[]) => {
    setState((s) => ({ ...s, commandHistory: history.slice(0, 200) }));
  }, []);

  const addCommandToHistory = useCallback((command: string) => {
    setState((s) => ({
      ...s,
      commandHistory: [command, ...s.commandHistory].slice(0, 200),
    }));
  }, []);

  const setSelectedTarget = useCallback((target: Target) => {
    setState((s) => ({ ...s, selectedTarget: target }));
  }, []);

  const setActiveView = useCallback((view: ConsoleView) => {
    setState((s) => ({ ...s, activeView: view }));
  }, []);

  const setFontSize = useCallback((size: number) => {
    setState((s) => ({ ...s, fontSize: Math.max(10, Math.min(24, size)) }));
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    setState((s) => ({
      ...s,
      sidebarWidth: Math.max(200, Math.min(500, width)),
    }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState((s) => ({ ...s, sidebarCollapsed: collapsed }));
  }, []);

  const setTimestampMode = useCallback((enabled: boolean) => {
    setState((s) => ({ ...s, timestampMode: enabled }));
  }, []);

  const setConcurrencyLimit = useCallback((limit: number) => {
    setState((s) => ({
      ...s,
      concurrencyLimit: Math.max(1, Math.min(500, limit)),
    }));
  }, []);

  const setGroupingMode = useCallback((mode: GroupingMode) => {
    setState((s) => ({ ...s, groupingMode: mode }));
  }, []);

  // ── Tags ─────────────────────────────────────────────────────────────────

  const addTag = useCallback((agentId: string, tag: string) => {
    setState((s) => {
      const current = s.agentTags[agentId] ?? [];
      if (current.includes(tag)) return s;
      return {
        ...s,
        agentTags: { ...s.agentTags, [agentId]: [...current, tag] },
      };
    });
  }, []);

  const removeTag = useCallback((agentId: string, tag: string) => {
    setState((s) => {
      const current = s.agentTags[agentId] ?? [];
      return {
        ...s,
        agentTags: {
          ...s.agentTags,
          [agentId]: current.filter((t) => t !== tag),
        },
      };
    });
  }, []);

  const getAllTags = useCallback((): string[] => {
    const all = new Set<string>();
    Object.values(state.agentTags).forEach((tags) =>
      tags.forEach((t) => all.add(t))
    );
    return Array.from(all).sort();
  }, [state.agentTags]);

  // ── Groups ───────────────────────────────────────────────────────────────

  const addGroup = useCallback((group: AgentGroup) => {
    setState((s) => ({
      ...s,
      agentGroups: [...s.agentGroups, group],
    }));
  }, []);

  const updateGroup = useCallback((groupId: string, updates: Partial<AgentGroup>) => {
    setState((s) => ({
      ...s,
      agentGroups: s.agentGroups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    }));
  }, []);

  const removeGroup = useCallback((groupId: string) => {
    setState((s) => ({
      ...s,
      agentGroups: s.agentGroups.filter((g) => g.id !== groupId),
    }));
  }, []);

  const addAgentToGroup = useCallback((groupId: string, agentId: string) => {
    setState((s) => ({
      ...s,
      agentGroups: s.agentGroups.map((g) =>
        g.id === groupId && !g.agentIds.includes(agentId)
          ? { ...g, agentIds: [...g.agentIds, agentId] }
          : g
      ),
    }));
  }, []);

  const removeAgentFromGroup = useCallback(
    (groupId: string, agentId: string) => {
      setState((s) => ({
        ...s,
        agentGroups: s.agentGroups.map((g) =>
          g.id === groupId
            ? { ...g, agentIds: g.agentIds.filter((id) => id !== agentId) }
            : g
        ),
      }));
    },
    []
  );

  // ── Notes ────────────────────────────────────────────────────────────────

  const setAgentNote = useCallback((agentId: string, note: string) => {
    setState((s) => {
      if (!note.trim()) {
        const { [agentId]: _, ...rest } = s.agentNotes;
        return { ...s, agentNotes: rest };
      }
      return { ...s, agentNotes: { ...s.agentNotes, [agentId]: note } };
    });
  }, []);

  // ── Saved Filters ───────────────────────────────────────────────────────

  const addSavedFilter = useCallback((filter: SavedFilter) => {
    setState((s) => ({
      ...s,
      savedFilters: [...s.savedFilters, filter],
    }));
  }, []);

  const removeSavedFilter = useCallback((filterId: string) => {
    setState((s) => ({
      ...s,
      savedFilters: s.savedFilters.filter((f) => f.id !== filterId),
    }));
  }, []);

  // ── Tabs ─────────────────────────────────────────────────────────────────

  const addTab = useCallback((tab: TerminalTab) => {
    setState((s) => {
      if (s.tabs.length >= 10) return s;
      return { ...s, tabs: [...s.tabs, tab], activeTabId: tab.id };
    });
  }, []);

  const removeTab = useCallback((tabId: string) => {
    setState((s) => {
      if (s.tabs.length <= 1) return s;
      const remaining = s.tabs.filter((t) => t.id !== tabId);
      const activeTabId =
        s.activeTabId === tabId
          ? remaining[remaining.length - 1]?.id ?? null
          : s.activeTabId;
      return { ...s, tabs: remaining, activeTabId };
    });
  }, []);

  const setActiveTab = useCallback((tabId: string) => {
    setState((s) => ({ ...s, activeTabId: tabId }));
  }, []);

  const renameTab = useCallback((tabId: string, name: string) => {
    setState((s) => ({
      ...s,
      tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, name } : t)),
    }));
  }, []);

  const updateTabTarget = useCallback((tabId: string, target: Target) => {
    setState((s) => ({
      ...s,
      tabs: s.tabs.map((t) => (t.id === tabId ? { ...t, target } : t)),
    }));
  }, []);

  // ── Annotations ──────────────────────────────────────────────────────────

  const addAnnotation = useCallback((annotation: OutputAnnotation) => {
    setState((s) => ({
      ...s,
      annotations: [...s.annotations, annotation],
    }));
  }, []);

  const removeAnnotation = useCallback((annotationId: string) => {
    setState((s) => ({
      ...s,
      annotations: s.annotations.filter((a) => a.id !== annotationId),
    }));
  }, []);

  return {
    state,
    // General
    setCommandHistory,
    addCommandToHistory,
    setSelectedTarget,
    setActiveView,
    setFontSize,
    setSidebarWidth,
    setSidebarCollapsed,
    setTimestampMode,
    setConcurrencyLimit,
    setGroupingMode,
    // Tags
    addTag,
    removeTag,
    getAllTags,
    // Groups
    addGroup,
    updateGroup,
    removeGroup,
    addAgentToGroup,
    removeAgentFromGroup,
    // Notes
    setAgentNote,
    // Saved Filters
    addSavedFilter,
    removeSavedFilter,
    // Tabs
    addTab,
    removeTab,
    setActiveTab,
    renameTab,
    updateTabTarget,
    // Annotations
    addAnnotation,
    removeAnnotation,
  };
}

export type TerminalPersistence = ReturnType<typeof useTerminalPersistence>;

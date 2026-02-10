import type { AgentWithHost } from "~/server/api/routers/agent";

// Re-export for convenience
export type Agent = AgentWithHost;

export interface Target {
  type: "engine" | "agent";
  id?: string;
  name?: string;
}

export type DisplayedAgentDetails = {
  id: string;
  name?: string | null;
  status?: string | null;
  lastSeen?: string | null;
  primaryIp?: string | null;
  osArch?: string | null;
  osVersion?: string | null;
  agentVersion?: string | null;
  uptime?: string | null;
};

export type ParsedAgentStatus = {
  agentId?: string;
  hostId?: string;
  uptime?: string;
  serverTarget?: string;
  apiTarget?: string;
  scriptingEnabled?: string;
  goVersion?: string;
  osArch?: string;
  osVersion?: string;
  primaryIp?: string;
  memoryAllocated?: string;
  goroutines?: string;
};

export type ConsoleView = "terminal" | "history" | "agent";

export interface CommandHistoryEntry {
  id: string;
  timestamp: Date;
  command: string;
  target: Target;
  output: string;
  success: boolean;
  /** Duration in milliseconds */
  durationMs?: number;
  /** Multi-exec metadata -- present when command was run on multiple agents */
  multiExec?: {
    agentCount: number;
    succeeded: number;
    failed: number;
    cancelled: number;
    results: Array<{
      agentId: string;
      agentName?: string;
      output: string;
      success: boolean;
    }>;
  };
}

// ─── Phase 2: Agent Organization ────────────────────────────────────────────

export interface AgentTag {
  name: string;
  color?: string;
}

export interface AgentGroup {
  id: string;
  name: string;
  agentIds: string[];
  color?: string;
}

export type GroupingMode = "flat" | "group" | "os" | "network";

export interface SavedFilter {
  id: string;
  name: string;
  query: string;
}

// ─── Phase 3: Multi-Exec ────────────────────────────────────────────────────

export interface MultiExecProgress {
  total: number;
  completed: number;
  succeeded: number;
  failed: number;
  cancelled: number;
  isRunning: boolean;
  results: MultiExecResult[];
}

export interface MultiExecResult {
  agentId: string;
  output: string;
  success: boolean;
  timestamp: number;
}

// ─── Phase 4: Terminal Tabs ─────────────────────────────────────────────────

export interface TerminalTab {
  id: string;
  name: string;
  target: Target;
}

// ─── Phase 5: Output Annotations ────────────────────────────────────────────

export interface OutputAnnotation {
  id: string;
  lineNumber: number;
  note: string;
  timestamp: number;
}

// ─── Persistence Schema ─────────────────────────────────────────────────────

export interface TerminalPersistenceState {
  version: number;
  commandHistory: string[];
  selectedTarget: Target;
  activeView: ConsoleView;
  fontSize: number;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  timestampMode: boolean;
  concurrencyLimit: number;
  agentTags: Record<string, string[]>;
  agentGroups: AgentGroup[];
  agentNotes: Record<string, string>;
  savedFilters: SavedFilter[];
  tabs: TerminalTab[];
  activeTabId: string | null;
  groupingMode: GroupingMode;
  annotations: OutputAnnotation[];
}

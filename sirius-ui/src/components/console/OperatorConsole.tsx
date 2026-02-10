import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { Terminal as XTerm } from "@xterm/xterm";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { XTermEmulator, type XTermEmulatorHandle } from "./XTermEmulator";
import { AgentPanel } from "./AgentPanel";
import { ConsoleHeader } from "./ConsoleHeader";
import { CommandToolbar } from "./CommandToolbar";
import { OutputHistory } from "./OutputHistory";
import { TerminalTabs } from "./TerminalTabs";
import { ExecutionProgress } from "./ExecutionProgress";
import { AgentContextMenu } from "./AgentContextMenu";
import { AgentDetailView } from "./AgentDetailView";
import { CommandPalette } from "./CommandPalette";
import { useTerminalPersistence } from "./useTerminalPersistence";
import { highlightOutput, addTimestamp } from "./syntaxHighlight";
import type {
  Target,
  DisplayedAgentDetails,
  CommandHistoryEntry,
  MultiExecProgress,
  TerminalTab,
} from "./types";

// ─── ANSI helpers ──────────────────────────────────────────────────────────────
const stripAnsi = (str: string): string =>
  str.replace(/\x1b\[[0-9;]*[mK]/g, "");

// ─── Local commands ────────────────────────────────────────────────────────────
const LOCAL_COMMANDS: Record<
  string,
  (term: XTerm, history?: string[]) => void | { exit: boolean }
> = {
  help: (term) => {
    term.writeln("");
    term.writeln(
      "\x1b[38;2;166;227;161m\x1b[1m         Sirius Operator Console Help\x1b[0m"
    );
    term.writeln(
      "\x1b[38;2;166;227;161m─────────────────────────────────────────\x1b[0m"
    );
    term.writeln("");
    term.writeln("\x1b[1mLocal Commands:\x1b[0m");
    term.writeln(
      "  \x1b[38;2;137;180;250mhelp\x1b[0m        - Show this help message"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mclear\x1b[0m       - Clear the terminal"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250magents\x1b[0m      - List available agents"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mtarget\x1b[0m      - Show current target"
    );
    term.writeln("  \x1b[38;2;137;180;250muse\x1b[0m         - Select target");
    term.writeln(
      "  \x1b[38;2;137;180;250mversion\x1b[0m     - Show terminal version"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mhistory\x1b[0m     - Show command history"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mexit\x1b[0m        - Close the session"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mstatus\x1b[0m      - Show system status"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mtimestamps\x1b[0m  - Toggle timestamp mode"
    );
    term.writeln("");
    term.writeln("\x1b[1mUsage Examples:\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse engine\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse agent sephiroth\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse group dmz-servers\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse tag needs-patching\x1b[0m");
    term.writeln("");
    term.writeln("\x1b[1mKeyboard Shortcuts:\x1b[0m");
    term.writeln("  Ctrl+C         - Cancel command");
    term.writeln("  Ctrl+L         - Clear screen");
    term.writeln("  Ctrl+Shift+F   - Search output");
    term.writeln("  Ctrl+Shift+=/- - Font size");
    term.writeln("  Alt+T          - New tab");
    term.writeln("  Alt+W          - Close tab");
    term.writeln("  Alt+1-9        - Switch tab");
    term.writeln("  Cmd/Ctrl+K     - Command palette");
    term.writeln("  Up/Down        - Command history");
    term.writeln("  Tab            - Auto-complete");
    term.writeln("");
  },
  clear: (term) => term.clear(),
  history: (term, history) => {
    if (!history) return;
    history.forEach((cmd, i) => {
      term.writeln(`  ${history.length - i - 1}  ${cmd}`);
    });
  },
  exit: (term) => {
    term.writeln("\x1b[38;2;166;227;161mClosing session...\x1b[0m");
    return { exit: true };
  },
  version: (term) => {
    term.writeln("\x1b[38;2;166;227;161mSirius Operator Console v0.4.0\x1b[0m");
  },
  status: (term) => {
    term.writeln("\x1b[38;2;166;227;161m╭─── System Status ───╮\x1b[0m");
    term.writeln(
      "\x1b[38;2;166;227;161m│\x1b[0m Terminal: \x1b[38;2;166;227;161mOnline\x1b[0m  \x1b[38;2;166;227;161m│\x1b[0m"
    );
    term.writeln(
      "\x1b[38;2;166;227;161m│\x1b[0m API:      \x1b[38;2;166;227;161mOnline\x1b[0m  \x1b[38;2;166;227;161m│\x1b[0m"
    );
    term.writeln(
      "\x1b[38;2;166;227;161m│\x1b[0m Queue:    \x1b[38;2;166;227;161mOnline\x1b[0m  \x1b[38;2;166;227;161m│\x1b[0m"
    );
    term.writeln("\x1b[38;2;166;227;161m╰─────────────────────╯\x1b[0m");
  },
};

// ─── OperatorConsole ───────────────────────────────────────────────────────────
export default function OperatorConsole() {
  const router = useRouter();
  const persistence = useTerminalPersistence();
  const { state: ps } = persistence;

  // ── State ──────────────────────────────────────────────────────────────────
  const xtermRef = useRef<XTermEmulatorHandle>(null);
  const commandHistoryRef = useRef<string[]>(ps.commandHistory);
  const historyPositionRef = useRef(-1);
  const promptLengthRef = useRef(0);
  const currentTargetRef = useRef<Target>(ps.selectedTarget);
  const pendingReExecRef = useRef<CommandHistoryEntry | null>(null);
  const executePendingReExecRef = useRef<
    ((entry: CommandHistoryEntry) => void) | null
  >(null);

  const [targetDisplay, setTargetDisplay] = useState<Target>(ps.selectedTarget);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(
    new Set()
  );
  const [commandHistory, setCommandHistory] = useState<CommandHistoryEntry[]>([]);

  // Multi-exec progress (Phase 3.1)
  const [multiExecProgress, setMultiExecProgress] =
    useState<MultiExecProgress>({
      total: 0,
      completed: 0,
      succeeded: 0,
      failed: 0,
      cancelled: 0,
      isRunning: false,
      results: [],
    });
  const abortControllerRef = useRef<AbortController | null>(null);

  // Context menu (Phase 5.2)
  const [contextMenu, setContextMenu] = useState<{
    agentId: string;
    x: number;
    y: number;
  } | null>(null);

  // Command palette (Phase 6.2)
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Sidebar resize (Phase 6.1)
  const [sidebarWidth, setSidebarWidth] = useState(ps.sidebarWidth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(ps.sidebarCollapsed);
  const [isResizing, setIsResizing] = useState(false);

  // Refs for values needed inside the terminal onKey closure
  const multiSelectModeRef = useRef(multiSelectMode);
  const multiSelectedIdsRef = useRef(multiSelectedIds);
  const timestampModeRef = useRef(ps.timestampMode);

  useEffect(() => {
    multiSelectModeRef.current = multiSelectMode;
  }, [multiSelectMode]);
  useEffect(() => {
    multiSelectedIdsRef.current = multiSelectedIds;
  }, [multiSelectedIds]);
  useEffect(() => {
    timestampModeRef.current = ps.timestampMode;
  }, [ps.timestampMode]);

  // ── API Queries ────────────────────────────────────────────────────────────
  const agentsQuery = api.agent.listAgentsWithHosts.useQuery(undefined, {
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });

  const agentDetailsQuery = api.agent.getAgentDetails.useQuery(
    { agentId: selectedAgentId || "" },
    { enabled: !!selectedAgentId, refetchInterval: 10000 }
  );


  const executeCommand = api.terminal.executeCommand.useMutation();

  // ── Command History (Valkey-backed) ────────────────────────────────────────
  const historyQuery = api.terminal.getHistory.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const addHistoryMutation = api.terminal.addHistoryEntry.useMutation();
  const deleteHistoryMutation = api.terminal.deleteHistoryEntry.useMutation();
  const clearHistoryMutation = api.terminal.clearHistory.useMutation();

  // Seed local state from Valkey on first successful load
  const historySeededRef = useRef(false);
  useEffect(() => {
    if (historyQuery.data && !historySeededRef.current) {
      historySeededRef.current = true;
      setCommandHistory(
        historyQuery.data.map((e) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }))
      );
    }
  }, [historyQuery.data]);

  const handleClearHistory = useCallback(() => {
    clearHistoryMutation.mutate(undefined, {
      onSuccess: () => {
        setCommandHistory([]);
        toast.success("Command history cleared");
      },
      onError: () => {
        toast.error("Failed to clear history");
      },
    });
  }, [clearHistoryMutation]);

  const handleDeleteHistoryEntry = useCallback(
    (entryId: string) => {
      deleteHistoryMutation.mutate(
        { entryId },
        {
          onSuccess: () => {
            setCommandHistory((prev) => prev.filter((e) => e.id !== entryId));
          },
          onError: () => {
            toast.error("Failed to delete history entry");
          },
        }
      );
    },
    [deleteHistoryMutation]
  );

  // ── Derived data ───────────────────────────────────────────────────────────
  const combinedAgentDetails = useMemo((): DisplayedAgentDetails | null => {
    if (!selectedAgentId) return null;

    if (agentDetailsQuery.data) {
      const d = agentDetailsQuery.data;
      return {
        id: d.id,
        name: d.name,
        status: d.status,
        lastSeen: d.lastSeen,
        primaryIp: d.host?.ip,
        osArch: d.host?.os,
        osVersion: d.host?.osVersion,
        agentVersion: undefined,
        uptime: undefined,
      };
    }

    const fromList = agentsQuery.data?.find((a) => a.id === selectedAgentId);
    if (fromList) {
      return {
        id: selectedAgentId,
        name: fromList.name,
        status: fromList.status,
        lastSeen: fromList.lastSeen,
        primaryIp: fromList.host?.ip,
        osArch: fromList.host?.os,
        osVersion: fromList.host?.osVersion,
        agentVersion: undefined,
        uptime: undefined,
      };
    }

    return null;
  }, [selectedAgentId, agentDetailsQuery.data, agentsQuery.data]);

  const onlineCount = useMemo(
    () =>
      agentsQuery.data?.filter((a) => a.status?.toLowerCase() === "online")
        .length ?? 0,
    [agentsQuery.data]
  );

  // ── Output writer with syntax highlighting + timestamps ───────────────────
  const writeOutput = useCallback(
    (term: XTerm, text: string, enableHighlight = true) => {
      const highlighted = highlightOutput(text, enableHighlight);
      const lines = highlighted.split("\n");
      lines.forEach((line: string) => {
        if (line.trim()) {
          const output = timestampModeRef.current ? addTimestamp(line) : line;
          term.writeln(output);
        }
      });
    },
    []
  );

  // ── Prompt writer ──────────────────────────────────────────────────────────
  const writePrompt = useCallback((term: XTerm) => {
    const target = currentTargetRef.current;
    const targetPrefix =
      target.type === "agent"
        ? `\x1b[38;2;243;139;168m[${target.name ?? target.id ?? "??"}]\x1b[0m `
        : "";
    const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
    const fullPrompt = targetPrefix + promptSuffix;

    promptLengthRef.current = stripAnsi(fullPrompt).length;

    term.write("\r\x1b[K");
    term.write(fullPrompt);
  }, []);

  // ── Command history recording ──────────────────────────────────────────────
  const addToHistory = useCallback(
    (
      command: string,
      target: Target,
      output: string,
      success: boolean,
      opts?: {
        durationMs?: number;
        multiExec?: CommandHistoryEntry["multiExec"];
      }
    ) => {
      const entry: CommandHistoryEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date(),
        command,
        target: { ...target },
        output,
        success,
        durationMs: opts?.durationMs,
        multiExec: opts?.multiExec,
      };

      // Update local state immediately
      setCommandHistory((prev) => [entry, ...prev]);

      // Persist to Valkey (fire-and-forget)
      addHistoryMutation.mutate({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      });
    },
    [addHistoryMutation]
  );

  // ── Terminal ready handler ─────────────────────────────────────────────────
  const handleTerminalReady = useCallback(
    (term: XTerm) => {
      // Welcome message
      term.writeln(
        "\x1b[38;2;203;166;247m╭────────────────────────────────╮"
      );
      term.writeln(
        "\x1b[38;2;203;166;247m│\x1b[0m Welcome to the Sirius Terminal \x1b[38;2;203;166;247m│"
      );
      term.writeln(
        "\x1b[38;2;203;166;247m╰────────────────────────────────╯\x1b[0m"
      );
      term.writeln("\x1b[38;2;166;227;161mHack the planet!\x1b[0m");
      term.writeln(
        "\x1b[38;2;137;180;250mType 'help' for available commands or use the sidebar\x1b[0m"
      );
      writePrompt(term);

      // Check for pending re-execute command (from history view)
      if (pendingReExecRef.current) {
        const entry = pendingReExecRef.current;
        pendingReExecRef.current = null;
        // Defer execution to after terminal setup completes
        // Use ref to get the latest closure (handleTerminalReady has [] deps)
        setTimeout(() => executePendingReExecRef.current?.(entry), 150);
      }

      // ── Input handling state ───────────────────────────────────────────
      let currentLine = "";
      let currentPosition = 0;

      const clearInputLine = () => {
        term.write(`\r\x1b[${promptLengthRef.current}C`);
        term.write("\x1b[K");
      };

      const redrawInputLine = () => {
        clearInputLine();
        term.write(currentLine);
        if (currentPosition < currentLine.length) {
          term.write(`\x1b[${currentLine.length - currentPosition}D`);
        }
      };

      const insertChar = (char: string) => {
        if (currentPosition === currentLine.length) {
          currentLine += char;
          currentPosition++;
          term.write(char);
        } else {
          currentLine =
            currentLine.slice(0, currentPosition) +
            char +
            currentLine.slice(currentPosition);
          currentPosition++;
          redrawInputLine();
        }
      };

      const backspace = () => {
        if (currentPosition <= 0) return;
        if (currentPosition === currentLine.length) {
          currentLine = currentLine.slice(0, -1);
          currentPosition--;
          term.write("\x1b[D\x1b[K");
        } else {
          currentLine =
            currentLine.slice(0, currentPosition - 1) +
            currentLine.slice(currentPosition);
          currentPosition--;
          redrawInputLine();
        }
      };

      // ── Tab completion ─────────────────────────────────────────────────
      const handleTabCompletion = async () => {
        const beforeCursor = currentLine.slice(0, currentPosition);
        const afterCursor = currentLine.slice(currentPosition);
        const commands = [
          "help",
          "clear",
          "agents",
          "target",
          "use",
          "version",
          "history",
          "exit",
          "status",
          "timestamps",
        ];
        const parts = beforeCursor.split(/\s+/);

        const redrawAfterSuggestions = () => {
          writePrompt(term);
          term.write(currentLine);
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}D`);
          }
        };

        if (parts.length === 1 && parts[0]) {
          const partial = parts[0].toLowerCase();
          const matches = commands.filter((c) => c.startsWith(partial));

          if (matches.length === 1 && matches[0]) {
            clearInputLine();
            currentLine = matches[0] + afterCursor;
            currentPosition = matches[0].length;
            term.write(currentLine);
            if (currentPosition < currentLine.length)
              term.write(`\x1b[${currentLine.length - currentPosition}D`);
          } else if (matches.length > 1) {
            term.writeln("");
            term.writeln(`Available commands: ${matches.join(", ")}`);
            let common = matches[0] || "";
            for (const m of matches) {
              while (common && !m.startsWith(common))
                common = common.slice(0, -1);
            }
            if (common.length > partial.length) {
              currentLine = common + afterCursor;
              currentPosition = common.length;
            }
            redrawAfterSuggestions();
          }
        } else if (
          parts.length === 2 &&
          parts[0]?.toLowerCase() === "use" &&
          parts[1]
        ) {
          const partial = parts[1].toLowerCase();
          const opts = ["engine", "agent", "group", "tag"];
          const matches = opts.filter((o) => o.startsWith(partial));

          if (matches.length === 1 && matches[0]) {
            clearInputLine();
            currentLine = `use ${matches[0]}${afterCursor}`;
            currentPosition = `use ${matches[0]}`.length;
            term.write(currentLine);
            if (currentPosition < currentLine.length)
              term.write(`\x1b[${currentLine.length - currentPosition}D`);
          } else if (matches.length > 1) {
            term.writeln("");
            term.writeln(matches.join("  "));
            redrawAfterSuggestions();
          }
        } else if (
          parts[0]?.toLowerCase() === "use" &&
          parts[1]?.toLowerCase() === "agent"
        ) {
          try {
            const freshAgents = await agentsQuery.refetch();
            const agents = freshAgents.data || [];
            const partial = parts[2]?.toLowerCase() || "";

            if (agents.length === 0) {
              term.writeln("");
              term.writeln("no agents available");
              redrawAfterSuggestions();
              return;
            }

            const agentOptions: { id: string; displayName: string }[] = [];
            agents.forEach((a) => {
              agentOptions.push({ id: a.id, displayName: a.id });
              if (a.name && a.name !== a.id)
                agentOptions.push({ id: a.id, displayName: a.name });
            });

            const matches = partial
              ? agentOptions.filter((o) =>
                  o.displayName.toLowerCase().startsWith(partial)
                )
              : agentOptions;

            if (matches.length === 1 && partial && matches[0]) {
              clearInputLine();
              currentLine = `use agent ${matches[0].id}${afterCursor}`;
              currentPosition = `use agent ${matches[0].id}`.length;
              term.write(currentLine);
              if (currentPosition < currentLine.length)
                term.write(`\x1b[${currentLine.length - currentPosition}D`);
            } else if (matches.length >= 1) {
              term.writeln("");
              const names = [...new Set(matches.map((m) => m.displayName))];
              term.writeln(names.join("  "));
              redrawAfterSuggestions();
            } else {
              term.writeln("");
              term.writeln(
                `Available agents: ${agents.map((a) => a.id).join(", ")}`
              );
              redrawAfterSuggestions();
            }
          } catch {
            // Silent fail
          }
        }
      };

      // ── Handle agents command ──────────────────────────────────────────
      const handleAgentsCommand = async () => {
        try {
          const fresh = await agentsQuery.refetch();
          if (fresh.data && fresh.data.length > 0) {
            term.writeln("");
            term.writeln(
              "\x1b[38;2;166;227;161m\x1b[1m                Available Agents\x1b[0m"
            );
            term.writeln(
              "\x1b[38;2;166;227;161m─────────────────────────────────────────────────────────\x1b[0m"
            );
            term.writeln("");
            term.writeln(
              "Agent ID         Name             Status   Last Seen"
            );
            term.writeln(
              "───────────────  ──────────────   ──────   ─────────────────"
            );

            fresh.data.forEach((agent) => {
              const id = (agent.id || "").substring(0, 15).padEnd(15);
              const name = (agent.name || "Unknown")
                .substring(0, 14)
                .padEnd(14);
              const status =
                agent.status === "online"
                  ? "\x1b[32mOnline\x1b[0m  "
                  : "\x1b[31mOffline\x1b[0m ";
              const lastSeen = agent.lastSeen
                ? new Date(agent.lastSeen).toLocaleTimeString()
                : "Never";
              term.writeln(`${id}  ${name}   ${status}  ${lastSeen}`);
            });

            term.writeln("");
            term.writeln(`Total agents: ${fresh.data.length}`);
            term.writeln("");
          } else {
            term.writeln("");
            term.writeln("\x1b[33mNo agents available.\x1b[0m");
            term.writeln("");
          }
        } catch {
          term.writeln(
            "  \x1b[38;2;243;139;168mError fetching agents\x1b[0m"
          );
        }
      };

      // ── Handle command ─────────────────────────────────────────────────
      const handleCommand = async (command: string) => {
        const cmd = command.trim().toLowerCase();
        const cmdParts = command.trim().split(/\s+/);

        // "timestamps" toggle
        if (cmd === "timestamps") {
          persistence.setTimestampMode(!timestampModeRef.current);
          term.writeln(
            `\x1b[38;2;166;227;161mTimestamps ${!timestampModeRef.current ? "enabled" : "disabled"}\x1b[0m`
          );
          setTimeout(() => writePrompt(term), 10);
          return;
        }

        // "use" command (extended with group/tag support)
        if (cmdParts[0]?.toLowerCase() === "use") {
          if (cmdParts.length < 2) {
            term.writeln(
              "\x1b[38;2;243;139;168musage: use {engine|agent|group|tag} [id]\x1b[0m"
            );
          } else if (cmdParts[1]?.toLowerCase() === "engine") {
            currentTargetRef.current = { type: "engine" };
            setTargetDisplay({ type: "engine" });
            setSelectedAgentId(null);
            persistence.setSelectedTarget({ type: "engine" });
            term.writeln(
              "\x1b[38;2;166;227;161mSwitched to engine target\x1b[0m"
            );
          } else if (cmdParts[1]?.toLowerCase() === "agent") {
            if (cmdParts.length < 3) {
              try {
                const fresh = await agentsQuery.refetch();
                if (fresh.data?.length) {
                  term.writeln(
                    "\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m"
                  );
                  term.writeln(
                    `       ${fresh.data.map((a) => a.id).join(", ")}`
                  );
                } else {
                  term.writeln(
                    "\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m"
                  );
                  term.writeln("       (no agents available)");
                }
              } catch {
                term.writeln(
                  "\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m"
                );
              }
            } else {
              const agentId = cmdParts[2]!;
              try {
                const fresh = await agentsQuery.refetch();
                const agent = fresh.data?.find((a) => a.id === agentId);
                if (!agent) {
                  term.writeln(
                    `\x1b[38;2;243;139;168magent '${agentId}' not found\x1b[0m`
                  );
                  if (fresh.data?.length) {
                    term.writeln(
                      `       ${fresh.data.map((a) => a.id).join(", ")}`
                    );
                  }
                } else {
                  const target: Target = {
                    type: "agent",
                    id: agentId,
                    name: agent.name ?? agentId,
                  };
                  currentTargetRef.current = target;
                  setTargetDisplay(target);
                  setSelectedAgentId(agentId);
                  persistence.setSelectedTarget(target);
                  term.writeln(
                    `\x1b[38;2;166;227;161mSwitched to agent '${agentId}'\x1b[0m`
                  );
                }
              } catch {
                term.writeln(
                  `\x1b[38;2;243;139;168mError checking agent availability\x1b[0m`
                );
              }
            }
          } else if (cmdParts[1]?.toLowerCase() === "group") {
            const groupName = cmdParts.slice(2).join(" ");
            if (!groupName) {
              term.writeln("\x1b[38;2;243;139;168musage: use group <name>\x1b[0m");
              const groups = ps.agentGroups;
              if (groups.length > 0) {
                term.writeln(
                  `       ${groups.map((g) => g.name).join(", ")}`
                );
              }
            } else {
              const group = ps.agentGroups.find(
                (g) => g.name.toLowerCase() === groupName.toLowerCase()
              );
              if (!group) {
                term.writeln(
                  `\x1b[38;2;243;139;168mGroup '${groupName}' not found\x1b[0m`
                );
              } else {
                // Select all agents in the group for multi-exec
                setMultiSelectMode(true);
                setMultiSelectedIds(new Set(group.agentIds));
                term.writeln(
                  `\x1b[38;2;166;227;161mSelected group '${group.name}' (${group.agentIds.length} agents)\x1b[0m`
                );
              }
            }
          } else if (cmdParts[1]?.toLowerCase() === "tag") {
            const tagName = cmdParts.slice(2).join(" ");
            if (!tagName) {
              term.writeln("\x1b[38;2;243;139;168musage: use tag <name>\x1b[0m");
              const allTags = persistence.getAllTags();
              if (allTags.length > 0) {
                term.writeln(`       ${allTags.join(", ")}`);
              }
            } else {
              const matchingAgents = Object.entries(ps.agentTags)
                .filter(([, tags]) =>
                  tags.some((t) => t.toLowerCase() === tagName.toLowerCase())
                )
                .map(([agentId]) => agentId);
              if (matchingAgents.length === 0) {
                term.writeln(
                  `\x1b[38;2;243;139;168mNo agents with tag '${tagName}'\x1b[0m`
                );
              } else {
                setMultiSelectMode(true);
                setMultiSelectedIds(new Set(matchingAgents));
                term.writeln(
                  `\x1b[38;2;166;227;161mSelected ${matchingAgents.length} agents with tag '${tagName}'\x1b[0m`
                );
              }
            }
          } else {
            term.writeln(
              `\x1b[38;2;243;139;168minvalid target '${cmdParts[1]}'\x1b[0m`
            );
            term.writeln(
              "\x1b[38;2;243;139;168musage: use {engine|agent|group|tag} [id]\x1b[0m"
            );
          }
          setTimeout(() => writePrompt(term), 10);
          return;
        }

        // "agents" command
        if (cmd === "agents") {
          await handleAgentsCommand();
          setTimeout(() => writePrompt(term), 10);
          return;
        }

        // "target" command
        if (cmd === "target") {
          const tgt = currentTargetRef.current;
          if (tgt.type === "agent") {
            term.writeln(
              `\x1b[38;2;166;227;161mCurrent target: agent ${tgt.id}\x1b[0m`
            );
          } else {
            term.writeln(
              `\x1b[38;2;166;227;161mCurrent target: engine\x1b[0m`
            );
          }
          setTimeout(() => writePrompt(term), 10);
          return;
        }

        // Standard local commands
        if (cmd in LOCAL_COMMANDS) {
          const handler = LOCAL_COMMANDS[cmd];
          if (handler) {
            handler(term, commandHistoryRef.current);
          }
          setTimeout(() => writePrompt(term), 10);
          return;
        }

        // Remote command execution
        try {
          const execStart = Date.now();
          const result = await executeCommand.mutateAsync({
            command,
            target: currentTargetRef.current,
          });
          const durationMs = Date.now() - execStart;

          if (result.output) {
            writeOutput(term, result.output);
          }

          addToHistory(
            command,
            currentTargetRef.current,
            result.output || "",
            true,
            { durationMs }
          );
          writePrompt(term);
        } catch (error) {
          const msg =
            error instanceof Error ? error.message : String(error);
          term.writeln(`\x1b[38;2;243;139;168mCommand failed: ${msg}\x1b[0m`);
          addToHistory(command, currentTargetRef.current, msg, false);
          writePrompt(term);
        }
      };

      // ── Multi-exec with batching, streaming, cancellation (Phases 3.1-3.4)
      const handleMultiExec = async (command: string) => {
        const selectedIds = Array.from(multiSelectedIdsRef.current);
        if (selectedIds.length === 0) {
          term.writeln(
            "\x1b[38;2;243;139;168mNo agents selected for multi-exec\x1b[0m"
          );
          writePrompt(term);
          return;
        }

        const concurrency = ps.concurrencyLimit;
        const total = selectedIds.length;
        const multiExecStart = Date.now();

        // Create abort controller
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setMultiExecProgress({
          total,
          completed: 0,
          succeeded: 0,
          failed: 0,
          cancelled: 0,
          isRunning: true,
          results: [],
        });

        term.writeln(
          `\x1b[38;2;203;166;247mExecuting on ${total} agent(s) (concurrency: ${concurrency})...\x1b[0m`
        );
        term.writeln("");

        let completed = 0;
        let succeeded = 0;
        let failed = 0;
        let cancelled = 0;
        const multiResults: Array<{
          agentId: string;
          agentName?: string;
          output: string;
          success: boolean;
        }> = [];

        // Batched execution with semaphore pattern
        const queue = [...selectedIds];
        const executing = new Set<Promise<void>>();

        const processAgent = async (agentId: string) => {
          if (controller.signal.aborted) {
            cancelled++;
            setMultiExecProgress((p) => ({
              ...p,
              completed: completed + cancelled,
              cancelled,
            }));
            return;
          }

          try {
            const result = await executeCommand.mutateAsync({
              command,
              target: { type: "agent", id: agentId },
            });

            completed++;
            succeeded++;

            // Stream output immediately (Phase 3.2)
            term.writeln(
              `\x1b[38;2;166;227;161m✓ [${agentId}]\x1b[0m`
            );
            if (result.output) {
              writeOutput(term, result.output);
            }
            term.writeln("");

            multiResults.push({
              agentId,
              output: result.output || "",
              success: true,
            });

            setMultiExecProgress((p) => ({
              ...p,
              completed: completed + cancelled,
              succeeded,
              results: [
                ...p.results,
                {
                  agentId,
                  output: result.output || "",
                  success: true,
                  timestamp: Date.now(),
                },
              ],
            }));
          } catch (error) {
            completed++;
            failed++;

            const msg =
              error instanceof Error ? error.message : String(error);
            term.writeln(
              `\x1b[38;2;243;139;168m✗ [${agentId}]\x1b[0m`
            );
            term.writeln(`  ${msg}`);
            term.writeln("");

            multiResults.push({
              agentId,
              output: msg,
              success: false,
            });

            setMultiExecProgress((p) => ({
              ...p,
              completed: completed + cancelled,
              failed,
              results: [
                ...p.results,
                {
                  agentId,
                  output: msg,
                  success: false,
                  timestamp: Date.now(),
                },
              ],
            }));
          }
        };

        // Process in batches
        while (queue.length > 0 || executing.size > 0) {
          while (queue.length > 0 && executing.size < concurrency) {
            if (controller.signal.aborted) {
              cancelled += queue.length;
              queue.length = 0;
              break;
            }
            const agentId = queue.shift()!;
            const p = processAgent(agentId).then(() => {
              executing.delete(p);
            });
            executing.add(p);
          }
          if (executing.size > 0) {
            await Promise.race(executing);
          }
        }

        // Wait for remaining
        await Promise.allSettled(Array.from(executing));

        setMultiExecProgress((p) => ({ ...p, isRunning: false, cancelled }));
        abortControllerRef.current = null;

        const multiDurationMs = Date.now() - multiExecStart;

        if (cancelled > 0) {
          term.writeln(
            `\x1b[38;2;249;226;175mCancelled. ${succeeded} completed, ${failed} failed, ${cancelled} cancelled.\x1b[0m`
          );
        } else {
          term.writeln(
            `\x1b[38;2;166;227;161mDone. ${succeeded} succeeded, ${failed} failed.\x1b[0m`
          );
        }

        // Record multi-exec to command history
        const combinedOutput = multiResults
          .map(
            (r) =>
              `[${r.success ? "OK" : "FAIL"}] ${r.agentId}\n${r.output}`
          )
          .join("\n\n");

        addToHistory(
          command,
          { type: "agent", name: `${total} agents` },
          combinedOutput,
          failed === 0 && cancelled === 0,
          {
            durationMs: multiDurationMs,
            multiExec: {
              agentCount: total,
              succeeded,
              failed,
              cancelled,
              results: multiResults,
            },
          }
        );

        writePrompt(term);
      };

      // ── Key handler ────────────────────────────────────────────────────
      const onKey = (e: { key: string; domEvent: KeyboardEvent }) => {
        const ev = e.domEvent;
        const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

        // Ctrl+C - cancel current input / abort multi-exec
        if (ev.ctrlKey && ev.key === "c") {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            return;
          }
          term.writeln("^C");
          currentLine = "";
          currentPosition = 0;
          historyPositionRef.current = -1;
          writePrompt(term);
          return;
        }

        // Ctrl+L - clear screen
        if (ev.ctrlKey && ev.key === "l") {
          term.clear();
          currentLine = "";
          currentPosition = 0;
          historyPositionRef.current = -1;
          writePrompt(term);
          return;
        }

        // Tab
        if (ev.key === "Tab") {
          ev.preventDefault();
          void handleTabCompletion();
          return;
        }

        // Enter
        if (ev.key === "Enter") {
          term.writeln("");
          const command = currentLine;
          if (command.trim()) {
            commandHistoryRef.current.unshift(command.trim());
            if (commandHistoryRef.current.length > 200)
              commandHistoryRef.current.pop();
            persistence.addCommandToHistory(command.trim());
          }
          historyPositionRef.current = -1;
          currentLine = "";
          currentPosition = 0;

          if (
            multiSelectModeRef.current &&
            multiSelectedIdsRef.current.size > 0 &&
            command.trim()
          ) {
            void handleMultiExec(command);
          } else {
            void handleCommand(command);
          }
          term.scrollToBottom();
          return;
        }

        // Backspace
        if (ev.key === "Backspace") {
          backspace();
          return;
        }

        // Arrow Left
        if (ev.key === "ArrowLeft") {
          if (currentPosition > 0) {
            currentPosition--;
            term.write("\x1b[D");
          }
          return;
        }

        // Arrow Right
        if (ev.key === "ArrowRight") {
          if (currentPosition < currentLine.length) {
            currentPosition++;
            term.write("\x1b[C");
          }
          return;
        }

        // Arrow Up (history)
        if (ev.key === "ArrowUp") {
          if (commandHistoryRef.current.length > 0) {
            if (
              historyPositionRef.current <
              commandHistoryRef.current.length - 1
            ) {
              historyPositionRef.current++;
              const histCmd =
                commandHistoryRef.current[historyPositionRef.current];
              if (histCmd !== undefined) {
                clearInputLine();
                currentLine = histCmd;
                currentPosition = currentLine.length;
                term.write(currentLine);
              }
            }
          }
          return;
        }

        // Arrow Down (history)
        if (ev.key === "ArrowDown") {
          if (historyPositionRef.current > -1) {
            historyPositionRef.current--;
            if (historyPositionRef.current === -1) {
              clearInputLine();
              currentLine = "";
              currentPosition = 0;
            } else {
              const histCmd =
                commandHistoryRef.current[historyPositionRef.current];
              if (histCmd !== undefined) {
                clearInputLine();
                currentLine = histCmd;
                currentPosition = currentLine.length;
                term.write(currentLine);
              }
            }
          }
          return;
        }

        // Home
        if (ev.key === "Home") {
          if (currentPosition > 0) {
            term.write(`\x1b[${currentPosition}D`);
            currentPosition = 0;
          }
          return;
        }

        // End
        if (ev.key === "End") {
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}C`);
            currentPosition = currentLine.length;
          }
          return;
        }

        // Printable character
        if (printable) {
          insertChar(e.key);
        }
      };

      term.onKey(onKey);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Handle sidebar agent selection ─────────────────────────────────────────
  useEffect(() => {
    if (selectedAgentId && xtermRef.current?.terminal && agentsQuery.data) {
      const agent = agentsQuery.data.find((a) => a.id === selectedAgentId);
      if (agent) {
        const isAlreadyCorrect =
          targetDisplay.type === "agent" &&
          targetDisplay.id === selectedAgentId;

        if (!isAlreadyCorrect) {
          const target: Target = {
            type: "agent",
            id: selectedAgentId,
            name: agent.name ?? selectedAgentId,
          };
          currentTargetRef.current = target;
          setTargetDisplay(target);
          persistence.setSelectedTarget(target);

          const term = xtermRef.current.terminal;
          if (term) writePrompt(term);
        }
      }
    }
  }, [selectedAgentId, targetDisplay.type, targetDisplay.id, agentsQuery.data, writePrompt, persistence]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K - Command palette (Phase 6.2)
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }

      // Alt+T - New tab (Phase 4.1)
      if (e.altKey && e.key === "t") {
        e.preventDefault();
        handleAddTab();
        return;
      }

      // Alt+W - Close tab
      if (e.altKey && e.key === "w") {
        e.preventDefault();
        if (ps.activeTabId) {
          persistence.removeTab(ps.activeTabId);
        }
        return;
      }

      // Alt+1-9 - Switch tab
      if (e.altKey && e.key >= "1" && e.key <= "9") {
        e.preventDefault();
        const idx = parseInt(e.key) - 1;
        const tab = ps.tabs[idx];
        if (tab) {
          persistence.setActiveTab(tab.id);
        }
        return;
      }

      // Ctrl+Shift+= / Ctrl+Shift+- - Font size (Phase 4.4)
      if (e.ctrlKey && e.shiftKey && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        persistence.setFontSize(ps.fontSize + 1);
        return;
      }
      if (e.ctrlKey && e.shiftKey && (e.key === "-" || e.key === "_")) {
        e.preventDefault();
        persistence.setFontSize(ps.fontSize - 1);
        return;
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [ps.activeTabId, ps.tabs, ps.fontSize, persistence]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgentId(agentId);
  }, []);

  const handleMultiSelectToggle = useCallback((agentId: string) => {
    setMultiSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) next.delete(agentId);
      else next.add(agentId);
      return next;
    });
  }, []);

  const handleMultiSelectModeToggle = useCallback(() => {
    setMultiSelectMode((prev) => !prev);
    if (multiSelectMode) setMultiSelectedIds(new Set());
  }, [multiSelectMode]);

  const handleRefreshDetails = useCallback(
    async (agentId: string) => {
      if (agentId === selectedAgentId) {
        await agentDetailsQuery.refetch();
      }
    },
    [selectedAgentId, agentDetailsQuery]
  );

  const handleRunScan = useCallback(
    (agentId: string) => {
      const agent = agentsQuery.data?.find((a) => a.id === agentId);
      const ip = agent?.host?.ip;
      if (ip) {
        // Ensure scan controls are expanded so the pre-filled target is visible
        if (typeof window !== "undefined") {
          localStorage.setItem("scanner.controlsCollapsed", "false");
        }
        void router.push(`/scanner?target=${encodeURIComponent(ip)}`);
      } else {
        toast.error("No IP address available for this agent");
      }
    },
    [agentsQuery.data, router]
  );

  const handleClear = useCallback(() => {
    xtermRef.current?.clear();
    const term = xtermRef.current?.terminal;
    if (term) writePrompt(term);
  }, [writePrompt]);

  const handleCopyOutput = useCallback(() => {
    const term = xtermRef.current?.terminal;
    if (!term) return;
    const selection = term.getSelection();
    if (selection) {
      navigator.clipboard
        .writeText(selection)
        .then(() => toast.success("Selection copied!"))
        .catch(() => toast.error("Failed to copy"));
    } else {
      toast.info("Select text in the terminal first");
    }
  }, []);

  // Execute a pending re-exec command once the terminal is ready
  const executePendingReExec = useCallback(
    (entry: CommandHistoryEntry) => {
      const term = xtermRef.current?.terminal;
      if (!term) return;

      // ── Multi-exec re-execute: iterate over each agent ──
      if (entry.multiExec && entry.multiExec.results.length > 0) {
        const agentIds = entry.multiExec.results.map((r) => r.agentId);
        const total = agentIds.length;

        term.writeln("");
        term.writeln(
          `\x1b[38;2;203;166;247mRe-executing on ${total} agent(s): ${entry.command}\x1b[0m`
        );
        term.writeln("");

        const multiExecStart = Date.now();
        let succeeded = 0;
        let failed = 0;
        const multiResults: Array<{
          agentId: string;
          output: string;
          success: boolean;
        }> = [];

        const processSequentially = async () => {
          for (const agentId of agentIds) {
            try {
              const result = await executeCommand.mutateAsync({
                command: entry.command,
                target: { type: "agent", id: agentId },
              });
              succeeded++;
              multiResults.push({
                agentId,
                output: result.output || "",
                success: true,
              });
              term.writeln(
                `\x1b[38;2;166;227;161m✓ [${agentId}]\x1b[0m`
              );
              if (result.output) writeOutput(term, result.output);
              term.writeln("");
            } catch (error) {
              failed++;
              const msg =
                error instanceof Error ? error.message : String(error);
              multiResults.push({ agentId, output: msg, success: false });
              term.writeln(
                `\x1b[38;2;243;139;168m✗ [${agentId}]\x1b[0m`
              );
              term.writeln(`  ${msg}`);
              term.writeln("");
            }
          }

          const durationMs = Date.now() - multiExecStart;
          term.writeln(
            `\x1b[38;2;166;227;161mDone. ${succeeded} succeeded, ${failed} failed.\x1b[0m`
          );

          const combinedOutput = multiResults
            .map(
              (r) =>
                `[${r.success ? "OK" : "FAIL"}] ${r.agentId}\n${r.output}`
            )
            .join("\n\n");

          addToHistory(
            entry.command,
            { type: "agent", name: `${total} agents` },
            combinedOutput,
            failed === 0,
            {
              durationMs,
              multiExec: {
                agentCount: total,
                succeeded,
                failed,
                cancelled: 0,
                results: multiResults,
              },
            }
          );
          writePrompt(term);
        };

        void processSequentially();
        return;
      }

      // ── Single-target re-execute ──
      term.writeln("");
      term.writeln(
        `\x1b[38;2;203;166;247mRe-executing: ${entry.command}\x1b[0m`
      );

      const execStart = Date.now();
      void executeCommand
        .mutateAsync({
          command: entry.command,
          target: entry.target,
        })
        .then((result) => {
          const durationMs = Date.now() - execStart;
          if (result.output) {
            writeOutput(term, result.output);
          }
          addToHistory(
            entry.command,
            entry.target,
            result.output || "",
            true,
            { durationMs }
          );
          writePrompt(term);
        })
        .catch((error) => {
          const msg =
            error instanceof Error ? error.message : String(error);
          term.writeln(
            `\x1b[38;2;243;139;168mCommand failed: ${msg}\x1b[0m`
          );
          addToHistory(entry.command, entry.target, msg, false);
          writePrompt(term);
        });
    },
    [executeCommand, addToHistory, writePrompt, writeOutput]
  );

  // Keep ref in sync so handleTerminalReady's closure can access the latest version
  executePendingReExecRef.current = executePendingReExec;

  const handleReExecute = useCallback(
    (entry: CommandHistoryEntry) => {
      const term = xtermRef.current?.terminal;

      if (term) {
        // Terminal is already mounted -- execute directly
        persistence.setActiveView("terminal");
        executePendingReExec(entry);
      } else {
        // Terminal not mounted yet (we're on history view) -- queue it
        pendingReExecRef.current = entry;
        persistence.setActiveView("terminal");
      }
    },
    [persistence, executePendingReExec]
  );

  // ── Tab management (Phase 4.1) ────────────────────────────────────────────
  const handleAddTab = useCallback(() => {
    const id = `tab-${Date.now()}`;
    const tab: TerminalTab = {
      id,
      name: `Tab ${ps.tabs.length + 1}`,
      target: { type: "engine" },
    };
    persistence.addTab(tab);
  }, [ps.tabs.length, persistence]);

  // ── Context menu handlers (Phase 5.2) ─────────────────────────────────────
  const handleContextMenu = useCallback(
    (agentId: string, e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ agentId, x: e.clientX, y: e.clientY });
    },
    []
  );

  const contextAgent = useMemo(() => {
    if (!contextMenu) return null;
    return agentsQuery.data?.find((a) => a.id === contextMenu.agentId) ?? null;
  }, [contextMenu, agentsQuery.data]);

  // ── Sidebar resize (Phase 6.1) ───────────────────────────────────────────
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const onMouseMove = (e: MouseEvent) => {
        const newWidth = Math.max(200, Math.min(500, startWidth + (e.clientX - startX)));
        setSidebarWidth(newWidth);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        persistence.setSidebarWidth(sidebarWidth);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [sidebarWidth, persistence]
  );

  const handleSidebarCollapse = useCallback(() => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    persistence.setSidebarCollapsed(next);
  }, [sidebarCollapsed, persistence]);

  // ── View host handler ─────────────────────────────────────────────────────
  const handleViewHost = useCallback(
    (agentId: string) => {
      const agent = agentsQuery.data?.find((a) => a.id === agentId);
      if (agent?.host?.ip) {
        void router.push(`/host/${agent.host.ip}`);
      }
    },
    [agentsQuery.data, router]
  );

  // ── Cancel multi-exec (Phase 3.4) ────────────────────────────────────────
  const handleCancelExecution = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // ── Open search (Phase 4.2) ──────────────────────────────────────────────
  const handleOpenSearch = useCallback(() => {
    xtermRef.current?.openSearch();
  }, []);

  // ── Palette actions (Phase 6.2) ──────────────────────────────────────────
  const handlePaletteSelectAgent = useCallback(
    (agentId: string) => {
      setSelectedAgentId(agentId);
      const agent = agentsQuery.data?.find((a) => a.id === agentId);
      if (agent) {
        const target: Target = {
          type: "agent",
          id: agentId,
          name: agent.name ?? agentId,
        };
        currentTargetRef.current = target;
        setTargetDisplay(target);
        persistence.setSelectedTarget(target);
        const term = xtermRef.current?.terminal;
        if (term) {
          term.writeln(
            `\x1b[38;2;166;227;161mSwitched to agent '${agentId}'\x1b[0m`
          );
          writePrompt(term);
        }
      }
    },
    [agentsQuery.data, writePrompt, persistence]
  );

  const handlePaletteSelectGroup = useCallback(
    (groupId: string) => {
      const group = ps.agentGroups.find((g) => g.id === groupId);
      if (group) {
        setMultiSelectMode(true);
        setMultiSelectedIds(new Set(group.agentIds));
        toast.success(`Selected group '${group.name}'`);
      }
    },
    [ps.agentGroups]
  );

  const handlePaletteExecuteCommand = useCallback(
    (command: string) => {
      const term = xtermRef.current?.terminal;
      if (!term) return;
      persistence.setActiveView("terminal");
      term.writeln("");
      term.writeln(`\x1b[38;2;137;180;250msirius>\x1b[0m ${command}`);

      const cmd = command.trim().toLowerCase();
      if (cmd in LOCAL_COMMANDS) {
        const handler = LOCAL_COMMANDS[cmd];
        if (handler) handler(term, commandHistoryRef.current);
        writePrompt(term);
      }
    },
    [writePrompt, persistence]
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const effectiveSidebarWidth = sidebarCollapsed ? 48 : sidebarWidth;

  return (
    <div className="relative z-20 -mt-14 flex h-[calc(100%+3.5rem)] min-h-0 flex-col">
      {/* Header */}
      <ConsoleHeader
        activeView={ps.activeView}
        onViewChange={persistence.setActiveView}
        agentCount={agentsQuery.data?.length ?? 0}
        onlineCount={onlineCount}
      />

      {/* Terminal Tabs (Phase 4.1) */}
      {ps.activeView === "terminal" && ps.tabs.length > 1 && (
        <TerminalTabs
          tabs={ps.tabs}
          activeTabId={ps.activeTabId}
          onSelectTab={persistence.setActiveTab}
          onAddTab={handleAddTab}
          onCloseTab={persistence.removeTab}
          onRenameTab={persistence.renameTab}
        />
      )}

      {/* Main content */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar with resize (Phase 6.1) */}
        <div
          className="relative flex-shrink-0 border-r border-violet-500/10 bg-gray-950/50"
          style={{ width: effectiveSidebarWidth }}
        >
          {!sidebarCollapsed ? (
            <AgentPanel
              agents={agentsQuery.data}
              isLoading={agentsQuery.isLoading}
              selectedAgentId={selectedAgentId}
              agentDetails={combinedAgentDetails}
              isDetailsLoading={agentDetailsQuery.isLoading}
              multiSelectMode={multiSelectMode}
              multiSelectedIds={multiSelectedIds}
              agentTags={ps.agentTags}
              agentGroups={ps.agentGroups}
              agentNotes={ps.agentNotes}
              savedFilters={ps.savedFilters}
              groupingMode={ps.groupingMode}
              onAgentSelect={handleAgentSelect}
              onMultiSelectToggle={handleMultiSelectToggle}
              onMultiSelectModeToggle={handleMultiSelectModeToggle}
              onRefreshDetails={handleRefreshDetails}
              onRunScan={handleRunScan}
              onContextMenu={handleContextMenu}
              onAddTag={persistence.addTag}
              onRemoveTag={persistence.removeTag}
              onSetNote={persistence.setAgentNote}
              onSaveFilter={persistence.addSavedFilter}
              onRemoveSavedFilter={persistence.removeSavedFilter}
              onSetGroupingMode={persistence.setGroupingMode}
              onViewHost={handleViewHost}
              onViewDetails={() => persistence.setActiveView("agent")}
              onSetMultiSelected={setMultiSelectedIds}
            />
          ) : (
            /* Collapsed sidebar - icon-only mode */
            <div className="flex h-full flex-col items-center gap-2 pt-3">
              {(agentsQuery.data ?? []).slice(0, 20).map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentSelect(agent.id)}
                  className={`h-2.5 w-2.5 rounded-full ${
                    agent.status?.toLowerCase() === "online"
                      ? "bg-emerald-400"
                      : "bg-red-400"
                  }`}
                  title={agent.host?.hostname || agent.name || agent.id}
                />
              ))}
            </div>
          )}

          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-violet-500/30"
            onMouseDown={handleResizeStart}
            onDoubleClick={handleSidebarCollapse}
            style={{ cursor: isResizing ? "col-resize" : undefined }}
          />
        </div>

        {/* Content area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {ps.activeView === "terminal" && (
            <>
              {/* Execution Progress (Phase 3.1) */}
              {multiExecProgress.isRunning && (
                <ExecutionProgress
                  progress={multiExecProgress}
                  onCancel={handleCancelExecution}
                />
              )}

              {/* Command toolbar */}
              <CommandToolbar
                target={targetDisplay}
                multiExecMode={multiSelectMode}
                multiExecCount={multiSelectedIds.size}
                timestampMode={ps.timestampMode}
                fontSize={ps.fontSize}
                onClear={handleClear}
                onCopyOutput={handleCopyOutput}
                onMultiExecToggle={handleMultiSelectModeToggle}
                onTimestampToggle={() =>
                  persistence.setTimestampMode(!ps.timestampMode)
                }
                onFontSizeChange={(delta) =>
                  persistence.setFontSize(ps.fontSize + delta)
                }
                onOpenSearch={handleOpenSearch}
              />

              {/* Terminal */}
              <div className="flex-1 overflow-hidden bg-[#1e1e2e] p-4">
                <XTermEmulator
                  ref={xtermRef}
                  onReady={handleTerminalReady}
                  fontSize={ps.fontSize}
                  instanceId={ps.activeTabId ?? "main"}
                />
              </div>
            </>
          )}

          {ps.activeView === "history" && (
            <OutputHistory
              entries={commandHistory}
              onReExecute={handleReExecute}
              onDeleteEntry={handleDeleteHistoryEntry}
              onClearAll={handleClearHistory}
            />
          )}

          {ps.activeView === "agent" && (
            <AgentDetailView
              agentId={selectedAgentId}
              details={combinedAgentDetails}
              tags={selectedAgentId ? (ps.agentTags[selectedAgentId] ?? []) : []}
              note={selectedAgentId ? (ps.agentNotes[selectedAgentId] ?? "") : ""}
              onRunScan={() => {
                if (selectedAgentId) handleRunScan(selectedAgentId);
              }}
              onViewHost={() => {
                if (selectedAgentId) handleViewHost(selectedAgentId);
              }}
              onAddTag={(tag) => {
                if (selectedAgentId) persistence.addTag(selectedAgentId, tag);
              }}
              onRemoveTag={(tag) => {
                if (selectedAgentId) persistence.removeTag(selectedAgentId, tag);
              }}
              onSetNote={(note) => {
                if (selectedAgentId) persistence.setAgentNote(selectedAgentId, note);
              }}
              onCopyId={() => {
                if (selectedAgentId) {
                  navigator.clipboard
                    .writeText(selectedAgentId)
                    .then(() => toast.success("Agent ID copied!"))
                    .catch(() => toast.error("Failed to copy Agent ID"));
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Context Menu (Phase 5.2) */}
      {contextMenu && contextAgent && (
        <AgentContextMenu
          agentId={contextMenu.agentId}
          agentName={
            contextAgent.host?.hostname ||
            contextAgent.name ||
            contextMenu.agentId
          }
          agentIp={contextAgent.host?.ip}
          position={{ x: contextMenu.x, y: contextMenu.y }}
          onClose={() => setContextMenu(null)}
          onSelect={() => handleAgentSelect(contextMenu.agentId)}
          onRunScan={() => handleRunScan(contextMenu.agentId)}
          onCheckStatus={() => {
            const term = xtermRef.current?.terminal;
            if (term) {
              term.writeln(
                `\x1b[38;2;137;180;250mChecking status of ${contextMenu.agentId}...\x1b[0m`
              );
            }
          }}
          onViewHost={() => handleViewHost(contextMenu.agentId)}
          onCopyIp={() => {
            const ip = contextAgent.host?.ip;
            if (ip) {
              navigator.clipboard
                .writeText(ip)
                .then(() => toast.success("IP copied!"))
                .catch(() => toast.error("Failed to copy"));
            }
          }}
          onCopyId={() => {
            navigator.clipboard
              .writeText(contextMenu.agentId)
              .then(() => toast.success("Agent ID copied!"))
              .catch(() => toast.error("Failed to copy"));
          }}
          onAddTag={() => {
            const tag = prompt("Enter tag name:");
            if (tag?.trim()) {
              persistence.addTag(contextMenu.agentId, tag.trim().toLowerCase());
              toast.success(`Tag '${tag.trim()}' added`);
            }
          }}
          onAddNote={() => {
            const note = prompt(
              "Enter note:",
              ps.agentNotes[contextMenu.agentId] ?? ""
            );
            if (note !== null) {
              persistence.setAgentNote(contextMenu.agentId, note);
              toast.success("Note saved");
            }
          }}
        />
      )}

      {/* Command Palette (Phase 6.2) */}
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        agents={agentsQuery.data ?? []}
        groups={ps.agentGroups}
        savedFilters={ps.savedFilters}
        commandHistory={ps.commandHistory}
        onSelectAgent={handlePaletteSelectAgent}
        onSelectGroup={handlePaletteSelectGroup}
        onApplyFilter={(query) => {
          toast.info(`Filter applied: ${query}`);
        }}
        onExecuteCommand={handlePaletteExecuteCommand}
      />
    </div>
  );
}

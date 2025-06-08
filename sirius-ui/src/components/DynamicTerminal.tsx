import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { api } from "~/utils/api";
import { AgentList } from "~/components/agent/AgentList";
import { AgentSummary } from "~/components/agent/AgentSummary";
import { AgentDetails } from "~/components/agent/AgentDetails";
import { StatusDashboard } from "~/components/terminal/StatusDashboard";

import { cn } from "~/components/lib/utils";
import "@xterm/xterm/css/xterm.css";
import { toast } from "sonner";

// Module-level singleton to prevent multiple terminal instances
// This addresses React Strict Mode double mounting in development
let globalTerminalInstance: XTerm | null = null;
let globalInitializationInProgress = false;

// Safety cleanup function for edge cases
const ensureGlobalCleanup = () => {
  if (
    globalTerminalInstance &&
    globalTerminalInstance.element?.isConnected === false
  ) {
    console.log("[Terminal] Cleaning up orphaned global instance");
    globalTerminalInstance.dispose();
    globalTerminalInstance = null;
    globalInitializationInProgress = false;
  }
};

// Catppuccin Mocha color scheme
const MOCHA_THEME = {
  background: "#1e1e2e", // Base
  foreground: "#cdd6f4", // Text
  cursor: "#f5e0dc", // Rosewater
  cursorAccent: "#1e1e2e", // Base
  selection: "#585b7066", // Surface2 with alpha
  black: "#45475a", // Surface1
  red: "#f38ba8", // Red
  green: "#a6e3a1", // Green
  yellow: "#f9e2af", // Yellow
  blue: "#89b4fa", // Blue
  magenta: "#cba6f7", // Mauve
  cyan: "#89dceb", // Sky
  white: "#bac2de", // Subtext1
  brightBlack: "#585b70", // Surface2
  brightRed: "#f38ba8", // Red
  brightGreen: "#a6e3a1", // Green
  brightYellow: "#f9e2af", // Yellow
  brightBlue: "#89b4fa", // Blue
  brightMagenta: "#cba6f7", // Mauve
  brightCyan: "#89dceb", // Sky
  brightWhite: "#a6adc8", // Subtext0
} as const;

interface Target {
  type: "engine" | "agent";
  id?: string;
  name?: string;
}

// Define Agent type here (or move to shared types later)
type Agent = {
  id: string;
  name?: string | null;
  status?: string | null;
  lastSeen?: string | null;
};

// Define the curated details structure to be displayed
export type DisplayedAgentDetails = {
  id: string; // Always need the ID
  name?: string | null;
  status?: string | null;
  lastSeen?: string | null;
  primaryIp?: string | null;
  osArch?: string | null;
  osVersion?: string | null;
  agentVersion?: string | null; // Renamed from 'version' for clarity?
  uptime?: string | null;
};

// Keep ParsedAgentStatus for parsing, but don't export if not needed elsewhere
type ParsedAgentStatus = {
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

// Note: agents and target commands need special handling with agentsQuery.data access,
// so they will be handled separately in the handleCommand function
const LOCAL_COMMANDS = {
  help: (term: XTerm) => {
    term.writeln("");
    term.writeln("\x1b[38;2;166;227;161m\x1b[1m         Sirius Agent Terminal Help\x1b[0m");
    term.writeln("\x1b[38;2;166;227;161m─────────────────────────────────────────\x1b[0m");
    term.writeln("");
    term.writeln("\x1b[1mLocal Commands:\x1b[0m");
    term.writeln("  \x1b[38;2;137;180;250mhelp\x1b[0m      - Show this help message");
    term.writeln("  \x1b[38;2;137;180;250mclear\x1b[0m     - Clear the terminal");
    term.writeln("  \x1b[38;2;137;180;250magents\x1b[0m    - List available agents");
    term.writeln("  \x1b[38;2;137;180;250mtarget\x1b[0m    - Show current target");
    term.writeln("  \x1b[38;2;137;180;250muse\x1b[0m       - Select target");
    term.writeln("  \x1b[38;2;137;180;250mversion\x1b[0m   - Show terminal version");
    term.writeln("  \x1b[38;2;137;180;250mhistory\x1b[0m   - Show command history");
    term.writeln("  \x1b[38;2;137;180;250mexit\x1b[0m      - Close the session");
    term.writeln("  \x1b[38;2;137;180;250mstatus\x1b[0m    - Show system status");
    term.writeln("");
    term.writeln("\x1b[1mUsage Examples:\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse engine\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse agent sephiroth\x1b[0m");
    term.writeln("  \x1b[38;2;247;154;134muse agent sirius-engine\x1b[0m");
    term.writeln("");
    term.writeln("\x1b[1mKeyboard Shortcuts:\x1b[0m");
    term.writeln("  Ctrl+C     - Cancel command");
    term.writeln("  Ctrl+L     - Clear screen");
    term.writeln("  Up/Down    - Command history");
    term.writeln("  Tab        - Auto-complete");
    term.writeln("");
  },
  clear: (term: XTerm) => term.clear(),
  history: (term: XTerm, history: string[]) => {
    history.forEach((cmd, i) => {
      term.writeln(`  ${history.length - i - 1}  ${cmd}`);
    });
  },
  exit: (term: XTerm) => {
    term.writeln("\x1b[38;2;166;227;161mClosing session...\x1b[0m");
    return { exit: true };
  },
  version: (term: XTerm) => {
    term.writeln("\x1b[38;2;166;227;161mSirius Agent Terminal v0.1.0\x1b[0m");
  },
  status: (term: XTerm) => {
    term.writeln("\x1b[38;2;166;227;161m╭─── System Status ───╮\x1b[0m");
    term.writeln("\x1b[38;2;166;227;161m│\x1b[0m Terminal: \x1b[38;2;166;227;161mOnline\x1b[0m  \x1b[38;2;166;227;161m│\x1b[0m");
    term.writeln("\x1b[38;2;166;227;161m│\x1b[0m API:      \x1b[38;2;166;227;161mOnline\x1b[0m  \x1b[38;2;166;227;161m│\x1b[0m");
    term.writeln("\x1b[38;2;166;227;161m│\x1b[0m Queue:    \x1b[38;2;166;227;161mOnline\x1b[0m  \x1b[38;2;166;227;161m│\x1b[0m");
    term.writeln("\x1b[38;2;166;227;161m╰─────────────────────╯\x1b[0m");
  },
} as const;

export default function DynamicTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const commandHistoryRef = useRef<string[]>([]);
  const historyPositionRef = useRef(-1);
  const currentLineRef = useRef("");
  const promptLengthRef = useRef(0);
  const currentTargetRef = useRef<Target>({
    type: "engine",
  });
  const [targetDisplay, setTargetDisplay] = useState<Target>({
    type: "engine",
  });
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [agentStatusDetails, setAgentStatusDetails] =
    useState<ParsedAgentStatus | null>(null);
  const isInitializingRef = useRef(false);

  // Query for agents data using the new router with host information
  const agentsQuery = api.agent.listAgentsWithHosts.useQuery(undefined, {
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  });

  // Query for agent details (now from the agent router)
  const agentDetailsQuery = api.agent.getAgentDetails.useQuery(
    { agentId: selectedAgentId || "" },
    {
      enabled: !!selectedAgentId,
      refetchInterval: 10000,
    }
  );

  // Use the agent details query loading state instead of separate state
  const isRefreshingDetails = agentDetailsQuery.isLoading;

  // Combine agent list data and parsed status details
  const combinedAgentDetails = useMemo((): DisplayedAgentDetails | null => {
    if (!selectedAgentId) return null;

    // Use the agent details from the new agent router
    if (agentDetailsQuery.data) {
      const agentData = agentDetailsQuery.data;
      return {
        id: agentData.id,
        name: agentData.name,
        status: agentData.status,
        lastSeen: agentData.lastSeen,
        primaryIp: agentData.host?.ip,
        osArch: agentData.host?.os,
        osVersion: agentData.host?.osVersion,
        agentVersion: undefined, // Not available yet
        uptime: undefined, // Not available yet
      };
    }

    // Fallback: use basic agent info from list if available
    const agentFromList = agentsQuery.data?.find(
      (a) => a.id === selectedAgentId
    );
    
    if (agentFromList) {
      return {
        id: selectedAgentId,
        name: agentFromList.name,
        status: agentFromList.status,
        lastSeen: agentFromList.lastSeen,
        primaryIp: agentFromList.host?.ip,
        osArch: agentFromList.host?.os,
        osVersion: agentFromList.host?.osVersion,
        agentVersion: undefined,
        uptime: undefined,
      };
    }

    return null;
  }, [selectedAgentId, agentDetailsQuery.data, agentsQuery.data]);

  const stripAnsi = (str: string): string => {
    return str.replace(/\x1b\[[0-9;]*[mK]/g, "");
  };

  const writePrompt = useCallback((term: XTerm) => {
    const target = currentTargetRef.current;
    const targetPrefix =
      target.type === "agent"
        ? `\x1b[38;2;243;139;168m[${target.name ?? target.id ?? "??"}]\x1b[0m `
        : "";
    const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
    const fullPrompt = targetPrefix + promptSuffix;

    const visiblePrompt = stripAnsi(fullPrompt);
    promptLengthRef.current = visiblePrompt.length;

    term.write("\r\x1b[K");
    term.write(fullPrompt);
  }, []);

  // Mutation to initialize terminal session
  const initializeSession = api.terminal.initializeSession.useMutation({
    onSuccess: (result) => {
      console.log("[Terminal] Session initialized:", result);
    },
    onError: (error) => {
      console.error("[Terminal] Session initialization failed:", error);
      toast.error("Failed to initialize terminal session");
    },
  });

  // Mutation to execute commands (handlers moved to separate useEffect)
  const executeCommand = api.terminal.executeCommand.useMutation();

  // Handle agent command with direct API call to ensure fresh data
  const handleAgentsCommand = async (term: XTerm) => {
    console.log("[Terminal] agentsQuery.data:", agentsQuery.data);
    console.log("[Terminal] agentsQuery.isLoading:", agentsQuery.isLoading);
    console.log("[Terminal] agentsQuery.error:", agentsQuery.error);
    
    try {
      // Force refetch agents to get fresh data 
      const freshAgents = await agentsQuery.refetch();
      console.log("[Terminal] Fresh agents data:", freshAgents.data);
      
      if (freshAgents.data && freshAgents.data.length > 0) {
        term.writeln("");
        term.writeln("\x1b[38;2;166;227;161m\x1b[1m                Available Agents\x1b[0m");
        term.writeln("\x1b[38;2;166;227;161m─────────────────────────────────────────────────────────\x1b[0m");
        term.writeln("");
        term.writeln("Agent ID         Name             Status   Last Seen");
        term.writeln("───────────────  ──────────────   ──────   ─────────────────");
        
        freshAgents.data.forEach((agent) => {
          console.log("[Terminal] Processing agent:", agent);
          const agentId = (agent.id || "").substring(0, 15).padEnd(15);
          const agentName = (agent.name || "Unknown").substring(0, 14).padEnd(14);
          const status = agent.status === "online" ? '\x1b[32mOnline\x1b[0m  ' : '\x1b[31mOffline\x1b[0m ';
          const lastSeen = agent.lastSeen ? new Date(agent.lastSeen).toLocaleTimeString() : "Never";
          
          term.writeln(`${agentId}  ${agentName}   ${status}  ${lastSeen}`);
        });
        
        term.writeln("");
        term.writeln(`Total agents: ${freshAgents.data.length}`);
        term.writeln("");
      } else {
        term.writeln("");
        term.writeln("\x1b[38;2;166;227;161m\x1b[1m                Available Agents\x1b[0m");
        term.writeln("\x1b[38;2;166;227;161m─────────────────────────────────────────────────────────\x1b[0m");
        term.writeln("");
        term.writeln("\x1b[33mNo agents available.\x1b[0m");
        term.writeln("");
        term.writeln(`\x1b[38;2;137;180;250mDebug: freshAgents.data = ${JSON.stringify(freshAgents.data)}\x1b[0m`);
        term.writeln(`\x1b[38;2;137;180;250mDebug: Original agentsQuery.data = ${JSON.stringify(agentsQuery.data)}\x1b[0m`);
      }
    } catch (error) {
      console.error("[Terminal] Error fetching agents:", error);
      term.writeln("  \x1b[38;2;243;139;168mError fetching agents\x1b[0m");
      term.writeln(`  \x1b[38;2;137;180;250mFallback agentsQuery.data = ${JSON.stringify(agentsQuery.data)}\x1b[0m`);
    }
  };

  // Handle target command
  const handleTargetCommand = (term: XTerm) => {
    const target = currentTargetRef.current;
    if (target.type === "agent") {
      term.writeln(
        `\x1b[38;2;166;227;161mCurrent target: agent ${target.id}\x1b[0m`
      );
    } else {
      term.writeln(`\x1b[38;2;166;227;161mCurrent target: engine\x1b[0m`);
    }
  };

  // Handle agent details refresh
  const handleRefreshAgentDetails = useCallback(async (agentId: string) => {
    console.log(`[Terminal] Refreshing details for agent ${agentId}`);
    // Refetch agent details using the new query
    if (agentId === selectedAgentId) {
      await agentDetailsQuery.refetch();
    }
  }, [selectedAgentId, agentDetailsQuery]);

  // Rest of the terminal initialization logic...
  useEffect(() => {
    // Safety cleanup for orphaned instances
    ensureGlobalCleanup();

    // Enhanced guard logic using both local and global state
    if (
      !terminalRef.current ||
      terminal.current ||
      isInitializingRef.current ||
      globalTerminalInstance ||
      globalInitializationInProgress
    ) {
      console.log("[Terminal useEffect] Skipping initialization:", {
        noTerminalRef: !terminalRef.current,
        terminalExists: !!terminal.current,
        localInitializing: isInitializingRef.current,
        globalInstance: !!globalTerminalInstance,
        globalInitializing: globalInitializationInProgress,
      });
      return;
    }

    // Set both local and global initialization flags
    isInitializingRef.current = true;
    globalInitializationInProgress = true;
    console.log(
      "[Terminal useEffect] Initializing xterm with singleton protection..."
    );

    const term = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
      theme: MOCHA_THEME,
      letterSpacing: 0,
      lineHeight: 1.2,
      scrollback: 5000,
      cursorStyle: "block",
      cursorWidth: 2,
      rows: 30,
      cols: 80,
      scrollOnUserInput: true,
      fastScrollModifier: "alt",
    });

    const webLinksAddon = new WebLinksAddon();
    const currentFitAddon = new FitAddon();
    fitAddonRef.current = currentFitAddon;

    term.loadAddon(currentFitAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);

    // Set both local and global references
    terminal.current = term;
    globalTerminalInstance = term;
    console.log("[Terminal useEffect] Xterm opened and registered globally.");

    const initialFit = () => {
      setTimeout(() => {
        try {
          if (terminal.current?.element && fitAddonRef.current) {
            fitAddonRef.current.fit();
            console.log("[Terminal useEffect] Delayed initial fit executed.");
          }
        } catch (e) {
          console.error(
            "[Terminal useEffect] Error during delayed initial fit:",
            e
          );
        }
      }, 50);

      const init = async () => {
        console.log("[Terminal init] Writing welcome message...");
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

        // Use a stable reference for writePrompt to avoid dependency issues
        const stableWritePrompt = (termInstance: XTerm) => {
          const target = currentTargetRef.current;
          const targetPrefix =
            target.type === "agent"
              ? `\x1b[38;2;243;139;168m[${
                  target.name ?? target.id ?? "??"
                }]\x1b[0m `
              : "";
          const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
          const fullPrompt = targetPrefix + promptSuffix;

          const visiblePrompt = stripAnsi(fullPrompt);
          promptLengthRef.current = visiblePrompt.length;

          termInstance.write("\r\x1b[K");
          termInstance.write(fullPrompt);
          
          // Ensure the prompt is visible after writing
          ensureCursorVisible();
        };

        stableWritePrompt(term);
        console.log("[Terminal init] Prompt written.");

        try {
          await initializeSession.mutateAsync({
            target: currentTargetRef.current,
          });
          console.log("[Terminal init] Initial session successful.");
        } catch (error) {
          console.error("[Terminal init] Initial session failed:", error);
        }

        // Clear global initialization flag after successful init
        globalInitializationInProgress = false;
      };
      void init();
    };

    requestAnimationFrame(initialFit);

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        try {
          if (terminal.current?.element && fitAddonRef.current) {
            fitAddonRef.current.fit();
          }
        } catch (e) {
          console.error("[Terminal ResizeObserver] Error during fit:", e);
        }
      });
    });

    const parentElement = terminalRef.current?.parentElement;
    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    // Auto-scroll helper function to keep cursor visible
    const ensureCursorVisible = () => {
      const term = terminal.current;
      if (!term) return;
      
      // Scroll to bottom to ensure the cursor/prompt is visible
      term.scrollToBottom();
    };

    // Input handling logic
    let currentLine = "";
    let currentPosition = 0;

    const clearInputLine = () => {
      const term = terminal.current;
      if (!term) return;
      // Move to start of prompt, then to end of prompt, then clear to end of line
      term.write(`\r\x1b[${promptLengthRef.current}C`);
      term.write("\x1b[K");
    };

    const redrawInputLine = () => {
      const term = terminal.current;
      if (!term) return;
      // Clear only the input part, preserving the prompt
      clearInputLine();
      term.write(currentLine);
      if (currentPosition < currentLine.length) {
        term.write(`\x1b[${currentLine.length - currentPosition}D`);
      }
    };

    const insertCharacterOptimized = (char: string) => {
      const term = terminal.current;
      if (!term) return;
      
      // Optimize for simple case: inserting at end of line
      if (currentPosition === currentLine.length) {
        currentLine += char;
        currentPosition++;
        term.write(char); // Just write the character, no redraw needed
      } else {
        // Complex case: inserting in middle of line, needs redraw
        currentLine =
          currentLine.slice(0, currentPosition) +
          char +
          currentLine.slice(currentPosition);
        currentPosition++;
        redrawInputLine();
      }
    };

    const insertCharacter = (char: string) => {
      currentLine =
        currentLine.slice(0, currentPosition) +
        char +
        currentLine.slice(currentPosition);
      currentPosition++;
      redrawInputLine();
    };

    const deleteCharacterBeforeCursorOptimized = () => {
      const term = terminal.current;
      if (!term || currentPosition <= 0) return;
      
      // Optimize for simple case: deleting at end of line
      if (currentPosition === currentLine.length) {
        currentLine = currentLine.slice(0, -1);
        currentPosition--;
        // Move cursor back one position and clear to end of line
        term.write("\x1b[D\x1b[K");
      } else {
        // Complex case: deleting in middle of line, needs redraw
        currentLine =
          currentLine.slice(0, currentPosition - 1) +
          currentLine.slice(currentPosition);
        currentPosition--;
        redrawInputLine();
      }
    };

        const deleteCharacterBeforeCursor = () => {
      if (currentPosition > 0) {
        currentLine = 
          currentLine.slice(0, currentPosition - 1) + 
          currentLine.slice(currentPosition);
        currentPosition--;
        redrawInputLine();
      }
    };

        const handleTabCompletion = async () => {
      const beforeCursor = currentLine.slice(0, currentPosition);
      const afterCursor = currentLine.slice(currentPosition);
      
      console.log("=== TAB COMPLETION DEBUG ===");
      console.log("currentLine:", JSON.stringify(currentLine));
      console.log("currentPosition:", currentPosition);
      console.log("beforeCursor:", JSON.stringify(beforeCursor));
      console.log("afterCursor:", JSON.stringify(afterCursor));
      
      // Available commands
      const commands = ['help', 'clear', 'agents', 'target', 'use', 'version', 'history', 'exit', 'status'];
      
      // Split current input to analyze context (don't trim to preserve trailing spaces)
      const parts = beforeCursor.split(/\s+/);
      console.log("parts:", parts);
      console.log("beforeCursor ends with space:", beforeCursor.endsWith(' '));
      
      if (parts.length === 1) {
        // Complete command names
        const partial = parts[0].toLowerCase();
        const matches = commands.filter(cmd => cmd.startsWith(partial));
        
        if (matches.length === 1) {
          // Single match - complete it
          const completion = matches[0];
          const newLine = completion + afterCursor;
          const newPosition = completion.length;
          
          clearInputLine();
          currentLine = newLine;
          currentPosition = newPosition;
          term.write(currentLine);
          
          // Move cursor to correct position
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}D`);
          }
        } else if (matches.length > 1) {
          // Multiple matches - show options
          term.writeln("");
          term.writeln(`Available commands: ${matches.join(", ")}`);
          
          // Find common prefix
          let commonPrefix = matches[0] || "";
          for (const match of matches) {
            while (commonPrefix && !match.startsWith(commonPrefix)) {
              commonPrefix = commonPrefix.slice(0, -1);
            }
          }
          
          if (commonPrefix.length > partial.length) {
            // Complete to common prefix
            const newLine = commonPrefix + afterCursor;
            const newPosition = commonPrefix.length;
            
            currentLine = newLine;
            currentPosition = newPosition;
          }
          
          // Redraw prompt and current input
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
          term.write(currentLine);
          
          // Move cursor to correct position
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}D`);
          }
        }
      } else if (parts.length === 2 && parts[0].toLowerCase() === 'use') {
        // Complete "use" command arguments
        const partial = parts[1].toLowerCase();
        const useOptions = ['engine', 'agent'];
        
        const matches = useOptions.filter(opt => opt.startsWith(partial));
        
        if (matches.length === 1) {
          // Complete the option
          const completion = matches[0];
          const newLine = `use ${completion}${afterCursor}`;
          const newPosition = `use ${completion}`.length;
          
          clearInputLine();
          currentLine = newLine;
          currentPosition = newPosition;
          term.write(currentLine);
          
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}D`);
          }
        } else if (matches.length > 1) {
          // Multiple matches - show options
          term.writeln("");
          term.writeln(`${matches.join("  ")}`);
          
          // Find common prefix
          let commonPrefix = matches[0] || "";
          for (const match of matches) {
            while (commonPrefix && !match.startsWith(commonPrefix)) {
              commonPrefix = commonPrefix.slice(0, -1);
            }
          }
          
          if (commonPrefix.length > partial.length) {
            const newLine = `use ${commonPrefix}${afterCursor}`;
            const newPosition = `use ${commonPrefix}`.length;
            
            currentLine = newLine;
            currentPosition = newPosition;
          }
          
          // Redraw prompt and current input
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
          term.write(currentLine);
          
          // Move cursor to correct position
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}D`);
          }
        }
      } else if ((parts.length === 2 && parts[0].toLowerCase() === 'use' && parts[1].toLowerCase() === 'agent') ||
                 (parts.length === 3 && parts[0].toLowerCase() === 'use' && parts[1].toLowerCase() === 'agent' && beforeCursor.endsWith(' '))) {
        // Handle "use agent" or "use agent " (with trailing space)
        try {
          console.log("[Autocomplete] Detected 'use agent' completion case");
          
          const freshAgents = await agentsQuery.refetch();
          const agents = freshAgents.data || [];
          
          if (agents.length === 0) {
            term.writeln("");
            term.writeln("no agents available");
          } else {
            term.writeln("");
            const agentIds = agents.map(a => a.id);
            term.writeln(`${agentIds.join("  ")}`);
          }
          
          // Redraw prompt and current input
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
          term.write(currentLine);
          
          if (currentPosition < currentLine.length) {
            term.write(`\x1b[${currentLine.length - currentPosition}D`);
          }
        } catch (error) {
          console.error("[Terminal] Error fetching agents for autocomplete:", error);
        }
      } else if (parts.length >= 3 && parts[0].toLowerCase() === 'use' && parts[1].toLowerCase() === 'agent' && !beforeCursor.endsWith(' ')) {
        // Handle "use agent <partial>" - there's partial text after agent
        try {
          const partial = parts[2] ? parts[2].toLowerCase() : "";
          
          console.log("[Autocomplete] Detected 'use agent <partial>' case, partial:", partial);
          
          const freshAgents = await agentsQuery.refetch();
          const agents = freshAgents.data || [];
          
          if (agents.length === 0) {
            term.writeln("");
            term.writeln("no agents available");
            
            // Redraw prompt and current input
            const stableWritePrompt = (termInstance: XTerm) => {
              const target = currentTargetRef.current;
              const targetPrefix =
                target.type === "agent"
                  ? `\x1b[38;2;243;139;168m[${
                      target.name ?? target.id ?? "??"
                    }]\x1b[0m `
                  : "";
              const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
              const fullPrompt = targetPrefix + promptSuffix;

              const visiblePrompt = stripAnsi(fullPrompt);
              promptLengthRef.current = visiblePrompt.length;

              termInstance.write(fullPrompt);
            };
            stableWritePrompt(term);
            term.write(currentLine);
            
            if (currentPosition < currentLine.length) {
              term.write(`\x1b[${currentLine.length - currentPosition}D`);
            }
            return;
          }
          
          // Create autocomplete options: both agent.id and agent.name (if different)
          const agentOptions: Array<{id: string, displayName: string}> = [];
          
          agents.forEach(agent => {
            // Always add the agent ID
            agentOptions.push({id: agent.id, displayName: agent.id});
            
            // Add agent name if it exists and is different from ID
            if (agent.name && agent.name !== agent.id) {
              agentOptions.push({id: agent.id, displayName: agent.name});
            }
          });
          
          // Filter matches based on partial input (case insensitive)
          // If no partial input, show all options
          const matches = partial ? 
            agentOptions.filter(option => option.displayName.toLowerCase().startsWith(partial)) :
            agentOptions;
          
          console.log("[Autocomplete] matches:", matches.length, matches.map(m => m.displayName));
          
          if (matches.length === 1 && partial) {
            // Single match and we have partial input - complete using agent ID
            const completion = matches[0].id;
            const newLine = `use agent ${completion}${afterCursor}`;
            const newPosition = `use agent ${completion}`.length;
            
            clearInputLine();
            currentLine = newLine;
            currentPosition = newPosition;
            term.write(currentLine);
            
            if (currentPosition < currentLine.length) {
              term.write(`\x1b[${currentLine.length - currentPosition}D`);
            }
          } else if (matches.length >= 1) {
            // Multiple matches OR no partial input - show options
            term.writeln("");
            const displayNames = matches.map(m => m.displayName);
            
            // Remove duplicates (when agent name = agent id)
            const uniqueDisplayNames = [...new Set(displayNames)];
            term.writeln(`${uniqueDisplayNames.join("  ")}`);
            
            // Only try to complete common prefix if we have partial input
            if (partial && matches.length > 1) {
              // Find common prefix of display names
              let commonPrefix = displayNames[0] || "";
              for (const name of displayNames) {
                while (commonPrefix && !name.toLowerCase().startsWith(commonPrefix.toLowerCase())) {
                  commonPrefix = commonPrefix.slice(0, -1);
                }
              }
              
              if (commonPrefix.length > partial.length) {
                // Find the agent whose display name starts with the common prefix
                const matchingAgent = matches.find(m => 
                  m.displayName.toLowerCase().startsWith(commonPrefix.toLowerCase())
                );
                
                if (matchingAgent) {
                  const newLine = `use agent ${matchingAgent.id}${afterCursor}`;
                  const newPosition = `use agent ${matchingAgent.id}`.length;
                  
                  currentLine = newLine;
                  currentPosition = newPosition;
                }
              }
            }
            
            // Redraw prompt and current input
            const stableWritePrompt = (termInstance: XTerm) => {
              const target = currentTargetRef.current;
              const targetPrefix =
                target.type === "agent"
                  ? `\x1b[38;2;243;139;168m[${
                      target.name ?? target.id ?? "??"
                    }]\x1b[0m `
                  : "";
              const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
              const fullPrompt = targetPrefix + promptSuffix;

              const visiblePrompt = stripAnsi(fullPrompt);
              promptLengthRef.current = visiblePrompt.length;

              termInstance.write(fullPrompt);
            };
            stableWritePrompt(term);
            term.write(currentLine);
            
            if (currentPosition < currentLine.length) {
              term.write(`\x1b[${currentLine.length - currentPosition}D`);
            }
          } else {
            // No matches with partial input - show all available agents
            term.writeln("");
            const agentIds = agents.map(a => a.id);
            term.writeln(`Available agents: ${agentIds.join(", ")}`);
            
            // Redraw prompt and current input
            const stableWritePrompt = (termInstance: XTerm) => {
              const target = currentTargetRef.current;
              const targetPrefix =
                target.type === "agent"
                  ? `\x1b[38;2;243;139;168m[${
                      target.name ?? target.id ?? "??"
                    }]\x1b[0m `
                  : "";
              const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
              const fullPrompt = targetPrefix + promptSuffix;

              const visiblePrompt = stripAnsi(fullPrompt);
              promptLengthRef.current = visiblePrompt.length;

              termInstance.write(fullPrompt);
            };
            stableWritePrompt(term);
            term.write(currentLine);
            
            if (currentPosition < currentLine.length) {
              term.write(`\x1b[${currentLine.length - currentPosition}D`);
            }
          }
        } catch (error) {
          console.error("[Terminal] Error fetching agents for autocomplete:", error);
          // Silent fail - just don't complete
        }
      }
    };

    const handleCommand = async (command: string) => {
      const term = terminal.current;
      if (!term) return;

      const cmd = command.trim().toLowerCase();
      const cmdParts = command.trim().split(/\s+/);

      // Handle 'use' command separately (it takes arguments)
      if (cmdParts[0]?.toLowerCase() === "use") {
        if (cmdParts.length < 2) {
          term.writeln("\x1b[38;2;243;139;168musage: use {engine|agent} [id]\x1b[0m");
        } else if (cmdParts[1]?.toLowerCase() === "engine") {
          currentTargetRef.current = { type: "engine" };
          setTargetDisplay({ type: "engine" });
          setSelectedAgentId(null); // Clear agent selection when switching to engine
          term.writeln("\x1b[38;2;166;227;161mSwitched to engine target\x1b[0m");
          
          // Initialize session for engine
          try {
            await initializeSession.mutateAsync({
              target: { type: "engine" }
            });
          } catch (error) {
            console.error("Failed to initialize engine session:", error);
          }
        } else if (cmdParts[1]?.toLowerCase() === "agent") {
          if (cmdParts.length < 3) {
            // Show usage with available agents
            try {
              const freshAgents = await agentsQuery.refetch();
              if (freshAgents.data && freshAgents.data.length > 0) {
                term.writeln("\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m");
                term.writeln(`       ${freshAgents.data.map(a => a.id).join(', ')}`);
              } else {
                term.writeln("\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m");
                term.writeln("       (no agents available)");
              }
            } catch (error) {
              term.writeln("\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m");
            }
                     } else {
             const agentId = cmdParts[2];
             if (!agentId) {
               term.writeln("\x1b[38;2;243;139;168musage: use agent <id>\x1b[0m");
               return;
             }
             
             // Check if agent exists - fetch fresh data to ensure accuracy
             console.log(`[Terminal] Looking for agent '${agentId}'`);
             console.log(`[Terminal] Available agentsQuery.data:`, agentsQuery.data);
             
             try {
               const freshAgents = await agentsQuery.refetch();
               console.log(`[Terminal] Fresh agents for lookup:`, freshAgents.data);
               console.log(`[Terminal] Agent IDs available:`, freshAgents.data?.map(a => a.id));
               
               const agent = freshAgents.data?.find(a => a.id === agentId);
               if (!agent) {
                 term.writeln(`\x1b[38;2;243;139;168magent '${agentId}' not found\x1b[0m`);
                 if (freshAgents.data && freshAgents.data.length > 0) {
                   term.writeln(`       ${freshAgents.data.map(a => a.id).join(', ')}`);
                 }
               } else {
                 currentTargetRef.current = { 
                   type: "agent", 
                   id: agentId, 
                   name: agent.name ?? agentId 
                 };
                 setTargetDisplay({ 
                   type: "agent", 
                   id: agentId, 
                   name: agent.name ?? agentId 
                 });
                 setSelectedAgentId(agentId);
                 term.writeln(`\x1b[38;2;166;227;161mSwitched to agent '${agentId}'\x1b[0m`);
                 
                 // Initialize session for agent
                 try {
                   await initializeSession.mutateAsync({
                     target: { type: "agent", id: agentId }
                   });
                 } catch (error) {
                   console.error("Failed to initialize agent session:", error);
                   term.writeln(`\x1b[38;2;243;139;168mWarning: Failed to initialize session for agent '${agentId}'\x1b[0m`);
                 }
               }
             } catch (error) {
               console.error("[Terminal] Error fetching fresh agents for use command:", error);
               term.writeln(`\x1b[38;2;243;139;168mError checking agent availability\x1b[0m`);
             }
           }
        } else {
          term.writeln(`\x1b[38;2;243;139;168minvalid target '${cmdParts[1]}'\x1b[0m`);
          term.writeln("\x1b[38;2;243;139;168musage: use {engine|agent} [id]\x1b[0m");
        }

        setTimeout(() => {
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write("\r\x1b[K");
            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
        }, 10);
        return;
      }

      // Handle special local commands that need access to React state
      if (cmd === "agents") {
        // Handle async agents command
        (async () => {
          await handleAgentsCommand(term);
          setTimeout(() => {
            const stableWritePrompt = (termInstance: XTerm) => {
              const target = currentTargetRef.current;
              const targetPrefix =
                target.type === "agent"
                  ? `\x1b[38;2;243;139;168m[${
                      target.name ?? target.id ?? "??"
                    }]\x1b[0m `
                  : "";
              const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
              const fullPrompt = targetPrefix + promptSuffix;

              const visiblePrompt = stripAnsi(fullPrompt);
              promptLengthRef.current = visiblePrompt.length;

              termInstance.write("\r\x1b[K");
              termInstance.write(fullPrompt);
            };
            stableWritePrompt(term);
          }, 10);
        })();
        return;
      } else if (cmd === "target") {
        handleTargetCommand(term);
        setTimeout(() => {
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write("\r\x1b[K");
            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
        }, 10);
        return;
      }

      // Handle standard local commands
      if (cmd in LOCAL_COMMANDS) {
        if (cmd === "help") {
          LOCAL_COMMANDS.help(term);
        } else if (cmd === "clear") {
          LOCAL_COMMANDS.clear(term);
        } else if (cmd === "version") {
          LOCAL_COMMANDS.version(term);
        } else if (cmd === "history") {
          LOCAL_COMMANDS.history(term, commandHistoryRef.current);
        } else if (cmd === "status") {
          LOCAL_COMMANDS.status(term);
        } else if (cmd === "exit") {
          LOCAL_COMMANDS.exit(term);
        }

        setTimeout(() => {
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write("\r\x1b[K");
            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
        }, 10);
        return;
      }

      // Handle remote commands
      try {
        await executeCommand.mutateAsync({
          command,
          target: currentTargetRef.current,
        });
      } catch (error) {
        console.error("Command execution failed:", error);
        term.writeln(`\x1b[38;2;243;139;168mCommand failed: ${error}\x1b[0m`);
        const stableWritePrompt = (termInstance: XTerm) => {
          const target = currentTargetRef.current;
          const targetPrefix =
            target.type === "agent"
              ? `\x1b[38;2;243;139;168m[${
                  target.name ?? target.id ?? "??"
                }]\x1b[0m `
              : "";
          const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
          const fullPrompt = targetPrefix + promptSuffix;

          const visiblePrompt = stripAnsi(fullPrompt);
          promptLengthRef.current = visiblePrompt.length;

          termInstance.write("\r\x1b[K");
          termInstance.write(fullPrompt);
        };
        stableWritePrompt(term);
      }
    };

    // Key event handler
    const onKey = (e: { key: string; domEvent: KeyboardEvent }) => {
      const ev = e.domEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      // Handle Ctrl+L to clear the terminal
      if (ev.ctrlKey && ev.key === "l") {
        term.clear();
        // Reset input state
        currentLine = "";
        currentPosition = 0;
        historyPositionRef.current = -1;
        
        // Redraw the prompt
        const stableWritePrompt = (termInstance: XTerm) => {
          const target = currentTargetRef.current;
          const targetPrefix =
            target.type === "agent"
              ? `\x1b[38;2;243;139;168m[${
                  target.name ?? target.id ?? "??"
                }]\x1b[0m `
              : "";
          const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
          const fullPrompt = targetPrefix + promptSuffix;

          const visiblePrompt = stripAnsi(fullPrompt);
          promptLengthRef.current = visiblePrompt.length;

          termInstance.write("\r\x1b[K");
          termInstance.write(fullPrompt);
        };
        stableWritePrompt(term);
        return;
      }

      // Handle Tab for autocomplete
      if (ev.key === "Tab") {
        ev.preventDefault();
        void handleTabCompletion();
        return;
      }

      if (ev.key === "Enter") {
        term.writeln("");
        const command = currentLine;
        if (command.trim()) {
          commandHistoryRef.current.unshift(command.trim());
          if (commandHistoryRef.current.length > 100) {
            commandHistoryRef.current.pop();
          }
        }
        historyPositionRef.current = -1;
        currentLine = "";
        currentPosition = 0;

        void handleCommand(command);
        
        // Ensure cursor stays visible after command submission
        ensureCursorVisible();
      } else if (ev.key === "Backspace") {
        deleteCharacterBeforeCursorOptimized();
      } else if (ev.key === "Delete") {
        // Handle delete key
      } else if (ev.key === "ArrowLeft") {
        if (currentPosition > 0) {
          currentPosition--;
          term.write("\x1b[D");
        }
      } else if (ev.key === "ArrowRight") {
        if (currentPosition < currentLine.length) {
          currentPosition++;
          term.write("\x1b[C");
        }
      } else if (ev.key === "ArrowUp") {
        // Navigate backwards through command history
        if (commandHistoryRef.current.length > 0) {
          if (historyPositionRef.current < commandHistoryRef.current.length - 1) {
            historyPositionRef.current++;
            const historyCommand = commandHistoryRef.current[historyPositionRef.current];
            
            // Clear current input and replace with history command
            clearInputLine();
            currentLine = historyCommand;
            currentPosition = currentLine.length;
            term.write(currentLine);
          }
        }
      } else if (ev.key === "ArrowDown") {
        // Navigate forwards through command history
        if (historyPositionRef.current > -1) {
          historyPositionRef.current--;
          
          if (historyPositionRef.current === -1) {
            // Back to empty prompt
            clearInputLine();
            currentLine = "";
            currentPosition = 0;
          } else {
            // Show newer command from history
            const historyCommand = commandHistoryRef.current[historyPositionRef.current];
            clearInputLine();
            currentLine = historyCommand;
            currentPosition = currentLine.length;
            term.write(currentLine);
          }
        }
      } else if (printable) {
        insertCharacterOptimized(e.key);
      }
    };

    term.onKey(onKey);

    return () => {
      console.log(
        "[Terminal cleanup] Disposing terminal and clearing global state..."
      );

      // Dispose of the terminal instance
      if (terminal.current) {
        terminal.current.dispose();
        terminal.current = null;
      }

      // Clear global state
      if (globalTerminalInstance === term) {
        globalTerminalInstance = null;
      }

      // Reset initialization flags
      isInitializingRef.current = false;
      globalInitializationInProgress = false;

      // Disconnect resize observer
      resizeObserver.disconnect();

      console.log("[Terminal cleanup] Cleanup completed.");
    };
  }, []); // EMPTY DEPENDENCY ARRAY - No dependencies to prevent re-execution

  // Effect to handle click-based agent selection from sidebar
  useEffect(() => {
    if (selectedAgentId && terminal.current && agentsQuery.data) {
      // Always check if we need to switch contexts - allow switching back to same agent 
      // after being in engine mode, or force refresh of agent context
      const agent = agentsQuery.data.find(a => a.id === selectedAgentId);
      if (agent) {
        const isAlreadyOnCorrectAgent = 
          targetDisplay.type === "agent" && 
          targetDisplay.id === selectedAgentId;
        
        if (!isAlreadyOnCorrectAgent) {
          currentTargetRef.current = { 
            type: "agent", 
            id: selectedAgentId, 
            name: agent.name ?? selectedAgentId 
          };
          setTargetDisplay({ 
            type: "agent", 
            id: selectedAgentId, 
            name: agent.name ?? selectedAgentId 
          });
          
          // Update prompt immediately when target changes
          const term = terminal.current;
          const stableWritePrompt = (termInstance: XTerm) => {
            const target = currentTargetRef.current;
            const targetPrefix =
              target.type === "agent"
                ? `\x1b[38;2;243;139;168m[${
                    target.name ?? target.id ?? "??"
                  }]\x1b[0m `
                : "";
            const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
            const fullPrompt = targetPrefix + promptSuffix;

            const visiblePrompt = stripAnsi(fullPrompt);
            promptLengthRef.current = visiblePrompt.length;

            termInstance.write("\r\x1b[K");
            termInstance.write(fullPrompt);
          };
          stableWritePrompt(term);
          
          console.log(`[Terminal] Switched to agent '${selectedAgentId}' via click selection (was: ${targetDisplay.type})`);
        }
      }
    }
  }, [selectedAgentId, targetDisplay.type, targetDisplay.id]); // Use targetDisplay state instead of ref

  // Separate effect for handling executeCommand mutation responses
  useEffect(() => {
    if (executeCommand.isSuccess && executeCommand.data && terminal.current) {
      const term = terminal.current;
      const result = executeCommand.data;

      // Display the command output
      if (result.output) {
        const lines = result.output.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            term.writeln(line);
          }
        });
      }

      // Show prompt for next command
      const stableWritePrompt = (termInstance: XTerm) => {
        const target = currentTargetRef.current;
        const targetPrefix =
          target.type === "agent"
            ? `\x1b[38;2;243;139;168m[${
                target.name ?? target.id ?? "??"
              }]\x1b[0m `
            : "";
        const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
        const fullPrompt = targetPrefix + promptSuffix;

        const visiblePrompt = stripAnsi(fullPrompt);
        promptLengthRef.current = visiblePrompt.length;

        termInstance.write("\r\x1b[K");
        termInstance.write(fullPrompt);
      };
      stableWritePrompt(term);
    }

    if (executeCommand.isError && terminal.current) {
      const term = terminal.current;
      const error = executeCommand.error;

      term.writeln(`\x1b[38;2;243;139;168mError: ${error.message}\x1b[0m`);
      const stableWritePrompt = (termInstance: XTerm) => {
        const target = currentTargetRef.current;
        const targetPrefix =
          target.type === "agent"
            ? `\x1b[38;2;243;139;168m[${
                target.name ?? target.id ?? "??"
              }]\x1b[0m `
            : "";
        const promptSuffix = `\x1b[38;2;137;180;250msirius>\x1b[0m `;
        const fullPrompt = targetPrefix + promptSuffix;

        const visiblePrompt = stripAnsi(fullPrompt);
        promptLengthRef.current = visiblePrompt.length;

        termInstance.write("\r\x1b[K");
        termInstance.write(fullPrompt);
      };
      stableWritePrompt(term);
    }
  }, [
    executeCommand.isSuccess,
    executeCommand.isError,
    executeCommand.data,
    executeCommand.error,
  ]);

  return (
    <div className="flex h-full w-full">
      {/* Enhanced Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Agent Control
            </h2>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Status Dashboard */}
            <StatusDashboard
              agentCount={agentsQuery.data?.length || 0}
              onlineCount={
                agentsQuery.data?.filter(
                  (agent) => agent.status?.toLowerCase() === "online"
                ).length || 0
              }
            />

            {/* Agent List */}
            <div>
              <h3 className="mb-5 text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Available Agents
              </h3>
              <AgentList
                onAgentSelect={setSelectedAgentId}
                selectedAgentId={selectedAgentId}
              />
            </div>

            {/* Agent Details (when selected) */}
            {selectedAgentId && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="mb-5 text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                  Agent Details
                </h3>
                <AgentDetails
                  agentId={selectedAgentId}
                  details={combinedAgentDetails}
                  isLoading={isRefreshingDetails}
                  onRefresh={() => handleRefreshAgentDetails(selectedAgentId)}
                  onRunScan={() => console.log("Run scan on", selectedAgentId)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 bg-[#1e1e2e] p-4 overflow-hidden">
        <div ref={terminalRef} className="h-full w-full max-h-full overflow-hidden" />
      </div>
    </div>
  );
}

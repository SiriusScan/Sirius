import { type NextPage } from "next";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { AgentList } from "~/components/agent/AgentList";
import { AgentSummary } from "~/components/agent/AgentSummary";
import { AgentDetails } from "~/components/agent/AgentDetails";
import { cn } from "~/components/lib/utils";
import "@xterm/xterm/css/xterm.css";
import { toast } from "sonner";

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

const LOCAL_COMMANDS = {
  help: (term: XTerm) => {
    term.writeln("\x1b[38;2;166;227;161mAvailable commands:\x1b[0m");
    term.writeln(
      "  \x1b[38;2;137;180;250mhelp\x1b[0m      - Show this help message"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mclear\x1b[0m     - Clear the terminal"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250magents\x1b[0m    - List available agents"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mtarget\x1b[0m    - Show current target"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250muse\x1b[0m       - Select target (e.g., use engine, use agent <id>)"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mversion\x1b[0m   - Show terminal version"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mhistory\x1b[0m   - Show command history"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mexit\x1b[0m      - Close the session"
    );
    term.writeln("\n\x1b[38;2;166;227;161mKeyboard shortcuts:\x1b[0m");
    term.writeln("  Ctrl+C     - Cancel current command");
    term.writeln("  Ctrl+L     - Clear screen");
    term.writeln("  Up/Down    - Navigate command history");
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
} as const;

const Terminal: NextPage = () => {
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
  const [isRefreshingDetails, setIsRefreshingDetails] = useState(false);

  const agentsQuery = api.terminal.listAgents.useQuery(undefined, {
    refetchInterval: 10000, // Keep polling agent list
  });

  // Combine agent list data and parsed status details
  const combinedAgentDetails = useMemo((): DisplayedAgentDetails | null => {
    if (!selectedAgentId) return null;

    // Find the agent from the list query first
    const agentFromList = agentsQuery.data?.find(
      (a) => a.id === selectedAgentId
    );

    // Start building details from the list data (name, status, lastSeen)
    const details: Partial<DisplayedAgentDetails> = {
      id: selectedAgentId,
      name: agentFromList?.name,
      status: agentFromList?.status,
      lastSeen: agentFromList?.lastSeen,
    };

    // Merge details from the parsed internal:status command if available
    if (agentStatusDetails && agentStatusDetails.agentId === selectedAgentId) {
      details.primaryIp = agentStatusDetails.primaryIp;
      details.osArch = agentStatusDetails.osArch;
      // Assuming internal:status doesn't provide agent version, maybe it should?
      // details.agentVersion = agentStatusDetails.version;
      details.uptime = agentStatusDetails.uptime;
    }

    // If we only have list data, return that, otherwise return merged
    return details as DisplayedAgentDetails;
  }, [selectedAgentId, agentStatusDetails, agentsQuery.data]);

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

  const executeCommand = api.terminal.executeCommand.useMutation({
    onSuccess: (data, variables) => {
      const term = terminal.current;
      if (!term) return;

      const output = typeof data.output === "string" ? data.output : "";
      let parsedDetails: ParsedAgentStatus | null = null;

      // Check if this is the response for our status command
      if (
        variables.command === "internal:status" &&
        output.includes("Agent ID:")
      ) {
        console.log(
          "[Terminal:executeCommand:onSuccess] Parsing internal:status output..."
        );
        parsedDetails = {};
        const lines = output.split(/\r?\n/);
        lines.forEach((line) => {
          const parts = line.split(":");
          if (parts.length < 2) return;
          const key = parts[0].trim();
          const value = parts.slice(1).join(":").trim();

          switch (key) {
            case "Agent ID":
              parsedDetails!.agentId = value;
              break;
            case "Host ID":
              parsedDetails!.hostId = value;
              break;
            case "Uptime":
              parsedDetails!.uptime = value;
              break;
            case "Server Target":
              parsedDetails!.serverTarget = value;
              break;
            case "API Target":
              parsedDetails!.apiTarget = value;
              break;
            case "Scripting Config Enabled":
              parsedDetails!.scriptingEnabled = value;
              break;
            case "Go Version":
              parsedDetails!.goVersion = value;
              break;
            case "OS/Arch":
              parsedDetails!.osArch = value;
              break;
            case "OS Version":
              parsedDetails!.osVersion = value;
              break;
            case "Primary IP":
              parsedDetails!.primaryIp = value;
              break;
            case "Memory Allocated":
              parsedDetails!.memoryAllocated = value;
              break;
            case "Goroutines":
              parsedDetails!.goroutines = value;
              break;
          }
        });
        setAgentStatusDetails(parsedDetails);
        setIsRefreshingDetails(false); // Turn off loading indicator for details
        // Don't write the raw status output to the terminal
        // writePrompt(term); // Write prompt instead
        // return; // Prevent writing raw output below
      } else {
        // For non-status commands, or if parsing failed, reset loading state
        setIsRefreshingDetails(false);
      }

      // Normalize line endings ONLY if not status output
      const normalizedOutput = parsedDetails
        ? "" // Don't write raw status output
        : output.replace(/(?<!\r)\n/g, "\r\n");

      // console.log(
      //  "[Terminal:executeCommand:onSuccess] Processed output for writing:",
      //  JSON.stringify(normalizedOutput)
      // );

      // Write the normalized output (unless it was status)
      if (normalizedOutput) {
        term.write(normalizedOutput);
      }

      // Always write prompt after command finishes (unless exit?)
      // TODO: Check if original command was 'exit'?
      writePrompt(term);
    },
    onError: (error, variables) => {
      const term = terminal.current;
      if (!term) return;
      term.writeln(`\r\x1b[38;2;243;139;168mError: ${error.message}\x1b[0m`);
      writePrompt(term);
      // Ensure loading state is reset on error
      if (variables.command === "internal:status") {
        setIsRefreshingDetails(false);
      }
    },
    // Note: onSettled could also be used for resetting loading state
  });

  const initializeSession = api.terminal.initializeSession.useMutation({
    onSuccess: (data, variables) => {
      console.log("[Terminal Hook] Session initialized successfully:", data);
      // Update target state *after* successful initialization
      const agent = agentsQuery.data?.find((a) => a.id === variables.target.id);
      const newTarget: Target = variables.target.id
        ? { type: "agent", id: variables.target.id, name: agent?.name }
        : { type: "engine" };

      currentTargetRef.current = newTarget;
      setTargetDisplay(newTarget);
      setSelectedAgentId(variables.target.id ?? null);

      // Update prompt in terminal
      if (terminal.current) {
        // Write the success message BEFORE the prompt
        if (newTarget.type === "agent") {
          terminal.current.writeln(
            `\r\x1b[K\x1b[38;2;166;227;161mSwitched to agent: ${
              newTarget.name || newTarget.id
            }\x1b[0m`
          );
        } else {
          terminal.current.writeln(
            `\r\x1b[K\x1b[38;2;166;227;161mSwitched to engine target\x1b[0m`
          );
        }
        writePrompt(terminal.current);
        terminal.current.focus(); // Focus terminal after switching target
      }
      console.log(
        `[Terminal:initializeSession:onSuccess] Target updated to: ${JSON.stringify(
          newTarget
        )}`
      );
      setAgentStatusDetails(null); // Clear old details when target changes

      // Automatically fetch details after switching to an agent
      if (newTarget.type === "agent") {
        handleRefreshDetails(); // Call the existing refresh handler
      }
    },
    onError: (error, variables) => {
      console.error("[Terminal Hook] Session initialization failed:", error);
      // Display error in terminal
      if (terminal.current) {
        terminal.current.writeln(
          `\r\x1b[38;2;243;139;168mFailed to initialize session with ${
            variables.target.id ?? "engine"
          }\x1b[0m`
        );
        writePrompt(terminal.current);
      }
      setAgentStatusDetails(null);
    },
  });

  const handleAgentsCommand = (term: XTerm) => {
    term.writeln(
      "\x1b[38;2;166;227;161mAgents are listed in the sidebar.\x1b[0m"
    );
    term.writeln(
      "\x1b[38;2;137;180;250mUse the sidebar to select an agent or type 'use agent <id>'. \x1b[0m"
    );
  };

  const handleTargetCommand = (term: XTerm) => {
    const target = currentTargetRef.current;
    const targetInfo =
      target.type === "agent"
        ? `Agent (${target.name || target.id})`
        : "Engine";
    term.writeln(`\x1b[38;2;166;227;161mCurrent target: ${targetInfo}\x1b[0m`);
  };

  const switchTarget = useCallback(
    async (targetType: "engine" | "agent", agentId?: string) => {
      const term = terminal.current;
      if (!term) return;

      if (targetType === "engine") {
        try {
          await initializeSession.mutateAsync({ target: { type: "engine" } });
        } catch (error) {
          // Error handled by initializeSession.onError
        }
        return;
      }

      if (targetType === "agent") {
        if (!agentId) {
          term.writeln(
            "\x1b[38;2;243;139;168mAgent ID is required for 'use agent'\x1b[0m"
          );
          writePrompt(term);
          return;
        }

        // Verify agent exists (using already fetched data)
        const agent = agentsQuery.data?.find(
          (a) => a.id.toLowerCase() === agentId.toLowerCase()
        );

        if (!agent) {
          term.writeln(
            `\x1b[38;2;243;139;168mAgent ${agentId} not found in the list\x1b[0m`
          );
          writePrompt(term);
          return;
        }

        const correctCaseAgentId = agent.id;

        // Call initializeSession - state updates happen in onSuccess/onError
        try {
          await initializeSession.mutateAsync({
            target: { type: "agent", id: correctCaseAgentId },
          });
        } catch (error) {
          // Error handled by initializeSession.onError
        }
        return;
      }
    },
    [initializeSession, writePrompt, agentsQuery]
  );

  const handleUseCommand = useCallback(
    async (term: XTerm, args: string[]) => {
      if (!args.length) {
        term.writeln(
          "\x1b[38;2;243;139;168mUsage: use <engine|agent> [agent_id]\x1b[0m"
        );
        writePrompt(term);
        return;
      }
      const [targetType, agentId] = args;

      if (targetType === "engine" || targetType === "agent") {
        await switchTarget(targetType, agentId);
      } else {
        term.writeln(
          "\x1b[38;2;243;139;168mInvalid target type. Use 'engine' or 'agent'\x1b[0m"
        );
        writePrompt(term);
      }
    },
    [switchTarget, writePrompt]
  );

  const handleAgentSelectFromUI = useCallback(
    (agentId: string) => {
      console.log(`[Terminal] Agent selected from UI: ${agentId}`);
      void switchTarget("agent", agentId);
    },
    [switchTarget]
  );

  const handleCommand = useCallback(
    async (command: string) => {
      const term = terminal.current;
      if (!term) return;

      const trimmedCommand = command.trim();
      const [cmd = "", ...args] = trimmedCommand.toLowerCase().split(" ");

      // Handle built-in commands
      switch (cmd) {
        case "help":
          LOCAL_COMMANDS.help(term);
          writePrompt(term);
          return;
        case "clear":
          LOCAL_COMMANDS.clear(term);
          writePrompt(term);
          return;
        case "history":
          LOCAL_COMMANDS.history(term, commandHistoryRef.current);
          writePrompt(term);
          return;
        case "version":
          LOCAL_COMMANDS.version(term);
          writePrompt(term);
          return;
        case "exit":
          LOCAL_COMMANDS.exit(term);
          return;
        case "agents":
          handleAgentsCommand(term);
          writePrompt(term);
          return;
        case "target":
          handleTargetCommand(term);
          writePrompt(term);
          return;
        case "use":
          await handleUseCommand(term, args);
          return;
      }

      // Execute command on current target if not a local command
      if (trimmedCommand) {
        try {
          console.log(
            `[Terminal:handleCommand] Executing remote: '${trimmedCommand}' with target:`,
            JSON.stringify(currentTargetRef.current)
          );
          await executeCommand.mutateAsync({
            command: trimmedCommand,
            target: {
              type: currentTargetRef.current.type,
              id:
                currentTargetRef.current.type === "agent"
                  ? currentTargetRef.current.id
                  : undefined,
            },
          });
        } catch (error) {
          console.error("[Terminal] Command execution mutation error:", error);
          term.writeln(
            "\r\x1b[38;2;243;139;168mCommand execution failed\x1b[0m"
          );
          writePrompt(term);
        }
      } else {
        writePrompt(term);
      }
    },
    [executeCommand, writePrompt, handleUseCommand, switchTarget]
  );

  const handleRefreshDetails = useCallback(() => {
    if (
      currentTargetRef.current.type === "agent" &&
      currentTargetRef.current.id
    ) {
      console.log(
        `[Terminal] Refreshing details for ${currentTargetRef.current.id}`
      );
      setAgentStatusDetails(null);
      setIsRefreshingDetails(true);
      executeCommand.mutate({
        command: "internal:status",
        target: currentTargetRef.current,
      });
    } else {
      console.log("[Terminal] Cannot refresh details, not targeting an agent.");
      setAgentStatusDetails(null);
    }
  }, [executeCommand]);

  // Function to trigger internal:scan
  const handleRunScan = useCallback(() => {
    if (
      currentTargetRef.current.type === "agent" &&
      currentTargetRef.current.id
    ) {
      const agentId = currentTargetRef.current.id;
      console.log(`[Terminal] Triggering internal:scan for ${agentId}`);
      toast.info(`Initiating scan on agent ${agentId}...`); // Give user feedback
      executeCommand.mutate({
        command: "internal:scan",
        target: currentTargetRef.current,
      });
    } else {
      console.warn("[Terminal] Cannot run scan, not targeting an agent.");
      toast.error("No agent selected to scan.");
    }
  }, [executeCommand]); // Depends on the mutation function

  useEffect(() => {
    if (!terminalRef.current || terminal.current) return;

    console.log("[Terminal useEffect] Initializing xterm...");

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
    });

    const webLinksAddon = new WebLinksAddon();
    const currentFitAddon = new FitAddon();
    fitAddonRef.current = currentFitAddon;

    term.loadAddon(currentFitAddon);
    term.loadAddon(webLinksAddon);

    term.open(terminalRef.current);
    terminal.current = term;
    console.log("[Terminal useEffect] Xterm opened.");

    const initialFit = () => {
      // Delay the actual fit call slightly
      setTimeout(() => {
        try {
          if (terminal.current?.element && fitAddonRef.current) {
            fitAddonRef.current.fit();
            console.log("[Terminal useEffect] Delayed initial fit executed.");
          } else {
            console.warn(
              "[Terminal useEffect] Skipping delayed initial fit: terminal or addon not ready."
            );
          }
        } catch (e) {
          console.error(
            "[Terminal useEffect] Error during delayed initial fit:",
            e
          );
        }
      }, 50); // 50ms delay, adjust if needed

      // Initialize terminal *after* scheduling the first fit
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

        writePrompt(term);
        console.log("[Terminal init] Prompt written.");

        console.log("[Terminal init] Attempting initial session...");
        try {
          await initializeSession.mutateAsync({
            target: currentTargetRef.current,
          });
          console.log("[Terminal init] Initial session successful.");
        } catch (error) {
          console.error("[Terminal init] Initial session failed:", error);
        }
      };
      void init();
    };

    // Use requestAnimationFrame to schedule the initialFit function
    // The actual fit() call inside initialFit is now delayed further by setTimeout
    requestAnimationFrame(initialFit);

    const resizeObserver = new ResizeObserver(() => {
      // Debounce resize? For now, just fit directly.
      requestAnimationFrame(() => {
        try {
          if (terminal.current?.element && fitAddonRef.current) {
            fitAddonRef.current.fit();
          } else {
            console.warn(
              "[Terminal ResizeObserver] Skipping fit: terminal or addon not ready."
            );
          }
        } catch (e) {
          console.error("[Terminal ResizeObserver] Error during fit:", e);
        }
      });
    });

    // Observe the parent container of the terminal element for better resize detection
    const parentElement = terminalRef.current?.parentElement;
    if (parentElement) {
      resizeObserver.observe(parentElement);
      console.log("[Terminal useEffect] Resize observer attached.");
    } else {
      console.error(
        "[Terminal useEffect] Could not find parent element to observe for resize."
      );
    }

    // --- Input Handling ---
    let currentLine = "";
    let currentPosition = 0;

    const clearInputLine = () => {
      const term = terminal.current;
      if (!term) return;
      term.write(`\r\x1b[${promptLengthRef.current}C`);
      term.write("\x1b[K");
    };

    const redrawInputLine = () => {
      const term = terminal.current;
      if (!term) return;
      clearInputLine();
      term.write(currentLine);
      if (currentPosition < currentLine.length) {
        term.write(`\x1b[${currentLine.length - currentPosition}D`);
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

    const deleteCharacterBeforeCursor = () => {
      if (currentPosition > 0) {
        currentLine =
          currentLine.slice(0, currentPosition - 1) +
          currentLine.slice(currentPosition);
        currentPosition--;
        redrawInputLine();
      }
    };

    const deleteCharacterAtCursor = () => {
      if (currentPosition < currentLine.length) {
        currentLine =
          currentLine.slice(0, currentPosition) +
          currentLine.slice(currentPosition + 1);
        redrawInputLine();
      }
    };

    const moveCursorLeft = () => {
      if (currentPosition > 0) {
        currentPosition--;
        term.write("\x1b[D");
      }
    };

    const moveCursorRight = () => {
      if (currentPosition < currentLine.length) {
        currentPosition++;
        term.write("\x1b[C");
      }
    };

    const addToHistory = (cmd: string) => {
      const trimmedCmd = cmd.trim();
      if (trimmedCmd && commandHistoryRef.current[0] !== trimmedCmd) {
        commandHistoryRef.current.unshift(trimmedCmd);
        if (commandHistoryRef.current.length > 100) {
          commandHistoryRef.current.pop();
        }
      }
      historyPositionRef.current = -1;
    };

    const setInputLineFromHistory = (newPosition: number) => {
      const history = commandHistoryRef.current;
      let newLine = "";
      if (newPosition === -1) {
        newLine = currentLineRef.current;
      } else if (newPosition >= 0 && newPosition < history.length) {
        newLine = history[newPosition] ?? "";
      } else {
        return;
      }

      clearInputLine();
      currentLine = newLine;
      currentPosition = newLine.length;
      term.write(currentLine);
      historyPositionRef.current = newPosition;
    };

    const keyDisposable = term.onKey(({ key, domEvent }) => {
      const ev = domEvent as KeyboardEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      // --- Basic Editing ---
      if (ev.key === "Enter") {
        term.write("\r\n");
        if (currentLine.trim().length > 0) {
          addToHistory(currentLine);
          void handleCommand(currentLine);
        } else {
          writePrompt(term);
        }
        currentLine = "";
        currentPosition = 0;
        currentLineRef.current = "";
      } else if (ev.key === "Backspace") {
        deleteCharacterBeforeCursor();
      } else if (ev.key === "Delete") {
        deleteCharacterAtCursor();
      }
      // --- Cursor Movement ---
      else if (ev.key === "ArrowLeft") {
        moveCursorLeft();
      } else if (ev.key === "ArrowRight") {
        moveCursorRight();
      }
      // --- History Navigation ---
      else if (ev.key === "ArrowUp") {
        if (historyPositionRef.current < commandHistoryRef.current.length - 1) {
          if (historyPositionRef.current === -1) {
            currentLineRef.current = currentLine;
          }
          setInputLineFromHistory(historyPositionRef.current + 1);
        }
      } else if (ev.key === "ArrowDown") {
        if (historyPositionRef.current > -1) {
          setInputLineFromHistory(historyPositionRef.current - 1);
        }
      }
      // --- Control Keys ---
      else if (ev.ctrlKey && ev.key === "c") {
        term.write("^C");
        writePrompt(term);
        currentLine = "";
        currentPosition = 0;
        currentLineRef.current = "";
        historyPositionRef.current = -1;
      } else if (ev.ctrlKey && ev.key === "l") {
        term.clear();
        writePrompt(term);
        term.write(currentLine);
      }
      // --- Printable characters ---
      else if (printable && key.length === 1) {
        insertCharacter(key);
      } else {
        // Log unhandled keys if needed for debugging
      }
    });

    // Cleanup
    return () => {
      console.log(
        "[Terminal useEffect Cleanup] Disposing terminal and removing listeners..."
      );
      keyDisposable.dispose();
      resizeObserver.disconnect();
      terminal.current?.dispose();
      terminal.current = null;
      fitAddonRef.current = null;
      console.log("[Terminal useEffect Cleanup] Done.");
    };
  }, []);

  return (
    <Layout title="Sirius Terminal">
      <div className="flex h-[calc(100vh-6rem)] gap-4">
        <div className="flex w-64 flex-shrink-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="border-b border-gray-200 p-3 text-lg font-semibold dark:border-gray-700 dark:text-white">
            Agents
          </h2>
          <AgentSummary
            agents={agentsQuery.data}
            isLoading={agentsQuery.isLoading}
          />
          <div className="flex-grow overflow-y-auto border-b border-gray-200 dark:border-gray-700">
            <AgentList
              onAgentSelect={handleAgentSelectFromUI}
              selectedAgentId={selectedAgentId}
            />
          </div>
          <div className="flex-shrink-0 p-2">
            <h3 className="px-1 pb-1 text-sm font-semibold text-gray-600 dark:text-gray-300">
              Details
            </h3>
            <AgentDetails
              agentId={selectedAgentId}
              details={combinedAgentDetails}
              isLoading={isRefreshingDetails}
              onRefresh={handleRefreshDetails}
              onRunScan={handleRunScan}
            />
          </div>
        </div>
        <div className="flex flex-grow flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-light text-white">Sirius Terminal</h1>
            <div className="text-sm text-gray-400">
              Target:{" "}
              <span
                className={cn(
                  targetDisplay.type === "agent"
                    ? "text-red-400"
                    : "text-blue-400"
                )}
              >
                {targetDisplay.type === "agent"
                  ? `${
                      targetDisplay.name ?? targetDisplay.id ?? "Unknown Agent"
                    }`
                  : "Engine"}
              </span>
            </div>
          </div>
          <div className="relative flex-1 overflow-hidden rounded-lg border-2 border-[#313244] bg-[#1e1e2e] shadow-lg">
            <div ref={terminalRef} className="h-full w-full" />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Terminal;

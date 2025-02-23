import { type NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import "@xterm/xterm/css/xterm.css";

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
      "  \x1b[38;2;137;180;250mconnect\x1b[0m   - Connect to an agent"
    );
    term.writeln(
      "  \x1b[38;2;137;180;250mlist\x1b[0m      - List available agents"
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
  const commandHistoryRef = useRef<string[]>([]);
  const historyPositionRef = useRef(-1);
  const currentLineRef = useRef("");

  const writePrompt = (term: XTerm) => {
    term.write("\r\n\x1b[38;2;137;180;250msirius>\x1b[0m ");
  };

  const executeCommand = api.terminal.executeCommand.useMutation({
    onSuccess: (data) => {
      const term = terminal.current;
      if (!term) return;

      // Normalize line endings and ensure proper output
      const output = data.output
        .split(/\r?\n/)
        .map((line) => line + "\r\n")
        .join("");

      term.write(output);
      writePrompt(term);
    },
    onError: (error) => {
      const term = terminal.current;
      if (!term) return;
      term.writeln(`\x1b[38;2;243;139;168mError: ${error.message}\x1b[0m\r`);
      writePrompt(term);
    },
  });

  useEffect(() => {
    if (!terminalRef.current || terminal.current) return;

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
      rows: 40,
      cols: 100,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    // Open terminal and store reference
    term.open(terminalRef.current);
    terminal.current = term;

    requestAnimationFrame(() => {
      fitAddon.fit();

      // Initialize terminal after fit
      const init = async () => {
        // Write welcome message
        term.writeln(
          "\x1b[38;2;203;166;247m╭────────────────────────────────╮"
        );
        term.writeln(
          "\x1b[38;2;203;166;247m│\x1b[0m Welcome to the Sirius Terminal \x1b[38;2;203;166;247m│"
        );
        term.writeln(
          "\x1b[38;2;203;166;247m╰────────────────────────────────╯\x1b[0m\r\n"
        );
        term.writeln("\x1b[38;2;166;227;161mHack the planet!\x1b[0m");

        try {
          // Just write prompt - no need to test connection anymore
          writePrompt(term);
        } catch (error) {
          console.error("Failed to connect:", error);
          term.writeln(
            "\x1b[38;2;243;139;168mFailed to connect to terminal server\x1b[0m"
          );
          writePrompt(term);
        }
      };

      void init();
    });

    // Setup resize observer after terminal is ready
    const resizeObserver = new ResizeObserver(() => {
      if (terminal.current) {
        fitAddon.fit();
      }
    });

    resizeObserver.observe(terminalRef.current);

    let currentLine = "";
    let currentPosition = 0;

    const clearCurrentLine = () => {
      const term = terminal.current;
      if (!term) return;

      // Move to start of line and clear to end
      term.write("\r\x1b[K");
      writePrompt(term);
    };

    const setCurrentLine = (newLine: string) => {
      clearCurrentLine();
      currentLine = newLine;
      currentPosition = newLine.length;
      term.write(newLine);
    };

    const addToHistory = (cmd: string) => {
      if (cmd.trim() && commandHistoryRef.current[0] !== cmd) {
        commandHistoryRef.current.unshift(cmd);
        if (commandHistoryRef.current.length > 100) {
          commandHistoryRef.current.pop();
        }
      }
      historyPositionRef.current = -1;
    };

    term.onKey(({ key, domEvent }) => {
      const ev = domEvent as KeyboardEvent;
      const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;

      if (ev.keyCode === 13) {
        // Enter
        term.write("\r\n");
        if (currentLine.trim().length > 0) {
          addToHistory(currentLine);
          void handleCommand(currentLine.trim());
        } else {
          writePrompt(term);
        }
        currentLine = "";
        currentPosition = 0;
      } else if (ev.keyCode === 8) {
        // Backspace
        if (currentPosition > 0) {
          currentLine = currentLine.slice(0, -1);
          currentPosition--;
          term.write("\b \b");
        }
      } else if (ev.keyCode === 38) {
        // Up arrow
        const history = commandHistoryRef.current;
        if (historyPositionRef.current < history.length - 1) {
          if (historyPositionRef.current === -1) {
            currentLineRef.current = currentLine;
          }
          historyPositionRef.current++;
          setCurrentLine(history[historyPositionRef.current] ?? "");
        }
      } else if (ev.keyCode === 40) {
        // Down arrow
        if (historyPositionRef.current > -1) {
          historyPositionRef.current--;
          if (historyPositionRef.current === -1) {
            setCurrentLine(currentLineRef.current);
          } else {
            setCurrentLine(
              commandHistoryRef.current[historyPositionRef.current] ?? ""
            );
          }
        }
      } else if (ev.ctrlKey && ev.key === "c") {
        // Ctrl+C
        term.write("^C\r\n\x1b[38;2;137;180;250msirius>\x1b[0m ");
        currentLine = "";
        currentPosition = 0;
      } else if (ev.ctrlKey && ev.key === "l") {
        // Ctrl+L
        term.clear();
        term.write("\x1b[38;2;137;180;250msirius>\x1b[0m " + currentLine);
      } else if (printable) {
        currentLine += key;
        currentPosition++;
        term.write(key);
      }
    });

    // Handle window resizing
    const handleResize = () => {
      requestAnimationFrame(() => fitAddon.fit());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      term.dispose();
      terminal.current = null;
    };
  }, []); // Only run once on mount

  const handleCommand = async (command: string) => {
    const term = terminal.current;
    if (!term) return;

    const [cmd = "", ...args] = command.toLowerCase().split(" ");

    if (cmd && cmd in LOCAL_COMMANDS) {
      const result = LOCAL_COMMANDS[cmd as keyof typeof LOCAL_COMMANDS](
        term,
        commandHistoryRef.current
      );
      writePrompt(term);
      return;
    }

    try {
      await executeCommand.mutateAsync({ command });
    } catch (error) {
      term.writeln("\x1b[38;2;243;139;168mCommand execution failed\x1b[0m");
      writePrompt(term);
    }
  };

  return (
    <Layout title="Sirius Terminal">
      <div className="flex h-[calc(100vh-6rem)] flex-col">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-light text-white">Sirius Terminal</h1>
        </div>
        <div className="relative flex-1 rounded-lg border-2 border-[#313244] bg-[#1e1e2e] shadow-lg">
          <div
            ref={terminalRef}
            className="absolute inset-0 overflow-hidden rounded-lg p-4"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Terminal;

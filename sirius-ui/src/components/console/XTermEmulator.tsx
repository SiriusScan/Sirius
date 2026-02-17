import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import "@xterm/xterm/css/xterm.css";
import { cn } from "~/components/lib/utils";
import { Search, ChevronUp, ChevronDown, X } from "lucide-react";

// Catppuccin Mocha color scheme
const MOCHA_THEME = {
  background: "#1e1e2e",
  foreground: "#cdd6f4",
  cursor: "#f5e0dc",
  cursorAccent: "#1e1e2e",
  selection: "#585b7066",
  black: "#45475a",
  red: "#f38ba8",
  green: "#a6e3a1",
  yellow: "#f9e2af",
  blue: "#89b4fa",
  magenta: "#cba6f7",
  cyan: "#89dceb",
  white: "#bac2de",
  brightBlack: "#585b70",
  brightRed: "#f38ba8",
  brightGreen: "#a6e3a1",
  brightYellow: "#f9e2af",
  brightBlue: "#89b4fa",
  brightMagenta: "#cba6f7",
  brightCyan: "#89dceb",
  brightWhite: "#a6adc8",
} as const;

export interface XTermEmulatorHandle {
  terminal: XTerm | null;
  write: (data: string) => void;
  writeln: (data: string) => void;
  clear: () => void;
  scrollToBottom: () => void;
  focus: () => void;
  fit: () => void;
  setFontSize: (size: number) => void;
  openSearch: () => void;
  closeSearch: () => void;
}

interface XTermEmulatorProps {
  onReady?: (terminal: XTerm) => void;
  onDispose?: () => void;
  className?: string;
  fontSize?: number;
  /** Unique ID for multi-instance support (Phase 4.1) */
  instanceId?: string;
}

export const XTermEmulator = forwardRef<XTermEmulatorHandle, XTermEmulatorProps>(
  function XTermEmulator({ onReady, onDispose, className, fontSize = 14, instanceId }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<XTerm | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const searchAddonRef = useRef<SearchAddon | null>(null);
    const isInitializingRef = useRef(false);

    // Search state (Phase 4.2)
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [caseSensitive, setCaseSensitive] = useState(false);
    const [useRegex, setUseRegex] = useState(false);

    // Expose handle methods
    useImperativeHandle(
      ref,
      () => ({
        get terminal() {
          return terminalRef.current;
        },
        write(data: string) {
          terminalRef.current?.write(data);
        },
        writeln(data: string) {
          terminalRef.current?.writeln(data);
        },
        clear() {
          terminalRef.current?.clear();
        },
        scrollToBottom() {
          terminalRef.current?.scrollToBottom();
        },
        focus() {
          terminalRef.current?.focus();
        },
        fit() {
          try {
            if (terminalRef.current?.element && fitAddonRef.current) {
              fitAddonRef.current.fit();
            }
          } catch {
            // Silently ignore fit errors
          }
        },
        setFontSize(size: number) {
          if (terminalRef.current) {
            terminalRef.current.options.fontSize = size;
            try {
              fitAddonRef.current?.fit();
            } catch {
              // Ignore
            }
          }
        },
        openSearch() {
          setSearchOpen(true);
        },
        closeSearch() {
          setSearchOpen(false);
          searchAddonRef.current?.clearDecorations();
        },
      }),
      []
    );

    // ── Terminal initialization ────────────────────────────────────────────

    useEffect(() => {
      const container = containerRef.current;
      if (!container || terminalRef.current || isInitializingRef.current) {
        return;
      }

      isInitializingRef.current = true;
      let disposed = false;
      let resizeObserver: ResizeObserver | null = null;

      // Wait until the container has real dimensions before opening xterm.
      // Without this, xterm's Viewport.syncScrollArea crashes because the
      // renderer hasn't computed `dimensions` from a zero-size element.
      const waitForDimensions = () => {
        return new Promise<void>((resolve) => {
          const check = () => {
            if (disposed) return;
            const { offsetWidth, offsetHeight } = container;
            if (offsetWidth > 0 && offsetHeight > 0) {
              resolve();
            } else {
              requestAnimationFrame(check);
            }
          };
          check();
        });
      };

      const init = async () => {
        await waitForDimensions();
        if (disposed) return;

        const term = new XTerm({
          cursorBlink: true,
          fontSize,
          fontFamily:
            "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
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
        const currentSearchAddon = new SearchAddon();
        fitAddonRef.current = currentFitAddon;
        searchAddonRef.current = currentSearchAddon;

        term.loadAddon(currentFitAddon);
        term.loadAddon(webLinksAddon);
        term.loadAddon(currentSearchAddon);

        try {
          term.open(container);
        } catch {
          // Guard against rare cases where open() fails due to layout timing
          isInitializingRef.current = false;
          return;
        }

        if (disposed) {
          term.dispose();
          return;
        }

        terminalRef.current = term;

        // Initial fit -- wait for renderer to fully initialize
        requestAnimationFrame(() => {
          setTimeout(() => {
            try {
              if (
                !disposed &&
                terminalRef.current?.element &&
                fitAddonRef.current
              ) {
                fitAddonRef.current.fit();
              }
            } catch {
              // Silently ignore fit errors during init
            }
          }, 100);

          isInitializingRef.current = false;
          if (!disposed) onReady?.(term);
        });

        // Resize observer -- debounced to avoid rapid re-fits
        let fitTimer: ReturnType<typeof setTimeout> | null = null;
        resizeObserver = new ResizeObserver(() => {
          if (fitTimer) clearTimeout(fitTimer);
          fitTimer = setTimeout(() => {
            try {
              if (
                !disposed &&
                terminalRef.current?.element &&
                fitAddonRef.current
              ) {
                fitAddonRef.current.fit();
              }
            } catch {
              // Silently ignore
            }
          }, 50);
        });

        const parentElement = container.parentElement;
        if (parentElement) {
          resizeObserver.observe(parentElement);
        }
      };

      void init();

      return () => {
        disposed = true;
        if (terminalRef.current) {
          terminalRef.current.dispose();
          terminalRef.current = null;
        }
        isInitializingRef.current = false;
        resizeObserver?.disconnect();
        onDispose?.();
      };
    }, [instanceId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Font size update ──────────────────────────────────────────────────

    useEffect(() => {
      if (terminalRef.current?.element) {
        terminalRef.current.options.fontSize = fontSize;
        // Delay fit to let the renderer recalculate with the new font size
        setTimeout(() => {
          try {
            if (terminalRef.current?.element && fitAddonRef.current) {
              fitAddonRef.current.fit();
            }
          } catch {
            // Ignore
          }
        }, 0);
      }
    }, [fontSize]);

    // ── Search handlers ───────────────────────────────────────────────────

    const doSearch = useCallback(
      (query: string, direction: "next" | "prev" = "next") => {
        if (!searchAddonRef.current || !query) return;
        const opts = { caseSensitive, regex: useRegex };
        if (direction === "next") {
          searchAddonRef.current.findNext(query, opts);
        } else {
          searchAddonRef.current.findPrevious(query, opts);
        }
      },
      [caseSensitive, useRegex]
    );

    const handleSearchKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          doSearch(searchQuery, e.shiftKey ? "prev" : "next");
        }
        if (e.key === "Escape") {
          setSearchOpen(false);
          searchAddonRef.current?.clearDecorations();
          terminalRef.current?.focus();
        }
      },
      [searchQuery, doSearch]
    );

    // ── Keyboard shortcut: Ctrl+Shift+F for search ───────────────────────

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === "F") {
          e.preventDefault();
          setSearchOpen((prev) => !prev);
        }
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }, []);

    return (
      <div className="relative h-full w-full">
        {/* Search overlay (Phase 4.2) */}
        {searchOpen && (
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-violet-500/20 bg-gray-900/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
            <Search className="h-3.5 w-3.5 text-gray-500" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                doSearch(e.target.value);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Find..."
              className="w-40 bg-transparent text-xs text-white outline-none placeholder:text-gray-500"
            />
            <button
              onClick={() => setCaseSensitive((v) => !v)}
              className={cn(
                "rounded px-1 py-0.5 text-[9px] font-bold transition-colors",
                caseSensitive
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-400 hover:text-gray-400"
              )}
              title="Case sensitive"
            >
              Aa
            </button>
            <button
              onClick={() => setUseRegex((v) => !v)}
              className={cn(
                "rounded px-1 py-0.5 text-[9px] font-bold transition-colors",
                useRegex
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-400 hover:text-gray-400"
              )}
              title="Regex"
            >
              .*
            </button>
            <div className="mx-0.5 h-3.5 w-px bg-gray-700" />
            <button
              onClick={() => doSearch(searchQuery, "prev")}
              className="rounded p-0.5 text-gray-500 hover:text-gray-300"
              title="Previous (Shift+Enter)"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => doSearch(searchQuery, "next")}
              className="rounded p-0.5 text-gray-500 hover:text-gray-300"
              title="Next (Enter)"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                setSearchOpen(false);
                searchAddonRef.current?.clearDecorations();
                terminalRef.current?.focus();
              }}
              className="rounded p-0.5 text-gray-500 hover:text-gray-300"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Terminal container */}
        <div
          ref={containerRef}
          className={className ?? "h-full max-h-full w-full overflow-hidden"}
        />
      </div>
    );
  }
);

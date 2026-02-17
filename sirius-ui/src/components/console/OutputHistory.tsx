import React, { useState, useMemo, useCallback, useEffect } from "react";
import { cn } from "~/components/lib/utils";
import {
  Search,
  Play,
  Server,
  Bot,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Layers,
  Timer,
  Trash2,
  AlertTriangle,
  Maximize2,
  Copy,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import type { CommandHistoryEntry } from "./types";

interface OutputHistoryProps {
  entries: CommandHistoryEntry[];
  onReExecute: (entry: CommandHistoryEntry) => void;
  onDeleteEntry?: (entryId: string) => void;
  onClearAll?: () => void;
}

const formatDuration = (ms?: number): string => {
  if (ms == null) return "";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60_000);
  const secs = Math.round((ms % 60_000) / 1000);
  return `${mins}m${secs}s`;
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getTargetLabel = (entry: CommandHistoryEntry): string => {
  if (entry.multiExec) {
    return `${entry.multiExec.agentCount} agents`;
  }
  if (entry.target.type === "engine") {
    return "Engine";
  }
  return entry.target.name ?? entry.target.id ?? "Agent";
};

/** Pill for multi-exec result summary */
const MultiExecBadge: React.FC<{
  succeeded: number;
  failed: number;
  cancelled: number;
}> = ({ succeeded, failed, cancelled }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/5 px-1.5 py-0.5 text-[10px]">
    {succeeded > 0 && (
      <span className="text-emerald-400">{succeeded} ok</span>
    )}
    {failed > 0 && <span className="text-red-400">{failed} fail</span>}
    {cancelled > 0 && (
      <span className="text-amber-400">{cancelled} skip</span>
    )}
  </span>
);

// ─── Output Viewer ──────────────────────────────────────────────────────────
// Three-tier expansion: compact → expanded → maximized overlay

type ViewerSize = "compact" | "expanded" | "maximized";

const OutputViewer: React.FC<{
  output: string;
  className?: string;
  fontSize?: string;
}> = ({ output, className, fontSize = "text-[11px]" }) => {
  const [size, setSize] = useState<ViewerSize>("compact");
  const [copied, setCopied] = useState(false);

  const text = output || "(no output)";
  const lineCount = text.split("\n").length;
  const isLargeOutput = lineCount > 6;

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      void navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [text]
  );

  const cycleSize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (size === "compact") setSize("expanded");
      else if (size === "expanded") setSize("compact");
    },
    [size]
  );

  const openMaximized = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSize("maximized");
  }, []);

  const closeMaximized = useCallback(() => {
    setSize("expanded");
  }, []);

  // Escape to close maximized
  useEffect(() => {
    if (size !== "maximized") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMaximized();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [size, closeMaximized]);

  // Maximized overlay
  if (size === "maximized") {
    return (
      <>
        {/* Inline placeholder so layout doesn't jump */}
        <div className="rounded bg-gray-950/50 px-2 py-1.5">
          <span className="text-[10px] italic text-gray-400">
            Output open in expanded view
          </span>
        </div>

        {/* Full-screen overlay */}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={closeMaximized}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-violet-500/20 bg-gray-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Overlay header */}
            <div className="flex items-center justify-between border-b border-violet-500/10 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-gray-300">
                  Command Output
                </span>
                <span className="rounded-full bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500">
                  {lineCount} lines
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-200"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={closeMaximized}
                  className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Overlay body */}
            <pre className="flex-1 overflow-auto p-4 font-mono text-sm leading-relaxed text-gray-300">
              {text}
            </pre>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={cn("group/output relative", className)}>
      <pre
        className={cn(
          "overflow-auto rounded bg-gray-950 p-2 font-mono leading-relaxed text-gray-300 transition-[max-height] duration-200",
          fontSize,
          size === "compact" ? "max-h-[120px]" : "max-h-[50vh]"
        )}
      >
        {text}
      </pre>

      {/* Bottom toolbar -- visible on hover or when large */}
      <div
        className={cn(
          "flex items-center justify-between px-1 pt-1 transition-opacity",
          isLargeOutput
            ? "opacity-100"
            : "opacity-0 group-hover/output:opacity-100"
        )}
      >
        <div className="flex items-center gap-1">
          {/* Line count */}
          <span className="text-[9px] text-gray-400">
            {lineCount} lines
          </span>

          {/* Expand/Collapse toggle */}
          {isLargeOutput && (
            <button
              onClick={cycleSize}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
            >
              <ChevronsUpDown className="h-2.5 w-2.5" />
              {size === "compact" ? "Expand" : "Collapse"}
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
            title="Copy output"
          >
            {copied ? (
              <Check className="h-2.5 w-2.5 text-emerald-400" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )}
          </button>

          {/* Maximize button */}
          {isLargeOutput && (
            <button
              onClick={openMaximized}
              className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
              title="Open in full view"
            >
              <Maximize2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Entry detail components ────────────────────────────────────────────────

/** Expanded view for a single-target entry */
const SingleEntryDetail: React.FC<{
  entry: CommandHistoryEntry;
  onReExecute: (entry: CommandHistoryEntry) => void;
  onDelete?: (entryId: string) => void;
}> = ({ entry, onReExecute, onDelete }) => (
  <div className="border-t border-violet-500/10 px-3 py-2">
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-2">
        {entry.durationMs != null && (
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Timer className="h-2.5 w-2.5" />
            {formatDuration(entry.durationMs)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReExecute(entry);
          }}
          className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-violet-400 transition-colors hover:bg-violet-500/10"
        >
          <Play className="h-2.5 w-2.5" />
          Re-execute
        </button>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(entry.id);
            }}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete entry"
          >
            <Trash2 className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
    <OutputViewer output={entry.output} />
  </div>
);

/** Expanded view for a multi-exec entry with per-agent results */
const MultiExecDetail: React.FC<{
  entry: CommandHistoryEntry;
  onReExecute: (entry: CommandHistoryEntry) => void;
  onDelete?: (entryId: string) => void;
}> = ({ entry, onReExecute, onDelete }) => {
  const multiExec = entry.multiExec;
  if (!multiExec) return null;

  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const toggleAgent = (agentId: string) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

  return (
    <div className="border-t border-violet-500/10 px-3 py-2">
      {/* Header with stats and re-execute */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <MultiExecBadge
            succeeded={multiExec.succeeded}
            failed={multiExec.failed}
            cancelled={multiExec.cancelled}
          />
          {entry.durationMs != null && (
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <Timer className="h-2.5 w-2.5" />
              {formatDuration(entry.durationMs)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReExecute(entry);
            }}
            className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-violet-400 transition-colors hover:bg-violet-500/10"
          >
            <Play className="h-2.5 w-2.5" />
            Re-execute all
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
              title="Delete entry"
            >
              <Trash2 className="h-2.5 w-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Per-agent results */}
      <div className="space-y-1">
        {multiExec.results.map((result) => {
          const isAgentExpanded = expandedAgents.has(result.agentId);
          return (
            <div
              key={result.agentId}
              className="rounded border border-violet-500/5 bg-gray-950/50"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAgent(result.agentId);
                }}
                className="flex w-full items-center gap-2 px-2 py-1.5 text-left"
              >
                {isAgentExpanded ? (
                  <ChevronDown className="h-2.5 w-2.5 flex-shrink-0 text-gray-500" />
                ) : (
                  <ChevronRight className="h-2.5 w-2.5 flex-shrink-0 text-gray-500" />
                )}

                {result.success ? (
                  <CheckCircle className="h-2.5 w-2.5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-2.5 w-2.5 flex-shrink-0 text-red-400" />
                )}

                <Bot className="h-2.5 w-2.5 flex-shrink-0 text-violet-400" />

                <span className="flex-1 truncate font-mono text-[10px] text-gray-300">
                  {result.agentName ?? result.agentId}
                </span>

                <span
                  className={cn(
                    "text-[9px]",
                    result.success ? "text-emerald-500" : "text-red-500"
                  )}
                >
                  {result.success ? "OK" : "FAIL"}
                </span>
              </button>

              {isAgentExpanded && (
                <div className="mx-2 mb-2">
                  <OutputViewer
                    output={result.output}
                    fontSize="text-[10px]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────

export const OutputHistory: React.FC<OutputHistoryProps> = ({
  entries,
  onReExecute,
  onDeleteEntry,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [targetFilter, setTargetFilter] = useState<
    "all" | "engine" | "agent" | "multi"
  >("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredEntries = useMemo(() => {
    let result = entries;

    if (targetFilter === "multi") {
      result = result.filter((e) => e.multiExec != null);
    } else if (targetFilter !== "all") {
      result = result.filter(
        (e) => e.target.type === targetFilter && !e.multiExec
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.command.toLowerCase().includes(lower) ||
          e.output.toLowerCase().includes(lower) ||
          getTargetLabel(e).toLowerCase().includes(lower)
      );
    }

    return result;
  }, [entries, searchTerm, targetFilter]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Stats
  const multiCount = entries.filter((e) => e.multiExec != null).length;

  // Bulk expand / collapse (hooks must be above early returns)
  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);
  const expandAll = useCallback(
    () => setExpandedIds(new Set(filteredEntries.map((e) => e.id))),
    [filteredEntries]
  );
  const allExpanded =
    filteredEntries.length > 0 &&
    filteredEntries.every((e) => expandedIds.has(e.id));

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-gray-500">
        <Clock className="mb-3 h-8 w-8 text-gray-400" />
        <p className="text-sm">No command history yet</p>
        <p className="mt-1 text-xs text-gray-400">
          Commands executed in the terminal will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-gray-900/30">
      {/* Header: search, filters, and controls */}
      <div className="border-b border-violet-500/20 px-3 pt-3 pb-2">
        {/* Row 1: Search bar + action buttons */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search commands or targets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 w-full rounded-md border border-violet-500/10 bg-gray-900/50 pl-8 pr-3 text-xs text-white placeholder-gray-500 outline-none transition-colors focus:border-violet-500/30"
            />
          </div>

          {/* Bulk controls */}
          <div className="flex items-center gap-1 border-l border-violet-500/10 pl-2">
            {/* Expand / Collapse all toggle */}
            <button
              onClick={allExpanded ? collapseAll : expandAll}
              className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
              title={allExpanded ? "Collapse all" : "Expand all"}
            >
              <ChevronsUpDown className="h-3 w-3" />
              {allExpanded ? "Collapse" : "Expand"}
            </button>

            {/* Clear all */}
            {onClearAll && entries.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-1 rounded border border-amber-500/20 bg-amber-500/5 px-2 py-0.5">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 text-amber-400" />
                    <span className="text-[10px] text-amber-400">Clear all?</span>
                    <button
                      onClick={() => {
                        onClearAll();
                        setConfirmClear(false);
                      }}
                      className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-medium text-red-400 transition-colors hover:bg-red-500/30"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="rounded px-1.5 py-0.5 text-[10px] text-gray-500 transition-colors hover:text-gray-400"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-[10px] text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                    title="Clear all history"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Row 2: Type filters */}
        <div className="mt-2 flex items-center gap-1">
          {(
            [
              { key: "all", label: "All" },
              { key: "engine", label: "Engine" },
              { key: "agent", label: "Agent" },
              { key: "multi", label: "Multi" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTargetFilter(key)}
              className={cn(
                "rounded px-2 py-1 text-[10px] font-medium transition-colors",
                targetFilter === key
                  ? "bg-violet-500/20 text-violet-300"
                  : "text-gray-500 hover:text-gray-400",
                key === "multi" && multiCount === 0 && "hidden"
              )}
            >
              {label}
              {key === "multi" && multiCount > 0 && (
                <span className="ml-1 text-[9px] text-violet-400">
                  {multiCount}
                </span>
              )}
            </button>
          ))}

          {/* Entry count (inline with filters) */}
          <span className="ml-auto text-[10px] text-gray-400">
            {filteredEntries.length === entries.length
              ? `${entries.length} entries`
              : `${filteredEntries.length} of ${entries.length}`}
          </span>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredEntries.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500">
            No matching entries
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEntries.map((entry) => {
              const isExpanded = expandedIds.has(entry.id);
              const isMulti = entry.multiExec != null;
              const targetLabel = getTargetLabel(entry);

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "rounded-lg border transition-colors",
                    isMulti
                      ? "border-violet-500/15 bg-violet-500/5 hover:border-violet-500/25"
                      : "border-violet-500/10 bg-gray-900/30 hover:border-violet-500/20"
                  )}
                >
                  {/* Entry header -- always visible */}
                  <button
                    onClick={() => toggleExpanded(entry.id)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left"
                  >
                    {/* Expand chevron */}
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3 flex-shrink-0 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 flex-shrink-0 text-gray-500" />
                    )}

                    {/* Status icon */}
                    {entry.success ? (
                      <CheckCircle className="h-3 w-3 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <XCircle className="h-3 w-3 flex-shrink-0 text-red-400" />
                    )}

                    {/* Target icon + label (always visible) */}
                    <span className="flex flex-shrink-0 items-center gap-1">
                      {isMulti ? (
                        <Layers className="h-3 w-3 text-violet-400" />
                      ) : entry.target.type === "engine" ? (
                        <Server className="h-3 w-3 text-blue-400" />
                      ) : (
                        <Bot className="h-3 w-3 text-violet-400" />
                      )}
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          isMulti
                            ? "text-violet-300"
                            : entry.target.type === "engine"
                              ? "text-blue-300"
                              : "text-violet-300"
                        )}
                      >
                        {targetLabel}
                      </span>
                    </span>

                    {/* Divider */}
                    <span className="text-gray-300">|</span>

                    {/* Command */}
                    <span className="flex-1 truncate font-mono text-xs text-white">
                      {entry.command}
                    </span>

                    {/* Duration badge */}
                    {entry.durationMs != null && (
                      <span className="flex flex-shrink-0 items-center gap-0.5 text-[10px] text-gray-400">
                        <Timer className="h-2.5 w-2.5" />
                        {formatDuration(entry.durationMs)}
                      </span>
                    )}

                    {/* Multi-exec summary badge */}
                    {isMulti && entry.multiExec && (
                      <MultiExecBadge
                        succeeded={entry.multiExec.succeeded}
                        failed={entry.multiExec.failed}
                        cancelled={entry.multiExec.cancelled}
                      />
                    )}

                    {/* Timestamp */}
                    <span className="flex-shrink-0 text-[10px] text-gray-500">
                      {formatTime(entry.timestamp)}
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded &&
                    (isMulti ? (
                      <MultiExecDetail
                        entry={entry}
                        onReExecute={onReExecute}
                        onDelete={onDeleteEntry}
                      />
                    ) : (
                      <SingleEntryDetail
                        entry={entry}
                        onReExecute={onReExecute}
                        onDelete={onDeleteEntry}
                      />
                    ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

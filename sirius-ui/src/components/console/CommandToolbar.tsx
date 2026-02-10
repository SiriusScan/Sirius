import React from "react";
import { cn } from "~/components/lib/utils";
import {
  Server,
  Bot,
  Trash2,
  ClipboardCopy,
  Users,
  Clock,
  Search,
  Minus,
  Plus,
} from "lucide-react";
import type { Target } from "./types";

interface CommandToolbarProps {
  target: Target;
  multiExecMode: boolean;
  multiExecCount: number;
  timestampMode: boolean;
  fontSize: number;
  onClear: () => void;
  onCopyOutput: () => void;
  onMultiExecToggle: () => void;
  onTimestampToggle: () => void;
  onFontSizeChange: (delta: number) => void;
  onOpenSearch: () => void;
}

export const CommandToolbar: React.FC<CommandToolbarProps> = ({
  target,
  multiExecMode,
  multiExecCount,
  timestampMode,
  fontSize,
  onClear,
  onCopyOutput,
  onMultiExecToggle,
  onTimestampToggle,
  onFontSizeChange,
  onOpenSearch,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-violet-500/20 bg-gray-900/30 px-4 py-2">
      {/* Target indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Target
        </span>
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium",
            target.type === "engine"
              ? "bg-blue-500/10 text-blue-300"
              : "bg-violet-500/10 text-violet-300"
          )}
        >
          {target.type === "engine" ? (
            <Server className="h-3 w-3" />
          ) : (
            <Bot className="h-3 w-3" />
          )}
          {target.type === "engine"
            ? "Engine"
            : target.name ?? target.id ?? "Agent"}
        </div>

        {multiExecMode && multiExecCount > 0 && (
          <div className="flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
            <Users className="h-3 w-3" />
            Execute on {multiExecCount} agent{multiExecCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Timestamp toggle */}
        <button
          onClick={onTimestampToggle}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors",
            timestampMode
              ? "bg-violet-500/20 text-violet-300"
              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          )}
          title={timestampMode ? "Disable timestamps" : "Enable timestamps"}
        >
          <Clock className="h-3 w-3" />
        </button>

        {/* Font size controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onFontSizeChange(-1)}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
            title="Decrease font size (Ctrl+Shift+-)"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[24px] text-center text-[10px] text-gray-500">
            {fontSize}
          </span>
          <button
            onClick={() => onFontSizeChange(1)}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
            title="Increase font size (Ctrl+Shift+=)"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="mx-0.5 h-4 w-px bg-gray-700" />

        {/* Search */}
        <ToolbarButton
          icon={Search}
          label="Search"
          onClick={onOpenSearch}
          title="Search (Ctrl+Shift+F)"
        />

        <ToolbarButton icon={Trash2} label="Clear" onClick={onClear} />
        <ToolbarButton icon={ClipboardCopy} label="Copy" onClick={onCopyOutput} />

        <div className="mx-0.5 h-4 w-px bg-gray-700" />

        <button
          onClick={onMultiExecToggle}
          className={cn(
            "flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
            multiExecMode
              ? "bg-violet-500/20 text-violet-300"
              : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
          )}
          title={multiExecMode ? "Exit multi-exec" : "Multi-exec mode"}
        >
          <Users className="h-3 w-3" />
          Multi
        </button>
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  title?: string;
}> = ({ icon: Icon, label, onClick, title }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-800 hover:text-gray-300"
    title={title ?? label}
  >
    <Icon className="h-3 w-3" />
    <span className="hidden sm:inline">{label}</span>
  </button>
);

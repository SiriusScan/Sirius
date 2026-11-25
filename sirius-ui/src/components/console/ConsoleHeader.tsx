import React from "react";
import { cn } from "~/components/lib/utils";
import { Terminal, Clock, UserCog } from "lucide-react";
import type { ConsoleView } from "./types";
import type { SiriusConsoleView } from "~/ui/extensions/types";
import {
  agentCounterDetail,
  agentCounterLabel,
  agentCounterTone,
  type AgentCounts,
} from "./agentStatus";

interface ConsoleHeaderProps {
  /** The open view; null while it is still being decided. */
  activeView: ConsoleView | null;
  onViewChange: (view: ConsoleView) => void;
  /** The console's one agent counter; null hides it (loading or unavailable). */
  agentCounts: AgentCounts | null;
  /** Build-selected extension views, placed before or after the built-ins. */
  extraViews?: readonly SiriusConsoleView[];
}

const VIEW_TABS: {
  id: ConsoleView;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "terminal", label: "Terminal", icon: Terminal },
  { id: "history", label: "History", icon: Clock },
  { id: "agent", label: "Agent", icon: UserCog },
];

const TONE_CLASS = {
  none: {
    chip: "border-gray-500/30 bg-gray-500/10 text-gray-300",
    dot: "bg-gray-500",
  },
  online: {
    chip: "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
    dot: "bg-emerald-400",
  },
  away: {
    chip: "border-gray-500/30 bg-gray-500/10 text-gray-300",
    dot: "bg-red-400",
  },
} as const;

/** The console's single agent counter ("2 of 3 agents online"). */
const AgentCounter: React.FC<{ counts: AgentCounts }> = ({ counts }) => {
  const tone = TONE_CLASS[agentCounterTone(counts)];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-medium tabular-nums",
        tone.chip
      )}
      title={agentCounterDetail(counts)}
      data-agent-counter
    >
      <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {agentCounterLabel(counts)}
    </span>
  );
};

/**
 * Operator Console header: icon, title and the one agent counter on the first
 * row (kept clear of the floating account avatar), view tabs underneath.
 *
 * The tabs are plain buttons in a <nav> so browser tests read them as
 * "Chat,Terminal,History,Agent"; the open view is also in `?view=`.
 */
export const ConsoleHeader: React.FC<ConsoleHeaderProps> = ({
  activeView,
  onViewChange,
  agentCounts,
  extraViews = [],
}) => {
  const tabs = [
    ...extraViews.filter((view) => view.placement === "start"),
    ...VIEW_TABS,
    ...extraViews.filter((view) => view.placement !== "start"),
  ];

  return (
    <div className="relative z-30 shrink-0 border-b border-violet-500/20 bg-gray-900/95 shadow-lg shadow-black/20 backdrop-blur-sm">
      {/* 12px + 48px tile: centred on the avatar's row; pr-20 keeps it clear. */}
      <div className="flex min-h-[72px] flex-wrap items-center gap-x-3 gap-y-2 py-3 pl-4 pr-20 md:pl-6">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
          <Terminal className="h-6 w-6 text-violet-400" aria-hidden />
        </div>
        <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight text-white">
          Operator Console
        </h1>
        {agentCounts && <AgentCounter counts={agentCounts} />}
      </div>

      <nav aria-label="Console views" className="px-2 md:px-4">
        <div className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  if (!active) onViewChange(id);
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/40",
                  active
                    ? "border-violet-500 text-violet-300"
                    : "border-transparent text-gray-500 hover:border-violet-500/20 hover:text-gray-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

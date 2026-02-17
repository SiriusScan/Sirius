import React from "react";
import { cn } from "~/components/lib/utils";
import { Square, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { MultiExecProgress } from "./types";

interface ExecutionProgressProps {
  progress: MultiExecProgress;
  onCancel: () => void;
}

export const ExecutionProgress: React.FC<ExecutionProgressProps> = ({
  progress,
  onCancel,
}) => {
  const { total, completed, succeeded, failed, cancelled, isRunning } =
    progress;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (!isRunning && completed === 0) return null;

  return (
    <div className="border-b border-violet-500/20 bg-gray-900/50 px-4 py-2">
      <div className="flex items-center gap-3">
        {/* Progress bar */}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isRunning && (
                <Loader2 className="h-3 w-3 animate-spin text-violet-400" />
              )}
              <span className="text-gray-300">
                {isRunning
                  ? `Executing on ${completed}/${total} agents...`
                  : `Completed ${completed}/${total}`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              {succeeded > 0 && (
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  {succeeded}
                </span>
              )}
              {failed > 0 && (
                <span className="flex items-center gap-1 text-red-400">
                  <XCircle className="h-3 w-3" />
                  {failed}
                </span>
              )}
              {cancelled > 0 && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Square className="h-3 w-3" />
                  {cancelled}
                </span>
              )}
            </div>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                failed > 0 ? "bg-amber-500" : "bg-violet-500"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Cancel button */}
        {isRunning && (
          <button
            onClick={onCancel}
            className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
};

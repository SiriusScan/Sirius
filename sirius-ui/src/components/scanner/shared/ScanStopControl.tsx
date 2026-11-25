/**
 * ScanStopControl — the one Stop for the running scan, beside its progress
 * bar (R03). It keeps useStopScan's three tiers:
 *
 * 1. Stop scan: a graceful cancel through the scanner.
 * 2. Force stop: offered when the scanner has not stopped after a while.
 * 3. Reset: clears the scan state when a force stop fails too.
 *
 * A pending scan (admitted, not yet started by the scanner) can be stopped
 * too; the stop is final only once the scanner confirms it.
 */

import React from "react";
import { Loader2, RotateCcw, Square, Zap } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import type { StopStage } from "~/hooks/useStopScan";

export interface ScanStopControlProps {
  /** The scan's status; the control only renders while it waits, runs or stops. */
  status: string | undefined;
  stopStage: StopStage;
  isStopping: boolean;
  onStop: () => void;
  onForceStop: () => void;
  onReset: () => void;
}

const RESET_HINT =
  "Clears the scan state Sirius shows. Use it only when the scanner no longer answers.";

export function ScanStopControl({
  status,
  stopStage,
  isStopping,
  onStop,
  onForceStop,
  onReset,
}: ScanStopControlProps) {
  if (status !== "pending" && status !== "running" && status !== "cancelling") return null;

  // Tier 2: the graceful stop timed out or failed.
  if (stopStage === "force_available" || stopStage === "force_stopping") {
    const forcing = stopStage === "force_stopping";
    return (
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={onForceStop}
          disabled={forcing}
          title="The scanner has not stopped yet. Force stop ends its processes."
        >
          {forcing ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Zap className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          )}
          {forcing ? "Forcing stop…" : "Force stop"}
        </Button>
        <button
          type="button"
          onClick={onReset}
          title={RESET_HINT}
          className="rounded text-xs text-amber-400/80 underline underline-offset-2 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
        >
          Reset
        </button>
      </div>
    );
  }

  // Tier 3: force stop failed; only clearing the state is left.
  if (stopStage === "reset_available") {
    // A plain button: Button's variant classes would override the amber.
    return (
      <button
        type="button"
        onClick={onReset}
        disabled={isStopping}
        title={RESET_HINT}
        className="inline-flex h-9 shrink-0 items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-3 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:pointer-events-none disabled:opacity-50"
      >
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Reset scan state
      </button>
    );
  }

  // Tier 1: graceful stop.
  const stopping = isStopping || status === "cancelling";
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onStop}
      disabled={stopping}
      className="shrink-0"
    >
      {stopping ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
      ) : (
        <Square className="mr-1.5 h-3 w-3 fill-current" aria-hidden />
      )}
      {stopping ? "Stopping…" : "Stop scan"}
    </Button>
  );
}

export default ScanStopControl;

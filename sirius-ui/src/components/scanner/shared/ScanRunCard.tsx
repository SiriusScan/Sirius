/**
 * ScanRunCard — the scan itself (R03): targets, profile, start time and
 * elapsed, a progress bar with the one Stop beside it, and the scan's steps.
 * While a scan runs it replaces the form; after it ends the same card reads
 * "Scan completed" (or stopped, or failed) and offers a new scan.
 *
 * Progress comes only from the scanner's own sub-scan counters; until the
 * scanner reports a total the bar is indeterminate and shows no percentage.
 */

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  Circle,
  Clock,
  Loader2,
  Plus,
  Radar,
  RotateCw,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { cn } from "~/components/lib/utils";
import { HeaderChip } from "~/components/shared/PageHeader";
import { isScanActive, summarizeScan } from "~/components/shared/scanSummary";
import type { StopStage } from "~/hooks/useStopScan";
import type { ScanResult } from "~/types/scanTypes";
import { formatDateTime } from "~/utils/formatDateTime";
import { ScanSection } from "./ScanSection";
import { ScanStopControl } from "./ScanStopControl";
import {
  currentStep,
  formatElapsed,
  profileLabel,
  runTitle,
  scanDurationMs,
  scanSteps,
  scanTargetLabels,
  type ProfileInfo,
  type ScanStep,
  type StepState,
} from "./scanRunModel";

const MAX_TARGET_CHIPS = 6;

export interface ScanRunCardProps {
  scan: ScanResult;
  /** The profile, when something real records it (see scanProfileId). */
  profile?: ProfileInfo;
  stopStage: StopStage;
  isStopping: boolean;
  stopError?: string | null;
  onStop: () => void;
  onForceStop: () => void;
  onReset: () => void;
  /** Opens the scan form; offered once the scan has ended. */
  onNewScan?: () => void;
  /** Opens the form pre-filled with this scan's targets. */
  onScanAgain?: () => void;
  /** Targets from a ?target= link that wait for this scan to end. */
  waitingTargets?: readonly string[];
}

/** Re-render every second while `active`, for the elapsed clock. */
/** How long a pending scan waits for the scanner before it reads unconfirmed. */
const START_CONFIRMATION_MS = 30_000;

function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

function StepIcon({ state }: { state: StepState }) {
  switch (state) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-violet-400" aria-hidden />;
    case "running":
      return <Loader2 className="h-4 w-4 animate-spin text-violet-300" aria-hidden />;
    case "failed":
      return <AlertCircle className="h-4 w-4 text-red-400" aria-hidden />;
    case "stopped":
      return <Ban className="h-4 w-4 text-amber-400/80" aria-hidden />;
    default:
      return <Circle className="h-4 w-4 text-gray-600" aria-hidden />;
  }
}

const STEP_STATE_TEXT: Record<StepState, string> = {
  done: "done",
  running: "running",
  pending: "not started",
  failed: "failed",
  stopped: "stopped",
};

/** The scan's steps; `describedId` is the step already described beside the bar. */
function Steps({ steps, describedId }: { steps: readonly ScanStep[]; describedId?: string }) {
  if (steps.length === 0) return null;
  return (
    <ol className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs" aria-label="Scan steps">
      {steps.map((step) => (
        <li
          key={step.id}
          className="flex items-center gap-2"
          aria-label={`${step.label}: ${STEP_STATE_TEXT[step.state]}${step.detail ? `, ${step.detail}` : ""}`}
        >
          <StepIcon state={step.state} />
          <span className={cn(step.state === "pending" ? "text-gray-500" : "text-gray-200")}>{step.label}</span>
          {step.detail && step.id !== describedId && (
            <span className="tabular-nums text-gray-500">{step.detail}</span>
          )}
          {step.state === "running" && <span className="text-violet-300">running</span>}
        </li>
      ))}
    </ol>
  );
}

function endedLine(scan: ScanResult): string {
  const at = scan.end_time ? formatDateTime(scan.end_time) : "";
  const when = at && at !== "—" ? ` ${at}` : "";
  switch (scan.status) {
    case "completed":
      return `Finished${when}`;
    case "cancelled":
      return `Stopped${when}`;
    case "failed":
      // The API admitted the scan but couldn't hand it to the scanner.
      return scan.sub_scans?.network?.metadata?.submission_error === "not_published"
        ? "Network scan could not be submitted"
        : `Failed${when}`;
    default:
      return "";
  }
}

export function ScanRunCard({
  scan,
  profile,
  stopStage,
  isStopping,
  stopError,
  onStop,
  onForceStop,
  onReset,
  onNewScan,
  onScanAgain,
  waitingTargets,
}: ScanRunCardProps) {
  const active = isScanActive(scan.status);
  const now = useNow(active);
  const summary = summarizeScan(scan);
  const steps = scanSteps(scan);
  const step = currentStep(steps);
  const targets = scanTargetLabels(scan.targets);
  const shownTargets = targets.slice(0, MAX_TARGET_CHIPS);
  const hiddenTargets = targets.slice(MAX_TARGET_CHIPS);

  // A finished scan is at 100% even when it reported no counters.
  const percent = summary.progress ?? (scan.status === "completed" ? 100 : undefined);
  const elapsed = scanDurationMs(scan.start_time, scan.end_time, active, now);
  const started = formatDateTime(scan.start_time);

  let progressText: string;
  if (scan.status === "cancelling") progressText = "Waiting for the scanner to stop";
  else if (scan.status === "pending") {
    // Admitted and published; the scanner hasn't started it. A stop asked
    // for now is final only once the scanner confirms it.
    const submittedAt = Date.parse(scan.start_time);
    const unconfirmed = Number.isFinite(submittedAt) && now - submittedAt >= START_CONFIRMATION_MS;
    progressText = isStopping
      ? "Waiting for the scanner to confirm the stop"
      : unconfirmed
        ? "Scanner start could not be confirmed"
        : "Waiting for the scanner to start";
  } else if (active) {
    progressText = step
      ? `${step.label}${step.detail ? ` · ${step.detail}` : ""}`
      : "Waiting for the scanner to report progress";
  } else progressText = endedLine(scan);

  const barTone =
    scan.status === "failed"
      ? "bg-red-500/60"
      : scan.status === "cancelled"
        ? "bg-gray-500"
        : "bg-gradient-to-r from-violet-600 to-violet-400";

  const ended = !active;
  const aside = ended && (onNewScan ?? onScanAgain) ? (
    <>
      {onScanAgain && targets.length > 0 && (
        <Button variant="ghost" size="sm" onClick={onScanAgain} title={`Open the form with ${targets.join(", ")}`}>
          <RotateCw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Scan again
        </Button>
      )}
      {onNewScan && (
        <Button variant="primary" size="sm" onClick={onNewScan}>
          <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          New scan
        </Button>
      )}
    </>
  ) : undefined;

  return (
    <ScanSection icon={Radar} title={runTitle(scan.status)} primary aside={aside}>
      {/* Targets, profile, time */}
      <div className="flex flex-wrap items-center gap-2">
        {shownTargets.map((t) => (
          <HeaderChip key={t} mono icon={Target} title="Target">
            {t}
          </HeaderChip>
        ))}
        {hiddenTargets.length > 0 && (
          <HeaderChip title={hiddenTargets.join(", ")}>+{hiddenTargets.length} more</HeaderChip>
        )}
        {targets.length === 0 && <HeaderChip icon={Target}>No network targets</HeaderChip>}
        {profile && (
          <HeaderChip icon={SlidersHorizontal} title="Scan profile">
            {profileLabel(profile)}
          </HeaderChip>
        )}
        {started !== "—" && (
          <HeaderChip icon={Clock} title={formatDateTime(scan.start_time, "long")}>
            Started {started}
            {elapsed !== null && (active ? ` · ${formatElapsed(elapsed)} elapsed` : ` · took ${formatElapsed(elapsed)}`)}
          </HeaderChip>
        )}
      </div>

      {/* Progress, with the one Stop beside it */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-gray-300">{progressText}</span>
            {percent !== undefined && (
              <span className="shrink-0 font-semibold tabular-nums text-white">{percent}%</span>
            )}
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-gray-800"
            role="progressbar"
            aria-label="Scan progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-valuetext={percent === undefined ? progressText : `${percent}%`}
          >
            {percent !== undefined ? (
              <div
                className={cn("h-full rounded-full transition-[width] duration-500", barTone)}
                style={{ width: `${percent}%` }}
              />
            ) : active ? (
              <div className="h-full w-full animate-pulse rounded-full bg-violet-500/40" />
            ) : null}
          </div>
        </div>
        <ScanStopControl
          status={scan.status}
          stopStage={stopStage}
          isStopping={isStopping}
          onStop={onStop}
          onForceStop={onForceStop}
          onReset={onReset}
        />
      </div>

      <Steps steps={steps} describedId={active ? step?.id : undefined} />

      {active && (stopStage === "force_available" || stopStage === "force_stopping") && (
        <p className="mt-4 text-xs text-amber-300/80">
          The scanner hasn’t confirmed the stop yet. Force stop ends its processes.
        </p>
      )}
      {active && stopStage === "reset_available" && (
        <p className="mt-4 text-xs text-amber-300/80">
          Force stop didn’t finish. Reset clears the scan state Sirius shows; the scanner may still be
          working.
        </p>
      )}

      {stopError && active && (
        <div
          role="alert"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
            Couldn’t stop the scan: {stopError}
          </span>
        </div>
      )}

      {active && waitingTargets && waitingTargets.length > 0 && (
        <p className="mt-4 text-xs text-gray-400">
          The form opens with{" "}
          <span className="font-mono text-gray-300">{waitingTargets.join(", ")}</span> when this scan
          ends.
        </p>
      )}
    </ScanSection>
  );
}

export default ScanRunCard;

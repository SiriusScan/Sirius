import React, { useMemo } from "react";
import { ScanBar } from "../ScanBar";
import {
  Bot,
  Wifi,
  Cloud,
  AppWindow,
  Scan,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Square,
  RotateCw,
  Zap,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { type ScanResult, type SubScan } from "~/types/scanTypes";
import { normalizeSeverity } from "~/utils/riskScoreCalculator";
import { SEVERITY_COLORS, type SeverityLevel } from "~/utils/severityTheme";
import type { StopStage } from "~/hooks/useStopScan";

// Icon/color map for known scanner types — extensible for future scanner types
const SCANNER_CONFIG: Record<
  string,
  { icon: LucideIcon; bg: string; text: string; label: string }
> = {
  network: {
    icon: Wifi,
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    label: "Network Scan",
  },
  agent: {
    icon: Bot,
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    label: "Agent Scan",
  },
  cloud: {
    icon: Cloud,
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    label: "Cloud Scan",
  },
  application: {
    icon: AppWindow,
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    label: "App Scan",
  },
};

const DEFAULT_SCANNER_CONFIG = {
  icon: Scan,
  bg: "bg-gray-500/10",
  text: "text-gray-400",
};

interface VulnerabilityCountProps {
  count: number;
  severity: string;
  severityKey: SeverityLevel;
}

export interface VulnerabilitySeverityCardsProps {
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
}

/** Compact severity chip for the scanner status bar */
const ScanSeverityChip: React.FC<VulnerabilityCountProps> = ({
  count,
  severity,
  severityKey,
}) => {
  const colors = SEVERITY_COLORS[severityKey];
  const isEmpty = count === 0;

  return (
    <div
      className={`
        flex flex-col items-center rounded-lg px-3 py-2
        shadow-sm shadow-black/20 transition-all duration-150
        hover:brightness-110 hover:shadow-md hover:shadow-black/30
        ${colors.cardBg}
        ${isEmpty ? "opacity-40" : ""}
      `}
    >
      <span className="text-lg font-bold tabular-nums text-white">{count}</span>
      <span className="text-[9px] font-medium uppercase tracking-wider text-white/70">
        {severity}
      </span>
    </div>
  );
};

const SCAN_CARD_ORDER: Array<{
  key: SeverityLevel;
  label: string;
  countKey: string;
}> = [
  { key: "critical", label: "Critical", countKey: "critical" },
  { key: "high", label: "High", countKey: "high" },
  { key: "medium", label: "Medium", countKey: "medium" },
  { key: "low", label: "Low", countKey: "low" },
  { key: "info", label: "Info", countKey: "informational" },
];

export const VulnerabilitySeverityCards: React.FC<
  VulnerabilitySeverityCardsProps
> = ({ counts }) => {
  const total =
    counts.critical + counts.high + counts.medium + counts.low + counts.informational;

  return (
    <div className="mt-3 flex flex-col gap-0">
      <div className="grid grid-cols-5 gap-2">
        {SCAN_CARD_ORDER.map(({ key, label, countKey }) => (
          <ScanSeverityChip
            key={key}
            severity={label}
            count={counts[countKey as keyof typeof counts]}
            severityKey={key}
          />
        ))}
      </div>
      {/* Proportional distribution bar */}
      {total > 0 && (
        <div className="mt-1.5 grid grid-cols-5 gap-2">
          {SCAN_CARD_ORDER.map(({ key, countKey }) => {
            const value = counts[countKey as keyof typeof counts];
            const pct = total > 0 ? (value / total) * 100 : 0;
            return (
              <div
                key={key}
                className="h-1 overflow-hidden rounded-full bg-gray-800/40"
              >
                {pct > 0 && (
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: SEVERITY_COLORS[key].cardHex,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ScanStatusProps {
  results: ScanResult;
  /** Callback to stop the active scan — shown as a compact button beside the scan bar */
  onStopScan?: () => void;
  /** Callback to force stop the scan (Tier 2) */
  onForceStop?: () => void;
  /** Callback to reset the scan dashboard state (Tier 3) */
  onResetScan?: () => void;
  /** Whether a stop request is in-flight */
  isStopping?: boolean;
  /** Current stop escalation stage */
  stopStage?: StopStage;
  /** Callback to re-run the scan with the same settings — shown after scan completes */
  onRescan?: () => void;
  /** Whether a rescan is currently being initiated */
  isRescanLoading?: boolean;
}

type ScanTargetLike =
  | string
  | {
      id?: string;
      ip?: string;
      value?: string;
      hostname?: string;
      sources?: string[];
    };

function getTargetDisplay(target: ScanTargetLike): string {
  if (typeof target === "string") return target;
  return target.ip ?? target.value ?? target.hostname ?? target.id ?? "[unknown]";
}

function getTargetKey(target: ScanTargetLike, index: number): string {
  if (typeof target === "string") return target;
  return target.id ?? target.ip ?? target.value ?? target.hostname ?? `target-${index}`;
}

export const ScanStatus: React.FC<ScanStatusProps> = ({
  results,
  onStopScan,
  onForceStop,
  onResetScan,
  isStopping = false,
  stopStage = "idle",
  onRescan,
  isRescanLoading = false,
}) => {
  const normalizedTargets = useMemo(() => {
    return (results?.targets ?? []) as ScanTargetLike[];
  }, [results?.targets]);

  // Count vulnerabilities by severity (normalized to lowercase canonical keys)
  const severityCounts = results?.vulnerabilities?.reduce<
    Record<string, number>
  >((acc, vuln) => {
    const normalized = normalizeSeverity(vuln.severity);
    acc[normalized] = (acc[normalized] ?? 0) + 1;
    return acc;
  }, {});

  /** Render the compact stop/escalation button(s) next to the scan bar */
  const renderStopActions = () => {
    const isActive = results?.status === "running" || results?.status === "cancelling";
    if (!isActive) return null;

    // Tier 2: Force Stop
    if (
      (stopStage === "force_available" || stopStage === "force_stopping") &&
      onForceStop
    ) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={onForceStop}
            disabled={stopStage === "force_stopping"}
            title={stopStage === "force_stopping" ? "Force Stopping..." : "Force Stop"}
            className="group relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-red-700/30 px-3 text-red-300 transition-colors hover:bg-red-700/50 hover:text-red-200 disabled:opacity-50"
          >
            {stopStage === "force_stopping" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            <span className="text-xs font-medium">
              {stopStage === "force_stopping" ? "Forcing..." : "Force Stop"}
            </span>
          </button>
          {/* Also show reset as a secondary option */}
          {onResetScan && (
            <button
              onClick={onResetScan}
              title="Reset Dashboard"
              className="text-[10px] text-amber-400/70 underline underline-offset-2 hover:text-amber-300"
            >
              Reset
            </button>
          )}
        </div>
      );
    }

    // Tier 3: Reset Dashboard
    if (stopStage === "reset_available" && onResetScan) {
      return (
        <button
          onClick={onResetScan}
          disabled={isStopping}
          title="Reset Dashboard"
          className="group relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-amber-600/20 px-3 text-amber-400 transition-colors hover:bg-amber-600/40 hover:text-amber-300 disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">Reset</span>
        </button>
      );
    }

    // Tier 1: Graceful Stop (default)
    if (onStopScan) {
      return (
        <button
          onClick={onStopScan}
          disabled={isStopping || results?.status === "cancelling"}
          title={isStopping || results?.status === "cancelling" ? "Stopping..." : "Stop Scan"}
          className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/20 text-red-400 transition-colors hover:bg-red-600/40 hover:text-red-300 disabled:animate-none disabled:opacity-50 animate-[stop-pulse_2s_ease-in-out_infinite]"
        >
          {isStopping || results?.status === "cancelling" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-3.5 w-3.5 fill-current" />
          )}
          <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-gray-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {isStopping || results?.status === "cancelling" ? "Stopping..." : "Stop Scan"}
          </span>
        </button>
      );
    }

    return null;
  };

  return (
    <div className="">
      <div className="flex items-center gap-6">
        <div className="shrink-0">
          <VulnerabilitySeverityCards
            counts={{
              critical: severityCounts?.critical ?? 0,
              high: severityCounts?.high ?? 0,
              medium: severityCounts?.medium ?? 0,
              low: severityCounts?.low ?? 0,
              informational: severityCounts?.info ?? 0,
            }}
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="w-[320px]">
            <ScanBar
              isScanning={results?.status === "running"}
              hasRun={results?.status === "completed"}
              isCancelling={results?.status === "cancelling"}
              wasCancelled={results?.status === "cancelled"}
            />
          </div>
          {renderStopActions()}
          {(results?.status === "completed" || results?.status === "cancelled") && onRescan && (
            <button
              onClick={onRescan}
              disabled={isRescanLoading}
              title="Rescan"
              className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 transition-colors hover:bg-violet-600/40 hover:text-violet-300 disabled:opacity-50"
            >
              {isRescanLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-3.5 w-3.5" />
              )}
              <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-gray-200 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                Rescan
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-6 rounded-lg border border-violet-500/10 bg-gray-900/30 p-4">
        <div className="flex flex-col border-r border-violet-500/20 pr-6">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400">Hosts</div>
          <div className="mt-1 text-4xl font-semibold tabular-nums text-white">
            {results?.hosts?.length ?? 0}
          </div>
        </div>
        <div className="flex flex-col border-r border-violet-500/20 pr-6">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Vulnerabilities
          </div>
          <div className="mt-1 text-4xl font-semibold tabular-nums text-white">
            {results?.vulnerabilities?.length ?? 0}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-400">Time</div>
          <div className="mt-1 text-sm text-gray-300">
            Start: {new Date(results?.start_time).toLocaleString()}
          </div>
          {results?.end_time && (
            <div className="text-sm text-gray-300">
              Latest: {new Date(results?.end_time).toLocaleString()}
            </div>
          )}
        </div>
        <div className="flex flex-col border-l border-violet-500/20 pl-6">
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">Targets</div>
          <div className="flex flex-wrap gap-2">
            {normalizedTargets.map((target, index) => (
              <div
                key={getTargetKey(target, index)}
                className="rounded-md bg-violet-500/10 px-2.5 py-1 font-mono text-sm text-violet-300"
              >
                {getTargetDisplay(target)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modular sub-scan indicators */}
      {results?.sub_scans && Object.keys(results.sub_scans).length > 0 && (
        <div className="mt-3 flex items-center gap-4 border-t border-violet-500/10 px-4 pt-3">
          {Object.entries(results.sub_scans).map(([key, subScan]: [string, SubScan]) => {
            const config = SCANNER_CONFIG[key] ?? {
              ...DEFAULT_SCANNER_CONFIG,
              label: `${key.charAt(0).toUpperCase() + key.slice(1)} Scan`,
            };
            const IconComponent = config.icon;
            return (
              <div
                key={key}
                className={`flex items-center gap-2 rounded-lg ${config.bg} px-3 py-1.5`}
              >
                <IconComponent className={`h-3.5 w-3.5 ${config.text}`} />
                <span className={`text-xs font-medium ${config.text}`}>
                  {config.label}
                </span>
                {(() => {
                  const scanDone = results?.status === "cancelled" || results?.status === "completed";
                  const subActive = subScan.status === "running" || subScan.status === "dispatching";
                  if (subScan.status === "completed") {
                    return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
                  }
                  if (subScan.status === "failed") {
                    return <AlertCircle className="h-3 w-3 text-red-400" />;
                  }
                  if (subActive && !scanDone) {
                    return <Loader2 className={`h-3 w-3 animate-spin ${config.text}`} />;
                  }
                  if (subActive && scanDone) {
                    // Sub-scan was still running when the scan was stopped
                    return <AlertCircle className="h-3 w-3 text-orange-400" />;
                  }
                  return null;
                })()}
                {(subScan.progress.total > 0 || subScan.progress.completed > 0) && (
                  <span className={`text-[10px] ${config.text} opacity-70`}>
                    {subScan.progress.completed}/{subScan.progress.total}{" "}
                    {subScan.progress.label ?? key}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

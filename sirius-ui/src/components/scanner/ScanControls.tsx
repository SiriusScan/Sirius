import React from "react";
import { Button } from "~/components/lib/ui/button";
import ProfileSelector from "~/components/scanner/ProfileSelector";
import ChipTargetInput from "~/components/scanner/target-patterns/ChipTargetInput";
import { Play, Square, AlertTriangle, Download, ExternalLink, Zap, RotateCcw } from "lucide-react";
import type { ParsedTarget } from "~/utils/targetParser";
import type { ScanProfile, ScanResult, AgentScanConfig } from "~/types/scanTypes";
import type { StopStage } from "~/hooks/useStopScan";

export interface ScanControlsProps {
  /** Initial targets for the chip input (e.g. from URL). */
  initialTargets: ParsedTarget[];
  /** Called when the user changes targets in the chip input. */
  onTargetsChange: (targets: ParsedTarget[]) => void;
  /** Currently selected scan profile. */
  selectedProfile: ScanProfile;
  /** Called when the user selects a different profile. */
  onProfileChange: (profile: ScanProfile) => void;
  /** Start scan handler. */
  handleScan: () => void | Promise<void>;
  /** Graceful stop scan handler (Tier 1). */
  handleStopScan: () => void;
  /** Force stop scan handler (Tier 2). */
  handleForceStop?: () => void;
  /** Reset scan state handler (Tier 3). */
  handleResetScan?: () => void;
  /** True while a scan is starting/running. */
  isLoading: boolean;
  /** True while a stop request is in progress. */
  isStopping: boolean;
  /** Current stop escalation stage. */
  stopStage?: StopStage;
  /** Current scan result (for status and active state). */
  scanResult: ScanResult | null;
  /** Error message from a failed stop request. */
  stopError: string | null;
  /** Parsed targets (for Start button disabled when empty and not agent-only). */
  parsedTargets: ParsedTarget[];
  /** Whether the current profile has agent scanning enabled. */
  isProfileAgentEnabled?: boolean;
  /** Whether the profile is agent-only (no network targets required). */
  isProfileAgentOnly: (profile: ScanProfile) => boolean;
  /** Advanced agent scan config (optional, for future use). */
  advancedAgentConfig?: AgentScanConfig | undefined;
  /** Setter for advanced agent config (optional). */
  setAdvancedAgentConfig?: (config: AgentScanConfig | undefined) => void;
}

export function ScanControls({
  initialTargets,
  onTargetsChange,
  selectedProfile,
  onProfileChange,
  handleScan,
  handleStopScan,
  handleForceStop,
  handleResetScan,
  isLoading,
  isStopping,
  stopStage = "idle",
  scanResult,
  stopError,
  parsedTargets,
  isProfileAgentOnly,
}: ScanControlsProps) {
  const isScanActive =
    scanResult?.status === "running" || scanResult?.status === "cancelling";

  /** Render the appropriate stop/escalation button based on stopStage */
  const renderStopButton = () => {
    // Tier 2: Force Stop available
    if (
      (stopStage === "force_available" || stopStage === "force_stopping") &&
      handleForceStop
    ) {
      return (
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleForceStop}
            disabled={stopStage === "force_stopping"}
            className="h-12 bg-gradient-to-r from-red-700 to-red-900 px-8 text-base font-semibold text-white shadow-lg shadow-red-900/30 hover:from-red-600 hover:to-red-800 disabled:opacity-50"
          >
            <Zap className="mr-2 h-5 w-5" />
            {stopStage === "force_stopping" ? "Force Stopping..." : "Force Stop"}
          </Button>
          <p className="text-center text-xs text-amber-400/80">
            Graceful stop timed out. Force stop will kill processes immediately.
          </p>
        </div>
      );
    }

    // Tier 3: Reset Dashboard available
    if (stopStage === "reset_available" && handleResetScan) {
      return (
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleResetScan}
            disabled={isStopping}
            className="h-12 bg-gradient-to-r from-amber-600 to-orange-600 px-8 text-base font-semibold text-white shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset Dashboard
          </Button>
          <p className="text-center text-xs text-amber-400/80">
            Force stop failed. Reset will clear the dashboard state.
          </p>
        </div>
      );
    }

    // Tier 1: Graceful Stop (default)
    return (
      <Button
        onClick={handleStopScan}
        disabled={
          isStopping || scanResult?.status === "cancelling"
        }
        className="h-12 bg-gradient-to-r from-red-600 to-rose-600 px-8 text-base font-semibold text-white shadow-lg hover:from-red-500 hover:to-rose-500 disabled:opacity-50"
      >
        <Square className="mr-2 h-5 w-5 fill-current" />
        {isStopping || scanResult?.status === "cancelling"
          ? "Stopping..."
          : "Stop Scan"}
      </Button>
    );
  };

  return (
    <>
      {/* Consolidated Controls - Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Scan Targets */}
        <div>
          <label className="mb-2 block text-sm font-medium text-violet-200">
            Scan Targets
          </label>
          <ChipTargetInput
            onTargetsChange={onTargetsChange}
            initialTargets={initialTargets}
          />
        </div>

        {/* Right: Profile + Start/Stop Button */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-violet-200">
              Scan Profile
            </label>
            <ProfileSelector value={selectedProfile} onChange={onProfileChange} />
          </div>
          {isScanActive ? (
            renderStopButton()
          ) : (
            <Button
              onClick={handleScan}
              disabled={
                isLoading ||
                (parsedTargets.length === 0 &&
                  !isProfileAgentOnly(selectedProfile))
              }
              className="h-12 bg-gradient-to-r from-violet-600 to-purple-600 px-8 text-base font-semibold text-white shadow-lg hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
            >
              <Play className="mr-2 h-5 w-5 fill-current" />
              {isLoading ? "Scanning..." : "Start Scan"}
            </Button>
          )}
        </div>
      </div>

      {/* Stop Scan Error Display */}
      {stopError && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Failed to stop scan: {stopError}
              </span>
            </div>
            {/* Show Reset button inline when there's a stop error */}
            {handleResetScan && (
              <button
                onClick={handleResetScan}
                className="text-xs text-amber-400 underline underline-offset-2 hover:text-amber-300"
              >
                Reset Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {/* Agent Download Banner */}
      <div className="mt-6 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
              <Download className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-violet-200">
                Need the Sirius Agent?
              </h3>
              <p className="text-xs text-gray-400">
                Download from GitHub to enable remote scanning capabilities
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(
                "https://github.com/SiriusScan/app-agent/releases",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="border-violet-500/30 bg-violet-500/5 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
          >
            <ExternalLink className="mr-2 h-3.5 w-3.5" />
            Get Agent
          </Button>
        </div>
      </div>
    </>
  );
}

import React from "react";
import Link from "next/link";
import { AlertCircle, Download, ExternalLink, Play, SlidersHorizontal, X } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import ProfileSelector from "~/components/scanner/ProfileSelector";
import ChipTargetInput from "~/components/scanner/target-patterns/ChipTargetInput";
import { ScanSection } from "~/components/scanner/shared/ScanSection";
import { isScanActive } from "~/components/shared/scanSummary";
import type { ParsedTarget } from "~/utils/targetParser";
import type { ScanProfile, ScanResult } from "~/types/scanTypes";

/** Scan configuration lives in Settings › Scanning (ADR-7). */
export const MANAGE_PROFILES_HREF = "/settings?tab=scanning";

export interface ScanControlsProps {
  /** Targets the chip input starts with (from ?target= or "Scan again"). */
  initialTargets: ParsedTarget[];
  /** Called when the user changes targets in the chip input. */
  onTargetsChange: (targets: ParsedTarget[]) => void;
  /** Currently selected scan profile. */
  selectedProfile: ScanProfile;
  /** Called when the user selects a different profile. */
  onProfileChange: (profile: ScanProfile) => void;
  /** Start scan handler. */
  handleScan: () => void | Promise<void>;
  /** True while a scan is starting. */
  isLoading: boolean;
  /** Current scan result (Start is disabled while a scan runs). */
  scanResult: ScanResult | null;
  /** Parsed targets (Start is disabled when empty, unless the profile is agent-only). */
  parsedTargets: ParsedTarget[];
  /** Whether the profile is agent-only (no network targets required). */
  isProfileAgentOnly: (profile: ScanProfile) => boolean;
  /** Why the last start failed, if it did. */
  error?: string | null;
  /** Hides the form; offered when a finished scan's results are shown. */
  onClose?: () => void;
}

/**
 * The scan form: targets, a profile (with a link to manage profiles in
 * Settings) and Start. The Scanner shows it only when no scan is running;
 * Stop lives beside the running scan's progress.
 */
export function ScanControls({
  initialTargets,
  onTargetsChange,
  selectedProfile,
  onProfileChange,
  handleScan,
  isLoading,
  scanResult,
  parsedTargets,
  isProfileAgentOnly,
  error,
  onClose,
}: ScanControlsProps) {
  // Pending (admitted, waiting for the worker), running or stopping.
  const scanActive = isScanActive(scanResult?.status);
  const agentOnly = isProfileAgentOnly(selectedProfile);
  const needsTargets = parsedTargets.length === 0 && !agentOnly;

  return (
    <ScanSection
      icon={Play}
      title="New scan"
      primary
      aside={
        onClose ? (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Close
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* ChipTargetInput carries its own "Scan Targets" heading. */}
        <div>
          <ChipTargetInput onTargetsChange={onTargetsChange} initialTargets={initialTargets} />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-violet-200">Profile</span>
              <Link
                href={MANAGE_PROFILES_HREF}
                className="inline-flex items-center gap-1 rounded text-xs text-violet-400 hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                <SlidersHorizontal className="h-3 w-3" aria-hidden />
                Manage profiles
              </Link>
            </div>
            <ProfileSelector value={selectedProfile} onChange={onProfileChange} />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => void handleScan()}
              disabled={isLoading || scanActive || needsTargets}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 disabled:pointer-events-none disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden />
              {isLoading ? "Starting…" : "Start scan"}
            </button>
            {needsTargets && !error && (
              <p className="text-xs text-gray-500">Add at least one target to start.</p>
            )}
            {error && (
              <p role="alert" className="flex items-start gap-1.5 text-xs text-red-300">
                <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                Couldn’t start the scan: {error}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-violet-500/15 bg-violet-500/5 p-3">
            <Download className="h-4 w-4 shrink-0 text-violet-400" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-violet-200">Need the Sirius agent?</div>
              <p className="text-[11px] text-gray-400">Download it for your platform to enable agent scans.</p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 text-xs">
              <a
                href="https://sirius.opensecurity.com/get-started/downloads"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1.5 h-3 w-3" aria-hidden />
                Get the agent
              </a>
            </Button>
          </div>
        </div>
      </div>
    </ScanSection>
  );
}

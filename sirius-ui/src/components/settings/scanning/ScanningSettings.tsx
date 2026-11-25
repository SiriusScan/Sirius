/**
 * Settings › Scanning (R10, ADR-7): scan profiles, the script and template
 * library, repositories and agent scanning, moved here from Scanner ›
 * Advanced so the Scanner is only for running and watching scans.
 * Opened by /settings?tab=scanning; the Scanner's "Manage profiles" links here.
 */

import React from "react";
import { AgentScanningSection } from "./AgentScanningSection";
import { RepositoriesSection } from "./RepositoriesSection";
import { ScanProfilesSection } from "./ScanProfilesSection";
import { ScriptLibrarySection } from "./ScriptLibrarySection";

export const SCANNING_SETTINGS_HREF = "/settings?tab=scanning";

export function ScanningSettings() {
  return (
    <div className="space-y-4">
      <ScanProfilesSection />
      <ScriptLibrarySection />
      <RepositoriesSection />
      <AgentScanningSection />
    </div>
  );
}

export default ScanningSettings;

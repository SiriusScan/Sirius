// In src/components/scanner/Scanner.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { ScanStatus } from "~/components/scanner/ScanStatus";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";

import {
  type VulnerabilityTableData,
  type AgentScanConfig,
} from "~/types/scanTypes";
import {
  generateVulnerabilityReportHtml,
  openReportInNewWindow,
} from "~/utils/reportGenerator";
import { useScanResults } from "~/hooks/useScanResults";
import { useScanDataMapping } from "~/hooks/useScanDataMapping";
import { useScanOrchestration } from "~/hooks/useScanOrchestration";
import { Button } from "~/components/lib/ui/button";
import { type ScanProfile } from "~/types/scanTypes";
import ProfileManager from "~/components/scanner/profile/ProfileManager";
import AdvancedView from "~/components/scanner/AdvancedView";
import { VulnerabilityTable } from "~/components/VulnerabilityTable";
import { scannerVulnerabilityColumns } from "~/components/ScannerVulnerabilityColumns";
import ScanIcon from "~/components/icons/ScanIcon";
import {
  Play,
  Server,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "~/components/lib/utils";
import { scanHostColumns } from "~/components/scanner/ScanHostColumns";
import { ScanNavigator } from "~/components/scanner/ScanNavigator";
import { ScanControls } from "~/components/scanner/ScanControls";

const ScannerContent: React.FC = () => {
  const router = useRouter();
  const [activeView, setActiveView] = useState("scan");
  const [activeTable, setActiveTable] = useState<"host-table" | "vuln-table">(
    "host-table"
  );
  const [targets, setTargets] = useState<string[]>([]);
  const [parsedTargets, setParsedTargets] = useState<ParsedTarget[]>([]);
  const [displayScanDetails, setDisplayScanDetails] = useState(true);
  const scanResults = useScanResults();
  const { hostList, vulnerabilityList } = useScanDataMapping();
  const [selectedProfile, setSelectedProfileState] = useState<ScanProfile>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("scanner.selectedProfile") ?? "high-risk";
    }
    return "high-risk";
  });
  const setSelectedProfile = useCallback((profile: ScanProfile) => {
    setSelectedProfileState(profile);
    if (typeof window !== "undefined") {
      localStorage.setItem("scanner.selectedProfile", profile);
    }
  }, []);
  const [advancedAgentConfig, setAdvancedAgentConfig] = useState<
    AgentScanConfig | undefined
  >(undefined);
  // Vulnerability selection state - reserved for future export/action features
  const [, setSelectedVulnerabilities] = useState<string[]>([]);

  const scanOrchestration = useScanOrchestration({
    parsedTargets,
    targets,
    selectedProfile,
    advancedAgentConfig,
    scanId: scanResults.scanResult?.id,
    previousScanTargets: scanResults.scanResult?.targets,
  });
  const {
    handleScan: orchestrationHandleScan,
    handleStopScan,
    handleForceStop,
    handleResetScan,
    isProfileAgentEnabled,
    isProfileAgentOnly,
    isLoading,
    isStopping,
    stopStage,
    error,
    stopError,
    handleScanStatusChange,
  } = scanOrchestration;

  // Notify the stop hook when scan status changes (for auto-reset of stop stage)
  useEffect(() => {
    handleScanStatusChange(scanResults.scanResult?.status);
  }, [scanResults.scanResult?.status, handleScanStatusChange]);

  // Parse initial targets from URL query parameters
  const initialTargetsFromUrl = useMemo((): ParsedTarget[] => {
    if (!router.isReady) return [];
    const targetParam = router.query.target;
    if (!targetParam) return [];
    const targetValue = Array.isArray(targetParam) ? targetParam[0] : targetParam;
    if (!targetValue) return [];
    return parseTargets(targetValue);
  }, [router.isReady, router.query.target]);

  // Collapsible controls state
  const [controlsCollapsed, setControlsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("scanner.controlsCollapsed");
      return stored ? stored === "true" : false;
    }
    return false;
  });

  // Force-expand controls when arriving with a ?target= param so the
  // pre-filled target is immediately visible to the operator.
  useEffect(() => {
    if (router.isReady && router.query.target) {
      setControlsCollapsed(false);
    }
  }, [router.isReady, router.query.target]);
  // Simplified source info for scanner (disabled for now)
  // const [showSourceInfo, setShowSourceInfo] = useState(false);
  // const [sourceFilters, setSourceFilters] = useState<SourceFilterState>({
  //   sources: [],
  //   confidence: [],
  //   dateRange: {},
  //   searchTerm: "",
  // });

  // Handle report generation — delegates to reportGenerator utility
  const handleGenerateReport = (selectedVulns: VulnerabilityTableData[]) => {
    const data = selectedVulns.map((v) => ({
      cve: v.cve,
      severity: v.severity,
      description: v.description,
      cvss: v.cvss,
      count: v.count,
    }));
    const options = {
      title: "Sirius Scan Vulnerability Report",
      scanProfile:
        selectedProfile.charAt(0).toUpperCase() + selectedProfile.slice(1),
      targetsCount: targets.length,
      hostsAffected: scanResults.hosts.length,
      targetsList: targets.join(", ") || "None",
      scanDate: new Date().toLocaleDateString(),
    };
    const html = generateVulnerabilityReportHtml(data, options);
    openReportInNewWindow(html);
  };

  // Source filtering disabled for scanner interface simplicity
  // const { filteredData: filteredVulnerabilities } = useSourceFiltering(
  //   showSourceInfo ? (vulnerabilityList as any) : [],
  //   sourceFilters
  // );

  const handleTargetsChange = useCallback(
    (targets: import("~/utils/targetParser").ParsedTarget[]) => {
      setParsedTargets(targets);
      // Also update the local targets state for report generation
      setTargets(targets.map((t) => t.value));
    },
    []
  );

  /** Wraps orchestration handleScan with UI side effects (collapse controls). Tables clear via useScanDataMapping when scan result is cleared. */
  const handleScan = useCallback(async () => {
    setControlsCollapsed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("scanner.controlsCollapsed", "true");
      localStorage.setItem("scanner.selectedProfile", selectedProfile);
    }
    await orchestrationHandleScan();
  }, [orchestrationHandleScan, selectedProfile]);

  // Persist collapsed state
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "scanner.controlsCollapsed",
        String(controlsCollapsed)
      );
    }
  }, [controlsCollapsed]);

  // Auto-collapse when scan is running
  useEffect(() => {
    if (isLoading && !controlsCollapsed) {
      setControlsCollapsed(true);
    }
  }, [isLoading, controlsCollapsed]);

  const handleViewChange = useCallback((newView: string) => {
    setActiveView(newView);
  }, []);


  return (
    <div className="relative z-20 -mt-14 space-y-6">
      {/* Compact Page Header */}
      <div className="sticky top-2 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
            <ScanIcon
              width="24px"
              height="24px"
              fill="currentColor"
              className="text-violet-400"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Scan Dashboard
          </h1>
        </div>
      </div>

      {/* Navigation Tabs with Show Controls Button */}
      <div className="-mx-4 flex items-center justify-between px-4 md:-mx-6 md:px-6">
        <ScanNavigator
          view={activeView}
          handleViewNavigator={handleViewChange}
        />
        {/* Show Controls Button - Aligned with tabs */}
        {activeView === "scan" &&
          scanResults.scanResult &&
          controlsCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setControlsCollapsed(false)}
              className="border-violet-500/20 bg-violet-500/5 text-violet-300 duration-200 animate-in fade-in-50 hover:bg-violet-500/10"
            >
              <ChevronDown className="mr-2 h-4 w-4" />
              Show Controls
            </Button>
          )}
      </div>

      <div className="space-y-6">
        {activeView === "scan" && (
          <>
            {(!controlsCollapsed || !scanResults.scanResult) && (
              <div
                className={cn(
                  "scanner-section-primary scanner-section-padding space-y-4 overflow-hidden transition-all duration-300 ease-in-out",
                  controlsCollapsed && scanResults.scanResult
                    ? "-mt-6 mb-0 max-h-0 py-0 opacity-0"
                    : "max-h-[800px] opacity-100 animate-in fade-in-50 slide-in-from-top-2"
                )}
              >
                {/* Collapsible Header - Only show when scan results exist */}
                {scanResults.scanResult && (
                  <button
                    onClick={() => {
                      setControlsCollapsed(true);
                      if (typeof window !== "undefined") {
                        localStorage.setItem(
                          "scanner.controlsCollapsed",
                          "true"
                        );
                      }
                    }}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <h2 className="text-lg font-semibold text-violet-300">
                      Scan Controls
                    </h2>
                    <ChevronUp className="h-4 w-4 text-violet-400" />
                  </button>
                )}
                {!scanResults.scanResult && (
                  <h2 className="text-lg font-semibold text-violet-300">
                    Scan Controls
                  </h2>
                )}

                <ScanControls
                  initialTargets={initialTargetsFromUrl}
                  onTargetsChange={handleTargetsChange}
                  selectedProfile={selectedProfile}
                  onProfileChange={setSelectedProfile}
                  handleScan={handleScan}
                  handleStopScan={handleStopScan}
                  handleForceStop={handleForceStop}
                  handleResetScan={handleResetScan}
                  isLoading={isLoading}
                  isStopping={isStopping}
                  stopStage={stopStage}
                  scanResult={scanResults.scanResult ?? null}
                  stopError={stopError ?? null}
                  parsedTargets={parsedTargets}
                  isProfileAgentEnabled={isProfileAgentEnabled}
                  isProfileAgentOnly={isProfileAgentOnly}
                  advancedAgentConfig={advancedAgentConfig}
                  setAdvancedAgentConfig={setAdvancedAgentConfig}
                />
              </div>
            )}

            {/* Results Section */}
            {scanResults.scanResult ? (
              <div className="scanner-section scanner-section-padding scanner-section-hover min-h-[400px]">
                <ScanStatus
                  results={scanResults.scanResult}
                  onStopScan={handleStopScan}
                  onForceStop={handleForceStop}
                  onResetScan={handleResetScan}
                  isStopping={isStopping}
                  stopStage={stopStage}
                  onRescan={handleScan}
                  isRescanLoading={isLoading}
                />

                <div className="scanner-divider"></div>

                {/* Enhanced Tab Navigation with Collapse Toggle */}
                <div className="mb-4 flex items-center justify-between border-b border-violet-500/20">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveTable("host-table");
                        setDisplayScanDetails(true);
                      }}
                      className={cn(
                        "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                        activeTable === "host-table"
                          ? "border-violet-500 text-violet-300"
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      )}
                    >
                      <Server className="h-4 w-4" />
                      Hosts
                      {hostList.length > 0 && (
                        <span className="ml-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs">
                          {hostList.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setActiveTable("vuln-table");
                        setDisplayScanDetails(true);
                      }}
                      className={cn(
                        "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                        activeTable === "vuln-table"
                          ? "border-violet-500 text-violet-300"
                          : "border-transparent text-gray-400 hover:text-gray-200"
                      )}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Vulnerabilities
                      {vulnerabilityList.length > 0 && (
                        <span className="ml-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-300">
                          {vulnerabilityList.length}
                        </span>
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setDisplayScanDetails(!displayScanDetails)}
                    className="flex items-center gap-2 text-sm text-violet-300 hover:text-violet-200"
                  >
                    {displayScanDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show Details
                      </>
                    )}
                  </button>
                </div>

                {displayScanDetails && (
                  <div className="duration-300 animate-in fade-in-50">
                    {activeTable === "host-table" && (
                      <div className="scanner-table-wrapper mt-4">
                        <EnvironmentDataTable
                          columns={scanHostColumns}
                          data={hostList as any}
                        />
                      </div>
                    )}
                    {activeTable === "vuln-table" && (
                      <div className="scanner-table-wrapper mt-4">
                        <VulnerabilityTable
                          columns={scannerVulnerabilityColumns}
                          data={vulnerabilityList}
                          onSelectionChange={(selected) => {
                            setSelectedVulnerabilities(
                              selected.map((v) => v.cve)
                            );
                          }}
                          onGenerateReport={handleGenerateReport}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="scanner-section scanner-section-hover flex min-h-[400px] flex-col items-center justify-center p-12 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/20">
                  <Server className="h-10 w-10 text-violet-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">
                  No Scan Results Yet
                </h3>
                <p className="mb-6 text-sm text-gray-400">
                  Configure your targets and profile above, then click "Start
                  Scan" to begin vulnerability scanning.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Add targets
                  </div>
                  <span className="hidden md:inline">→</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Select profile
                  </div>
                  <span className="hidden md:inline">→</span>
                  <div className="flex items-center gap-1">
                    <Play className="h-3 w-3" />
                    Start scan
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        {activeView === "profiles" && (
          <div className="scanner-section scanner-section-padding scanner-section-hover">
            <ProfileManager />
          </div>
        )}
        {activeView === "advanced" && (
          <div className="scanner-section scanner-section-padding scanner-section-hover">
            <AdvancedView onAgentConfigChange={setAdvancedAgentConfig} />
          </div>
        )}
      </div>
    </div>
  );
};

const Scanner: React.FC = () => {
  return (
    <Layout title="Scanner">
      <ScannerContent />
    </Layout>
  );
};

export default Scanner;

/**
 * Scanner (R03, ADR-7): for running and watching scans only. Profiles,
 * scripts, templates and agent settings live in Settings › Scanning.
 *
 * - No scan yet: the form.
 * - A scan running: the running scan (one Stop beside its progress) replaces
 *   the form, followed by this scan's findings, the hosts it found and its
 *   findings table. The backend runs one scan at a time, so there is no
 *   queue; the form comes back when the scan ends.
 * - A scan ended: the same layout reads "Scan completed"; "New scan" opens
 *   the form.
 *
 * Numbers here are this scan's only (ADR-2); inventory totals live on the
 * Dashboard, whose summary is refreshed when a scan ends.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { RotateCw, SlidersHorizontal } from "lucide-react";
import Layout from "~/components/Layout";
import ScanIcon from "~/components/icons/ScanIcon";
import { Button } from "~/components/lib/ui/button";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { EmptyState } from "~/components/shared/EmptyState";
import { HeaderChip, PageHeader } from "~/components/shared/PageHeader";
import { isScanActive } from "~/components/shared/scanSummary";
import { useSeverityParam } from "~/components/shared/useSeverityParam";
import { MANAGE_PROFILES_HREF, ScanControls } from "~/components/scanner/ScanControls";
import { ScanFindingsSummary, ScanFindingsTable } from "~/components/scanner/shared/ScanFindings";
import { ScanHostsFound } from "~/components/scanner/shared/ScanHostsFound";
import { ScanRunCard } from "~/components/scanner/shared/ScanRunCard";
import {
  aggregateScanFindings,
  isScanEnded,
  profileInfo,
  scanProfileId,
  scanSeverityCounts,
  scanTargetLabels,
} from "~/components/scanner/shared/scanRunModel";
import { useScanDataMapping } from "~/hooks/useScanDataMapping";
import { useAgentScanSettings } from "~/components/settings/scanning/useAgentScanSettings";
import { useScanOrchestration } from "~/hooks/useScanOrchestration";
import { useScanResults } from "~/hooks/useScanResults";
import { invalidateSummary } from "~/hooks/useSummaryStats";
import type { HostFreshnessEntry } from "~/types/riskSummary";
import type { ScanProfile } from "~/types/scanTypes";
import { api } from "~/utils/api";
import { formatDateTime } from "~/utils/formatDateTime";
import { generateVulnerabilityReportHtml, openReportInNewWindow } from "~/utils/reportGenerator";
import { compareRisk } from "~/utils/risk";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";

const PROFILE_STORAGE_KEY = "scanner.selectedProfile";
const DEFAULT_PROFILE: ScanProfile = "high-risk";
/** host.getHostFreshness takes at most 50 IPs. */
const MAX_FRESHNESS_IPS = 50;

function readStoredProfile(): ScanProfile | null {
  try {
    return window.localStorage.getItem(PROFILE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeProfile(profile: ScanProfile): void {
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, profile);
  } catch {
    // Remembering the profile is a convenience; the scan still starts.
  }
}

function firstParam(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() ? v : undefined;
}

const ScannerContent: React.FC = () => {
  const router = useRouter();
  const utils = api.useContext();
  const { scanResult: scan, scanStatusQuery } = useScanResults();
  const { hostList, vulnerabilityList } = useScanDataMapping();
  const [severities, , toggleSeverity] = useSeverityParam();
  const { data: profiles } = api.templates.getTemplates.useQuery();

  const status = scan?.status;
  const scanActive = isScanActive(status);

  // The profile picked in the form, remembered per browser.
  const [selectedProfile, setSelectedProfileState] = useState<ScanProfile>(DEFAULT_PROFILE);
  useEffect(() => {
    const stored = readStoredProfile();
    if (stored) setSelectedProfileState(stored);
  }, []);
  const setSelectedProfile = useCallback((profile: ScanProfile) => {
    setSelectedProfileState(profile);
    storeProfile(profile);
  }, []);

  // The form: shown when there is no scan, or on request once a scan has
  // ended. A new seed (from ?target= or "Scan again") remounts it.
  const [parsedTargets, setParsedTargets] = useState<ParsedTarget[]>([]);
  const [formRequested, setFormRequested] = useState(false);
  const [formSeed, setFormSeed] = useState<{ key: number; targets: ParsedTarget[] }>({
    key: 0,
    targets: [],
  });
  const openForm = useCallback((targets?: ParsedTarget[]) => {
    if (targets) setFormSeed((s) => ({ key: s.key + 1, targets }));
    setFormRequested(true);
  }, []);

  // ?target=a,b pre-fills the form (rescan links). While a scan runs the
  // form waits for it to end.
  const urlTarget = router.isReady ? firstParam(router.query.target) : undefined;
  useEffect(() => {
    if (!urlTarget) return;
    const targets = parseTargets(urlTarget);
    if (targets.length > 0) openForm(targets);
  }, [urlTarget, openForm]);

  const { scanConfig: agentScanConfig } = useAgentScanSettings();
  const {
    handleScan: startScan,
    handleStopScan,
    handleForceStop,
    handleResetScan,
    isProfileAgentOnly,
    isLoading,
    isStopping,
    stopStage,
    error: startError,
    unconfirmedScanId,
    stopError,
    handleScanStatusChange,
  } = useScanOrchestration({
    parsedTargets,
    targets: parsedTargets.map((t) => t.value),
    selectedProfile,
    // Agent scanning defaults from Settings › Scanning (used only when
    // enabled there); a profile's own agent settings still take precedence.
    advancedAgentConfig: agentScanConfig,
    scanId: scan?.id,
  });

  // Reset the stop escalation once the scan is no longer running.
  useEffect(() => {
    handleScanStatusChange(status);
  }, [status, handleScanStatusChange]);

  // Close the form once the scan it started is running.
  const startedFromForm = useRef(false);
  const handleScan = useCallback(async () => {
    startedFromForm.current = true;
    storeProfile(selectedProfile);
    await startScan();
  }, [startScan, selectedProfile]);
  useEffect(() => {
    if (scanActive && startedFromForm.current) {
      startedFromForm.current = false;
      setFormRequested(false);
    }
  }, [scanActive]);

  // When a scan ends, refresh the counts other pages show (ADR-2).
  const previousStatus = useRef<string | undefined>(undefined);
  useEffect(() => {
    const previous = previousStatus.current;
    previousStatus.current = status;
    if (isScanActive(previous) && isScanEnded(status)) {
      void invalidateSummary(utils);
      void utils.host.getInventoryIps.invalidate();
      void utils.host.getHostFreshness.invalidate();
    }
  }, [status, utils]);

  // "Saved to inventory <time>" for the found hosts that are in the
  // inventory, riskiest first (those are the ones shown).
  const freshnessIps = useMemo(
    () =>
      hostList
        .filter((h) => h.inInventory)
        .sort(compareRisk)
        .slice(0, MAX_FRESHNESS_IPS)
        .map((h) => h.ip)
        .sort(),
    [hostList],
  );
  const freshnessQuery = api.host.getHostFreshness.useQuery(
    { ips: freshnessIps },
    {
      enabled: freshnessIps.length > 0,
      staleTime: 30_000,
      refetchInterval: scanActive ? 30_000 : false,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );
  const freshnessByIp = useMemo(
    () => new Map<string, HostFreshnessEntry>((freshnessQuery.data ?? []).map((e) => [e.ip, e] as const)),
    [freshnessQuery.data],
  );

  // The scan's profile, only when the scan state or the scanner's source
  // config records it.
  const profile = useMemo(
    () =>
      profileInfo(
        scanProfileId(
          scan,
          (freshnessQuery.data ?? []).map((e) => e.lastScan),
        ),
        profiles,
      ),
    [scan, freshnessQuery.data, profiles],
  );

  const findingRows = useMemo(() => aggregateScanFindings(vulnerabilityList), [vulnerabilityList]);
  const findingCounts = useMemo(() => scanSeverityCounts(vulnerabilityList), [vulnerabilityList]);
  const scanTargets = useMemo(() => scanTargetLabels(scan?.targets), [scan?.targets]);

  const handleReport = useCallback(() => {
    if (!scan) return;
    const html = generateVulnerabilityReportHtml(
      findingRows.map((r) => ({
        cve: r.id,
        severity: r.severity,
        description: r.summary,
        cvss: r.cvss,
        count: r.hosts,
      })),
      {
        title: "Sirius scan report",
        ...(profile ? { scanProfile: profile.name } : {}),
        targetsCount: scanTargets.length,
        hostsAffected: hostList.filter((h) => h.findings > 0).length,
        ...(scanTargets.length > 0 ? { targetsList: scanTargets.join(", ") } : {}),
        scanDate: formatDateTime(scan.start_time, "long"),
      },
    );
    openReportInNewWindow(html);
  }, [scan, findingRows, profile, scanTargets, hostList]);

  const showForm = !scanActive && (!scan || formRequested);
  const loading = scanStatusQuery.isLoading;

  return (
    <div className="relative z-20 -mt-14 space-y-6">
      <PageHeader
        icon={<ScanIcon className="h-5 w-5 text-violet-400" fill="currentColor" />}
        title="Scanner"
        meta={
          scanActive ? (
            <HeaderChip>
              <span
                className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400 align-middle"
                aria-hidden
              />
              {status === "cancelling" ? "Stopping scan" : "1 scan running"}
            </HeaderChip>
          ) : undefined
        }
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link href={MANAGE_PROFILES_HREF} aria-label="Manage profiles" title="Manage profiles in Settings › Scanning">
              <SlidersHorizontal className="h-3.5 w-3.5 sm:mr-1.5" aria-hidden />
              <span className="hidden sm:inline">Manage profiles</span>
            </Link>
          </Button>
        }
      />

      {loading ? (
        <div className="scanner-section scanner-section-padding space-y-4" aria-busy="true">
          <Skeleton className="h-4 w-40 bg-gray-800" />
          <Skeleton className="h-6 w-2/3 bg-gray-800" />
          <Skeleton className="h-2 w-full bg-gray-800" />
        </div>
      ) : (
        <>
          {scanStatusQuery.isError && !scan && (
            <EmptyState
              variant="error"
              size="compact"
              title="Couldn’t load the current scan"
              reason="Sirius couldn’t read the scanner state. You can still start a scan."
              primary={{ label: "Retry", icon: RotateCw, onClick: () => void scanStatusQuery.refetch() }}
            />
          )}

          {/* Kept mounted while hidden, so typed targets survive a scan. */}
          <div hidden={!showForm}>
            <ScanControls
              key={formSeed.key}
              initialTargets={formSeed.targets}
              onTargetsChange={setParsedTargets}
              selectedProfile={selectedProfile}
              onProfileChange={setSelectedProfile}
              handleScan={handleScan}
              isLoading={isLoading}
              scanResult={scan}
              parsedTargets={parsedTargets}
              isProfileAgentOnly={isProfileAgentOnly}
              // An unconfirmed submission that did record its scan is shown by
              // the run card instead of an error.
              error={startError && unconfirmedScanId !== scan?.id ? startError : null}
              onClose={scan ? () => setFormRequested(false) : undefined}
            />
          </div>

          {scan ? (
            <>
              <ScanRunCard
                scan={scan}
                profile={profile}
                stopStage={stopStage}
                isStopping={isStopping}
                stopError={stopError}
                onStop={() => void handleStopScan()}
                onForceStop={() => void handleForceStop()}
                onReset={() => void handleResetScan()}
                onNewScan={showForm ? undefined : () => openForm()}
                onScanAgain={
                  showForm || scanTargets.length === 0
                    ? undefined
                    : () => openForm(parseTargets(scanTargets.join(",")))
                }
                waitingTargets={
                  scanActive && formRequested ? parsedTargets.map((t) => t.value) : undefined
                }
              />
              <ScanFindingsSummary
                counts={findingCounts}
                selected={severities}
                onSelect={toggleSeverity}
                scanActive={scanActive}
              />
              <ScanHostsFound
                hosts={hostList}
                freshnessByIp={freshnessByIp}
                scanId={scan.id}
                scanStart={scan.start_time}
                scanActive={scanActive}
              />
              <ScanFindingsTable
                rows={findingRows}
                total={vulnerabilityList.length}
                severityFilter={severities}
                scanActive={scanActive}
                onReport={handleReport}
              />
            </>
          ) : (
            !scanStatusQuery.isError && (
              <EmptyState
                variant="no-data"
                title="No scan yet"
                reason="Add targets and start a scan. Its progress, the hosts it finds and their findings show here."
              />
            )
          )}
        </>
      )}
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

// src/hooks/useScanOrchestration.ts
import { useCallback } from "react";
import { api as trpcApi } from "~/utils/api";
import { useStartScan, type TargetType } from "~/hooks/useStartScan";
import { useStopScan } from "~/hooks/useStopScan";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import type { ScanProfile, AgentScanConfig } from "~/types/scanTypes";

export interface UseScanOrchestrationParams {
  parsedTargets: ParsedTarget[];
  targets: string[];
  selectedProfile: ScanProfile;
  advancedAgentConfig: AgentScanConfig | undefined;
  /** Current scan ID (e.g. from scanResults.scanResult?.id) for stop scan */
  scanId: string | undefined;
  /** Targets from the previous/current scan result — used as fallback for rescan when controls are collapsed */
  previousScanTargets?: Array<
    | string
    | {
        id?: string;
        ip?: string;
        value?: string;
        hostname?: string;
      }
  >;
}

function normalizePreviousTarget(
  target:
    | string
    | {
        id?: string;
        ip?: string;
        value?: string;
        hostname?: string;
    }
): string {
  if (typeof target === "string") return target;
  return target.ip ?? target.value ?? target.hostname ?? target.id ?? "";
}

/**
 * Composes scan start/stop logic, profile helpers, and templates query.
 * Use this in the scanner page to keep orchestration in one place.
 */
export function useScanOrchestration({
  parsedTargets,
  targets: _targets,
  selectedProfile,
  advancedAgentConfig,
  scanId,
  previousScanTargets,
}: UseScanOrchestrationParams) {
  const { initiateScan, isLoading, error } = useStartScan();
  const {
    stopScan,
    forceStopScan,
    resetScan,
    stopStage,
    isStopping,
    error: stopError,
    handleScanStatusChange,
  } = useStopScan();
  const { data: profileData } = trpcApi.templates.getTemplates.useQuery();

  /** Detect if a profile is agent-enabled (data-driven OR id-based fallback) */
  const isProfileAgentEnabled = useCallback(
    (profileId: string) => {
      const profile = profileData?.find((p) => p.id === profileId);
      if (!profile) return false;
      if (profile.scan_options?.agent_scan?.enabled) return true;
      if (profileId === "agent-only" || profileId === "full-scan") return true;
      if ((profile.name ?? "").toLowerCase().includes("agent")) return true;
      return false;
    },
    [profileData]
  );

  /** Detect if a profile is agent-ONLY (no network scan types) */
  const isProfileAgentOnly = useCallback(
    (profileId: string) => {
      const profile = profileData?.find((p) => p.id === profileId);
      if (!profile) return false;
      const hasNetworkTypes =
        (profile.scan_options?.scan_types?.length ?? 0) > 0;
      if (
        profile.scan_options?.agent_scan?.enabled &&
        !hasNetworkTypes
      )
        return true;
      if (profileId === "agent-only") return true;
      return false;
    },
    [profileData]
  );

  const handleScan = useCallback(async () => {
    try {
      const isAgentOnlyProfile = isProfileAgentOnly(selectedProfile);

      // Use parsedTargets from the controls; fall back to previous scan targets for rescan
      let effectiveTargets = parsedTargets;
      if (
        (!effectiveTargets || effectiveTargets.length === 0) &&
        previousScanTargets &&
        previousScanTargets.length > 0
      ) {
        const normalizedPreviousTargets = previousScanTargets
          .map(normalizePreviousTarget)
          .filter((value) => value.trim().length > 0);

        effectiveTargets = parseTargets(normalizedPreviousTargets.join(", "));
      }

      if (!isAgentOnlyProfile) {
        if (!effectiveTargets || effectiveTargets.length === 0) {
          throw new Error("No targets specified");
        }
      }

      const validTargets = (effectiveTargets ?? []).filter(
        (t) => t.isValid && !t.warning?.includes("Duplicate")
      );

      if (!isAgentOnlyProfile && validTargets.length === 0) {
        console.error("No valid targets to scan");
        return;
      }

      const typeMap: Record<string, TargetType> = {
        ip: "single_ip",
        cidr: "cidr",
        range: "ip_range",
        domain: "dns_name",
      };
      const scanTargets = validTargets.map((target) => ({
        value: target.value,
        type: (typeMap[target.type] ?? "dns_name") as TargetType,
      }));

      let agentScanConfig: AgentScanConfig | undefined = undefined;

      if (advancedAgentConfig?.enabled) {
        agentScanConfig = advancedAgentConfig;
      }

      try {
        const profile = profileData?.find((p) => p.id === selectedProfile);
        if (isProfileAgentEnabled(selectedProfile)) {
          agentScanConfig = {
            enabled: true,
            mode: profile?.scan_options?.agent_scan?.mode ?? "comprehensive",
            agent_ids: profile?.scan_options?.agent_scan?.agent_ids ?? [],
            timeout: profile?.scan_options?.agent_scan?.timeout ?? 300,
            concurrency: profile?.scan_options?.agent_scan?.concurrency ?? 5,
            template_filter: profile?.scan_options?.agent_scan?.template_filter,
          };
        }
      } catch (profileErr) {
        console.warn("Could not fetch profile agent scan config:", profileErr);
      }

      const shouldSkipNetworkScan =
        isAgentOnlyProfile ||
        (agentScanConfig?.enabled && scanTargets.length === 0);

      await initiateScan(
        scanTargets,
        selectedProfile,
        3,
        agentScanConfig,
        shouldSkipNetworkScan
      );
    } catch (err) {
      console.error("Scan failed:", err);
    }
  }, [
    parsedTargets,
    previousScanTargets,
    selectedProfile,
    advancedAgentConfig,
    profileData,
    isProfileAgentEnabled,
    isProfileAgentOnly,
    initiateScan,
  ]);

  const handleStopScan = useCallback(async () => {
    try {
      const result = await stopScan(scanId);
      if (result.success) {
        console.log("Scan stop request sent successfully");
      } else {
        console.error("Failed to stop scan:", result.error);
      }
    } catch (err) {
      console.error("Error stopping scan:", err);
    }
  }, [scanId, stopScan]);

  const handleForceStop = useCallback(async () => {
    try {
      const result = await forceStopScan(scanId);
      if (result.success) {
        console.log("Force stop request sent successfully");
      } else {
        console.error("Failed to force stop scan:", result.error);
      }
    } catch (err) {
      console.error("Error force stopping scan:", err);
    }
  }, [scanId, forceStopScan]);

  const handleResetScan = useCallback(async () => {
    try {
      const result = await resetScan();
      if (result.success) {
        console.log("Scan state reset successfully");
      } else {
        console.error("Failed to reset scan state:", result.error);
      }
    } catch (err) {
      console.error("Error resetting scan state:", err);
    }
  }, [resetScan]);

  return {
    handleScan,
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
  };
}

// src/hooks/useStartScan.ts
import { useState } from "react";
import { api } from "~/utils/api";
import {
  type ScanResult,
  type AgentScanConfig,
  type SubScan,
} from "~/types/scanTypes";

export type TargetType =
  | "single_ip"
  | "ip_range"
  | "cidr"
  | "dns_name"
  | "dns_wildcard";

interface Target {
  value: string;
  type: TargetType;
}

/**
 * Starts scans via scanner.startOwnedScan for every authenticated user.
 * Server mints scan id, derives owner from session, writes owned Valkey keys,
 * and publishes Rabbit with owner_subject_id. Admin also mirrors currentScan.
 */
export const useStartScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startOwnedScan = api.scanner.startOwnedScan.useMutation();
  const utils = api.useContext();

  const initiateScan = async (
    targets: Target[],
    templateId: string,
    priority: number = 3,
    agentScanConfig?: AgentScanConfig,
    skipNetworkScan?: boolean
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const hasNetworkScan = targets.length > 0 && !skipNetworkScan;
      const hasAgentScan = agentScanConfig?.enabled ?? false;

      const result = await startOwnedScan.mutateAsync({
        targets,
        templateId,
        priority,
        agentScanConfig: hasAgentScan ? agentScanConfig : undefined,
        skipNetworkScan: !hasNetworkScan,
      });

      // Optimistic local ScanResult for callers that expect the old return shape.
      const subScans: Record<string, SubScan> = {};
      if (hasNetworkScan) {
        subScans.network = {
          type: "network",
          enabled: true,
          status: "running",
          progress: { completed: 0, total: 0, label: "hosts" },
        };
      }
      if (hasAgentScan) {
        subScans.agent = {
          type: "agent",
          enabled: true,
          status: "running",
          progress: { completed: 0, total: 0, label: "agents" },
          metadata: {
            mode: agentScanConfig?.mode ?? "comprehensive",
            dispatched_agents: [],
            agent_statuses: [],
          },
        };
      }

      const scan: ScanResult = {
        id: result.scanId,
        status: "running",
        targets: targets.map((t) => t.value),
        hosts: [],
        hosts_completed: 0,
        vulnerabilities: [],
        start_time: new Date().toISOString(),
        sub_scans: subScans,
      };

      await utils.scanner.getLatestOwnedScan.invalidate();

      return scan;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start scan";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateScan,
    isLoading,
    error,
  };
};

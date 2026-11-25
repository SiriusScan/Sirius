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

interface ScanRequest {
  id: string;
  targets: Target[];
  options: {
    template_id: string;
  };
  priority: number;
}

export const useStartScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedScanId, setUnconfirmedScanId] = useState<string | null>(null);
  const submitNetworkScan = api.scanner.submitNetworkScan.useMutation({
    retry: false,
  });
  const sendMessage = api.queue.sendMsg.useMutation();
  const updateScan = api.store.setValue.useMutation();
  const dispatchAgentScan = api.agentScan.dispatchAgentScan.useMutation();
  const utils = api.useContext();

  const generateScanId = () => {
    const suffix = Math.random().toString(36).slice(2, 11) || "0";
    return `scan-${Date.now()}-${suffix}`;
  };

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
      setUnconfirmedScanId(null);

      const scanId = generateScanId();
      const hasNetworkScan = targets.length > 0 && !skipNetworkScan;
      const hasAgentScan = agentScanConfig?.enabled ?? false;

      if (hasNetworkScan && !hasAgentScan) {
        const receipt = await submitNetworkScan.mutateAsync({
          scanId,
          targets,
          templateId,
          priority,
        }).catch(() => ({ outcome: "unconfirmed" } as const));

        if ("scan" in receipt && receipt.scan) return receipt.scan;
        switch (receipt.outcome) {
          case "unsupported":
            throw new Error("This API version does not support network scan submission.");
          case "rejected":
            throw new Error("The API rejected the network scan request.");
          case "busy":
            throw new Error("A scan is already active or its state cannot be replaced.");
          case "failed":
            throw new Error("The network scan could not be submitted.");
          case "not_recorded":
            throw new Error("Could not record the scan. No scan request was published.");
          default:
            setUnconfirmedScanId(scanId);
            throw new Error("Could not confirm scan submission. Check the dashboard before retrying.");
        }
      }

      // Agent-only and combined profiles still use their legacy dispatch.
      // Select that path before any network submission is attempted.
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
          status: "dispatching",
          progress: { completed: 0, total: 0, label: "agents" },
          metadata: {
            mode: agentScanConfig?.mode ?? "comprehensive",
            dispatched_agents: [],
            agent_statuses: [],
          },
        };
      }

      // Create the initial scan state in ValKey
      const scan: ScanResult = {
        id: scanId,
        status: "running",
        targets: targets.map((t) => t.value),
        hosts: [],
        hosts_completed: 0,
        vulnerabilities: [],
        start_time: new Date().toISOString(),
        sub_scans: subScans,
      };

      await updateScan.mutateAsync({
        key: "currentScan",
        value: btoa(JSON.stringify(scan)),
      });

      // Dispatch network scan if we have targets
      if (hasNetworkScan) {
        const scanRequest: ScanRequest = {
          id: scanId,
          targets,
          options: {
            template_id: templateId,
          },
          priority,
        };

        const message = JSON.stringify(scanRequest);
        await sendMessage.mutateAsync({ message, queue: "scan" });
      }

      // Dispatch agent scan if enabled
      if (hasAgentScan && agentScanConfig) {
        try {
          await dispatchAgentScan.mutateAsync({
            scanId,
            agentIds: agentScanConfig.agent_ids,
            mode: agentScanConfig.mode,
            timeout: agentScanConfig.timeout,
            concurrency: agentScanConfig.concurrency,
            templateFilter: agentScanConfig.template_filter,
          });
        } catch (agentErr) {
          console.error(
            "[useStartScan] Agent scan dispatch failed:",
            agentErr
          );
          // Don't fail the entire scan if agent dispatch fails
          // The network scan will continue
        }
      }

      return scan;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start scan";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      void utils.store.getValue.invalidate({ key: "currentScan" });
    }
  };

  return {
    initiateScan,
    isLoading,
    error,
    unconfirmedScanId,
  };
};

// Example usage:
/*
const MyComponent = () => {
  const { initiateScan, isLoading, error } = useStartScan();

  const handleScan = async () => {
    const targets = [
      {
        value: '192.168.1.1',
        type: 'single_ip' as TargetType,
      },
      {
        value: '192.168.1.0/24',
        type: 'cidr' as TargetType,
      }
    ];

    const template = {
      aggressive: true,
      excludePorts: ['22', '3389'],
      scanTypes: ['discovery', 'vulnerability'],
      maxRetries: 3,
      parallel: true,
    };

    try {
      await initiateScan(targets, template, 3);
      // Handle success
    } catch (err) {
      // Handle error
    }
  };

  return (
    // ... component JSX
  );
};
*/

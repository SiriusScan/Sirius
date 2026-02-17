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
  const sendMessage = api.queue.sendMsg.useMutation();
  const updateScan = api.store.setValue.useMutation();
  const dispatchAgentScan = api.agentScan.dispatchAgentScan.useMutation();
  const utils = api.useContext();

  const generateScanId = () => {
    return `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
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

      const scanId = generateScanId();
      const hasNetworkScan = targets.length > 0 && !skipNetworkScan;
      const hasAgentScan = agentScanConfig?.enabled ?? false;

      // Build modular sub_scans map
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
          const agentResult = await dispatchAgentScan.mutateAsync({
            scanId,
            agentIds: agentScanConfig.agent_ids,
            mode: agentScanConfig.mode,
            timeout: agentScanConfig.timeout,
            concurrency: agentScanConfig.concurrency,
            templateFilter: agentScanConfig.template_filter,
          });

          // Update the agent sub-scan with dispatch info
          if (agentResult.totalDispatched > 0) {
            // Re-read current scan from ValKey to merge, not overwrite
            try {
              const currentData = await utils.store.getValue.fetch({ key: "currentScan" });
              if (currentData) {
                const currentDecoded = JSON.parse(atob(currentData)) as ScanResult;
                if (currentDecoded.id === scanId && currentDecoded.sub_scans) {
                  const agentSS = currentDecoded.sub_scans.agent;
                  if (agentSS) {
                    // Only update frontend-owned dispatch fields
                    const existingMeta = (agentSS.metadata ?? {}) as Record<string, unknown>;
                    existingMeta.dispatched_agents = agentResult.dispatchedAgents;
                    existingMeta.agent_statuses = agentResult.dispatchedAgents.map(
                      (id: string) => ({
                        agent_id: id,
                        status: "running",
                        hosts_found: 0,
                        vulnerabilities_found: 0,
                      })
                    );
                    agentSS.metadata = existingMeta;
                    agentSS.progress.total = agentResult.totalDispatched;

                    // Only update status if Go hasn't already progressed
                    if (agentSS.status === "dispatching") {
                      agentSS.status = "running";
                    }
                    // Preserve progress.completed from Go server
                  } else {
                    // Agent sub-scan wasn't present — create it
                    currentDecoded.sub_scans.agent = {
                      type: "agent",
                      enabled: true,
                      status: "running",
                      progress: {
                        completed: 0,
                        total: agentResult.totalDispatched,
                        label: "agents",
                      },
                      metadata: {
                        mode: agentScanConfig.mode,
                        dispatched_agents: agentResult.dispatchedAgents,
                        agent_statuses: agentResult.dispatchedAgents.map(
                          (id: string) => ({
                            agent_id: id,
                            status: "running",
                            hosts_found: 0,
                            vulnerabilities_found: 0,
                          })
                        ),
                      },
                    };
                  }
                  await updateScan.mutateAsync({
                    key: "currentScan",
                    value: btoa(JSON.stringify(currentDecoded)),
                  });
                }
              }
            } catch (readErr) {
              // Fallback: write with local scan object if read fails
              if (scan.sub_scans?.agent) {
                scan.sub_scans.agent.progress.total = agentResult.totalDispatched;
                scan.sub_scans.agent.status = "running";
                scan.sub_scans.agent.metadata = {
                  mode: agentScanConfig.mode,
                  dispatched_agents: agentResult.dispatchedAgents,
                  agent_statuses: agentResult.dispatchedAgents.map(
                    (id: string) => ({
                      agent_id: id,
                      status: "running",
                      hosts_found: 0,
                      vulnerabilities_found: 0,
                    })
                  ),
                };
              }
              await updateScan.mutateAsync({
                key: "currentScan",
                value: btoa(JSON.stringify(scan)),
              });
            }
          }
        } catch (agentErr) {
          console.error(
            "[useStartScan] Agent scan dispatch failed:",
            agentErr
          );
          // Don't fail the entire scan if agent dispatch fails
          // The network scan will continue
        }
      }

      await utils.store.getValue.invalidate();

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

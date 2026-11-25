// src/hooks/useStartScan.ts
import { useState } from "react";
import { api } from "~/utils/api";
import { b64Decode } from "~/utils/std";
import { createInitialScan } from "~/utils/scanSubmission";
import {
  type ScanResult,
  type AgentScanConfig,
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

export const useStartScan = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submitNetworkScan = api.scanner.submitNetworkScan.useMutation({
    retry: false,
  });
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

      const scanId = generateScanId();
      const hasNetworkScan = targets.length > 0 && !skipNetworkScan;
      const hasAgentScan = agentScanConfig?.enabled ?? false;

      const agentMode = hasAgentScan
        ? agentScanConfig?.mode ?? "comprehensive"
        : undefined;
      let scan: ScanResult;

      if (hasNetworkScan) {
        const receipt = await submitNetworkScan.mutateAsync({
          scanId,
          targets,
          templateId,
          priority,
          agentMode,
        }).catch((cause: unknown) => {
          console.error("Scan submission response was unavailable", scanId, cause);
          throw new Error(
            "Could not confirm scan submission. Check the dashboard before retrying."
          );
        });
        if (receipt.outcome === "not_recorded") {
          throw new Error("Could not record the scan. No scan request was published.");
        }
        if (receipt.outcome === "failed") {
          throw new Error("The network scan could not be submitted.");
        }
        scan = receipt.scan;
      } else {
        scan = createInitialScan(
          scanId,
          targets.map((target) => target.value),
          false,
          agentMode
        );
        await updateScan.mutateAsync({
          key: "currentScan",
          value: btoa(JSON.stringify(scan)),
        });
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
                const currentDecoded = b64Decode(currentData);
                if (currentDecoded && currentDecoded.id === scanId && currentDecoded.sub_scans) {
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
              // Never overwrite currentScan with the stale local `scan` snapshot (drops network hosts/vulns).
              console.error(
                "[useStartScan] Failed to merge agent dispatch into currentScan; leaving Valkey state unchanged",
                readErr
              );
              try {
                const retry = await utils.store.getValue.fetch({
                  key: "currentScan",
                });
                if (retry) {
                  const rd = b64Decode(retry);
                  if (rd?.id === scanId && rd.sub_scans?.agent) {
                    const agentSS = rd.sub_scans.agent;
                    const meta = (agentSS.metadata ?? {}) as Record<string, unknown>;
                    meta.dispatched_agents = agentResult.dispatchedAgents;
                    meta.agent_statuses = agentResult.dispatchedAgents.map(
                      (id: string) => ({
                        agent_id: id,
                        status: "running",
                        hosts_found: 0,
                        vulnerabilities_found: 0,
                      })
                    );
                    agentSS.metadata = meta;
                    agentSS.progress.total = agentResult.totalDispatched;
                    if (agentSS.status === "dispatching") {
                      agentSS.status = "running";
                    }
                    await updateScan.mutateAsync({
                      key: "currentScan",
                      value: btoa(JSON.stringify(rd)),
                    });
                  }
                }
              } catch (retryErr) {
                console.error(
                  "[useStartScan] Retry merge after read failure also failed",
                  retryErr
                );
              }
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

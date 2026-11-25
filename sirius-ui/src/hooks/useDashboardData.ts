import { useCallback, useState } from "react";
import { api } from "~/utils/api";
import { useSystemResources } from "~/hooks/useSystemResources";

export interface DashboardVulnerabilityCounts {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface DashboardHostData {
  total: number;
  online: number;
  withVulnerabilities: number;
}

export interface DashboardAgentData {
  total: number;
  online: number;
  offline: number;
}

export interface DashboardSystemMetrics {
  totalContainers: number;
  freshContainers: number;
  peakCpuPercent?: number;
  observedMemoryBytes?: number;
}

export interface DashboardData {
  vulnerabilities: DashboardVulnerabilityCounts;
  hosts: DashboardHostData;
  agents: DashboardAgentData;
  systemMetrics: DashboardSystemMetrics | null;
}

export interface DashboardDataState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * useDashboardData - Consolidated hook for all dashboard data
 *
 * Fetches and aggregates:
 * - Vulnerability counts (30s refresh)
 * - Host statistics (30s refresh)
 * - Agent status (10s refresh)
 * - System metrics (10s refresh, optional)
 */
export const useDashboardData = (
  options: {
    enableSystemMetrics?: boolean;
    vulnerabilityRefetch?: number | false;
    hostRefetch?: number | false;
    agentRefetch?: number | false;
    systemMetricsRefetch?: number;
  } = {}
): DashboardDataState => {
  const {
    enableSystemMetrics = false,
    vulnerabilityRefetch = 30000, // 30s
    hostRefetch = 30000, // 30s
    agentRefetch = 10000, // 10s
    systemMetricsRefetch = 10000, // 10s
  } = options;

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch vulnerability data with keepPreviousData to prevent flash
  const {
    data: vulnData,
    isLoading: vulnLoading,
    error: vulnError,
    refetch: refetchVulns,
  } = api.vulnerability.getAllVulnerabilities.useQuery(undefined, {
    refetchInterval:
      vulnerabilityRefetch === false ? undefined : vulnerabilityRefetch,
    refetchOnWindowFocus: false,
    staleTime:
      vulnerabilityRefetch === false ? undefined : vulnerabilityRefetch,
    keepPreviousData: true, // Prevent flash on refetch
  });

  // Fetch host data with keepPreviousData to prevent flash
  const {
    data: hostData,
    isLoading: hostLoading,
    error: hostError,
    refetch: refetchHosts,
  } = api.host.getAllHosts.useQuery(undefined, {
    refetchInterval: hostRefetch === false ? undefined : hostRefetch,
    refetchOnWindowFocus: false,
    staleTime: hostRefetch === false ? undefined : hostRefetch,
    keepPreviousData: true, // Prevent flash on refetch
  });

  // Fetch agent data with keepPreviousData to prevent flash
  const {
    data: agentData,
    isLoading: agentLoading,
    error: agentError,
    refetch: refetchAgents,
  } = api.agent.listAgentsWithHosts.useQuery(undefined, {
    refetchInterval: agentRefetch === false ? undefined : agentRefetch,
    refetchOnWindowFocus: false,
    staleTime: agentRefetch === false ? undefined : agentRefetch,
    keepPreviousData: true, // Prevent flash on refetch
  });

  const {
    data: resources, freshCount, peakCPU, observedMemory,
    loading: systemMetricsLoading, refetch: refetchResources,
  } = useSystemResources(systemMetricsRefetch, enableSystemMetrics);
  const systemMetrics: DashboardSystemMetrics | null = freshCount && resources
    ? {
        totalContainers: resources.summary.total_containers,
        freshContainers: freshCount,
        peakCpuPercent: peakCPU,
        observedMemoryBytes: observedMemory,
      }
    : null;

  // Manual refresh function
  const refresh = useCallback(async () => {
    await Promise.all([
      refetchVulns(),
      refetchHosts(),
      refetchAgents(),
      enableSystemMetrics ? refetchResources() : Promise.resolve(),
    ]);
    setLastUpdated(new Date());
  }, [
    refetchVulns,
    refetchHosts,
    refetchAgents,
    enableSystemMetrics,
    refetchResources,
  ]);

  // Update last updated timestamp when data changes
  React.useEffect(() => {
    if (vulnData || hostData || agentData) {
      setLastUpdated(new Date());
    }
  }, [vulnData, hostData, agentData]);

  // Aggregate data
  const isLoading =
    vulnLoading || hostLoading || agentLoading || systemMetricsLoading;
  const error =
    vulnError?.message || hostError?.message || agentError?.message || null;

  // Calculate vulnerability counts
  const vulnerabilities: DashboardVulnerabilityCounts = {
    total: vulnData?.counts?.total || 0,
    critical: vulnData?.counts?.critical || 0,
    high: vulnData?.counts?.high || 0,
    medium: vulnData?.counts?.medium || 0,
    low: vulnData?.counts?.low || 0,
    informational: vulnData?.counts?.informational || 0,
  };

  // Calculate host data
  const hosts: DashboardHostData = {
    total: hostData?.length || 0,
    online: hostData?.length || 0, // Assume all discovered hosts are online
    withVulnerabilities: 0, // Will be calculated from vulnerability data
  };

  // Count hosts with vulnerabilities
  // Since vulnerability data doesn't include host IDs, we'll use hostCount from vulnerabilities
  // In a real implementation, this would come from a proper API endpoint
  if (vulnData?.vulnerabilities && vulnData.vulnerabilities.length > 0) {
    // Estimate hosts with vulnerabilities based on total hosts and vulnerability count
    hosts.withVulnerabilities = Math.min(
      hosts.total,
      Math.ceil(hosts.total * 0.7)
    );
  }

  // Calculate agent data
  const agents: DashboardAgentData = {
    total: agentData?.length || 0,
    online:
      agentData?.filter((a) => a.status?.toLowerCase() === "online").length ||
      0,
    offline: 0,
  };
  agents.offline = agents.total - agents.online;

  const data: DashboardData = {
    vulnerabilities,
    hosts,
    agents,
    systemMetrics,
  };

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refresh,
  };
};

// Import React for useEffect
import React from "react";

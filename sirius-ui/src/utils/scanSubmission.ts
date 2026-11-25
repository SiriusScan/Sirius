import type { AgentScanMode, ScanResult, SubScan } from "~/types/scanTypes";

export function createInitialScan(
  id: string,
  targets: string[],
  hasNetwork: boolean,
  agentMode?: AgentScanMode
): ScanResult {
  const subScans: Record<string, SubScan> = {};
  if (hasNetwork) {
    subScans.network = {
      type: "network",
      enabled: true,
      status: "pending",
      progress: { completed: 0, total: 0, label: "hosts" },
    };
  }
  if (agentMode) {
    subScans.agent = {
      type: "agent",
      enabled: true,
      status: "dispatching",
      progress: { completed: 0, total: 0, label: "agents" },
      metadata: {
        mode: agentMode,
        dispatched_agents: [],
        agent_statuses: [],
      },
    };
  }

  return {
    id,
    status: hasNetwork ? "pending" : "running",
    targets,
    hosts: [],
    hosts_completed: 0,
    vulnerabilities: [],
    start_time: new Date().toISOString(),
    sub_scans: subScans,
  };
}

export function projectScanStatus(scan: ScanResult | null): ScanResult | null {
  // The packaged network worker advances the sub-scan before it settles the
  // aggregate. Use its reported start without writing any producer state.
  if (scan?.status === "pending" && Object.values(scan.sub_scans ?? {}).some(
    (subScan) => subScan.enabled && subScan.status === "running"
  )) {
    return { ...scan, status: "running" };
  }
  return scan;
}

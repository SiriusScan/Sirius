/**
 * useHostAgentData — what the Sirius agent has reported for a host
 * (packages, users, services, hardware). A network scan can't see inside a
 * host, so scan-only hosts have none; the Overview's System card and the
 * System and Network tabs then show one "needs the agent" state instead of
 * rows of zeros.
 *
 * Uses the same queries as SoftwareInventory and SystemFingerprint, so the
 * System tab opens from cache.
 */

import { useMemo } from "react";
import { api } from "~/utils/api";
import { readAgentData, type AgentSnapshot } from "./hostModel";

export type AgentDataState =
  | { status: "loading" }
  | { status: "none"; agentInstalled: boolean }
  | { status: "present"; data: AgentSnapshot };

export function useHostAgentData(ip: string | undefined, agentId = 0): AgentDataState {
  const inventory = api.host.getHostSoftwareInventory.useQuery(
    { ip: ip ?? "" },
    { enabled: !!ip, staleTime: 60000 },
  );
  const fingerprint = api.host.getHostSystemFingerprint.useQuery(
    { ip: ip ?? "" },
    { enabled: !!ip, staleTime: 60000 },
  );

  const loading = inventory.isLoading || fingerprint.isLoading;
  const inventoryData: unknown = inventory.data;
  const fingerprintData: unknown = fingerprint.data;

  return useMemo<AgentDataState>(() => {
    if (loading) return { status: "loading" };
    const data = readAgentData(inventoryData, fingerprintData);
    return data ? { status: "present", data } : { status: "none", agentInstalled: agentId > 0 };
  }, [loading, inventoryData, fingerprintData, agentId]);
}

export default useHostAgentData;

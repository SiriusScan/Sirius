import type { ScanResult } from "~/types/scanTypes";

interface CurrentScanStore {
  read(): Promise<string | null>;
  compareAndSet(expected: string, updated: string): Promise<boolean>;
}

const maxUpdateAttempts = 8;

function active(status: string): boolean {
  return status === "pending" || status === "dispatching" || status === "running";
}

function agentID(entry: unknown): unknown {
  return entry !== null && typeof entry === "object" && "agent_id" in entry
    ? entry.agent_id
    : undefined;
}

// The existing dispatch handler supplies the agents it successfully dispatched.
// Work, results and terminal decisions are owned by the existing dispatch and
// callback paths. A concurrent writer can change the whole snapshot.
export async function recordAgentDispatch(
  store: CurrentScanStore,
  scanId: string,
  dispatchedAgents: readonly string[],
): Promise<void> {
  if (dispatchedAgents.length === 0) return;

  for (let attempt = 0; attempt < maxUpdateAttempts; attempt++) {
    const raw = await store.read();
    if (raw === null) return;
    const scan = JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as ScanResult | null;
    if (scan?.id !== scanId || !active(scan.status)) return;

    const agent = scan.sub_scans?.agent;
    if (!agent?.enabled || !active(agent.status)) return;

    const progress = agent.progress;
    if (!Number.isSafeInteger(progress?.total) || progress.total < 0 ||
        !Number.isSafeInteger(progress.completed) || progress.completed < 0) {
      throw new Error("Invalid current agent dispatch progress");
    }
    const metadata = agent.metadata ?? {};
    const ids = metadata.dispatched_agents ?? [];
    const statuses = metadata.agent_statuses ?? [];
    if (typeof metadata !== "object" || Array.isArray(metadata) ||
        !Array.isArray(ids) || ids.some((id) => typeof id !== "string") ||
        !Array.isArray(statuses)) {
      throw new Error("Invalid current agent dispatch metadata");
    }

    const roster = [...new Set<string>([...ids, ...dispatchedAgents])];
    const observed = new Set(statuses.map(agentID));
    const newStatuses = [...new Set(dispatchedAgents)]
      .filter((id) => !observed.has(id))
      .map((id) => ({
        agent_id: id,
        status: "running",
        hosts_found: 0,
        vulnerabilities_found: 0,
      }));

    agent.metadata = {
      ...metadata,
      dispatched_agents: roster,
      agent_statuses: [...statuses, ...newStatuses],
    };
    progress.total = Math.max(progress.total, progress.completed, roster.length);
    if (agent.status === "dispatching") agent.status = "running";

    const updated = Buffer.from(JSON.stringify(scan)).toString("base64");
    if (updated === raw || await store.compareAndSet(raw, updated)) return;
  }
  throw new Error("Current scan kept changing during agent dispatch bookkeeping");
}

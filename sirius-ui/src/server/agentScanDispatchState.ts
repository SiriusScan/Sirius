/** Server-owned dispatch transitions. Both representations change atomically. */
export const AGENT_DISPATCH_CAS = `
if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end
local projection = redis.call('GET', KEYS[2])
if ARGV[2] == 'missing' then
  if projection then return 0 end
elseif projection ~= ARGV[3] then return 0 end
redis.call('SET', KEYS[1], ARGV[4], 'KEEPTTL')
if projection then
  redis.call('SET', KEYS[2], ARGV[5], 'KEEPTTL')
else
  redis.call('SET', KEYS[2], ARGV[5], 'EX', 3600)
end
return 1
`;

export interface DispatchStore {
  get(key: string): Promise<string | null>;
  eval(
    script: string,
    keys: number,
    ...args: (string | number)[]
  ): Promise<unknown>;
}

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): ObjectValue => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid scan state");
  }
  return value as ObjectValue;
};
const terminal = (status: unknown) =>
  status === "completed" || status === "failed" || status === "cancelled";
const aggregate = (statuses: unknown[]): string => {
  if (!statuses.every(terminal)) return "running";
  if (statuses.includes("failed")) return "failed";
  if (statuses.includes("cancelled")) return "cancelled";
  return "completed";
};
const entries = (value: unknown): ObjectValue[] =>
  Array.isArray(value) ? value.map(object) : [];

function activeScan(raw: string | null, scanId: string) {
  if (raw === null) throw new Error("Scan state is missing");
  const scan = object(JSON.parse(Buffer.from(raw, "base64").toString("utf8")));
  if (scan.id !== scanId)
    throw new Error("Requested scan is not the current scan");
  if (scan.status !== "running" && scan.status !== "pending") {
    throw new Error("Scan is no longer active");
  }
  const subScans = object(scan.sub_scans);
  const agent = object(subScans.agent);
  if (agent.enabled !== true || agent.status !== "dispatching") {
    throw new Error("Agent dispatch is no longer open");
  }
  const metadata = object(agent.metadata ?? {});
  return { scan, subScans, agent, metadata };
}

export async function assertAgentDispatchActive(
  store: DispatchStore,
  scanId: string,
  dispatchId: string
) {
  const { metadata } = activeScan(await store.get("currentScan"), scanId);
  if (metadata.dispatch_id !== dispatchId) {
    throw new Error("Agent dispatch ownership changed");
  }
}

interface DispatchTransition {
  scanId: string;
  dispatchId: string;
  mode: string;
  targetAgents: string[];
  phase: "prepare" | "seal" | "discovery_failed";
  failedAgents?: { id: string; error: string }[];
  error?: string;
}

export async function updateAgentDispatch(
  store: DispatchStore,
  transition: DispatchTransition
): Promise<void> {
  const { scanId, dispatchId, mode, phase } = transition;
  const targetAgents = [...new Set(transition.targetAgents)];
  const projectionKey = `agent_scan:${scanId}`;
  for (let attempt = 0; attempt < 8; attempt++) {
    const raw = await store.get("currentScan");
    const { scan, subScans, agent, metadata } = activeScan(raw, scanId);
    if (phase === "seal") {
      if (metadata.dispatch_id !== dispatchId) {
        throw new Error("Agent dispatch ownership changed");
      }
    } else if (metadata.dispatch_id !== undefined) {
      throw new Error("Agent dispatch has already started");
    }
    const projectionRaw = await store.get(projectionKey);
    const projection =
      projectionRaw === null ? {} : object(JSON.parse(projectionRaw));
    if (projection.scanId !== undefined && projection.scanId !== scanId) {
      throw new Error("Agent projection identity changed");
    }
    if (terminal(projection.status) || projection.status === "cancelling") {
      throw new Error("Agent projection is no longer active");
    }

    const prior = new Map<string, ObjectValue>();
    for (const entry of entries(metadata.agent_statuses)) {
      if (typeof entry.agent_id === "string") prior.set(entry.agent_id, entry);
    }
    const projected = new Map<string, ObjectValue>();
    for (const entry of entries(projection.agentStatuses)) {
      if (typeof entry.agentId !== "string") continue;
      projected.set(entry.agentId, entry);
      // The projection can be ahead of a reader. Never regress terminal results.
      if (
        !terminal(prior.get(entry.agentId)?.status) &&
        terminal(entry.status)
      ) {
        prior.set(entry.agentId, {
          ...prior.get(entry.agentId),
          agent_id: entry.agentId,
          status: entry.status,
          hosts_found: entry.hostsFound ?? 0,
          vulnerabilities_found: entry.vulnerabilitiesFound ?? 0,
          completed_at: entry.completedAt,
          error: entry.error,
        });
      }
    }
    const failures = new Map(
      (transition.failedAgents ?? []).map((f) => [f.id, f.error])
    );
    const statuses = targetAgents.map((id) => {
      const previous = prior.get(id);
      if (terminal(previous?.status)) return previous!;
      const error = failures.get(id);
      return {
        hosts_found: 0,
        vulnerabilities_found: 0,
        ...previous,
        agent_id: id,
        status:
          phase === "prepare"
            ? "pending"
            : error === undefined
            ? "running"
            : "failed",
        ...(error === undefined ? {} : { error }),
      };
    });
    const status =
      phase === "prepare"
        ? "dispatching"
        : phase === "discovery_failed"
        ? "failed"
        : aggregate(statuses.map((entry) => entry.status));
    const completed = statuses.filter((entry) => terminal(entry.status)).length;
    const failed = statuses.filter((entry) => entry.status === "failed").length;
    agent.metadata = {
      ...metadata,
      mode,
      dispatch_id: dispatchId,
      // This is the expected roster, including dispatch failures. Callbacks use
      // it as the denominator, so never replace it with successes alone.
      dispatched_agents: targetAgents,
      agent_statuses: statuses,
      ...(phase === "prepare"
        ? {}
        : { failed_agents: transition.failedAgents ?? [] }),
      ...(transition.error === undefined
        ? {}
        : { dispatch_error: transition.error }),
    };
    agent.progress = {
      ...object(agent.progress ?? {}),
      completed,
      total: targetAgents.length,
      label: "agents",
    };
    agent.status = status;
    if (phase !== "prepare") {
      const overall = aggregate(
        Object.values(subScans)
          .map(object)
          .filter((sub) => sub.enabled === true)
          .map((sub) => sub.status)
      );
      if (terminal(overall)) {
        scan.status = overall;
        if (!scan.end_time) scan.end_time = new Date().toISOString();
      }
    }
    const nextProjection = {
      ...projection,
      scanId,
      mode,
      status,
      totalAgents: targetAgents.length,
      completedAgents: completed,
      failedAgents: failed,
      agentStatuses: statuses.map((entry) => ({
        ...projected.get(String(entry.agent_id)),
        agentId: entry.agent_id,
        status: entry.status,
        hostsFound: entry.hosts_found,
        vulnerabilitiesFound: entry.vulnerabilities_found,
        completedAt:
          entry.completed_at ??
          projected.get(String(entry.agent_id))?.completedAt,
        error: entry.error,
      })),
      dispatchedAt: projection.dispatchedAt ?? new Date().toISOString(),
      completedAt: terminal(status)
        ? projection.completedAt ?? new Date().toISOString()
        : undefined,
      ...(transition.error === undefined ? {} : { error: transition.error }),
    };
    const swapped = await store.eval(
      AGENT_DISPATCH_CAS,
      2,
      "currentScan",
      projectionKey,
      raw!,
      projectionRaw === null ? "missing" : "present",
      projectionRaw ?? "",
      Buffer.from(JSON.stringify(scan)).toString("base64"),
      JSON.stringify(nextProjection)
    );
    if (swapped === 1) return;
  }
  throw new Error("Scan state changed too often during agent dispatch");
}

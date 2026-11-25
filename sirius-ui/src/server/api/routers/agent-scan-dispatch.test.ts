import assert from "node:assert/strict";
import { test } from "node:test";
import { recordAgentDispatch } from "./agent-scan-dispatch";

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64");
}

function scan(id = "scan-a") {
  return {
    id,
    status: "running",
    hosts: [] as string[],
    vulnerabilities: [] as Array<{ id: string }>,
    sub_scans: {
      network: {
        enabled: true,
        status: "running",
        metadata: { inventory_outcome: { rejected: 0 } },
      },
      agent: {
        enabled: true,
        status: "dispatching",
        progress: { completed: 0, total: 0, label: "agents" },
        metadata: {
          dispatched_agents: [] as string[],
          agent_statuses: [] as Array<Record<string, unknown>>,
          extension: "Résultats",
        },
      },
    },
  };
}

// A competing writer may replace the stored bytes after the reader sees them.
function fixture(initial: string | null, onFirstCompare?: () => string) {
  let raw = initial;
  let attempts = 0;
  return {
    read: async () => raw,
    async compareAndSet(expected: string, updated: string) {
      if (++attempts === 1 && onFirstCompare) raw = onFirstCompare();
      if (expected !== raw) return false;
      raw = updated;
      return true;
    },
    attempts: () => attempts,
  };
}

test("dispatch bookkeeping retries against network progress and preserves early agent results", async () => {
  const progressed = scan();
  progressed.hosts = ["192.0.2.1"];
  progressed.vulnerabilities = [{ id: "TEST-FINDING" }];
  const { network, agent } = progressed.sub_scans;
  network.status = "completed";
  network.metadata.inventory_outcome.rejected = 2;
  const completed = {
    agent_id: "agent-a",
    status: "completed",
    hosts_found: 1,
    vulnerabilities_found: 3,
    completed_at: "2026-11-24T12:00:00Z",
  };
  agent.metadata.dispatched_agents = ["agent-a"];
  agent.metadata.agent_statuses = [completed];
  agent.progress = { ...agent.progress, completed: 1, total: 1 };

  const stored = fixture(encode(scan()), () => encode(progressed));
  await recordAgentDispatch(stored, progressed.id, ["agent-a", "agent-b", "agent-b"]);

  const observed = await stored.read();
  assert.equal(stored.attempts(), 2);
  assert.equal(observed, encode({
    ...progressed,
    sub_scans: {
      network,
      agent: {
        ...agent,
        status: "running",
        progress: { ...agent.progress, total: 2 },
        metadata: {
          ...agent.metadata,
          dispatched_agents: ["agent-a", "agent-b"],
          agent_statuses: [
            completed,
            { agent_id: "agent-b", status: "running", hosts_found: 0, vulnerabilities_found: 0 },
          ],
        },
      },
    },
  }));
  await recordAgentDispatch(stored, progressed.id, ["agent-a", "agent-b"]);
  assert.equal(stored.attempts(), 2);
});

test("replacement and terminal snapshots are kept byte-for-byte when a stale compare fails", async () => {
  for (const replacement of [
    scan("scan-b"),
    { ...scan(), status: "cancelled", end_time: "2026-11-24T12:00:00Z" },
    { ...scan(), status: "completed", end_time: "2026-11-24T12:00:00Z" },
    { ...scan(), status: "cancelling" },
  ]) {
    const raw = encode(replacement);
    const stored = fixture(encode(scan()), () => raw);
    await recordAgentDispatch(stored, "scan-a", ["agent-a"]);
    assert.equal(await stored.read(), raw);
    assert.equal(stored.attempts(), 1);
  }
});

test("bookkeeping skips missing, disabled or terminal agent sub-scans and empty dispatches", async () => {
  const current = scan();
  const terminalAgent = { ...current.sub_scans.agent, status: "completed" };
  const disabledAgent = { ...current.sub_scans.agent, enabled: false };
  for (const snapshot of [
    null,
    { ...current, sub_scans: { network: current.sub_scans.network } },
    { ...current, sub_scans: { ...current.sub_scans, agent: terminalAgent } },
    { ...current, sub_scans: { ...current.sub_scans, agent: disabledAgent } },
  ]) {
    const raw = snapshot === null ? null : encode(snapshot);
    const stored = fixture(raw);
    await recordAgentDispatch(stored, current.id, ["agent-a"]);
    assert.equal(await stored.read(), raw);
    assert.equal(stored.attempts(), 0);
  }

  const raw = encode(current);
  const stored = fixture(raw);
  await recordAgentDispatch(stored, current.id, []);
  assert.equal(await stored.read(), raw);
  assert.equal(stored.attempts(), 0);
});

test("contention is bounded without falling back to an unconditional write", async () => {
  const raw = encode(scan());
  let attempts = 0;
  await assert.rejects(recordAgentDispatch({
    read: async () => raw,
    compareAndSet: async () => {
      attempts++;
      return false;
    },
  }, "scan-a", ["agent-a"]), /Current scan kept changing/);
  assert.equal(attempts, 8);
});

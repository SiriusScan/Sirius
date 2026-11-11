import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import { initTRPC, TRPCError } from "@trpc/server";
import Valkey from "iovalkey";
import ts from "typescript";
import { z } from "zod";
import * as dispatchState from "../../agentScanDispatchState";
import type { AgentScanStatus, ScanResult } from "~/types/scanTypes";

const source = ts.transpileModule(
  readFileSync(new URL("./agentScan.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;
const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64");
const initial = (): ScanResult => ({
  id: "scan-a",
  status: "running",
  start_time: "2026-11-08T00:00:00Z",
  targets: [],
  hosts: [],
  hosts_completed: 0,
  vulnerabilities: [],
  sub_scans: {
    agent: {
      type: "agent",
      enabled: true,
      status: "dispatching",
      progress: { completed: 0, total: 0 },
      metadata: { retained: true },
    },
  },
});
interface Projection {
  scanId: string;
  status: string;
  totalAgents: number;
  completedAgents: number;
  failedAgents: number;
  retained?: boolean;
  agentStatuses: {
    agentId: string;
    status: string;
    hostsFound: number;
    vulnerabilitiesFound: number;
    retained?: boolean;
  }[];
}
interface Input {
  scanId: string;
  agentIds: string[];
  mode: "comprehensive";
}
interface Result {
  scanId: string;
  dispatchedAgents: string[];
  failedAgents: { id: string; error: string }[];
  totalDispatched: number;
}
function fixture(scan: ScanResult | null = initial()) {
  const values = new Map<string, string>();
  if (scan) values.set("currentScan", encode(scan));
  values.set("connected_agents", JSON.stringify(["a", "b"]));
  let comparisons = 0;
  let writes = 0;
  const sent: string[] = [];
  const hooks: {
    compare?: () => void;
    publish?: (agent: string) => void;
    response?: (agent: string) => string | Promise<string>;
    read?: (key: string) => void;
  } = {};
  let lastAgent = "";
  const store: dispatchState.DispatchStore = {
    get: (key) => {
      hooks.read?.(key);
      return Promise.resolve(values.get(key) ?? null);
    },
    eval: (script, keys, ...args) => {
      assert.equal(script, dispatchState.AGENT_DISPATCH_CAS);
      assert.equal(keys, 2);
      comparisons++;
      hooks.compare?.();
      const [
        currentKey,
        projectionKey,
        expected,
        presence,
        projected,
        next,
        nextProjection,
      ] = args.map(String);
      assert.ok(currentKey && projectionKey && next && nextProjection);
      if (values.get(currentKey) !== expected) return Promise.resolve(0);
      if (
        presence === "missing"
          ? values.has(projectionKey)
          : values.get(projectionKey) !== projected
      )
        return Promise.resolve(0);
      values.set(currentKey, next);
      values.set(projectionKey, nextProjection);
      writes++;
      return Promise.resolve(1);
    },
  };
  const t = initTRPC.create();
  const exports: {
    agentScanRouter?: {
      createCaller: (ctx: object) => {
        dispatchAgentScan: (input: Input) => Promise<Result>;
      };
    };
  } = {};
  new Script(source, { filename: "agentScan.ts" }).runInNewContext({
    exports,
    Buffer,
    Error,
    setTimeout: (run: () => void) => run(),
    console: {
      log: () => undefined,
      error: () => undefined,
      warn: () => undefined,
    },
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "node:crypto") return { randomUUID };
      if (name === "zod") return { z };
      if (name === "@trpc/server") return { TRPCError };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure: t.procedure };
      if (name === "~/server/valkey") return { valkey: store };
      if (name === "~/server/agentScanDispatchState") return dispatchState;
      if (name === "./queue")
        return {
          requestAgentResponse: async (message: {
            target?: { id: string };
          }) => {
            lastAgent = message.target?.id ?? "list_agents";
            sent.push(lastAgent);
            hooks.publish?.(lastAgent);
            return await (hooks.response?.(lastAgent) ?? '{"success":true}');
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.agentScanRouter);
  const caller = exports.agentScanRouter.createCaller({});
  const current = (): ScanResult =>
    JSON.parse(
      Buffer.from(values.get("currentScan")!, "base64").toString("utf8")
    ) as ScanResult;
  const projection = (): Projection =>
    JSON.parse(values.get("agent_scan:scan-a")!) as Projection;
  const replace = (next: ScanResult | null) => {
    if (next) values.set("currentScan", encode(next));
    else values.delete("currentScan");
  };
  // Deterministic callback interleaving. The real Go callback is covered by its
  // own tests; this models its writes without any RabbitMQ/scan side effects.
  const complete = (
    id: string,
    status: "completed" | "failed" = "completed",
    project = true
  ) => {
    const next = current();
    const agent = next.sub_scans!.agent!;
    const statuses = agent.metadata!.agent_statuses as AgentScanStatus[];
    const entry = statuses.find((entry) => entry.agent_id === id)!;
    entry.status = status;
    entry.hosts_found = 1;
    entry.vulnerabilities_found = 3;
    entry.completed_at = "2026-11-08T00:00:01Z";
    agent.progress.completed = statuses.filter(
      (entry) => entry.status === "completed" || entry.status === "failed"
    ).length;
    next.hosts.push(`host-${id}`);
    replace(next);
    if (project) {
      const p = projection();
      const row = p.agentStatuses.find((entry) => entry.agentId === id)!;
      row.status = status;
      row.hostsFound = 1;
      row.vulnerabilitiesFound = 3;
      row.retained = true;
      p.completedAgents = agent.progress.completed;
      p.retained = true;
      values.set("agent_scan:scan-a", JSON.stringify(p));
    }
  };
  return {
    values,
    hooks,
    sent,
    store,
    current,
    projection,
    replace,
    complete,
    comparisons: () => comparisons,
    writes: () => writes,
    run: (agentIds = ["a", "b"]) =>
      caller.dispatchAgentScan({
        scanId: "scan-a",
        agentIds,
        mode: "comprehensive",
      }),
  };
}

void test("full deduplicated roster exists before the first command, fast results survive seal", async () => {
  const f = fixture();
  f.hooks.publish = (id) => {
    assert.equal(f.current().sub_scans?.agent?.status, "dispatching");
    assert.equal(f.current().sub_scans?.agent?.progress.total, 2);
    assert.equal(f.projection().totalAgents, 2);
    f.complete(id);
    assert.equal(f.current().status, "running");
  };
  await f.run(["a", "a", "b"]);
  assert.deepEqual(f.sent, ["a", "b"]);
  assert.equal(f.current().status, "completed");
  assert.equal(f.current().sub_scans?.agent?.progress.completed, 2);
  assert.equal(f.current().sub_scans?.agent?.metadata?.retained, true);
  assert.deepEqual(f.current().hosts, ["host-a", "host-b"]);
  assert.ok(f.current().end_time);
  assert.equal(f.projection().status, "completed");
  assert.equal(f.projection().completedAgents, 2);
  assert.equal(f.projection().retained, true);
  assert.ok(
    f
      .projection()
      .agentStatuses.every(
        (entry) =>
          entry.hostsFound === 1 &&
          entry.vulnerabilitiesFound === 3 &&
          entry.retained
      )
  );
});

void test("zero connected agents seals both records instead of leaving dispatching", async () => {
  const f = fixture();
  f.values.set("connected_agents", "[]");
  await f.run([]);
  assert.equal(f.sent.length, 0);
  assert.equal(f.current().status, "completed");
  assert.equal(f.current().sub_scans?.agent?.progress.total, 0);
  assert.equal(f.projection().status, "completed");
});

void test("all dispatch failures close with failure", async () => {
  const f = fixture();
  f.hooks.response = () =>
    JSON.stringify({ success: false, error: "Rejected" });
  const result = await f.run();
  assert.equal(result.totalDispatched, 0);
  assert.equal(f.current().status, "failed");
  assert.equal(f.current().sub_scans?.agent?.progress.completed, 2);
  assert.equal(f.projection().failedAgents, 2);
  assert.equal(f.projection().totalAgents, 2);
});

void test("mixed fast success and dispatch failure retain the whole expected roster", async () => {
  const f = fixture();
  f.hooks.publish = (id) => {
    if (id === "a") f.complete(id);
  };
  f.hooks.response = (id) =>
    id === "a"
      ? '{"success":true}'
      : JSON.stringify({ success: false, error: "Rejected" });
  const result = await f.run();
  assert.deepEqual(Array.from(result.dispatchedAgents), ["a"]);
  assert.equal(f.current().status, "failed");
  assert.deepEqual(f.current().sub_scans?.agent?.metadata?.dispatched_agents, [
    "a",
    "b",
  ]);
  assert.equal(f.current().sub_scans?.agent?.progress.total, 2);
  assert.equal(f.projection().failedAgents, 1);
});

void test("a terminal callback wins over a later dispatch acknowledgement error", async () => {
  const f = fixture();
  f.hooks.publish = (id) => f.complete(id, "completed", false);
  f.hooks.response = () =>
    JSON.stringify({ success: false, error: "Acknowledgement lost" });
  await f.run();
  assert.equal(f.current().status, "completed");
  assert.equal(f.projection().completedAgents, 2);
  assert.equal(f.projection().failedAgents, 0);
});

for (const network of ["running", "completed", "failed"] as const) {
  void test(`seal respects ${network} network subscan and preserves its results`, async () => {
    const scan = initial();
    scan.sub_scans!.network = {
      type: "network",
      enabled: true,
      status: network,
      progress: { completed: 8, total: 8 },
      metadata: { retained: true },
    };
    scan.hosts = ["network-host"];
    const f = fixture(scan);
    f.hooks.publish = (id) => f.complete(id);
    await f.run();
    assert.equal(
      f.current().status,
      network === "running" ? "running" : network
    );
    assert.deepEqual(f.current().sub_scans?.network, scan.sub_scans?.network);
    assert.ok(f.current().hosts.includes("network-host"));
    assert.equal(Boolean(f.current().end_time), network !== "running");
  });
}

void test("pending agent results stay running after partial dispatch failure", async () => {
  const f = fixture();
  f.hooks.response = (id) =>
    id === "a"
      ? '{"success":true}'
      : JSON.stringify({ success: false, error: "Rejected" });
  await f.run();
  assert.equal(f.current().status, "running");
  assert.equal(f.current().sub_scans?.agent?.status, "running");
  assert.deepEqual(f.current().sub_scans?.agent?.progress, {
    completed: 1,
    total: 2,
    label: "agents",
  });
  assert.equal(f.projection().status, "running");
});

void test("replacement between dispatches stops publication and never overwrites the new scan", async () => {
  const f = fixture();
  const newer = { ...initial(), id: "new" };
  f.hooks.publish = () => f.replace(newer);
  await assert.rejects(f.run(), /not the current scan/);
  assert.deepEqual(f.sent, ["a"]);
  assert.deepEqual(f.current(), newer);
  assert.equal(f.writes(), 1);
});

for (const lifecycle of [
  "completed",
  "failed",
  "cancelled",
  "cancelling",
] as const) {
  void test(`seal does not revive a ${lifecycle} scan`, async () => {
    const f = fixture();
    f.hooks.publish = () => f.replace({ ...f.current(), status: lifecycle });
    await assert.rejects(f.run(["a"]), /no longer active/);
    assert.equal(f.current().status, lifecycle);
    assert.equal(f.writes(), 1);
  });
}

void test("missing current scan is not created and no commands are published", async () => {
  const f = fixture(null);
  await assert.rejects(f.run(), /missing/);
  assert.equal(f.sent.length, 0);
  assert.equal(f.writes(), 0);
});

void test("CAS retries same-scan progress without dropping unknown fields", async () => {
  const f = fixture();
  f.hooks.compare = () => {
    f.replace({
      ...f.current(),
      hosts: ["new-network-result"],
      hosts_completed: 5,
    });
    delete f.hooks.compare;
  };
  await f.run();
  assert.equal(f.comparisons(), 3);
  assert.deepEqual(f.current().hosts, ["new-network-result"]);
  assert.equal(f.current().hosts_completed, 5);
});

void test("CAS rejects a replacement after its last read", async () => {
  const f = fixture();
  const newer = { ...initial(), id: "new" };
  f.hooks.compare = () => {
    f.replace(newer);
    delete f.hooks.compare;
  };
  await assert.rejects(f.run(), /not the current scan/);
  assert.equal(f.sent.length, 0);
  assert.equal(f.writes(), 0);
  assert.deepEqual(f.current(), newer);
});

void test("seal rereads callback updates that win its CAS", async () => {
  const f = fixture();
  f.hooks.publish = (id) => {
    if (id === "b")
      f.hooks.compare = () => {
        f.complete("a");
        f.complete("b");
        delete f.hooks.compare;
      };
  };
  await f.run();
  assert.equal(f.comparisons(), 3);
  assert.equal(f.current().status, "completed");
  assert.equal(f.projection().completedAgents, 2);
});

void test("projection-only CAS contention also rereads without losing terminal rows", async () => {
  const f = fixture();
  f.hooks.publish = () => {
    f.hooks.compare = () => {
      const projection = f.projection();
      projection.agentStatuses[0]!.status = "completed";
      projection.agentStatuses[0]!.hostsFound = 7;
      f.values.set("agent_scan:scan-a", JSON.stringify(projection));
      delete f.hooks.compare;
    };
  };
  await f.run(["a"]);
  assert.equal(f.current().status, "completed");
  assert.equal(f.projection().agentStatuses[0]?.hostsFound, 7);
});

void test("continuous contention fails after eight attempts before publication", async () => {
  const f = fixture();
  f.hooks.compare = () =>
    f.replace({ ...f.current(), hosts_completed: f.comparisons() });
  await assert.rejects(f.run(), /changed too often/);
  assert.equal(f.comparisons(), 8);
  assert.equal(f.writes(), 0);
  assert.equal(f.sent.length, 0);
});

void test("duplicate dispatch call cannot publish the roster again", async () => {
  const f = fixture();
  await f.run();
  await assert.rejects(f.run(), /no longer open/);
  assert.deepEqual(f.sent, ["a", "b"]);
});

void test("roster discovery failures mark agent failed instead of empty-success", async () => {
  const f = fixture();
  f.values.set("connected_agents", "not-json");
  await assert.rejects(f.run([]));
  assert.equal(f.current().status, "failed");
  assert.equal(f.current().sub_scans?.agent?.status, "failed");
  assert.equal(f.projection().status, "failed");
  assert.equal(f.sent.length, 0);
});

void test(
  "real Valkey two-key CAS is atomic and preserves expiry",
  { skip: process.env.SIRIUS_TEST_VALKEY !== "1" },
  async () => {
    const client = new Valkey({
      host: "127.0.0.1",
      port: 16379,
      lazyConnect: true,
      retryStrategy: () => null,
      maxRetriesPerRequest: 0,
    });
    const prefix = `test:agent-dispatch:${randomUUID()}`;
    const keys = [`${prefix}:scan`, `${prefix}:projection`];
    try {
      await client.connect();
      await client.set(keys[0]!, "old", "EX", 60);
      const swap = (old: string, presence: string, projection: string) =>
        client.eval(
          dispatchState.AGENT_DISPATCH_CAS,
          2,
          ...keys,
          old,
          presence,
          projection,
          "new",
          "next"
        );
      assert.equal(await swap("old", "missing", ""), 1);
      assert.equal(await client.get(keys[0]!), "new");
      assert.equal(await client.get(keys[1]!), "next");
      assert.ok((await client.ttl(keys[0]!)) > 0);
      assert.ok((await client.ttl(keys[1]!)) > 0);
      await client.set(keys[0]!, "old", "EX", 60);
      assert.equal(await swap("old", "present", "stale"), 0);
      assert.equal(await client.get(keys[0]!), "old");
      assert.equal(await client.get(keys[1]!), "next");
      assert.equal(await swap("old", "present", "next"), 1);
      assert.ok((await client.ttl(keys[1]!)) > 0);
      await client.del(keys[0]!);
      assert.equal(await swap("new", "present", "next"), 0);
      assert.equal(await client.get(keys[0]!), null);
    } finally {
      if (client.status === "ready") await client.del(...keys);
      client.disconnect();
    }
  }
);

for (const response of ["{}", '["agent-a"]', '{"success":false}']) {
  void test(`invalid or rejected ACK cannot be reported dispatched: ${response}`, async () => {
    const f = fixture();
    f.hooks.response = () => response;
    const result = await f.run(["a"]);
    assert.equal(result.totalDispatched, 0);
    assert.equal(f.current().status, "failed");
    assert.equal(f.projection().failedAgents, 1);
  });
}

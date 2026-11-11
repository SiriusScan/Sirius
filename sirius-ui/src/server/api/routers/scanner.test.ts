import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import { initTRPC } from "@trpc/server";
import ts from "typescript";
import { z } from "zod";
import Valkey from "iovalkey";
import { randomUUID } from "node:crypto";
import type { CancelScanResponse } from "./scanner";
import type { ScanResult } from "~/types/scanTypes";

// Load the real router with in-memory I/O. Never import production connections.
const source = ts.transpileModule(
  readFileSync(new URL("./scanner.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;

type StopMethod = "cancelScan" | "forceStopScan";
type Caller = Record<
  StopMethod,
  (input?: { scanId?: string }) => Promise<CancelScanResponse>
>;
const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString("base64");
const scan = (
  id: string,
  status: ScanResult["status"] = "running"
): ScanResult => ({
  id,
  status,
  targets: ["192.0.2.1"],
  hosts: [],
  hosts_completed: 0,
  vulnerabilities: [],
  start_time: "2026-11-08T00:00:00Z",
});

function fixture(initial: unknown) {
  let raw: string | null = initial === null ? null : encode(initial);
  const sent: {
    queue: string;
    command: { scan_id: string; action: string };
  }[] = [];
  let writes = 0;
  let evaluations = 0;
  let comparisonScript = "";
  const hooks: { publish?: () => void | Promise<void>; compare?: () => void } =
    {};
  const store = {
    get: () => Promise.resolve(raw),
    set: (_key: string, next: string) => {
      writes++;
      raw = next;
      return Promise.resolve("OK");
    },
    eval: (
      script: string,
      count: number,
      key: string,
      expected: string,
      next: string
    ) => {
      assert.equal(count, 1);
      assert.equal(key, "currentScan");
      evaluations++;
      comparisonScript = script;
      hooks.compare?.();
      if (raw !== expected) return Promise.resolve(0);
      writes++;
      raw = next;
      return Promise.resolve(1);
    },
  };
  const t = initTRPC.create();
  const exports: { scannerRouter?: { createCaller: (ctx: object) => Caller } } =
    {};
  new Script(source, { filename: "scanner.ts" }).runInNewContext({
    exports,
    Buffer,
    console: { error: () => undefined, warn: () => undefined },
    require: (name: string): unknown => {
      if (name === "~/server/safeErrorForLogging") return { safeErrorForLogging };
      if (name === "zod") return { z };
      if (name === "~/server/api/trpc")
        return { createTRPCRouter: t.router, protectedProcedure: t.procedure };
      if (name === "~/server/valkey") return { valkey: store };
      if (name === "~/server/api/routers/queue")
        return {
          handleSendMsg: async (queue: string, message: string) => {
            sent.push({
              queue,
              command: JSON.parse(message) as {
                scan_id: string;
                action: string;
              },
            });
            await hooks.publish?.();
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.scannerRouter);
  return {
    caller: exports.scannerRouter.createCaller({}),
    hooks,
    sent,
    replace: (value: unknown) => {
      raw = value === null ? null : encode(value);
    },
    current: () =>
      raw === null
        ? null
        : (JSON.parse(
            Buffer.from(raw, "base64").toString("utf8")
          ) as ScanResult),
    writes: () => writes,
    evaluations: () => evaluations,
    script: () => comparisonScript,
  };
}

for (const method of ["cancelScan", "forceStopScan"] as const) {
  void test(`${method}: rejects a stale ID before sending or writing`, async () => {
    const f = fixture(scan("new"));
    const response = await f.caller[method]({ scanId: "old" });
    assert.equal(response.success, false);
    assert.equal(f.sent.length, 0);
    assert.equal(f.writes(), 0);
    assert.deepEqual(f.current(), scan("new"));
  });

  void test(`${method}: replacement during queue await is not overwritten`, async () => {
    const f = fixture(scan("old"));
    f.hooks.publish = () => f.replace(scan("new"));
    const response = await f.caller[method]();
    assert.equal(response.success, false);
    assert.equal(f.sent[0]?.command.scan_id, "old");
    assert.equal(f.writes(), 0);
    assert.deepEqual(f.current(), scan("new"));
  });
}

for (const method of ["cancelScan", "forceStopScan"] as const) {
  const expectedStatus = method === "cancelScan" ? "cancelling" : "cancelled";

  void test(`${method}: omitted ID targets only the captured scan`, async () => {
    const f = fixture(scan("active"));
    const response = await f.caller[method]();
    assert.equal(response.success, true);
    assert.equal(response.status, expectedStatus);
    assert.equal(f.current()?.status, expectedStatus);
    assert.equal(f.evaluations(), 1);
    assert.equal(f.sent[0]?.queue, "scan_control");
    assert.equal(f.sent[0]?.command.scan_id, "active");
    assert.equal(
      f.sent[0]?.command.action,
      method === "cancelScan" ? "cancel" : "force_cancel"
    );
  });

  for (const invalid of [
    null,
    {},
    { id: "", status: "running" },
    { id: "active", status: "unknown" },
  ]) {
    void test(`${method}: absent or invalid scan cannot become wildcard cancellation: ${JSON.stringify(
      invalid
    )}`, async () => {
      const f = fixture(invalid);
      assert.equal((await f.caller[method]()).success, false);
      assert.equal(f.sent.length, 0);
      assert.equal(f.writes(), 0);
    });
  }

  void test(`${method}: blank input ID is rejected rather than treated as all scans`, async () => {
    const f = fixture(scan("active"));
    await assert.rejects(f.caller[method]({ scanId: "" }));
    await assert.rejects(f.caller[method]({ scanId: "  " }));
    assert.equal(f.sent.length, 0);
  });

  void test(`${method}: preserves latest progress during queue await`, async () => {
    const f = fixture(scan("active"));
    const progressed = {
      ...scan("active"),
      hosts_completed: 4,
      hosts: ["192.0.2.4"],
      extra_metadata: { retained: true },
    };
    f.hooks.publish = () => f.replace(progressed);
    assert.equal((await f.caller[method]()).success, true);
    const result = f.current();
    assert.equal(result?.hosts_completed, 4);
    assert.deepEqual(result?.hosts, progressed.hosts);
    assert.deepEqual(
      (result as unknown as { extra_metadata: object }).extra_metadata,
      progressed.extra_metadata
    );
  });

  void test(`${method}: compare-and-set rejects replacement after its final read`, async () => {
    const f = fixture(scan("active"));
    f.hooks.compare = () => {
      f.replace(scan("new"));
      delete f.hooks.compare;
    };
    assert.equal((await f.caller[method]()).success, false);
    assert.equal(f.writes(), 0);
    assert.deepEqual(f.current(), scan("new"));
  });

  void test(`${method}: retries a conflicting progress update without losing it`, async () => {
    const f = fixture(scan("active"));
    f.hooks.compare = () => {
      f.replace({ ...scan("active"), hosts_completed: 9 });
      delete f.hooks.compare;
    };
    assert.equal((await f.caller[method]()).success, true);
    assert.equal(f.evaluations(), 2);
    assert.equal(f.current()?.hosts_completed, 9);
    assert.equal(f.current()?.status, expectedStatus);
    assert.equal(f.sent.length, 1);
  });

  void test(`${method}: bounded retries fail safely under continuous writes`, async () => {
    const f = fixture(scan("active"));
    f.hooks.compare = () =>
      f.replace({ ...scan("active"), hosts_completed: f.evaluations() });
    assert.equal((await f.caller[method]()).success, false);
    assert.equal(f.evaluations(), 8);
    assert.equal(f.writes(), 0);
    assert.equal(f.current()?.status, "running");
  });

  void test(`${method}: deletion during queue await does not resurrect scan state`, async () => {
    const f = fixture(scan("active"));
    f.hooks.publish = () => f.replace(null);
    assert.equal((await f.caller[method]()).success, false);
    assert.equal(f.current(), null);
    assert.equal(f.writes(), 0);
  });

  for (const status of ["completed", "failed", "cancelled"] as const) {
    void test(`${method}: preserves a ${status} scan before sending`, async () => {
      const terminal = scan("active", status);
      const f = fixture(terminal);
      const response = await f.caller[method]();
      assert.equal(response.status, status);
      assert.equal(f.sent.length, 0);
      assert.equal(f.writes(), 0);
      assert.deepEqual(f.current(), terminal);
    });

    void test(`${method}: preserves ${status} transition during queue await`, async () => {
      const f = fixture(scan("active"));
      const terminal = scan("active", status);
      f.hooks.publish = () => f.replace(terminal);
      const response = await f.caller[method]();
      assert.equal(response.status, status);
      assert.equal(f.writes(), 0);
      assert.deepEqual(f.current(), terminal);
    });
  }
}

void test("graceful publication failure leaves scan untouched", async () => {
  const f = fixture(scan("active"));
  f.hooks.publish = () => {
    throw new Error("Queue unavailable");
  };
  const response = await f.caller.cancelScan();
  assert.equal(response.success, false);
  assert.equal(f.evaluations(), 0);
  assert.deepEqual(f.current(), scan("active"));
});

void test("force-stop fallback reports publication failure and updates only its scan", async () => {
  const f = fixture(scan("active"));
  f.hooks.publish = () => {
    throw new Error("Queue unavailable");
  };
  const response = await f.caller.forceStopScan();
  assert.equal(response.success, true);
  assert.match(response.message, /command could not be sent/);
  assert.equal(f.current()?.status, "cancelled");
});

void test("force-stop keeps completed subscans and other metadata", async () => {
  const f = fixture({
    ...scan("active"),
    sub_scans: {
      network: { status: "running", metadata: { keep: true } },
      agent: { status: "dispatching" },
      done: { status: "completed" },
    },
  });
  assert.equal((await f.caller.forceStopScan()).success, true);
  const current = f.current();
  assert.equal(current?.sub_scans?.network?.status, "failed");
  assert.deepEqual(current?.sub_scans?.network?.metadata, { keep: true });
  assert.equal(current?.sub_scans?.agent?.status, "failed");
  assert.equal(current?.sub_scans?.done?.status, "completed");
  assert.ok(current?.end_time);
});

void test(
  "real Valkey executes atomic raw-value comparison and preserves expiry",
  {
    skip: process.env.SIRIUS_TEST_VALKEY !== "1",
  },
  async () => {
    const f = fixture(scan("active"));
    await f.caller.cancelScan();
    const client = new Valkey({
      host: "127.0.0.1",
      port: 16379,
      lazyConnect: true,
      retryStrategy: () => null,
      maxRetriesPerRequest: 0,
    });
    // Isolated, expiring fixture key. This test never reads or writes currentScan.
    const key = `test:scanner-cas:${randomUUID()}`;
    try {
      await client.connect();
      await client.set(key, "old", "EX", 60);
      assert.equal(await client.eval(f.script(), 1, key, "wrong", "bad"), 0);
      assert.equal(await client.get(key), "old");
      assert.equal(await client.eval(f.script(), 1, key, "old", "new"), 1);
      assert.equal(await client.get(key), "new");
      assert.ok((await client.ttl(key)) > 0);
      assert.equal(await client.eval(f.script(), 1, key, "old", "stale"), 0);
      await client.del(key);
      assert.equal(
        await client.eval(f.script(), 1, key, "new", "resurrected"),
        0
      );
      assert.equal(await client.get(key), null);
    } finally {
      if (client.status === "ready") await client.del(key);
      client.disconnect();
    }
  }
);

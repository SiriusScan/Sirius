import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import test from "node:test";
import ts from "typescript";
import type { useStartScan } from "./useStartScan";
import type { AgentScanConfig, ScanResult } from "~/types/scanTypes";

const source = ts.transpileModule(
  readFileSync(new URL("./useStartScan.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;
const config: AgentScanConfig = {
  enabled: true,
  mode: "comprehensive",
  agent_ids: ["a"],
  timeout: 300,
  concurrency: 5,
};
function fixture(fail = false) {
  let writes = 0,
    dispatches = 0,
    invalidations = 0,
    sends = 0;
  let current: ScanResult | undefined;
  const state: unknown[] = [];
  const exports: { useStartScan?: typeof useStartScan } = {};
  const mutation = (fn: (input: unknown) => unknown) => ({
    useMutation: () => ({
      mutateAsync: (input: unknown) => Promise.resolve().then(() => fn(input)),
    }),
  });
  new Script(source, { filename: "useStartScan.ts" }).runInNewContext({
    exports,
    Error,
    btoa: (value: string) => Buffer.from(value).toString("base64"),
    console: { error: () => undefined },
    require: (name: string): unknown => {
      if (name === "react")
        return {
          useState: (initial: unknown) => {
            const index = state.push(initial) - 1;
            return [
              initial,
              (next: unknown) => {
                state[index] = next;
              },
            ];
          },
        };
      if (name === "~/utils/api")
        return {
          api: {
            queue: {
              sendMsg: mutation(() => {
                sends++;
              }),
            },
            store: {
              setValue: mutation((input) => {
                const value = input as { value: string };
                writes++;
                current = JSON.parse(
                  Buffer.from(value.value, "base64").toString("utf8")
                ) as ScanResult;
              }),
            },
            agentScan: {
              dispatchAgentScan: mutation(() => {
                dispatches++;
                assert.ok(current);
                current.hosts = ["fast-result"];
                current.status = "completed";
                if (fail) throw new Error("Dispatch failed");
                return {
                  totalDispatched: 1,
                  dispatchedAgents: ["a"],
                  failedAgents: [],
                };
              }),
            },
            useContext: () => ({
              store: {
                getValue: {
                  // A post-dispatch browser fetch is also forbidden: sealing is server-owned.
                  fetch: () => {
                    throw new Error("Unexpected stale browser merge");
                  },
                  invalidate: () => {
                    invalidations++;
                    return Promise.resolve();
                  },
                },
              },
            }),
          },
        };
      throw new Error(`Unexpected production dependency: ${name}`);
    },
  });
  assert.ok(exports.useStartScan);
  return {
    hook: exports.useStartScan(),
    state,
    current: () => current,
    counts: () => ({ writes, dispatches, invalidations, sends }),
  };
}

void test("start hook writes only initialization and leaves fast results to the server", async () => {
  const f = fixture();
  await f.hook.initiateScan([], "profile", 3, config);
  assert.deepEqual(f.counts(), {
    writes: 1,
    dispatches: 1,
    invalidations: 1,
    sends: 0,
  });
  assert.equal(f.current()?.status, "completed");
  assert.deepEqual(f.current()?.hosts, ["fast-result"]);
});

void test("dispatch errors surface without stale writes or aborting network results", async () => {
  const f = fixture(true);
  await f.hook.initiateScan(
    [{ value: "192.0.2.1", type: "single_ip" }],
    "profile",
    3,
    config
  );
  assert.deepEqual(f.counts(), {
    writes: 1,
    dispatches: 1,
    invalidations: 1,
    sends: 1,
  });
  assert.deepEqual(f.current()?.hosts, ["fast-result"]);
  assert.equal(f.state[1], "Dispatch failed");
  assert.equal(f.state[0], false);
});

void test("network-only start does not dispatch agents", async () => {
  const f = fixture();
  await f.hook.initiateScan(
    [{ value: "192.0.2.1", type: "single_ip" }],
    "profile"
  );
  assert.deepEqual(f.counts(), {
    writes: 1,
    dispatches: 0,
    invalidations: 1,
    sends: 1,
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import ts from "typescript";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import * as repositories from "./nseRepositories";
import * as mutations from "./nseMutations";
import * as ids from "../utils/nseScriptIds";

const source = ts.transpileModule(readFileSync(new URL("./api/routers/store.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
type ScriptView = { id: string; code: string; path: string };
type Caller = {
  getNseScript(input: { id: string }): Promise<ScriptView>;
  getNseScripts(): Promise<ScriptView[]>;
};
function fixture(scripts: unknown, bodies: Record<string, string>, extra = {}) {
  const values = new Map(Object.entries(bodies).map(([id, body]) => ["nse:script:" + id, body]));
  values.set("nse:manifest", JSON.stringify({ scripts, ...extra }));
  const reads: string[] = [];
  const trpc = initTRPC.create();
  const exports: { storeRouter?: { createCaller(ctx: object): Caller } } = {};
  const modules: Record<string, unknown> = {
    "~/server/safeErrorForLogging": { safeErrorForLogging: () => ({}) },
    "~/server/api/trpc": { createTRPCRouter: trpc.router, protectedProcedure: trpc.procedure },
    "zod": { z },
    "~/server/nseMutations": mutations,
    "~/server/nseRepositories": repositories,
    "~/utils/nseScriptIds": ids,
    "~/server/valkey": { valkey: { get: (key: string) => {
      reads.push(key);
      return Promise.resolve(values.get(key) ?? null);
    } } },
  };
  new Script(source).runInNewContext({
    Error, exports, require: (name: string) => {
      if (!(name in modules)) throw new Error("Unexpected import " + name);
      return modules[name];
    },
    console: { log: () => undefined, warn: () => undefined, error: () => undefined },
  });
  return { caller: exports.storeRouter!.createCaller({}), reads };
}
const body = (content: string) => JSON.stringify({ content });

void test("router readers recover manifest-derived legacy bodies and independent paths", async () => {
  const { caller, reads } = fixture({ "demo.nse": { path: "other-executor.nse" } }, {
    "demo.nse": body("legacy"), "other-executor": body("wrong"),
  });
  const script = await caller.getNseScript({ id: "demo" });
  assert.equal(script.id, "demo");
  assert.equal(script.code, "legacy");
  assert.equal(script.path, "other-executor.nse");
  const list = await caller.getNseScripts();
  assert.equal(list[0]?.code, "legacy");
  await assert.rejects(caller.getNseScript({ id: "other-executor" }), /not found/);
  assert.ok(!reads.includes("nse:script:other-executor"));
});
void test("router keeps uppercase IDs distinct from lowercase aliases", async () => {
  const { caller } = fixture({ "demo.NSE": {}, demo: {} }, {
    "demo.NSE": body("uppercase"), demo: body("lowercase"),
  });
  assert.equal((await caller.getNseScript({ id: "demo.NSE" })).code, "uppercase");
  assert.equal((await caller.getNseScript({ id: "demo.nse" })).code, "lowercase");
  assert.equal((await caller.getNseScripts()).length, 2);
});
void test("router readers fail closed for duplicate aliases, tombstone conflict and invalid IDs", async () => {
  for (const scripts of [{ demo: {}, "demo.nse": {} }, { "demo/": {} }, { "demo.nse.nse": {} }, { " demo": {} }]) {
    const { caller } = fixture(scripts, { demo: body("must not serve") });
    await assert.rejects(caller.getNseScript({ id: "demo" }));
    assert.equal((await caller.getNseScripts()).length, 0);
  }
  const { caller } = fixture({ "demo.NSE": {} }, { "demo.NSE": body("deleted") }, { deletedScripts: { "demo.NSE": true } });
  await assert.rejects(caller.getNseScript({ id: "demo.NSE" }));
  assert.equal((await caller.getNseScripts()).length, 0);
});
void test("router readers never choose ambiguous or corrupt content", async () => {
  const cases: Record<string, string>[] = [
    { demo: body("canonical"), "demo.nse": body("legacy") },
    { "demo.nse": "bad JSON" },
    { "demo.nse": JSON.stringify({ content: 7 }) },
    { "demo.nse": JSON.stringify({ content: "secret", metadata: { tags: [7] } }) },
  ];
  for (const bodies of cases) {
    const { caller } = fixture({ "demo.nse": {} }, bodies);
    await assert.rejects(caller.getNseScript({ id: "demo" }));
    const list = await caller.getNseScripts();
    assert.equal(list[0]?.code, "-- Error loading script content");
  }
});

void test("router accepts legacy REST envelopes with null tags as empty tags", async () => {
  const legacy = JSON.stringify({ content: "-- REST body", metadata: { author: "", tags: null, description: "" }, custom: true });
  const { caller } = fixture({ demo: { protocol: "custom" } }, { demo: legacy });
  const one = await caller.getNseScript({ id: "demo" });
  assert.equal(one.code, "-- REST body");
  const all = await caller.getNseScripts();
  assert.equal(all[0]?.code, "-- REST body");
});

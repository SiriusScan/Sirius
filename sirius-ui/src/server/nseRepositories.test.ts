import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { Script } from "node:vm";
import ts from "typescript";
import { initTRPC } from "@trpc/server";
import { z } from "zod";
import * as mutations from "./nseMutations";
import * as ids from "../utils/nseScriptIds";

const source = ts.transpileModule(readFileSync(new URL("./api/routers/store.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
import * as repoModule from "./nseRepositories";
type Result = { success: boolean; error?: string };
type Caller = {
  addNseRepository(input: { name: string; url: string }): Promise<Result>;
  removeNseRepository(input: { name: string }): Promise<Result>;
  initializeNseRepositories(): Promise<Result>;
  setValue(input: { key: string; value: string }): Promise<unknown>;
};
const key = "nse:repo-manifest";
const repo = (name: string) => ({ name, url: "https://example.com/" + name + ".git" });
function fixture(initial: unknown) {
  let value = initial === null ? null : JSON.stringify(initial);
  let reads = 0, writes = 0;
  let beforeWrite: (() => Promise<void>) | undefined;
  let readError = false, conflicts = false, writeError = false;
  const client = {
    get: () => { reads++; return readError ? Promise.reject(new Error("transport read failed")) : Promise.resolve(value); },
    set: async (_key: string, next: string) => {
      const hook = beforeWrite; beforeWrite = undefined; await hook?.();
      writes++; value = next; return "OK";
    },
    eval: async (_script: string, _count: number, ...args: string[]) => {
      const hook = beforeWrite; beforeWrite = undefined; await hook?.();
      if (writeError) throw new Error("transport write failed");
      if (conflicts || (args[1] === "0" ? value !== null : value !== args[2])) return 0;
      writes++; value = args[4]!; return 1;
    },
  };
  const trpc = initTRPC.create();
  const exports: { storeRouter?: { createCaller(ctx: object): Caller } } = {};
  const modules: Record<string, unknown> = {
    "~/server/safeErrorForLogging": { safeErrorForLogging: () => ({}) },
    "~/server/api/trpc": { createTRPCRouter: trpc.router, protectedProcedure: trpc.procedure },
    zod: { z }, "~/server/nseMutations": mutations, "~/server/nseRepositories": repoModule,
    "~/utils/nseScriptIds": ids, "~/server/valkey": { valkey: client },
  };
  new Script(source).runInNewContext({
    Error, exports, require: (name: string) => {
      if (!(name in modules)) throw new Error("Unexpected import " + name);
      return modules[name];
    }, console: { log: () => undefined, warn: () => undefined, error: () => undefined },
  });
  return {
    caller: exports.storeRouter!.createCaller({}),
    value: () => value, counts: () => ({ reads, writes }),
    hook: (fn: () => Promise<void>) => { beforeWrite = fn; },
    failRead: () => { readError = true; }, failWrite: () => { writeError = true; },
    conflict: () => { conflicts = true; },
  };
}
void test("actual router concurrent additions retain both repositories and unknown fields", async () => {
  const f = fixture({ repositories: [{ ...repo("base"), future: { keep: true } }], extension: { keep: true } });
  f.hook(async () => { assert.equal((await f.caller.addNseRepository(repo("second"))).success, true); });
  assert.equal((await f.caller.addNseRepository(repo("first"))).success, true);
  const final = repoModule.parseNseRepositories(f.value()!);
  assert.deepEqual(final.repositories.map((r: { name: string }) => r.name).sort(), ["base", "first", "second"]);
  assert.deepEqual(final.extension, { keep: true });
  assert.deepEqual(final.repositories[0]?.future, { keep: true });
});
void test("actual router remove retries and preserves concurrent addition", async () => {
  const f = fixture({ repositories: [repo("base")] });
  f.hook(async () => { await f.caller.addNseRepository(repo("second")); });
  assert.equal((await f.caller.removeNseRepository({ name: "base" })).success, true);
  assert.deepEqual(repoModule.parseNseRepositories(f.value()!).repositories, [repo("second")]);
});
void test("actual router initializer never overwrites a concurrent addition or explicit empty list", async () => {
  const f = fixture(null);
  f.hook(async () => { await f.caller.addNseRepository(repo("second")); });
  assert.equal((await f.caller.initializeNseRepositories()).success, true);
  assert.deepEqual(repoModule.parseNseRepositories(f.value()!).repositories, [repo("second")]);
  const empty = fixture({ repositories: [], extension: true });
  await empty.caller.initializeNseRepositories();
  assert.equal(empty.counts().writes, 0);
});
void test("actual router concurrent duplicate name fails without overwriting winner", async () => {
  const f = fixture({ repositories: [] });
  f.hook(async () => { await f.caller.addNseRepository(repo("same")); });
  assert.equal((await f.caller.addNseRepository({ ...repo("same"), url: "https://other.example/repo" })).success, false);
  assert.deepEqual(repoModule.parseNseRepositories(f.value()!).repositories, [repo("same")]);
});
void test("actual router read/write failures and bounded contention never fallback overwrite", async () => {
  for (const mode of ["read", "write", "conflict"]) {
    const f = fixture({ repositories: [] });
    if (mode === "read") f.failRead();
    else if (mode === "write") f.failWrite();
    else f.conflict();
    assert.equal((await f.caller.addNseRepository(repo("new"))).success, false);
    assert.equal(f.counts().writes, 0);
    assert.ok(f.counts().reads <= 5);
    if (mode !== "conflict") assert.equal(f.counts().reads, 1);
  }
});
void test("actual router rejects malformed manifests and reserved-key bypass", async () => {
  for (const initial of [{}, { repositories: null }, { repositories: [repo("same"), repo("same")] }]) {
    const f = fixture(initial);
    assert.equal((await f.caller.addNseRepository(repo("new"))).success, false);
    assert.equal(f.counts().writes, 0);
  }
  const f = fixture({ repositories: [] });
  await assert.rejects(f.caller.setValue({ key, value: "{}" }), /Write denied/);
  assert.equal(f.counts().writes, 0);
});
void test("actual router rejects unsafe names and preserves scanner-compatible names", async () => {
  for (const name of ["", ".", "..", "a/b", "a\\b", "a/", "nul\0name"]) {
    const f = fixture({ repositories: [] });
    const result = await f.caller.addNseRepository(repo(name)).catch(() => ({ success: false }));
    assert.equal(result.success, false, name);
    assert.equal(f.counts().writes, 0);
  }
  const f = fixture({ repositories: [] });
  for (const name of ["MixedCase", "repo space", "répo"]) {
    assert.equal((await f.caller.addNseRepository(repo(name))).success, true);
  }
  assert.deepEqual(repoModule.parseNseRepositories(f.value()!).repositories.map((r: { name: string }) => r.name), ["MixedCase", "repo space", "répo"]);
});
void test("actual router removing final repository never resurrects defaults", async () => {
  const f = fixture({ repositories: [repo("last")], future: true });
  assert.equal((await f.caller.removeNseRepository({ name: "last" })).success, true);
  assert.equal((await f.caller.initializeNseRepositories()).success, true);
  assert.deepEqual(repoModule.parseNseRepositories(f.value()!), { repositories: [], future: true });
  assert.equal(f.counts().writes, 1);
});

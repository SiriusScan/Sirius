/* Synthetic JSON fixtures intentionally inspect arbitrary legacy fields. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/require-await */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { mutateNseScript, isProtectedNseKey, NSE_CAS_LUA, type NseStore } from "./nseMutations";

const manifestKey = "nse:manifest";
const scriptKey = "nse:script:demo";
class Store implements NseStore {
  values = new Map<string, string>();
  calls = 0;
  beforeEval?: () => void;
  async get(key: string) { return this.values.get(key) ?? null; }
  async eval(lua: string, count: number, ...args: string[]) {
    assert.equal(lua, NSE_CAS_LUA);
    this.calls++;
    this.beforeEval?.();
    const keys = args.slice(0, count);
    const values = args.slice(count);
    for (let i = 0; i < count; i++) {
      const current = this.values.get(keys[i]!);
      if (values[i * 4] === "0" ? current !== undefined : current !== values[i * 4 + 1]) return 0;
    }
    for (let i = 0; i < count; i++) {
      if (values[i * 4 + 2] === "delete") this.values.delete(keys[i]!);
      else this.values.set(keys[i]!, values[i * 4 + 3]!);
    }
    return 1;
  }
}
function seed() {
  const store = new Store();
  store.values.set(manifestKey, JSON.stringify({ extra: { keep: true }, scripts: {
    demo: { name: "Demo", path: "scripts/demo.nse", unknown: 7 }
  } }));
  store.values.set(scriptKey, JSON.stringify({ content: "old", unknown: 9,
    metadata: { author: "Old", tags: ["safe"], unknown: 10 } }));
  return store;
}
const create = { type: "create" as const, id: "demo", name: "Demo", code: "new" };
void test("create canonicalizes aliases, clears tombstone, preserves root fields and declares ownership", async () => {
  const store = new Store();
  store.values.set(manifestKey, JSON.stringify({ extra: 1, scripts: {}, deletedScripts: { demo: true } }));
  assert.equal(await mutateNseScript(store, { ...create, id: "scripts/demo.nse" }), "demo");
  const manifest = JSON.parse(store.values.get(manifestKey)!);
  assert.deepEqual(manifest.scripts.demo.source, { type: "custom" });
  assert.deepEqual(manifest.deletedScripts, {});
  assert.equal(manifest.extra, 1);
  assert.equal(JSON.parse(store.values.get(scriptKey)!).content, "new");
});
void test("update preserves unknown metadata and permits empty strings", async () => {
  const store = seed();
  await mutateNseScript(store, { type: "update", id: "demo.nse", code: "new", metadata: { author: "" } });
  const content = JSON.parse(store.values.get(scriptKey)!);
  assert.deepEqual(content.metadata, { author: "", tags: ["safe"], unknown: 10 });
  assert.equal(content.unknown, 9);
  assert.equal(JSON.parse(store.values.get(manifestKey)!).scripts.demo.unknown, 7);
});
void test("delete any manifest entry atomically writes tombstone and removes content", async () => {
  const store = seed();
  await mutateNseScript(store, { type: "delete", id: "scripts/demo.nse" });
  assert.equal(store.values.has(scriptKey), false);
  const manifest = JSON.parse(store.values.get(manifestKey)!);
  assert.deepEqual(manifest.scripts, {});
  assert.deepEqual(manifest.deletedScripts, { demo: true });
  assert.deepEqual(manifest.extra, { keep: true });
});
void test("concurrent create does not lose unrelated manifest entries", async () => {
  const store = new Store();
  store.beforeEval = () => {
    store.beforeEval = undefined;
    store.values.set(manifestKey, JSON.stringify({ scripts: { other: { unknown: 1 } } }));
  };
  await mutateNseScript(store, create);
  assert.equal(store.calls, 2);
  assert.equal(JSON.parse(store.values.get(manifestKey)!).scripts.other.unknown, 1);
});
void test("update racing delete cannot resurrect deleted content", async () => {
  const store = seed();
  store.beforeEval = () => {
    store.beforeEval = undefined;
    store.values.set(manifestKey, JSON.stringify({ scripts: {}, deletedScripts: { demo: true } }));
    store.values.delete(scriptKey);
  };
  await assert.rejects(mutateNseScript(store, { type: "update", id: "demo", code: "new" }), /not found/);
  assert.equal(store.values.has(scriptKey), false);
});
void test("content-only race retries and preserves newest metadata", async () => {
  const store = seed();
  store.beforeEval = () => {
    store.beforeEval = undefined;
    store.values.set(scriptKey, JSON.stringify({ content: "concurrent", metadata: { author: "New", newField: 1 } }));
  };
  await mutateNseScript(store, { type: "update", id: "demo", code: "final" });
  assert.equal(store.calls, 2);
  assert.equal(JSON.parse(store.values.get(scriptKey)!).metadata.newField, 1);
});
void test("bounded conflicts fail without publishing mutation", async () => {
  const store = seed();
  store.beforeEval = () => {
    store.values.set(scriptKey, JSON.stringify({ content: "race" + store.calls }));
  };
  await assert.rejects(mutateNseScript(store, { type: "update", id: "demo", code: "final" }), /concurrently/);
  assert.equal(store.calls, 5);
  assert.equal(JSON.parse(store.values.get(scriptKey)!).content, "race5");
});
void test("legacy array and map aliases retain unknown fields during migration", async () => {
  for (const scripts of [
    [{ id: "scripts/demo.nse", path: "scripts/demo.nse", unknown: 1 }],
    { "scripts/demo.nse": { unknown: 1 } }
  ]) {
    const store = seed();
    store.values.set(manifestKey, JSON.stringify({ scripts }));
    await mutateNseScript(store, { type: "update", id: "demo", code: "new" });
    assert.equal(JSON.parse(store.values.get(manifestKey)!).scripts.demo.unknown, 1);
  }
});
void test("invalid IDs, aliases, tombstones, malformed JSON and missing content fail closed", async () => {
  for (const scripts of [
    { demo: {}, "demo.nse": {} },
    { "*": {} }, null, "bad"
  ]) {
    const store = seed();
    store.values.set(manifestKey, JSON.stringify({ scripts }));
    const before = [...store.values];
    await assert.rejects(mutateNseScript(store, create));
    assert.deepEqual([...store.values], before);
    assert.equal(store.calls, 0);
  }
  for (const raw of ["{", "null", "{}", '{"scripts":{},"deletedScripts":{"demo":false}}']) {
    const store = new Store();
    store.values.set(manifestKey, raw);
    await assert.rejects(mutateNseScript(store, create));
    assert.equal(store.calls, 0);
  }
  for (const id of ["", "*", "../", "bad:key", "__proto__"]) {
    await assert.rejects(mutateNseScript(new Store(), { ...create, id }));
  }
  const store = seed();
  store.values.delete(scriptKey);
  await assert.rejects(mutateNseScript(store, { type: "update", id: "demo", code: "new" }));
  store.values.set(scriptKey, "garbage");
  await assert.rejects(mutateNseScript(store, { type: "delete", id: "demo" }));
  assert.equal(store.calls, 0);
});
void test("duplicate canonical creates and orphan content fail closed", async () => {
  const store = seed();
  await assert.rejects(mutateNseScript(store, { ...create, id: "scripts/demo.nse" }), /already exists/);
  store.values.delete(manifestKey);
  await assert.rejects(mutateNseScript(store, create), /already exists/);
});
void test("unavailable reads and failed EVAL never fall back to partial writes", async () => {
  const store = seed();
  store.get = async () => { throw new Error("offline"); };
  await assert.rejects(mutateNseScript(store, create), /offline/);
  assert.equal(store.calls, 0);
  const other = seed();
  const before = [...other.values];
  other.eval = async () => { throw new Error("transaction unavailable"); };
  await assert.rejects(mutateNseScript(other, { type: "delete", id: "demo" }), /transaction unavailable/);
  assert.deepEqual([...other.values], before);
});
void test("generic setValue cannot bypass NSE transactions; scan and repo compatibility retained", () => {
  assert.equal(isProtectedNseKey(manifestKey), true);
  assert.equal(isProtectedNseKey(scriptKey), true);
  assert.equal(isProtectedNseKey("nse:repo-manifest"), false);
  assert.equal(isProtectedNseKey("currentScan"), false);
  const source = readFileSync(new URL("./api/routers/store.ts", import.meta.url), "utf8");
  assert.match(source, /!isAllowedKey\(key\) \|\| isProtectedNseKey\(key\)/);
});

void test("unrelated create preserves raw legacy key and a later update migrates its body", async () => {
  const store = new Store();
  store.values.set(manifestKey, JSON.stringify({ scripts: { "demo.nse": { path: "elsewhere/executor.nse", unknown: 3 } } }));
  store.values.set("nse:script:demo.nse", JSON.stringify({ content: "legacy", metadata: { extra: 4 } }));
  await mutateNseScript(store, { ...create, id: "other" });
  assert.equal(JSON.parse(store.values.get(manifestKey)!).scripts["demo.nse"].unknown, 3);
  assert.equal(store.values.has(scriptKey), false);
  await mutateNseScript(store, { type: "update", id: "demo", code: "updated" });
  const manifest = JSON.parse(store.values.get(manifestKey)!);
  assert.equal(manifest.scripts.demo.path, "elsewhere/executor.nse");
  assert.equal(manifest.scripts["demo.nse"], undefined);
  assert.equal(store.values.has("nse:script:demo.nse"), false);
  assert.equal(JSON.parse(store.values.get(scriptKey)!).metadata.extra, 4);
});
void test("legacy delete removes raw body and leaves canonical tombstone atomically", async () => {
  const store = new Store();
  store.values.set(manifestKey, JSON.stringify({ scripts: { "demo.nse": { path: "arbitrary.nse" } } }));
  store.values.set("nse:script:demo.nse", JSON.stringify({ content: "legacy" }));
  await mutateNseScript(store, { type: "delete", id: "demo" });
  assert.equal(store.values.has("nse:script:demo.nse"), false);
  assert.equal(store.values.has(scriptKey), false);
  assert.deepEqual(JSON.parse(store.values.get(manifestKey)!).deletedScripts, { demo: true });
});
void test("ambiguous canonical and legacy bodies fail without changes", async () => {
  for (const type of ["update", "delete"] as const) {
    const store = seed();
    store.values.set(manifestKey, JSON.stringify({ scripts: { "demo.nse": {} } }));
    store.values.set("nse:script:demo.nse", JSON.stringify({ content: "legacy" }));
    const before = [...store.values];
    await assert.rejects(mutateNseScript(store, { type, id: "demo", code: "new" }), /Ambiguous/);
    assert.deepEqual([...store.values], before);
    assert.equal(store.calls, 0);
  }
});
void test("legacy body changes between read and CAS are retried without losing metadata", async () => {
  const store = new Store();
  store.values.set(manifestKey, JSON.stringify({ scripts: { "demo.nse": {} } }));
  store.values.set("nse:script:demo.nse", JSON.stringify({ content: "legacy" }));
  store.beforeEval = () => {
    store.beforeEval = undefined;
    store.values.set("nse:script:demo.nse", JSON.stringify({ content: "newer", metadata: { extra: 8 } }));
  };
  await mutateNseScript(store, { type: "update", id: "demo", code: "final" });
  assert.equal(store.calls, 2);
  assert.equal(JSON.parse(store.values.get(scriptKey)!).metadata.extra, 8);
  assert.equal(store.values.has("nse:script:demo.nse"), false);
});

void test("repeated suffix IDs fail closed before mutation or tombstone creation", async () => {
  for (const type of ["create", "update", "delete"] as const) {
    const store = seed();
    const before = [...store.values];
    await assert.rejects(mutateNseScript(store, { type, id: "foo.nse.nse", name: "Foo", code: "new" }), /Invalid NSE script ID/);
    assert.deepEqual([...store.values], before);
    assert.equal(store.calls, 0);
  }
  const store = seed();
  store.values.set(manifestKey, JSON.stringify({ scripts: { "foo.nse.nse": {} } }));
  const before = [...store.values];
  await assert.rejects(mutateNseScript(store, create), /Invalid NSE script ID/);
  assert.deepEqual([...store.values], before);
  assert.equal(store.calls, 0);
});

void test("uppercase suffix identity survives create/update/delete and matches Go tombstones", async () => {
  const store = new Store();
  const id = "demo.NSE";
  await mutateNseScript(store, { ...create, id });
  await mutateNseScript(store, { type: "update", id, code: "edited" });
  assert.equal(JSON.parse(store.values.get("nse:script:demo.NSE")!).content, "edited");
  await mutateNseScript(store, { type: "delete", id });
  const manifest = JSON.parse(store.values.get(manifestKey)!);
  // Go CanonicalScriptID: basename, then lowercase-only TrimSuffix(".nse").
  const scannerId = id.slice(id.lastIndexOf("/") + 1).replace(/\.nse$/, "");
  assert.equal(manifest.deletedScripts[scannerId], true);
  assert.equal(manifest.deletedScripts.demo, undefined);
  assert.equal(store.values.has("nse:script:demo.NSE"), false);
  await mutateNseScript(store, { ...create, id: "demo" });
  assert.equal(JSON.parse(store.values.get(manifestKey)!).deletedScripts["demo.NSE"], true);
});
void test("whitespace, trailing slash and repeated suffix never target another script", async () => {
  for (const id of [" demo", "demo ", "demo/", "demo.nse.nse", "demo.nse "]) {
    for (const type of ["create", "update", "delete"] as const) {
      const store = seed();
      const before = [...store.values];
      await assert.rejects(mutateNseScript(store, { type, id, name: "Demo", code: "bad" }), /Invalid NSE script ID/);
      assert.deepEqual([...store.values], before);
      assert.equal(store.calls, 0);
    }
  }
});

void test("legacy REST null tags remain editable and deletable without losing extensions", async () => {
  for (const type of ["update", "delete"] as const) {
    const store = seed();
    store.values.set(scriptKey, JSON.stringify({ content: "-- REST body", metadata: { author: "", tags: null, description: "", extra: 8 }, custom: true }));
    await mutateNseScript(store, { type, id: "demo", code: "-- UI edit" });
    if (type === "update") {
      const content = JSON.parse(store.values.get(scriptKey)!);
      assert.deepEqual(content.metadata.tags, []);
      assert.equal(content.metadata.extra, 8);
      assert.equal(content.custom, true);
    } else {
      assert.equal(store.values.has(scriptKey), false);
      assert.equal(JSON.parse(store.values.get(manifestKey)!).deletedScripts.demo, true);
    }
  }
});

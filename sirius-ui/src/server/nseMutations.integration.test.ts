/* Synthetic JSON fixtures intentionally inspect arbitrary legacy fields. */
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
// Opt-in only. Never point this harness at application data. See scripts/test-nse-valkey.sh.
import assert from "node:assert/strict";
import Valkey from "iovalkey";
import test from "node:test";
import {
  mutateNseRepository,
  parseNseRepositories,
  NSE_REPO_MANIFEST_KEY,
} from "./nseRepositories";
import {
  mutateNseScript,
  readNseScriptContent,
  NSE_CAS_LUA,
  type NseStore,
} from "./nseMutations";
const address = process.env.SIRIUS_TEST_NSE_WORKFLOW_ADDR;
const port = Number(address?.split(":")[1]);
if (
  address &&
  (!/^127\.0\.0\.1:[0-9]+$/.test(address) || port < 1024 || port > 65535)
)
  throw new Error("Disposable loopback Valkey address required");
const opts = {
  host: "127.0.0.1",
  port,
  lazyConnect: true,
  retryStrategy: () => null,
};
const a = new Valkey(opts),
  b = new Valkey(opts),
  r = new Valkey(opts);
const M = "nse:manifest",
  P = "nse:script:";
const body = (content: string) =>
  JSON.stringify({
    content,
    metadata: { author: "old", extra: "preserved" },
    createdAt: 123,
  });
async function main() {
  await Promise.all([a.connect(), b.connect(), r.connect()]);
  const token = process.env.SIRIUS_TEST_NSE_WORKFLOW_TOKEN ?? "";
  assert(token.length >= 24, "Isolation token required");
  assert.equal(
    await r.get("sirius:test:nse-workflow:marker"),
    token,
    "Wrong disposable store"
  );
  const manifest = async () => JSON.parse((await r.get(M))!);
  const phase = process.env.SIRIUS_TEST_NSE_WORKFLOW_PHASE;
  if (phase === "rest-verify") {
    const restBody = await readNseScriptContent(r, "rest-omitted-metadata");
    assert.equal(restBody.content, "-- REST omitted metadata");
    assert.deepEqual(restBody.metadata?.tags, []);
    const m = await manifest();
    m.scripts["legacy-null-tags"] = {
      name: "legacy null tags",
      path: "scripts/legacy-null-tags.nse",
      source: { type: "custom" },
    };
    await r.set(M, JSON.stringify(m));
    await r.set(
      P + "legacy-null-tags",
      JSON.stringify({
        content: "-- older REST body",
        metadata: { tags: null },
      })
    );
    assert.equal(
      (await readNseScriptContent(r, "legacy-null-tags")).content,
      "-- older REST body"
    );
    await mutateNseScript(a, {
      type: "update",
      id: "legacy-null-tags",
      code: "-- edited older REST body",
    });
    assert.equal(
      (await readNseScriptContent(r, "legacy-null-tags")).content,
      "-- edited older REST body"
    );
    await mutateNseScript(a, { type: "delete", id: "legacy-null-tags" });
    console.log(
      "PASS actual UI reader accepts new REST omitted metadata and legacy null-tags bodies; legacy body remains editable"
    );
    return;
  }
  if (phase === "mutate") {
    const m = await manifest();
    assert(m.scripts["demo.NSE"]);
    assert(m.scripts.lower);
    assert(m.scripts.other);
    m.scripts["scripts/vendor/legacy.nse"] = {
      name: "legacy",
      path: "/independent/legacy.nse",
    };
    await r.set(M, JSON.stringify(m));
    await r.set(P + "scripts/vendor/legacy.nse", body("-- untouched legacy"));
    await r.set("unrelated:workflow", "unchanged");
    assert.equal(
      await mutateNseScript(a, { type: "delete", id: "scripts/demo.NSE" }),
      "demo.NSE"
    );
    await mutateNseScript(a, {
      type: "update",
      id: "lower",
      code: "-- UI override",
    });
    await mutateNseScript(a, {
      type: "create",
      id: "custom-workflow",
      name: "Custom workflow",
      code: "-- custom workflow",
    });
    console.log(
      "PASS workflow UI delete uppercase extension, update repository body, create custom"
    );
    return;
  }
  if (phase === "verify") {
    const m = await manifest();
    assert.equal(m.deletedScripts["demo.NSE"], true);
    assert(!m.scripts["demo.NSE"]);
    assert.equal(await r.get(P + "demo.NSE"), null);
    assert.equal(m.scripts.lower.source.repository, "alpha");
    assert.equal(m.scripts.other.source.repository, "beta");
    assert.equal(
      JSON.parse((await r.get(P + "lower"))!).content,
      "-- UI override"
    );
    assert.equal(m.scripts["custom-workflow"].source.type, "custom");
    assert.equal(
      JSON.parse((await r.get(P + "custom-workflow"))!).content,
      "-- custom workflow"
    );
    // Sync may canonicalize this alias only while atomically migrating its body.
    const legacyID = m.scripts.legacy ? "legacy" : "scripts/vendor/legacy.nse";
    assert.equal(m.scripts[legacyID].path, "/independent/legacy.nse");
    assert.equal(await r.get(P + legacyID), body("-- untouched legacy"));
    assert.equal(await r.get("unrelated:workflow"), "unchanged");
    console.log(
      "PASS workflow after Sync: tombstone, override, custom, both repositories, legacy path/body and unrelated key"
    );
    return;
  }
  if (phase) throw new Error("Unknown UI integration phase");
  let repoCasMisses = 0;
  const repositoryPair = () => {
    let arrived = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const wrap = (client: NseStore): NseStore => {
      let first = true;
      return {
        get: (key) => client.get(key),
        eval: async (script, count, ...args) => {
          if (first) {
            first = false;
            if (++arrived === 2) release();
            await gate;
          }
          const result = await client.eval(script, count, ...args);
          if (result === 0) repoCasMisses++;
          return result;
        },
      };
    };
    return [wrap(a), wrap(b)] as const;
  };
  const repos = async () =>
    parseNseRepositories((await r.get(NSE_REPO_MANIFEST_KEY))!);
  await r.set(
    NSE_REPO_MANIFEST_KEY,
    JSON.stringify({ repositories: [], future: { keep: true } })
  );
  for (let round = 0; round < 50; round++) {
    const [left, right] = repositoryPair();
    const x = `repo-${round}-a`,
      y = `repo-${round}-b`;
    await Promise.all([
      mutateNseRepository(left, {
        type: "add",
        name: x,
        url: "https://example.invalid/a",
      }),
      mutateNseRepository(right, {
        type: "add",
        name: y,
        url: "https://example.invalid/b",
      }),
    ]);
    const m = await repos();
    assert(m.repositories.some((repo) => repo.name === x));
    assert(m.repositories.some((repo) => repo.name === y));
    assert.deepEqual(m.future, { keep: true });
  }
  assert.equal((await repos()).repositories.length, 100);
  assert.equal(repoCasMisses, 50);
  console.log(
    "PASS repository add/add: 50 forced real CAS conflicts, all 100 entries and extension fields preserved"
  );
  {
    const [left, right] = repositoryPair();
    await Promise.all([
      mutateNseRepository(left, { type: "remove", name: "repo-0-a" }),
      mutateNseRepository(right, {
        type: "add",
        name: "repo-added",
        url: "https://example.invalid/new",
      }),
    ]);
    const m = await repos();
    assert.equal(m.repositories.length, 100);
    assert(!m.repositories.some((repo) => repo.name === "repo-0-a"));
    assert(m.repositories.some((repo) => repo.name === "repo-added"));
    assert(m.repositories.some((repo) => repo.name === "repo-0-b"));
    assert.deepEqual(m.future, { keep: true });
  }
  await r.del(NSE_REPO_MANIFEST_KEY);
  {
    const [left, right] = repositoryPair();
    await Promise.all([
      mutateNseRepository(left, { type: "initialize" }),
      mutateNseRepository(right, {
        type: "add",
        name: "initial-custom",
        url: "https://example.invalid/custom",
      }),
    ]);
    assert(
      (await repos()).repositories.some(
        (repo) => repo.name === "initial-custom"
      )
    );
  }
  const empty = JSON.stringify({ repositories: [], future: { keep: true } });
  await r.set(NSE_REPO_MANIFEST_KEY, empty);
  assert.equal(await mutateNseRepository(a, { type: "initialize" }), false);
  assert.equal(await r.get(NSE_REPO_MANIFEST_KEY), empty);
  {
    const [left, right] = repositoryPair();
    const mutation = {
      type: "add" as const,
      name: "same-name",
      url: "https://example.invalid/same",
    };
    const results = await Promise.allSettled([
      mutateNseRepository(left, mutation),
      mutateNseRepository(right, mutation),
    ]);
    assert.equal(
      results.filter((result) => result.status === "fulfilled").length,
      1
    );
    assert.equal(
      results.filter((result) => result.status === "rejected").length,
      1
    );
    assert.equal((await repos()).repositories.length, 1);
  }
  console.log(
    "PASS repository remove/add, init/add, explicit empty initialization and duplicate-name concurrency"
  );
  let casMisses = 0;
  for (let round = 0; round < 50; round++) {
    const x = `distinct-${round}-a`,
      y = `distinct-${round}-b`;
    let arrived = 0;
    let release!: () => void;
    const gate = new Promise<void>((ok) => (release = ok));
    const wrap = (client: NseStore) => {
      let first = true;
      return {
        get: (key: string) => client.get(key),
        eval: async (script: string, count: number, ...args: string[]) => {
          if (first) {
            first = false;
            if (++arrived === 2) release();
            await gate;
          }
          const result = await client.eval(script, count, ...args);
          if (result === 0) casMisses++;
          return result;
        },
      };
    };
    await Promise.all([
      mutateNseScript(wrap(a), { type: "create", id: x, name: x, code: x }),
      mutateNseScript(wrap(b), { type: "create", id: y, name: y, code: y }),
    ]);
    const m = await manifest();
    assert(m.scripts[x]);
    assert(m.scripts[y]);
    assert(await r.get(P + x));
    assert(await r.get(P + y));
  }
  assert(casMisses >= 50);
  console.log(
    "PASS distinct concurrent creates: 50 forced collisions, both entries/bodies preserved; CAS misses=" +
      casMisses
  );
  let snapshots = 0,
    stop = false;
  const observer = (async () => {
    while (!stop) {
      const [raw, content] = await r.mget(M, P + "race");
      const m = raw ? JSON.parse(raw) : { scripts: {} };
      if (content !== null) assert(m.scripts.race, "body without index");
      if (m.deletedScripts?.race)
        assert.equal(content, null, "tombstone with body");
      snapshots++;
    }
  })();
  for (let i = 0; i < 150; i++) {
    await mutateNseScript(a, {
      type: "create",
      id: "race",
      name: "race",
      code: String(i),
    });
    const results = await Promise.allSettled([
      mutateNseScript(a, { type: "update", id: "race", code: "updated" }),
      mutateNseScript(b, { type: "delete", id: "race" }),
    ]);
    assert.equal(results[1].status, "fulfilled");
    assert.equal(await r.get(P + "race"), null);
    assert.equal((await manifest()).deletedScripts.race, true);
  }
  stop = true;
  await observer;
  console.log(
    "PASS create/update/delete/read races: 150 cycles, " +
      snapshots +
      " atomic snapshots, no orphan body or tombstone/body conflict"
  );
  await r.set("unrelated:raw", "keep-me");
  const legacy = "scripts/vendor/legacy.nse",
    other = "scripts/vendor/other.nse";
  await r.set(
    M,
    JSON.stringify({
      version: 7,
      unknown: "keep",
      scripts: {
        [legacy]: { name: "Legacy", path: "/independent/location/run.nse" },
        [other]: { name: "Other", path: "/independent/other.nse" },
      },
      deletedScripts: { old: true },
    })
  );
  await r.set(P + legacy, body("legacy"));
  await r.set(P + other, body("other"));
  const otherBefore = await r.get(P + other);
  await mutateNseScript(a, {
    type: "update",
    id: "legacy",
    code: "new",
    metadata: { description: "edited" },
  });
  let m = await manifest();
  assert.equal(m.scripts.legacy.path, "/independent/location/run.nse");
  assert(!m.scripts[legacy]);
  assert(m.scripts[other]);
  assert.equal(m.unknown, "keep");
  assert.equal(m.version, 7);
  assert.equal(m.deletedScripts.old, true);
  assert.equal(await r.get(P + legacy), null);
  assert.equal(await r.get(P + other), otherBefore);
  assert.equal(await r.get("unrelated:raw"), "keep-me");
  const migrated = JSON.parse((await r.get(P + "legacy"))!);
  assert.equal(migrated.createdAt, 123);
  assert.equal(migrated.metadata.extra, "preserved");
  assert.equal(migrated.content, "new");
  console.log(
    "PASS legacy migration, independent execution path, unrelated raw alias/body and metadata preservation"
  );
  await mutateNseScript(a, { type: "delete", id: "other" });
  m = await manifest();
  assert.equal(m.deletedScripts.other, true);
  assert(!m.scripts[other]);
  assert.equal(await r.get(P + other), null);
  assert.equal(await r.get(P + "other"), null);
  await mutateNseScript(a, {
    type: "create",
    id: "other",
    name: "Recreated",
    code: "fresh",
  });
  m = await manifest();
  assert(!m.deletedScripts.other);
  assert(m.scripts.other);
  assert.equal(JSON.parse((await r.get(P + "other"))!).content, "fresh");
  assert.equal(m.deletedScripts.old, true);
  console.log(
    "PASS delete removes legacy/canonical bodies, keeps explicit tombstone; recreate removes only matching tombstone"
  );
  await r.set("cas-a", "a");
  await r.set("cas-b", "b");
  const miss = await r.eval(
    NSE_CAS_LUA,
    2,
    "cas-a",
    "cas-b",
    "1",
    "a",
    "set",
    "changed",
    "1",
    "stale",
    "delete",
    ""
  );
  assert.equal(miss, 0);
  assert.deepEqual(await r.mget("cas-a", "cas-b"), ["a", "b"]);
  console.log("PASS actual Lua compares every snapshot before any write");
  console.log("ALL PASS");
}
void test(
  "NSE actual Lua against disposable Valkey",
  { skip: !address },
  async () => {
    try {
      await main();
    } finally {
      await Promise.all([a.quit(), b.quit(), r.quit()]);
    }
  }
);

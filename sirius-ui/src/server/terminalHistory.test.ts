import assert from "node:assert/strict";
import test from "node:test";
import {
  deleteHistoryEntry,
  parseHistoryEntries,
  type HistoryStore,
} from "./terminalHistory";

const entry = (id: string) => ({
  id,
  timestamp: "2026-11-08T01:00:00.000Z",
  command: "help",
  target: { type: "engine" as const },
  output: "Help",
  success: true,
});
const encoded = (id: string) => JSON.stringify(entry(id));

void test("one corrupt entry does not hide valid terminal history", () => {
  assert.deepEqual(
    parseHistoryEntries([
      encoded("new"),
      "{",
      "null",
      "[]",
      JSON.stringify({ id: "incomplete" }),
      JSON.stringify({ ...entry("bad-date"), timestamp: "not a date" }),
      encoded("old"),
    ]),
    [entry("new"), entry("old")]
  );
});

void test("delete preserves commands appended after its read", async () => {
  let values = [encoded("delete"), encoded("keep")];
  const store: HistoryStore = {
    lrange: () => {
      const snapshot = [...values];
      values.unshift(encoded("concurrent"));
      return Promise.resolve(snapshot);
    },
    lrem: (_key, _count, value) => {
      const before = values.length;
      values = values.filter((item) => item !== value);
      return Promise.resolve(before - values.length);
    },
  };
  await deleteHistoryEntry(store, "isolated-fixture", "delete");
  assert.deepEqual(values, [encoded("concurrent"), encoded("keep")]);
});

void test("delete does not resurrect entries cleared after its read", async () => {
  let values = [encoded("delete"), encoded("keep")];
  const store: HistoryStore = {
    lrange: () => {
      const snapshot = [...values];
      values = [];
      return Promise.resolve(snapshot);
    },
    lrem: (_key, _count, value) => {
      values = values.filter((item) => item !== value);
      return Promise.resolve(0);
    },
  };
  await deleteHistoryEntry(store, "isolated-fixture", "delete");
  assert.deepEqual(values, []);
});

void test("delete tolerates corrupt neighboring entries and propagates storage errors", async () => {
  const removed: string[] = [];
  const store: HistoryStore = {
    lrange: () =>
      Promise.resolve(["null", "{", encoded("delete"), encoded("keep")]),
    lrem: (_key, _count, value) => {
      removed.push(value);
      return Promise.resolve(1);
    },
  };
  await deleteHistoryEntry(store, "isolated-fixture", "delete");
  assert.deepEqual(removed, [encoded("delete")]);
  store.lrem = () => Promise.reject(new Error("store unavailable"));
  await assert.rejects(
    deleteHistoryEntry(store, "isolated-fixture", "delete"),
    /store unavailable/
  );
});

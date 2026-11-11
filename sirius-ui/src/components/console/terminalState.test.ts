import assert from "node:assert/strict";
import test from "node:test";
import { parseTerminalState } from "./terminalState";

void test("malformed saved fields recover independently and preserve valid preferences", () => {
  const state = parseTerminalState({
    version: 1,
    tabs: null,
    agentTags: null,
    agentGroups: [{ id: "broken" }],
    commandHistory: "not an array",
    annotations: [{}],
    selectedTarget: { type: "agent" },
    fontSize: 18,
    sidebarCollapsed: true,
  });
  assert.deepEqual(state.tabs, [
    { id: "main", name: "Main", target: { type: "engine" } },
  ]);
  assert.deepEqual(state.agentTags, {});
  assert.deepEqual(state.agentGroups, []);
  assert.deepEqual(state.commandHistory, []);
  assert.deepEqual(state.annotations, []);
  assert.deepEqual(state.selectedTarget, { type: "engine" });
  assert.equal(state.fontSize, 18);
  assert.equal(state.sidebarCollapsed, true);
});

void test("missing, null, array and unsupported-version snapshots restore defaults", () => {
  for (const value of [
    undefined,
    null,
    [],
    "bad",
    { version: 2, fontSize: 20 },
  ]) {
    const state = parseTerminalState(value);
    assert.equal(state.fontSize, 14);
    assert.equal(state.activeTabId, "main");
  }
});

void test("invalid numeric and enum settings cannot reach UI components", () => {
  const state = parseTerminalState({
    version: 1,
    fontSize: -5,
    sidebarWidth: Infinity,
    concurrencyLimit: 0,
    activeView: "invalid",
    groupingMode: "invalid",
    timestampMode: "false",
  });
  assert.equal(state.fontSize, 14);
  assert.equal(state.sidebarWidth, 288);
  assert.equal(state.concurrencyLimit, 50);
  assert.equal(state.activeView, "terminal");
  assert.equal(state.groupingMode, "flat");
  assert.equal(state.timestampMode, false);
});

void test("tabs always have a valid active tab, and duplicate or empty tabs recover", () => {
  const tab = {
    id: "custom",
    name: "Custom",
    target: { type: "agent", id: "agent-1" },
  };
  assert.equal(
    parseTerminalState({ version: 1, tabs: [tab], activeTabId: "missing" })
      .activeTabId,
    "custom"
  );
  for (const tabs of [[], [tab, tab]]) {
    assert.equal(parseTerminalState({ version: 1, tabs }).activeTabId, "main");
  }
});

void test("valid saved state round-trips without sharing mutable defaults", () => {
  const state = parseTerminalState({
    version: 1,
    commandHistory: ["help"],
    agentTags: { a: ["prod"] },
  });
  assert.deepEqual(parseTerminalState(state), state);
  state.tabs.push({
    id: "another",
    name: "Another",
    target: { type: "engine" },
  });
  assert.equal(parseTerminalState(undefined).tabs.length, 1);
  assert.equal(
    parseTerminalState({ version: 1, commandHistory: Array(201).fill("help") })
      .commandHistory.length,
    200
  );
});

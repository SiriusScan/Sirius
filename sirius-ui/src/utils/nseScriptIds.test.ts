import assert from "node:assert/strict";
import test from "node:test";

import {
  ALL_NSE_SCRIPTS,
  canonicalizeScriptId,
  canonicalizeScriptIds,
  summarizeScriptRefs,
} from "./nseScriptIds";

void test("canonicalizeScriptId strips paths and extensions", () => {
  assert.equal(canonicalizeScriptId("scripts/http-title.nse"), "http-title");
  assert.equal(canonicalizeScriptId(" vulners "), "vulners");
  assert.equal(canonicalizeScriptId(ALL_NSE_SCRIPTS), ALL_NSE_SCRIPTS);
});

void test("canonicalizeScriptIds deduplicates equivalent script refs", () => {
  assert.deepEqual(
    canonicalizeScriptIds([
      "scripts/http-title.nse",
      "http-title",
      "custom/http-title.nse",
      "vulners",
    ]),
    ["http-title", "vulners"]
  );
});

void test("summarizeScriptRefs resolves canonical matches", () => {
  assert.deepEqual(
    summarizeScriptRefs(
      ["scripts/http-title.nse", "custom/vulners.nse", "missing-script.nse"],
      ["http-title", "vulners", "ssl-cert"]
    ),
    {
      linkedScriptCount: 2,
      totalScriptRefs: 3,
      missingScriptRefs: 1,
      hasWildcard: false,
    }
  );
});

void test("summarizeScriptRefs expands wildcard to all available scripts", () => {
  assert.deepEqual(
    summarizeScriptRefs([ALL_NSE_SCRIPTS], ["http-title", "vulners", "ssl-cert"]),
    {
      linkedScriptCount: 3,
      totalScriptRefs: 3,
      missingScriptRefs: 0,
      hasWildcard: true,
    }
  );
});

import assert from "node:assert/strict";
import {
  SEVERITIES,
  countBySeverity,
  emptySeverityCounts,
  formatSeverityParam,
  highestSeverity,
  isSeverity,
  normalizeSeverity,
  parseSeverity,
  parseSeverityParam,
  severityRank,
  toSeverityCounts,
  toggleSeverity,
  totalCount,
} from "./severity";

assert.deepEqual([...SEVERITIES], ["critical", "high", "medium", "low", "info"]);

// Parsing existing spellings.
assert.equal(parseSeverity("CRITICAL"), "critical");
assert.equal(parseSeverity(" High "), "high");
assert.equal(parseSeverity("Moderate"), "medium");
assert.equal(parseSeverity("informational"), "info");
assert.equal(parseSeverity("INFO"), "info");
assert.equal(parseSeverity("bogus"), null);
assert.equal(parseSeverity(undefined), null);
assert.equal(normalizeSeverity("bogus"), "info");
assert.equal(normalizeSeverity("LOW"), "low");
assert.ok(isSeverity("medium"));
assert.ok(!isSeverity("informational"));

// Ranks sort most severe first.
assert.ok(severityRank("critical") > severityRank("high"));
assert.equal(severityRank("info"), 0);

// Converting count shapes.
assert.deepEqual(
  toSeverityCounts({ critical: 0, high: 3, medium: 155, low: 4, informational: 0, total: 162 }),
  { critical: 0, high: 3, medium: 155, low: 4, info: 0 },
);
assert.deepEqual(toSeverityCounts({ CRITICAL: 2, Info: "5" }), { ...emptySeverityCounts(), critical: 2, info: 5 });
// Canonical key wins over an alias for the same level; no double counting.
assert.deepEqual(toSeverityCounts({ informational: 7, info: 2 }), { ...emptySeverityCounts(), info: 2 });
assert.deepEqual(toSeverityCounts({ info: 2, informational: 7 }), { ...emptySeverityCounts(), info: 2 });
assert.deepEqual(toSeverityCounts({ high: -1, low: Number.NaN, medium: null }), emptySeverityCounts());
assert.deepEqual(toSeverityCounts(undefined), emptySeverityCounts());

const counted = countBySeverity([
  { severity: "HIGH" },
  { severity: "high" },
  { severity: "Medium" },
  { severity: "unknown" },
]);
assert.deepEqual(counted, { critical: 0, high: 2, medium: 1, low: 0, info: 1 });
assert.deepEqual(countBySeverity(["low", "LOW"], (s) => s), { ...emptySeverityCounts(), low: 2 });
assert.equal(totalCount(counted), 4);
assert.equal(highestSeverity(counted), "high");
assert.equal(highestSeverity(emptySeverityCounts()), null);

// URL filters.
assert.deepEqual(parseSeverityParam("high,critical"), ["critical", "high"]);
assert.deepEqual(parseSeverityParam(["low", "HIGH,bogus"]), ["high", "low"]);
assert.deepEqual(parseSeverityParam(undefined), []);
assert.equal(formatSeverityParam(["low", "critical"]), "critical,low");
assert.equal(formatSeverityParam([]), undefined);
assert.deepEqual(toggleSeverity(["high"], "critical"), ["critical", "high"]);
assert.deepEqual(toggleSeverity(["critical", "high"], "critical"), ["high"]);

console.log("severity: all cases pass");

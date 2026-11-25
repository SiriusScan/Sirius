import assert from "node:assert/strict";
import {
  compareRisk,
  findingScore,
  findingSeverity,
  hostRisk,
  hostRiskScore,
  normalizeSeverityLabel,
  riskBand,
  roundScore,
  severityCounts,
  toLegacySeverityCounts,
} from "./risk";

// Findings shaped like the live inventory (web01: vulners CVSS on most,
// MEND entries with no CVSS and no severity).
const web01 = [
  { id: "CVE-2017-3167", cvss: 9.8 },
  { id: "CVE-2026-60002", cvss: 9.4 },
  { id: "CVE-2026-35414", cvss: 8.1 },
  { id: "CVE-2026-59999", cvss: 5.4 },
  { id: "CVE-2026-106582", cvss: 3.7 },
  { id: "CVE-2025-49812", cvss: 0 }, // MEND line: scanner left CVSS unknown
];

// Score: highest CVSS; missing CVSS uses the severity floor.
assert.equal(hostRiskScore([]), 0, "no findings");
assert.equal(hostRiskScore(web01), 9.8, "highest CVSS");
assert.equal(hostRiskScore([{ cvss: 8.1 }, { cvss: 7.5 }]), 8.1);
assert.equal(hostRiskScore([{ severity: "critical" }]), 9.0, "critical floor");
assert.equal(hostRiskScore([{ severity: "HIGH" }]), 7.0, "high floor");
assert.equal(hostRiskScore([{ severity: "Medium" }]), 4.0, "medium floor");
assert.equal(hostRiskScore([{ severity: "low" }]), 0.1, "low floor");
assert.equal(hostRiskScore([{ severity: "informational" }]), 0, "info floor");
assert.equal(hostRiskScore([{ severity: "info" }, { cvss: 0 }]), 0);
assert.equal(hostRiskScore([{ cvss: 0, severity: "high" }]), 7.0, "0 CVSS is unknown");
assert.equal(hostRiskScore([{ cvss: null, severity: "medium" }, { cvss: 3.1 }]), 4.0);
assert.equal(hostRiskScore([{ cvss: 6.25 }]), 6.3, "one decimal");
assert.equal(hostRiskScore([{ cvss: 12 }]), 10, "clamped");
assert.equal(hostRiskScore([{ cvss: Number.NaN, severity: "low" }]), 0.1);

// Bands: 9+ critical, 7+ high, 4+ medium, >0 low, else none.
const bands: Array<[number, ReturnType<typeof riskBand>]> = [
  [9.8, "critical"], [9.0, "critical"], [8.9, "high"], [7.0, "high"],
  [6.9, "medium"], [4.0, "medium"], [3.9, "low"], [0.1, "low"], [0, "none"],
];
for (const [score, band] of bands) assert.equal(riskBand(score), band, String(score));

// Finding severity: CVSS band first, then the source label, else info.
assert.equal(findingSeverity({ cvss: 9.4 }), "critical");
assert.equal(findingSeverity({ cvss: 8.1, severity: "critical" }), "high", "CVSS wins");
assert.equal(findingSeverity({ cvss: 0, severity: "HIGH" }), "high");
assert.equal(findingSeverity({}), "info");
assert.equal(findingSeverity({ severity: "nonsense" }), "info");
assert.equal(findingScore({ severity: "nonsense" }), 0);
assert.equal(normalizeSeverityLabel(""), null);
assert.equal(normalizeSeverityLabel("INFORMATIONAL"), "info");
assert.equal(normalizeSeverityLabel("CRIT"), "critical");

// Counts of open findings by severity.
assert.deepEqual(severityCounts(web01), {
  critical: 2, high: 1, medium: 1, low: 1, info: 1,
});
assert.deepEqual(toLegacySeverityCounts(severityCounts(web01)), {
  critical: 2, high: 1, medium: 1, low: 1, informational: 1,
});

// hostRisk: score, band, the CVE behind it, counts.
const risk = hostRisk(web01);
assert.equal(risk.riskScore, 9.8);
assert.equal(risk.riskBand, "critical");
assert.equal(risk.riskCve, "CVE-2017-3167");
assert.equal(risk.openFindings, 6);
assert.deepEqual(hostRisk([]), {
  riskScore: 0,
  riskBand: "none",
  counts: { critical: 0, high: 0, medium: 0, low: 0, info: 0 },
  openFindings: 0,
});
assert.equal(hostRisk([{ id: "CVE-1", cvss: 0 }]).riskCve, undefined, "no CVE behind a 0");
assert.equal(
  hostRisk([{ id: "CVE-A", cvss: 7.5 }, { id: "CVE-B", cvss: 7.5 }]).riskCve,
  "CVE-A",
  "first at the top score names it",
);

// Ranking: riskScore desc, then critical desc, then high desc.
const hosts = [
  { ip: "a", riskScore: 8.1, counts: { critical: 0, high: 3 } },
  { ip: "b", riskScore: 9.8, counts: { critical: 1, high: 0 } },
  { ip: "c", riskScore: 9.8, counts: { critical: 4, high: 0 } },
  { ip: "d", riskScore: 8.1, counts: { critical: 0, high: 9 } },
  { ip: "e", riskScore: 0, counts: { critical: 0, high: 0 } },
];
assert.deepEqual(
  [...hosts].sort(compareRisk).map((h) => h.ip),
  ["c", "b", "d", "a", "e"],
);

assert.equal(roundScore(-1), 0);
assert.equal(roundScore(Number.POSITIVE_INFINITY), 0);

console.log("risk: all cases pass");

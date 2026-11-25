import assert from "node:assert/strict";
import {
  aggregateScanFindings,
  currentStep,
  elapsedMs,
  formatElapsed,
  inventoryBadge,
  isScanEnded,
  knownText,
  profileInfo,
  profileLabel,
  rescanHref,
  runTitle,
  scanDurationMs,
  scanProfileId,
  scanSeverityCounts,
  scanSteps,
  scanTargetLabels,
  subScanDetail,
} from "./scanRunModel";

// Status and titles
assert.equal(runTitle("running"), "Running scan");
assert.equal(runTitle("cancelling"), "Stopping scan");
assert.equal(runTitle("completed"), "Scan completed");
assert.equal(runTitle("cancelled"), "Scan stopped");
assert.equal(runTitle("failed"), "Scan failed");
assert.equal(runTitle(undefined), "Scan");
assert.equal(isScanEnded("completed"), true);
assert.equal(isScanEnded("running"), false);
assert.equal(isScanEnded(undefined), false);

// Targets: strings and objects, de-duplicated, blanks dropped
assert.deepEqual(
  scanTargetLabels(["192.0.2.12", { ip: "10.0.0.1" }, { value: "10.0.0.0/24" }, "", "192.0.2.12", { id: "x" }]),
  ["192.0.2.12", "10.0.0.1", "10.0.0.0/24", "x"],
);
assert.deepEqual(scanTargetLabels(undefined), []);

// Elapsed
assert.equal(elapsedMs("2026-11-21T21:39:07Z", "2026-11-21T21:42:20Z"), 193_000);
assert.equal(elapsedMs("2026-11-21T21:39:07Z", undefined, Date.parse("2026-11-21T21:39:17Z")), 10_000);
assert.equal(elapsedMs(undefined, undefined), null);
assert.equal(elapsedMs("0001-01-01T00:00:00Z", undefined), null);
assert.equal(elapsedMs("2026-11-21T21:39:07Z", "2026-11-21T21:39:00Z"), 0);
assert.equal(scanDurationMs("2026-11-21T21:39:07Z", "2026-11-21T21:42:20Z", false), 193_000);
assert.equal(scanDurationMs("2026-11-21T21:39:07Z", undefined, false), null);
assert.equal(scanDurationMs("2026-11-21T21:39:07Z", "0001-01-01T00:00:00Z", false), null);
assert.equal(scanDurationMs("2026-11-21T21:39:07Z", "2026-11-21T21:42:20Z", true, Date.parse("2026-11-21T21:39:17Z")), 10_000);
assert.equal(formatElapsed(5_000), "0:05");
assert.equal(formatElapsed(193_000), "3:13");
assert.equal(formatElapsed(23 * 60_000 + 41_000), "23:41");
assert.equal(formatElapsed(3_723_000), "1:02:03");
assert.equal(formatElapsed(-5), "0:00");

// Steps come only from the scan's own sub-scans (live shape)
const completedScan = {
  status: "completed" as const,
  sub_scans: {
    network: { type: "network", enabled: true, status: "completed" as const, progress: { completed: 1, total: 1 } },
  },
};
assert.deepEqual(scanSteps(completedScan), [
  { id: "network", label: "Network scan", state: "done", detail: "1 of 1 hosts" },
  { id: "end", label: "Complete", state: "done" },
]);

const running = {
  status: "running" as const,
  sub_scans: {
    agent: { type: "agent", enabled: true, status: "dispatching" as const, progress: { completed: 0, total: 0, label: "agents" } },
    network: { type: "network", enabled: true, status: "running" as const, progress: { completed: 0, total: 3 } },
  },
};
const runningSteps = scanSteps(running);
assert.deepEqual(
  runningSteps.map((s) => [s.id, s.state, s.detail]),
  [
    ["network", "running", "0 of 3 hosts"],
    ["agent", "running", undefined],
    ["end", "pending", undefined],
  ],
);
assert.equal(currentStep(runningSteps)?.id, "network");

// A sub-scan still running when the scan was stopped reads "stopped"
const stopped = scanSteps({
  status: "cancelled",
  sub_scans: { network: { type: "network", enabled: true, status: "running", progress: { completed: 1, total: 4 } } },
});
assert.deepEqual(stopped.map((s) => [s.label, s.state]), [
  ["Network scan", "stopped"],
  ["Stopped", "stopped"],
]);
assert.deepEqual(scanSteps({ status: "running" }), []);
assert.deepEqual(scanSteps(null), []);
assert.deepEqual(
  scanSteps({
    status: "running",
    sub_scans: { network: { type: "network", enabled: false, status: "pending", progress: { completed: 0, total: 0 } } },
  }),
  [],
);
assert.equal(subScanDetail("network", { progress: { completed: 0, total: 0 } }), undefined);
assert.equal(subScanDetail("agent", { progress: { completed: 2, total: 0 } }), "2 agents");
assert.equal(subScanDetail("network", { progress: { completed: 5, total: 3 } }), "3 of 3 hosts");

// Profile: only from real records
assert.equal(scanProfileId({ id: "s1", profile_id: "quick" }), "quick");
assert.equal(scanProfileId({ id: "s1", options: { template_id: "high-risk" } }), "high-risk");
assert.equal(
  scanProfileId({ id: "s1" }, [
    { time: "2026-11-21T21:40:00Z", source: "nmap", scanId: "older", profile: "all" },
    { time: "2026-11-21T21:41:00Z", source: "nmap", scanId: "s1", profile: "quick" },
  ]),
  "quick",
);
assert.equal(scanProfileId({ id: "s1" }, [{ time: "x", source: "nmap", scanId: "older", profile: "all" }]), undefined);
assert.equal(scanProfileId({ id: "s1" }, [null, undefined]), undefined);
assert.equal(scanProfileId(null), undefined);

const profiles = [
  { id: "high-risk", name: "High Risk Scan", enabled_scripts: Array.from({ length: 14 }, (_, i) => `s${i}`) },
  { id: "one", name: "One", enabled_scripts: ["a"] },
];
assert.equal(profileLabel(profileInfo("high-risk", profiles)!), "High Risk Scan · 14 scripts");
assert.equal(profileLabel(profileInfo("one", profiles)!), "One · 1 script");
assert.equal(profileLabel(profileInfo("gone", profiles)!), "gone");
assert.equal(profileInfo(undefined, profiles), undefined);

// Findings: counts per host and CVE; rows per CVE
const findings = [
  { id: "CVE-1", severityKey: "high" as const, cvss: 7.7, summary: "ssh in OpenSSH before 10.4", host_id: "10.0.0.1", component: { label: "openbsd openssh 10.0p2" } },
  { id: "CVE-1", severityKey: "critical" as const, cvss: 9.4, summary: "", host_id: "10.0.0.2" },
  { id: "CVE-1", severityKey: "high" as const, cvss: 7.7, summary: "dup on same host", host_id: "10.0.0.1" },
  { id: "CVE-2", severityKey: "info" as const, cvss: 0, summary: "", host_id: "10.0.0.1" },
  { id: "", severityKey: "low" as const, cvss: Number.NaN },
];
assert.deepEqual(scanSeverityCounts(findings), { critical: 1, high: 2, medium: 0, low: 1, info: 1 });
const rows = aggregateScanFindings(findings);
assert.deepEqual(rows, [
  {
    id: "CVE-1",
    severity: "critical",
    cvss: 9.4,
    summary: "ssh in OpenSSH before 10.4",
    portService: "openbsd openssh 10.0p2",
    hosts: 2,
  },
  { id: "CVE-2", severity: "info", cvss: 0, summary: "", hosts: 1 },
  { id: "Unknown", severity: "low", cvss: 0, summary: "", hosts: 1 },
]);
assert.deepEqual(aggregateScanFindings([]), []);

// Inventory badge
const start = "2026-11-21T21:39:07Z";
assert.deepEqual(inventoryBadge({ inInventory: false, scanActive: true }), { kind: "pending", label: "Not saved yet" });
assert.deepEqual(inventoryBadge({ inInventory: false, scanActive: false }), { kind: "missing", label: "Not in inventory" });
assert.deepEqual(
  inventoryBadge({ inInventory: true, savedAt: "2026-11-21T21:40:00Z", scanStart: start, scanId: "s1", scanActive: true }),
  { kind: "saved", label: "Saved to inventory", time: "2026-11-21T21:40:00Z" },
);
assert.deepEqual(
  inventoryBadge({
    inInventory: true,
    savedAt: "2026-11-20T10:00:00Z",
    lastScan: { time: "2026-11-21T21:41:00Z", source: "nmap", scanId: "s1" },
    scanStart: start,
    scanId: "s1",
    scanActive: false,
  }),
  { kind: "updated", label: "Updated in inventory", time: "2026-11-21T21:41:00Z" },
);
assert.deepEqual(
  inventoryBadge({
    inInventory: true,
    savedAt: "2026-11-20T10:00:00Z",
    lastScan: { time: "2026-11-20T10:00:00Z", source: "nmap", scanId: "older" },
    scanStart: start,
    scanId: "s1",
    scanActive: false,
  }),
  { kind: "since", label: "In inventory since", time: "2026-11-20T10:00:00Z" },
);
assert.deepEqual(inventoryBadge({ inInventory: true, scanActive: true }), { kind: "listed", label: "In inventory" });

// Text helpers
assert.equal(knownText("unknown"), undefined);
assert.equal(knownText(" Unknown "), undefined);
assert.equal(knownText(""), undefined);
assert.equal(knownText("Linux"), "Linux");
assert.equal(rescanHref(["192.0.2.12", "10.0.0.0/24"]), "/scanner?target=192.0.2.12%2C10.0.0.0%2F24");

console.log("scanRunModel: all cases pass");

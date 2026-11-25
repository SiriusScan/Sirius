import assert from "node:assert/strict";
import { IDLE_SCAN, isScanActive, scanIndicatorLabel, summarizeScan } from "./scanSummary";
import type { ScanResult } from "~/types/scanTypes";

const base: ScanResult = {
  id: "scan-1",
  status: "running",
  targets: ["192.0.2.12"],
  hosts: [],
  hosts_completed: 0,
  vulnerabilities: [],
  start_time: "2026-11-21T12:04:00Z",
};

// No scan record.
assert.deepEqual(summarizeScan(null), IDLE_SCAN);
assert.deepEqual(summarizeScan(undefined), IDLE_SCAN);
assert.deepEqual(summarizeScan({} as ScanResult), IDLE_SCAN);

// Running, before the scanner has reported progress: no percentage invented.
const fresh = summarizeScan({
  ...base,
  sub_scans: { network: { type: "network", enabled: true, status: "running", progress: { completed: 0, total: 0 } } },
});
assert.equal(fresh.active, true);
assert.equal(fresh.targets, 1);
assert.equal(fresh.progress, undefined);
assert.equal(scanIndicatorLabel(fresh), "Scanning 1 target");

// Progress from the scanner's own counters.
const partway = summarizeScan({
  ...base,
  targets: ["192.0.2.0/24", "10.0.0.5"],
  sub_scans: {
    network: { type: "network", enabled: true, status: "running", progress: { completed: 120, total: 254 } },
    agent: { type: "agent", enabled: true, status: "running", progress: { completed: 1, total: 2 } },
    cloud: { type: "cloud", enabled: false, status: "pending", progress: { completed: 0, total: 9 } },
  },
});
assert.equal(partway.total, 256);
assert.equal(partway.completed, 121);
assert.equal(partway.progress, 47);
assert.equal(scanIndicatorLabel(partway), "Scanning 2 targets · 47%");

// Completed counts never exceed totals.
const over = summarizeScan({
  ...base,
  sub_scans: { network: { type: "network", enabled: true, status: "running", progress: { completed: 5, total: 1 } } },
});
assert.equal(over.progress, 100);

// Stopping still counts as active.
const stopping = summarizeScan({ ...base, status: "cancelling" });
assert.equal(stopping.active, true);
assert.equal(scanIndicatorLabel(stopping), "Stopping scan");

// An admitted scan waiting for the scanner holds the slot.
const starting = summarizeScan({ ...base, status: "pending" });
assert.equal(starting.active, true);
assert.equal(scanIndicatorLabel(starting), "Starting scan");

// Finished scans are idle for the indicator.
for (const status of ["completed", "cancelled", "failed"] as const) {
  assert.equal(summarizeScan({ ...base, status }).active, false, status);
}
assert.ok(isScanActive("running"));
assert.ok(isScanActive("pending"));
assert.ok(!isScanActive(undefined));

console.log("scanSummary: all cases pass");

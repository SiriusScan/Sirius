import assert from "node:assert/strict";
import test from "node:test";
import type { RouterOutputs } from "~/utils/api";
import { projectSystemResources } from "./systemResourceObservations";

type ResourceData = RouterOutputs["system"]["resources"];
type Row = ResourceData["containers"][number];

function makeRow(name: string, observedAt: string, measurements: Row["measurements"]): Row {
  return {
    name, observed_at: observedAt, telemetry_status: "fresh", measurements,
    cpu_percent: 0, memory_usage: "", memory_percent: 0, network_io: "",
    disk_usage: "", disk_percent: 0, process_count: 0, file_descriptors: 0,
    load_average_1m: 0, load_average_5m: 0, load_average_15m: 0, uptime: "",
  };
}

const data: ResourceData = {
  timestamp: "2026-11-24T12:00:30Z",
  freshness_seconds: 20,
  availability: "available",
  containers: [
    makeRow("earlier", "2026-11-24T12:00:12Z", { cpu_percent: 80, memory_usage_bytes: 4096 }),
    makeRow("later", "2026-11-24T12:00:29Z", { cpu_percent: 0, memory_usage_bytes: 0 }),
    makeRow("legacy", "2026-11-24T12:00:29Z", {}),
  ],
  summary: {
    total_containers: 3, fresh_containers: 3, running_containers: 3,
    stale_containers: 0, missing_containers: 0, invalid_containers: 0,
    unavailable_containers: 0,
  },
};

test("refresh ages independent observations and keeps genuine zero", () => {
  const initial = projectSystemResources(data, 1000, 1000, false);
  assert.equal(initial.nextExpiry, 3000);
  assert.equal(initial.peakCPU, 80);
  assert.equal(initial.observedMemory, 4096);

  const next = projectSystemResources(data, 1000, 3001, false);
  assert.deepEqual(next.containers.map((row) => row.telemetry_status), ["stale", "fresh", "fresh"]);
  assert.equal(next.freshCount, 2);
  assert.equal(next.nextExpiry, 20000);
  assert.equal(next.peakCPU, 0);
  assert.equal(next.observedMemory, 0);
});

test("failed refresh retains last-observed rows outside aggregates", () => {
  const next = projectSystemResources(data, 1000, 1000, true);
  assert.deepEqual(next.containers.map((row) => row.telemetry_status), ["stale", "stale", "stale"]);
  assert.equal(next.peakCPU, undefined);
  assert.equal(next.observedMemory, undefined);
  assert.equal(next.stale, true);
});

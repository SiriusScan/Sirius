import type { RouterOutputs } from "~/utils/api";

type ResourceData = RouterOutputs["system"]["resources"];

export function projectSystemResources(
  data: ResourceData | undefined,
  dataUpdatedAt: number,
  now: number,
  refreshFailed: boolean
) {
  let nextExpiry = Infinity;
  const containers = data?.containers.map((row) => {
    if (row.telemetry_status !== "fresh") return row;
    // Anchor freshness to server time to tolerate browser clock offsets.
    const remaining = Date.parse(row.observed_at ?? "") +
      data.freshness_seconds * 1000 - Date.parse(data.timestamp);
    const expiresAt = dataUpdatedAt + remaining;
    if (refreshFailed || !Number.isFinite(expiresAt) || expiresAt <= now) {
      return { ...row, telemetry_status: "stale" as const };
    }
    nextExpiry = Math.min(nextExpiry, expiresAt);
    return row;
  }) ?? [];

  const fresh = containers.filter((row) => row.telemetry_status === "fresh");
  const stale = !fresh.length && containers.some((row) => row.telemetry_status === "stale");
  const partial = !!fresh.length && fresh.length !== data?.summary.total_containers;
  let peakCPU: number | undefined;
  let peakDisk: number | undefined;
  let observedMemory: number | undefined;
  for (const row of fresh) {
    const measurements = row.measurements;
    if (measurements.cpu_percent !== undefined) {
      peakCPU = Math.max(peakCPU ?? measurements.cpu_percent, measurements.cpu_percent);
    }
    if (measurements.disk_percent !== undefined) {
      peakDisk = Math.max(peakDisk ?? measurements.disk_percent, measurements.disk_percent);
    }
    if (measurements.memory_usage_bytes !== undefined) {
      observedMemory = (observedMemory ?? 0) + measurements.memory_usage_bytes;
    }
  }
  return {
    containers,
    nextExpiry,
    freshCount: fresh.length,
    partial,
    stale,
    peakCPU,
    peakDisk,
    observedMemory,
  };
}

export function formatResourceBytes(bytes: number): string {
  if (bytes === 0) return "0B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unit = 0;
  while (bytes >= 1024 && unit < units.length - 1) {
    bytes /= 1024;
    unit++;
  }
  return `${bytes.toFixed(1)}${units[unit]}`;
}

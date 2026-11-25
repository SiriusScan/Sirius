import assert from "node:assert/strict";
import {
  buildSystemStatus,
  formatBytes,
  formatMemory,
  formatPercent,
  loadSystemStatus,
  parseHealth,
  parseResources,
  projectFreshness,
  serviceBadge,
  summaryLine,
  summaryTone,
  telemetryBadge,
  type FetchLike,
  type FetchPath,
} from "./systemStatus";

// Shapes captured from a live deployment (GET /api/v1/system/health answered 503).
const degradedHealth = {
  status: "degraded",
  timestamp: "2026-11-21T23:53:52.064856268Z",
  service: "sirius-api",
  version: "dev",
  services: {
    "sirius-api": { status: "up", message: "API service is running", port: 9001 },
    "sirius-engine": { status: "up", message: "Engine gRPC service is accessible", port: 50051 },
    "sirius-postgres": { status: "up", message: "PostgreSQL is connected and responding", port: 5432 },
    "sirius-rabbitmq": {
      status: "down",
      message: "Cannot connect to RabbitMQ: dial tcp: lookup sirius-rabbitmq on 127.0.0.11:53: no such host",
      port: 5672,
    },
    "sirius-ui": { status: "down", message: "Cannot connect to UI: dial tcp: lookup sirius-ui", port: 3000 },
    "sirius-valkey": { status: "up", message: "Valkey is connected and responding", port: 6379 },
  },
  overall: "degraded",
};

// Rows as the API (#206) sends them: flat fields are zero-filled for
// compatibility, `measurements` holds only what the collector measured.
const row = (name: string, extra: Record<string, unknown> = {}) => ({
  name,
  cpu_percent: 0,
  memory_usage: "0B",
  memory_percent: 0,
  network_io: "0B / 0B",
  block_io: "0B / 0B",
  disk_usage: "0B / 0B",
  disk_percent: 0,
  process_count: 0,
  file_descriptors: 0,
  load_average_1m: 0,
  load_average_5m: 0,
  load_average_15m: 0,
  uptime: "0s",
  status: "unknown",
  telemetry_status: "missing",
  measurements: {},
  ...extra,
});

const NAMES = ["sirius-api", "sirius-ui", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq"];

// No collector has ever reported.
const nothingReported = {
  message: "System resource observations",
  timestamp: "2026-11-21T23:53:49Z",
  availability: "unavailable",
  freshness_seconds: 20,
  containers: NAMES.map((name) => row(name)),
  summary: { total_containers: 6, fresh_containers: 0, running_containers: 0 },
};

const someReported = {
  message: "System resource observations",
  timestamp: "2026-11-24T12:00:30Z",
  availability: "partial",
  freshness_seconds: 20,
  containers: [
    row("sirius-ui", {
      telemetry_status: "fresh",
      status: "running",
      observed_at: "2026-11-24T12:00:29Z",
      collector_uptime_seconds: 140400,
      measurements: {
        cpu_percent: 1.8372,
        memory_usage_bytes: 134742016,
        memory_percent: 3.41,
        disk_usage_bytes: 1288490188,
        network_rx_bytes: 1024,
        load_average_1m: 0.5,
        load_average_5m: 0.4,
        load_average_15m: 0.3,
      },
    }),
    // A measured zero is a reading, not a gap.
    row("sirius-api", {
      telemetry_status: "fresh",
      status: "exited",
      observed_at: "2026-11-24T12:00:12Z",
      measurements: { cpu_percent: 0, memory_usage_bytes: 0 },
    }),
    // A legacy collector: timing only, no trusted measurements.
    row("sirius-engine", {
      telemetry_status: "fresh",
      status: "running",
      observed_at: "2026-11-24T12:00:29Z",
      collector_uptime_seconds: 60,
      cpu_percent: 0.5,
      memory_usage: "89.0MB",
    }),
    row("sirius-postgres", {
      telemetry_status: "stale",
      observed_at: "2026-11-24T11:58:00Z",
      measurements: { cpu_percent: 95, memory_usage_bytes: 1048576 },
    }),
    row("sirius-valkey", { telemetry_status: "invalid" }),
    row("sirius-rabbitmq"),
  ],
  summary: { total_containers: 6, fresh_containers: 3, running_containers: 2 },
};

// The telemetry store couldn't be read (the API answers 503).
const storeDown = {
  ...nothingReported,
  message: "System resource telemetry store unavailable",
  containers: NAMES.map((name) => row(name, { telemetry_status: "unavailable" })),
};

// formatMemory
assert.equal(formatMemory("128.5MB"), "128.5 MB");
assert.equal(formatMemory("0B"), "0 B");
assert.equal(formatMemory("1.2gb"), "1.2 GB");
assert.equal(formatMemory("n/a"), "n/a");

// parseHealth
{
  const parsed = parseHealth(degradedHealth);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.probes.size, 6);
  assert.equal(parsed.probes.get("sirius-ui")?.status, "down");
  assert.equal(parsed.probes.get("sirius-api")?.port, 9001);
  assert.equal(parseHealth({ error: "Unauthorized" }).ok, false);
  assert.equal(parseHealth(null).ok, false);
  // "loading"/"error" are not probe results.
  assert.equal(parseHealth({ services: { x: { status: "loading" } } }).probes.size, 0);
}

// parseResources: only measured values, per-row telemetry, measured zero kept.
{
  const none = parseResources(nothingReported);
  assert.equal(none.ok, true);
  assert.equal(none.metrics.size, 0);
  assert.equal(none.telemetry.get("sirius-api"), "missing");

  const down = parseResources(storeDown);
  assert.equal(down.ok, false);
  assert.equal(down.metrics.size, 0);

  const some = parseResources(someReported);
  assert.equal(some.ok, true);
  assert.equal(some.freshnessSeconds, 20);
  assert.equal(some.metrics.size, 4);
  const ui = some.metrics.get("sirius-ui")!;
  assert.equal(ui.telemetry, "fresh");
  assert.equal(ui.status, "running");
  assert.equal(ui.cpuPercent, 1.8372);
  assert.equal(ui.memoryUsage, "128.5 MB");
  assert.equal(ui.memoryPercent, 3.41);
  assert.equal(ui.uptime, "1d 15h");
  assert.equal(ui.diskUsed, "1.2 GB");
  assert.equal(ui.networkIO, "1.0 KB / —");
  assert.equal(ui.blockIO, undefined);
  assert.deepEqual(ui.loadAverage, { m1: 0.5, m5: 0.4, m15: 0.3 });
  // Remaining freshness on the server clock: 12:00:29 + 20 s - 12:00:30.
  assert.equal(ui.freshForMs, 19000);

  const api = some.metrics.get("sirius-api")!;
  assert.equal(api.cpuPercent, 0);
  assert.equal(api.memoryUsage, "0 B");
  assert.equal(api.memoryPercent, null);
  assert.equal(api.uptime, "");
  assert.equal(api.freshForMs, 2000);

  // Flat legacy numbers are never read as measurements.
  const engine = some.metrics.get("sirius-engine")!;
  assert.equal(engine.cpuPercent, null);
  assert.equal(engine.memoryUsage, null);
  assert.equal(engine.uptime, "1m 0s");

  const postgres = some.metrics.get("sirius-postgres")!;
  assert.equal(postgres.telemetry, "stale");
  assert.equal(postgres.status, "unknown");
  assert.equal(postgres.cpuPercent, 95);
  assert.equal(some.telemetry.get("sirius-valkey"), "invalid");
  assert.equal(some.metrics.has("sirius-valkey"), false);
  assert.equal(some.telemetry.get("sirius-rabbitmq"), "missing");

  // A "fresh" row without an observation time can't be trusted.
  const noTime = parseResources({ ...someReported, containers: [row("sirius-ui", { telemetry_status: "fresh" })] });
  assert.equal(noTime.telemetry.get("sirius-ui"), "invalid");
  assert.equal(parseResources({ containers: "nope" }).ok, false);
  assert.equal(formatPercent(null), "—");
  assert.equal(formatPercent(0), "0.0%");
  assert.equal(formatPercent(1.8372), "1.8%");
  assert.equal(formatBytes(0), "0 B");
}

// Totals come from fresh rows only; each observation expires on its own clock.
{
  const status = buildSystemStatus({
    health: { ok: true, probes: new Map(NAMES.map((id) => [id, { status: "up" as const }])) },
    resources: parseResources(someReported),
    checkedAt: "2026-11-24T12:00:30Z",
  });
  assert.equal(status.containers.reporting, 3);
  assert.equal(status.containers.observed, 4);
  assert.equal(status.containers.stale, 1);
  assert.equal(status.containers.latestObservedAt, "2026-11-24T12:00:29Z");
  // The stale 95% isn't the peak.
  assert.deepEqual(status.containers.totals, { running: 2, peakCpuPercent: 1.8372, observedMemory: "128.5 MB" });
  assert.equal(status.services.find((s) => s.id === "sirius-postgres")!.state, "healthy");
  assert.deepEqual(telemetryBadge(status.services.find((s) => s.id === "sirius-postgres")!), { label: "Stale", tone: "warn" });
  assert.deepEqual(telemetryBadge(status.services.find((s) => s.id === "sirius-valkey")!), { label: "Invalid report", tone: "warn" });
  assert.deepEqual(telemetryBadge(status.services.find((s) => s.id === "sirius-rabbitmq")!), { label: "Not reporting", tone: "muted" });
  assert.deepEqual(telemetryBadge(status.services.find((s) => s.id === "sirius-ui")!), { label: "Running", tone: "ok" });

  const initial = projectFreshness(status, 1000, 1000, false);
  assert.equal(initial.status, status);
  assert.equal(initial.nextExpiry, 3000);

  // sirius-api's observation (2 s left) expires first; its measured zero goes with it.
  const later = projectFreshness(status, 1000, 3001, false);
  const apiRow = later.status.services.find((s) => s.id === "sirius-api")!;
  assert.equal(apiRow.telemetry, "stale");
  assert.equal(apiRow.container?.telemetry, "stale");
  assert.equal(apiRow.state, "healthy");
  assert.equal(later.status.containers.reporting, 2);
  assert.equal(later.nextExpiry, 20000);
  assert.deepEqual(later.status.containers.totals, { running: 2, peakCpuPercent: 1.8372, observedMemory: "128.5 MB" });

  // A failed refresh leaves nothing current: every row is stale, no totals.
  const failed = projectFreshness(status, 1000, 1000, true);
  assert.equal(failed.status.containers.reporting, 0);
  assert.equal(failed.status.containers.observed, 4);
  assert.deepEqual(failed.status.containers.totals, { running: 0, peakCpuPercent: null, observedMemory: null });
  assert.equal(failed.nextExpiry, Infinity);
}

// buildSystemStatus: live deployment today -> 4 of 6, no container metrics.
{
  const status = buildSystemStatus({
    health: parseHealth(degradedHealth),
    resources: parseResources(nothingReported),
    checkedAt: "2026-11-21T23:53:52.000Z",
  });
  assert.deepEqual(
    status.services.map((s) => s.id),
    ["sirius-ui", "sirius-api", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq"],
  );
  assert.deepEqual(status.summary, { healthy: 4, total: 6 });
  assert.equal(status.containers.reporting, 0);
  assert.equal(summaryLine(status.summary), "4 of 6 services running and healthy");
  assert.equal(summaryTone(status), "warn");
  const ui = status.services[0]!;
  assert.equal(ui.state, "down");
  assert.equal(ui.role, "Next.js frontend");
  assert.deepEqual(serviceBadge(ui), { label: "Down", tone: "bad" });
  assert.deepEqual(serviceBadge(status.services[1]!), { label: "Running · healthy", tone: "ok" });
}

// Container says "exited" while the probe answers -> degraded; missing probe -> unknown.
{
  const status = buildSystemStatus({
    health: { ok: true, probes: new Map([["sirius-api", { status: "up" as const }], ["sirius-extra", { status: "up" as const }]]) },
    resources: parseResources(someReported),
    checkedAt: "2026-11-21T00:00:00.000Z",
  });
  const api = status.services.find((s) => s.id === "sirius-api")!;
  assert.equal(api.state, "degraded");
  assert.deepEqual(serviceBadge(api), { label: "Healthy · exited", tone: "warn" });
  const ui = status.services.find((s) => s.id === "sirius-ui")!;
  assert.equal(ui.state, "unknown");
  assert.equal(ui.container?.status, "running");
  // A stale row can't contradict the probe.
  const postgres = status.services.find((s) => s.id === "sirius-postgres")!;
  assert.equal(postgres.container?.telemetry, "stale");
  // Unknown services are appended after the catalog, with no role.
  const extra = status.services[status.services.length - 1]!;
  assert.equal(extra.id, "sirius-extra");
  assert.equal(extra.role, "");
  assert.equal(status.summary.total, 7);
  assert.equal(status.summary.healthy, 1);
}

// All healthy -> ok tone; health failed -> bad tone.
{
  const allUp = {
    services: Object.fromEntries(
      ["sirius-ui", "sirius-api", "sirius-engine", "sirius-postgres", "sirius-valkey", "sirius-rabbitmq"].map((id) => [
        id,
        { status: "up" },
      ]),
    ),
  };
  const ok = buildSystemStatus({ health: parseHealth(allUp), resources: parseResources(nothingReported), checkedAt: "x" });
  assert.equal(summaryLine(ok.summary), "6 of 6 services running and healthy");
  assert.equal(summaryTone(ok), "ok");
  const failed = buildSystemStatus({
    health: { ok: false, message: "The API answered 401.", probes: new Map() },
    resources: parseResources(nothingReported),
    checkedAt: "x",
  });
  assert.equal(summaryTone(failed), "bad");
  assert.ok(failed.services.every((s) => s.state === "unknown"));
}

// loadSystemStatus: accepts the 503 degraded body, reports failing sources, never throws.
async function run() {
  const reply = (status: number, body: unknown): FetchLike => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

  const seen: string[] = [];
  const fetchOk: FetchPath = (path) => {
    seen.push(path);
    return Promise.resolve(path.endsWith("/health") ? reply(503, degradedHealth) : reply(200, someReported));
  };
  const status = await loadSystemStatus(fetchOk, { now: () => new Date("2026-11-21T12:18:25.000Z") });
  assert.deepEqual(seen.sort(), ["/api/v1/system/health", "/api/v1/system/resources"]);
  assert.equal(status.checkedAt, "2026-11-21T12:18:25.000Z");
  assert.equal(status.health.ok, true);
  assert.equal(status.containers.reporting, 3);

  // The telemetry store failing answers 503 with every row unavailable.
  const fetchStoreDown: FetchPath = (path) =>
    Promise.resolve(path.endsWith("/health") ? reply(200, degradedHealth) : reply(503, storeDown));
  const storeless = await loadSystemStatus(fetchStoreDown);
  assert.equal(storeless.containers.ok, false);
  assert.equal(storeless.containers.message, "The API couldn't read the resource telemetry store.");
  assert.equal(storeless.services[0]!.telemetry, "unavailable");

  const fetchUnauthorized: FetchPath = (path) =>
    Promise.resolve(path.endsWith("/health") ? reply(401, { error: "Unauthorized" }) : reply(500, {}));
  const denied = await loadSystemStatus(fetchUnauthorized);
  assert.equal(denied.health.ok, false);
  assert.equal(denied.health.message, "The API answered 401.");
  assert.equal(denied.containers.ok, false);
  assert.equal(denied.summary.healthy, 0);

  const fetchThrows: FetchPath = () => Promise.reject(new Error("connect ECONNREFUSED"));
  const down = await loadSystemStatus(fetchThrows);
  assert.equal(down.health.message, "connect ECONNREFUSED");

  // A hung API is cut off by the timeout instead of loading forever.
  const fetchHangs: FetchPath = (_path, init) =>
    new Promise((_resolve, reject) => {
      init.signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      });
    });
  const hung = await loadSystemStatus(fetchHangs, { timeoutMs: 20 });
  assert.equal(hung.health.message, "The request timed out.");
  assert.equal(hung.containers.message, "The request timed out.");

  console.log("systemStatus: all cases pass");
}

void run().catch((error) => {
  console.error(error);
  process.exit(1);
});

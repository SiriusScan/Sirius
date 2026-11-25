/**
 * systemStatus — one health source per Sirius service (R11, audit #39/#40).
 *
 * A service's status is its container's resource observation (from the
 * system monitor that runs inside each container and reports to Valkey, read
 * through GET /api/v1/system/resources) plus its health probe (the API's
 * GET /api/v1/system/health, which dials each service). The server loads both
 * in one call (`loadSystemStatus`) and the UI reads the merged rows with one
 * query, so the Services and Resources tabs never disagree.
 *
 * Pure and isomorphic: no React, no server imports. The fetch is injected so
 * the tRPC procedure can pass the authenticated `apiFetch` and tests can pass
 * a fake.
 *
 * Real data only. Each collector's row carries its own telemetry state
 * (fresh, stale, missing, invalid, unavailable) and only the measurements it
 * actually took: a reading the collector didn't take is absent and shown as
 * "not measured", while a measured zero stays zero. Totals come from fresh
 * observations alone, and every fresh observation expires on its own clock
 * (`projectFreshness`), so a collector that stops reporting turns stale in
 * the browser without waiting for the next refresh.
 */

/* ------------------------------------------------------------------ */
/*  Service catalog                                                    */
/* ------------------------------------------------------------------ */

export interface ServiceInfo {
  id: string;
  /** One-line role shown under the name. */
  role: string;
}

/** The services the API probes, in display order. */
export const SERVICE_CATALOG: readonly ServiceInfo[] = [
  { id: "sirius-ui", role: "Next.js frontend" },
  { id: "sirius-api", role: "Go REST API" },
  { id: "sirius-engine", role: "Scanner, agent and terminal runtime" },
  { id: "sirius-postgres", role: "Primary database" },
  { id: "sirius-valkey", role: "Cache and scan state" },
  { id: "sirius-rabbitmq", role: "Message broker" },
];

/* ------------------------------------------------------------------ */
/*  Output shape                                                       */
/* ------------------------------------------------------------------ */

export type ProbeStatus = "up" | "down";

export interface ServiceProbe {
  status: ProbeStatus;
  /** The probe's own words, e.g. "Cannot connect to RabbitMQ: …". */
  message?: string;
  port?: number;
}

/**
 * fresh       — observed within the API's freshness window
 * stale       — the last observation is older than the window (kept, not totalled)
 * missing     — the collector has never reported (or its key expired)
 * invalid     — the stored report couldn't be read as this container's
 * unavailable — the API couldn't read the telemetry store
 */
export type TelemetryStatus = "fresh" | "stale" | "missing" | "invalid" | "unavailable";

export interface ContainerMetrics {
  /** Only containers with an observation have metrics. */
  telemetry: "fresh" | "stale";
  /** As the system monitor reports it, e.g. "running"; "unknown" once stale. */
  status: string;
  /** When the collector took this observation (ISO). */
  observedAt: string;
  /**
   * How long after the API answered this observation stays fresh (ms).
   * 0 for stale rows. The browser anchors it to when it received the answer,
   * so a skewed browser clock doesn't age observations early or late.
   */
  freshForMs: number;
  /** null when the collector didn't measure it; a measured 0 stays 0. */
  cpuPercent: number | null;
  /** Display form, e.g. "128.5 MB"; null when not measured. */
  memoryUsage: string | null;
  memoryBytes: number | null;
  memoryPercent: number | null;
  /** The collector's own uptime, e.g. "1d 15h"; "" when it didn't say. */
  uptime: string;
  /** "rx / tx", e.g. "1.2 KB / 856 B"; undefined when neither was measured. */
  networkIO?: string;
  /** "read / write"; undefined when neither was measured. */
  blockIO?: string;
  /** Bytes the container's filesystem holds, e.g. "1.2 GB". */
  diskUsed?: string;
  processCount?: number;
  fileDescriptors?: number;
  /** The host's load average, as seen from the container. */
  loadAverage?: { m1: number; m5: number; m15: number };
}

/**
 * healthy  — the probe answered and the container (if freshly observed) is running
 * degraded — the probe answered but a fresh observation reports another status
 * down     — the probe could not reach the service
 * unknown  — no probe result for this service
 */
export type ServiceState = "healthy" | "degraded" | "down" | "unknown";

export interface ServiceStatusRow {
  id: string;
  role: string;
  state: ServiceState;
  probe: ServiceProbe | null;
  /** The collector's telemetry state; null when the API didn't list it. */
  telemetry: TelemetryStatus | null;
  /** null when the container has no observation (missing, invalid, unavailable). */
  container: ContainerMetrics | null;
}

/** Totals over fresh observations only; null when no fresh row measured it. */
export interface ContainerTotals {
  /** Fresh observations reporting "running". */
  running: number;
  /** The highest fresh CPU reading. */
  peakCpuPercent: number | null;
  /** The sum of fresh memory readings, e.g. "512.0 MB". */
  observedMemory: string | null;
}

export interface SystemStatus {
  /** When the server ran the probes (ISO). */
  checkedAt: string;
  services: ServiceStatusRow[];
  health: { ok: boolean; message?: string };
  containers: {
    ok: boolean;
    message?: string;
    /** Services with a fresh observation. */
    reporting: number;
    /** Services with any observation, fresh or stale. */
    observed: number;
    stale: number;
    /** Newest observation time across all collectors (ISO). */
    latestObservedAt?: string;
    /** The API's freshness window, in seconds. */
    freshnessSeconds?: number;
    totals: ContainerTotals;
  };
  summary: { healthy: number; total: number };
}

/* ------------------------------------------------------------------ */
/*  Parsing                                                            */
/* ------------------------------------------------------------------ */

type Json = Record<string, unknown>;

function isObject(value: unknown): value is Json {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}

function isoTime(value: unknown): string | undefined {
  const raw = str(value);
  return raw && Number.isFinite(Date.parse(raw)) ? raw : undefined;
}

/** "128.5MB" -> "128.5 MB"; anything else is returned trimmed. */
export function formatMemory(raw: string): string {
  const match = /^(\d+(?:\.\d+)?)\s*([KMGTP]?B)$/i.exec(raw.trim());
  if (!match) return raw.trim();
  return `${match[1]} ${match[2]!.toUpperCase()}`;
}

/** 134217728 -> "128.0 MB"; 0 -> "0 B" (a measured zero, not "no data"). */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(1)} ${units[unit]}`;
}

/** "1.2 KB / 856.0 B", "— / 856.0 B"; undefined when neither side was measured. */
function bytePair(first: number | undefined, second: number | undefined): string | undefined {
  if (first === undefined && second === undefined) return undefined;
  const side = (value: number | undefined) => (value === undefined ? NOT_MEASURED : formatBytes(value));
  return `${side(first)} / ${side(second)}`;
}

/** 140000 -> "1d 14h", matching the API's own uptime format. */
export function formatUptime(seconds: number): string {
  const s = Math.floor(seconds);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  return `${Math.floor(s / 86400)}d ${Math.floor((s % 86400) / 3600)}h`;
}

export interface ParsedHealth {
  ok: boolean;
  message?: string;
  probes: Map<string, ServiceProbe>;
}

/** Reads GET /api/v1/system/health (200 when healthy, 503 when degraded). */
export function parseHealth(body: unknown): ParsedHealth {
  const probes = new Map<string, ServiceProbe>();
  if (!isObject(body) || !isObject(body.services)) {
    return { ok: false, message: "The health probe returned no service list.", probes };
  }
  for (const [id, raw] of Object.entries(body.services)) {
    if (!isObject(raw)) continue;
    const status = raw.status === "up" || raw.status === "down" ? raw.status : null;
    if (!status) continue; // "loading", "error" or missing: no result
    probes.set(id, {
      status,
      message: str(raw.message),
      port: num(raw.port),
    });
  }
  return { ok: true, probes };
}

export interface ParsedResources {
  ok: boolean;
  message?: string;
  /** Every collector the API listed, with its telemetry state. */
  telemetry: Map<string, TelemetryStatus>;
  /** Collectors with an observation (fresh or stale). */
  metrics: Map<string, ContainerMetrics>;
  freshnessSeconds?: number;
}

const TELEMETRY_STATES: readonly TelemetryStatus[] = ["fresh", "stale", "missing", "invalid", "unavailable"];

function telemetryState(value: unknown): TelemetryStatus {
  return TELEMETRY_STATES.includes(value as TelemetryStatus) ? (value as TelemetryStatus) : "invalid";
}

/**
 * The measurements one observation carries. Only `measurements` is read: the
 * API's flat fields are zero-filled for readings the collector didn't take.
 */
function readMeasurements(raw: unknown) {
  const m = isObject(raw) ? raw : {};
  const load1 = num(m.load_average_1m);
  const load5 = num(m.load_average_5m);
  const load15 = num(m.load_average_15m);
  const memoryBytes = num(m.memory_usage_bytes);
  const diskBytes = num(m.disk_usage_bytes);
  return {
    cpuPercent: num(m.cpu_percent) ?? null,
    memoryBytes: memoryBytes ?? null,
    memoryUsage: memoryBytes === undefined ? null : formatBytes(memoryBytes),
    memoryPercent: num(m.memory_percent) ?? null,
    networkIO: bytePair(num(m.network_rx_bytes), num(m.network_tx_bytes)),
    blockIO: bytePair(num(m.disk_read_bytes), num(m.disk_write_bytes)),
    diskUsed: diskBytes === undefined ? undefined : formatBytes(diskBytes),
    processCount: num(m.process_count),
    fileDescriptors: num(m.file_descriptors),
    loadAverage:
      load1 !== undefined && load5 !== undefined && load15 !== undefined
        ? { m1: load1, m5: load5, m15: load15 }
        : undefined,
  };
}

/**
 * Reads GET /api/v1/system/resources (200, or 503 when the telemetry store
 * couldn't be read at all). Rows keep their own telemetry state; only fresh
 * and stale rows carry metrics, and only the readings they measured.
 */
export function parseResources(body: unknown): ParsedResources {
  const telemetry = new Map<string, TelemetryStatus>();
  const metrics = new Map<string, ContainerMetrics>();
  if (!isObject(body) || !Array.isArray(body.containers)) {
    return { ok: false, message: "The API returned no container list.", telemetry, metrics };
  }
  const freshnessSeconds = num(body.freshness_seconds);
  const answeredAt = Date.parse(str(body.timestamp) ?? "");
  for (const raw of body.containers) {
    if (!isObject(raw)) continue;
    const name = str(raw.name);
    if (!name) continue;
    let state = telemetryState(raw.telemetry_status);
    const observedAt = isoTime(raw.observed_at);
    if ((state === "fresh" || state === "stale") && !observedAt) state = "invalid";
    telemetry.set(name, state);
    if (state !== "fresh" && state !== "stale" || !observedAt) continue;

    let freshForMs = 0;
    if (state === "fresh") {
      // Remaining freshness measured on the server's clock.
      freshForMs = Date.parse(observedAt) + (freshnessSeconds ?? 0) * 1000 - answeredAt;
      if (!Number.isFinite(freshForMs) || freshForMs <= 0) {
        state = "stale";
        freshForMs = 0;
        telemetry.set(name, state);
      }
    }
    const uptimeSeconds = num(raw.collector_uptime_seconds);
    metrics.set(name, {
      telemetry: state,
      status: state === "fresh" ? (str(raw.status) ?? "unknown").toLowerCase() : "unknown",
      observedAt,
      freshForMs,
      uptime: uptimeSeconds !== undefined && uptimeSeconds >= 0 ? formatUptime(uptimeSeconds) : "",
      ...readMeasurements(raw.measurements),
    });
  }
  const listed = [...telemetry.values()];
  if (listed.length > 0 && listed.every((state) => state === "unavailable")) {
    return {
      ok: false,
      message: "The API couldn't read the resource telemetry store.",
      telemetry,
      metrics,
      freshnessSeconds,
    };
  }
  return { ok: true, telemetry, metrics, freshnessSeconds };
}

/* ------------------------------------------------------------------ */
/*  Merging                                                            */
/* ------------------------------------------------------------------ */

export function serviceState(
  probe: ServiceProbe | null,
  container: ContainerMetrics | null,
): ServiceState {
  if (!probe) return "unknown";
  if (probe.status === "down") return "down";
  // Only a current observation can contradict the probe.
  if (container?.telemetry === "fresh" && container.status !== "running") return "degraded";
  return "healthy";
}

/** Totals over fresh observations; a stale row's last readings never count. */
export function containerTotals(services: readonly ServiceStatusRow[]): ContainerTotals {
  let running = 0;
  let peakCpuPercent: number | null = null;
  let memoryBytes: number | null = null;
  for (const { container } of services) {
    if (container?.telemetry !== "fresh") continue;
    if (container.status === "running") running++;
    if (container.cpuPercent !== null) {
      peakCpuPercent = Math.max(peakCpuPercent ?? container.cpuPercent, container.cpuPercent);
    }
    if (container.memoryBytes !== null) memoryBytes = (memoryBytes ?? 0) + container.memoryBytes;
  }
  return {
    running,
    peakCpuPercent,
    observedMemory: memoryBytes === null ? null : formatBytes(memoryBytes),
  };
}

function summarize(
  services: ServiceStatusRow[],
  base: Pick<SystemStatus, "checkedAt" | "health"> & {
    containers: Pick<SystemStatus["containers"], "ok" | "message" | "freshnessSeconds">;
  },
): SystemStatus {
  const observed = services.filter((s) => s.container);
  const latest = observed
    .map((s) => s.container!.observedAt)
    .reduce<string | undefined>((a, b) => (!a || Date.parse(b) > Date.parse(a) ? b : a), undefined);
  return {
    checkedAt: base.checkedAt,
    services,
    health: base.health,
    containers: {
      ok: base.containers.ok,
      message: base.containers.message,
      freshnessSeconds: base.containers.freshnessSeconds,
      reporting: observed.filter((s) => s.container!.telemetry === "fresh").length,
      observed: observed.length,
      stale: observed.filter((s) => s.container!.telemetry === "stale").length,
      latestObservedAt: latest,
      totals: containerTotals(services),
    },
    summary: {
      healthy: services.filter((s) => s.state === "healthy").length,
      total: services.length,
    },
  };
}

export function buildSystemStatus(input: {
  health: ParsedHealth;
  resources: ParsedResources;
  checkedAt: string;
}): SystemStatus {
  const { health, resources, checkedAt } = input;
  const roles = new Map(SERVICE_CATALOG.map((s) => [s.id, s.role]));
  const ids = SERVICE_CATALOG.map((s) => s.id);
  // Services the probe or the monitor report that the catalog doesn't know.
  for (const id of [...health.probes.keys(), ...resources.telemetry.keys()]) {
    if (!ids.includes(id)) ids.push(id);
  }

  const services = ids.map<ServiceStatusRow>((id) => {
    const probe = health.probes.get(id) ?? null;
    const container = resources.metrics.get(id) ?? null;
    return {
      id,
      role: roles.get(id) ?? "",
      state: serviceState(probe, container),
      probe,
      telemetry: resources.telemetry.get(id) ?? null,
      container,
    };
  });

  return summarize(services, {
    checkedAt,
    health: { ok: health.ok, message: health.message },
    containers: {
      ok: resources.ok,
      message: resources.message,
      freshnessSeconds: resources.freshnessSeconds,
    },
  });
}

/**
 * Ages fresh observations in the browser. `receivedAt` is when the browser
 * got `status` (react-query's dataUpdatedAt). Each fresh row turns stale on
 * its own at `receivedAt + freshForMs`; all of them turn stale when the
 * latest refresh failed, since nothing current backs them any more. Returns
 * the projected status and when the next fresh row expires (Infinity when
 * none is left).
 */
export function projectFreshness(
  status: SystemStatus,
  receivedAt: number,
  now: number,
  refreshFailed: boolean,
): { status: SystemStatus; nextExpiry: number } {
  let nextExpiry = Infinity;
  let changed = false;
  const services = status.services.map((service) => {
    const container = service.container;
    if (container?.telemetry !== "fresh") return service;
    const expiresAt = receivedAt + container.freshForMs;
    if (!refreshFailed && Number.isFinite(expiresAt) && expiresAt > now) {
      nextExpiry = Math.min(nextExpiry, expiresAt);
      return service;
    }
    changed = true;
    const stale: ContainerMetrics = { ...container, telemetry: "stale", status: "unknown", freshForMs: 0 };
    return {
      ...service,
      telemetry: "stale" as const,
      container: stale,
      state: serviceState(service.probe, stale),
    };
  });
  if (!changed) return { status, nextExpiry };
  return { status: summarize(services, status), nextExpiry };
}

/* ------------------------------------------------------------------ */
/*  Loading (runs on the server)                                       */
/* ------------------------------------------------------------------ */

/** The part of a fetch Response this module reads. */
export interface FetchLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type FetchPath = (path: string, init: { signal: AbortSignal }) => Promise<FetchLike>;

export const HEALTH_PATH = "/api/v1/system/health";
export const RESOURCES_PATH = "/api/v1/system/resources";
export const STATUS_TIMEOUT_MS = 8000;

function errorText(error: unknown): string {
  if (error instanceof Error) {
    return error.name === "AbortError" ? "The request timed out." : error.message;
  }
  return "The request failed.";
}

async function getJson(
  fetchPath: FetchPath,
  path: string,
  timeoutMs: number,
  acceptStatus: (status: number) => boolean,
): Promise<{ ok: true; body: unknown } | { ok: false; message: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchPath(path, { signal: controller.signal });
    if (!res.ok && !acceptStatus(res.status)) {
      return { ok: false, message: `The API answered ${res.status}.` };
    }
    return { ok: true, body: await res.json() };
  } catch (error) {
    // The shared apiFetch replaces errors with sanitized ones, so the abort
    // itself says whether this was the timeout.
    if (controller.signal.aborted) return { ok: false, message: "The request timed out." };
    return { ok: false, message: errorText(error) };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Loads container status and health probes in parallel and merges them.
 * Never throws: a failing source is reported in `health` / `containers` so
 * the UI can show which half is missing.
 *
 *   status: protectedProcedure.query(() =>
 *     loadSystemStatus((path, init) => apiFetch(`${API_BASE_URL}${path}`, init)))
 */
export async function loadSystemStatus(
  fetchPath: FetchPath,
  options: { timeoutMs?: number; now?: () => Date } = {},
): Promise<SystemStatus> {
  const timeoutMs = options.timeoutMs ?? STATUS_TIMEOUT_MS;
  const [healthRes, resourcesRes] = await Promise.all([
    // A degraded system answers 503 with the full service list.
    getJson(fetchPath, HEALTH_PATH, timeoutMs, (status) => status === 503),
    // An unreadable telemetry store answers 503 with every row "unavailable".
    getJson(fetchPath, RESOURCES_PATH, timeoutMs, (status) => status === 503),
  ]);

  const health: ParsedHealth = healthRes.ok
    ? parseHealth(healthRes.body)
    : { ok: false, message: healthRes.message, probes: new Map() };
  const resources: ParsedResources = resourcesRes.ok
    ? parseResources(resourcesRes.body)
    : { ok: false, message: resourcesRes.message, telemetry: new Map(), metrics: new Map() };

  return buildSystemStatus({
    health,
    resources,
    checkedAt: (options.now?.() ?? new Date()).toISOString(),
  });
}

/* ------------------------------------------------------------------ */
/*  Display helpers                                                    */
/* ------------------------------------------------------------------ */

export type StatusTone = "ok" | "warn" | "bad" | "muted";

export function serviceBadge(row: ServiceStatusRow): { label: string; tone: StatusTone } {
  switch (row.state) {
    case "healthy":
      return { label: "Running · healthy", tone: "ok" };
    case "degraded":
      return { label: `Healthy · ${row.container?.status ?? "not running"}`, tone: "warn" };
    case "down":
      return { label: "Down", tone: "bad" };
    default:
      return { label: "Not checked", tone: "muted" };
  }
}

/** "6 of 6 services running and healthy" */
export function summaryLine(summary: SystemStatus["summary"]): string {
  const noun = summary.total === 1 ? "service" : "services";
  return `${summary.healthy} of ${summary.total} ${noun} running and healthy`;
}

export function summaryTone(status: SystemStatus): StatusTone {
  if (!status.health.ok) return "bad";
  if (status.summary.total > 0 && status.summary.healthy === status.summary.total) return "ok";
  if (status.summary.healthy === 0) return "bad";
  return "warn";
}

export const NOT_MEASURED = "—";

/** "1.8%"; "—" when there is no reading. */
export function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? NOT_MEASURED : `${value.toFixed(1)}%`;
}

export const NOT_MEASURED_NOTE =
  "Not measured: this container's collector didn't report this reading.";

/** The pill for a collector's telemetry, e.g. "Running", "Stale", "Not reporting". */
export function telemetryBadge(service: ServiceStatusRow): { label: string; tone: StatusTone } {
  const container = service.container;
  if (container?.telemetry === "fresh") {
    const label = container.status.charAt(0).toUpperCase() + container.status.slice(1);
    return { label, tone: container.status === "running" ? "ok" : "warn" };
  }
  switch (service.telemetry) {
    case "stale":
      return { label: "Stale", tone: "warn" };
    case "invalid":
      return { label: "Invalid report", tone: "warn" };
    case "unavailable":
      return { label: "Unavailable", tone: "muted" };
    default:
      return { label: "Not reporting", tone: "muted" };
  }
}

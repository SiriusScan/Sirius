import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  capabilityProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";
import { apiClient } from "~/server/api/shared/apiClient";
import { apiErrorDiagnostics } from "~/server/api/shared/apiErrors";
import { valkey } from "~/server/valkey";
import {
  cvssOf,
  fetchInventoryHosts,
  riskFieldsForHost,
  type SiriusHost,
} from "~/server/api/routers/host";
import {
  addSeverityCounts,
  compareRisk,
  emptySeverityCounts,
  findingSeverity,
  riskBand,
  toLegacySeverityCounts,
} from "~/utils/risk";
import { summaryFor } from "~/utils/findingSummary";
import type {
  RiskiestHost,
  SeverityCounts,
  SummaryLastScan,
  SummaryStats,
  TopFinding,
} from "~/types/riskSummary";
import type { ScanResult, ScanTargetEntry } from "~/types/scanTypes";

/**
 * Statistics router - handles vulnerability statistics, trends, and snapshots
 * This router proxies requests to the Go API backend
 */

// Types matching Go API responses
export type VulnerabilityCounts = {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
  total: number;
};

export type Snapshot = {
  snapshot_id: string;
  timestamp: string;
  counts: VulnerabilityCounts;
  by_host?: Array<{
    host_id: string;
    hostname: string;
    counts: VulnerabilityCounts;
  }>;
  metadata?: {
    source: string;
    version: string;
  };
};

export type VulnerableHost = {
  hostId: string;
  hostname: string;
  hostIp: string;
  totalVulnerabilities: number;
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  weightedRiskScore: number;
  lastUpdated: string;
};

// ─── Summary (ADR-2): one source for every count ────────────────────────────

/** Catalog rows behind /vulnerabilities (GET host/vulnerabilities/all). */
type CatalogVulnerability = {
  vid: string;
  title?: string;
  description?: string;
  riskScore?: number;
  hostCount?: number;
};

async function fetchCatalog(): Promise<CatalogVulnerability[]> {
  const response = await apiClient.get<CatalogVulnerability[] | null>(
    "host/vulnerabilities/all",
  );
  return Array.isArray(response.data) ? response.data : [];
}

/**
 * Unique CVEs by severity exactly as /vulnerabilities counts them: the
 * catalog risk score banded 9/7/4/>0, 0 as info.
 */
function catalogCounts(rows: CatalogVulnerability[]): SeverityCounts {
  const counts = emptySeverityCounts();
  for (const row of rows) {
    // Unrounded, as vulnerability.getAllVulnerabilities bands it.
    const band = riskBand(row.riskScore ?? 0);
    counts[band === "none" ? "info" : band]++;
  }
  return counts;
}

/** Up to `limit` open findings across the inventory, highest CVSS first. */
function topFindingsOf(
  hosts: SiriusHost[],
  catalog: Map<string, string>,
  limit: number,
): TopFinding[] {
  const byId = new Map<
    string,
    { cvss: number; severity?: string; description: string; hosts: Set<string> }
  >();
  for (const host of hosts) {
    for (const v of host.vulnerabilities ?? []) {
      const id = v.vid || v.cve_id;
      if (!id) continue;
      const cvss = cvssOf(v);
      const entry = byId.get(id);
      if (!entry) {
        byId.set(id, {
          cvss,
          severity: v.severity,
          description: v.description ?? "",
          hosts: new Set([host.ip]),
        });
      } else {
        entry.hosts.add(host.ip);
        if (cvss > entry.cvss) {
          entry.cvss = cvss;
          entry.severity = v.severity;
          entry.description = v.description ?? entry.description;
        }
      }
    }
  }
  return [...byId.entries()]
    .map(([id, f]) => {
      const summary = summaryFor({
        description: f.description,
        catalogDescription: catalog.get(id),
      });
      return {
        id,
        severity: findingSeverity({ cvss: f.cvss, severity: f.severity }),
        cvss: f.cvss,
        summary: summary.summary,
        summarySource: summary.summarySource,
        hosts: f.hosts.size,
      };
    })
    .sort((a, b) => b.cvss - a.cvss || b.hosts - a.hosts || a.id.localeCompare(b.id))
    .slice(0, limit);
}

function targetLabel(entry: ScanTargetEntry): string | null {
  if (typeof entry === "string") return entry.trim() || null;
  return entry?.ip || entry?.value || entry?.hostname || entry?.id || null;
}

function validIso(value: unknown): string | undefined {
  if (typeof value !== "string" || !value) return undefined;
  const t = Date.parse(value);
  return Number.isFinite(t) && t > 0 ? new Date(t).toISOString() : undefined;
}

/** The scan state the Scanner page reads (ValKey `currentScan`). */
async function readCurrentScan(): Promise<ScanResult | null> {
  const raw = await valkey.get("currentScan");
  if (!raw) return null;
  try {
    const decoded = JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as unknown;
    return decoded && typeof decoded === "object" ? (decoded as ScanResult) : null;
  } catch {
    return null;
  }
}

type ScanEvent = {
  timestamp: string;
  entity_id?: string;
  metadata?: Record<string, unknown> | null;
};

async function latestScanEvent(
  eventType: "scan_completed" | "scan_started",
  scanId?: string,
): Promise<ScanEvent | null> {
  const params: Record<string, string | number> = { event_type: eventType, limit: 1 };
  if (scanId) params.entity_id = scanId;
  const response = await apiClient.get<{ events: ScanEvent[] | null }>(
    "/api/v1/events",
    { params },
  );
  return response.data?.events?.[0] ?? null;
}

function numberField(meta: Record<string, unknown> | null | undefined, key: string) {
  const value = meta?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * The last scan: the scanner state the UI already reads, or, when that is
 * empty, the newest scan_completed event. Never invented: missing fields
 * stay unset.
 */
async function lastScanSummary(): Promise<SummaryLastScan | null> {
  let current: ScanResult | null = null;
  try {
    current = await readCurrentScan();
  } catch (error) {
    console.warn("getSummary: scanner state unavailable:", error);
  }

  if (current && (current.id || current.start_time)) {
    const targets = (current.targets ?? [])
      .map(targetLabel)
      .filter((t): t is string => !!t);
    const hosts = (current.hosts ?? []).filter((h) =>
      typeof h === "string" ? !!h.trim() : !!h?.ip?.trim(),
    );
    let finishedAt = validIso(current.end_time);
    const terminal = ["completed", "cancelled", "failed"].includes(current.status ?? "");
    if (!finishedAt && terminal && current.id) {
      try {
        const done = await latestScanEvent("scan_completed", current.id);
        finishedAt = validIso(done?.timestamp);
      } catch {
        // The end time stays unknown.
      }
    }
    return {
      origin: "scanner",
      ...(current.id ? { id: current.id } : {}),
      ...(validIso(current.start_time) ? { startedAt: validIso(current.start_time) } : {}),
      ...(finishedAt ? { finishedAt } : {}),
      ...(current.status ? { status: current.status } : {}),
      targets,
      hostsFound: hosts.length,
      findings: (current.vulnerabilities ?? []).length,
    };
  }

  try {
    const done = await latestScanEvent("scan_completed");
    if (!done) return null;
    const meta = done.metadata ?? {};
    const scanId =
      (typeof meta.scan_id === "string" && meta.scan_id) || done.entity_id || undefined;
    let startedAt: string | undefined;
    let targets: string[] | undefined;
    if (scanId) {
      try {
        const started = await latestScanEvent("scan_started", scanId);
        startedAt = validIso(started?.timestamp);
        const raw = started?.metadata?.targets;
        if (Array.isArray(raw)) {
          targets = raw.filter((t): t is string => typeof t === "string" && !!t);
        }
      } catch {
        // Start time and targets stay unknown.
      }
    }
    const hostsFound = numberField(meta, "hosts_discovered");
    const findings = numberField(meta, "vulnerabilities_found");
    return {
      origin: "events",
      ...(scanId ? { id: scanId } : {}),
      ...(startedAt ? { startedAt } : {}),
      ...(validIso(done.timestamp) ? { finishedAt: validIso(done.timestamp) } : {}),
      status: "completed",
      ...(targets ? { targets } : {}),
      ...(hostsFound !== undefined ? { hostsFound } : {}),
      ...(findings !== undefined ? { findings } : {}),
    };
  } catch (error) {
    console.warn("getSummary: scan events unavailable:", apiErrorDiagnostics(error));
    return null;
  }
}

/** Assemble the summary from the inventory, the catalog and the scanner. */
export async function buildSummary(): Promise<SummaryStats> {
  const [hosts, catalogRows, lastScan] = await Promise.all([
    fetchInventoryHosts(),
    fetchCatalog(),
    lastScanSummary(),
  ]);

  const findingsBySeverity = emptySeverityCounts();
  let openFindings = 0;
  const ranked: RiskiestHost[] = [];
  for (const host of hosts) {
    const risk = riskFieldsForHost(host);
    addSeverityCounts(findingsBySeverity, risk.counts);
    openFindings += risk.openFindings;
    if (risk.openFindings > 0) {
      ranked.push({
        ip: host.ip,
        ...(host.hostname ? { hostname: host.hostname } : {}),
        ...(host.os ? { os: host.os } : {}),
        ...risk,
      });
    }
  }
  ranked.sort(compareRisk);

  const top = ranked[0];
  const catalogDescriptions = new Map<string, string>();
  for (const row of catalogRows) {
    if (row.vid && row.description) catalogDescriptions.set(row.vid, row.description);
  }

  return {
    hosts: { total: hosts.length },
    findings: { open: openFindings, bySeverity: findingsBySeverity },
    vulnerabilities: { unique: catalogRows.length, bySeverity: catalogCounts(catalogRows) },
    highestRisk:
      top && top.riskScore > 0
        ? {
            ip: top.ip,
            ...(top.hostname ? { hostname: top.hostname } : {}),
            riskScore: top.riskScore,
            riskBand: top.riskBand,
            ...(top.riskCve ? { riskCve: top.riskCve } : {}),
          }
        : null,
    riskiestHosts: ranked.slice(0, 5),
    lastScan,
    topFindings: topFindingsOf(hosts, catalogDescriptions, 5),
    generatedAt: new Date().toISOString(),
  };
}

export const statisticsRouter = createTRPCRouter({
  /**
   * ADR-2: every count the Dashboard, Vulnerabilities and Environment headers
   * show, from one place. Real numbers only; fails rather than reporting
   * zeros when the inventory cannot be read.
   *
   * It reads hosts, the vulnerability catalog, scan events and the scanner
   * state, so it requires each of those capabilities on top of the
   * namespace's: the summary never shows more than the caller could read.
   */
  getSummary: capabilityProcedure(
    "api.hosts",
    "api.vulnerabilities",
    "api.events",
    "storage.valkey",
  ).query(async (): Promise<SummaryStats> => {
    try {
      return await buildSummary();
    } catch (error) {
      console.error("Error building summary:", apiErrorDiagnostics(error));
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to load the summary",
      });
    }
  }),

  /**
   * Create a snapshot of current vulnerability counts
   */
  createSnapshot: protectedProcedure.mutation(async () => {
    try {
      const response = await apiClient.post<{
        message: string;
        snapshot: Snapshot;
      }>("/api/v1/statistics/vulnerability-snapshot");

      return {
        success: true,
        message: response.data.message,
        snapshot: response.data.snapshot,
      };
    } catch (error) {
      console.error("Error creating snapshot:", apiErrorDiagnostics(error));
      throw new Error("Failed to create snapshot");
    }
  }),

  /**
   * Get vulnerability trends over time (from snapshots)
   */
  getVulnerabilityTrends: protectedProcedure
    .input(
      z
        .object({
          days: z.number().min(1).max(10).optional().default(7),
        })
        .optional()
    )
    .query(async ({ input }) => {
      try {
        const limit = input?.days ?? 7;

        const response = await apiClient.get<{
          snapshots: Snapshot[];
          limit_requested: number;
          snapshots_returned: number;
        }>("/api/v1/statistics/vulnerability-trends", {
          params: { limit },
        });

        return {
          trends: response.data.snapshots.map((snapshot) => ({
            id: snapshot.snapshot_id,
            timestamp: new Date(snapshot.timestamp),
            counts: snapshot.counts,
          })),
          days: limit,
        };
      } catch (error) {
        console.error("Error fetching vulnerability trends:", apiErrorDiagnostics(error));
        throw new Error("Failed to fetch vulnerability trends");
      }
    }),

  /**
   * List all snapshots
   */
  listSnapshots: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(30),
        })
        .optional()
    )
    .query(async () => {
      try {
        const response = await apiClient.get<{
          available_snapshot_ids: string[];
          count: number;
        }>("/api/v1/statistics/vulnerability-snapshots");

        return {
          snapshots: response.data.available_snapshot_ids,
          total: response.data.count,
        };
      } catch (error) {
        console.error("Error listing snapshots:", apiErrorDiagnostics(error));
        throw new Error("Failed to list snapshots");
      }
    }),

  /**
   * Get most vulnerable hosts, ranked on the one risk scale (ADR-3): risk
   * score, then critical count, then high count. Each host carries
   * riskScore / riskBand / counts. `weightedRiskScore` (the Go API's sum) is
   * kept only as a legacy field; it is not a risk score and is not ranked on.
   */
  getMostVulnerableHosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(20).optional().default(5),
        refresh: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      try {
        const { limit, refresh } = input;

        const [inventory, legacy] = await Promise.all([
          fetchInventoryHosts(),
          apiClient
            .get<{
              hosts: Array<{
                hostId: string;
                hostIp: string;
                hostname: string;
                totalVulnerabilities: number;
                weightedRiskScore: number;
                severityCounts: {
                  critical: number;
                  high: number;
                  medium: number;
                  low: number;
                  informational: number;
                };
                lastUpdated: string;
              }> | null;
              totalHosts: number;
              cached: boolean;
              cachedAt?: string;
              ttl: number;
            }>("/api/v1/statistics/hosts/most-vulnerable", {
              // The Go ranking is a weighted sum; fetch its maximum page only
              // to carry hostId / lastUpdated across. Ranking happens here.
              params: { limit: 50, refresh },
            })
            .then((r) => r.data)
            .catch((error) => {
              console.warn("Legacy most-vulnerable data unavailable:", apiErrorDiagnostics(error));
              return null;
            }),
        ]);

        const legacyByIp = new Map(
          (legacy?.hosts ?? []).map((h) => [h.hostIp, h] as const),
        );

        const ranked = inventory
          .map((host) => ({ host, risk: riskFieldsForHost(host) }))
          .filter(({ risk }) => risk.openFindings > 0)
          .map(({ host, risk }) => {
            const g = legacyByIp.get(host.ip);
            const weighted =
              g?.weightedRiskScore ??
              (host.vulnerabilities ?? []).reduce(
                (sum, v) => sum + cvssOf(v),
                0,
              );
            return {
              hostId: g?.hostId ?? (host.hid || host.ip),
              hostIp: host.ip,
              hostname: host.hostname ?? "",
              totalVulnerabilities: risk.openFindings,
              weightedRiskScore: weighted,
              severityCounts: toLegacySeverityCounts(risk.counts),
              lastUpdated: g?.lastUpdated ?? "",
              riskScore: risk.riskScore,
              riskBand: risk.riskBand,
              ...(risk.riskCve ? { riskCve: risk.riskCve } : {}),
              counts: risk.counts,
            };
          })
          .sort(compareRisk);

        return {
          hosts: ranked.slice(0, limit),
          total: ranked.length,
          cached: legacy?.cached ?? false,
          cachedAt: legacy?.cachedAt,
        };
      } catch (error) {
        console.error("Error fetching most vulnerable hosts:", apiErrorDiagnostics(error));
        throw new Error("Failed to fetch most vulnerable hosts");
      }
    }),
});

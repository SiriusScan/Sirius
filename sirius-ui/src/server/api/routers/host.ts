import { TRPCError } from "@trpc/server";
import { z } from "zod";
import axios from "axios";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { storeMockHosts } from "./shared-mock-data";
import { type VulnerabilitySeverityCounts } from "~/components/VulnerabilityBarGraph";
import { apiClient as httpClient } from "~/server/api/shared/apiClient";
import { apiErrorDiagnostics } from "~/server/api/shared/apiErrors";

import {
  mockHostData,
  mockHostStatistics,
  mockEnvironmentSummaryData,
} from "~/utils/mock/mockHostData";
import { type SourceCoverageStats } from "~/types/scanTypes";
import {
  findingSeverity,
  hostRisk,
  roundScore,
  type RiskFinding,
} from "~/utils/risk";
import { summaryFor } from "~/utils/findingSummary";
import type {
  FindingComponent,
  FindingSummaryFields,
  HostFreshness,
  HostFreshnessEntry,
  HostLastScan,
  HostRiskFields,
  InventoryHostRef,
  InventoryIpsResult,
  OpenPort,
  RiskBand,
  RiskSeverity,
  SeverityCounts,
  SourceFreshness,
} from "~/types/riskSummary";

export type SiriusHost = {
  hid: string;
  ip: string;
  hostname: string;
  tags?: string[];
  os: string;
  osversion: string;
  asset_type: "workstation" | "server" | "network" | "unknown";
  vulnerabilities: Vulnerability[];
  ports: Port[];
  services: Service[];
  users?: User[];
};

type Port = {
  number: number;
  protocol: string;
  state: string;
};

type User = {
  id: string;
  username: string;
  uid: string;
  type: string;
  domain?: string;
  password?: {
    hash?: string;
    algorithm?: string;
    plaintext?: string;
  };
  details?: string;
};

type Service = {
  id: string;
  name: string;
  port: number;
  protocol: string;
  version: string;
};

export type Vulnerability = {
  vid: string;
  riskScore: number;
  cve?: string;
  description: string;
  published: string;
  severity: string;
  /** Fields the Go API sends for scanner findings (finding snapshot). */
  title?: string;
  cve_id?: string;
  cvss_score?: number;
  confidence?: number;
};

export interface EnvironmentTableData {
  hid: string;
  hostname: string;
  ip: string;
  os: string;
  vulnerabilityCount: number;
  groups: string[];
  tags: string[];
  vulnerabilities: Vulnerability[];
  ports?: Port[];
  // Server-computed (ADR-3); optional here so older fixtures still type.
  riskScore?: number;
  riskBand?: RiskBand;
  riskCve?: string;
  counts?: SeverityCounts;
  openFindings?: number;
  openPorts?: OpenPort[];
  /** Source names that reported on this host (getEnvironmentSummary). */
  sources?: string[];
  firstSeen?: string | null;
  lastScan?: HostLastScan | null;
  sourceFreshness?: SourceFreshness[];
}

/**
 * A host row as getAllHosts returns it: the legacy fields plus the risk
 * fields every host shape carries (ADR-3) and its open ports.
 */
export type HostRiskRow = EnvironmentTableData &
  HostRiskFields & {
    openFindings: number;
    openPorts: OpenPort[];
  };

/** A host row as getEnvironmentSummary returns it: also data freshness. */
export type EnvironmentHostRow = HostRiskRow & {
  sources: string[];
  firstSeen: string | null;
  lastScan: HostLastScan | null;
  sourceFreshness: SourceFreshness[];
};

function isValidIPv4HostIp(ip: string | undefined): boolean {
  if (!ip) return false;
  const trimmed = ip.trim();
  if (!trimmed || trimmed.includes("/") || trimmed.includes("-")) return false;
  const octets = trimmed.split(".");
  if (octets.length !== 4) return false;
  return octets.every((octet) => {
    if (!/^\d+$/.test(octet)) return false;
    const value = Number(octet);
    return value >= 0 && value <= 255;
  });
}

export type HostStatistics = {
  vulnerabilityCount: number;
  totalRiskScore: number;
  averageRiskScore: number;
  hostSeverityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
};

// Helper function to generate mock vulnerabilities for testing
function generateMockVulnerabilities(count: number): Vulnerability[] {
  const severities = [
    "critical",
    "high",
    "medium",
    "low",
    "informational",
  ] as const;
  const vulnerabilities: Vulnerability[] = [];

  for (let i = 0; i < count; i++) {
    // Pick a severity from the array - we need a non-null severity value
    const severityIndex = Math.floor(Math.random() * severities.length);
    const severity = severities[severityIndex];

    vulnerabilities.push({
      vid: `VID-${Math.floor(Math.random() * 10000)}`,
      riskScore:
        severity === "critical"
          ? 9.5
          : severity === "high"
          ? 7.5
          : severity === "medium"
          ? 5.5
          : severity === "low"
          ? 3.5
          : 1.5,
      cve: `CVE-${Math.floor(Math.random() * 10000)}-${Math.floor(
        Math.random() * 10000
      )}`,
      description: `This is a ${severity} vulnerability that affects system security.`,
      published: new Date().toISOString(),
      severity: severity, // This is now guaranteed to be a non-undefined string
    });
  }

  return vulnerabilities;
}

// Helper function to fetch host statistics directly
async function fetchHostStatistics(
  hid: string
): Promise<HostStatistics | null> {
  try {
    if (!hid || hid.trim() === "") {
      console.warn("fetchHostStatistics called with invalid ID");
      // Return default empty statistics instead of throwing
      return {
        vulnerabilityCount: 0,
        totalRiskScore: 0,
        averageRiskScore: 0,
        hostSeverityCounts: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          informational: 0,
        },
      };
    }
    const response = await httpClient.get<HostStatistics>(
      `host/statistics/${hid}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching host statistics (routers/host.ts): ${hid}`,
      error
    );
    // Return default empty statistics
    return {
      vulnerabilityCount: 0,
      totalRiskScore: 0,
      averageRiskScore: 0,
      hostSeverityCounts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 0,
      },
    };
  }
}

// Add type definition for the source-aware host response
export type HostWithSources = {
  // Host data is at the top level, not nested
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  HID: string;
  OS: string;
  OSVersion: string;
  IP: string;
  Hostname: string;
  Ports: null;
  Services: null;
  Vulnerabilities: null;
  HostVulnerabilities: null;
  HostPorts: null;
  CPEs: null;
  Users: null;
  Notes: null;
  AgentID: number;
  vulnerability_sources: VulnerabilityWithSource[];
  port_sources: PortWithSource[] | null;
  sources: string[];
};

export type EnhancedHostData = {
  host: SiriusHost;
  software_inventory?: {
    packages: Array<{
      name: string;
      version: string;
      architecture?: string;
      install_date?: string;
      size_bytes?: number;
      description?: string;
      publisher?: string;
      source?: string;
      cpe?: string;
      dependencies?: string[];
    }>;
    package_count: number;
    collected_at: string;
    source: string;
    statistics?: {
      architectures: Record<string, number>;
      publishers: Record<string, number>;
    };
  };
  system_fingerprint?: {
    fingerprint: {
      hardware?: {
        cpu?: {
          model: string;
          cores: number;
          architecture: string;
        };
        memory?: {
          total_gb: number;
          available_gb: number;
        };
        storage?: Array<{
          device: string;
          size_gb: number;
          type: string;
          filesystem: string;
        }>;
      };
      network?: {
        interfaces: Array<{
          name: string;
          mac: string;
          ipv4: string[];
          ipv6: string[];
        }>;
        dns_servers: string[];
      };
      services?: Array<{
        name: string;
        status: string;
        pid?: number;
        description?: string;
      }>;
      users?: Array<{
        name: string;
        uid: number;
        groups: string[];
        shell?: string;
      }>;
      certificates?: Array<{
        subject: string;
        issuer: string;
        expires: string;
        fingerprint: string;
        store: string;
      }>;
    };
    collected_at: string;
    source: string;
    platform: string;
    collection_duration_ms: number;
  };
  agent_metadata?: {
    agent_version?: string;
    scan_duration?: number;
    scan_modules?: string[];
    template_results?: Array<{
      template_id: string;
      vulnerability_id: string;
      vulnerable: boolean;
      confidence: number;
    }>;
  };
};

export type SoftwareStatistics = {
  total_packages: number;
  architectures: Record<string, number>;
  publishers: Record<string, number>;
  packages_by_source: Record<string, number>;
  last_updated: string;
};

export type VulnerabilityWithSource = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  VID: string;
  Description: string;
  Title: string;
  Hosts: null;
  HostVulnerabilities: null;
  RiskScore: number;
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  confidence: number;
  port?: number;
  service_info?: string;
  notes?: string;
  /** The complete scanner observation, when the source stored one. */
  finding?: {
    vid?: string;
    title?: string;
    description?: string;
    riskScore?: number;
    cve_id?: string;
    cvss_score?: number;
    severity?: string;
    confidence?: number;
    remediation?: string;
    metadata?: {
      evidence?: unknown;
      references?: unknown;
    } | null;
  } | null;
};

export type PortWithSource = {
  ID: number;
  Number: number; // The actual port number (22, 80, 443, etc.)
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  Protocol: string;
  State: string;
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  notes?: string;
};

const acceptedHostHistoryResponse = z.object({
  view: z.literal("accepted_reports"),
  host_ip: z.string(),
  timeline: z.array(z.object({
    id: z.string().min(1),
    event_type: z.enum(["host_discovery", "report_accepted"]),
    timestamp: z.string().nullable(),
    source: z.string(),
    details: z.string(),
    report: z.object({
      submitted_item_count: z.number().int().nullable(),
      source_version: z.string(),
      assessment_coverage: z.literal("unknown"),
    }).optional(),
  }).refine((event) => event.event_type !== "report_accepted" || event.report !== undefined)),
  sources: z.array(z.string()),
  next_cursor: z.string().max(256).optional(),
});

// ─── Risk, ports, freshness and clean summaries (ADR-2/3/4) ─────────────────
//
// Everything below runs on the server. Pages read riskScore / riskBand /
// counts from these outputs and never compute risk in the browser.

/** One open finding on a host, deduplicated across sources (host page). */
export interface HostFinding extends FindingSummaryFields {
  /** CVE / finding id. */
  id: string;
  title?: string;
  /** CVSS 0–10 from the scanner (0 when it reported none). */
  cvss: number;
  severity: RiskSeverity;
  /** Every source with this finding open. */
  sources: string[];
  firstSeen?: string;
  lastSeen?: string;
  confidence: number;
  port?: number;
  serviceInfo?: string;
}

/** getHostWithSources output: the raw source data plus server summaries. */
export type HostWithSourcesSummary = HostWithSources &
  HostRiskFields & {
    openFindings: number;
    /** Open findings, one per CVE, highest CVSS first. */
    findings: HostFinding[];
    /** Open ports from all sources, with the sources that saw each. */
    openPorts: OpenPort[];
    /** Data freshness (R05). */
    freshness: HostFreshness;
    firstSeen: string | null;
    lastScan: HostLastScan | null;
  };

/**
 * GET /host/ — the inventory with each host's open findings and ports,
 * listed by single IPv4 address as every host procedure does. Throws when
 * the API fails, so callers never report invented zeros.
 */
export async function fetchInventoryHosts(): Promise<SiriusHost[]> {
  const response = await httpClient.get<SiriusHost[] | null>("host/");
  const raw = response.data;
  return Array.isArray(raw)
    ? raw.filter((h) => !!h && isValidIPv4HostIp(h.ip))
    : [];
}

/** GET /host/{ip}/sources, or null when the host is not in the inventory. */
async function fetchHostSources(ip: string): Promise<HostWithSources | null> {
  try {
    const response = await httpClient.get<HostWithSources>(
      `host/${ip}/sources`,
    );
    return response.data ?? null;
  } catch {
    return null;
  }
}

/** Catalog descriptions by CVE (GET host/vulnerabilities/all). */
async function fetchCatalogDescriptions(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const response = await httpClient.get<
      Array<{ vid?: string; description?: string }> | null
    >("host/vulnerabilities/all");
    for (const row of Array.isArray(response.data) ? response.data : []) {
      if (row?.vid && row.description) map.set(row.vid, row.description);
    }
  } catch (error) {
    console.warn("Catalog descriptions unavailable:", error);
  }
  return map;
}

/** Run `fn` over items with at most `limit` calls in flight. */
async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await fn(items[index] as T);
      }
    },
  );
  await Promise.all(workers);
  return results;
}

/**
 * A scanner finding's CVSS: its own score, else the stored risk score; 0 when
 * the scanner reported none (one decimal, 0–10).
 */
export function cvssOf(v: { cvss_score?: number | null; riskScore?: number | null }): number {
  const own = typeof v.cvss_score === "number" && v.cvss_score > 0 ? v.cvss_score : 0;
  const stored = typeof v.riskScore === "number" && v.riskScore > 0 ? v.riskScore : 0;
  return roundScore(own || stored);
}

function riskFindingsOf(vulns: Vulnerability[] | null | undefined): RiskFinding[] {
  return (vulns ?? []).map((v) => ({
    cvss: cvssOf(v),
    severity: v.severity,
    id: v.vid || v.cve_id || v.cve,
  }));
}

/**
 * Risk fields for a host from GET /host/, whose `vulnerabilities` are the
 * host's open findings (one canonical observation per CVE).
 */
export function riskFieldsForHost(
  host: Pick<SiriusHost, "vulnerabilities">,
): HostRiskFields & { openFindings: number } {
  const r = hostRisk(riskFindingsOf(host.vulnerabilities));
  return {
    riskScore: r.riskScore,
    riskBand: r.riskBand,
    ...(r.riskCve ? { riskCve: r.riskCve } : {}),
    counts: r.counts,
    openFindings: r.openFindings,
  };
}

const CLOSED_PORT_STATES = new Set(["closed", "filtered", "closed|filtered"]);

function sortPorts<P extends OpenPort>(ports: P[]): P[] {
  return ports.sort(
    (a, b) => a.port - b.port || a.protocol.localeCompare(b.protocol),
  );
}

/**
 * Open ports from GET /host/. The scanner records number, protocol and state;
 * no service name or version is stored today, so those stay unset.
 */
export function openPortsForHost(host: Pick<SiriusHost, "ports">): OpenPort[] {
  const byKey = new Map<string, OpenPort>();
  for (const p of host.ports ?? []) {
    if (!p || typeof p.number !== "number" || p.number <= 0) continue;
    if (CLOSED_PORT_STATES.has((p.state ?? "").toLowerCase())) continue;
    const protocol = (p.protocol || "tcp").toLowerCase();
    const key = `${p.number}/${protocol}`;
    if (!byKey.has(key)) {
      byKey.set(key, {
        port: p.number,
        protocol,
        ...(p.state ? { state: p.state } : {}),
      });
    }
  }
  return sortPorts([...byKey.values()]);
}

function isActive(status: string | null | undefined): boolean {
  return !status || status === "active";
}

/** Open ports from /host/{ip}/sources, with the sources that saw each. */
function openPortsFromSources(
  ports: PortWithSource[] | null | undefined,
): OpenPort[] {
  const byKey = new Map<string, OpenPort & { sources: string[] }>();
  for (const p of ports ?? []) {
    if (!p || typeof p.Number !== "number" || p.Number <= 0) continue;
    if (!isActive(p.status)) continue;
    if (CLOSED_PORT_STATES.has((p.State ?? "").toLowerCase())) continue;
    const protocol = (p.Protocol || "tcp").toLowerCase();
    const key = `${p.Number}/${protocol}`;
    const existing = byKey.get(key);
    if (existing) {
      if (p.source && !existing.sources.includes(p.source)) {
        existing.sources.push(p.source);
      }
    } else {
      byKey.set(key, {
        port: p.Number,
        protocol,
        ...(p.State ? { state: p.State } : {}),
        sources: p.source ? [p.source] : [],
      });
    }
  }
  return sortPorts([...byKey.values()]);
}

/** Epoch ms for an ISO time, ignoring Go's zero time. */
function timeOf(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) && t > 0 ? t : null;
}

/** Profile and scan id from a source's config ("template:quick;scanner_id:…"). */
function parseSourceConfig(notes: string | null | undefined): {
  profile?: string;
  scanId?: string;
} {
  const out: { profile?: string; scanId?: string } = {};
  for (const part of (notes ?? "").split(";")) {
    const idx = part.indexOf(":");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!value) continue;
    if (key === "template") out.profile = value;
    else if (key === "scanner_id") out.scanId = value;
  }
  return out;
}

/** Sources that record data but are not scans. */
const NON_SCAN_SOURCES = new Set(["manual"]);

/**
 * Data freshness from /host/{ip}/sources: per source the first and last time
 * it reported anything (findings or ports), the newest scan, and when the
 * host entered the inventory. Real times only; nothing reported → null.
 */
export function freshnessFromSources(
  hws: Pick<HostWithSources, "CreatedAt" | "vulnerability_sources" | "port_sources">,
): HostFreshness {
  const bySource = new Map<
    string,
    { version?: string; first: number; last: number; notes?: string }
  >();
  let earliest: number | null = null;

  const observe = (o: {
    source?: string;
    source_version?: string;
    first_seen?: string;
    last_seen?: string;
    notes?: string;
  }) => {
    const name = o.source?.trim();
    if (!name) return;
    const first = timeOf(o.first_seen);
    const last = timeOf(o.last_seen) ?? first;
    if (last === null) return;
    const start = first ?? last;
    const version =
      o.source_version && o.source_version !== "unknown"
        ? o.source_version
        : undefined;
    const current = bySource.get(name);
    if (!current) {
      bySource.set(name, { version, first: start, last, notes: o.notes });
    } else {
      current.first = Math.min(current.first, start);
      if (last > current.last) {
        current.last = last;
        current.notes = o.notes;
        if (version) current.version = version;
      }
      if (!current.version && version) current.version = version;
    }
    earliest = earliest === null ? start : Math.min(earliest, start);
  };

  for (const v of hws.vulnerability_sources ?? []) observe(v);
  for (const p of hws.port_sources ?? []) observe(p);

  const sources: SourceFreshness[] = [...bySource.entries()]
    .sort((a, b) => b[1].last - a[1].last || a[0].localeCompare(b[0]))
    .map(([name, s]) => ({
      name,
      ...(s.version ? { version: s.version } : {}),
      firstSeen: new Date(s.first).toISOString(),
      lastSeen: new Date(s.last).toISOString(),
    }));

  let lastScan: HostLastScan | null = null;
  for (const [name, s] of bySource) {
    if (NON_SCAN_SOURCES.has(name)) continue;
    if (!lastScan || s.last > Date.parse(lastScan.time)) {
      lastScan = {
        time: new Date(s.last).toISOString(),
        source: name,
        ...(s.version ? { version: s.version } : {}),
        ...parseSourceConfig(s.notes),
      };
    }
  }

  const created = timeOf(hws.CreatedAt);
  const firstCandidates = [created, earliest].filter(
    (t): t is number => t !== null,
  );
  const firstSeen = firstCandidates.length
    ? new Date(Math.min(...firstCandidates)).toISOString()
    : null;

  return { firstSeen, lastScan, sources };
}

/** Go's canonical observation choice: confidence, then newest, then source. */
function preferObservation(
  a: VulnerabilityWithSource,
  b: VulnerabilityWithSource,
): boolean {
  const ca = a.confidence ?? 0;
  const cb = b.confidence ?? 0;
  if (ca !== cb) return ca > cb;
  const la = timeOf(a.last_seen) ?? 0;
  const lb = timeOf(b.last_seen) ?? 0;
  if (la !== lb) return la > lb;
  return (a.source ?? "") < (b.source ?? "");
}

/**
 * Open findings from /host/{ip}/sources, one per CVE, using the same
 * observation the inventory list uses, with clean summaries (ADR-4).
 */
export function hostFindingsFromSources(
  observations: VulnerabilityWithSource[] | null | undefined,
  catalog: Map<string, string>,
): HostFinding[] {
  const groups = new Map<string, VulnerabilityWithSource[]>();
  for (const o of observations ?? []) {
    if (!o?.VID || !isActive(o.status)) continue;
    const list = groups.get(o.VID);
    if (list) list.push(o);
    else groups.set(o.VID, [o]);
  }

  const findings: HostFinding[] = [];
  for (const [id, list] of groups) {
    let canonical = list[0] as VulnerabilityWithSource;
    for (const o of list) if (preferObservation(o, canonical)) canonical = o;
    const snapshot = canonical.finding ?? undefined;
    const cvss = cvssOf({
      cvss_score: snapshot?.cvss_score,
      riskScore: snapshot?.riskScore ?? canonical.RiskScore,
    });
    const firsts = list.map((o) => timeOf(o.first_seen)).filter((t): t is number => t !== null);
    const lasts = list.map((o) => timeOf(o.last_seen)).filter((t): t is number => t !== null);
    const summary = summaryFor({
      description: snapshot?.description ?? canonical.Description,
      catalogDescription: catalog.get(id),
    });
    findings.push({
      id,
      ...(canonical.Title && canonical.Title !== id ? { title: canonical.Title } : {}),
      cvss,
      severity: findingSeverity({ cvss, severity: snapshot?.severity }),
      ...summary,
      sources: [...new Set(list.map((o) => o.source).filter(Boolean))],
      ...(firsts.length ? { firstSeen: new Date(Math.min(...firsts)).toISOString() } : {}),
      ...(lasts.length ? { lastSeen: new Date(Math.max(...lasts)).toISOString() } : {}),
      confidence: canonical.confidence ?? 0,
      ...(typeof canonical.port === "number" ? { port: canonical.port } : {}),
      ...(canonical.service_info ? { serviceInfo: canonical.service_info } : {}),
    });
  }

  return findings.sort((a, b) => b.cvss - a.cvss || a.id.localeCompare(b.id));
}

/** Legacy row fields getAllHosts / getEnvironmentSummary always returned. */
function legacyRow(host: SiriusHost): EnvironmentTableData {
  return {
    hid: host.hid || `host-${host.ip.replace(/\./g, "-")}`,
    hostname: host.hostname || "Unknown",
    ip: host.ip || "0.0.0.0",
    os: host.os || "Unknown",
    vulnerabilityCount: host.vulnerabilities?.length ?? 0,
    groups: host.tags ?? [],
    tags: host.tags ?? [],
    vulnerabilities: host.vulnerabilities ? [...host.vulnerabilities] : [],
    ports: host.ports ? [...host.ports] : [],
  };
}

/** A host row with server-computed risk and open ports. */
export function hostRiskRow(host: SiriusHost): HostRiskRow {
  return {
    ...legacyRow(host),
    ...riskFieldsForHost(host),
    openPorts: openPortsForHost(host),
  };
}

/**
 * A host lookup that 404s means "not in the inventory" (null); anything else
 * is a failure the page must show as an error, not as a missing host.
 */
function notFoundOrThrow(error: unknown, what: string): null {
  // The shared client rejects with a sanitized error that keeps only the
  // HTTP status and an allowlisted code (see shared/apiErrors).
  const diagnostics = apiErrorDiagnostics(error);
  if (diagnostics.status === 404) return null;
  if (axios.isAxiosError(error) && error.response?.status === 404) return null;
  console.error(`Error fetching ${what}:`, diagnostics);
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Couldn't load ${what}` });
}

export const hostRouter = createTRPCRouter({
  // Create a new host in the environment
  createHost: protectedProcedure
    .input(
      z.object({
        ip: z.string().min(1, "IP address is required"),
        hostname: z.string().optional(),
        os: z.string().optional(),
        osversion: z.string().optional(),
        vulnerabilities: z.array(
          z.object({
            vid: z.string().min(1),
            title: z.string().optional(),
            description: z.string().default(""),
            riskScore: z.number().min(0).max(10).default(0),
          }),
        ).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // If vulnerabilities are provided, use POST /host/with-source for source attribution
        if (input.vulnerabilities && input.vulnerabilities.length > 0) {
          const response = await httpClient.post("/host/with-source", {
            host: {
              ip: input.ip,
              hostname: input.hostname || "",
              os: input.os || "",
              osversion: input.osversion || "",
              vulnerabilities: input.vulnerabilities.map((v) => ({
                vid: v.vid,
                title: v.title || "",
                description: v.description,
                riskScore: v.riskScore,
              })),
            },
            source: {
              name: "manual",
              version: "1.0",
              config: "ui-host-form",
            },
          });
          return response.data as { message: string; host_ip?: string };
        }

        // Otherwise use the simple POST /host
        const response = await httpClient.post("/host", {
          ip: input.ip,
          hostname: input.hostname || "",
          os: input.os || "",
          osversion: input.osversion || "",
        });
        return response.data as { message: string; host_ip?: string };
      } catch (error) {
        console.error("Error creating host:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to create host: ${error.message}`);
        }
        throw new Error("Failed to create host");
      }
    }),

  // Get a simple list of hosts (IP + hostname) for selectors
  getHostList: protectedProcedure.query(async () => {
    try {
      const response = await httpClient.get<SiriusHost[]>("host/");
      const hostListRaw = response.data;
      if (!hostListRaw || !Array.isArray(hostListRaw)) return [];
      const hostList = hostListRaw.filter((h) => isValidIPv4HostIp(h.ip));
      if (!hostList || !Array.isArray(hostList)) return [];
      return hostList.map((h) => ({
        ip: h.ip,
        hostname: h.hostname || "",
        os: h.os || "",
        vulnCount: h.vulnerabilities?.length ?? 0,
      }));
    } catch (error) {
      console.error("Error fetching host list:", error);
      return [];
    }
  }),

  // Update an existing host
  updateHost: protectedProcedure
    .input(
      z.object({
        ip: z.string().min(1, "IP address is required"),
        hostname: z.string().optional(),
        os: z.string().optional(),
        osversion: z.string().optional(),
        ports: z
          .array(
            z.object({
              number: z.number(),
              protocol: z.string(),
              state: z.string(),
            })
          )
          .optional(),
        notes: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await httpClient.put(`/host/${input.ip}`, {
          hostname: input.hostname,
          os: input.os,
          osversion: input.osversion,
          ports: input.ports,
          notes: input.notes,
        });
        return response.data as { message: string; host_ip?: string };
      } catch (error) {
        console.error("Error updating host:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to update host: ${error.message}`);
        }
        throw new Error("Failed to update host");
      }
    }),

  getHost: protectedProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ input }) => {
      const { hid } = input;
      try {
        if (!hid) {
          throw new Error("No ID provided");
        }
        const response = await httpClient.get<SiriusHost>(`host/${hid}`);
        const host = response.data;

        return host;
        // return mockHostData;
      } catch (error) {
        console.error("Error fetching host (routers/host.ts):", hid);
        // console.error(error);
        return null;
      }
    }),

  getHostStatistics: protectedProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ input }) => {
      const { hid } = input;
      return fetchHostStatistics(hid);
    }),

  // Inventory rows for the Environment table: legacy fields plus the
  // server-computed risk (ADR-3), open ports and data freshness per host.
  getEnvironmentSummary: protectedProcedure.query(
    async (): Promise<EnvironmentHostRow[]> => {
      try {
        const hostList = await fetchInventoryHosts();
        // Freshness comes from each host's source attribution. Bounded so a
        // large inventory does not open hundreds of requests at once.
        const freshness = await mapLimit(hostList, 6, async (host) => {
          const sources = await fetchHostSources(host.ip);
          return sources ? freshnessFromSources(sources) : null;
        });

        return hostList.map((host, index) => {
          const fresh = freshness[index] ?? null;
          return {
            ...hostRiskRow(host),
            sources: fresh ? fresh.sources.map((s) => s.name) : [],
            firstSeen: fresh?.firstSeen ?? null,
            lastScan: fresh?.lastScan ?? null,
            sourceFreshness: fresh?.sources ?? [],
          };
        });
      } catch (error) {
        // Surface the failure: an empty list would read as "no hosts".
        console.error("Error fetching environment summary:", error);
        throw new Error("Failed to load the inventory");
      }
    },
  ),

  // Retrieve all host/environment data, with server-computed risk (ADR-3)
  getAllHosts: protectedProcedure.query(async (): Promise<HostRiskRow[]> => {
    try {
      const hostList = await fetchInventoryHosts();
      return hostList.map(hostRiskRow);
    } catch (error) {
      // Surface the failure: an empty list would read as "no hosts".
      console.error("Error fetching hosts:", error);
      throw new Error("Failed to load the inventory");
    }
  }),

  /**
   * Which IPs are in the inventory, for the Scanner's "Saved to inventory"
   * (R03), with each host's server-computed risk and open ports.
   */
  getInventoryIps: protectedProcedure.query(
    async (): Promise<InventoryIpsResult> => {
      const hostList = await fetchInventoryHosts();
      const hosts: InventoryHostRef[] = hostList.map((host) => ({
        ip: host.ip,
        ...(host.hostname ? { hostname: host.hostname } : {}),
        ...(host.os ? { os: host.os } : {}),
        ...riskFieldsForHost(host),
        openPorts: openPortsForHost(host),
      }));
      return { ips: hosts.map((h) => h.ip), hosts };
    },
  ),

  /**
   * When each given host was saved to the inventory and last reported on,
   * per source (R03 "Saved to inventory <time>", R04/R05 freshness).
   * IPs not in the inventory come back with inInventory false.
   */
  getHostFreshness: protectedProcedure
    .input(z.object({ ips: z.array(z.string().min(1)).max(50) }))
    .query(async ({ input }): Promise<HostFreshnessEntry[]> => {
      const ips = [...new Set(input.ips.map((ip) => ip.trim()))].filter(
        isValidIPv4HostIp,
      );
      return mapLimit(ips, 6, async (ip) => {
        const sources = await fetchHostSources(ip);
        if (!sources) {
          return {
            ip,
            inInventory: false,
            savedAt: null,
            firstSeen: null,
            lastScan: null,
            sources: [],
          };
        }
        const savedAt = timeOf(sources.CreatedAt);
        return {
          ip,
          inInventory: true,
          savedAt: savedAt ? new Date(savedAt).toISOString() : null,
          ...freshnessFromSources(sources),
        };
      });
    }),

  // Get source coverage statistics
  getSourceCoverage: protectedProcedure.query(async () => {
    try {
      const response = await httpClient.get("host/source-coverage");
      // The API returns { source_coverage_stats: [...], total_sources: n }
      // Extract just the array for the frontend
      if (response.data?.source_coverage_stats) {
        return response.data.source_coverage_stats as SourceCoverageStats[];
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching source coverage stats:", error);
      // Return empty array instead of mock data
      return [];
    }
  }),

  // Get host with source attribution (deduplicated data)
  // The host page's data: source attribution plus server summaries — risk
  // (ADR-3), open findings with clean summaries (ADR-4), open ports and data
  // freshness. null when the host is not in the inventory.
  getHostWithSources: protectedProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }): Promise<HostWithSourcesSummary | null> => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Call the source-aware API endpoint
        const [response, catalog] = await Promise.all([
          httpClient.get<HostWithSources>(
            `host/${ip}/sources`
          ),
          fetchCatalogDescriptions(),
        ]);
        const hostWithSources = response.data;
        if (!hostWithSources) return null;

        const findings = hostFindingsFromSources(
          hostWithSources.vulnerability_sources,
          catalog,
        );
        const risk = hostRisk(
          findings.map((f) => ({ cvss: f.cvss, severity: f.severity, id: f.id })),
        );
        const freshness = freshnessFromSources(hostWithSources);

        return {
          ...hostWithSources,
          riskScore: risk.riskScore,
          riskBand: risk.riskBand,
          ...(risk.riskCve ? { riskCve: risk.riskCve } : {}),
          counts: risk.counts,
          openFindings: risk.openFindings,
          findings,
          openPorts: openPortsFromSources(hostWithSources.port_sources),
          freshness,
          firstSeen: freshness.firstSeen,
          lastScan: freshness.lastScan,
        };
      } catch (error) {
        return notFoundOrThrow(error, "host with sources");
      }
    }),

  // Get host software inventory (packages)
  getHostSoftwareInventory: protectedProcedure
    .input(
      z.object({
        ip: z.string(),
        filter: z.string().optional(),
        architecture: z.string().optional(),
        publisher: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { ip, filter, architecture, publisher } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (filter) params.append("filter", filter);
        if (architecture) params.append("architecture", architecture);
        if (publisher) params.append("publisher", publisher);

        const queryString = params.toString();
        const url = `host/${ip}/packages${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await httpClient.get(url);
        return response.data;
      } catch (error) {
        console.error("Error fetching host software inventory:", error);
        return null;
      }
    }),

  // Get host software statistics
  getHostSoftwareStats: protectedProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        const response = await httpClient.get(`host/${ip}/software-stats`);
        return response.data;
      } catch (error) {
        console.error("Error fetching host software statistics:", error);
        return null;
      }
    }),

  // Get host system fingerprint
  getHostSystemFingerprint: protectedProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        const response = await httpClient.get(`host/${ip}/fingerprint`);
        return response.data;
      } catch (error) {
        console.error("Error fetching host system fingerprint:", error);
        return null;
      }
    }),

  // Get enhanced host data with SBOM and fingerprint information
  getEnhancedHostData: protectedProcedure
    .input(
      z.object({
        ip: z.string(),
        include: z.array(z.string()).optional(),
        enhanced: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const { ip, include, enhanced } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Build query parameters for the enhanced endpoint
        const params = new URLSearchParams();
        if (include && include.length > 0) {
          params.append("include", include.join(","));
        }
        if (enhanced) {
          params.append("enhanced", "true");
        }

        const queryString = params.toString();
        const url = `host/${ip}${queryString ? `?${queryString}` : ""}`;

        const response = await httpClient.get<EnhancedHostData>(url);
        return response.data;
      } catch (error) {
        console.error("Error fetching enhanced host data:", error);
        return null;
      }
    }),

  // (A second, identical getHostSystemFingerprint used to sit here; the
  // duplicate object key was a type error and has been removed.)

  // Get enhanced software statistics for environment overview
  getEnvironmentSoftwareStats: protectedProcedure.query(async () => {
    try {
      // Get all hosts first
      const hostsResponse = await httpClient.get<SiriusHost[]>("host/");
      const hosts = hostsResponse.data;

      if (!hosts || !Array.isArray(hosts)) {
        return {
          total_hosts: 0,
          total_packages: 0,
          top_software: [],
          architecture_distribution: {},
          publisher_distribution: {},
        };
      }

      // Aggregate software statistics across all hosts
      let totalPackages = 0;
      const softwareCount: Record<string, number> = {};
      const architectureDistribution: Record<string, number> = {};
      const publisherDistribution: Record<string, number> = {};

      // Get software stats for each host
      const statsPromises = hosts.map(async (host) => {
        try {
          const statsResponse = await httpClient.get(
            `host/${host.ip}/software-stats`
          );
          return { ip: host.ip, stats: statsResponse.data };
        } catch (error) {
          return { ip: host.ip, stats: null };
        }
      });

      const allStats = await Promise.all(statsPromises);

      allStats.forEach(({ stats }) => {
        if (stats) {
          totalPackages += stats.total_packages || 0;

          // Aggregate architectures
          if (stats.architectures) {
            Object.entries(stats.architectures).forEach(([arch, count]) => {
              architectureDistribution[arch] =
                (architectureDistribution[arch] || 0) + count;
            });
          }

          // Aggregate publishers
          if (stats.publishers) {
            Object.entries(stats.publishers).forEach(([publisher, count]) => {
              publisherDistribution[publisher] =
                (publisherDistribution[publisher] || 0) + count;
            });
          }
        }
      });

      // Get top 10 publishers
      const topPublishers = Object.entries(publisherDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([publisher, count]) => ({ publisher, count }));

      return {
        total_hosts: hosts.length,
        total_packages: totalPackages,
        top_software: topPublishers,
        architecture_distribution: architectureDistribution,
        publisher_distribution: publisherDistribution,
      };
    } catch (error) {
      console.error("Error fetching environment software stats:", error);
      return {
        total_hosts: 0,
        total_packages: 0,
        top_software: [],
        architecture_distribution: {},
        publisher_distribution: {},
      };
    }
  }),

  // Get template detection results for a host
  getHostTemplateResults: protectedProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Get enhanced host data that includes agent metadata with template results
        const response = await httpClient.get<EnhancedHostData>(
          `host/${ip}?include=metadata&enhanced=true`
        );

        if (response.data?.agent_metadata?.template_results) {
          return {
            host_ip: ip,
            template_results: response.data.agent_metadata.template_results,
            scan_date: response.data.agent_metadata.scan_date || null,
          };
        }

        return {
          host_ip: ip,
          template_results: [],
          scan_date: null,
        };
      } catch (error) {
        console.error("Error fetching host template results:", error);
        return {
          host_ip: ip,
          template_results: [],
          scan_date: null,
        };
      }
    }),

  // Get environment-wide software inventory with aggregation and filtering
  getEnvironmentSoftwareInventory: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        publisher: z.string().optional(),
        architecture: z.string().optional(),
        vulnerability_status: z.enum(["vulnerable", "clean"]).optional(),
        source: z.string().optional(),
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const {
        search,
        publisher,
        architecture,
        vulnerability_status,
        source,
        limit,
        offset,
      } = input;

      try {
        // Get all hosts first
        const hostsResponse = await httpClient.get<SiriusHost[]>("host/");
        const hosts = hostsResponse.data;

        if (!hosts || !Array.isArray(hosts)) {
          return {
            packages: [],
            total_packages: 0,
            total_hosts: 0,
            filtered_count: 0,
          };
        }

        // Collect software inventory from all hosts
        const inventoryPromises = hosts.map(async (host) => {
          try {
            const response = await httpClient.get(`host/${host.ip}/packages`);
            return {
              host_ip: host.ip,
              hostname: host.hostname,
              inventory: response.data,
            };
          } catch (error) {
            console.log(`Failed to get inventory for host ${host.ip}:`, error);
            return {
              host_ip: host.ip,
              hostname: host.hostname,
              inventory: null,
            };
          }
        });

        const allInventories = await Promise.all(inventoryPromises);

        // Aggregate packages across all hosts
        const packageMap = new Map<
          string,
          {
            name: string;
            version: string;
            publisher: string;
            architecture: string;
            source: string;
            hosts: string[];
            host_count: number;
            vulnerability_count?: number;
            size_mb?: number;
            description?: string;
            install_dates?: string[];
          }
        >();

        allInventories.forEach(({ host_ip, hostname, inventory }) => {
          if (!inventory?.packages) return;

          inventory.packages.forEach((pkg: any) => {
            const key = `${pkg.name}:${pkg.version}:${
              pkg.publisher || "unknown"
            }:${pkg.architecture || "any"}`;

            if (packageMap.has(key)) {
              const existing = packageMap.get(key)!;
              existing.hosts.push(hostname || host_ip);
              existing.host_count += 1;
              if (pkg.install_date) {
                existing.install_dates = existing.install_dates || [];
                existing.install_dates.push(pkg.install_date);
              }
            } else {
              packageMap.set(key, {
                name: pkg.name,
                version: pkg.version,
                publisher: pkg.publisher || "Unknown",
                architecture: pkg.architecture || "any",
                source: pkg.source || "unknown",
                hosts: [hostname || host_ip],
                host_count: 1,
                description: pkg.description,
                size_mb: pkg.size_bytes
                  ? Math.round((pkg.size_bytes / 1024 / 1024) * 100) / 100
                  : undefined,
                install_dates: pkg.install_date
                  ? [pkg.install_date]
                  : undefined,
                vulnerability_count: 0, // TODO: Implement vulnerability correlation
              });
            }
          });
        });

        // Convert to array and apply filters
        let packages = Array.from(packageMap.values());

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          packages = packages.filter(
            (pkg) =>
              pkg.name.toLowerCase().includes(searchLower) ||
              pkg.description?.toLowerCase().includes(searchLower)
          );
        }

        // Apply publisher filter
        if (publisher) {
          packages = packages.filter(
            (pkg) => pkg.publisher.toLowerCase() === publisher.toLowerCase()
          );
        }

        // Apply architecture filter
        if (architecture) {
          packages = packages.filter(
            (pkg) =>
              pkg.architecture.toLowerCase() === architecture.toLowerCase()
          );
        }

        // Apply source filter
        if (source) {
          packages = packages.filter(
            (pkg) => pkg.source.toLowerCase() === source.toLowerCase()
          );
        }

        // Apply vulnerability status filter
        if (vulnerability_status) {
          if (vulnerability_status === "vulnerable") {
            packages = packages.filter(
              (pkg) => (pkg.vulnerability_count || 0) > 0
            );
          } else if (vulnerability_status === "clean") {
            packages = packages.filter(
              (pkg) => (pkg.vulnerability_count || 0) === 0
            );
          }
        }

        // Sort by host count (most widespread packages first)
        packages.sort((a, b) => b.host_count - a.host_count);

        // Apply pagination
        const totalCount = packages.length;
        const paginatedPackages = packages.slice(offset, offset + limit);

        return {
          packages: paginatedPackages,
          total_packages: totalCount,
          total_hosts: hosts.length,
          filtered_count: totalCount,
          pagination: {
            limit,
            offset,
            has_more: offset + limit < totalCount,
          },
        };
      } catch (error) {
        console.error("Error fetching environment software inventory:", error);
        return {
          packages: [],
          total_packages: 0,
          total_hosts: 0,
          filtered_count: 0,
        };
      }
    }),

  // ── Host History ──────────────────────────────────────────────────────────

  /** Fetch the scan-activity timeline for a single host. */
  getHostHistory: protectedProcedure
    .input(z.object({
      ip: z.string().min(1),
      cursor: z.string().max(256).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }))
    .query(async ({ input }) => {
      const params = new URLSearchParams({ view: "accepted_reports" });
      if (input.cursor) params.set("cursor", input.cursor);
      if (input.limit !== undefined) params.set("limit", String(input.limit));
      const path = `/host/${encodeURIComponent(input.ip)}/history`;
      const response = await httpClient.get<unknown>(path, {
        params,
        validateStatus: () => true,
      }).catch(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Host history is unavailable" });
      });
      if (response.status < 200 || response.status >= 300) {
        switch (response.status) {
          case 400:
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid host history request" });
          case 401:
            throw new TRPCError({ code: "UNAUTHORIZED", message: "Host history access denied" });
          case 403:
            throw new TRPCError({ code: "FORBIDDEN", message: "Host history access denied" });
          case 404:
            throw new TRPCError({ code: "NOT_FOUND", message: "Host not found" });
          default:
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Host history is unavailable" });
        }
      }
      try {
        return acceptedHostHistoryResponse.parse(response.data);
      } catch {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Host history is unavailable" });
      }
    }),

  /** Fetch the source history for a specific vulnerability on a host. */
  getVulnerabilityHistory: protectedProcedure
    .input(
      z.object({
        ip: z.string().min(1),
        vulnId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      try {
        const response = await httpClient.get(
          `/host/${input.ip}/vulnerability/${input.vulnId}/history`,
        );
        return response.data as {
          host_ip: string;
          vulnerability_id: string;
          history: Array<{
            source: string;
            source_version: string;
            first_seen: string;
            last_seen: string;
            status: string;
            confidence: number;
          }>;
        };
      } catch (error) {
        console.error("Error fetching vulnerability history:", error);
        return {
          host_ip: input.ip,
          vulnerability_id: input.vulnId,
          history: [],
        };
      }
    }),
});

/// MOCK DATA ///
const mockHostList: EnvironmentTableData[] = [
  {
    hid: "host1-id",
    hostname: "host1",
    ip: "192.168.1.10",
    os: "Linux",
    vulnerabilityCount: 5,
    groups: ["group1", "group2"],
    tags: ["tag1", "tag2"],
    vulnerabilities: generateMockVulnerabilities(5),
  },
  {
    hid: "host2-id",
    hostname: "host2",
    ip: "192.168.1.11",
    os: "Windows",
    vulnerabilityCount: 3,
    groups: ["group1"],
    tags: ["tag3"],
    vulnerabilities: generateMockVulnerabilities(3),
  },
];

const mockVulnerabilitySummary: VulnerabilitySummary[] = [
  {
    id: "1",
    severity: "critical",
    title: "CVE-2017-0145",
    description:
      "A remote code execution vulnerability exists when the Windows Server service improperly handles certain requests.",
  },
  {
    id: "2",
    severity: "critical",
    title: "CVE-2014-0468",
    description:
      "A remote code execution vulnerability exists in the way that the Microsoft Server service handles specially crafted packets.",
  },
];

const mockScanResults: ScanResult = {
  id: "1",
  status: "running",
  targets: ["192.168.123.234"],
  hosts: ["192.168.123.234", "192.168.123.235"],
  hostsCompleted: 1,
  vulnerabilities: mockVulnerabilitySummary,
};

const mockVulnerabilityList: VulnerabilityTableData[] = [
  {
    cve: "CVE-2020-7165",
    cvss: 1.2,
    description:
      "Improper handling of user input in SuperCoolApp 3.2.1 allows remote attackers to execute arbitrary code.",
    published: "2023-07-09",
    severity: "medium",
    count: 39,
  },
  {
    cve: "CVE-2023-4729",
    cvss: 1.9,
    description:
      "Unauthenticated remote attackers can cause a denial of service in MegaApp 2.0 by sending malformed packets.",
    published: "2023-08-08",
    severity: "low",
    count: 49,
  },
  {
    cve: "CVE-2018-9148",
    cvss: 10,
    description:
      "UltraLib 1.4.0 mishandles file uploads, allowing for remote code execution.",
    published: "2023-07-13",
    severity: "critical",
    count: 42,
  },
  {
    cve: "CVE-2020-3817",
    cvss: 4.8,
    description:
      "An insecure deserialization issue in AwesomeTool 5.2 could allow attackers to execute arbitrary code on the server.",
    published: "2023-07-04",
    severity: "medium",
    count: 47,
  },
  {
    cve: "CVE-2021-6088",
    cvss: 1.6,
    description:
      "CryptoLib 2.1 fails to validate encryption integrity, making it vulnerable to Man-in-the-Middle attacks.",
    published: "2023-08-16",
    severity: "medium",
    count: 8,
  },
  {
    cve: "CVE-2018-3106",
    cvss: 8.3,
    description:
      "A buffer overflow in YetAnotherApp 6.0 allows for privilege escalation via specially crafted network traffic.",
    published: "2023-07-05",
    severity: "high",
    count: 9,
  },
  {
    cve: "CVE-2022-5371",
    cvss: 7.9,
    description:
      "An SQL injection vulnerability in WebStore 3.0 allows attackers to execute arbitrary SQL commands.",
    published: "2023-06-10",
    severity: "high",
    count: 15,
  },
  {
    cve: "CVE-2020-6771",
    cvss: 4.4,
    description:
      "SmartApp 7.0 stores sensitive user information in plaintext, potentially exposing it to unauthorized actors.",
    published: "2023-06-18",
    severity: "medium",
    count: 26,
  },
  {
    cve: "CVE-2021-1165",
    cvss: 9.0,
    description:
      "A use-after-free vulnerability in GameEngine 2.0 can result in arbitrary code execution when processing malformed game files.",
    published: "2023-07-24",
    severity: "high",
    count: 3,
  },
  {
    cve: "CVE-2023-4954",
    cvss: 9.5,
    description:
      "An out-of-bounds read in FileParser 1.0 can cause the application to crash, leading to a denial of service.",
    published: "2023-07-19",
    severity: "critical",
    count: 1,
  },
  {
    cve: "CVE-2022-6318",
    cvss: 8.5,
    description:
      "A heap-based buffer overflow in VideoPlayer 5.0 allows attackers to execute arbitrary code via a crafted video file.",
    published: "2023-07-05",
    severity: "high",
    count: 2,
  },
  {
    cve: "CVE-2020-4997",
    cvss: 4.0,
    description:
      "An XML external entity (XXE) vulnerability in XMLParser 4.0 allows for disclosure of internal files.",
    published: "2023-06-20",
    severity: "medium",
    count: 46,
  },
  {
    cve: "CVE-2023-7714",
    cvss: 2.1,
    description:
      "Improper input validation in ImageProcessor 2.0 allows attackers to read arbitrary files on the host machine.",
    published: "2023-06-06",
    severity: "low",
    count: 45,
  },
  {
    cve: "CVE-2019-7814",
    cvss: 2.5,
    description:
      "Insecure default configurations in WebService 3.0 could allow attackers to intercept sensitive information.",
    published: "2023-07-03",
    severity: "medium",
    count: 21,
  },
  {
    cve: "CVE-2022-3072",
    cvss: 7.8,
    description:
      "An open redirect vulnerability in AuthManager 1.1 could allow for phishing attacks.",
    published: "2023-06-10",
    severity: "high",
    count: 31,
  },
  {
    cve: "CVE-2019-4933",
    cvss: 5.2,
    description:
      "An insecure direct object reference (IDOR) in FileManager 6.0 could allow unauthorized access to files.",
    published: "2023-08-18",
    severity: "medium",
    count: 50,
  },
  {
    cve: "CVE-2023-9064",
    cvss: 2.7,
    description:
      "A cross-site scripting (XSS) vulnerability in ChatApp 1.5 allows attackers to inject arbitrary web scripts.",
    published: "2023-07-21",
    severity: "low",
    count: 32,
  },
  {
    cve: "CVE-2022-2921",
    cvss: 4.5,
    description:
      "A timing attack vulnerability in CryptoService 2.0 could allow attackers to guess encrypted values.",
    published: "2023-06-13",
    severity: "low",
    count: 13,
  },
  {
    cve: "CVE-2020-5294",
    cvss: 9.9,
    description:
      "Improper access control in NetworkManager 8.0 could allow for unauthorized network changes.",
    published: "2023-08-29",
    severity: "critical",
    count: 24,
  },
  {
    cve: "CVE-2023-2596",
    cvss: 1.8,
    description:
      "A server-side request forgery (SSRF) in APIGateway 3.0 could allow attackers to make unauthorized HTTP requests.",
    published: "2023-06-04",
    severity: "low",
    count: 1,
  },
];

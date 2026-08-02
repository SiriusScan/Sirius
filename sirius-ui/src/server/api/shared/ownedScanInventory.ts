/**
 * Student inventory adapters backed by the caller's latest owned scan workspace
 * (Valkey). Does not read shared Postgres / Go host inventory.
 */

import { TRPCError } from "@trpc/server";
import { valkey } from "~/server/valkey";
import {
  decodeScanState,
  ownedLatestKey,
  ownedOwnerKey,
  ownedStateKey,
  ownedStatusKey,
} from "~/server/api/shared/ownedScan";
import type {
  HostEntry,
  ScanResult,
  VulnerabilitySummary as ScanVulnSummary,
} from "~/types/scanTypes";
import type {
  EnvironmentTableData,
  HostWithSources,
  PortWithSource,
  Vulnerability,
  VulnerabilityWithSource,
} from "~/server/api/routers/host";
import type {
  CveItem,
  SimpleVulnerability,
} from "~/server/api/routers/vulnerability";
import {
  normalizeSeverity,
  riskScoreToSeverity,
  severityToRiskScore,
} from "~/utils/riskScoreCalculator";

export type OwnedScanWorkspace = {
  scanId: string;
  status: string | null;
  scan: ScanResult;
};

export async function loadLatestOwnedScan(
  subjectId: string,
  role: string
): Promise<OwnedScanWorkspace | null> {
  const scanId = await valkey.get(ownedLatestKey(subjectId));
  if (!scanId) {
    return null;
  }

  const owner = await valkey.get(ownedOwnerKey(scanId));
  if (!owner) {
    return null;
  }
  if (owner !== subjectId && role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Not the owner of this scan",
    });
  }

  const stateRaw = await valkey.get(ownedStateKey(scanId));
  if (!stateRaw) {
    return null;
  }

  const state = decodeScanState(stateRaw);
  const status =
    (await valkey.get(ownedStatusKey(scanId))) ?? state.status ?? null;

  return {
    scanId,
    status,
    scan: state,
  };
}

export function isStudentRole(role: string | undefined): boolean {
  return role === "student";
}

function normalizeHostEntry(host: HostEntry | string): HostEntry {
  if (typeof host === "string") {
    return { id: host, ip: host };
  }
  const ip = host.ip || host.id;
  return {
    id: host.id || ip,
    ip,
    hostname: host.hostname,
    aliases: host.aliases,
    sources: host.sources,
  };
}

function resolveRiskScore(vuln: ScanVulnSummary): number {
  if (typeof vuln.risk_score === "number" && vuln.risk_score > 0) {
    return vuln.risk_score;
  }
  if (typeof vuln.cvss_score === "number" && vuln.cvss_score > 0) {
    return vuln.cvss_score;
  }
  return severityToRiskScore(normalizeSeverity(vuln.severity || "info"));
}

function normalizeVulnId(id: string): string {
  let normalized = id.trim().toUpperCase();
  if (!normalized.startsWith("CVE-") && /^[\d-]+$/.test(normalized)) {
    normalized = `CVE-${normalized}`;
  }
  return normalized;
}

function vulnMatchesId(vuln: ScanVulnSummary, targetId: string): boolean {
  const target = normalizeVulnId(targetId);
  const candidates = [vuln.id, vuln.title].filter(Boolean) as string[];
  return candidates.some((c) => normalizeVulnId(c) === target);
}

function vulnsForHost(
  scan: ScanResult,
  host: HostEntry
): ScanVulnSummary[] {
  return (scan.vulnerabilities ?? []).filter((v) => {
    if (!v.host_id) return false;
    return (
      v.host_id === host.ip ||
      v.host_id === host.id ||
      v.host_id === host.hostname
    );
  });
}

function toRouterVulnerability(vuln: ScanVulnSummary): Vulnerability {
  const riskScore = resolveRiskScore(vuln);
  return {
    vid: vuln.id || vuln.title || "unknown",
    riskScore,
    cve: vuln.id?.toUpperCase().startsWith("CVE-") ? vuln.id : undefined,
    description: vuln.description || vuln.title || "",
    published: "",
    severity: riskScoreToSeverity(riskScore),
  };
}

/** Environment table rows from owned-scan hosts + attributed vulns. */
export function environmentSummaryFromOwnedScan(
  scan: ScanResult
): EnvironmentTableData[] {
  const hosts = (scan.hosts ?? []).map(normalizeHostEntry);
  const hostKeys = new Set(hosts.flatMap((h) => [h.ip, h.id].filter(Boolean)));

  // Include hosts only present via vuln host_id (agent findings).
  for (const vuln of scan.vulnerabilities ?? []) {
    if (vuln.host_id && !hostKeys.has(vuln.host_id)) {
      hosts.push({ id: vuln.host_id, ip: vuln.host_id });
      hostKeys.add(vuln.host_id);
    }
  }

  return hosts.map((host) => {
    const vulns = vulnsForHost(scan, host).map(toRouterVulnerability);
    return {
      hid: host.id || `host-${host.ip.replace(/\./g, "-")}`,
      hostname: host.hostname || host.ip || "Unknown",
      ip: host.ip || "0.0.0.0",
      os: "Unknown",
      vulnerabilityCount: vulns.length,
      groups: [],
      tags: [],
      vulnerabilities: vulns,
    };
  });
}

export type VulnerabilityListResult = {
  vulnerabilities: SimpleVulnerability[];
  counts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
};

type SeverityBucket =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "informational";

function severityBucket(riskScore: number): SeverityBucket {
  if (riskScore >= 9.0) return "critical";
  if (riskScore >= 7.0) return "high";
  if (riskScore >= 4.0) return "medium";
  if (riskScore > 0) return "low";
  return "informational";
}

/** Aggregate VulnerabilitySummary[] into getAllVulnerabilities shape. */
export function vulnerabilitiesFromOwnedScan(
  scan: ScanResult
): VulnerabilityListResult {
  const byId = new Map<
    string,
    { vuln: SimpleVulnerability; riskScore: number }
  >();

  for (const raw of scan.vulnerabilities ?? []) {
    const id = raw.id || raw.title || "unknown";
    const key = normalizeVulnId(id);
    const riskScore = resolveRiskScore(raw);
    const existing = byId.get(key);
    if (existing) {
      existing.vuln.hostCount += 1;
      existing.riskScore = Math.max(existing.riskScore, riskScore);
      existing.vuln.riskScore = existing.riskScore;
    } else {
      byId.set(key, {
        riskScore,
        vuln: {
          vid: key,
          title: raw.title || key,
          hostCount: 1,
          description: raw.description || raw.title || "",
          riskScore,
        },
      });
    }
  }

  const vulnerabilities = Array.from(byId.values()).map((v) => v.vuln);
  const counts = {
    total: vulnerabilities.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    informational: 0,
  };
  for (const { riskScore } of byId.values()) {
    counts[severityBucket(riskScore)]++;
  }

  return { vulnerabilities, counts };
}

function emptyHostWithSources(ip: string): HostWithSources {
  const now = new Date().toISOString();
  return {
    ID: 0,
    CreatedAt: now,
    UpdatedAt: now,
    DeletedAt: null,
    HID: `host-${ip.replace(/\./g, "-")}`,
    OS: "Unknown",
    OSVersion: "",
    IP: ip,
    Hostname: ip,
    Ports: null,
    Services: null,
    Vulnerabilities: null,
    HostVulnerabilities: null,
    HostPorts: null,
    CPEs: null,
    Users: null,
    Notes: null,
    AgentID: 0,
    vulnerability_sources: [],
    port_sources: null,
    sources: ["owned-scan"],
  };
}

function toVulnerabilityWithSource(
  vuln: ScanVulnSummary,
  index: number
): VulnerabilityWithSource {
  const now = new Date().toISOString();
  const riskScore = resolveRiskScore(vuln);
  return {
    ID: index + 1,
    CreatedAt: now,
    UpdatedAt: now,
    DeletedAt: null,
    VID: vuln.id || vuln.title || `vuln-${index}`,
    Description: vuln.description || "",
    Title: vuln.title || vuln.id || "",
    Hosts: null,
    HostVulnerabilities: null,
    RiskScore: riskScore,
    source: vuln.scan_source || "network",
    source_version: "1.0",
    first_seen: now,
    last_seen: now,
    status: "active",
    confidence: 0.8,
  };
}

/**
 * Synthesize HostWithSources for an IP present in the owned scan.
 * Returns null if the IP is not in the student's scan.
 */
export function hostWithSourcesFromOwnedScan(
  scan: ScanResult,
  ip: string
): HostWithSources | null {
  const target = ip.trim();
  if (!target) return null;

  const hosts = (scan.hosts ?? []).map(normalizeHostEntry);
  let host =
    hosts.find((h) => h.ip === target || h.id === target) ?? null;

  const matchingVulns = (scan.vulnerabilities ?? []).filter(
    (v) => v.host_id === target
  );

  if (!host && matchingVulns.length === 0) {
    return null;
  }

  if (!host) {
    host = { id: target, ip: target };
  }

  const base = emptyHostWithSources(host.ip);
  base.HID = host.id || base.HID;
  base.Hostname = host.hostname || host.ip;
  base.IP = host.ip;
  base.sources = host.sources?.length
    ? host.sources
    : ["owned-scan"];
  base.vulnerability_sources = (
    matchingVulns.length > 0 ? matchingVulns : vulnsForHost(scan, host)
  ).map(toVulnerabilityWithSource);
  base.port_sources = [] as PortWithSource[];

  return base;
}

export type OwnedAffectedHost = {
  hostname: string;
  ip: string;
  os: string;
  lastSeen: string;
};

export function affectedHostsFromOwnedScan(
  scan: ScanResult,
  cveId: string
): OwnedAffectedHost[] {
  const today = new Date().toISOString().split("T")[0] ?? "";
  const hosts = (scan.hosts ?? []).map(normalizeHostEntry);
  const byIp = new Map<string, OwnedAffectedHost>();

  for (const vuln of scan.vulnerabilities ?? []) {
    if (!vulnMatchesId(vuln, cveId) || !vuln.host_id) continue;
    const host =
      hosts.find(
        (h) =>
          h.ip === vuln.host_id ||
          h.id === vuln.host_id ||
          h.hostname === vuln.host_id
      ) ?? null;
    const ip = host?.ip || vuln.host_id;
    if (byIp.has(ip)) continue;
    byIp.set(ip, {
      hostname: host?.hostname || ip,
      ip,
      os: "Unknown",
      lastSeen: today,
    });
  }

  return Array.from(byIp.values());
}

/**
 * Build a CveItem-shaped summary from owned-scan fields (no NVD / global lookup).
 * Returns null when the vuln id is not in the scan.
 */
export function cveItemFromOwnedScan(
  scan: ScanResult,
  id: string
): CveItem | null {
  const match = (scan.vulnerabilities ?? []).find((v) =>
    vulnMatchesId(v, id)
  );
  if (!match) {
    return null;
  }

  const vid = normalizeVulnId(match.id || match.title || id);
  const riskScore = resolveRiskScore(match);
  const severity = riskScoreToSeverity(riskScore).toUpperCase();
  const description =
    match.description || match.title || "No description available.";

  return {
    id: vid,
    sourceIdentifier: "owned-scan",
    vulnStatus: "Analyzed",
    published: "",
    lastModified: "",
    descriptions: [{ lang: "en", value: description }],
    references: [],
    weaknesses: [],
    configurations: [],
    vendorComments: [],
    metrics: {
      cvssMetricV31: [
        {
          source: "owned-scan",
          type: "Primary",
          cvssData: {
            version: "3.1",
            vectorString: "",
            baseScore: riskScore,
            baseSeverity: severity,
            attackVector: "NETWORK",
            attackComplexity: "LOW",
            privilegesRequired: "NONE",
            userInteraction: "NONE",
            scope: "UNCHANGED",
            confidentialityImpact: "NONE",
            integrityImpact: "NONE",
            availabilityImpact: "NONE",
          },
        },
      ],
      cvssMetricV40: [],
      cvssMetricV30: [],
      cvssMetricV2: [],
    },
  };
}

export type MostVulnerableHostRow = {
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
};

export function mostVulnerableHostsFromOwnedScan(
  scan: ScanResult,
  limit: number
): { hosts: MostVulnerableHostRow[]; total: number } {
  const rows = environmentSummaryFromOwnedScan(scan).map((host) => {
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };
    let weighted = 0;
    for (const v of host.vulnerabilities ?? []) {
      severityCounts[severityBucket(v.riskScore)]++;
      weighted += v.riskScore;
    }
    return {
      hostId: host.hid,
      hostIp: host.ip,
      hostname: host.hostname,
      totalVulnerabilities: host.vulnerabilityCount,
      weightedRiskScore: weighted,
      severityCounts,
      lastUpdated: new Date().toISOString(),
    } satisfies MostVulnerableHostRow;
  });

  rows.sort((a, b) => b.weightedRiskScore - a.weightedRiskScore);
  return {
    hosts: rows.slice(0, limit),
    total: rows.length,
  };
}

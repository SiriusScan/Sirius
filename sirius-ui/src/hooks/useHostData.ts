/**
 * useHostData.ts — Consolidated data-fetching hook for the host detail page.
 *
 * Moves all API calls out of [ip].tsx so the page component is pure
 * orchestration. The server (host.getHostWithSources) deduplicates findings
 * and ports and computes the risk score (ADR-3), severity counts, clean
 * summaries (ADR-4) and data freshness; this hook only reshapes them for the
 * existing host components. It never computes risk.
 *
 * Each finding also carries every source's stored observation of it
 * (`observations`, from hostFindings): the newest record per source, with
 * that source's own description, severity, remediation, evidence and
 * references. Unknown observation times stay unknown.
 */

import { useMemo } from "react";
import { api } from "~/utils/api";
import { normalizeHostFindings } from "~/components/host/hostFindings";
import type {
  HostPageData,
  DeduplicatedVulnerability,
  DeduplicatedPort,
  SeverityCounts,
  SeverityLevel,
  HostEditFormData,
} from "~/components/host/types";
import type { HostFinding } from "~/server/api/routers/host";
import type {
  FindingComponent,
  HostFreshness,
  HostLastScan,
  OpenPort,
  RiskBand,
  RiskSeverity,
  SeverityCounts as RiskSeverityCounts,
  SummarySource,
} from "~/types/riskSummary";

export type { HostFinding };

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * A host-page vulnerability: the legacy table shape (description is now the
 * clean summary) plus the server's ADR-4 fields.
 */
export interface HostPageVulnerability extends DeduplicatedVulnerability {
  /** CVE id (same as `cve`). */
  id: string;
  /** CVSS 0–10 from the scanner; 0 when it reported none. */
  cvss: number;
  /** Lowercase severity, the kit's key. */
  severityKey: RiskSeverity;
  summary: string;
  /** Raw scanner text for a "Scanner evidence" disclosure. */
  evidence: string;
  summarySource: SummarySource;
  component?: FindingComponent;
  firstSeen?: string;
  lastSeen?: string;
}

/** Server risk, counts, ports and freshness on top of the legacy page data. */
export interface HostRiskSummary {
  /** 0–10, one decimal: the highest CVSS among open findings (ADR-3). */
  riskScore: number;
  riskBand: RiskBand;
  /** The CVE that sets the score. */
  riskCve?: string;
  /** Open findings by severity (kit keys). */
  counts: RiskSeverityCounts;
  openFindings: number;
  /** Open ports with the sources that saw them and the service a scan identified. */
  openPorts: OpenPort[];
  freshness: HostFreshness;
  firstSeen: string | null;
  lastScan: HostLastScan | null;
  /** Open findings, one per CVE, highest CVSS first (VulnTable rows). */
  findings: HostFinding[];
}

export type HostPageDataWithRisk = HostPageData & HostRiskSummary;

// ─── Helpers ────────────────────────────────────────────────────────────────

const UPPER_SEVERITY: Record<RiskSeverity, SeverityLevel> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFORMATIONAL",
};

function toLegacyCounts(counts: RiskSeverityCounts): SeverityCounts {
  return {
    critical: counts.critical,
    high: counts.high,
    medium: counts.medium,
    low: counts.low,
    informational: counts.info,
  };
}

const EMPTY_COUNTS: RiskSeverityCounts = {
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  info: 0,
};

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useHostData(ip: string | undefined) {
  // ── Primary query: host with source attribution + server summaries ──────
  const {
    data: hostWithSources,
    isLoading: isHostLoading,
    isError: isHostError,
    refetch: refetchHost,
  } = api.host.getHostWithSources.useQuery(
    { ip: ip as string },
    {
      enabled: !!ip,
      retry: 3,
      staleTime: 30000,
    },
  );

  // ── Open ports (server-deduplicated) ────────────────────────────────────
  const deduplicatedPorts = useMemo<DeduplicatedPort[]>(() => {
    return (hostWithSources?.openPorts ?? []).map((p) => ({
      number: p.port,
      protocol: p.protocol,
      state: p.state ?? "",
      sources: p.sources ?? [],
      service:
        p.service || p.product || p.version || p.extraInfo
          ? { name: p.service, product: p.product, version: p.version, extraInfo: p.extraInfo }
          : undefined,
    }));
  }, [hostWithSources?.openPorts]);

  // ── Per-source stored observations, by finding id ───────────────────────
  const observationsById = useMemo(
    () =>
      new Map(
        normalizeHostFindings(hostWithSources?.vulnerability_sources, ip).map((f) => [
          f.cve,
          f.observations,
        ]),
      ),
    [hostWithSources?.vulnerability_sources, ip],
  );

  // ── Open findings (server-deduplicated, clean summaries) ────────────────
  const deduplicatedVulnerabilities = useMemo<HostPageVulnerability[]>(() => {
    return (hostWithSources?.findings ?? []).map((f) => ({
      id: f.id,
      cve: f.id,
      severity: UPPER_SEVERITY[f.severity],
      severityKey: f.severity,
      description: f.summary || "No description available",
      summary: f.summary,
      evidence: f.evidence,
      summarySource: f.summarySource,
      ...(f.component ? { component: f.component } : {}),
      title: f.title,
      // Real times only: first and last observation on this host.
      firstSeen: f.firstSeen,
      lastSeen: f.lastSeen,
      references: [],
      affectedHosts: ip ? [ip] : [],
      riskScore: f.cvss,
      cvss: f.cvss,
      sources: f.sources,
      // Port, service and confidence are per source, in `observations`.
      observations: observationsById.get(f.id) ?? [],
    }));
  }, [hostWithSources?.findings, ip, observationsById]);

  // ── Severity counts (server) in the legacy shape ────────────────────────
  const severityCounts = useMemo<SeverityCounts>(
    () => toLegacyCounts(hostWithSources?.counts ?? EMPTY_COUNTS),
    [hostWithSources?.counts],
  );

  // ── Assemble HostPageData ───────────────────────────────────────────────
  const hostData = useMemo<HostPageDataWithRisk | null>(() => {
    if (!hostWithSources) return null;

    return {
      hid: hostWithSources.ID.toString(),
      hostname: hostWithSources.Hostname,
      ip: hostWithSources.IP,
      os: hostWithSources.OS,
      osversion: hostWithSources.OSVersion,
      agentId: hostWithSources.AgentID,
      createdAt: hostWithSources.CreatedAt,
      updatedAt: hostWithSources.UpdatedAt,
      sources: hostWithSources.sources ?? [],
      vulnerabilities: deduplicatedVulnerabilities,
      ports: deduplicatedPorts,
      severityCounts,
      vulnerabilityCount: hostWithSources.openFindings,
      portCount: deduplicatedPorts.length,
      notes: hostWithSources.Notes,
      riskScore: hostWithSources.riskScore,
      riskBand: hostWithSources.riskBand,
      ...(hostWithSources.riskCve ? { riskCve: hostWithSources.riskCve } : {}),
      counts: hostWithSources.counts,
      openFindings: hostWithSources.openFindings,
      openPorts: hostWithSources.openPorts,
      freshness: hostWithSources.freshness,
      firstSeen: hostWithSources.firstSeen,
      lastScan: hostWithSources.lastScan,
      findings: hostWithSources.findings,
    };
  }, [hostWithSources, deduplicatedVulnerabilities, deduplicatedPorts, severityCounts]);

  // ── Edit form data ──────────────────────────────────────────────────────
  // Every recorded port (any state) so saving the form keeps them all.
  const editFormData = useMemo<HostEditFormData | undefined>(() => {
    if (!hostWithSources) return undefined;
    const allPorts = new Map<string, { number: number; protocol: string; state: string }>();
    for (const p of hostWithSources.port_sources ?? []) {
      const key = `${p.Number}/${p.Protocol}`;
      if (!allPorts.has(key)) {
        allPorts.set(key, { number: p.Number, protocol: p.Protocol, state: p.State });
      }
    }
    return {
      ip: hostWithSources.IP,
      hostname: hostWithSources.Hostname || undefined,
      os: hostWithSources.OS || undefined,
      osversion: hostWithSources.OSVersion || undefined,
      ports: [...allPorts.values()],
      notes: hostWithSources.Notes || undefined,
    };
  }, [hostWithSources]);

  return {
    /** Assembled host page data, with server risk and freshness — null while loading */
    hostData,
    /** Open findings for table display (description = clean summary) */
    vulnerabilities: deduplicatedVulnerabilities,
    /** Open ports */
    ports: deduplicatedPorts,
    /** Severity breakdown (legacy keys) */
    severityCounts,
    /** Pre-formatted data for the edit form */
    editFormData,
    /** Loading state */
    isLoading: isHostLoading,
    /** Error state */
    isError: isHostError,
    /** Refetch all data */
    refetch: refetchHost,
  };
}

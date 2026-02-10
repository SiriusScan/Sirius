/**
 * useHostData.ts — Consolidated data-fetching hook for the host detail page.
 *
 * Moves all API calls, deduplication, and memoization out of [ip].tsx so the
 * page component is pure orchestration. Returns a typed HostPageData object
 * plus loading / error states.
 */

import { useMemo } from "react";
import { api } from "~/utils/api";
import {
  riskScoreToSeverity,
  normalizeSeverity,
} from "~/utils/riskScoreCalculator";
import type {
  HostPageData,
  DeduplicatedVulnerability,
  DeduplicatedPort,
  SeverityCounts,
  SeverityLevel,
  HostEditFormData,
  HostHistoryTimeline,
} from "~/components/host/types";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Maps a CVSS risk score to an uppercase severity label.
 */
function determineSeverity(cvssScore: number): SeverityLevel {
  const severity = riskScoreToSeverity(cvssScore);
  const upperMap: Record<string, SeverityLevel> = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
    info: "INFORMATIONAL",
  };
  return upperMap[severity] ?? "INFORMATIONAL";
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useHostData(ip: string | undefined) {
  // ── Primary query: host with source attribution ─────────────────────────
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

  // ── Deduplicate ports ───────────────────────────────────────────────────
  const deduplicatedPorts = useMemo<DeduplicatedPort[]>(() => {
    if (!hostWithSources?.port_sources) return [];

    const portMap = new Map<number, DeduplicatedPort>();

    hostWithSources.port_sources.forEach((portSource) => {
      const portNumber = portSource.Number;

      if (portMap.has(portNumber)) {
        const existing = portMap.get(portNumber)!;
        if (!existing.sources.includes(portSource.source)) {
          existing.sources.push(portSource.source);
        }
      } else {
        portMap.set(portNumber, {
          number: portSource.Number,
          protocol: portSource.Protocol,
          state: portSource.State,
          sources: [portSource.source],
          service: undefined,
        });
      }
    });

    return Array.from(portMap.values());
  }, [hostWithSources?.port_sources]);

  // ── Deduplicate vulnerabilities ─────────────────────────────────────────
  const deduplicatedVulnerabilities = useMemo<DeduplicatedVulnerability[]>(() => {
    if (!hostWithSources?.vulnerability_sources) return [];

    const vulnMap = new Map<string, DeduplicatedVulnerability>();

    hostWithSources.vulnerability_sources.forEach((vulnSource) => {
      const vulnId = vulnSource.VID;

      if (vulnMap.has(vulnId)) {
        const existing = vulnMap.get(vulnId)!;
        if (!existing.sources.includes(vulnSource.source)) {
          existing.sources.push(vulnSource.source);
        }
        // Keep the highest confidence
        if (vulnSource.confidence > (existing.confidence ?? 0)) {
          existing.confidence = vulnSource.confidence;
        }
      } else {
        vulnMap.set(vulnId, {
          cve: vulnSource.VID,
          severity: determineSeverity(vulnSource.RiskScore),
          description: vulnSource.Description || "No description available",
          title: vulnSource.Title || undefined,
          published: vulnSource.first_seen || new Date().toISOString(),
          lastModified: vulnSource.last_seen || new Date().toISOString(),
          references: [],
          affectedHosts: [ip as string],
          riskScore: vulnSource.RiskScore,
          sources: [vulnSource.source],
          port: vulnSource.port,
          serviceInfo: vulnSource.service_info,
          confidence: vulnSource.confidence,
        });
      }
    });

    return Array.from(vulnMap.values());
  }, [hostWithSources?.vulnerability_sources, ip]);

  // ── Severity counts ─────────────────────────────────────────────────────
  const severityCounts = useMemo<SeverityCounts>(() => {
    const counts: SeverityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    deduplicatedVulnerabilities.forEach((vuln) => {
      const severity = normalizeSeverity(vuln.severity);
      switch (severity) {
        case "critical":
          counts.critical++;
          break;
        case "high":
          counts.high++;
          break;
        case "medium":
          counts.medium++;
          break;
        case "low":
          counts.low++;
          break;
        default:
          counts.informational++;
          break;
      }
    });

    return counts;
  }, [deduplicatedVulnerabilities]);

  // ── Assemble HostPageData ───────────────────────────────────────────────
  const hostData = useMemo<HostPageData | null>(() => {
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
      sources: hostWithSources.sources,
      vulnerabilities: deduplicatedVulnerabilities,
      ports: deduplicatedPorts,
      severityCounts,
      vulnerabilityCount: deduplicatedVulnerabilities.length,
      portCount: deduplicatedPorts.length,
      notes: hostWithSources.Notes,
    };
  }, [hostWithSources, deduplicatedVulnerabilities, deduplicatedPorts, severityCounts]);

  // ── Edit form data ──────────────────────────────────────────────────────
  const editFormData = useMemo<HostEditFormData | undefined>(() => {
    if (!hostWithSources) return undefined;
    return {
      ip: hostWithSources.IP,
      hostname: hostWithSources.Hostname || undefined,
      os: hostWithSources.OS || undefined,
      osversion: hostWithSources.OSVersion || undefined,
      ports: deduplicatedPorts.map((p) => ({
        number: p.number,
        protocol: p.protocol,
        state: p.state,
      })),
      notes: hostWithSources.Notes || undefined,
    };
  }, [hostWithSources, deduplicatedPorts]);

  return {
    /** Assembled host page data — null while loading */
    hostData,
    /** Deduplicated vulnerabilities for table display */
    vulnerabilities: deduplicatedVulnerabilities,
    /** Deduplicated ports */
    ports: deduplicatedPorts,
    /** Severity breakdown */
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

// src/hooks/useScanDataMapping.ts
import { useMemo } from "react";
import { api } from "~/utils/api";
import {
  type EnvironmentTableData,
  type VulnerabilityTableData,
} from "~/types/scanTypes";
import type { VulnerabilitySummary } from "~/types/scanTypes";
import type { HostEntry } from "~/types/scanTypes";
import {
  normalizeSeverity,
  severityToRiskScore,
  riskScoreToSeverity,
} from "~/utils/riskScoreCalculator";
import { useScanResults } from "~/hooks/useScanResults";

/**
 * Maps raw scan results (hosts + vulnerabilities from useScanResults) into
 * display-ready hostList and vulnerabilityList. Fetches db hosts for OS
 * enrichment and derives CVSS/severity consistently.
 */
export function useScanDataMapping(): {
  hostList: EnvironmentTableData[];
  vulnerabilityList: VulnerabilityTableData[];
} {
  const { hosts, vulnerabilities } = useScanResults();

  const { data: dbHosts } = api.host.getEnvironmentSummary.useQuery(
    undefined,
    { refetchInterval: 5000, refetchOnWindowFocus: false }
  );

  return useMemo(() => {
    if (hosts.length === 0) {
      return { hostList: [], vulnerabilityList: [] };
    }

    // Map vulnerabilities into table data using centralized utilities
    const mappedVulnerabilities = vulnerabilities.map(
      (vuln: VulnerabilitySummary & { count?: number }) => {
        let cvssScore = 0;
        if (typeof vuln.cvss_score === "number" && vuln.cvss_score > 0) {
          cvssScore = vuln.cvss_score;
        } else if (
          typeof vuln.risk_score === "number" &&
          vuln.risk_score > 0
        ) {
          cvssScore = vuln.risk_score;
        } else {
          cvssScore = severityToRiskScore(normalizeSeverity(vuln.severity));
        }

        const hostCount =
          typeof vuln.count === "number" ? vuln.count : 1;

        const derivedSeverity =
          cvssScore > 0
            ? riskScoreToSeverity(cvssScore)
            : normalizeSeverity(vuln.severity);

        return {
          cve: vuln.title || vuln.id || "Unknown",
          cvss: cvssScore,
          description: vuln.description || "No description available",
          published: "",
          severity: derivedSeverity,
          count: hostCount,
          scan_source: vuln.scan_source,
          agent_id: vuln.agent_id,
          host_id: vuln.host_id,
        } satisfies VulnerabilityTableData;
      }
    );

    // Build per-host vulnerability count and max CVSS using host_id
    const perHostVulnCount: Record<string, number> = {};
    const perHostMaxCvss: Record<string, number> = {};
    for (const vuln of vulnerabilities) {
      const hid = vuln.host_id;
      if (hid) {
        perHostVulnCount[hid] = (perHostVulnCount[hid] ?? 0) + 1;
      }
    }
    for (const mv of mappedVulnerabilities) {
      const hid = mv.host_id;
      if (hid) {
        perHostMaxCvss[hid] = Math.max(perHostMaxCvss[hid] ?? 0, mv.cvss || 0);
      }
    }

    const osLookup: Record<string, string> = {};
    if (dbHosts && Array.isArray(dbHosts)) {
      for (const dbHost of dbHosts as { ip?: string; os?: string }[]) {
        if (dbHost.ip && dbHost.os && dbHost.os !== "Unknown") {
          osLookup[dbHost.ip] = dbHost.os;
        }
      }
    }

    const mappedHosts: EnvironmentTableData[] = hosts.map(
      (host: HostEntry) => ({
        hostname: host.hostname || host.ip,
        ip: host.ip,
        os: osLookup[host.ip] || osLookup[host.id] || "unknown",
        // Vulnerability counts are keyed by host_id from the backend, which may be
        // the IP or a separate identifier. Check both to stay resilient.
        vulnerabilityCount:
          perHostVulnCount[host.ip] ?? perHostVulnCount[host.id] ?? 0,
        maxCvss: perHostMaxCvss[host.ip] ?? perHostMaxCvss[host.id] ?? 0,
        groups: [],
        tags: [],
        scan_sources: host.sources || [],
      })
    );

    return {
      hostList: mappedHosts,
      vulnerabilityList: mappedVulnerabilities,
    };
  }, [hosts, vulnerabilities, dbHosts]);
}

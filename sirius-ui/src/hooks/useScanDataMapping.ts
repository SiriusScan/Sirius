// src/hooks/useScanDataMapping.ts
import { useMemo } from "react";
import { api } from "~/utils/api";
import {
  type EnvironmentTableData,
  type VulnerabilityTableData,
} from "~/types/scanTypes";
import type { VulnerabilitySummary } from "~/types/scanTypes";
import type { HostEntry } from "~/types/scanTypes";
import type {
  FindingSummaryFields,
  HostRiskFields,
  InventoryHostRef,
  OpenPort,
  RiskSeverity,
} from "~/types/riskSummary";
import { findingSeverity, hostRisk, roundScore } from "~/utils/risk";
import { summaryFor } from "~/utils/findingSummary";
import { formatPortService } from "~/utils/portService";
import { useScanResults } from "~/hooks/useScanResults";

/** A host this scan found ("this scan" counts; saved-to-inventory state). */
export type ScanHostRow = EnvironmentTableData &
  HostRiskFields & {
    /** Saved in the inventory (ADR-1: scanned hosts are saved automatically). */
    inInventory: boolean;
    /** Open ports from the inventory record; empty until it is saved. */
    openPorts: OpenPort[];
    /** Findings this scan reported for the host. */
    findings: number;
  };

/** A finding this scan reported, with a clean summary (ADR-4). */
export type ScanVulnRow = VulnerabilityTableData &
  FindingSummaryFields & {
    /** CVE / finding id (same as `cve`). */
    id: string;
    severityKey: RiskSeverity;
    /** "8080/tcp · http (Apache Tomcat 8.5.19)", from the finding's own fields. */
    portService?: string;
  };

/** The CVSS the scanner reported, or 0 when it reported none. */
function reportedCvss(vuln: VulnerabilitySummary): number {
  if (typeof vuln.cvss_score === "number" && vuln.cvss_score > 0) {
    return roundScore(vuln.cvss_score);
  }
  if (typeof vuln.risk_score === "number" && vuln.risk_score > 0) {
    return roundScore(vuln.risk_score);
  }
  return 0;
}

/**
 * Maps raw scan results (hosts + vulnerabilities from useScanResults) into
 * display-ready hostList and vulnerabilityList, labelled "this scan".
 *
 * Severity, per-host risk and summaries use the same pure functions the
 * server uses (utils/risk, utils/findingSummary), so a scan row and the saved
 * inventory row agree. Inventory membership, OS and open ports come from the
 * server (host.getInventoryIps).
 */
export function useScanDataMapping(): {
  hostList: ScanHostRow[];
  vulnerabilityList: ScanVulnRow[];
  /** IPs currently saved in the inventory. */
  inventoryIps: ReadonlySet<string>;
} {
  const { hosts, vulnerabilities } = useScanResults();

  const { data: inventory } = api.host.getInventoryIps.useQuery(undefined, {
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  // Catalog CVE descriptions (shared with the Dashboard and Navigator
  // query), so a finding shows the real CVE description over scanner text.
  const { data: catalog } = api.vulnerability.getAllVulnerabilities.useQuery(undefined, {
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const catalogDescriptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of catalog?.vulnerabilities ?? []) {
      if (v?.vid && v.description) map.set(v.vid, v.description);
    }
    return map;
  }, [catalog]);

  return useMemo(() => {
    const inventoryByIp = new Map<string, InventoryHostRef>(
      (inventory?.hosts ?? []).map((h) => [h.ip, h] as const),
    );
    const inventoryIps: ReadonlySet<string> = new Set(inventory?.ips ?? []);

    if (hosts.length === 0 && vulnerabilities.length === 0) {
      return { hostList: [], vulnerabilityList: [], inventoryIps };
    }

    // Findings: real CVSS (0 when unreported), severity from the shared
    // scale, clean summary with the raw text kept as evidence.
    const mappedVulnerabilities: ScanVulnRow[] = vulnerabilities.map(
      (vuln: VulnerabilitySummary & { count?: number }) => {
        const cvss = reportedCvss(vuln);
        const severityKey = findingSeverity({ cvss, severity: vuln.severity });
        const id = vuln.title || vuln.id || "Unknown";
        const summary = summaryFor({
          description: vuln.description,
          catalogDescription: catalogDescriptions.get(id) ?? catalogDescriptions.get(vuln.id),
        });
        const portService = formatPortService({
          port: vuln.port,
          protocol: vuln.protocol,
          serviceInfo: vuln.service_info,
          fallback: summary.component?.label,
        });
        return {
          id,
          cve: id,
          cvss,
          description: summary.summary || "No description available",
          ...summary,
          published: "",
          severity: severityKey,
          severityKey,
          count: typeof vuln.count === "number" ? vuln.count : 1,
          scan_source: vuln.scan_source,
          agent_id: vuln.agent_id,
          host_id: vuln.host_id,
          ...(portService ? { portService } : {}),
        };
      },
    );

    // Per-host findings from this scan, keyed by host_id (the IP).
    const perHost = new Map<string, Array<{ cvss: number; severity: string; id: string }>>();
    for (const v of mappedVulnerabilities) {
      if (!v.host_id) continue;
      const list = perHost.get(v.host_id) ?? [];
      list.push({ cvss: v.cvss, severity: v.severityKey, id: v.cve });
      perHost.set(v.host_id, list);
    }

    const toRow = (
      ip: string,
      key: string,
      hostname: string,
      sources: string[],
    ): ScanHostRow => {
      const findings = perHost.get(ip) ?? perHost.get(key) ?? [];
      const risk = hostRisk(findings);
      const saved = inventoryByIp.get(ip);
      const maxCvss = findings.reduce((m, f) => Math.max(m, f.cvss), 0);
      return {
        hostname,
        ip,
        os: saved?.os || "unknown",
        vulnerabilityCount: findings.length,
        maxCvss,
        groups: [],
        tags: [],
        scan_sources: sources,
        riskScore: risk.riskScore,
        riskBand: risk.riskBand,
        ...(risk.riskCve ? { riskCve: risk.riskCve } : {}),
        counts: risk.counts,
        findings: findings.length,
        inInventory: inventoryIps.has(ip),
        openPorts: saved?.openPorts ?? [],
      };
    };

    let mappedHosts: ScanHostRow[];

    if (hosts.length > 0) {
      mappedHosts = hosts.map((host: HostEntry) =>
        toRow(host.ip, host.id, host.hostname || host.ip, host.sources || []),
      );
    } else {
      // Hosts not decoded yet but agent vulns present — show rows from host_id so findings don't vanish.
      mappedHosts = Array.from(perHost.keys()).map((hid) =>
        toRow(hid, hid, hid, ["agent"]),
      );
    }

    return {
      hostList: mappedHosts,
      vulnerabilityList: mappedVulnerabilities,
      inventoryIps,
    };
  }, [hosts, vulnerabilities, inventory, catalogDescriptions]);
}

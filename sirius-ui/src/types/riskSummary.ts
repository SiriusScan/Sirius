/**
 * riskSummary.ts — shapes the server adds for the redesign (ADR-2/3/4).
 *
 * Every host shape the UI lists or shows carries `riskScore` (0–10, one
 * decimal: the highest CVSS among open findings), `riskBand` and `counts`
 * of open findings, all computed in the tRPC routers. Counts use the kit's
 * severity keys (`info`, not `informational`).
 */

import type { RiskBand } from "~/utils/riskBand";

export type { RiskBand };

/** Severity keys, matching the shared kit (`~/components/shared`). */
export type RiskSeverity = "critical" | "high" | "medium" | "low" | "info";

/** Open findings by severity. */
export type SeverityCounts = Record<RiskSeverity, number>;

/** Risk fields carried by every host shape (ADR-3). */
export interface HostRiskFields {
  /** 0–10, one decimal: highest CVSS among the host's open findings. */
  riskScore: number;
  riskBand: RiskBand;
  /** The CVE that sets the score, when one does. */
  riskCve?: string;
  /** Open findings by severity. */
  counts: SeverityCounts;
}

/** An open port from real scan data. */
export interface OpenPort {
  port: number;
  protocol: string;
  /** Service name, only when a scan recorded one. */
  service?: string;
  /** Service version, only when a scan recorded one. */
  version?: string;
  /** Port state as reported ("open"). */
  state?: string;
  /** Sources that reported the port, when known (host page only). */
  sources?: string[];
}

/** When one source last reported anything about a host. */
export interface SourceFreshness {
  /** Source name as stored ("nmap", "naabu", "agent", "manual"). */
  name: string;
  /** Source version as stored, when not "unknown". */
  version?: string;
  /** Earliest observation from this source (ISO). */
  firstSeen?: string;
  /** Latest observation from this source (ISO). */
  lastSeen: string;
}

/** The most recent scan that reported on a host. */
export interface HostLastScan {
  /** ISO time of the newest observation. */
  time: string;
  /** Source that made it ("nmap"). */
  source: string;
  /** Source version, when known ("7.95"). */
  version?: string;
  /** Scan profile id, when the scanner recorded one ("quick"). */
  profile?: string;
  /** Scan id, when the scanner recorded one. */
  scanId?: string;
}

/** Data freshness for a host (R05). Times are ISO strings. */
export interface HostFreshness {
  /** When the host entered the inventory (or its earliest observation). */
  firstSeen: string | null;
  /** Newest observation across sources; null when nothing has reported yet. */
  lastScan: HostLastScan | null;
  /** One entry per source, newest first. */
  sources: SourceFreshness[];
}

/** Parsed product from a scanner CPE ("cpe:/a:openbsd:openssh:10.0p2"). */
export interface FindingComponent {
  cpe: string;
  part?: "a" | "o" | "h";
  vendor: string;
  product: string;
  version?: string;
  /** Plain label, e.g. "openbsd openssh 10.0p2". */
  label: string;
}

/** Where a finding's `summary` came from (ADR-4). */
export type SummarySource = "catalog" | "scanner" | "component" | "none";

/** Clean description plus the raw scanner text (ADR-4). */
export interface FindingSummaryFields {
  /** Short, clean description for tables. Empty when nothing real is known. */
  summary: string;
  /** Raw scanner output, unchanged, for a "Scanner evidence" disclosure. */
  evidence: string;
  summarySource: SummarySource;
  /** Product the scanner matched, when its text names a CPE. */
  component?: FindingComponent;
}

/** A host in the inventory, as the Scanner needs it (R03 "Saved to inventory"). */
export interface InventoryHostRef extends HostRiskFields {
  ip: string;
  hostname?: string;
  os?: string;
  /** Number of open findings. */
  openFindings: number;
  openPorts: OpenPort[];
}

/** host.getInventoryIps output. */
export interface InventoryIpsResult {
  /** Every inventory IP, for a cheap membership check. */
  ips: string[];
  hosts: InventoryHostRef[];
}

/** host.getHostFreshness output entry. */
export interface HostFreshnessEntry extends HostFreshness {
  ip: string;
  inInventory: boolean;
  /** When the host record was saved to the inventory (ISO), if it exists. */
  savedAt: string | null;
}

/** A host in a ranked list (dashboard riskiest hosts). */
export interface RiskiestHost extends HostRiskFields {
  ip: string;
  hostname?: string;
  os?: string;
  openFindings: number;
}

/** A finding in the dashboard's "Fix these first" list. */
export interface TopFinding {
  /** CVE id. */
  id: string;
  severity: RiskSeverity;
  /** Highest CVSS reported on any host; 0 when unknown. */
  cvss: number;
  summary: string;
  summarySource: SummarySource;
  /** Number of hosts with this finding open. */
  hosts: number;
}

/** The last scan the scanner reported. */
export interface SummaryLastScan {
  id?: string;
  /** ISO end time, when the scan has finished. */
  finishedAt?: string;
  /** ISO start time, when known. */
  startedAt?: string;
  /** Scanner status ("running", "completed", "cancelled", "failed"). */
  status?: string;
  targets?: string[];
  /** Hosts this scan found. */
  hostsFound?: number;
  /** Findings this scan reported. */
  findings?: number;
  /**
   * Where it came from: the scanner state the Scanner page reads, or the
   * latest scan_completed event when that state is empty.
   */
  origin: "scanner" | "events";
}

/** statistics.getSummary output (ADR-2): one source for every count. */
export interface SummaryStats {
  hosts: { total: number };
  /** Open host-finding instances across the inventory. */
  findings: { open: number; bySeverity: SeverityCounts };
  /** Unique CVEs, as /vulnerabilities lists them (catalog CVSS bands). */
  vulnerabilities: { unique: number; bySeverity: SeverityCounts };
  /** Riskiest host; null when no host has an open finding with a score. */
  highestRisk: {
    ip: string;
    hostname?: string;
    riskScore: number;
    riskBand: RiskBand;
    riskCve?: string;
  } | null;
  /** Top 5 hosts with open findings, ranked by compareRisk. */
  riskiestHosts: RiskiestHost[];
  lastScan: SummaryLastScan | null;
  /** Up to 5 open findings, highest CVSS first. */
  topFindings: TopFinding[];
  /** ISO time the server assembled this summary. */
  generatedAt: string;
}

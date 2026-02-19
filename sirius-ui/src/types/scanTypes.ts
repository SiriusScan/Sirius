// src/types/scanTypes.ts

/** High-level scan configuration preset (stored profile ID). */
export type ScanProfile = string;

/** Legacy type alias for backwards compatibility during migration. */
export type ScanTemplate = ScanProfile;

/** Supported target input kinds (single IP, range, CIDR, DNS, etc.). */
export type TargetType =
  | "single_ip"
  | "ip_range"
  | "cidr"
  | "dns_name"
  | "dns_wildcard";

/** A single scan target (IP, range, or hostname) with optional timeout. */
export interface Target {
  value: string;
  type: TargetType;
  timeout?: number;
}

/** Agent scan execution mode: full, templates only, or scripts only. */
export type AgentScanMode = "comprehensive" | "templates-only" | "scripts-only";

/** Configuration for agent-based scanning (mode, agents, timeout, concurrency). */
export interface AgentScanConfig {
  enabled: boolean;
  mode: AgentScanMode;
  agent_ids: string[]; // empty = all connected agents
  timeout: number; // seconds, default 300
  concurrency: number; // parallel templates, default 5
  template_filter?: string[]; // specific templates, empty = all
}

/** Scan run options: profile, ports, retries, and optional agent scan config. */
export interface ScanOptions {
  profile_id: string; // References a scan profile (formerly template_id)
  template_id?: string; // Legacy field for backwards compatibility
  port_range?: string;
  aggressive?: boolean;
  exclude_ports?: string[];
  scan_types?: string[];
  max_retries?: number;
  parallel?: boolean;
  agent_scan?: AgentScanConfig;
}

/** Request payload to start a scan (targets, options, priority, optional callback). */
export interface ScanRequest {
  id: string;
  targets: Target[];
  options: ScanOptions;
  priority: number;
  callback_url?: string;
}

/** Individual vulnerability found during scanning (id, severity, title, source, etc.). */
export interface VulnerabilitySummary {
  id: string;
  severity: string;
  title: string;
  description: string;
  /** CVSS score from the backend (0.0-10.0), if available */
  cvss_score?: number;
  /** Calculated risk score from the backend (0.0-10.0), if available */
  risk_score?: number;
  /** Source of this finding: network scan or agent scan */
  scan_source?: ScanSource;
  /** Agent ID that discovered this vulnerability (if agent scan) */
  agent_id?: string;
  /** Host IP that this vulnerability belongs to */
  host_id?: string;
}

/** Source of a finding or host: network scan, agent, cloud, or application. */
export type ScanSource = "network" | "agent" | "cloud" | "application";

/** A host discovered during scanning (canonical IP, hostname, aliases, sources). */
export interface HostEntry {
  id: string;
  ip: string;
  hostname?: string;
  aliases?: string[];
  sources?: string[];
}

/** Backward/forward compatible scan target shape from scanner state. */
export type ScanTargetEntry =
  | string
  | {
      id?: string;
      ip?: string;
      value?: string;
      hostname?: string;
      sources?: string[];
    };

/** Progress tracking for a sub-scan (completed/total counts and optional label). */
export interface SubScanProgress {
  completed: number;
  total: number;
  label?: string; // "hosts", "agents", "endpoints"
}

/** An independent scan method (network or agent) with its own progress and status. */
export interface SubScan {
  type: string;
  enabled: boolean;
  status: "pending" | "dispatching" | "running" | "completed" | "failed";
  progress: SubScanProgress;
  metadata?: Record<string, unknown>;
}

/** Agent-specific metadata stored in SubScan.metadata */
export interface AgentSubScanMetadata {
  mode?: AgentScanMode;
  dispatched_agents: string[];
  agent_statuses: AgentScanStatus[];
}

/** Per-agent scan status (pending/running/completed/failed, hosts and vulns found). */
export interface AgentScanStatus {
  agent_id: string;
  status: "pending" | "running" | "completed" | "failed" | "timeout";
  started_at?: string;
  completed_at?: string;
  hosts_found: number;
  vulnerabilities_found: number;
  error?: string;
}

/** Known scan lifecycle states. */
export type ScanStatus =
  | "pending"
  | "running"
  | "cancelling"
  | "cancelled"
  | "completed"
  | "failed";

/** Live scan result object stored in ValKey and polled by the frontend. */
export interface ScanResult {
  id: string;
  status: ScanStatus;
  targets: ScanTargetEntry[];
  /** Backend may send plain IP strings or full HostEntry objects. */
  hosts: (HostEntry | string)[];
  hosts_completed: number;
  vulnerabilities: VulnerabilitySummary[];
  start_time: string;
  end_time?: string;
  sub_scans?: Record<string, SubScan>;
}

/** Minimal vulnerability representation (title, description, severity). */
export interface Vulnerability {
  title: string;
  description: string;
  severity: string;
}

/** Host data shaped for the data table display (hostname, IP, OS, vuln count, sources). */
export interface EnvironmentTableData {
  hostname: string;
  ip: string;
  os: string;
  vulnerabilityCount: number;
  /** Highest CVSS score among this host's vulnerabilities (0-10) */
  maxCvss?: number;
  groups: string[];
  tags: string[];
  /** Source of this host discovery: 'network' or 'agent' (legacy single) */
  scan_source?: ScanSource;
  /** All discovery sources for this host */
  scan_sources?: string[];
}

/** Vulnerability data shaped for the table display (CVE, CVSS, severity, source, etc.). */
export interface VulnerabilityTableData {
  cve: string;
  cvss: number;
  description: string;
  published: string;
  severity: string;
  count: number;
  /** Source of finding: 'network' or 'agent' */
  scan_source?: ScanSource;
  /** Agent ID that produced this finding, if applicable */
  agent_id?: string;
  /** Host IP this vulnerability belongs to */
  host_id?: string;
}

/** Attribution for a single source (version, first/last seen, confidence, notes). */
export interface SourceAttribution {
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  confidence: number;
  notes?: string;
}

/** Vulnerability with per-source attribution (sources array, optional port/service). */
export interface VulnerabilityWithSource {
  cve: string;
  cvss: number;
  description: string;
  published: string;
  severity: string;
  count: number;
  // Source attribution fields
  sources: SourceAttribution[];
  port?: number;
  service_info?: string;
}

/** Aggregate source stats (affected hosts, first/last detected, confidence, reports). */
export interface VulnerabilitySourceInfo {
  source: string;
  source_version: string;
  affected_hosts: number;
  first_detected: string;
  last_confirmed: string;
  average_confidence: number;
  total_reports: number;
}

/** Host plus vulnerability and port data with source attribution. */
export interface HostWithSources {
  host: {
    id: number;
    ip: string;
    hostname: string;
    os: string;
    os_version: string;
  };
  vulnerability_sources: VulnerabilityWithSource[];
  port_sources: PortWithSource[];
  sources: string[];
}

/** Port discovery with source and first/last seen metadata. */
export interface PortWithSource {
  id: number;
  number: number; // The actual port number (22, 80, 443, etc.)
  protocol: string;
  state: string;
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  notes?: string;
}

/** Per-source coverage stats (hosts scanned, vulns found, ports, last scan, confidence). */
export interface SourceCoverageStats {
  source: string;
  hosts_scanned: number;
  vulnerabilities_found: number;
  ports_discovered: number;
  last_scan_time: string;
  average_confidence: number;
}

/** Default agent scan config for new profiles */
export const DEFAULT_AGENT_SCAN_CONFIG: AgentScanConfig = {
  enabled: false,
  mode: "comprehensive",
  agent_ids: [],
  timeout: 300,
  concurrency: 5,
};

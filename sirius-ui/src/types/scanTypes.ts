// src/types/scanTypes.ts

// Profile ID is now a string referencing a stored profile
export type ScanProfile = string;

// Legacy type alias for backwards compatibility during migration
export type ScanTemplate = ScanProfile;

export type TargetType =
  | "single_ip"
  | "ip_range"
  | "cidr"
  | "dns_name"
  | "dns_wildcard";

export interface Target {
  value: string;
  type: TargetType;
  timeout?: number;
}

export interface ScanOptions {
  profile_id: string; // References a scan profile (formerly template_id)
  template_id?: string; // Legacy field for backwards compatibility
  port_range?: string;
  aggressive?: boolean;
  exclude_ports?: string[];
  scan_types?: string[];
  max_retries?: number;
  parallel?: boolean;
}

export interface ScanRequest {
  id: string;
  targets: Target[];
  options: ScanOptions;
  priority: number;
  callback_url?: string;
}

export interface VulnerabilitySummary {
  id: string;
  severity: string;
  title: string;
  description: string;
}

export interface ScanResult {
  id: string;
  status: string;
  targets: string[];
  hosts: string[];
  hosts_completed: number;
  vulnerabilities: VulnerabilitySummary[];
  start_time: string;
  end_time?: string;
}

export interface Vulnerability {
  title: string;
  description: string;
  severity: string;
}

export interface EnvironmentTableData {
  hostname: string;
  ip: string;
  os: string;
  vulnerabilityCount: number;
  groups: string[];
  tags: string[];
}

export interface VulnerabilityTableData {
  cve: string;
  cvss: number;
  description: string;
  published: string;
  severity: string;
  count: number;
}

// Enhanced vulnerability types with source attribution
export interface SourceAttribution {
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  confidence: number;
  notes?: string;
}

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

export interface VulnerabilitySourceInfo {
  source: string;
  source_version: string;
  affected_hosts: number;
  first_detected: string;
  last_confirmed: string;
  average_confidence: number;
  total_reports: number;
}

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

export interface SourceCoverageStats {
  source: string;
  hosts_scanned: number;
  vulnerabilities_found: number;
  ports_discovered: number;
  last_scan_time: string;
  average_confidence: number;
}

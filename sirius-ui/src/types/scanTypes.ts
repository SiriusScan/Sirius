// src/types/scanTypes.ts

export type ScanTemplate = 'quick' | 'full' | 'discovery' | 'vuln';

export type TargetType = 'single_ip' | 'ip_range' | 'cidr' | 'dns_name' | 'dns_wildcard';

export interface Target {
  value: string;
  type: TargetType;
  timeout?: number;
}

export interface ScanOptions {
  template: ScanTemplate;
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
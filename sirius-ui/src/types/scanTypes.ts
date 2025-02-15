// src/types/scanTypes.ts

export interface ScanResult {
  id: string;
  status: "running" | "completed";
  targets: string[];
  hosts: string[];
  hostsCompleted: number;
  vulnerabilities: Vulnerability[];
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
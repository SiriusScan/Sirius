export interface ScanResult {
  hosts: Host[];
  vulnerabilities: Vulnerability[];
  status: string;
}

export interface Host {
  id: string;
  name: string;
  ip: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: string;
  description: string;
}

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

export interface VulnerabilitySeverityCardsProps {
  counts: VulnerabilitySummary;
}

export enum ScanStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED"
} 
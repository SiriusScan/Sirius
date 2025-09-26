export interface ScanVulnerability {
  vid: string;
  description: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  riskScore: number;
}

export interface VulnerabilitySummary {
  vid: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  riskScore: number;
  hostCount: number;
}

export interface ColumnDefinition<T> {
  header: string;
  accessor?: keyof T;
  render?: (item: T) => React.ReactNode;
}

export interface ScanResult {
  status: "running" | "completed" | "failed";
  hosts: Array<{
    ip: string;
    hostname?: string;
    os?: string;
    vulnerabilities?: ScanVulnerability[];
  }>;
  vulnerabilities: VulnerabilitySummary[];
}

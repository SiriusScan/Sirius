/**
 * types.ts — Centralized type definitions for the host detail page module.
 *
 * All shared interfaces live here to prevent circular imports and make it
 * trivial to extend the data model. Follows the same pattern as console/types.ts.
 */

// Re-export upstream types consumers may need
export type {
  HostWithSources,
  VulnerabilityWithSource,
  PortWithSource,
  EnvironmentTableData,
  SiriusHost,
  SoftwareStatistics,
  EnhancedHostData,
} from "~/server/api/routers/host";

// ─── Tab Navigation ─────────────────────────────────────────────────────────

export type TabType =
  | "overview"
  | "vulnerabilities"
  | "system"
  | "network"
  | "history";

export type SystemSubTab = "overview" | "software" | "fingerprint" | "users";

// ─── Severity ───────────────────────────────────────────────────────────────

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";

// ─── Deduplicated Data ──────────────────────────────────────────────────────

/** A vulnerability deduplicated across sources, ready for table display. */
export interface DeduplicatedVulnerability {
  cve: string;
  severity: SeverityLevel;
  description: string;
  title?: string;
  published: string;
  lastModified: string;
  references: string[];
  affectedHosts: string[];
  riskScore: number;
  sources: string[];
  port?: number;
  serviceInfo?: string;
  confidence?: number;
}

/** A port deduplicated across sources with service info. */
export interface DeduplicatedPort {
  number: number;
  protocol: string;
  state: string;
  sources: string[];
  service?: {
    name?: string;
    version?: string;
  };
}

// ─── Severity Counts ────────────────────────────────────────────────────────

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

// ─── Host Page Data (clean shape for components) ────────────────────────────

/**
 * The primary data contract between useHostData and all host page components.
 * Replaces the ad-hoc EnvironmentTableData compatibility shim.
 */
export interface HostPageData {
  /** Database ID */
  hid: string;
  hostname: string;
  ip: string;
  os: string;
  osversion: string;
  /** Agent database ID — 0 means no agent */
  agentId: number;
  /** Timestamps from the API */
  createdAt?: string;
  updatedAt?: string;
  /** Discovery sources (e.g., "nmap", "agent", "rustscan") */
  sources: string[];
  /** Deduplicated vulnerabilities across all sources */
  vulnerabilities: DeduplicatedVulnerability[];
  /** Deduplicated ports across all sources */
  ports: DeduplicatedPort[];
  /** Vulnerability counts by severity */
  severityCounts: SeverityCounts;
  /** Total vulnerability count */
  vulnerabilityCount: number;
  /** Total port count */
  portCount: number;
  /** Raw notes from the API */
  notes?: string | null;
}

// ─── Edit Form Data ─────────────────────────────────────────────────────────

export interface HostEditFormData {
  ip: string;
  hostname?: string;
  os?: string;
  osversion?: string;
  ports?: Array<{
    number: number;
    protocol: string;
    state: string;
  }>;
  notes?: string;
}

// ─── Host History ───────────────────────────────────────────────────────────

export interface HostHistoryEvent {
  event_type: string;
  timestamp: string;
  source: string;
  details: string;
}

export interface HostHistoryTimeline {
  host_ip: string;
  timeline: HostHistoryEvent[];
  sources: string[];
}

// ─── Persistence Schema ─────────────────────────────────────────────────────

export interface HostPersistenceState {
  version: number;
  activeTab: TabType;
  systemSubTab: SystemSubTab;
  collapsedSections: Record<string, boolean>;
  /** Filter state for the vulnerability tab */
  vulnSourceFilter: string[];
  /** Filter state for the software inventory */
  softwareFilter: string;
  /** Whether the user has toggled system users on */
  showSystemUsers: boolean;
}

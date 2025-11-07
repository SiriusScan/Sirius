// Agent Template Types for vulnerability detection

export type Platform = "linux" | "darwin" | "windows";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type TemplateType = "repository" | "custom";

export type DetectionLogic = "all" | "any";

export type StepType =
  | "file_hash"
  | "file_content"
  | "command_version"
  | "script";

export type HashAlgorithm = "sha256" | "sha1" | "md5" | "sha512";

export type ScriptInterpreter = "bash" | "python" | "powershell";

export interface TemplateSource {
  type: "repository" | "custom";
  name: string;
  priority: number;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  severity: Severity;
  author: string;
  platforms: Platform[];
  version: string;
  createdAt: string;
  updatedAt: string;
  source?: TemplateSource;
  content?: string; // YAML content for editing
  tags?: string[]; // Optional tags from YAML
  references?: string[]; // Optional references from YAML
  cve?: string; // Optional CVE from YAML
}

export interface TemplateInfo {
  name: string;
  author: string;
  severity: Severity;

  // Risk Scoring Fields (all optional)
  // Priority: risk_score → cvss_vector → cvss_score → severity mapping
  risk_score?: number; // Custom numerical score (0.0-10.0)
  cvss_vector?: string; // CVSS v3.x vector string
  cvss_score?: number; // Pre-calculated CVSS score (0.0-10.0)

  description: string;
  references?: string[];
  cve?: string[];
  tags?: string[];
  version?: string;
}

export interface DetectionStep {
  type: StepType;
  platforms?: Platform[];
  weight?: number; // 0.0-1.0, affects confidence calculation
  config:
    | FileHashConfig
    | FileContentConfig
    | CommandVersionConfig
    | ScriptConfig;
}

export interface FileHashConfig {
  path: string;
  hash: string;
  algorithm?: HashAlgorithm;
}

export interface FileContentConfig {
  path: string;
  regex: string;
}

export interface CommandVersionConfig {
  command: string[];
  regex: string;
  exit_code?: number;
}

export interface ScriptConfig {
  interpreter: ScriptInterpreter;
  script: string;
  regex: string;
  exit_code?: number;
}

export interface DetectionConfig {
  logic?: DetectionLogic; // defaults to "all"
  steps: DetectionStep[];
}

export interface TemplateContent {
  id: string;
  info: TemplateInfo;
  detection: DetectionConfig;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateTestResult {
  template_id: string;
  agent_id: string;
  vulnerable: boolean;
  confidence: number;

  // Risk scoring information
  risk_score: number;
  cvss_vector?: string;

  evidence: Record<string, any>;
  execution_time_ms: number;
  error?: string;
  step_results?: StepResult[];
}

export interface StepResult {
  step_index: number;
  type: StepType;
  matched: boolean;
  confidence: number;
  evidence?: Record<string, any>;
  error?: string;
}

export interface TemplateAnalytics {
  top_templates: TemplatePerformance[];
  execution_stats: ExecutionStats;
  platform_distribution: Record<Platform, number>;
}

export interface TemplatePerformance {
  template_id: string;
  template_name: string;
  detection_count: number;
  execution_count: number;
  success_rate: number;
  average_execution_time_ms: number;
}

export interface ExecutionStats {
  total_executions: number;
  total_detections: number;
  average_execution_time_ms: number;
  success_rate?: number;
}

export interface TemplateDeploymentRequest {
  agent_ids: string[];
}

export interface TemplateTestRequest {
  agent_id: string;
}

// Form data types for template creation

export interface FileHashFormTarget {
  path: string;
  hash: string;
  algorithm: HashAlgorithm;
}

export interface FileContentFormTarget {
  path: string;
  regex: string;
}

export interface CommandVersionFormTarget {
  command: string;
  regex: string;
  exit_code: number;
}

export interface ScriptFormTarget {
  interpreter: ScriptInterpreter;
  script: string;
  regex: string;
  exit_code: number;
}

export interface TemplateFormData {
  // Common fields
  id: string;
  name: string;
  description: string;
  severity: Severity;

  // Risk Scoring Fields (all optional)
  risk_score?: number;
  cvss_vector?: string;
  cvss_score?: number;

  author: string;
  version: string;
  cve: string[];
  tags: string[];
  references: string[];
  platforms: Platform[];
  detection_logic: DetectionLogic;

  // Type-specific fields
  template_type: StepType;
  file_hash_targets: FileHashFormTarget[];
  file_content_targets: FileContentFormTarget[];
  command_version_targets: CommandVersionFormTarget[];
  script_target?: ScriptFormTarget;
}

// Filter states
export interface TemplateFilters {
  search: string;
  type: TemplateType[];
  severity: Severity[];
  platform: Platform[];
  source: string[];
  tags: string[];
}

export interface TemplateSort {
  field: "name" | "severity" | "created_at" | "updated_at";
  direction: "asc" | "desc";
}

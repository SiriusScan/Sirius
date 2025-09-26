/**
 * Type definitions for Template and Script management
 */

// Base types
export interface BaseInfo {
  name: string;
  description: string;
  author: string;
  created: string;
}

export interface TemplateInfo extends BaseInfo {
  severity: string;
}

export interface ScriptInfo extends BaseInfo {
  language: string;
  platform: string;
}

// Detection targets
export interface BaseTarget {
  type: string;
}

export interface FileHashTarget extends BaseTarget {
  type: "file";
  path: string;
  hash: string;
  algorithm: string;
}

export interface RegistryTarget extends BaseTarget {
  type: "registry";
  key: string;
  value?: string;
  pattern?: string;
}

export interface ConfigFileTarget extends BaseTarget {
  type: "config";
  path: string;
  patterns: string[];
}

export type DetectionTarget =
  | FileHashTarget
  | RegistryTarget
  | ConfigFileTarget;

// Content structures
export interface TemplateDetection {
  type: string;
  targets: DetectionTarget[];
}

export interface TemplateRemediation {
  description: string;
  steps: string[];
}

export interface TemplateContent {
  id: string;
  info: TemplateInfo;
  detection: TemplateDetection;
  remediation: TemplateRemediation;
}

export interface ScriptContent {
  id: string;
  info: ScriptInfo;
  script: string;
  metadata: {
    timeout: number;
    sandbox: boolean;
  };
}

// API response types
export interface TemplateWithContent {
  id: string;
  name: string;
  description: string;
  severity: string;
  type: string;
  source?: {
    type: string;
    name?: string;
    priority?: number;
  };
  created_at?: string;
  updated_at?: string;
  contentYaml: string;
}

export interface ScriptWithContent {
  id: string;
  name: string;
  description: string;
  language: string;
  platform: string;
  source?: {
    type: string;
    name?: string;
    priority?: number;
  };
  created_at?: string;
  updated_at?: string;
  scriptContent: string;
}

// Form data types
export interface FileHashFormTarget {
  path: string;
  hash: string;
  algorithm: string;
}

export interface RegistryFormTarget {
  key: string;
  value: string;
  pattern: string;
}

export interface ConfigFileFormTarget {
  path: string;
  patterns: string[];
}

export interface TemplateFormData {
  fileHashTargets: FileHashFormTarget[];
  registryTargets: RegistryFormTarget[];
  configFileTargets: ConfigFileFormTarget[];
}

// Component state types
export interface TemplateState {
  id: string;
  name: string;
  description: string;
  severity: string;
  type: string;
  content: string;
}

export interface ScriptState {
  id: string;
  name: string;
  description: string;
  language: string;
  platform: string;
  content: string;
}

// Discovery result types
export interface DiscoveryResult {
  templates?: TemplateWithContent[];
  scripts?: ScriptWithContent[];
  error?: string;
}

// Queue message types
export interface QueueMessage {
  operation: "create" | "update" | "delete";
  type: "template" | "script";
  id: string;
  content?: TemplateContent | ScriptContent;
  metadata: {
    source: string;
    timestamp: string;
    user_id: string;
  };
}

// Monaco editor language mappings
export type MonacoLanguage =
  | "yaml"
  | "shell"
  | "powershell"
  | "python"
  | "javascript"
  | "lua"
  | "perl"
  | "ruby";

export type ScriptLanguage =
  | "bash"
  | "powershell"
  | "python"
  | "javascript"
  | "lua"
  | "perl"
  | "ruby";

// Severity levels
export type SeverityLevel = "critical" | "high" | "medium" | "low";

// Template types
export type TemplateType = "file-hash" | "registry" | "config-file";

// Platform types
export type PlatformType = "linux" | "windows" | "macos" | "cross-platform";

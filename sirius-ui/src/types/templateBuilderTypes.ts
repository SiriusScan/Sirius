// Template Builder Type Definitions
import type { Platform, Severity, DetectionLogic } from "./agentTemplateTypes";

export type TemplateBuilderView = "library" | "builder" | "viewer";

// Detection step types
export type StepType = "file_hash" | "file_content" | "version_cmd";

export type HashAlgorithm = "sha256" | "sha1" | "md5" | "sha512";

// Detection step form data (discriminated union)
export type DetectionStepFormData =
  | FileHashStepData
  | FileContentStepData
  | VersionCmdStepData;

export interface FileHashStepData {
  type: "file_hash";
  id: string; // Unique ID for managing steps in UI
  path: string;
  hash: string;
  algorithm: HashAlgorithm;
  platforms: Platform[];
  weight: number;
}

export interface FileContentStepData {
  type: "file_content";
  id: string;
  path: string;
  regex: string;
  multiline?: boolean;
  platforms: Platform[];
  weight: number;
}

export interface VersionCmdStepData {
  type: "version_cmd";
  id: string;
  command: string[]; // Array of command parts
  regex: string;
  exitCode?: number;
  platforms: Platform[];
  weight: number;
}

// Complete template form state
export interface TemplateFormState {
  // Metadata
  id: string;
  name: string;
  description: string;
  severity: Severity;
  author: string;
  version: string;
  cve: string[]; // Array of CVE IDs
  tags: string[];
  references: string[]; // Array of URLs

  // Detection configuration
  detectionLogic: DetectionLogic;
  detectionSteps: DetectionStepFormData[];
}

// Validation error structure
export interface ValidationErrors {
  // Metadata errors
  id?: string;
  name?: string;
  description?: string;
  severity?: string;
  author?: string;
  version?: string;
  cve?: string;
  tags?: string;
  references?: string;

  // Detection errors
  detectionLogic?: string;
  detectionSteps?: string;

  // Step-specific errors (keyed by step ID)
  steps?: Record<string, StepValidationErrors>;
}

export interface StepValidationErrors {
  path?: string;
  hash?: string;
  algorithm?: string;
  regex?: string;
  command?: string;
  exitCode?: string;
  platforms?: string;
  weight?: string;
}

// Filter state for template library
export interface TemplateLibraryFilters {
  search: string;
  severity: Severity[];
  platforms: Platform[];
  type: ("repository" | "custom")[];
  sortBy: "name" | "severity" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
}

// View mode for template library
export type TemplateViewMode = "grid" | "list";

// Initial empty form state
export const initialFormState: TemplateFormState = {
  id: "",
  name: "",
  description: "",
  severity: "medium",
  author: "",
  version: "1.0",
  cve: [],
  tags: [],
  references: [],
  detectionLogic: "all",
  detectionSteps: [],
};

// Initial filter state
export const initialFilterState: TemplateLibraryFilters = {
  search: "",
  severity: [],
  platforms: [],
  type: [],
  sortBy: "name",
  sortDirection: "asc",
};

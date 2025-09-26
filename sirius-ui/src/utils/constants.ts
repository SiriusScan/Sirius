/**
 * Shared constants for Template and Script management
 */

import {
  SeverityLevel,
  TemplateType,
  PlatformType,
  ScriptLanguage,
} from "./types";

// Default values
export const DEFAULT_VALUES = {
  template: {
    severity: "medium" as SeverityLevel,
    type: "file-hash" as TemplateType,
    author: "UI User",
    description: "Custom template created via UI",
  },
  script: {
    language: "bash" as ScriptLanguage,
    platform: "linux" as PlatformType,
    author: "UI User",
    description: "Custom script created via UI",
    timeout: 60,
    sandbox: true,
  },
} as const;

// Queue configuration
export const QUEUE_CONFIG = {
  templateSync: "agent_content_sync",
  scriptSync: "agent_content_sync",
  refetchInterval: 60000, // 1 minute
} as const;

// UI configuration
export const UI_CONFIG = {
  monacoWidth: {
    minWidth: "800px",
    width: "100%",
  },
  refreshInterval: 60000, // 1 minute
  cacheConfig: {
    staleTime: 0,
    cacheTime: 0,
  },
} as const;

// Validation messages
export const VALIDATION_MESSAGES = {
  requiredFields: "Please fill in all required fields",
  invalidContent: "Invalid YAML/JSON content",
  provideContent: "Please provide template content",
  provideScriptContent: "Please provide script content",
  confirmDelete: (type: string, id: string) =>
    `Are you sure you want to delete ${type} ${id}?`,
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  templateCreated: "Template created successfully",
  templateUpdated: "Template updated successfully",
  templateDeleted: "Template deleted successfully",
  scriptCreated: "Script created successfully",
  scriptUpdated: "Script updated successfully",
  scriptDeleted: "Script deleted successfully",
} as const;

// Error messages
export const ERROR_MESSAGES = {
  templateCreateFailed: "Failed to create template",
  templateUpdateFailed: "Failed to update template",
  templateDeleteFailed: "Failed to delete template",
  templateLoadFailed: "Failed to load template content",
  scriptCreateFailed: "Failed to create script",
  scriptUpdateFailed: "Failed to update script",
  scriptDeleteFailed: "Failed to delete script",
  scriptLoadFailed: "Failed to load script content",
  yamlParseFailed: "Failed to parse YAML content",
  jsonParseFailed: "Failed to parse JSON content",
} as const;

// File extensions
export const FILE_EXTENSIONS = {
  template: ".yaml",
  script: ".sh", // Default, can be overridden based on language
} as const;

// Regex patterns for metadata extraction
export const METADATA_PATTERNS = {
  comment: /^(#|\/\/|<!--)\s*/,
  cleanup: /-->$/,
  keyValue: /^(\w+):\s*(.+)$/,
} as const;

// Default template content
export const DEFAULT_TEMPLATE_CONTENT = {
  id: "",
  info: {
    name: "",
    description: "",
    severity: DEFAULT_VALUES.template.severity,
    author: DEFAULT_VALUES.template.author,
    created: "",
  },
  detection: {
    type: DEFAULT_VALUES.template.type,
    targets: [],
  },
  remediation: {
    description: "Custom template remediation",
    steps: [],
  },
} as const;

/**
 * YAML Conversion Utilities
 * Shared functions for converting between JSON objects and YAML strings
 */

import { TemplateContent, ScriptContent } from "./types";

/**
 * Function to properly format content with escaped characters
 */
export const formatContent = (content: string): string => {
  if (!content) return "";

  return content
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");
};

/**
 * Convert content to YAML for editing/display
 */
export const convertToYamlForEditing = (contentData: unknown): string => {
  if (!contentData) return "";

  // If it's already a string (YAML), format and return it
  if (typeof contentData === "string") {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(contentData);
      return convertObjectToYaml(parsed);
    } catch {
      // If not JSON, assume it's already YAML and format it
      return formatContent(contentData);
    }
  }

  // If it's a JSON object, convert to YAML
  if (typeof contentData === "object") {
    return convertObjectToYaml(contentData);
  }

  return String(contentData);
};

/**
 * Convert JSON object to YAML format
 */
export const convertObjectToYaml = (
  contentData: Record<string, unknown>
): string => {
  try {
    const yamlLines: string[] = [];

    if (contentData.id) {
      yamlLines.push(`id: "${contentData.id}"`);
    }

    if (contentData.info && typeof contentData.info === "object") {
      const info = contentData.info as Record<string, unknown>;
      yamlLines.push("info:");
      if (info.name) yamlLines.push(`  name: "${info.name}"`);
      if (info.description)
        yamlLines.push(`  description: "${info.description}"`);
      if (info.severity) yamlLines.push(`  severity: "${info.severity}"`);
      if (info.author) yamlLines.push(`  author: "${info.author}"`);
      if (info.created) yamlLines.push(`  created: "${info.created}"`);
    }

    if (contentData.detection && typeof contentData.detection === "object") {
      const detection = contentData.detection as Record<string, unknown>;
      yamlLines.push("detection:");
      if (detection.type) yamlLines.push(`  type: "${detection.type}"`);

      if (Array.isArray(detection.targets)) {
        yamlLines.push("  targets:");
        detection.targets.forEach((target: Record<string, unknown>) => {
          yamlLines.push(`    - type: "${target.type || ""}"`);
          if (target.path) yamlLines.push(`      path: "${target.path}"`);
          if (target.hash) yamlLines.push(`      hash: "${target.hash}"`);
          if (target.algorithm)
            yamlLines.push(`      algorithm: "${target.algorithm}"`);
          if (target.key) yamlLines.push(`      key: "${target.key}"`);
          if (target.value) yamlLines.push(`      value: "${target.value}"`);
          if (target.pattern)
            yamlLines.push(`      pattern: "${target.pattern}"`);
          if (Array.isArray(target.patterns)) {
            yamlLines.push("      patterns:");
            target.patterns.forEach((pattern: string) => {
              yamlLines.push(`        - "${pattern}"`);
            });
          }
        });
      } else {
        yamlLines.push("  targets: []");
      }
    }

    if (
      contentData.remediation &&
      typeof contentData.remediation === "object"
    ) {
      const remediation = contentData.remediation as Record<string, unknown>;
      yamlLines.push("remediation:");
      if (remediation.description) {
        yamlLines.push(`  description: "${remediation.description}"`);
      }
      if (Array.isArray(remediation.steps) && remediation.steps.length > 0) {
        yamlLines.push("  steps:");
        remediation.steps.forEach((step: string) => {
          yamlLines.push(`    - "${step}"`);
        });
      } else {
        yamlLines.push("  steps: []");
      }
    }

    return yamlLines.join("\n");
  } catch (error) {
    console.error("Failed to convert JSON to YAML:", error);
    return JSON.stringify(contentData, null, 2);
  }
};

/**
 * Convert YAML content back to JSON for saving
 */
export const convertYamlToJson = (
  yamlContent: string
): Record<string, unknown> => {
  if (!yamlContent.trim()) return {};

  try {
    // First try to parse as JSON (in case it's already JSON)
    return JSON.parse(yamlContent);
  } catch {
    // If it's not JSON, try to parse as YAML-like content
    try {
      return parseYamlLikeContent(yamlContent);
    } catch (error) {
      console.error("Failed to parse YAML-like content:", error);
      // Fallback: return a basic structure
      return createFallbackTemplate();
    }
  }
};

/**
 * Parse YAML-like content into JSON object
 */
const parseYamlLikeContent = (yamlContent: string): Record<string, unknown> => {
  const lines = yamlContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  const result: Record<string, unknown> = {};
  let currentSection: string | null = null;
  let inTargets = false;
  let currentTarget: Record<string, unknown> = {};

  for (const line of lines) {
    if (line.match(/^id:/)) {
      const idSplit = line.split(":", 2);
      if (idSplit[1]) {
        result.id = idSplit[1].trim().replace(/"/g, "");
      }
    } else if (line === "info:") {
      currentSection = "info";
      result.info = {};
    } else if (line === "detection:") {
      currentSection = "detection";
      result.detection = {};
    } else if (line === "remediation:") {
      currentSection = "remediation";
      result.remediation = {};
    } else if (line.startsWith("  ") && currentSection) {
      const trimmed = line.substring(2);
      if (trimmed.includes(":")) {
        const splitResult = trimmed.split(":", 2);
        const key = splitResult[0];
        const value = splitResult[1];
        if (key && value !== undefined) {
          const cleanKey = key.trim();
          const cleanValue = value.trim().replace(/"/g, "");

          if (cleanKey === "targets") {
            inTargets = true;
            const section = result[currentSection] as Record<string, unknown>;
            if (section) section.targets = [];
          } else if (cleanKey === "steps") {
            const section = result[currentSection] as Record<string, unknown>;
            if (section) section.steps = [];
          } else {
            const section = result[currentSection] as Record<string, unknown>;
            if (section) section[cleanKey] = cleanValue;
          }
        }
      }
    } else if (line.startsWith("    - ") && inTargets) {
      // New target
      if (Object.keys(currentTarget).length > 0) {
        const detection = result.detection as Record<string, unknown>;
        const targets = detection?.targets as Record<string, unknown>[];
        if (targets) targets.push(currentTarget);
      }
      currentTarget = {};
      const value = line.substring(6).trim();
      if (value.includes(":")) {
        const splitResult = value.split(":", 2);
        const key = splitResult[0];
        const val = splitResult[1];
        if (key && val !== undefined) {
          currentTarget[key.trim()] = val.trim().replace(/"/g, "");
        }
      }
    } else if (line.startsWith("      ") && inTargets) {
      // Target property
      const trimmed = line.substring(6);
      if (trimmed.includes(":")) {
        const splitResult = trimmed.split(":", 2);
        const key = splitResult[0];
        const value = splitResult[1];
        if (key && value !== undefined) {
          currentTarget[key.trim()] = value.trim().replace(/"/g, "");
        }
      }
    }
  }

  // Add the last target if exists
  if (Object.keys(currentTarget).length > 0) {
    const detection = result.detection as Record<string, unknown>;
    const targets = detection?.targets as Record<string, unknown>[];
    if (targets) targets.push(currentTarget);
  }

  return result;
};

/**
 * Create a fallback template structure when parsing fails
 */
const createFallbackTemplate = (): Record<string, unknown> => {
  return {
    id: "",
    info: {
      name: "Parsing Error",
      description: "Failed to parse template content",
      severity: "medium",
      author: "UI User",
      created: new Date().toISOString(),
    },
    detection: {
      type: "custom",
      targets: [],
    },
    remediation: {
      description: "Custom template remediation",
      steps: [],
    },
  };
};

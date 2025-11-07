import type {
  TemplateFormState,
  DetectionStepFormData,
  FileHashStepData,
  FileContentStepData,
  VersionCmdStepData,
} from "~/types/templateBuilderTypes";
import type {
  Platform,
  Severity,
  DetectionLogic,
} from "~/types/agentTemplateTypes";
// @ts-expect-error - js-yaml types may not be available
import yaml from "js-yaml";

/**
 * Converts a TemplateFormState to YAML string format
 */
export function convertFormToYAML(form: TemplateFormState): string {
  const yaml: string[] = [];

  // ID at root level (not in info)
  yaml.push(`id: ${form.id}`);
  yaml.push("");

  // Info section
  yaml.push("info:");
  yaml.push(`  name: "${escapeYAMLString(form.name)}"`);
  yaml.push(`  severity: ${form.severity}`);
  yaml.push(`  description: "${escapeYAMLString(form.description)}"`);

  if (form.author) {
    yaml.push(`  author: "${escapeYAMLString(form.author)}"`);
  }

  if (form.version) {
    yaml.push(`  version: "${form.version}"`);
  }

  // CVE references
  if (form.cve && form.cve.length > 0) {
    yaml.push("  cve:");
    form.cve.forEach((cve) => {
      yaml.push(`    - "${cve}"`);
    });
  }

  // Tags
  if (form.tags && form.tags.length > 0) {
    yaml.push("  tags:");
    form.tags.forEach((tag) => {
      yaml.push(`    - "${tag}"`);
    });
  }

  // References
  if (form.references && form.references.length > 0) {
    yaml.push("  references:");
    form.references.forEach((ref) => {
      yaml.push(`    - "${ref}"`);
    });
  }

  // Detection section
  yaml.push("");
  yaml.push("detection:");
  yaml.push(`  logic: ${form.detectionLogic}`);

  if (form.detectionSteps && form.detectionSteps.length > 0) {
    yaml.push("  steps:");

    form.detectionSteps.forEach((step) => {
      yaml.push(`    - type: ${step.type}`);

      // Add platforms and weight at step level (not in config)
      if (step.platforms && step.platforms.length > 0) {
        yaml.push("      platforms:");
        step.platforms.forEach((platform) => {
          yaml.push(`        - ${platform}`);
        });
      }

      yaml.push(`      weight: ${step.weight}`);

      // Module-specific config
      yaml.push("      config:");

      switch (step.type) {
        case "file_hash":
          yaml.push(`        path: "${escapeYAMLString(step.path)}"`);
          yaml.push(`        hash: "${step.hash}"`);
          yaml.push(`        algorithm: ${step.algorithm}`);
          break;

        case "file_content":
          yaml.push(`        path: "${escapeYAMLString(step.path)}"`);
          yaml.push(`        regex: "${escapeYAMLString(step.regex)}"`);
          if (step.multiline) {
            yaml.push(`        multiline: true`);
          }
          break;

        case "version_cmd":
          yaml.push("        command:");
          step.command.forEach((cmd) => {
            yaml.push(`          - "${escapeYAMLString(cmd)}"`);
          });
          yaml.push(`        regex: "${escapeYAMLString(step.regex)}"`);
          if (step.exitCode !== undefined) {
            yaml.push(`        exit_code: ${step.exitCode}`);
          }
          break;
      }
    });
  }

  return yaml.join("\n");
}

/**
 * Escapes special characters in YAML strings
 */
function escapeYAMLString(str: string): string {
  return str
    .replace(/\\/g, "\\\\") // Escape backslashes
    .replace(/"/g, '\\"'); // Escape quotes
}

/**
 * Generates a filename for the template
 */
export function generateTemplateFilename(templateId: string): string {
  return `${templateId}.yaml`;
}

/**
 * Converts YAML content back to TemplateFormState for editing
 */
export function convertYAMLToForm(yamlContent: string): TemplateFormState {
  try {
    // Parse YAML to object
    const parsed = yaml.load(yamlContent) as any;

    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid YAML content");
    }

    // Extract detection steps
    const detectionSteps: DetectionStepFormData[] = [];

    if (parsed.detection?.steps && Array.isArray(parsed.detection.steps)) {
      parsed.detection.steps.forEach((step: any, index: number) => {
        const stepId = `step-${Date.now()}-${index}`;
        const platforms = (step.platforms || []) as Platform[];
        const weight = typeof step.weight === "number" ? step.weight : 1.0;
        const config = step.config || {};

        switch (step.type) {
          case "file_hash":
            detectionSteps.push({
              id: stepId,
              type: "file_hash",
              path: config.path || "",
              hash: config.hash || "",
              algorithm: config.algorithm || "sha256",
              platforms,
              weight,
            } as FileHashStepData);
            break;

          case "file_content":
            detectionSteps.push({
              id: stepId,
              type: "file_content",
              path: config.path || "",
              regex: config.regex || "",
              multiline: config.multiline || false,
              platforms,
              weight,
            } as FileContentStepData);
            break;

          case "version_cmd":
            detectionSteps.push({
              id: stepId,
              type: "version_cmd",
              command: Array.isArray(config.command) ? config.command : [],
              regex: config.regex || "",
              exitCode: config.exit_code,
              platforms,
              weight,
            } as VersionCmdStepData);
            break;

          default:
            console.warn(`Unknown step type: ${step.type}`);
        }
      });
    }

    // Build form state
    const formState: TemplateFormState = {
      id: parsed.id || "",
      name: parsed.info?.name || "",
      description: parsed.info?.description || "",
      severity: (parsed.info?.severity || "medium") as Severity,
      author: parsed.info?.author || "",
      version: parsed.info?.version || "1.0",
      cve: Array.isArray(parsed.info?.cve) ? parsed.info.cve : [],
      tags: Array.isArray(parsed.info?.tags) ? parsed.info.tags : [],
      references: Array.isArray(parsed.info?.references)
        ? parsed.info.references
        : [],
      detectionLogic: (parsed.detection?.logic || "all") as DetectionLogic,
      detectionSteps,
    };

    return formState;
  } catch (error) {
    console.error("Failed to parse YAML template:", error);
    throw new Error(
      `Failed to parse template: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

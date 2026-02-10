import React from "react";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import { Badge } from "~/components/lib/ui/badge";
import { CollapsibleSection } from "../shared/CollapsibleSection";
import { SeveritySelector } from "../shared/SeveritySelector";
import { FileText, X } from "lucide-react";
import type {
  TemplateFormState,
  ValidationErrors,
} from "~/types/templateBuilderTypes";
import type { Severity } from "~/types/agentTemplateTypes";

interface MetadataFormData {
  id: string;
  name: string;
  description: string;
  severity: Severity;
  author: string;
  version: string;
  cve: string[];
  tags: string[];
  references: string[];
}

interface MetadataSectionProps {
  formData: MetadataFormData;
  onChange: (updates: Partial<TemplateFormState>) => void;
  errors?: ValidationErrors;
}

export const MetadataSection = React.memo<MetadataSectionProps>(
  ({ formData, onChange, errors }) => {
    const handleTagsInput = (value: string) => {
      // Split by comma or enter and trim
      const tags = value
        .split(/[,\n]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      onChange({ tags });
    };

    const removeTag = (index: number) => {
      const newTags = formData.tags.filter((_, i) => i !== index);
      onChange({ tags: newTags });
    };

    const handleCVEInput = (value: string) => {
      // Split by newline and trim
      const cves = value
        .split("\n")
        .map((cve) => cve.trim())
        .filter((cve) => cve.length > 0);
      onChange({ cve: cves });
    };

    const handleReferencesInput = (value: string) => {
      // Split by newline and trim
      const refs = value
        .split("\n")
        .map((ref) => ref.trim())
        .filter((ref) => ref.length > 0);
      onChange({ references: refs });
    };

    // Validate CVE format (CVE-YYYY-NNNNN)
    const validateCVE = (cve: string): boolean => {
      return /^CVE-\d{4}-\d{4,}$/i.test(cve);
    };

    // Validate URL format
    const validateURL = (url: string): boolean => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    return (
      <CollapsibleSection
        title="Template Information"
        subtitle="Basic metadata about the template"
        icon={<FileText className="h-5 w-5" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Template ID */}
          <div className="space-y-2">
            <Label htmlFor="template-id" className="text-gray-200">
              Template ID <span className="text-red-400">*</span>
            </Label>
            <Input
              id="template-id"
              value={formData.id}
              onChange={(e) => {
                // Convert to lowercase and replace spaces/special chars with dashes
                const id = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/-+/g, "-");
                onChange({ id });
              }}
              placeholder="cve-2024-example"
              className={`border-gray-700 bg-gray-900 text-white ${
                errors?.id ? "border-red-500" : ""
              }`}
            />
            <p className="text-xs text-gray-400">
              Unique identifier (lowercase, dashes only)
            </p>
            {errors?.id && <p className="text-xs text-red-400">{errors.id}</p>}
          </div>

          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name" className="text-gray-200">
              Template Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="template-name"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder="Descriptive template name"
              maxLength={100}
              className={`border-gray-700 bg-gray-900 text-white ${
                errors?.name ? "border-red-500" : ""
              }`}
            />
            <p className="text-xs text-gray-400">
              {formData.name.length}/100 characters
            </p>
            {errors?.name && (
              <p className="text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description" className="text-gray-200">
              Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="template-description"
              value={formData.description}
              onChange={(e) => onChange({ description: e.target.value })}
              placeholder="Detailed description of what this template detects..."
              maxLength={500}
              rows={4}
              className={`border-gray-700 bg-gray-900 text-white ${
                errors?.description ? "border-red-500" : ""
              }`}
            />
            <p className="text-xs text-gray-400">
              {formData.description.length}/500 characters
            </p>
            {errors?.description && (
              <p className="text-xs text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <SeveritySelector
              selected={formData.severity}
              onChange={(severity: Severity) => onChange({ severity })}
            />
            {errors?.severity && (
              <p className="text-xs text-red-400">{errors.severity}</p>
            )}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="template-author" className="text-gray-200">
              Author
            </Label>
            <Input
              id="template-author"
              value={formData.author}
              onChange={(e) => onChange({ author: e.target.value })}
              placeholder="Your name or team name"
              className="border-gray-700 bg-gray-900 text-white"
            />
            <p className="text-xs text-gray-400">Optional</p>
          </div>

          {/* Version */}
          <div className="space-y-2">
            <Label htmlFor="template-version" className="text-gray-200">
              Version
            </Label>
            <Input
              id="template-version"
              value={formData.version}
              onChange={(e) => onChange({ version: e.target.value })}
              placeholder="1.0"
              className="border-gray-700 bg-gray-900 text-white"
            />
            <p className="text-xs text-gray-400">
              Semantic versioning recommended
            </p>
          </div>

          {/* CVE IDs */}
          <div className="space-y-2">
            <Label htmlFor="template-cves" className="text-gray-200">
              CVE IDs
            </Label>
            <Textarea
              id="template-cves"
              value={formData.cve.join("\n")}
              onChange={(e) => handleCVEInput(e.target.value)}
              placeholder="CVE-2024-12345&#10;CVE-2024-67890"
              rows={3}
              className={`border-gray-700 bg-gray-900 font-mono text-sm text-white ${
                errors?.cve ? "border-red-500" : ""
              }`}
            />
            <p className="text-xs text-gray-400">One CVE ID per line</p>
            {formData.cve.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.cve.map((cve, index) => (
                  <Badge
                    key={index}
                    className={`${
                      validateCVE(cve)
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {cve}
                  </Badge>
                ))}
              </div>
            )}
            {errors?.cve && (
              <p className="text-xs text-red-400">{errors.cve}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="template-tags" className="text-gray-200">
              Tags
            </Label>
            <Input
              id="template-tags"
              value=""
              onChange={(e) => {
                if (
                  e.target.value.includes(",") ||
                  e.target.value.includes("\n")
                ) {
                  handleTagsInput(e.target.value);
                  e.target.value = "";
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  const newTag = e.currentTarget.value.trim();
                  if (!formData.tags.includes(newTag)) {
                    onChange({ tags: [...formData.tags, newTag] });
                  }
                  e.currentTarget.value = "";
                }
              }}
              placeholder="Type tags and press Enter or comma"
              className="border-gray-700 bg-gray-900 text-white"
            />
            <p className="text-xs text-gray-400">
              Press Enter or comma to add tags
            </p>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    className="flex items-center gap-1 border border-violet-500/30 bg-violet-500/20 text-violet-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:text-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* References */}
          <div className="space-y-2">
            <Label htmlFor="template-references" className="text-gray-200">
              References
            </Label>
            <Textarea
              id="template-references"
              value={formData.references.join("\n")}
              onChange={(e) => handleReferencesInput(e.target.value)}
              placeholder="https://nvd.nist.gov/vuln/detail/CVE-2024-12345&#10;https://example.com/advisory"
              rows={3}
              className={`border-gray-700 bg-gray-900 font-mono text-sm text-white ${
                errors?.references ? "border-red-500" : ""
              }`}
            />
            <p className="text-xs text-gray-400">One URL per line</p>
            {formData.references.length > 0 && (
              <div className="space-y-1">
                {formData.references.map((ref, index) => (
                  <div
                    key={index}
                    className={`text-xs ${
                      validateURL(ref) ? "text-blue-400" : "text-red-400"
                    }`}
                  >
                    {validateURL(ref) ? "✓" : "✗"} {ref}
                  </div>
                ))}
              </div>
            )}
            {errors?.references && (
              <p className="text-xs text-red-400">{errors.references}</p>
            )}
          </div>
        </div>
      </CollapsibleSection>
    );
  }
);

MetadataSection.displayName = "MetadataSection";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import { Checkbox } from "~/components/lib/ui/checkbox";
import { PlatformSelector } from "../../shared/PlatformSelector";
import { WeightSlider } from "../../shared/WeightSlider";
import { CollapsibleSection } from "../../shared/CollapsibleSection";
import type { FileContentStepData } from "~/types/templateBuilderTypes";
import type { Platform } from "~/types/agentTemplateTypes";
import { cn } from "~/components/lib/utils";
import { TestTube } from "lucide-react";

interface FileContentStepFormProps {
  onSave: (step: FileContentStepData) => void;
  onCancel: () => void;
  editingStep?: FileContentStepData | null;
}

export const FileContentStepForm: React.FC<FileContentStepFormProps> = ({
  onSave,
  onCancel,
  editingStep,
}) => {
  const [formData, setFormData] = useState<Omit<FileContentStepData, "id">>({
    type: "file_content",
    path: "",
    regex: "",
    multiline: false,
    platforms: [],
    weight: 0.8,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<{
    matches: boolean;
    matchText?: string;
  } | null>(null);

  useEffect(() => {
    if (editingStep) {
      setFormData({
        type: "file_content",
        path: editingStep.path,
        regex: editingStep.regex,
        multiline: editingStep.multiline,
        platforms: editingStep.platforms,
        weight: editingStep.weight,
      });
    }
  }, [editingStep]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.path.trim()) {
      newErrors.path = "File path is required";
    }

    if (!formData.regex.trim()) {
      newErrors.regex = "Search pattern is required";
    } else {
      try {
        new RegExp(formData.regex, formData.multiline ? "m" : "");
      } catch (error) {
        newErrors.regex = `Invalid regex: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    }

    if (formData.platforms.length === 0) {
      newErrors.platforms = "Select at least one platform";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTestRegex = () => {
    if (!formData.regex.trim()) {
      setTestResult({ matches: false });
      return;
    }

    try {
      const regex = new RegExp(formData.regex, formData.multiline ? "m" : "");
      const match = testText.match(regex);

      if (match) {
        setTestResult({
          matches: true,
          matchText: match[0],
        });
      } else {
        setTestResult({
          matches: false,
        });
      }
    } catch (error) {
      setTestResult({
        matches: false,
      });
    }
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const step: FileContentStepData = {
      ...formData,
      id: editingStep?.id || `step-${Date.now()}`,
    };

    onSave(step);
  };

  return (
    <div className="space-y-4">
      {/* File Path */}
      <div className="space-y-2">
        <Label htmlFor="file-path" className="text-gray-200">
          File Path <span className="text-red-400">*</span>
        </Label>
        <Input
          id="file-path"
          value={formData.path}
          onChange={(e) => setFormData({ ...formData, path: e.target.value })}
          placeholder="/etc/config.conf"
          className={cn(
            "border-gray-700 bg-gray-900 font-mono text-white",
            errors.path && "border-red-500"
          )}
        />
        <p className="text-xs text-gray-400">Path to the file to search</p>
        {errors.path && <p className="text-xs text-red-400">{errors.path}</p>}
      </div>

      {/* Search Pattern */}
      <div className="space-y-2">
        <Label htmlFor="search-pattern" className="text-gray-200">
          Search Pattern (Regex) <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="search-pattern"
          value={formData.regex}
          onChange={(e) => {
            setFormData({ ...formData, regex: e.target.value });
            setTestResult(null);
          }}
          placeholder={"version\\s*=\\s*[\"']2\\.14\\.[0-1][\"']"}
          rows={3}
          className={cn(
            "border-gray-700 bg-gray-900 font-mono text-sm text-white",
            errors.regex && "border-red-500"
          )}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Regular expression pattern to match
          </p>
          <a
            href="https://regex101.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-violet-400 hover:text-violet-300"
          >
            Regex Help &rarr;
          </a>
        </div>
        {errors.regex && <p className="text-xs text-red-400">{errors.regex}</p>}
      </div>

      {/* Multiline Mode */}
      <div className="flex items-center space-x-2 rounded-lg border border-gray-700 bg-gray-900/50 p-3">
        <Checkbox
          id="multiline-mode"
          checked={formData.multiline}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, multiline: checked === true })
          }
        />
        <Label
          htmlFor="multiline-mode"
          className="cursor-pointer text-sm text-gray-300"
        >
          Enable multiline mode
        </Label>
        <p className="ml-auto text-xs text-gray-500">
          Allows ^ and $ to match line boundaries
        </p>
      </div>

      {/* Regex Tester */}
      <CollapsibleSection
        title="Test Regex"
        subtitle="Test your pattern against sample text"
        icon={<TestTube className="h-4 w-4" />}
        defaultOpen={false}
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="test-text" className="text-gray-200">
              Sample Text
            </Label>
            <Textarea
              id="test-text"
              value={testText}
              onChange={(e) => {
                setTestText(e.target.value);
                setTestResult(null);
              }}
              placeholder="Paste sample text to test against your regex..."
              rows={4}
              className="border-gray-700 bg-gray-900 font-mono text-sm text-white"
            />
          </div>

          <Button
            type="button"
            onClick={handleTestRegex}
            variant="outline"
            className="w-full border-gray-700"
            disabled={!formData.regex.trim() || !testText.trim()}
          >
            Test Pattern
          </Button>

          {testResult && (
            <div
              className={cn(
                "rounded-lg p-3 text-sm",
                testResult.matches
                  ? "border border-green-500/50 bg-green-500/20"
                  : "border border-red-500/50 bg-red-500/20"
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    testResult.matches ? "text-green-400" : "text-red-400"
                  }
                >
                  {testResult.matches ? "✓ Match found" : "✗ No match"}
                </span>
              </div>
              {testResult.matchText && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400">Matched text:</p>
                  <p className="mt-1 font-mono text-xs text-white">
                    {testResult.matchText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Platforms */}
      <div className="space-y-2">
        <PlatformSelector
          selected={formData.platforms}
          onChange={(platforms: Platform[]) =>
            setFormData({ ...formData, platforms })
          }
        />
        {errors.platforms && (
          <p className="text-xs text-red-400">{errors.platforms}</p>
        )}
      </div>

      {/* Weight */}
      <div className="space-y-2">
        <WeightSlider
          value={formData.weight}
          onChange={(weight: number) => setFormData({ ...formData, weight })}
          helperText="File content matches are often less definitive than hash checks"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-gray-700"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          
        >
          {editingStep ? "Update Step" : "Add Step"}
        </Button>
      </div>
    </div>
  );
};

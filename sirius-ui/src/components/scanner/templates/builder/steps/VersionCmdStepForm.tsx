import React, { useState, useEffect } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import { Badge } from "~/components/lib/ui/badge";
import { PlatformSelector } from "../../shared/PlatformSelector";
import { WeightSlider } from "../../shared/WeightSlider";
import type { VersionCmdStepData } from "~/types/templateBuilderTypes";
import type { Platform } from "~/types/agentTemplateTypes";
import { cn } from "~/components/lib/utils";
import { Plus, X, Code } from "lucide-react";

interface VersionCmdStepFormProps {
  onSave: (step: VersionCmdStepData) => void;
  onCancel: () => void;
  editingStep?: VersionCmdStepData | null;
}

export const VersionCmdStepForm: React.FC<VersionCmdStepFormProps> = ({
  onSave,
  onCancel,
  editingStep,
}) => {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [simpleCommand, setSimpleCommand] = useState("");
  const [formData, setFormData] = useState<Omit<VersionCmdStepData, "id">>({
    type: "version_cmd",
    command: [],
    regex: "",
    exitCode: undefined,
    platforms: [],
    weight: 0.9,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingStep) {
      setFormData({
        type: "version_cmd",
        command: editingStep.command,
        regex: editingStep.regex,
        exitCode: editingStep.exitCode,
        platforms: editingStep.platforms,
        weight: editingStep.weight,
      });
      setSimpleCommand(editingStep.command.join(" "));
      setMode(
        editingStep.command.some((arg) => arg.includes(" "))
          ? "advanced"
          : "simple"
      );
    }
  }, [editingStep]);

  const parseSimpleCommand = (cmd: string): string[] => {
    return cmd
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const commandArray =
      mode === "simple" ? parseSimpleCommand(simpleCommand) : formData.command;

    if (commandArray.length === 0) {
      newErrors.command = "Command is required";
    }

    if (!formData.regex.trim()) {
      newErrors.regex = "Version pattern is required";
    } else {
      try {
        new RegExp(formData.regex);
      } catch (error) {
        newErrors.regex = `Invalid regex: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
      }
    }

    if (formData.platforms.length === 0) {
      newErrors.platforms = "Select at least one platform";
    }

    if (
      formData.exitCode !== undefined &&
      (formData.exitCode < 0 || formData.exitCode > 255)
    ) {
      newErrors.exitCode = "Exit code must be between 0 and 255";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddArgument = () => {
    setFormData({
      ...formData,
      command: [...formData.command, ""],
    });
  };

  const handleUpdateArgument = (index: number, value: string) => {
    const newCommand = [...formData.command];
    newCommand[index] = value;
    setFormData({
      ...formData,
      command: newCommand,
    });
  };

  const handleRemoveArgument = (index: number) => {
    setFormData({
      ...formData,
      command: formData.command.filter((_, i) => i !== index),
    });
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    const commandArray =
      mode === "simple" ? parseSimpleCommand(simpleCommand) : formData.command;

    const step: VersionCmdStepData = {
      ...formData,
      command: commandArray,
      id: editingStep?.id || `step-${Date.now()}`,
    };

    onSave(step);
  };

  const toggleMode = () => {
    if (mode === "simple") {
      const parsed = parseSimpleCommand(simpleCommand);
      setFormData({ ...formData, command: parsed });
      setMode("advanced");
    } else {
      setSimpleCommand(formData.command.join(" "));
      setMode("simple");
    }
  };

  return (
    <div className="space-y-4">
      {/* Command Builder Mode Toggle */}
      <div className="flex items-center justify-between">
        <Label className="text-gray-200">Command Builder</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleMode}
          className="border-gray-700"
        >
          <Code className="mr-2 h-3 w-3" />
          {mode === "simple" ? "Advanced Mode" : "Simple Mode"}
        </Button>
      </div>

      {/* Simple Mode */}
      {mode === "simple" && (
        <div className="space-y-2">
          <Label htmlFor="simple-command" className="text-gray-200">
            Command <span className="text-red-400">*</span>
          </Label>
          <Input
            id="simple-command"
            value={simpleCommand}
            onChange={(e) => setSimpleCommand(e.target.value)}
            placeholder="ssh -V"
            className={cn(
              "border-gray-700 bg-gray-900 font-mono text-white",
              errors.command && "border-red-500"
            )}
          />
          <p className="text-xs text-gray-400">
            Command will be split on spaces. Use Advanced Mode for complex
            arguments.
          </p>
          {errors.command && (
            <p className="text-xs text-red-400">{errors.command}</p>
          )}
        </div>
      )}

      {/* Advanced Mode */}
      {mode === "advanced" && (
        <div className="space-y-2">
          <Label className="text-gray-200">
            Command Arguments <span className="text-red-400">*</span>
          </Label>
          <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-900/50 p-3">
            {formData.command.length === 0 && (
              <p className="text-sm text-gray-500">No arguments added yet</p>
            )}
            {formData.command.map((arg, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge className="min-w-[4rem] justify-center bg-gray-700 text-gray-300">
                  Arg {index}
                </Badge>
                <Input
                  value={arg}
                  onChange={(e) => handleUpdateArgument(index, e.target.value)}
                  placeholder={index === 0 ? "command" : "argument"}
                  className="flex-1 border-gray-700 bg-gray-900 font-mono text-white"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleRemoveArgument(index)}
                  className="border-red-500/30 text-red-400"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              onClick={handleAddArgument}
              variant="outline"
              size="sm"
              className="w-full border-gray-700"
            >
              <Plus className="mr-2 h-3 w-3" />
              Add Argument
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Each argument is a separate field. Useful for arguments with spaces
            or special characters.
          </p>
          {errors.command && (
            <p className="text-xs text-red-400">{errors.command}</p>
          )}
        </div>
      )}

      {/* Command Preview */}
      {((mode === "simple" && simpleCommand) ||
        (mode === "advanced" && formData.command.length > 0)) && (
        <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
          <Label className="text-xs text-gray-400">Command Preview:</Label>
          <p className="mt-1 font-mono text-sm text-white">
            {mode === "simple" ? simpleCommand : formData.command.join(" ")}
          </p>
        </div>
      )}

      {/* Version Pattern */}
      <div className="space-y-2">
        <Label htmlFor="version-pattern" className="text-gray-200">
          Version Pattern (Regex) <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="version-pattern"
          value={formData.regex}
          onChange={(e) => setFormData({ ...formData, regex: e.target.value })}
          placeholder="OpenSSH_([0-9]+\.[0-9]+\.[0-9]+)"
          rows={2}
          className={cn(
            "border-gray-700 bg-gray-900 font-mono text-sm text-white",
            errors.regex && "border-red-500"
          )}
        />
        <p className="text-xs text-gray-400">
          Regular expression to extract version from output. Use capture groups
          to extract specific parts.
        </p>
        {errors.regex && <p className="text-xs text-red-400">{errors.regex}</p>}
      </div>

      {/* Expected Exit Code */}
      <div className="space-y-2">
        <Label htmlFor="exit-code" className="text-gray-200">
          Expected Exit Code (Optional)
        </Label>
        <Input
          id="exit-code"
          type="number"
          value={formData.exitCode ?? ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              exitCode: e.target.value ? parseInt(e.target.value) : undefined,
            })
          }
          placeholder="0"
          min={0}
          max={255}
          className={cn(
            "border-gray-700 bg-gray-900 text-white",
            errors.exitCode && "border-red-500"
          )}
        />
        <p className="text-xs text-gray-400">
          Leave empty to accept any exit code. Most commands return 0 on
          success.
        </p>
        {errors.exitCode && (
          <p className="text-xs text-red-400">{errors.exitCode}</p>
        )}
      </div>

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
          helperText="Version commands are usually reliable indicators"
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
          className="bg-violet-600 text-white hover:bg-violet-500"
        >
          {editingStep ? "Update Step" : "Add Step"}
        </Button>
      </div>
    </div>
  );
};

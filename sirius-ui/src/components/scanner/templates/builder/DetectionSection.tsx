import React from "react";
import { Button } from "~/components/lib/ui/button";
import { Label } from "~/components/lib/ui/label";
import { Badge } from "~/components/lib/ui/badge";
import { CollapsibleSection } from "../shared/CollapsibleSection";
import { StepCard } from "./StepCard";
import { FileHashStepForm } from "./steps/FileHashStepForm";
import { FileContentStepForm } from "./steps/FileContentStepForm";
import { VersionCmdStepForm } from "./steps/VersionCmdStepForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/lib/ui/dropdown-menu";
import {
  Shield,
  Plus,
  FileCheck,
  FileSearch,
  Terminal,
  Info,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/lib/ui/popover";
import type {
  TemplateFormState,
  ValidationErrors,
  DetectionStepFormData,
  FileHashStepData,
  FileContentStepData,
  VersionCmdStepData,
} from "~/types/templateBuilderTypes";
import type { DetectionLogic } from "~/types/agentTemplateTypes";
import { cn } from "~/components/lib/utils";

interface DetectionFormData {
  detectionLogic: DetectionLogic;
  detectionSteps: DetectionStepFormData[];
}

type StepFormState = {
  isVisible: boolean;
  type: "file_hash" | "file_content" | "version_cmd" | null;
  editingStepId: string | null;
};

interface DetectionSectionProps {
  formData: DetectionFormData;
  onChange: (updates: Partial<TemplateFormState>) => void;
  onAddStep: (type: "file_hash" | "file_content" | "version_cmd") => void;
  onEditStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
  errors?: ValidationErrors;
  stepForm: StepFormState;
  onSaveStep: (step: DetectionStepFormData) => void;
  onCancelStep: () => void;
  editingStep: DetectionStepFormData | null;
}

export const DetectionSection = React.memo<DetectionSectionProps>(
  ({
    formData,
    onChange,
    onAddStep,
    onEditStep,
    onDeleteStep,
    errors,
    stepForm,
    onSaveStep,
    onCancelStep,
    editingStep,
  }) => {
    const handleLogicChange = (logic: DetectionLogic) => {
      onChange({ detectionLogic: logic });
    };

    return (
      <CollapsibleSection
        title="Detection Configuration"
        subtitle="Define how to detect the vulnerability"
        icon={<Shield className="h-5 w-5" />}
        badge={
          formData.detectionSteps.length > 0 && (
            <Badge className="border border-violet-500/30 bg-violet-500/20 text-violet-200">
              {formData.detectionSteps.length} step
              {formData.detectionSteps.length !== 1 ? "s" : ""}
            </Badge>
          )
        }
        defaultOpen={true}
      >
        <div className="space-y-6">
          {/* Detection Logic Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label className="text-gray-200">Detection Logic</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 border-gray-700 bg-gray-800 text-sm text-gray-300">
                  <p className="font-semibold">Detection Logic</p>
                  <p className="mt-1">
                    <strong>All (AND):</strong> All detection steps must match
                    for the template to trigger. More restrictive.
                  </p>
                  <p className="mt-2">
                    <strong>Any (OR):</strong> At least one detection step must
                    match. More permissive.
                  </p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleLogicChange("all")}
                className={cn(
                  "flex-1 rounded-lg border-2 p-3 text-left transition-all",
                  formData.detectionLogic === "all"
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                )}
              >
                <div className="font-medium text-white">All steps (AND)</div>
                <div className="mt-1 text-xs text-gray-400">
                  All steps must match
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleLogicChange("any")}
                className={cn(
                  "flex-1 rounded-lg border-2 p-3 text-left transition-all",
                  formData.detectionLogic === "any"
                    ? "border-violet-500 bg-violet-500/20"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                )}
              >
                <div className="font-medium text-white">Any step (OR)</div>
                <div className="mt-1 text-xs text-gray-400">
                  At least one step must match
                </div>
              </button>
            </div>
          </div>

          {/* Detection Steps List */}
          <div className="space-y-3">
            <Label className="text-gray-200">Detection Steps</Label>

            {/* Inline Step Forms - Shows when adding/editing */}
            {stepForm.isVisible && (
              <div className="rounded-lg border-2 border-violet-500 bg-gray-800/80 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    {editingStep ? "Edit" : "Add"} Detection Step -{" "}
                    {stepForm.type === "file_hash" && "File Hash"}
                    {stepForm.type === "file_content" && "File Content"}
                    {stepForm.type === "version_cmd" && "Version Command"}
                  </h3>
                  <button
                    onClick={onCancelStep}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Render the appropriate inline form based on type */}
                {stepForm.type === "file_hash" && (
                  <FileHashStepForm
                    onSave={onSaveStep}
                    onCancel={onCancelStep}
                    editingStep={
                      editingStep?.type === "file_hash"
                        ? (editingStep as FileHashStepData)
                        : null
                    }
                  />
                )}

                {stepForm.type === "file_content" && (
                  <FileContentStepForm
                    onSave={onSaveStep}
                    onCancel={onCancelStep}
                    editingStep={
                      editingStep?.type === "file_content"
                        ? (editingStep as FileContentStepData)
                        : null
                    }
                  />
                )}

                {stepForm.type === "version_cmd" && (
                  <VersionCmdStepForm
                    onSave={onSaveStep}
                    onCancel={onCancelStep}
                    editingStep={
                      editingStep?.type === "version_cmd"
                        ? (editingStep as VersionCmdStepData)
                        : null
                    }
                  />
                )}
              </div>
            )}

            {formData.detectionSteps.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/50 py-12">
                <Shield className="h-12 w-12 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-400">
                  No detection steps yet
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Add at least one step to detect vulnerabilities
                </p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Detection Step
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-gray-700 bg-gray-800">
                    <DropdownMenuItem
                      onClick={() => onAddStep("file_hash")}
                      className="text-gray-300 focus:bg-gray-700 focus:text-white"
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      File Hash Check
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onAddStep("file_content")}
                      className="text-gray-300 focus:bg-gray-700 focus:text-white"
                    >
                      <FileSearch className="mr-2 h-4 w-4" />
                      File Content Search
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onAddStep("version_cmd")}
                      className="text-gray-300 focus:bg-gray-700 focus:text-white"
                    >
                      <Terminal className="mr-2 h-4 w-4" />
                      Version Command
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {formData.detectionSteps.map((step, index) => (
                    <StepCard
                      key={step.id}
                      step={step}
                      index={index}
                      onEdit={onEditStep}
                      onDelete={onDeleteStep}
                    />
                  ))}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full border-gray-700 bg-gray-800"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Another Step
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="border-gray-700 bg-gray-800">
                    <DropdownMenuItem
                      onClick={() => onAddStep("file_hash")}
                      className="text-gray-300 focus:bg-gray-700 focus:text-white"
                    >
                      <FileCheck className="mr-2 h-4 w-4" />
                      File Hash Check
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onAddStep("file_content")}
                      className="text-gray-300 focus:bg-gray-700 focus:text-white"
                    >
                      <FileSearch className="mr-2 h-4 w-4" />
                      File Content Search
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onAddStep("version_cmd")}
                      className="text-gray-300 focus:bg-gray-700 focus:text-white"
                    >
                      <Terminal className="mr-2 h-4 w-4" />
                      Version Command
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {errors?.detectionSteps && (
              <p className="text-xs text-red-400">{errors.detectionSteps}</p>
            )}
          </div>

          {/* Confidence Calculation Preview */}
          {formData.detectionSteps.length > 0 && (
            <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">
                  Confidence Calculation
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-400">
                {formData.detectionLogic === "all" ? (
                  <p>
                    <strong>AND Logic:</strong> Minimum weight of all matching
                    steps determines confidence. All steps with weight{" "}
                    {formData.detectionSteps
                      .map((s) => s.weight.toFixed(1))
                      .join(", ")}{" "}
                    = min(
                    {Math.min(
                      ...formData.detectionSteps.map((s) => s.weight)
                    ).toFixed(1)}
                    ) confidence
                  </p>
                ) : (
                  <p>
                    <strong>OR Logic:</strong> Maximum weight of matching steps
                    determines confidence. Steps with weight{" "}
                    {formData.detectionSteps
                      .map((s) => s.weight.toFixed(1))
                      .join(", ")}{" "}
                    = up to{" "}
                    {Math.max(
                      ...formData.detectionSteps.map((s) => s.weight)
                    ).toFixed(1)}{" "}
                    confidence
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    );
  }
);

DetectionSection.displayName = "DetectionSection";

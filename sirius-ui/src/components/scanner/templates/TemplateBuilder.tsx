import React, { useState, useReducer, useEffect, useCallback } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { Alert, AlertDescription } from "~/components/lib/ui/alert";
import { MetadataSection } from "./builder/MetadataSection";
import { DetectionSection } from "./builder/DetectionSection";
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import type {
  TemplateFormState,
  DetectionStepFormData,
  ValidationErrors,
  StepType,
} from "~/types/templateBuilderTypes";
import { initialFormState } from "~/types/templateBuilderTypes";
import type { AgentTemplate } from "~/types/agentTemplateTypes";
import {
  convertFormToYAML,
  convertYAMLToForm,
  generateTemplateFilename,
} from "~/utils/templateYaml";

interface TemplateBuilderProps {
  onCancel: () => void;
  onSave: (template: TemplateFormState) => Promise<void>;
  editingTemplate?: AgentTemplate | null;
}

type StepFormState = {
  isVisible: boolean;
  type: StepType | null;
  editingStepId: string | null;
};

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  onCancel,
  onSave,
  editingTemplate,
}) => {
  const [formData, setFormData] = useState<TemplateFormState>(initialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [stepForm, setStepForm] = useState<StepFormState>({
    isVisible: false,
    type: null,
    editingStepId: null,
  });

  // Load editing template if provided
  useEffect(() => {
    if (editingTemplate) {
      // If template has YAML content, parse it to populate the form
      if (editingTemplate.content) {
        try {
          const parsedForm = convertYAMLToForm(editingTemplate.content);
          setFormData(parsedForm);
          console.log("✅ Loaded template for editing:", parsedForm);
        } catch (error) {
          console.error("Failed to parse template content:", error);
          // Fallback to basic metadata if YAML parsing fails
          setFormData({
            id: editingTemplate.id,
            name: editingTemplate.name,
            description: editingTemplate.description,
            severity: editingTemplate.severity,
            author: editingTemplate.author,
            version: editingTemplate.version || "1.0",
            cve: [],
            tags: [],
            references: [],
            detectionLogic: "all",
            detectionSteps: [],
          });
        }
      } else {
        // No content field, use metadata only
        setFormData({
          id: editingTemplate.id,
          name: editingTemplate.name,
          description: editingTemplate.description,
          severity: editingTemplate.severity,
          author: editingTemplate.author,
          version: editingTemplate.version || "1.0",
          cve: [],
          tags: [],
          references: [],
          detectionLogic: "all",
          detectionSteps: [],
        });
      }
    }
  }, [editingTemplate]);

  // Auto-save to localStorage (debounced to prevent UI freeze)
  useEffect(() => {
    if (!formData.id && !formData.name) {
      return; // Don't save empty forms
    }

    // Debounce: save after 500ms of inactivity
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(
          "template-builder-draft",
          JSON.stringify(formData)
        );
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    }, 500);

    // Cleanup: cancel pending save if formData changes again
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    if (!editingTemplate) {
      const draft = localStorage.getItem("template-builder-draft");
      if (draft) {
        try {
          const parsed = JSON.parse(draft) as TemplateFormState;
          // Only load if it has some content
          if (parsed.id || parsed.name) {
            setFormData(parsed);
          }
        } catch (error) {
          console.error("Failed to load draft:", error);
        }
      }
    }
  }, [editingTemplate]);

  const handleFormChange = useCallback(
    (updates: Partial<TemplateFormState>) => {
      setFormData((prev) => ({ ...prev, ...updates }));
      // Clear related errors
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach((key) => {
          delete newErrors[key as keyof ValidationErrors];
        });
        return newErrors;
      });
    },
    []
  );

  const handleAddStep = useCallback((type: StepType) => {
    setStepForm({
      isVisible: true,
      type,
      editingStepId: null,
    });
  }, []);

  const handleEditStep = useCallback(
    (stepId: string) => {
      const step = formData.detectionSteps.find((s) => s.id === stepId);
      if (step) {
        setStepForm({
          isVisible: true,
          type: step.type,
          editingStepId: stepId,
        });
      }
    },
    [formData.detectionSteps]
  );

  const handleDeleteStep = useCallback((stepId: string) => {
    if (confirm("Are you sure you want to delete this detection step?")) {
      setFormData((prev) => ({
        ...prev,
        detectionSteps: prev.detectionSteps.filter((s) => s.id !== stepId),
      }));
    }
  }, []);

  const handleSaveStep = useCallback((step: DetectionStepFormData) => {
    setFormData((prev) => {
      const existingIndex = prev.detectionSteps.findIndex(
        (s) => s.id === step.id
      );

      if (existingIndex >= 0) {
        const newSteps = [...prev.detectionSteps];
        newSteps[existingIndex] = step;
        return { ...prev, detectionSteps: newSteps };
      } else {
        return {
          ...prev,
          detectionSteps: [...prev.detectionSteps, step],
        };
      }
    });

    // Hide form
    setStepForm({ isVisible: false, type: null, editingStepId: null });
  }, []);

  const handleCancelStep = useCallback(() => {
    setStepForm({ isVisible: false, type: null, editingStepId: null });
  }, []);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Validate metadata
    if (!formData.id.trim()) {
      newErrors.id = "Template ID is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Template name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate detection steps
    if (formData.detectionSteps.length === 0) {
      newErrors.detectionSteps = "Add at least one detection step";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await onSave(formData);
      setSaveSuccess(true);
      localStorage.removeItem("template-builder-draft");

      // Redirect back after short delay
      setTimeout(() => {
        onCancel();
      }, 2000);
    } catch (error: any) {
      console.error("Save error:", error);

      // Extract error message from API response
      let errorMessage = "Failed to save template";
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (formData.id || formData.name || formData.detectionSteps.length > 0) {
      if (
        confirm(
          "You have unsaved changes. Are you sure you want to cancel? Your draft will be saved locally."
        )
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const editingStep = stepForm.editingStepId
    ? formData.detectionSteps.find((s) => s.id === stepForm.editingStepId)
    : null;

  // Extract stable props for memoized components to prevent unnecessary re-renders
  const metadataProps = React.useMemo(
    () => ({
      id: formData.id,
      name: formData.name,
      description: formData.description,
      severity: formData.severity,
      author: formData.author,
      version: formData.version,
      cve: formData.cve,
      tags: formData.tags,
      references: formData.references,
    }),
    [
      formData.id,
      formData.name,
      formData.description,
      formData.severity,
      formData.author,
      formData.version,
      formData.cve,
      formData.tags,
      formData.references,
    ]
  );

  const detectionProps = React.useMemo(
    () => ({
      detectionLogic: formData.detectionLogic,
      detectionSteps: formData.detectionSteps,
    }),
    [formData.detectionLogic, formData.detectionSteps]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="-ml-2 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {editingTemplate ? "Edit Template" : "Create New Template"}
                </h1>
                {editingTemplate && (
                  <p className="mt-1 text-sm text-gray-400">
                    Editing: {editingTemplate.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              {formData.id || formData.name ? (
                <Badge className="bg-blue-500/20 text-blue-400">
                  Draft Auto-Saved
                </Badge>
              ) : null}
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving
                  ? "Saving..."
                  : editingTemplate
                  ? "Update Template"
                  : "Create Template"}
              </Button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saveSuccess && (
          <Alert className="mb-6 border-green-500/30 bg-green-500/10">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Template saved successfully! Redirecting...
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert className="mb-6 border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              {saveError}
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <Alert className="mb-6 border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">
              <p className="font-semibold">Please fix the following errors:</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                {Object.entries(errors).map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form Sections */}
        <div className="space-y-6">
          <MetadataSection
            formData={metadataProps}
            onChange={handleFormChange}
            errors={errors}
          />

          <DetectionSection
            formData={detectionProps}
            onChange={handleFormChange}
            onAddStep={handleAddStep}
            onEditStep={handleEditStep}
            onDeleteStep={handleDeleteStep}
            errors={errors}
            stepForm={stepForm}
            onSaveStep={handleSaveStep}
            onCancelStep={handleCancelStep}
            editingStep={editingStep || null}
          />
        </div>
      </div>
    </div>
  );
};

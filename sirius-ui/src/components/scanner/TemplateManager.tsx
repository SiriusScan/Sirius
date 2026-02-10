import React, { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Badge } from "~/components/lib/ui/badge";
import CustomScanBuilder from "./CustomScanBuilder";

interface TemplateManagerProps {
  onClose?: () => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose }) => {
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const { data: templates, isLoading } = api.templates.getTemplates.useQuery();
  const deleteTemplateMutation = api.templates.deleteTemplate.useMutation();
  const utils = api.useContext();

  const handleDelete = async (templateId: string, templateName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the template "${templateName}"?`
      )
    ) {
      return;
    }

    try {
      await deleteTemplateMutation.mutateAsync({ id: templateId });
      await utils.templates.getTemplates.invalidate();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template. It may be a system template.");
    }
  };

  if (creatingTemplate) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-violet-100">
            Create New Template
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-violet-100"
          >
            Close
          </Button>
        </div>
        <CustomScanBuilder
          initialTemplateId="quick" // Default template to start from
          onSave={() => {
            setCreatingTemplate(false);
            void utils.templates.getTemplates.invalidate();
          }}
          onCancel={() => setCreatingTemplate(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-violet-100">
          Template Manager
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCreatingTemplate(true)}
            className="border-violet-100/30 bg-violet-600 text-violet-100"
          >
            Create New Template
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-violet-100"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-violet-100">Loading templates...</div>
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="rounded-lg border border-violet-100/30 bg-violet-950/20 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-violet-100">
                      {template.name}
                    </h3>
                    <Badge
                      variant={
                        template.type === "system" ? "default" : "secondary"
                      }
                      className={
                        template.type === "system"
                          ? "bg-violet-700 text-violet-100"
                          : "bg-violet-500/20 text-violet-200"
                      }
                    >
                      {template.type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-violet-300">
                    {template.description}
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="text-sm text-violet-200">
                      <span className="font-medium">Scripts:</span>{" "}
                      {template.enabled_scripts.length}
                    </div>
                    <div className="text-sm text-violet-200">
                      <span className="font-medium">Scan Types:</span>{" "}
                      {template.scan_options.scan_types.join(", ")}
                    </div>
                    <div className="text-sm text-violet-200">
                      <span className="font-medium">Port Range:</span>{" "}
                      {template.scan_options.port_range}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {template.type === "custom" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTemplate(template.id)}
                        className="border-violet-100/30 text-violet-100"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id, template.name)}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                  {template.type === "system" && (
                    <span className="text-xs text-violet-400">
                      System templates cannot be modified
                    </span>
                  )}
                </div>
              </div>

              {/* Show script list in a collapsible section */}
              {template.enabled_scripts.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-violet-300 hover:text-violet-200">
                    Show enabled scripts
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.enabled_scripts.map((scriptId) => (
                      <Badge
                        key={scriptId}
                        variant="outline"
                        className="border-violet-100/20 text-xs text-violet-200"
                      >
                        {scriptId}
                      </Badge>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-violet-300">
          No templates available. Create your first template to get started.
        </div>
      )}
    </div>
  );
};

export default TemplateManager;




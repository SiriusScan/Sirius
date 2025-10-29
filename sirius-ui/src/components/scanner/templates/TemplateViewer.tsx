import React, { useState, useEffect } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { Card } from "~/components/lib/ui/card";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import {
  ArrowLeft,
  Play,
  Copy,
  Download,
  CheckCircle,
  AlertCircle,
  Code,
  FileText,
} from "lucide-react";
import MonacoEditor from "~/components/editor/MonacoEditor";
import { api } from "~/utils/api";
import type { AgentTemplate } from "~/types/agentTemplateTypes";
import { cn } from "~/components/lib/utils";

interface TemplateViewerProps {
  template: AgentTemplate;
  onClose: () => void;
  onEdit: (template: AgentTemplate) => void;
  onRun: (template: AgentTemplate) => void;
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/50",
  info: "bg-gray-500/20 text-gray-400 border-gray-500/50",
};

export const TemplateViewer: React.FC<TemplateViewerProps> = ({
  template,
  onClose,
  onEdit,
  onRun,
}) => {
  const [yamlContent, setYamlContent] = useState(template.content || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Track whether changes exist
  useEffect(() => {
    setHasChanges(yamlContent !== (template.content || ""));
  }, [yamlContent, template.content]);

  // Get TRPC context and mutation for updating templates
  const trpcContext = api.useContext();
  const updateMutation = api.agentTemplates.updateTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully", {
        description: `${template.name} has been saved.`,
      });
      setIsSaving(false);
      setHasChanges(false);
      setIsEditing(false);

      // Invalidate the cache to refresh the template list
      trpcContext.agentTemplates.getTemplates.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update template", {
        description: error.message || "An unknown error occurred",
      });
      setIsSaving(false);
    },
  });

  const handleSaveChanges = async () => {
    setIsSaving(true);

    // Only send if content has changed
    if (hasChanges) {
      updateMutation.mutate({
        id: template.id,
        content: yamlContent,
      });
    } else {
      toast.info("No changes to save", {
        description: "The template hasn't been modified.",
      });
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    if (yamlContent) {
      try {
        await navigator.clipboard.writeText(yamlContent);
        setCopySuccess(true);
        toast.success("YAML copied to clipboard");
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error("Failed to copy YAML");
      }
    }
  };

  const handleDuplicate = () => {
    // Create a copy with modified ID
    const duplicatedTemplate: AgentTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      content: yamlContent.replace(
        `id: ${template.id}`,
        `id: ${template.id}-copy-${Date.now()}`
      ),
    };
    onEdit(duplicatedTemplate);
  };

  const handleExport = () => {
    if (!yamlContent) return;

    const blob = new Blob([yamlContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Template exported successfully");
  };

  // Determine button styling based on state
  const getSaveButtonClass = () => {
    if (!isEditing) return "bg-violet-600/20 hover:bg-violet-600/30";
    if (isSaving) return "bg-gray-700 hover:bg-gray-600";
    if (hasChanges) return "bg-violet-600 hover:bg-violet-700 text-white";
    return "bg-violet-600/20 hover:bg-violet-600/30";
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-white">{template.name}</h3>
            <Badge
              className={cn(
                "text-xs",
                severityColors[template.severity] || severityColors.medium
              )}
            >
              {template.severity.toUpperCase()}
            </Badge>
            <Badge className="border border-gray-600 bg-gray-700/50 text-gray-300">
              {template.type === "repository" ? "Repository" : "Custom"}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">
            Author: {template.author} | Version: {template.version} | ID:{" "}
            {template.id}
          </p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {template.tags && template.tags.length > 0 ? (
          template.tags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-violet-600/20 text-white"
            >
              {tag}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-gray-400">No tags available</span>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="flex flex-1 flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="description">
            <FileText className="mr-2 h-4 w-4" />
            Description
          </TabsTrigger>
          <TabsTrigger value="yaml">
            <Code className="mr-2 h-4 w-4" />
            YAML Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="flex-1">
          <div className="flex flex-col gap-6 rounded-md border border-gray-700 bg-gray-900/50 p-6">
            <div>
              <h4 className="mb-2 text-sm font-medium text-gray-400">
                Description
              </h4>
              <p className="text-white">
                {template.description || "No description available."}
              </p>
            </div>
            {template.references && template.references.length > 0 && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-400">
                  References
                </h4>
                <ul className="list-inside list-disc space-y-1">
                  {template.references.map((ref, idx) => (
                    <li key={idx} className="text-sm text-gray-300">
                      <a
                        href={ref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-400 hover:text-violet-300 hover:underline"
                      >
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {template.cve && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-400">CVE</h4>
                <p className="text-sm text-gray-300">{template.cve}</p>
              </div>
            )}

            {/* Action buttons for Description tab */}
            <div className="flex items-center justify-end gap-2 border-t border-gray-700 pt-4">
              <Button
                onClick={handleDuplicate}
                variant="outline"
                className="border-gray-700"
              >
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button
                onClick={() => onRun(template)}
                className="bg-green-600 text-white hover:bg-green-500"
              >
                <Play className="mr-2 h-4 w-4" />
                Run on Agents
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="yaml" className="flex flex-1 flex-col">
          {yamlContent ? (
            <div className="flex flex-1 flex-col rounded-md border border-gray-700 bg-gray-900/50 p-4">
              <div className="mb-4 flex items-center justify-between border-b border-gray-700 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    Sirius Editor - {template.id}.yaml
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="text-xs"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    {copySuccess ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExport}
                    className="text-xs"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDuplicate}
                    className="text-xs"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Button>
                  <div className="mx-1 h-6 w-px bg-gray-700" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs"
                  >
                    {isEditing ? "View Mode" : "Edit Mode"}
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSaveChanges}
                    disabled={!isEditing || isSaving || !hasChanges}
                    className={getSaveButtonClass()}
                  >
                    {isSaving
                      ? "Saving..."
                      : hasChanges
                      ? "Save Changes*"
                      : "Save Changes"}
                  </Button>
                  <div className="mx-1 h-6 w-px bg-gray-700" />
                  <Button
                    size="sm"
                    onClick={() => onRun(template)}
                    className="bg-green-600 text-white hover:bg-green-500"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Run
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <MonacoEditor
                  value={yamlContent}
                  readOnly={!isEditing}
                  onChange={(value) => setYamlContent(value || "")}
                  height="500px"
                  language="yaml"
                  theme="catppuccin-mocha"
                />
              </div>

              {isEditing && (
                <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-2">
                  <span className="text-xs text-gray-400">
                    {isEditing && hasChanges
                      ? "Changes detected - Don't forget to save your work!"
                      : isEditing
                      ? "Editing mode - No changes detected"
                      : "View mode"}
                  </span>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSaveChanges}
                    disabled={isSaving || !hasChanges}
                    className={getSaveButtonClass()}
                  >
                    {isSaving
                      ? "Saving..."
                      : hasChanges
                      ? "Save Changes*"
                      : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-gray-700 bg-gray-800/50 p-8">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="mb-4 h-12 w-12 text-gray-600" />
                <h3 className="text-lg font-semibold text-white">
                  No Content Available
                </h3>
                <p className="mt-2 text-sm text-gray-400">
                  This template does not have YAML content to display.
                </p>
                <Button
                  onClick={() => onEdit(template)}
                  className="mt-4 bg-violet-600 text-white hover:bg-violet-500"
                >
                  Edit in Builder
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

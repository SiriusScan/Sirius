import React, { useState } from "react";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { Button } from "~/components/lib/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import { Card, CardContent } from "~/components/lib/ui/card";
import {
  Library,
  Upload,
  TestTube,
  BarChart3,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { api } from "~/utils/api";
import TemplateBrowser from "./TemplateBrowser";
import TemplateUploader from "./TemplateUploader";
import TemplateTester from "./TemplateTester";
import TemplateAnalytics from "./TemplateAnalytics";
import MonacoEditor from "~/components/editor/MonacoEditor";
import type { AgentTemplate } from "~/types/agentTemplateTypes";

interface AgentTemplatesTabProps {
  enableTemplates: boolean;
  setEnableTemplates: (value: boolean) => void;
  templatePriority: string;
  setTemplatePriority: (value: string) => void;
}

type ViewType = "browse" | "upload" | "test" | "analytics" | "view";

const AgentTemplatesTab: React.FC<AgentTemplatesTabProps> = ({
  enableTemplates,
  setEnableTemplates,
  templatePriority,
  setTemplatePriority,
}) => {
  const [activeView, setActiveView] = useState<ViewType>("browse");
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(
    null
  );

  const { data: templates, isLoading } = api.agentTemplates.getTemplates.useQuery();
  const deleteTemplateMutation = api.agentTemplates.deleteTemplate.useMutation();
  const deployTemplateMutation = api.agentTemplates.deployTemplate.useMutation();
  const utils = api.useContext();

  const handleView = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setActiveView("view");
  };

  const handleEdit = (template: AgentTemplate) => {
    // TODO: Implement template editing in a future enhancement
    console.log("Edit template:", template.id);
  };

  const handleDelete = async (template: AgentTemplate) => {
    if (template.type !== "custom") {
      alert("Only custom templates can be deleted");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteTemplateMutation.mutateAsync({ id: template.id });
      await utils.agentTemplates.getTemplates.invalidate();
    } catch (error) {
      console.error("Failed to delete template:", error);
      alert("Failed to delete template. Please try again.");
    }
  };

  const handleTest = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setActiveView("test");
  };

  const handleDeploy = async (template: AgentTemplate) => {
    // For now, deploy to all agents
    // TODO: Show agent selection dialog
    const confirmDeploy = confirm(
      `Deploy template "${template.name}" to all agents?`
    );
    if (!confirmDeploy) return;

    try {
      await deployTemplateMutation.mutateAsync({
        templateId: template.id,
        agentIds: [], // Empty array means all agents
      });
      alert("Template deployed successfully to all agents");
    } catch (error) {
      console.error("Failed to deploy template:", error);
      alert("Failed to deploy template. Please try again.");
    }
  };

  const handleUploadSuccess = () => {
    setActiveView("browse");
    void utils.agentTemplates.getTemplates.invalidate();
  };

  const handleBackToBrowse = () => {
    setSelectedTemplate(null);
    setActiveView("browse");
  };

  const renderViewContent = () => {
    switch (activeView) {
      case "browse":
        return (
          <TemplateBrowser
            templates={templates || []}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTest={handleTest}
            onDeploy={handleDeploy}
            onCreateNew={() => setActiveView("upload")}
            isLoading={isLoading}
          />
        );

      case "upload":
        return (
          <TemplateUploader
            onSuccess={handleUploadSuccess}
            onCancel={handleBackToBrowse}
          />
        );

      case "test":
        return (
          <TemplateTester
            template={selectedTemplate}
            templates={templates || []}
            onTemplateChange={setSelectedTemplate}
            onClose={handleBackToBrowse}
          />
        );

      case "analytics":
        return <TemplateAnalytics onClose={handleBackToBrowse} />;

      case "view":
        return selectedTemplate ? (
          <div className="space-y-4">
            {/* Header with back button */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToBrowse}
                className="border-gray-700 text-gray-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Templates
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTest(selectedTemplate)}
                  className="border-violet-500/30 text-violet-400"
                >
                  <TestTube className="mr-2 h-4 w-4" />
                  Test Template
                </Button>
                {selectedTemplate.type === "custom" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(selectedTemplate)}
                    className="border-red-500/30 text-red-400"
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Template Details */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-300">{selectedTemplate.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">ID:</span>{" "}
                    <span className="text-white">{selectedTemplate.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>{" "}
                    <span className="text-white capitalize">
                      {selectedTemplate.type}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Severity:</span>{" "}
                    <span className="text-white capitalize">
                      {selectedTemplate.severity}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">Author:</span>{" "}
                    <span className="text-white">{selectedTemplate.author}</span>
                  </div>
                  {selectedTemplate.version && (
                    <div>
                      <span className="text-gray-400">Version:</span>{" "}
                      <span className="text-white">{selectedTemplate.version}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Platforms:</span>{" "}
                    <span className="text-white">
                      {selectedTemplate.platforms.join(", ")}
                    </span>
                  </div>
                </div>

                {selectedTemplate.content && (
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      Template Content
                    </h3>
                    <MonacoEditor
                      value={selectedTemplate.content}
                      language="yaml"
                      readOnly={true}
                      height="400px"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Section - Only show when in browse view */}
      {activeView === "browse" && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 space-y-6">
            {/* Enable Templates Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="enable-templates" className="text-white">
                  Enable Agent Templates
                </Label>
                <p className="text-sm text-gray-400">
                  Use vulnerability detection templates during agent scans
                </p>
              </div>
              <Switch
                id="enable-templates"
                checked={enableTemplates}
                onCheckedChange={setEnableTemplates}
              />
            </div>

            {/* Template Priority */}
            {enableTemplates && (
              <div className="space-y-2">
                <Label htmlFor="template-priority" className="text-white">
                  Template Priority
                </Label>
                <Select
                  value={templatePriority}
                  onValueChange={setTemplatePriority}
                >
                  <SelectTrigger
                    id="template-priority"
                    className="bg-gray-900 border-gray-700"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      High - Only critical and high severity
                    </SelectItem>
                    <SelectItem value="medium">
                      Medium - Include medium severity
                    </SelectItem>
                    <SelectItem value="all">All - Include all severities</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">
                  Control which templates are used based on severity
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Action Buttons - Only show when in browse view */}
      {activeView === "browse" && (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveView("browse")}
            variant={activeView === "browse" ? "default" : "outline"}
            className={
              activeView === "browse"
                ? "bg-violet-600 hover:bg-violet-500"
                : "border-gray-700 text-gray-300"
            }
          >
            <Library className="mr-2 h-4 w-4" />
            Browse Templates
          </Button>
          <Button
            onClick={() => setActiveView("upload")}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Template
          </Button>
          <Button
            onClick={() => setActiveView("test")}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            <TestTube className="mr-2 h-4 w-4" />
            Test Template
          </Button>
          <Button
            onClick={() => setActiveView("analytics")}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div>{renderViewContent()}</div>
    </div>
  );
};

export default AgentTemplatesTab;


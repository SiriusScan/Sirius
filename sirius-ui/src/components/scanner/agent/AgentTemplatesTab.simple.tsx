import React, { useState } from "react";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { Button } from "~/components/lib/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import { Alert, AlertDescription } from "~/components/lib/ui/alert";
import {
  Upload,
  Eye,
  Play,
  Trash2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { api } from "~/utils/api";
import MonacoEditor from "~/components/editor/MonacoEditor";

interface AgentTemplatesTabProps {
  enableTemplates: boolean;
  setEnableTemplates: (value: boolean) => void;
}

const AgentTemplatesTab: React.FC<AgentTemplatesTabProps> = ({
  enableTemplates,
  setEnableTemplates,
}) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadContent, setUploadContent] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { data: templates, isLoading } =
    api.agentTemplates.getTemplates.useQuery();
  const validateMutation = api.agentTemplates.validateTemplate.useMutation();
  const uploadMutation = api.agentTemplates.uploadTemplate.useMutation();
  const deleteMutation = api.agentTemplates.deleteTemplate.useMutation();
  const testMutation = api.agentTemplates.testTemplate.useMutation();
  const utils = api.useContext();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".yaml") && !file.name.endsWith(".yml")) {
      setUploadError("File must be a .yaml or .yml file");
      return;
    }

    setUploadFile(file);
    setUploadError(null);
    setUploadSuccess(false);

    // Read and validate file
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setUploadContent(content);

      try {
        const result = await validateMutation.mutateAsync({ content });
        if (!result.valid) {
          setUploadError(result.errors.join(", "));
        }
      } catch (error) {
        setUploadError("Failed to validate template");
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadContent) return;

    try {
      await uploadMutation.mutateAsync({
        content: uploadContent,
        filename: uploadFile.name,
      });

      setUploadSuccess(true);
      setUploadFile(null);
      setUploadContent("");
      await utils.agentTemplates.getTemplates.invalidate();

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload template"
      );
    }
  };

  const handleDelete = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      await deleteMutation.mutateAsync({ id: templateId });
      await utils.agentTemplates.getTemplates.invalidate();
      if (selectedTemplate === templateId) {
        setSelectedTemplate(null);
      }
    } catch (error) {
      alert("Failed to delete template");
    }
  };

  const handleRun = async (templateId: string) => {
    // For now, just send test command - would need agent selection in full implementation
    try {
      await testMutation.mutateAsync({
        templateId,
        agentId: "all", // Run on all agents
      });
      alert("Template execution initiated on all agents");
    } catch (error) {
      alert("Failed to run template");
    }
  };

  const handleViewTemplate = async (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const selectedTemplateData = templates?.find(
    (t) => t.id === selectedTemplate
  );

  return (
    <div className="space-y-6">
      {/* Enable Templates Setting */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
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
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Upload className="h-5 w-5" />
            Upload Template
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept=".yaml,.yml"
              onChange={handleFileSelect}
              className="hidden"
              id="template-upload"
            />
            <label htmlFor="template-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose YAML File
                </span>
              </Button>
            </label>
            {uploadFile && (
              <span className="ml-3 text-sm text-gray-400">
                {uploadFile.name}
              </span>
            )}
          </div>

          {uploadContent && (
            <>
              <div className="max-h-64 overflow-auto rounded-lg bg-gray-900 p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300">
                  {uploadContent}
                </pre>
              </div>

              <Button
                onClick={handleUpload}
                disabled={!!uploadError || uploadMutation.isPending}
                
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Template"}
              </Button>
            </>
          )}

          {uploadError && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">
                {uploadError}
              </AlertDescription>
            </Alert>
          )}

          {uploadSuccess && (
            <Alert className="border-green-500/30 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Template uploaded successfully and distributed to agents
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Templates List */}
      <Card className="border-gray-700 bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-white">Available Templates</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-400">Loading templates...</p>
          ) : !templates || templates.length === 0 ? (
            <p className="text-gray-400">No templates available</p>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-900/50 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-white">
                        {template.name}
                      </h4>
                      <Badge
                        className={`text-xs ${
                          template.severity === "critical"
                            ? "bg-red-500/20 text-red-400"
                            : template.severity === "high"
                            ? "bg-orange-500/20 text-orange-400"
                            : template.severity === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {template.severity}
                      </Badge>
                      <Badge className="bg-gray-700 text-xs text-gray-300">
                        {template.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-400">
                      {template.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      ID: {template.id} • Author: {template.author}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTemplate(template.id)}
                      className="border-gray-700"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRun(template.id)}
                      className="border-violet-500/30 text-violet-400"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    {template.type === "custom" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(template.id)}
                        className="border-red-500/30 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Viewer */}
      {selectedTemplateData && (
        <Card className="border-gray-700 bg-gray-800/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                {selectedTemplateData.name}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTemplate(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedTemplateData.content ? (
              <MonacoEditor
                value={selectedTemplateData.content}
                language="yaml"
                readOnly={true}
                height="400px"
              />
            ) : (
              <p className="text-gray-400">Template content not available</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentTemplatesTab;


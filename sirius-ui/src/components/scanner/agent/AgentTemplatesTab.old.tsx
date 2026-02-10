import React, { useState, useCallback, useEffect } from "react";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Textarea } from "~/components/lib/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import { api } from "~/utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import TemplateViewer from "./TemplateViewer";
import { Plus, Library, Settings } from "lucide-react";
import MonacoEditor from "~/components/editor/MonacoEditor";

// Import utilities
import {
  convertToYamlForEditing,
  convertYamlToJson,
} from "~/utils/yamlConverter";
import {
  TemplateFormData,
  TemplateState,
  TemplateWithContent,
  FileHashFormTarget,
  RegistryFormTarget,
  ConfigFileFormTarget,
  DiscoveryResult,
  QueueMessage,
  SeverityLevel,
  TemplateType,
} from "~/utils/types";
import {
  DEFAULT_VALUES,
  QUEUE_CONFIG,
  UI_CONFIG,
  VALIDATION_MESSAGES,
  DEFAULT_TEMPLATE_CONTENT,
} from "~/utils/constants";
import { MONACO_HEIGHTS } from "~/utils/monacoUtils";

interface AgentTemplatesTabProps {
  enableTemplates: boolean;
  setEnableTemplates: (value: boolean) => void;
  templatePriority: string;
  setTemplatePriority: (value: string) => void;
}

// Local interfaces that don't conflict with imports
interface DiscoveredTemplate {
  id: string;
  name: string;
  description: string;
  severity: string;
  type: string;
  source?: {
    type: string;
    name: string;
    priority: number;
  };
}

// Update DiscoveryResult to use the local DiscoveredTemplate
interface LocalDiscoveryResult {
  templates?: DiscoveredTemplate[];
  statistics?: {
    total_templates: number;
    custom_templates: number;
    repository_templates: number;
    local_templates: number;
  };
}

const AgentTemplatesTab: React.FC<AgentTemplatesTabProps> = ({
  enableTemplates,
  setEnableTemplates,
  templatePriority,
  setTemplatePriority,
}) => {
  const [activeView, setActiveView] = useState<
    "browse" | "create" | "settings"
  >("browse");
  const [isCreating, setIsCreating] = useState(false);
  const [creationMode, setCreationMode] = useState<"form" | "custom">("form");
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  // Query for template content when editing
  const { data: editingTemplateContent, isLoading: isLoadingEditContent } =
    api.agent.getTemplateContent.useQuery(
      { templateId: editingTemplate! },
      {
        enabled: !!editingTemplate,
        refetchOnWindowFocus: false,
        staleTime: 0, // Always consider data stale
        cacheTime: 0, // Don't cache the data
      }
    );
  const [newTemplate, setNewTemplate] = useState({
    id: "",
    name: "",
    description: "",
    severity: "medium",
    type: "file-hash",
    content: "",
  });

  // Form-based template data
  const [formData, setFormData] = useState<TemplateFormData>({
    fileHashTargets: [{ path: "", hash: "", algorithm: "sha256" }],
    registryTargets: [{ key: "", value: "", pattern: "" }],
    configFileTargets: [{ path: "", patterns: [""] }],
  });

  const { mutate: sendMessage } = api.queue.sendMsg.useMutation({
    onSuccess: () => {
      console.log("Template message sent successfully");
      loadTemplates();
      // Clear the template content cache to force fresh data on next edit
      const utils = api.useContext();
      void utils.agent.getTemplateContent.invalidate();
    },
    onError: (error) => {
      console.error("Failed to send template message:", error);
    },
  });

  // Load template discovery results directly from ValKey
  const { data: discoveryResult, isLoading: discoveryLoading } =
    api.agent.discoverTemplatesFromValKey.useQuery(undefined, {
      refetchInterval: QUEUE_CONFIG.refetchInterval,
    }) as { data: LocalDiscoveryResult | undefined; isLoading: boolean };

  const loadTemplates = () => {
    console.log("Loading templates via tRPC...");
  };

  // These functions are now imported from utilities

  // Load template content when editing
  useEffect(() => {
    if (editingTemplate && editingTemplateContent && !isLoadingEditContent) {
      // Set creation mode to custom for YAML editing
      setCreationMode("custom");

      // Populate template form with existing data
      setNewTemplate({
        id: editingTemplateContent.id || "",
        name: editingTemplateContent.name || "",
        description: editingTemplateContent.description || "",
        severity: editingTemplateContent.severity || "medium",
        type: editingTemplateContent.type || "file-hash",
        content: convertToYamlForEditing(
          editingTemplateContent.content?.content ||
            editingTemplateContent.content ||
            editingTemplateContent ||
            ""
        ),
      });
    } else if (
      editingTemplate &&
      !isLoadingEditContent &&
      !editingTemplateContent
    ) {
      console.log(
        "No template content found for editing template:",
        editingTemplate
      );
      // If we can't load the template content, at least set a basic structure
      setCreationMode("custom");
      setNewTemplate({
        id: editingTemplate,
        name: "",
        description: "",
        severity: "medium",
        type: "file-hash",
        content:
          "# Unable to load template content\n# Please add your template here",
      });
    }
  }, [editingTemplate, editingTemplateContent, isLoadingEditContent]);

  // Generate YAML content based on form data
  const generateYAML = useCallback(() => {
    const template = {
      id: newTemplate.id,
      info: {
        name: newTemplate.name,
        description: newTemplate.description,
        severity: newTemplate.severity,
        author: "UI User",
        created: new Date().toISOString(),
      },
      detection: {
        type: newTemplate.type,
        targets: [] as Array<{
          type: string;
          path?: string;
          hash?: string;
          algorithm?: string;
          key?: string;
          value?: string;
          pattern?: string;
          patterns?: string[];
        }>,
      },
      remediation: {
        description: "Custom template remediation",
        steps: [],
      },
    };

    switch (newTemplate.type) {
      case "file-hash":
        template.detection.targets = formData.fileHashTargets
          .filter((target) => target.path && target.hash)
          .map((target) => ({
            type: "file",
            path: target.path,
            hash: target.hash,
            algorithm: target.algorithm,
          }));
        break;
      case "registry":
        template.detection.targets = formData.registryTargets
          .filter((target) => target.key)
          .map((target) => ({
            type: "registry",
            key: target.key,
            value: target.value ?? undefined,
            pattern: target.pattern ?? undefined,
          }));
        break;
      case "config-file":
        template.detection.targets = formData.configFileTargets
          .filter((target) => target.path && target.patterns.some((p) => p))
          .map((target) => ({
            type: "config",
            path: target.path,
            patterns: target.patterns.filter((p) => p),
          }));
        break;
    }

    return template;
  }, [newTemplate, formData]);

  // Update YAML content when form data changes
  useEffect(() => {
    if (creationMode === "form") {
      const yamlContent = generateYAML();
      const yamlString = convertToYamlForEditing(yamlContent);
      setNewTemplate((prev) => ({
        ...prev,
        content: yamlString,
      }));
    }
  }, [formData, newTemplate.type, creationMode, generateYAML]);

  // Set default YAML template when switching to custom mode
  useEffect(() => {
    if (
      creationMode === "custom" &&
      !editingTemplate &&
      !newTemplate.content.trim()
    ) {
      const defaultTemplate = {
        ...DEFAULT_TEMPLATE_CONTENT,
        info: {
          ...DEFAULT_TEMPLATE_CONTENT.info,
          created: new Date().toISOString(),
        },
      };

      const yamlString = convertToYamlForEditing(defaultTemplate);
      setNewTemplate((prev) => ({
        ...prev,
        content: yamlString,
      }));
    }
  }, [creationMode, editingTemplate, newTemplate.content]);

  const handleCreateTemplate = () => {
    // Different validation for different modes
    if (creationMode === "form") {
      // Form mode: require form fields to be filled
      if (!newTemplate.id || !newTemplate.name || !newTemplate.content) {
        alert(VALIDATION_MESSAGES.requiredFields);
        return;
      }
    } else {
      // Custom YAML mode: only require content
      if (!newTemplate.content.trim()) {
        alert(VALIDATION_MESSAGES.provideContent);
        return;
      }
    }

    let content;
    try {
      content =
        creationMode === "form"
          ? generateYAML()
          : convertYamlToJson(newTemplate.content);
    } catch (error) {
      alert(VALIDATION_MESSAGES.invalidContent);
      return;
    }

    const message = {
      operation: editingTemplate ? "update" : "create",
      type: "template",
      id: editingTemplate || newTemplate.id,
      name:
        content.info?.name ||
        content.name ||
        newTemplate.name ||
        "Untitled Template",
      description:
        content.info?.description ||
        content.description ||
        newTemplate.description ||
        "No description provided",
      content,
      metadata: {
        source: "ui",
        timestamp: new Date().toISOString(),
        user_id: "ui-user",
      },
    };

    sendMessage({
      queue: QUEUE_CONFIG.templateSync,
      message: JSON.stringify(message),
    });

    // Reset form only if not editing
    if (!editingTemplate) {
      setNewTemplate({
        id: "",
        name: "",
        description: "",
        severity: "medium",
        type: "file-hash",
        content: "",
      });
      setFormData({
        fileHashTargets: [{ path: "", hash: "", algorithm: "sha256" }],
        registryTargets: [{ key: "", value: "", pattern: "" }],
        configFileTargets: [{ path: "", patterns: [""] }],
      });
    }

    setIsCreating(false);
    setActiveView("browse");
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm(VALIDATION_MESSAGES.confirmDelete("template", templateId))) {
      const message = {
        operation: "delete",
        type: "template",
        id: templateId,
        metadata: {
          source: "ui",
          timestamp: new Date().toISOString(),
          user_id: "ui-user",
        },
      };

      sendMessage({
        queue: QUEUE_CONFIG.templateSync,
        message: JSON.stringify(message),
      });
    }
  };

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplate(templateId);
    setActiveView("create");
    setIsCreating(true);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setActiveView("create");
    setIsCreating(true);
    setCreationMode("form");
    // Reset form for new template creation
    setNewTemplate({
      id: "",
      name: "",
      description: "",
      severity: "medium",
      type: "file-hash",
      content: "",
    });
    setFormData({
      fileHashTargets: [{ path: "", hash: "", algorithm: "sha256" }],
      registryTargets: [{ key: "", value: "", pattern: "" }],
      configFileTargets: [{ path: "", patterns: [""] }],
    });
  };

  const addFileHashTarget = () => {
    setFormData((prev) => ({
      ...prev,
      fileHashTargets: [
        ...prev.fileHashTargets,
        { path: "", hash: "", algorithm: "sha256" },
      ],
    }));
  };

  const removeFileHashTarget = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      fileHashTargets: prev.fileHashTargets.filter((_, i) => i !== index),
    }));
  };

  const updateFileHashTarget = (
    index: number,
    field: keyof FileHashFormTarget,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      fileHashTargets: prev.fileHashTargets.map((target, i) =>
        i === index ? { ...target, [field]: value } : target
      ),
    }));
  };

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Switch
            id="enableTemplates"
            checked={enableTemplates}
            onCheckedChange={setEnableTemplates}
          />
          <Label
            htmlFor="enableTemplates"
            className="text-sm font-semibold text-gray-400"
          >
            Enable Custom Templates
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={activeView === "browse" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("browse")}
            className="flex items-center space-x-1"
          >
            <Library className="h-4 w-4" />
            <span>Browse</span>
          </Button>
          <Button
            variant={activeView === "create" ? "default" : "outline"}
            size="sm"
            onClick={handleCreateNew}
            className="flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Create</span>
          </Button>
          <Button
            variant={activeView === "settings" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("settings")}
            className="flex items-center space-x-1"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Content Area */}
      {activeView === "browse" && (
        <div>
          <h4 className="mb-4 text-lg font-medium text-white">
            Template Browser
          </h4>
          {discoveryResult?.templates ? (
            <TemplateViewer
              templates={discoveryResult.templates}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
            />
          ) : (
            <div className="rounded-lg border border-gray-600 bg-gray-800/20 p-4 text-center text-gray-400">
              {discoveryLoading ? "Loading templates..." : "No templates found"}
            </div>
          )}
        </div>
      )}

      {activeView === "settings" && (
        <div>
          <h4 className="mb-4 text-lg font-medium text-white">
            Template Settings
          </h4>

          {/* Discovery Statistics */}
          {discoveryResult?.statistics && (
            <div className="mb-6 rounded-lg border border-gray-600 bg-gray-800/20 p-4">
              <h5 className="mb-2 text-sm font-medium text-gray-300">
                Discovery Statistics
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  Total Templates: {discoveryResult.statistics.total_templates}
                </div>
                <div>
                  Custom Templates:{" "}
                  {discoveryResult.statistics.custom_templates}
                </div>
                <div>
                  Repository Templates:{" "}
                  {discoveryResult.statistics.repository_templates}
                </div>
                <div>
                  Local Templates: {discoveryResult.statistics.local_templates}
                </div>
              </div>
            </div>
          )}

          {/* Template Priority */}
          <div>
            <Label
              htmlFor="templatePriority"
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Template Priority
            </Label>
            <Select
              value={templatePriority}
              onValueChange={setTemplatePriority}
            >
              <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="high">High (Override Repository)</SelectItem>
                <SelectItem value="medium">
                  Medium (Merge with Repository)
                </SelectItem>
                <SelectItem value="low">Low (Repository Priority)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {activeView === "create" && (
        <div className="w-full min-w-0 overflow-x-auto">
          <h4 className="mb-4 text-lg font-medium text-white">
            {editingTemplate
              ? `Edit Template: ${
                  editingTemplateContent?.name || editingTemplate
                }`
              : "Create New Template"}
          </h4>

          {/* Create Template Form */}
          <Card className="w-full max-w-none overflow-hidden border-gray-600 bg-gray-800/20">
            <CardHeader>
              <CardTitle className="text-white">Template Details</CardTitle>
            </CardHeader>
            <CardContent className="w-full space-y-6 overflow-x-auto">
              {/* Creation Mode Tabs - Moved to top */}
              <Tabs
                value={creationMode}
                onValueChange={(value) =>
                  setCreationMode(value as "form" | "custom")
                }
                className="w-full min-w-0"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="form">Form-Based Creation</TabsTrigger>
                  <TabsTrigger value="custom">Custom YAML</TabsTrigger>
                </TabsList>

                <TabsContent value="form" className="mt-6 w-full space-y-6">
                  {/* Basic Template Information - Only show in form mode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="templateId"
                        className="text-sm font-semibold text-gray-400"
                      >
                        Template ID
                      </Label>
                      <Input
                        id="templateId"
                        value={newTemplate.id}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, id: e.target.value })
                        }
                        placeholder="unique-template-id"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="templateName"
                        className="text-sm font-semibold text-gray-400"
                      >
                        Template Name
                      </Label>
                      <Input
                        id="templateName"
                        value={newTemplate.name}
                        onChange={(e) =>
                          setNewTemplate({
                            ...newTemplate,
                            name: e.target.value,
                          })
                        }
                        placeholder="Template Name"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="templateDescription"
                      className="text-sm font-semibold text-gray-400"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="templateDescription"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          description: e.target.value,
                        })
                      }
                      placeholder="Template description"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="templateSeverity"
                        className="text-sm font-semibold text-gray-400"
                      >
                        Severity
                      </Label>
                      <Select
                        value={newTemplate.severity}
                        onValueChange={(value) =>
                          setNewTemplate({ ...newTemplate, severity: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white">
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label
                        htmlFor="templateType"
                        className="text-sm font-semibold text-gray-400"
                      >
                        Detection Type
                      </Label>
                      <Select
                        value={newTemplate.type}
                        onValueChange={(value) =>
                          setNewTemplate({ ...newTemplate, type: value })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 text-white">
                          <SelectItem value="file-hash">File Hash</SelectItem>
                          <SelectItem value="registry">Registry</SelectItem>
                          <SelectItem value="config-file">
                            Config File
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* File Hash Form */}
                  {newTemplate.type === "file-hash" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-400">
                          File Hash Targets
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addFileHashTarget}
                        >
                          Add Target
                        </Button>
                      </div>

                      {formData.fileHashTargets.map((target, index) => (
                        <div
                          key={index}
                          className="rounded border border-gray-600 bg-gray-700/30 p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-300">
                              Target {index + 1}
                            </h5>
                            {formData.fileHashTargets.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeFileHashTarget(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs text-gray-400">
                                File Path
                              </Label>
                              <Input
                                value={target.path}
                                onChange={(e) =>
                                  updateFileHashTarget(
                                    index,
                                    "path",
                                    e.target.value
                                  )
                                }
                                placeholder="/path/to/file"
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-400">
                                Hash Value
                              </Label>
                              <Input
                                value={target.hash}
                                onChange={(e) =>
                                  updateFileHashTarget(
                                    index,
                                    "hash",
                                    e.target.value
                                  )
                                }
                                placeholder="abc123..."
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-400">
                                Algorithm
                              </Label>
                              <Select
                                value={target.algorithm}
                                onValueChange={(value) =>
                                  updateFileHashTarget(
                                    index,
                                    "algorithm",
                                    value
                                  )
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 text-white">
                                  <SelectItem value="sha256">SHA256</SelectItem>
                                  <SelectItem value="sha1">SHA1</SelectItem>
                                  <SelectItem value="md5">MD5</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Generated YAML Preview */}
                  <div className="w-full">
                    <Label className="text-sm font-semibold text-gray-400">
                      Generated YAML Preview
                    </Label>
                    <div className="mt-1">
                      <MonacoEditor
                        value={newTemplate.content}
                        language="yaml"
                        readOnly={true}
                        height={MONACO_HEIGHTS.preview}
                        theme="catppuccin-mocha"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="custom" className="mt-6 w-full space-y-4">
                  <div className="w-full min-w-0 flex-1">
                    <Label
                      htmlFor="templateContent"
                      className="text-sm font-semibold text-gray-400"
                    >
                      Custom YAML Template
                    </Label>
                    <div
                      className="mt-1 w-full min-w-0"
                      style={UI_CONFIG.monacoWidth}
                    >
                      <div className="w-full" style={UI_CONFIG.monacoWidth}>
                        <MonacoEditor
                          value={newTemplate.content}
                          language="yaml"
                          onChange={(value) =>
                            setNewTemplate({
                              ...newTemplate,
                              content: value || "",
                            })
                          }
                          height={MONACO_HEIGHTS.editor}
                          theme="catppuccin-mocha"
                        />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>
                        Create a custom YAML template with the following
                        structure:
                      </p>
                      <div className="mt-1 rounded bg-gray-700 p-3 font-mono text-xs">
                        <div className="text-gray-300">
                          # Example YAML template structure
                        </div>
                        <div className="text-blue-300">id: "CUSTOM-001"</div>
                        <div className="text-blue-300">info:</div>
                        <div className="ml-2 text-green-300">
                          name: "Custom Template"
                        </div>
                        <div className="ml-2 text-green-300">
                          severity: "medium"
                        </div>
                        <div className="text-blue-300">detection:</div>
                        <div className="ml-2 text-green-300">
                          type: "file-hash"
                        </div>
                        <div className="ml-2 text-green-300">targets: []</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveView("browse")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  
                >
                  {editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AgentTemplatesTab;

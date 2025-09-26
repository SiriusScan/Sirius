import React, { useState, useMemo } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/lib/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import {
  Search,
  Eye,
  Code,
  Filter,
  X,
  Copy,
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
} from "lucide-react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import MonacoEditor from "~/components/editor/MonacoEditor";

// Import utilities
import { convertToYamlForEditing } from "~/utils/yamlConverter";
import { TemplateWithContent } from "~/utils/types";
import { MONACO_HEIGHTS } from "~/utils/monacoUtils";
import { FILE_EXTENSIONS } from "~/utils/constants";

interface TemplateViewerProps {
  templates: Array<{
    id: string;
    name: string;
    description: string;
    severity: string;
    type: string;
    source?: {
      type: string;
      name?: string;
      priority?: number;
    };
    created_at?: string;
    updated_at?: string;
  }>;
  onEditTemplate?: (templateId: string) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

// TemplateWithContent is now imported from utilities

const TemplateViewer: React.FC<TemplateViewerProps> = ({
  templates,
  onEditTemplate,
  onDeleteTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Query for template content when selected
  const { data: templateContent, isLoading: isLoadingContent } =
    api.agent.getTemplateContent.useQuery(
      { templateId: selectedTemplate! },
      {
        enabled: !!selectedTemplate,
        refetchOnWindowFocus: false,
      }
    );

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        template.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        selectedSeverity === "all" || template.severity === selectedSeverity;
      const matchesType =
        selectedType === "all" || template.type === selectedType;
      const matchesSource =
        selectedSource === "all" || template.source?.type === selectedSource;

      return matchesSearch && matchesSeverity && matchesType && matchesSource;
    });
  }, [templates, searchQuery, selectedSeverity, selectedType, selectedSource]);

  // Get unique values for filters
  const severityOptions = [...new Set(templates.map((t) => t.severity))];
  const typeOptions = [...new Set(templates.map((t) => t.type))];
  const sourceOptions = [
    ...new Set(templates.map((t) => t.source?.type).filter(Boolean)),
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-3 w-3" />;
      case "medium":
        return <Info className="h-3 w-3" />;
      case "low":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(convertToYamlForEditing(text));
    // You might want to add a toast notification here
  };

  const downloadTemplate = (template: TemplateWithContent) => {
    const formattedContent = convertToYamlForEditing(template.contentYaml);
    const blob = new Blob([formattedContent], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${template.id}${FILE_EXTENSIONS.template}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSeverity("all");
    setSelectedType("all");
    setSelectedSource("all");
  };

  // These functions are now imported from utilities

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Search templates by name, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Label className="text-sm text-gray-400">Severity:</Label>
            <Select
              value={selectedSeverity}
              onValueChange={setSelectedSeverity}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="all">All</SelectItem>
                {severityOptions.map((severity) => (
                  <SelectItem key={severity} value={severity}>
                    {severity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm text-gray-400">Type:</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="all">All</SelectItem>
                {typeOptions.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm text-gray-400">Source:</Label>
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white">
                <SelectItem value="all">All</SelectItem>
                {sourceOptions.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchQuery ||
            selectedSeverity !== "all" ||
            selectedType !== "all" ||
            selectedSource !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-400">
          Showing {filteredTemplates.length} of {templates.length} templates
        </div>
      </div>

      {/* Templates List */}
      <div className="space-y-3">
        {filteredTemplates.length === 0 ? (
          <Card className="border-gray-600 bg-gray-800/20">
            <CardContent className="py-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-400">
                {templates.length === 0
                  ? "No templates found. Create a new template to get started."
                  : "No templates match your search criteria."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="border-gray-600 bg-gray-800/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <CardTitle className="text-base text-white">
                        {template.name}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "flex items-center space-x-1 text-white",
                          getSeverityColor(template.severity)
                        )}
                      >
                        {getSeverityIcon(template.severity)}
                        <span>{template.severity}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {template.source?.type || "unknown"}
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-gray-400">
                      {template.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>ID: {template.id}</span>
                      <span>Type: {template.type}</span>
                      {template.source?.priority && (
                        <span>Priority: {template.source.priority}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTemplate(template.id)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-h-[80vh] w-full max-w-6xl bg-gray-900 text-white">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Code className="h-5 w-5" />
                            <span>Template Inspector: {template.name}</span>
                          </DialogTitle>
                        </DialogHeader>

                        <div className="w-full space-y-4">
                          {isLoadingContent ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-gray-400">
                                Loading template content...
                              </div>
                            </div>
                          ) : templateContent ? (
                            <>
                              {/* Template Metadata */}
                              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-800/30 p-4">
                                <div>
                                  <Label className="text-xs text-gray-400">
                                    Template ID
                                  </Label>
                                  <div className="text-sm text-white">
                                    {templateContent.id}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-400">
                                    Severity
                                  </Label>
                                  <div className="text-sm text-white">
                                    {templateContent.severity}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-400">
                                    Type
                                  </Label>
                                  <div className="text-sm text-white">
                                    {templateContent.type}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-xs text-gray-400">
                                    Source
                                  </Label>
                                  <div className="text-sm text-white">
                                    {templateContent.source?.type || "unknown"}
                                  </div>
                                </div>
                              </div>

                              {/* Template Content */}
                              <div className="w-full space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm font-medium text-gray-300">
                                    Template Content (YAML)
                                  </Label>
                                  <div className="flex space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        copyToClipboard(
                                          convertToYamlForEditing(
                                            templateContent.content
                                          )
                                        )
                                      }
                                      className="flex items-center space-x-1"
                                    >
                                      <Copy className="h-3 w-3" />
                                      <span>Copy</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        downloadTemplate(templateContent)
                                      }
                                      className="flex items-center space-x-1"
                                    >
                                      <Download className="h-3 w-3" />
                                      <span>Download</span>
                                    </Button>
                                  </div>
                                </div>
                                <div
                                  className="w-full"
                                  style={{ minWidth: "600px" }}
                                >
                                  <MonacoEditor
                                    value={convertToYamlForEditing(
                                      templateContent.content
                                    )}
                                    language="yaml"
                                    readOnly={true}
                                    height={MONACO_HEIGHTS.viewer}
                                    theme="catppuccin-mocha"
                                  />
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="py-8 text-center text-gray-400">
                              Failed to load template content
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>

                    {template.source?.type === "custom" && (
                      <>
                        {onEditTemplate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditTemplate(template.id)}
                            className="flex items-center space-x-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDeleteTemplate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteTemplate(template.id)}
                            className="flex items-center space-x-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default TemplateViewer;

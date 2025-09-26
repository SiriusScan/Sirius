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
  PlayCircle,
  Settings,
  Terminal,
} from "lucide-react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import MonacoEditor from "~/components/editor/MonacoEditor";

interface ScriptViewerProps {
  scripts: Array<{
    id: string;
    name: string;
    description: string;
    language: string;
    platform: string;
    source?: {
      type: string;
      name?: string;
      priority?: number;
    };
    created_at?: string;
    updated_at?: string;
  }>;
  onEditScript?: (scriptId: string) => void;
  onDeleteScript?: (scriptId: string) => void;
  onExecuteScript?: (scriptId: string) => void;
}

interface ScriptWithContent {
  id: string;
  content: any;
  metadata: any;
  scriptContent: string;
  name: string;
  description: string;
  language: string;
  platform: string;
  source?: any;
  created_at?: string;
  updated_at?: string;
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({
  scripts,
  onEditScript,
  onDeleteScript,
  onExecuteScript,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Query for script content when selected
  const { data: scriptContent, isLoading: isLoadingContent } =
    api.agent.getScriptContent.useQuery(
      { scriptId: selectedScript! },
      {
        enabled: !!selectedScript,
        refetchOnWindowFocus: false,
      }
    );

  // Filter scripts based on search and filters
  const filteredScripts = useMemo(() => {
    return scripts.filter((script) => {
      const matchesSearch =
        script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        script.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLanguage =
        selectedLanguage === "all" || script.language === selectedLanguage;
      const matchesPlatform =
        selectedPlatform === "all" || script.platform === selectedPlatform;
      const matchesSource =
        selectedSource === "all" || script.source?.type === selectedSource;

      return (
        matchesSearch && matchesLanguage && matchesPlatform && matchesSource
      );
    });
  }, [
    scripts,
    searchQuery,
    selectedLanguage,
    selectedPlatform,
    selectedSource,
  ]);

  // Get unique values for filters
  const languageOptions = [...new Set(scripts.map((s) => s.language))];
  const platformOptions = [...new Set(scripts.map((s) => s.platform))];
  const sourceOptions = [
    ...new Set(scripts.map((s) => s.source?.type).filter(Boolean)),
  ];

  const getLanguageColor = (language: string) => {
    const colors = {
      bash: "bg-green-600",
      powershell: "bg-blue-600",
      python: "bg-yellow-600",
      javascript: "bg-yellow-500",
      lua: "bg-purple-600",
      nse: "bg-indigo-600",
    };
    return colors[language as keyof typeof colors] || "bg-gray-600";
  };

  const getLanguageIcon = (language: string) => {
    switch (language) {
      case "bash":
        return <Terminal className="h-3 w-3" />;
      case "powershell":
        return <Terminal className="h-3 w-3" />;
      case "python":
        return <Code className="h-3 w-3" />;
      case "javascript":
        return <Code className="h-3 w-3" />;
      case "lua":
        return <Code className="h-3 w-3" />;
      case "nse":
        return <Settings className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    const colors = {
      linux: "bg-orange-600",
      windows: "bg-blue-600",
      macos: "bg-gray-600",
      cross: "bg-purple-600",
      any: "bg-green-600",
    };
    return colors[platform as keyof typeof colors] || "bg-gray-600";
  };

  const copyScriptContent = (script: ScriptWithContent) => {
    if (script.scriptContent) {
      navigator.clipboard.writeText(formatScriptContent(script.scriptContent));
    }
  };

  const downloadScript = (script: ScriptWithContent) => {
    if (script.scriptContent) {
      const formattedContent = formatScriptContent(script.scriptContent);
      const blob = new Blob([formattedContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${script.id}.${getFileExtension(script.language)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getFileExtension = (language: string) => {
    const extensions = {
      bash: "sh",
      powershell: "ps1",
      python: "py",
      javascript: "js",
      lua: "lua",
      nse: "nse",
    };
    return extensions[language as keyof typeof extensions] || "txt";
  };

  const getMonacoLanguage = (language: string) => {
    const languageMap = {
      bash: "shell",
      powershell: "powershell",
      python: "python",
      javascript: "javascript",
      lua: "lua",
      nse: "lua", // NSE scripts are Lua-based
    };
    return languageMap[language as keyof typeof languageMap] || "shell";
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLanguage("all");
    setSelectedPlatform("all");
    setSelectedSource("all");
  };

  // Function to properly format script content with newlines
  const formatScriptContent = (content: string): string => {
    if (!content) return "";

    // Replace escaped newlines with actual newlines
    return content
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search scripts by name, description, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setViewMode(viewMode === "cards" ? "table" : "cards")
            }
            className="flex items-center space-x-1"
          >
            {viewMode === "cards" ? (
              <>
                <Filter className="h-4 w-4" />
                <span>Table</span>
              </>
            ) : (
              <>
                <Filter className="h-4 w-4" />
                <span>Cards</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label className="text-sm text-gray-400">Language:</Label>
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {languageOptions.map((language) => (
                  <SelectItem key={language} value={language}>
                    {language}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Label className="text-sm text-gray-400">Platform:</Label>
            <Select
              value={selectedPlatform}
              onValueChange={setSelectedPlatform}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {platformOptions.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
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
              <SelectContent>
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
            selectedLanguage !== "all" ||
            selectedPlatform !== "all" ||
            selectedSource !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center space-x-1"
            >
              <X className="h-3 w-3" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        <div className="text-sm text-gray-400">
          Showing {filteredScripts.length} of {scripts.length} scripts
        </div>
      </div>

      {/* Scripts Grid/Table */}
      <div>
        {viewMode === "cards" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredScripts.map((script) => (
              <Card
                key={script.id}
                className="border-gray-600 bg-gray-800/30 transition-colors hover:bg-gray-800/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <CardTitle className="text-base text-white">
                          {script.name}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "flex items-center space-x-1 text-white",
                            getLanguageColor(script.language)
                          )}
                        >
                          {getLanguageIcon(script.language)}
                          <span>{script.language}</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs text-white",
                            getPlatformColor(script.platform)
                          )}
                        >
                          {script.platform}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-gray-400">
                        {script.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {script.id}</span>
                        <span>Source: {script.source?.type || "unknown"}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedScript(script.id)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] w-full max-w-6xl bg-gray-900 text-white">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <Code className="h-4 w-4" />
                              <span>Script Inspector: {script.name}</span>
                            </DialogTitle>
                          </DialogHeader>

                          <div className="w-full space-y-4">
                            {isLoadingContent ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="text-gray-400">
                                  Loading script content...
                                </div>
                              </div>
                            ) : scriptContent ? (
                              <>
                                {/* Script Metadata */}
                                <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-800/30 p-4">
                                  <div>
                                    <Label className="text-xs text-gray-400">
                                      Script ID
                                    </Label>
                                    <div className="text-sm text-white">
                                      {scriptContent.id}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-400">
                                      Language
                                    </Label>
                                    <div className="text-sm text-white">
                                      {scriptContent.language}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-400">
                                      Platform
                                    </Label>
                                    <div className="text-sm text-white">
                                      {scriptContent.platform}
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs text-gray-400">
                                      Source
                                    </Label>
                                    <div className="text-sm text-white">
                                      {scriptContent.source?.type || "Unknown"}
                                    </div>
                                  </div>
                                </div>

                                {/* Script Description */}
                                <div className="rounded-lg bg-gray-800/30 p-4">
                                  <Label className="text-xs text-gray-400">
                                    Description
                                  </Label>
                                  <div className="mt-1 text-sm text-white">
                                    {scriptContent.description}
                                  </div>
                                </div>

                                {/* Script Content */}
                                <div className="w-full space-y-2">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium text-gray-300">
                                      Script Content ({scriptContent.language})
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          copyScriptContent(scriptContent)
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
                                          downloadScript(scriptContent)
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
                                      value={
                                        formatScriptContent(
                                          scriptContent.scriptContent
                                        ) || "No content available"
                                      }
                                      language={getMonacoLanguage(
                                        scriptContent.language
                                      )}
                                      readOnly={true}
                                      height="400px"
                                      theme="catppuccin-mocha"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="py-8 text-center text-gray-400">
                                Failed to load script content
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {onExecuteScript && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onExecuteScript(script.id)}
                          className="flex items-center space-x-1 text-green-400 hover:text-green-300"
                        >
                          <PlayCircle className="h-3 w-3" />
                        </Button>
                      )}

                      {script.source?.type === "custom" && (
                        <>
                          {onEditScript && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditScript(script.id)}
                              className="flex items-center space-x-1"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          {onDeleteScript && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteScript(script.id)}
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
            ))}
          </div>
        ) : (
          // Table view implementation would go here
          <div className="rounded-lg border border-gray-600 bg-gray-800/20 p-4">
            <div className="text-center text-gray-400">
              Table view coming soon...
            </div>
          </div>
        )}

        {filteredScripts.length === 0 && (
          <div className="rounded-lg border border-gray-600 bg-gray-800/20 p-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-white">
              No scripts found
            </h3>
            <p className="text-gray-400">
              {searchQuery ||
              selectedLanguage !== "all" ||
              selectedPlatform !== "all" ||
              selectedSource !== "all"
                ? "Try adjusting your search criteria or filters."
                : "Create your first script to get started."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptViewer;

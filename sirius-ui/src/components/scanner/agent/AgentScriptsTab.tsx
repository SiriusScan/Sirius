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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import { api } from "~/utils/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import ScriptViewer from "./ScriptViewer";
import { Library, Plus, Settings, PlayCircle, Terminal } from "lucide-react";
import MonacoEditor from "~/components/editor/MonacoEditor";

// Separate component for editing scripts
interface EditScriptInterfaceProps {
  scriptId: string;
  onCancel: () => void;
  onSave: () => void;
}

const EditScriptInterface: React.FC<EditScriptInterfaceProps> = ({
  scriptId,
  onCancel,
  onSave,
}) => {
  const [editingContent, setEditingContent] = useState("");
  const [language, setLanguage] = useState("bash");

  const { mutate: sendMessage } = api.queue.sendMsg.useMutation({
    onSuccess: () => {
      console.log("Script updated successfully");
      onSave();
    },
    onError: (error) => {
      console.error("Failed to update script:", error);
    },
  });

  // Load script content
  const { data: scriptContent, isLoading } =
    api.agent.getScriptContent.useQuery(
      { scriptId },
      { refetchOnWindowFocus: false }
    );

  // Function to format script content with newlines
  const formatScriptContent = (content: string): string => {
    if (!content) return "";
    return content
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  };

  // Load content when script data is available
  useEffect(() => {
    if (scriptContent && !isLoading) {
      setEditingContent(formatScriptContent(scriptContent.scriptContent || ""));
      setLanguage(scriptContent.language || "bash");
    }
  }, [scriptContent, isLoading]);

  // Helper function to get Monaco language
  const getMonacoLanguage = (scriptLanguage: string): string => {
    switch (scriptLanguage.toLowerCase()) {
      case "bash":
        return "shell";
      case "powershell":
        return "powershell";
      case "python":
        return "python";
      case "javascript":
        return "javascript";
      case "lua":
        return "lua";
      default:
        return "shell";
    }
  };

  // Extract metadata from script comments
  const extractScriptMetadata = (content: string) => {
    const lines = content.split("\n");
    const metadata: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("<!--")
      ) {
        const cleaned = trimmed
          .replace(/^(#|\/\/|<!--)\s*/, "")
          .replace(/-->$/, "")
          .trim();

        const match = cleaned.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          metadata[key.toLowerCase()] = value.trim();
        }
      } else if (
        trimmed &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("//")
      ) {
        break;
      }
    }

    return metadata;
  };

  const handleSave = () => {
    if (!editingContent.trim()) {
      alert("Please provide script content");
      return;
    }

    // Extract metadata from script comments
    const extractedMeta = extractScriptMetadata(editingContent);

    // Use extracted metadata with fallbacks
    const scriptInfo = {
      id: scriptId,
      name: extractedMeta.name || scriptContent?.name || "Custom Script",
      description:
        extractedMeta.description ||
        scriptContent?.description ||
        "Custom script",
      language: language,
      platform:
        extractedMeta.platform || scriptContent?.platform || "cross-platform",
      author: extractedMeta.author || "UI User",
      created: scriptContent?.created_at || new Date().toISOString(),
    };

    const message = {
      operation: "update",
      type: "script",
      id: scriptId,
      content: {
        id: scriptId,
        info: scriptInfo,
        script: editingContent,
        metadata: {
          timeout: 60,
          sandbox: true,
        },
      },
      metadata: {
        source: "ui",
        timestamp: new Date().toISOString(),
        user_id: "ui-user",
      },
    };

    sendMessage({
      queue: "agent_content_sync",
      message: JSON.stringify(message),
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-none border-gray-600 bg-gray-800/20">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Edit Script: {scriptId}
            <span className="ml-2 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
              Experimental
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-gray-400">Loading script content...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-none border-gray-600 bg-gray-800/20">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          Edit Script: {scriptContent?.name || scriptId}
          <span className="ml-2 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
            Experimental
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="w-full space-y-6">
        {/* Language Selection */}
        <div className="w-full">
          <Label className="text-sm font-semibold text-gray-400">
            Script Language
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="mt-1 max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 text-white">
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="powershell">PowerShell</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="lua">Lua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Script Editor */}
        <div className="w-full min-w-0 flex-1">
          <Label className="text-sm font-semibold text-gray-400">
            Script Content
          </Label>
          <div
            className="mt-1 w-full min-w-0"
            style={{ minWidth: "800px", width: "100%" }}
          >
            <div className="w-full" style={{ minWidth: "800px" }}>
              <MonacoEditor
                value={editingContent}
                language={getMonacoLanguage(language)}
                onChange={(value) => setEditingContent(value || "")}
                height="500px"
                theme="catppuccin-mocha"
              />
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <p>
              Edit the script content with metadata in comments.{" "}
              <span className="font-medium text-orange-400">
                Note: This is an experimental feature.
              </span>
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-violet-600 text-white hover:bg-violet-500"
          >
            Update Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface AgentScriptsTabProps {
  enableScripts: boolean;
  setEnableScripts: (value: boolean) => void;
  scriptTimeout: number;
  setScriptTimeout: (value: number) => void;
  scriptSandbox: boolean;
  setScriptSandbox: (value: boolean) => void;
}

interface CustomScript {
  id: string;
  name: string;
  description: string;
  language: string;
  platform: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface DiscoveryResult {
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
  statistics: {
    total_scripts: number;
    custom_scripts: number;
    repository_scripts: number;
    local_scripts: number;
    active_scripts: number;
    last_sync_time: string;
  };
  success: boolean;
}

const AgentScriptsTab: React.FC<AgentScriptsTabProps> = ({
  enableScripts,
  setEnableScripts,
  scriptTimeout,
  setScriptTimeout,
  scriptSandbox,
  setScriptSandbox,
}) => {
  const [activeView, setActiveView] = useState<
    "browse" | "create" | "settings"
  >("browse");
  const [scripts] = useState<CustomScript[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingScript, setEditingScript] = useState<string | null>(null);
  const [newScript, setNewScript] = useState({
    id: "",
    name: "",
    description: "",
    language: "bash",
    platform: "linux",
    content: `# Name: Example Security Script
# Description: Example script that checks for a common vulnerability
# Platform: linux
# Author: Security Team

#!/bin/bash

# Example vulnerability check script
# This script should output JSON results

# Perform your security checks here
vulnerable=false
confidence=0.0
evidence=""

# Example check: Look for writable /etc/passwd
if [ -w "/etc/passwd" ]; then
    vulnerable=true
    confidence=0.9
    evidence="World-writable /etc/passwd file detected"
fi

# Output results in JSON format
echo "{\\"vulnerable\\": $vulnerable, \\"confidence\\": $confidence, \\"evidence\\": \\"$evidence\\", \\"metadata\\": {}}"
`,
  });

  const { mutate: sendMessage } = api.queue.sendMsg.useMutation({
    onSuccess: () => {
      console.log("Script message sent successfully");
      // Refresh scripts list
      loadScripts();
    },
    onError: (error) => {
      console.error("Failed to send script message:", error);
    },
  });

  // Load script discovery results directly from ValKey
  const { data: discoveryResult, isLoading: discoveryLoading } =
    api.agent.discoverScriptsFromValKey.useQuery(undefined, {
      refetchInterval: 60000, // Refetch every minute
    }) as { data: DiscoveryResult | undefined; isLoading: boolean };

  // Note: Script editing is now handled by separate EditScriptInterface component

  const loadScripts = () => {
    console.log("Loading scripts via tRPC...");
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

  // Script editing is now handled by separate EditScriptInterface component

  // Function to extract metadata from script comments
  const extractScriptMetadata = (content: string) => {
    const lines = content.split("\n");
    const metadata: Record<string, string> = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("//") ||
        trimmed.startsWith("<!--")
      ) {
        // Remove comment markers and trim
        const cleaned = trimmed
          .replace(/^(#|\/\/|<!--)\s*/, "")
          .replace(/-->$/, "")
          .trim();

        // Look for key: value pairs
        const match = cleaned.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          metadata[key.toLowerCase()] = value.trim();
        }
      } else if (
        trimmed &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("//")
      ) {
        // Stop parsing when we hit actual code
        break;
      }
    }

    return metadata;
  };

  const handleCreateScript = () => {
    if (!newScript.content.trim()) {
      alert("Please provide script content");
      return;
    }

    // Extract metadata from script comments
    const extractedMeta = extractScriptMetadata(newScript.content);

    // Generate unique ID for new script
    const scriptId =
      extractedMeta.id ||
      extractedMeta.name?.toLowerCase().replace(/\s+/g, "-") ||
      `custom-script-${Date.now()}`;

    // Use extracted metadata with fallbacks for new script creation
    const scriptInfo = {
      id: scriptId,
      name: extractedMeta.name || newScript.name || "Custom Script",
      description:
        extractedMeta.description ||
        newScript.description ||
        "Custom script created via UI",
      language: newScript.language, // Use selected language from dropdown
      platform:
        extractedMeta.platform || newScript.platform || "cross-platform",
      author: extractedMeta.author || "UI User",
      created: new Date().toISOString(),
    };

    const message = {
      operation: "create",
      type: "script",
      id: scriptId,
      content: {
        id: scriptId,
        info: scriptInfo,
        script: newScript.content,
        metadata: {
          timeout: scriptTimeout,
          sandbox: scriptSandbox,
        },
      },
      metadata: {
        source: "ui",
        timestamp: new Date().toISOString(),
        user_id: "ui-user",
      },
    };

    sendMessage({
      queue: "agent_content_sync",
      message: JSON.stringify(message),
    });

    // Reset form after creating new script
    setNewScript({
      id: "",
      name: "",
      description: "",
      language: "bash",
      platform: "linux",
      content: "",
    });
    setIsCreating(false);
    setActiveView("browse");
  };

  const handleDeleteScript = (scriptId: string) => {
    if (confirm(`Are you sure you want to delete script ${scriptId}?`)) {
      const message = {
        operation: "delete",
        type: "script",
        id: scriptId,
        metadata: {
          source: "ui",
          timestamp: new Date().toISOString(),
          user_id: "ui-user",
        },
      };

      sendMessage({
        queue: "agent_content_sync",
        message: JSON.stringify(message),
      });
    }
  };

  const handleEditScript = (scriptId: string) => {
    setEditingScript(scriptId);
    setActiveView("create");
    setIsCreating(true);
  };

  const handleExecuteScript = (scriptId: string) => {
    console.log(`Executing script: ${scriptId}`);
    // TODO: Implement script execution
  };

  const handleCreateNew = () => {
    setEditingScript(null);
    setActiveView("create");
    setIsCreating(true);
    // Reset to default template when creating new
    setNewScript({
      id: "",
      name: "",
      description: "",
      language: "bash",
      platform: "linux",
      content: getScriptTemplate("bash"),
    });
  };

  // Helper function to get Monaco language from script language
  const getMonacoLanguage = (scriptLanguage: string): string => {
    switch (scriptLanguage.toLowerCase()) {
      case "bash":
        return "shell";
      case "powershell":
        return "powershell";
      case "python":
        return "python";
      case "javascript":
        return "javascript";
      case "lua":
        return "lua";
      case "perl":
        return "perl";
      case "ruby":
        return "ruby";
      default:
        return "shell";
    }
  };

  // Helper function to get language-specific script templates
  const getScriptTemplate = (language: string): string => {
    switch (language) {
      case "bash":
        return `# Name: Example Security Script
# Description: Example script that checks for a common vulnerability
# Platform: linux
# Author: Security Team

#!/bin/bash

# Example vulnerability check script
# This script should output JSON results

# Perform your security checks here
vulnerable=false
confidence=0.0
evidence=""

# Example check: Look for writable /etc/passwd
if [ -w "/etc/passwd" ]; then
    vulnerable=true
    confidence=0.9
    evidence="World-writable /etc/passwd file detected"
fi

# Output results in JSON format
echo "{\\"vulnerable\\": $vulnerable, \\"confidence\\": $confidence, \\"evidence\\": \\"$evidence\\", \\"metadata\\": {}}"
`;

      case "powershell":
        return `# Name: Example Security Script
# Description: Example PowerShell script for Windows security checks
# Platform: windows
# Author: Security Team

# Example vulnerability check script
# This script should output JSON results

$vulnerable = $false
$confidence = 0.0
$evidence = ""

# Example check: Look for weak registry permissions
try {
    $acl = Get-Acl "HKLM:\\SYSTEM\\CurrentControlSet\\Services"
    if ($acl.Access | Where-Object { $_.IdentityReference -eq "Everyone" -and $_.AccessControlType -eq "Allow" }) {
        $vulnerable = $true
        $confidence = 0.8
        $evidence = "Weak registry permissions detected"
    }
} catch {
    $evidence = "Could not check registry permissions"
}

# Output results in JSON format
$result = @{
    vulnerable = $vulnerable
    confidence = $confidence
    evidence = $evidence
    metadata = @{}
}
$result | ConvertTo-Json -Compress
`;

      case "python":
        return `# Name: Example Security Script
# Description: Example Python script for security checks
# Platform: cross-platform
# Author: Security Team

import json
import os
import sys

def main():
    """Main function for security check"""
    vulnerable = False
    confidence = 0.0
    evidence = ""
    
    # Example check: Look for common insecure file permissions
    try:
        if os.name == 'posix' and os.path.exists('/etc/passwd'):
            stat_info = os.stat('/etc/passwd')
            if stat_info.st_mode & 0o002:  # World writable
                vulnerable = True
                confidence = 0.9
                evidence = "World-writable /etc/passwd detected"
    except Exception as e:
        evidence = f"Error checking file permissions: {str(e)}"
    
    # Output results in JSON format
    result = {
        "vulnerable": vulnerable,
        "confidence": confidence,
        "evidence": evidence,
        "metadata": {}
    }
    print(json.dumps(result))

if __name__ == "__main__":
    main()
`;

      case "javascript":
        return `// Name: Example Security Script
// Description: Example Node.js script for security checks
// Platform: cross-platform
// Author: Security Team

const fs = require('fs');
const path = require('path');

function main() {
    let vulnerable = false;
    let confidence = 0.0;
    let evidence = "";
    
    // Example check: Look for package.json with security issues
    try {
        const packagePath = path.join(process.cwd(), 'package.json');
        if (fs.existsSync(packagePath)) {
            const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            if (packageData.dependencies && packageData.dependencies['lodash'] && 
                packageData.dependencies['lodash'].startsWith('^3.')) {
                vulnerable = true;
                confidence = 0.7;
                evidence = "Potentially vulnerable lodash version detected";
            }
        }
    } catch (error) {
        evidence = \`Error checking package.json: \${error.message}\`;
    }
    
    // Output results in JSON format
    const result = {
        vulnerable: vulnerable,
        confidence: confidence,
        evidence: evidence,
        metadata: {}
    };
    console.log(JSON.stringify(result));
}

main();
`;

      case "lua":
        return `-- Name: Example Security Script
-- Description: Example Lua script for security checks
-- Platform: cross-platform
-- Author: Security Team

local json = require("json") -- Assumes json library is available

function main()
    local vulnerable = false
    local confidence = 0.0
    local evidence = ""
    
    -- Example check: Look for common insecure configurations
    local config_file = "/etc/ssh/sshd_config"
    local file = io.open(config_file, "r")
    
    if file then
        for line in file:lines() do
            if line:match("^PermitRootLogin%s+yes") then
                vulnerable = true
                confidence = 0.8
                evidence = "SSH root login is enabled"
                break
            end
        end
        file:close()
    else
        evidence = "Could not read SSH configuration"
    end
    
    -- Output results in JSON format
    local result = {
        vulnerable = vulnerable,
        confidence = confidence,
        evidence = evidence,
        metadata = {}
    }
    print(json.encode(result))
end

main()
`;

      default:
        return newScript.content;
    }
  };

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Experimental Warning Banner */}
      <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-orange-400">
              Experimental Feature
            </h3>
            <p className="mt-1 text-sm text-orange-300/80">
              Custom scripts are an experimental feature that is not currently
              supported. While the functionality works, it may change without
              notice. We recommend using{" "}
              <span className="font-medium text-orange-200">Templates</span> for
              production scanning workflows.
            </p>
          </div>
        </div>
      </div>

      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Switch
            id="enableScripts"
            checked={enableScripts}
            onCheckedChange={setEnableScripts}
          />
          <Label
            htmlFor="enableScripts"
            className="text-sm font-semibold text-gray-400"
          >
            Enable Custom Scripts
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
            <span className="ml-1 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-xs font-medium text-orange-400">
              Experimental
            </span>
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
          <h4 className="mb-4 flex items-center text-lg font-medium text-white">
            Script Browser
            <span className="ml-2 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
              Experimental
            </span>
          </h4>
          {discoveryResult?.scripts ? (
            <ScriptViewer
              scripts={discoveryResult.scripts}
              onEditScript={handleEditScript}
              onDeleteScript={handleDeleteScript}
              onExecuteScript={handleExecuteScript}
            />
          ) : (
            <div className="rounded-lg border border-gray-600 bg-gray-800/20 p-4 text-center text-gray-400">
              {discoveryLoading ? "Loading scripts..." : "No scripts found"}
            </div>
          )}
        </div>
      )}

      {activeView === "settings" && (
        <div>
          <h4 className="mb-4 flex items-center text-lg font-medium text-white">
            Script Settings
            <span className="ml-2 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
              Experimental
            </span>
          </h4>

          {/* Discovery Statistics */}
          {discoveryResult?.statistics && (
            <div className="mb-6 rounded-lg border border-gray-600 bg-gray-800/20 p-4">
              <h5 className="mb-2 text-sm font-medium text-gray-300">
                Discovery Statistics
              </h5>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                  Total Scripts: {discoveryResult.statistics.total_scripts}
                </div>
                <div>
                  Custom Scripts: {discoveryResult.statistics.custom_scripts}
                </div>
                <div>
                  Repository Scripts:{" "}
                  {discoveryResult.statistics.repository_scripts}
                </div>
                <div>
                  Local Scripts: {discoveryResult.statistics.local_scripts}
                </div>
              </div>
            </div>
          )}

          {/* Script Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="scriptTimeout"
                className="mb-2 block text-sm font-semibold text-gray-400"
              >
                Script Timeout (seconds): {scriptTimeout}
              </Label>
              <input
                type="range"
                min="5"
                max="300"
                value={scriptTimeout}
                onChange={(e) => setScriptTimeout(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="scriptSandbox"
                checked={scriptSandbox}
                onCheckedChange={setScriptSandbox}
              />
              <Label
                htmlFor="scriptSandbox"
                className="text-sm font-semibold text-gray-400"
              >
                Enable Script Sandboxing
              </Label>
            </div>
          </div>
        </div>
      )}

      {activeView === "create" && !editingScript && (
        <Card className="w-full max-w-none border-gray-600 bg-gray-800/20">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              Create New Script
              <span className="ml-2 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
                Experimental
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="w-full space-y-6">
            {/* Language Selection */}
            <div className="w-full">
              <Label
                htmlFor="scriptLanguage"
                className="text-sm font-semibold text-gray-400"
              >
                Script Language
              </Label>
              <Select
                value={newScript.language}
                onValueChange={(value) =>
                  setNewScript({
                    ...newScript,
                    language: value,
                    content: getScriptTemplate(value),
                  })
                }
              >
                <SelectTrigger className="mt-1 max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white">
                  <SelectItem value="bash">Bash</SelectItem>
                  <SelectItem value="powershell">PowerShell</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="lua">Lua</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Script Editor */}
            <div className="w-full min-w-0 flex-1">
              <Label
                htmlFor="scriptContent"
                className="text-sm font-semibold text-gray-400"
              >
                Custom Script
              </Label>
              <div
                className="mt-1 w-full min-w-0"
                style={{ minWidth: "800px", width: "100%" }}
              >
                <div className="w-full" style={{ minWidth: "800px" }}>
                  <MonacoEditor
                    value={newScript.content}
                    language={getMonacoLanguage(newScript.language)}
                    onChange={(value) => {
                      setNewScript({ ...newScript, content: value || "" });
                    }}
                    height="500px"
                    theme="catppuccin-mocha"
                  />
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>
                  Create a custom script with metadata included in comments at
                  the top.{" "}
                  <span className="font-medium text-orange-400">
                    Note: This is an experimental feature.
                  </span>
                </p>
                <div className="mt-1 rounded bg-gray-700 p-3 font-mono text-xs">
                  <div className="text-gray-300"># Script Metadata Format:</div>
                  <div className="text-green-300"># Name: Script Name</div>
                  <div className="text-green-300">
                    # Description: Script purpose
                  </div>
                  <div className="text-green-300">
                    # Platform: linux|windows|macos|cross-platform
                  </div>
                  <div className="text-green-300"># Author: Your name</div>
                  <div className="text-gray-300">
                    # Script should output JSON:
                  </div>
                  <div className="text-blue-300">{"{"}</div>
                  <div className="ml-2 text-yellow-300">
                    "vulnerable": true/false,
                  </div>
                  <div className="ml-2 text-yellow-300">
                    "confidence": 0.0-1.0,
                  </div>
                  <div className="ml-2 text-yellow-300">
                    "evidence": "Description",
                  </div>
                  <div className="ml-2 text-yellow-300">"metadata": {"{}"}</div>
                  <div className="text-blue-300">{"}"}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setActiveView("browse");
                  setEditingScript(null);
                  // Reset form state
                  setNewScript({
                    id: "",
                    name: "",
                    description: "",
                    language: "bash",
                    platform: "linux",
                    content: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateScript}
                className="bg-violet-600 text-white hover:bg-violet-500"
              >
                Create Script
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Separate Edit Script Interface */}
      {activeView === "create" && editingScript && (
        <EditScriptInterface
          scriptId={editingScript}
          onCancel={() => {
            setIsCreating(false);
            setActiveView("browse");
            setEditingScript(null);
          }}
          onSave={() => {
            // Refresh scripts and go back to browse
            setIsCreating(false);
            setActiveView("browse");
            setEditingScript(null);
          }}
        />
      )}
    </div>
  );
};

export default AgentScriptsTab;

import React, { useState, useEffect } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import { type NmapScript } from "./mockScriptsData";
import MonacoEditor from "~/components/editor/MonacoEditor";
import { api } from "~/utils/api";

const NSE_TEMPLATE = `-- NSE Script Template
-- https://nmap.org/book/nse-tutorial.html

local nmap = require "nmap"
local shortport = require "shortport"
local stdnse = require "stdnse"

description = [[
  Describe what your script does here.
]]

---
-- @usage
-- nmap --script <script-name> <target>
--
-- @output
-- PORT   STATE SERVICE
-- 80/tcp open  http
-- | <script-name>:
-- |   Result line 1
-- |_  Result line 2

author = "User"
license = "Same as Nmap--See https://nmap.org/book/man-legal.html"
categories = {"discovery", "safe"}

portrule = shortport.http

action = function(host, port)
  -- Your script logic here
  return "Script executed successfully"
end
`;

interface ScriptNavigatorProps {
  script: NmapScript;
  onClose: () => void;
  onScriptUpdated?: () => void;
  /** When true, the navigator is in creation mode for a brand-new script */
  isNew?: boolean;
  /** Callback to delete an existing script */
  onDelete?: (script: NmapScript) => void;
}

const ScriptNavigator: React.FC<ScriptNavigatorProps> = ({
  script,
  onClose,
  onScriptUpdated,
  isNew = false,
  onDelete,
}) => {
  const [scriptCode, setScriptCode] = useState(
    isNew ? NSE_TEMPLATE : script.code
  );
  const [isEditing, setIsEditing] = useState(isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Editable metadata fields (only relevant in create mode)
  const [scriptName, setScriptName] = useState(isNew ? "" : script.name);
  const [scriptAuthor, setScriptAuthor] = useState(
    isNew ? "" : script.author
  );
  const [scriptProtocol, setScriptProtocol] = useState(
    isNew ? "" : script.protocol || ""
  );
  const [scriptDescription, setScriptDescription] = useState(
    isNew ? "" : script.description
  );
  const [scriptTags, setScriptTags] = useState(
    isNew ? "" : (script.tags || []).join(", ")
  );

  // Track whether changes exist
  useEffect(() => {
    if (isNew) {
      // For new scripts, always consider it "has changes" if name is filled
      setHasChanges(scriptName.trim().length > 0);
    } else {
      setHasChanges(scriptCode !== script.code);
    }
  }, [scriptCode, script.code, isNew, scriptName]);

  // TRPC context and mutations
  const trpcContext = api.useContext();

  const updateMutation = api.store.updateNseScript.useMutation({
    onSuccess: () => {
      toast.success("Script updated successfully", {
        description: `${script.name} has been saved to the database.`,
      });
      setIsSaving(false);
      setHasChanges(false);
      trpcContext.store.getNseScripts.invalidate();
      onScriptUpdated?.();
    },
    onError: (error) => {
      toast.error("Failed to update script", {
        description: error.message || "An unknown error occurred",
      });
      setIsSaving(false);
    },
  });

  const createMutation = api.store.createNseScript.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Script created successfully", {
          description: `${scriptName} has been added to the script library.`,
        });
        setIsSaving(false);
        trpcContext.store.getNseScripts.invalidate();
        onScriptUpdated?.();
        onClose();
      } else {
        toast.error("Failed to create script", {
          description: result.error || "An unknown error occurred",
        });
        setIsSaving(false);
      }
    },
    onError: (error) => {
      toast.error("Failed to create script", {
        description: error.message || "An unknown error occurred",
      });
      setIsSaving(false);
    },
  });

  /** Generate a kebab-case ID from a script name */
  const generateId = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSaveChanges = async () => {
    if (isNew) {
      // Validate required fields
      if (!scriptName.trim()) {
        toast.error("Script name is required");
        return;
      }

      setIsSaving(true);

      const id = generateId(scriptName);
      const tags = scriptTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      createMutation.mutate({
        id,
        name: scriptName.trim(),
        code: scriptCode,
        protocol: scriptProtocol || "*",
        metadata: {
          author: scriptAuthor || "User",
          tags,
          description: scriptDescription,
        },
      });
    } else {
      // Existing update flow
      setIsSaving(true);

      if (hasChanges) {
        updateMutation.mutate({
          id: script.id,
          code: scriptCode,
          metadata: {
            author: script.author,
            tags: script.tags,
            description: script.description,
          },
        });
      } else {
        toast.info("No changes to save", {
          description: "The script code hasn't been modified.",
        });
        setIsSaving(false);
      }
    }
  };

  // Determine button styling based on state
  const getSaveButtonClass = () => {
    if (!isEditing && !isNew) return "bg-violet-600/20 hover:bg-violet-600/30";
    if (isSaving) return "bg-gray-700 hover:bg-gray-600";
    if (hasChanges) return "bg-violet-600 hover:bg-violet-700 text-white";
    return "bg-violet-600/20 hover:bg-violet-600/30";
  };

  const parsedTags = isNew
    ? scriptTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : script.tags || [];

  const displayName = isNew ? scriptName || "New Script" : script.name;
  const displayAuthor = isNew ? scriptAuthor || "User" : script.author;
  const displayProtocol = isNew ? scriptProtocol : script.protocol;
  const displayDescription = isNew
    ? scriptDescription || "No description yet."
    : script.description;

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">
            {isNew ? "Create New Script" : displayName}
          </h3>
          <p className="text-sm text-gray-400">
            {isNew
              ? "Define a custom NSE script for network scanning."
              : `Author: ${displayAuthor} ${displayProtocol ? `| Protocol: ${displayProtocol}` : ""}`}
          </p>
          {!isNew && script.path && (
            <p className="text-xs text-gray-500">Path: {script.path}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(script)}
              className="text-gray-400 hover:text-red-400"
              title="Delete script"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
              </svg>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
      </div>

      {/* Tags display */}
      {!isNew && (
        <div className="flex flex-wrap gap-2">
          {parsedTags.length > 0 ? (
            parsedTags.map((tag) => (
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
      )}

      <Tabs
        defaultValue={isNew ? "details" : "description"}
        className="flex flex-1 flex-col"
      >
        <TabsList className="mb-4">
          {isNew ? (
            <>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="code">Code Editor</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="code">Code Editor</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Details tab for new scripts / Description tab for existing */}
        {isNew ? (
          <TabsContent value="details" className="flex-1 space-y-4">
            <div className="space-y-4 rounded-md border border-gray-700 bg-gray-900/30 p-4">
              <div>
                <Label
                  htmlFor="scriptName"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Script Name *
                </Label>
                <Input
                  id="scriptName"
                  value={scriptName}
                  onChange={(e) => setScriptName(e.target.value)}
                  placeholder="e.g. my-custom-scanner"
                  className="border-gray-600 bg-gray-800/50 text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="scriptAuthor"
                    className="mb-1.5 block text-sm font-medium text-gray-300"
                  >
                    Author
                  </Label>
                  <Input
                    id="scriptAuthor"
                    value={scriptAuthor}
                    onChange={(e) => setScriptAuthor(e.target.value)}
                    placeholder="Your name"
                    className="border-gray-600 bg-gray-800/50 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="scriptProtocol"
                    className="mb-1.5 block text-sm font-medium text-gray-300"
                  >
                    Protocol
                  </Label>
                  <Input
                    id="scriptProtocol"
                    value={scriptProtocol}
                    onChange={(e) => setScriptProtocol(e.target.value)}
                    placeholder="e.g. tcp, udp, http, *"
                    className="border-gray-600 bg-gray-800/50 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="scriptDescription"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Description
                </Label>
                <textarea
                  id="scriptDescription"
                  value={scriptDescription}
                  onChange={(e) => setScriptDescription(e.target.value)}
                  placeholder="Describe what your script does..."
                  rows={3}
                  className="w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <Label
                  htmlFor="scriptTags"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  Tags{" "}
                  <span className="text-xs text-gray-500">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="scriptTags"
                  value={scriptTags}
                  onChange={(e) => setScriptTags(e.target.value)}
                  placeholder="e.g. discovery, safe, vuln"
                  className="border-gray-600 bg-gray-800/50 text-white placeholder-gray-500"
                />
                {parsedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {parsedTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-violet-600/20 text-xs text-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <p className="text-xs text-gray-500">
                  Generated ID:{" "}
                  <code className="rounded bg-gray-800 px-1.5 py-0.5 text-violet-400">
                    {generateId(scriptName) || "..."}
                  </code>
                </p>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveChanges}
                  disabled={isSaving || !scriptName.trim()}
                  className={getSaveButtonClass()}
                >
                  {isSaving ? "Creating..." : "Create Script"}
                </Button>
              </div>
            </div>
          </TabsContent>
        ) : (
          <TabsContent value="description" className="flex-1 space-y-4">
            <p className="text-white">{displayDescription}</p>
          </TabsContent>
        )}

        <TabsContent value="code" className="flex flex-1 flex-col space-y-4">
          <div className="flex min-w-[850px] flex-1 flex-col rounded-md border border-gray-700 bg-gray-900/50 p-4">
            <div className="mb-4 flex border-b border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="ml-2 text-sm text-gray-400">
                  Sirius Editor -{" "}
                  {isNew
                    ? `scripts/custom/${generateId(scriptName) || "new-script"}.nse`
                    : script.path || `${script.id}.nse`}
                </span>
              </div>
              <div className="ml-auto flex items-end gap-2">
                {!isNew && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs"
                  >
                    {isEditing ? "View Mode" : "Edit Mode"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveChanges}
                  disabled={
                    isNew
                      ? isSaving || !scriptName.trim()
                      : !isEditing || isSaving || !hasChanges
                  }
                  className={getSaveButtonClass()}
                >
                  {isSaving
                    ? isNew
                      ? "Creating..."
                      : "Saving..."
                    : isNew
                      ? "Create Script"
                      : hasChanges
                        ? "Save Changes*"
                        : "Save Changes"}
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <MonacoEditor
                value={scriptCode}
                readOnly={isNew ? false : !isEditing}
                onChange={(value) => setScriptCode(value || "")}
                height="500px"
                language="lua"
                theme="catppuccin-mocha"
              />
            </div>

            {(isEditing || isNew) && (
              <div className="mt-4 flex items-center justify-between border-t border-gray-700 pt-2">
                <span className="text-xs text-gray-400">
                  {isNew
                    ? scriptName.trim()
                      ? "Fill in details and write your script code"
                      : "Set a script name on the Details tab first"
                    : isEditing && hasChanges
                      ? "Changes detected - Don't forget to save your work!"
                      : isEditing
                        ? "Editing mode - No changes detected"
                        : "View mode"}
                </span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleSaveChanges}
                  disabled={
                    isNew
                      ? isSaving || !scriptName.trim()
                      : isSaving || !hasChanges
                  }
                  className={getSaveButtonClass()}
                >
                  {isSaving
                    ? isNew
                      ? "Creating..."
                      : "Saving..."
                    : isNew
                      ? "Create Script"
                      : hasChanges
                        ? "Save Changes*"
                        : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptNavigator;

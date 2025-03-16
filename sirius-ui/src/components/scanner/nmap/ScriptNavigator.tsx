import React, { useState, useEffect } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
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

interface ScriptNavigatorProps {
  script: NmapScript;
  onClose: () => void;
  onScriptUpdated?: () => void;
}

const ScriptNavigator: React.FC<ScriptNavigatorProps> = ({
  script,
  onClose,
  onScriptUpdated,
}) => {
  const [scriptCode, setScriptCode] = useState(script.code);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Track whether changes exist
  useEffect(() => {
    setHasChanges(scriptCode !== script.code);
  }, [scriptCode, script.code]);

  // Get TRPC mutation for updating scripts
  const trpcContext = api.useContext();
  const updateMutation = api.store.updateNseScript.useMutation({
    onSuccess: () => {
      toast.success("Script updated successfully", {
        description: `${script.name} has been saved to the database.`,
      });
      setIsSaving(false);
      setHasChanges(false);

      // Invalidate the cache to refresh the script list
      trpcContext.store.getNseScripts.invalidate();

      // Notify parent if needed
      if (onScriptUpdated) {
        onScriptUpdated();
      }
    },
    onError: (error) => {
      toast.error("Failed to update script", {
        description: error.message || "An unknown error occurred",
      });
      setIsSaving(false);
    },
  });

  const handleSaveChanges = async () => {
    setIsSaving(true);

    // Only send if code has changed
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
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">{script.name}</h3>
          <p className="text-sm text-gray-400">
            Author: {script.author}{" "}
            {script.protocol && `| Protocol: ${script.protocol}`}
          </p>
          {script.path && (
            <p className="text-xs text-gray-500">Path: {script.path}</p>
          )}
        </div>
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

      <div className="flex flex-wrap gap-2">
        {script.tags && script.tags.length > 0 ? (
          script.tags.map((tag) => (
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

      <Tabs defaultValue="description" className="flex flex-1 flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="code">Code Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="flex-1 space-y-4">
          <p className="text-white">{script.description}</p>
        </TabsContent>

        <TabsContent value="code" className="flex flex-1 flex-col space-y-4">
          <div className="flex min-w-[850px] flex-1 flex-col rounded-md border border-gray-700 bg-gray-900/50 p-4">
            <div className="mb-4 flex border-b border-gray-700 pb-2">
              <div className="flex items-center gap-2">
                <span className="ml-2 text-sm text-gray-400">
                  Sirius Editor - {script.path || `${script.id}.nse`}
                </span>
              </div>
              <div className="ml-auto flex items-end gap-2">
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
              </div>
            </div>

            <div className="flex-1">
              <MonacoEditor
                value={scriptCode}
                readOnly={!isEditing}
                onChange={(value) => setScriptCode(value || "")}
                height="100%"
                language="lua"
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScriptNavigator;

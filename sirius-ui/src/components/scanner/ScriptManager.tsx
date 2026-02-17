import React, { useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Badge } from "~/components/lib/ui/badge";

interface ScriptManagerProps {
  onClose?: () => void;
}

const ScriptManager: React.FC<ScriptManagerProps> = ({ onClose }) => {
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [scriptContent, setScriptContent] = useState("");
  const [scriptMetadata, setScriptMetadata] = useState({
    author: "",
    tags: [] as string[],
    description: "",
  });

  const { data: scripts, isLoading } = api.scripts.getScripts.useQuery();
  const { data: scriptDetail } = api.scripts.getScript.useQuery(
    { id: selectedScript! },
    { enabled: !!selectedScript }
  );
  const updateScriptMutation = api.scripts.updateScript.useMutation();
  const utils = api.useContext();

  // Update local state when script detail is loaded
  React.useEffect(() => {
    if (scriptDetail?.content) {
      setScriptContent(scriptDetail.content.content);
      setScriptMetadata(scriptDetail.content.metadata);
    }
  }, [scriptDetail]);

  const filteredScripts = scripts?.filter(
    (script) =>
      script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      script.protocol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async () => {
    if (!selectedScript) return;

    try {
      await updateScriptMutation.mutateAsync({
        id: selectedScript,
        content: {
          content: scriptContent,
          metadata: scriptMetadata,
        },
      });

      await utils.scripts.getScript.invalidate({ id: selectedScript });
      await utils.scripts.getScripts.invalidate();
      setIsEditing(false);
      alert("Script updated successfully!");
    } catch (error) {
      console.error("Failed to update script:", error);
      alert("Failed to update script. Please try again.");
    }
  };

  const handleSelectScript = (scriptId: string) => {
    setSelectedScript(scriptId);
    setIsEditing(false);
  };

  return (
    <div className="flex h-full gap-4">
      {/* Script List */}
      <div className="w-80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-violet-100">Scripts</h2>
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

        <Input
          placeholder="Search scripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border-violet-100/30 bg-transparent text-violet-100"
        />

        {isLoading ? (
          <div className="text-center text-violet-100">Loading scripts...</div>
        ) : (
          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {filteredScripts?.map((script) => (
              <button
                key={script.id}
                onClick={() => handleSelectScript(script.id)}
                className={`w-full rounded-md border p-3 text-left transition-colors ${
                  selectedScript === script.id
                    ? "border-violet-500 bg-violet-900/30"
                    : "border-violet-100/20 bg-violet-950/10 hover:border-violet-100/40"
                }`}
              >
                <div className="font-medium text-violet-100">{script.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-violet-100/20 text-xs text-violet-300"
                  >
                    {script.protocol}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Script Detail/Editor */}
      <div className="flex-1 space-y-4">
        {selectedScript && scriptDetail ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-violet-100">
                  {scriptDetail.name}
                </h3>
                <p className="text-sm text-violet-300">ID: {scriptDetail.id}</p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="border-violet-100/30 text-violet-100"
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        if (scriptDetail?.content) {
                          setScriptContent(scriptDetail.content.content);
                          setScriptMetadata(scriptDetail.content.metadata);
                        }
                      }}
                      className="border-violet-100/30 text-violet-100"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      
                      disabled={updateScriptMutation.isLoading}
                    >
                      {updateScriptMutation.isLoading ? "Saving..." : "Save"}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-3 rounded-lg border border-violet-100/20 bg-violet-950/10 p-4">
              <div>
                <label className="text-sm font-medium text-violet-100">
                  Author
                </label>
                <Input
                  value={scriptMetadata.author}
                  onChange={(e) =>
                    setScriptMetadata({
                      ...scriptMetadata,
                      author: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="mt-1 border-violet-100/30 bg-transparent text-violet-100 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-violet-100">
                  Description
                </label>
                <Input
                  value={scriptMetadata.description}
                  onChange={(e) =>
                    setScriptMetadata({
                      ...scriptMetadata,
                      description: e.target.value,
                    })
                  }
                  disabled={!isEditing}
                  className="mt-1 border-violet-100/30 bg-transparent text-violet-100 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-violet-100">
                  Tags (comma-separated)
                </label>
                <Input
                  value={scriptMetadata.tags.join(", ")}
                  onChange={(e) =>
                    setScriptMetadata({
                      ...scriptMetadata,
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  disabled={!isEditing}
                  className="mt-1 border-violet-100/30 bg-transparent text-violet-100 disabled:opacity-50"
                />
              </div>
            </div>

            {/* Script Content Editor */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-violet-100">
                Script Content
              </label>
              <textarea
                value={scriptContent}
                onChange={(e) => setScriptContent(e.target.value)}
                disabled={!isEditing}
                className="h-96 w-full rounded-md border border-violet-100/30 bg-transparent p-3 font-mono text-sm text-violet-100 disabled:opacity-50"
                placeholder="Script content..."
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-violet-300">
            Select a script to view or edit its content
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptManager;




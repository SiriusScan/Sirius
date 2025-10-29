import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import { Button } from "~/components/lib/ui/button";
import { RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { api } from "~/utils/api";
import TemplateListTab from "../templates/TemplateListTab";
import TemplateEditorTab from "../templates/TemplateEditorTab";
import TemplateSettingsTab from "../templates/TemplateSettingsTab";

const ProfileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [editingProfileId, setEditingProfileId] = useState<
    string | undefined
  >();

  const utils = api.useContext();

  // Check if scripts are already loaded
  const { data: scripts, isLoading: scriptsLoading } =
    api.store.getNseScripts.useQuery();

  // Script initialization mutation
  const initializeScripts = api.store.initializeNseScripts.useMutation({
    onSuccess: (result) => {
      console.log("Scripts initialized:", result);
      // Invalidate NSE scripts query to refetch
      utils.store.getNseScripts.invalidate();
    },
  });

  // Auto-initialize scripts if none exist
  React.useEffect(() => {
    if (
      !scriptsLoading &&
      scripts &&
      scripts.length === 0 &&
      !initializeScripts.isLoading &&
      !initializeScripts.isSuccess
    ) {
      console.log("Auto-initializing NSE scripts...");
      initializeScripts.mutate();
    }
  }, [scripts, scriptsLoading, initializeScripts]);

  const handleEditProfile = (profileId: string) => {
    setEditingProfileId(profileId);
    setActiveTab("editor");
  };

  const handleCreateNew = () => {
    setEditingProfileId(undefined);
    setActiveTab("editor");
  };

  const handleEditorClose = () => {
    setEditingProfileId(undefined);
    setActiveTab("list");
  };

  const handleInitializeScripts = () => {
    initializeScripts.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Profile Management</h3>
          <p className="text-sm text-gray-400">
            Create and manage scan profiles with custom NSE scripts.
          </p>
        </div>
        {/* Only show manual initialize button if scripts failed to load or user explicitly wants to reload */}
        {(scripts?.length === 0 || initializeScripts.isError) &&
          !initializeScripts.isLoading && (
            <Button
              onClick={handleInitializeScripts}
              disabled={initializeScripts.isLoading}
              variant="outline"
              size="sm"
              className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  initializeScripts.isLoading ? "animate-spin" : ""
                }`}
              />
              {initializeScripts.isLoading
                ? "Loading Scripts..."
                : "Initialize NSE Scripts"}
            </Button>
          )}
      </div>

      {/* Initialization Status */}
      {initializeScripts.isSuccess && initializeScripts.data && (
        <div className="rounded-md border border-green-500/30 bg-green-500/5 p-3">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-green-300">
                Scripts Initialized Successfully
              </p>
              <p className="text-xs text-green-400">
                {initializeScripts.data.message ||
                  `Loaded ${initializeScripts.data.count} NSE scripts`}
              </p>
            </div>
          </div>
        </div>
      )}

      {initializeScripts.isError && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-300">
                Failed to Initialize Scripts
              </p>
              <p className="text-xs text-red-400">
                {initializeScripts.error?.message || "An error occurred"}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleInitializeScripts}
                className="mt-2 border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="list">Profiles</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <TemplateListTab
            onEdit={handleEditProfile}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <TemplateEditorTab
            templateId={editingProfileId}
            onClose={handleEditorClose}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <TemplateSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileManager;

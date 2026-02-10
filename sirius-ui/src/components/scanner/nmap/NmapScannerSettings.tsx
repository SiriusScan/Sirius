import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import { toast } from "sonner";
import NmapScriptsTab from "./NmapScriptsTab";
import RepositoriesTab from "./RepositoriesTab";
import ScriptNavigator from "./ScriptNavigator";
import { type NmapScript } from "./mockScriptsData";
import { api } from "~/utils/api";

/** Blank script template used when creating a new script */
const BLANK_SCRIPT: NmapScript = {
  id: "",
  name: "",
  author: "",
  tags: [],
  description: "",
  code: "",
  protocol: "",
  path: "",
};

const NmapScannerSettings: React.FC = () => {
  const [selectedScript, setSelectedScript] = useState<NmapScript | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("scripts");

  // TRPC utilities for refreshing data
  const trpcContext = api.useContext();

  // Delete mutation
  const deleteMutation = api.store.deleteNseScript.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Script deleted", {
          description: "The script has been removed from the library.",
        });
        trpcContext.store.getNseScripts.invalidate();
        // Navigate back to the list
        setSelectedScript(null);
        setActiveTab("scripts");
      } else {
        toast.error("Failed to delete script", {
          description: result.error || "An unknown error occurred",
        });
      }
    },
    onError: (error) => {
      toast.error("Failed to delete script", {
        description: error.message || "An unknown error occurred",
      });
    },
  });

  const handleSelectScript = (script: NmapScript) => {
    setSelectedScript(script);
    setIsCreating(false);
    setActiveTab("script-detail");
  };

  const handleCreateNew = () => {
    setSelectedScript(null);
    setIsCreating(true);
    setActiveTab("script-detail");
  };

  const handleCloseScriptDetail = () => {
    setSelectedScript(null);
    setIsCreating(false);
    setActiveTab("scripts");
  };

  const handleScriptUpdated = () => {
    trpcContext.store.getNseScripts.invalidate();
  };

  const handleDeleteScript = (script: NmapScript) => {
    if (
      !confirm(`Are you sure you want to delete "${script.name}"? This action cannot be undone.`)
    ) {
      return;
    }
    deleteMutation.mutate({ id: script.id });
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">
          Network Scanner Settings
        </h3>
        <p className="text-sm text-gray-400">
          Configure NSE scripts and script repositories for network scanning.
        </p>
      </div>

      {activeTab === "script-detail" && (selectedScript || isCreating) ? (
        <div className="flex-1">
          <ScriptNavigator
            script={selectedScript || BLANK_SCRIPT}
            onClose={handleCloseScriptDetail}
            onScriptUpdated={handleScriptUpdated}
            isNew={isCreating}
            onDelete={handleDeleteScript}
          />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (value !== "script-detail") {
              setActiveTab(value);
            }
          }}
          className="w-full flex-1"
        >
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="scripts">Scripts</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
          </TabsList>

          <TabsContent value="scripts" className="h-full w-full">
            <NmapScriptsTab
              onSelectScript={handleSelectScript}
              onCreateNew={handleCreateNew}
              onDeleteScript={handleDeleteScript}
            />
          </TabsContent>

          <TabsContent value="repositories" className="h-full w-full">
            <RepositoriesTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default NmapScannerSettings;

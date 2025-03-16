import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import NmapScriptsTab from "./NmapScriptsTab";
import NmapSettingsTab from "./NmapSettingsTab";
import RepositoriesTab from "./RepositoriesTab";
import ScriptNavigator from "./ScriptNavigator";
import { type NmapScript } from "./mockScriptsData";
import { api } from "~/utils/api";
import { Button } from "~/components/lib/ui/button";

interface NmapScannerSettingsProps {
  nmapTiming: string;
  setNmapTiming: (value: string) => void;
  nmapFragmentation: boolean;
  setNmapFragmentation: (value: boolean) => void;
  nmapFastScan: boolean;
  setNmapFastScan: (value: boolean) => void;
  nmapIPv6Scan: boolean;
  setNmapIPv6Scan: (value: boolean) => void;
  nmapExtraArgs: string;
  setNmapExtraArgs: (value: string) => void;
}

const NmapScannerSettings: React.FC<NmapScannerSettingsProps> = (props) => {
  const [selectedScript, setSelectedScript] = useState<NmapScript | null>(null);
  const [activeTab, setActiveTab] = useState("settings");

  // TRPC utilities for refreshing data
  const trpcContext = api.useContext();
  const { mutate: initializeScripts, isLoading: isInitializing } =
    api.store.initializeNseScripts.useMutation({
      onSuccess: (data) => {
        // Show success message
        if (data.success) {
          console.log(
            `Successfully initialized ${data.count} NSE scripts in the manifest`
          );
        } else {
          console.error("Failed to initialize scripts:", data.error);
        }

        // Refresh the script list after initialization
        trpcContext.store.getNseScripts.invalidate();
      },
    });

  // Initialize repositories as well
  const { mutate: initializeRepositories } =
    api.store.initializeNseRepositories.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          console.log(data.message);
        } else {
          console.error("Failed to initialize repositories:", data.error);
        }
      },
    });

  // Combined initialization function
  const handleInitializeAll = () => {
    // First initialize repositories
    initializeRepositories();
    // Then initialize scripts
    initializeScripts();
  };

  const handleSelectScript = (script: NmapScript) => {
    setSelectedScript(script);
    setActiveTab("script-detail");
  };

  const handleCloseScriptDetail = () => {
    setSelectedScript(null);
    setActiveTab("scripts");
  };

  const handleScriptUpdated = () => {
    // Refresh the script list after a save
    trpcContext.store.getNseScripts.invalidate();
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">NMAP Settings</h3>
        </div>
      </div>

      {activeTab === "script-detail" && selectedScript ? (
        <div className="flex-1">
          <ScriptNavigator
            script={selectedScript}
            onClose={handleCloseScriptDetail}
            onScriptUpdated={handleScriptUpdated}
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
          className="flex-1"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="scripts">Scripts</TabsTrigger>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="scripts" className="space-y-4">
            <NmapScriptsTab onSelectScript={handleSelectScript} />
          </TabsContent>

          <TabsContent value="repositories" className="space-y-4">
            <RepositoriesTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <NmapSettingsTab
              nmapTiming={props.nmapTiming}
              setNmapTiming={props.setNmapTiming}
              nmapFragmentation={props.nmapFragmentation}
              setNmapFragmentation={props.setNmapFragmentation}
              nmapFastScan={props.nmapFastScan}
              setNmapFastScan={props.setNmapFastScan}
              nmapIPv6Scan={props.nmapIPv6Scan}
              setNmapIPv6Scan={props.setNmapIPv6Scan}
              nmapExtraArgs={props.nmapExtraArgs}
              setNmapExtraArgs={props.setNmapExtraArgs}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default NmapScannerSettings;

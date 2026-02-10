import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import AgentTemplatesTab from "./AgentTemplatesTab";
import AgentSettingsTab from "./AgentSettingsTab";
import { RepositoriesTab } from "../repositories/RepositoriesTab";

interface AgentScannerSettingsProps {
  // Agent settings
  agentSyncEnabled: boolean;
  setAgentSyncEnabled: (value: boolean) => void;
  agentScanMode: string;
  setAgentScanMode: (value: string) => void;
  agentTimeout: number;
  setAgentTimeout: (value: number) => void;
  agentConcurrency: number;
  setAgentConcurrency: (value: number) => void;
}

const AgentScannerSettings: React.FC<AgentScannerSettingsProps> = ({
  agentSyncEnabled,
  setAgentSyncEnabled,
  agentScanMode,
  setAgentScanMode,
  agentTimeout,
  setAgentTimeout,
  agentConcurrency,
  setAgentConcurrency,
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">
          Agent Scanner Settings
        </h3>
        <p className="text-sm text-gray-400">
          Configure custom templates and agent synchronization settings.
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full flex-1">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="h-full w-full">
          <AgentTemplatesTab />
        </TabsContent>

        <TabsContent value="repositories" className="h-full w-full">
          <RepositoriesTab />
        </TabsContent>

        <TabsContent value="settings" className="h-full w-full">
          <AgentSettingsTab
            agentSyncEnabled={agentSyncEnabled}
            setAgentSyncEnabled={setAgentSyncEnabled}
            agentScanMode={agentScanMode}
            setAgentScanMode={setAgentScanMode}
            agentTimeout={agentTimeout}
            setAgentTimeout={setAgentTimeout}
            agentConcurrency={agentConcurrency}
            setAgentConcurrency={setAgentConcurrency}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentScannerSettings;

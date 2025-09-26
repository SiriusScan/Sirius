import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import AgentTemplatesTab from "./AgentTemplatesTab";
import AgentScriptsTab from "./AgentScriptsTab";
import AgentSettingsTab from "./AgentSettingsTab";
import { api } from "~/utils/api";

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

  // Template settings
  enableTemplates: boolean;
  setEnableTemplates: (value: boolean) => void;
  templatePriority: string;
  setTemplatePriority: (value: string) => void;

  // Script settings
  enableScripts: boolean;
  setEnableScripts: (value: boolean) => void;
  scriptTimeout: number;
  setScriptTimeout: (value: number) => void;
  scriptSandbox: boolean;
  setScriptSandbox: (value: boolean) => void;
}

const AgentScannerSettings: React.FC<AgentScannerSettingsProps> = ({
  // Agent settings
  agentSyncEnabled,
  setAgentSyncEnabled,
  agentScanMode,
  setAgentScanMode,
  agentTimeout,
  setAgentTimeout,
  agentConcurrency,
  setAgentConcurrency,

  // Template settings
  enableTemplates,
  setEnableTemplates,
  templatePriority,
  setTemplatePriority,

  // Script settings
  enableScripts,
  setEnableScripts,
  scriptTimeout,
  setScriptTimeout,
  scriptSandbox,
  setScriptSandbox,
}) => {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">
          Agent Scanner Settings
        </h3>
        <p className="text-sm text-gray-400">
          Configure custom templates, scripts, and agent synchronization
          settings.
        </p>
      </div>

      <Tabs defaultValue="templates" className="w-full flex-1">
        <TabsList className="mb-6 grid w-full grid-cols-3">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scripts" className="relative">
            Scripts
            <span className="ml-2 rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-400">
              Experimental
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="h-full w-full">
          <AgentTemplatesTab
            enableTemplates={enableTemplates}
            setEnableTemplates={setEnableTemplates}
            templatePriority={templatePriority}
            setTemplatePriority={setTemplatePriority}
          />
        </TabsContent>

        <TabsContent value="scripts" className="h-full w-full">
          <AgentScriptsTab
            enableScripts={enableScripts}
            setEnableScripts={setEnableScripts}
            scriptTimeout={scriptTimeout}
            setScriptTimeout={setScriptTimeout}
            scriptSandbox={scriptSandbox}
            setScriptSandbox={setScriptSandbox}
          />
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

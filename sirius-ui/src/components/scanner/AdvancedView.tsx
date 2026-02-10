import React, { useState, useEffect } from "react";
import NmapScannerSettings from "./nmap/NmapScannerSettings";
import AgentScannerSettings from "./agent/AgentScannerSettings";
import { type AgentScanConfig, type AgentScanMode } from "~/types/scanTypes";

type ScannerType = "nmap" | "agent";

interface AdvancedViewProps {
  onAgentConfigChange?: (config: AgentScanConfig | undefined) => void;
}

const AdvancedView: React.FC<AdvancedViewProps> = ({
  onAgentConfigChange,
}) => {
  const [activeScanner, setActiveScanner] = useState<ScannerType>("nmap");

  // Agent settings (wired to scan execution)
  const [agentSyncEnabled, setAgentSyncEnabled] = useState(true);
  const [agentScanMode, setAgentScanMode] = useState("comprehensive");
  const [agentTimeout, setAgentTimeout] = useState(300);
  const [agentConcurrency, setAgentConcurrency] = useState(3);

  // Notify parent of agent config changes
  useEffect(() => {
    if (onAgentConfigChange) {
      if (agentSyncEnabled) {
        onAgentConfigChange({
          enabled: true,
          mode: agentScanMode as AgentScanMode,
          agent_ids: [], // All connected agents
          timeout: agentTimeout,
          concurrency: agentConcurrency,
        });
      } else {
        onAgentConfigChange(undefined);
      }
    }
  }, [
    agentSyncEnabled,
    agentScanMode,
    agentTimeout,
    agentConcurrency,
    onAgentConfigChange,
  ]);

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-white">Scanner Settings</h2>

      <div className="flex min-h-[600px] flex-col space-y-6 md:min-h-[800px] md:flex-row md:space-x-8 md:space-y-0">
        {/* Scanner Navigation Sidebar */}
        <div className="md:w-48 md:flex-shrink-0">
          <div className="flex flex-col space-y-1">
            <button
              className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
                activeScanner === "nmap"
                  ? "bg-violet-600/20 text-white"
                  : "text-gray-400 hover:bg-violet-600/10"
              }`}
              onClick={() => setActiveScanner("nmap")}
            >
              Network
            </button>
            <button
              className={`rounded-lg px-4 py-2.5 text-left transition-colors ${
                activeScanner === "agent"
                  ? "bg-violet-600/20 text-white"
                  : "text-gray-400 hover:bg-violet-600/10"
              }`}
              onClick={() => setActiveScanner("agent")}
            >
              Agent
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-visible">
            {/* Network Settings */}
            {activeScanner === "nmap" && <NmapScannerSettings />}

            {/* Agent Settings */}
            {activeScanner === "agent" && (
              <AgentScannerSettings
                agentSyncEnabled={agentSyncEnabled}
                setAgentSyncEnabled={setAgentSyncEnabled}
                agentScanMode={agentScanMode}
                setAgentScanMode={setAgentScanMode}
                agentTimeout={agentTimeout}
                setAgentTimeout={setAgentTimeout}
                agentConcurrency={agentConcurrency}
                setAgentConcurrency={setAgentConcurrency}
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedView;

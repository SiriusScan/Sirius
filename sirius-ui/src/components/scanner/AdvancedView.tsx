import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import ScannerNavigation, {
  type ScannerType,
} from "./navigation/ScannerNavigation";
import GeneralScannerSettings from "./general/GeneralScannerSettings";
import NmapScannerSettings from "./nmap/NmapScannerSettings";
import RustScanScannerSettings from "./rustscan/RustScanScannerSettings";
import AgentScannerSettings from "./agent/AgentScannerSettings";
import TemplatesScannerSettings from "./templates/TemplatesScannerSettings";

interface AdvancedViewProps {
  // Props if any
}

const AdvancedView: React.FC<AdvancedViewProps> = () => {
  const [activeScanner, setActiveScanner] = useState<ScannerType>("general");

  // General settings
  const [scanEngine, setScanEngine] = useState("nmap");
  const [scanPriority, setScanPriority] = useState("3");
  const [customScripts, setCustomScripts] = useState("");
  const [reportFormat, setReportFormat] = useState("json");
  const [enableOS, setEnableOS] = useState(true);
  const [enableServiceDetection, setEnableServiceDetection] = useState(true);
  const [enableVersionDetection, setEnableVersionDetection] = useState(true);
  const [enableVulnerabilityScanning, setEnableVulnerabilityScanning] =
    useState(true);
  const [callbackUrl, setCallbackUrl] = useState("");

  // NMAP specific settings
  const [nmapTiming, setNmapTiming] = useState("3");
  const [nmapFragmentation, setNmapFragmentation] = useState(false);
  const [nmapFastScan, setNmapFastScan] = useState(false);
  const [nmapIPv6Scan, setNmapIPv6Scan] = useState(false);
  const [nmapExtraArgs, setNmapExtraArgs] = useState("");

  // RustScan specific settings
  const [rustScanBatchSize, setRustScanBatchSize] = useState(4500);
  const [rustScanTimeout, setRustScanTimeout] = useState(1000);
  const [rustScanTries, setRustScanTries] = useState(1);
  const [rustScanCommand, setRustScanCommand] = useState("-sV -sC -A");

  // Agent specific settings
  const [agentSyncEnabled, setAgentSyncEnabled] = useState(true);
  const [agentScanMode, setAgentScanMode] = useState("comprehensive");
  const [agentTimeout, setAgentTimeout] = useState(300);
  const [agentConcurrency, setAgentConcurrency] = useState(3);
  const [enableTemplates, setEnableTemplates] = useState(true);

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-white">Advanced Scanner</h2>

      <div className="flex min-h-[600px] flex-col space-y-6 md:min-h-[800px] md:flex-row md:space-x-8 md:space-y-0">
        {/* Scanner Navigation Sidebar - Fixed width */}
        <div className="md:w-64 md:flex-shrink-0">
          <ScannerNavigation
            activeScanner={activeScanner}
            setActiveScanner={setActiveScanner}
          />
        </div>

        {/* Content Area - Flexible with proper overflow handling */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-x-auto overflow-y-visible">
            {/* General Settings */}
            {activeScanner === "general" && (
              <GeneralScannerSettings
                // General settings
                enableOS={enableOS}
                setEnableOS={setEnableOS}
                enableServiceDetection={enableServiceDetection}
                setEnableServiceDetection={setEnableServiceDetection}
                enableVersionDetection={enableVersionDetection}
                setEnableVersionDetection={setEnableVersionDetection}
                enableVulnerabilityScanning={enableVulnerabilityScanning}
                setEnableVulnerabilityScanning={setEnableVulnerabilityScanning}
                // Engine settings
                scanEngine={scanEngine}
                setScanEngine={setScanEngine}
                scanPriority={scanPriority}
                setScanPriority={setScanPriority}
                reportFormat={reportFormat}
                setReportFormat={setReportFormat}
                // Callback settings
                callbackUrl={callbackUrl}
                setCallbackUrl={setCallbackUrl}
                // Custom scripts
                customScripts={customScripts}
                setCustomScripts={setCustomScripts}
              />
            )}

            {/* NMAP Specific Settings */}
            {activeScanner === "nmap" && (
              <NmapScannerSettings
                nmapTiming={nmapTiming}
                setNmapTiming={setNmapTiming}
                nmapFragmentation={nmapFragmentation}
                setNmapFragmentation={setNmapFragmentation}
                nmapFastScan={nmapFastScan}
                setNmapFastScan={setNmapFastScan}
                nmapIPv6Scan={nmapIPv6Scan}
                setNmapIPv6Scan={setNmapIPv6Scan}
                nmapExtraArgs={nmapExtraArgs}
                setNmapExtraArgs={setNmapExtraArgs}
              />
            )}

            {/* RustScan Specific Settings */}
            {activeScanner === "rustscan" && (
              <RustScanScannerSettings
                rustScanBatchSize={rustScanBatchSize}
                setRustScanBatchSize={setRustScanBatchSize}
                rustScanTimeout={rustScanTimeout}
                setRustScanTimeout={setRustScanTimeout}
                rustScanTries={rustScanTries}
                setRustScanTries={setRustScanTries}
                rustScanCommand={rustScanCommand}
                setRustScanCommand={setRustScanCommand}
              />
            )}

            {/* Agent Specific Settings */}
            {activeScanner === "agent" && (
              <AgentScannerSettings
                // Agent settings
                agentSyncEnabled={agentSyncEnabled}
                setAgentSyncEnabled={setAgentSyncEnabled}
                agentScanMode={agentScanMode}
                setAgentScanMode={setAgentScanMode}
                agentTimeout={agentTimeout}
                setAgentTimeout={setAgentTimeout}
                agentConcurrency={agentConcurrency}
                setAgentConcurrency={setAgentConcurrency}
                // Template settings
                enableTemplates={enableTemplates}
                setEnableTemplates={setEnableTemplates}
              />
            )}

            {/* Templates Settings */}
            {activeScanner === "templates" && <TemplatesScannerSettings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedView;

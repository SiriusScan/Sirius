import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import ScannerNavigation, {
  type ScannerType,
} from "./navigation/ScannerNavigation";
import GeneralScannerSettings from "./general/GeneralScannerSettings";
import NmapScannerSettings from "./nmap/NmapScannerSettings";
import RustScanScannerSettings from "./rustscan/RustScanScannerSettings";

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

  return (
    <div className="rounded-lg bg-gray-800/20">
      <h2 className="mb-6 text-xl font-bold text-white">Advanced Scanner</h2>

      <div className="flex space-x-8">
        {/* Scanner Navigation Sidebar */}
        <ScannerNavigation
          activeScanner={activeScanner}
          setActiveScanner={setActiveScanner}
        />

        {/* Content Area with increased height for better editor experience */}
        <div className="flex-1">
          <div className="h-[850px] overflow-scroll pr-4">
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
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              size="default"
              className="mr-3 bg-gray-700 text-white hover:bg-gray-600"
            >
              Reset
            </Button>
            <Button className="bg-violet-600 text-white hover:bg-violet-500">
              Save Configuration
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedView;

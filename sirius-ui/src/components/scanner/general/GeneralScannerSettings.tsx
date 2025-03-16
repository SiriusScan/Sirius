import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import ScanTypesTab from "./ScanTypesTab";
import EngineSettingsTab from "./EngineSettingsTab";
import CallbacksTab from "./CallbacksTab";
import CustomScriptsTab from "./CustomScriptsTab";

interface GeneralScannerSettingsProps {
  // General settings
  enableOS: boolean;
  setEnableOS: (value: boolean) => void;
  enableServiceDetection: boolean;
  setEnableServiceDetection: (value: boolean) => void;
  enableVersionDetection: boolean;
  setEnableVersionDetection: (value: boolean) => void;
  enableVulnerabilityScanning: boolean;
  setEnableVulnerabilityScanning: (value: boolean) => void;
  
  // Engine settings
  scanEngine: string;
  setScanEngine: (value: string) => void;
  scanPriority: string;
  setScanPriority: (value: string) => void;
  reportFormat: string;
  setReportFormat: (value: string) => void;
  
  // Callback settings
  callbackUrl: string;
  setCallbackUrl: (value: string) => void;
  
  // Custom scripts
  customScripts: string;
  setCustomScripts: (value: string) => void;
}

const GeneralScannerSettings: React.FC<GeneralScannerSettingsProps> = (props) => {
  return (
    <Tabs defaultValue="scan-types" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="scan-types">Scan Types</TabsTrigger>
        <TabsTrigger value="engine">Engine Settings</TabsTrigger>
        <TabsTrigger value="callbacks">Callbacks</TabsTrigger>
        <TabsTrigger value="custom">Custom Scripts</TabsTrigger>
      </TabsList>

      <TabsContent value="scan-types" className="space-y-4">
        <ScanTypesTab 
          enableOS={props.enableOS}
          setEnableOS={props.setEnableOS}
          enableServiceDetection={props.enableServiceDetection}
          setEnableServiceDetection={props.setEnableServiceDetection}
          enableVersionDetection={props.enableVersionDetection}
          setEnableVersionDetection={props.setEnableVersionDetection}
          enableVulnerabilityScanning={props.enableVulnerabilityScanning}
          setEnableVulnerabilityScanning={props.setEnableVulnerabilityScanning}
        />
      </TabsContent>

      <TabsContent value="engine" className="space-y-4">
        <EngineSettingsTab
          scanEngine={props.scanEngine}
          setScanEngine={props.setScanEngine}
          scanPriority={props.scanPriority}
          setScanPriority={props.setScanPriority}
          reportFormat={props.reportFormat}
          setReportFormat={props.setReportFormat}
        />
      </TabsContent>

      <TabsContent value="callbacks" className="space-y-4">
        <CallbacksTab
          callbackUrl={props.callbackUrl}
          setCallbackUrl={props.setCallbackUrl}
        />
      </TabsContent>

      <TabsContent value="custom" className="space-y-4">
        <CustomScriptsTab
          customScripts={props.customScripts}
          setCustomScripts={props.setCustomScripts}
        />
      </TabsContent>
    </Tabs>
  );
};

export default GeneralScannerSettings; 
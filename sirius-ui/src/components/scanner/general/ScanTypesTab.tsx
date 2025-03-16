import React from "react";
import { Switch } from "~/components/lib/ui/switch";
import { Label } from "~/components/lib/ui/label";

interface ScanTypesTabProps {
  enableOS: boolean;
  setEnableOS: (value: boolean) => void;
  enableServiceDetection: boolean;
  setEnableServiceDetection: (value: boolean) => void;
  enableVersionDetection: boolean;
  setEnableVersionDetection: (value: boolean) => void;
  enableVulnerabilityScanning: boolean;
  setEnableVulnerabilityScanning: (value: boolean) => void;
}

const ScanTypesTab: React.FC<ScanTypesTabProps> = ({
  enableOS,
  setEnableOS,
  enableServiceDetection,
  setEnableServiceDetection,
  enableVersionDetection,
  setEnableVersionDetection,
  enableVulnerabilityScanning,
  setEnableVulnerabilityScanning,
}) => {
  return (
    <>
      <div className="flex items-center space-x-3">
        <Switch
          id="osDetection"
          checked={enableOS}
          onCheckedChange={setEnableOS}
        />
        <Label
          htmlFor="osDetection"
          className="text-sm font-semibold text-gray-400"
        >
          OS Detection
        </Label>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          id="serviceDetection"
          checked={enableServiceDetection}
          onCheckedChange={setEnableServiceDetection}
        />
        <Label
          htmlFor="serviceDetection"
          className="text-sm font-semibold text-gray-400"
        >
          Service Detection
        </Label>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          id="versionDetection"
          checked={enableVersionDetection}
          onCheckedChange={setEnableVersionDetection}
        />
        <Label
          htmlFor="versionDetection"
          className="text-sm font-semibold text-gray-400"
        >
          Version Detection
        </Label>
      </div>

      <div className="flex items-center space-x-3">
        <Switch
          id="vulnScan"
          checked={enableVulnerabilityScanning}
          onCheckedChange={setEnableVulnerabilityScanning}
        />
        <Label
          htmlFor="vulnScan"
          className="text-sm font-semibold text-gray-400"
        >
          Vulnerability Scanning
        </Label>
      </div>
    </>
  );
};

export default ScanTypesTab; 
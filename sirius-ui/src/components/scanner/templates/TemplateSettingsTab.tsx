import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { Slider } from "~/components/lib/ui/slider";
import { Checkbox } from "~/components/lib/ui/checkbox";
import { Save } from "lucide-react";

const TemplateSettingsTab: React.FC = () => {
  // Port settings
  const [portRange, setPortRange] = useState("1-65535");
  const [excludePorts, setExcludePorts] = useState("");

  // Scan settings
  const [maxRetries, setMaxRetries] = useState(3);
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [parallelScanning, setParallelScanning] = useState(true);

  // Scan types
  const [scanTypes, setScanTypes] = useState({
    syn: true,
    connect: false,
    udp: false,
    serviceVersion: true,
    osDetection: false,
  });

  const handleToggleScanType = (type: keyof typeof scanTypes) => {
    setScanTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSave = () => {
    const settings = {
      portRange,
      excludePorts,
      maxRetries,
      aggressiveMode,
      parallelScanning,
      scanTypes,
    };
    console.log("Saving template settings:", settings);
    // TODO: Save to backend via TRPC
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-md font-medium text-white">
          Default Template Settings
        </h4>
        <p className="text-sm text-gray-400">
          Configure default scan options for new templates
        </p>
      </div>

      {/* Port Configuration */}
      <div className="space-y-4 rounded-md border border-gray-700 bg-gray-800/20 p-4">
        <h5 className="text-sm font-semibold text-white">Port Configuration</h5>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="portRange" className="text-gray-400">
              Port Range
            </Label>
            <Input
              id="portRange"
              value={portRange}
              onChange={(e) => setPortRange(e.target.value)}
              placeholder="e.g., 1-65535, 80,443"
              className="mt-1 border-gray-600 bg-gray-800/50 text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Specify port ranges or individual ports
            </p>
          </div>
          <div>
            <Label htmlFor="excludePorts" className="text-gray-400">
              Exclude Ports
            </Label>
            <Input
              id="excludePorts"
              value={excludePorts}
              onChange={(e) => setExcludePorts(e.target.value)}
              placeholder="e.g., 22,445"
              className="mt-1 border-gray-600 bg-gray-800/50 text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              Ports to exclude from scanning
            </p>
          </div>
        </div>
      </div>

      {/* Scan Configuration */}
      <div className="space-y-4 rounded-md border border-gray-700 bg-gray-800/20 p-4">
        <h5 className="text-sm font-semibold text-white">Scan Configuration</h5>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="maxRetries" className="text-gray-400">
              Max Retries: {maxRetries}
            </Label>
          </div>
          <Slider
            id="maxRetries"
            min={0}
            max={10}
            step={1}
            value={[maxRetries]}
            onValueChange={(value) => setMaxRetries(value[0]!)}
            className="mt-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            Number of retry attempts for failed connections
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="aggressiveMode" className="text-gray-400">
              Aggressive Mode
            </Label>
            <p className="text-xs text-gray-500">
              Enable aggressive timing and detection
            </p>
          </div>
          <Switch
            id="aggressiveMode"
            checked={aggressiveMode}
            onCheckedChange={setAggressiveMode}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="parallelScanning" className="text-gray-400">
              Parallel Scanning
            </Label>
            <p className="text-xs text-gray-500">
              Scan multiple hosts simultaneously
            </p>
          </div>
          <Switch
            id="parallelScanning"
            checked={parallelScanning}
            onCheckedChange={setParallelScanning}
          />
        </div>
      </div>

      {/* Scan Types */}
      <div className="space-y-4 rounded-md border border-gray-700 bg-gray-800/20 p-4">
        <h5 className="text-sm font-semibold text-white">Scan Types</h5>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="synScan"
              checked={scanTypes.syn}
              onCheckedChange={() => handleToggleScanType("syn")}
            />
            <div>
              <Label htmlFor="synScan" className="text-gray-400">
                SYN Scan
              </Label>
              <p className="text-xs text-gray-500">
                Stealthy TCP half-open scanning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="connectScan"
              checked={scanTypes.connect}
              onCheckedChange={() => handleToggleScanType("connect")}
            />
            <div>
              <Label htmlFor="connectScan" className="text-gray-400">
                Connect Scan
              </Label>
              <p className="text-xs text-gray-500">
                Full TCP connection scanning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="udpScan"
              checked={scanTypes.udp}
              onCheckedChange={() => handleToggleScanType("udp")}
            />
            <div>
              <Label htmlFor="udpScan" className="text-gray-400">
                UDP Scan
              </Label>
              <p className="text-xs text-gray-500">Scan for open UDP ports</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="serviceVersion"
              checked={scanTypes.serviceVersion}
              onCheckedChange={() => handleToggleScanType("serviceVersion")}
            />
            <div>
              <Label htmlFor="serviceVersion" className="text-gray-400">
                Service Version Detection
              </Label>
              <p className="text-xs text-gray-500">
                Identify service versions on open ports
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="osDetection"
              checked={scanTypes.osDetection}
              onCheckedChange={() => handleToggleScanType("osDetection")}
            />
            <div>
              <Label htmlFor="osDetection" className="text-gray-400">
                OS Detection
              </Label>
              <p className="text-xs text-gray-500">
                Attempt to identify operating system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end border-t border-gray-700 pt-4">
        <Button
          onClick={handleSave}
          
        >
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default TemplateSettingsTab;

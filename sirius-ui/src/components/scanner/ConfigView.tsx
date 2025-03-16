import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { Switch } from "~/components/lib/ui/switch";
import { Label } from "~/components/lib/ui/label";
import { Input } from "~/components/lib/ui/input";
import { Slider } from "~/components/lib/ui/slider";

interface ConfigViewProps {
  // Props if needed
}

const ConfigView: React.FC<ConfigViewProps> = () => {
  const [portRange, setPortRange] = useState("1-1024");
  const [maxRetries, setMaxRetries] = useState(3);
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [aggressiveMode, setAggressiveMode] = useState(false);
  const [parallelScans, setParallelScans] = useState(true);
  const [excludePorts, setExcludePorts] = useState("22,3389");
  
  const handleSaveConfig = () => {
    // Save configuration logic
    console.log("Saving configuration:", {
      portRange,
      maxRetries,
      timeoutSeconds,
      aggressiveMode,
      parallelScans,
      excludePorts
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-extralight text-white">
        Scanner Configuration
      </h2>
      
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label 
              htmlFor="portRange" 
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Port Range
            </Label>
            <Input
              id="portRange"
              type="text"
              className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
              placeholder="e.g., 1-1024, 8080, 9000-9100"
              value={portRange}
              onChange={(e) => setPortRange(e.target.value)}
            />
            <span className="mt-1 text-xs text-gray-500">
              Comma-separated list of ports or port ranges to scan
            </span>
          </div>
          
          <div>
            <Label 
              htmlFor="excludePorts" 
              className="mb-2 block text-sm font-semibold text-gray-400"
            >
              Exclude Ports
            </Label>
            <Input
              id="excludePorts"
              type="text"
              className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
              placeholder="e.g., 22,3389"
              value={excludePorts}
              onChange={(e) => setExcludePorts(e.target.value)}
            />
            <span className="mt-1 text-xs text-gray-500">
              Comma-separated list of ports to exclude from scan
            </span>
          </div>
        </div>
        
        <div>
          <Label 
            htmlFor="maxRetries" 
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            Max Retries: {maxRetries}
          </Label>
          <Slider
            id="maxRetries"
            defaultValue={[maxRetries]}
            max={10}
            min={1}
            step={1}
            onValueChange={(value) => setMaxRetries(value[0])}
            className="w-full"
          />
        </div>
        
        <div>
          <Label 
            htmlFor="timeout" 
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            Timeout (seconds): {timeoutSeconds}
          </Label>
          <Slider
            id="timeout"
            defaultValue={[timeoutSeconds]}
            max={120}
            min={5}
            step={5}
            onValueChange={(value) => setTimeoutSeconds(value[0])}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <Switch
            id="aggressiveMode"
            checked={aggressiveMode}
            onCheckedChange={setAggressiveMode}
          />
          <Label 
            htmlFor="aggressiveMode" 
            className="text-sm font-semibold text-gray-400"
          >
            Aggressive Scan Mode
          </Label>
          <span className="text-xs text-gray-500">
            (More accurate but noisier and slower)
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <Switch
            id="parallelScans"
            checked={parallelScans}
            onCheckedChange={setParallelScans}
          />
          <Label 
            htmlFor="parallelScans" 
            className="text-sm font-semibold text-gray-400"
          >
            Enable Parallel Scanning
          </Label>
          <span className="text-xs text-gray-500">
            (Faster but more resource intensive)
          </span>
        </div>
        
        <Button 
          onClick={handleSaveConfig}
          className="mt-4 rounded-md bg-violet-600/20 px-4 py-2 text-white transition-colors hover:bg-violet-600/30"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default ConfigView; 
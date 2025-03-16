import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Input } from "~/components/lib/ui/input";
import { Slider } from "~/components/lib/ui/slider";

interface RustScanScannerSettingsProps {
  rustScanBatchSize: number;
  setRustScanBatchSize: (value: number) => void;
  rustScanTimeout: number;
  setRustScanTimeout: (value: number) => void;
  rustScanTries: number;
  setRustScanTries: (value: number) => void;
  rustScanCommand: string;
  setRustScanCommand: (value: string) => void;
}

const RustScanScannerSettings: React.FC<RustScanScannerSettingsProps> = ({
  rustScanBatchSize,
  setRustScanBatchSize,
  rustScanTimeout,
  setRustScanTimeout,
  rustScanTries,
  setRustScanTries,
  rustScanCommand,
  setRustScanCommand,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">RustScan Settings</h3>
      
      <div className="space-y-4">
        <div>
          <Label
            htmlFor="rustScanBatchSize"
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            Batch Size: {rustScanBatchSize}
          </Label>
          <Slider
            id="rustScanBatchSize"
            defaultValue={[rustScanBatchSize]}
            max={65535}
            min={1}
            step={100}
            onValueChange={(value) => setRustScanBatchSize(value[0] || rustScanBatchSize)}
            className="w-full"
          />
          <span className="mt-1 text-xs text-gray-500">
            Number of ports scanned concurrently
          </span>
        </div>
        
        <div>
          <Label
            htmlFor="rustScanTimeout"
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            Timeout (ms): {rustScanTimeout}
          </Label>
          <Slider
            id="rustScanTimeout"
            defaultValue={[rustScanTimeout]}
            max={10000}
            min={1}
            step={100}
            onValueChange={(value) => setRustScanTimeout(value[0] || rustScanTimeout)}
            className="w-full"
          />
        </div>
        
        <div>
          <Label
            htmlFor="rustScanTries"
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            Tries: {rustScanTries}
          </Label>
          <Slider
            id="rustScanTries"
            defaultValue={[rustScanTries]}
            max={10}
            min={1}
            step={1}
            onValueChange={(value) => setRustScanTries(value[0] || rustScanTries)}
            className="w-full"
          />
          <span className="mt-1 text-xs text-gray-500">
            Number of retries on timeout
          </span>
        </div>
        
        <div>
          <Label
            htmlFor="rustScanCommand"
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            NMAP Command
          </Label>
          <Input
            id="rustScanCommand"
            className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
            placeholder="-sV -sC -A"
            value={rustScanCommand}
            onChange={(e) => setRustScanCommand(e.target.value)}
          />
          <span className="mt-1 text-xs text-gray-500">
            NMAP command passed to RustScan
          </span>
        </div>
      </div>
    </div>
  );
};

export default RustScanScannerSettings; 
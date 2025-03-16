import React, { useState, useCallback } from "react";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { Input } from "~/components/lib/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import { cn } from "~/components/lib/utils";

interface NmapSettingsTabProps {
  nmapTiming: string;
  setNmapTiming: (value: string) => void;
  nmapFragmentation: boolean;
  setNmapFragmentation: (value: boolean) => void;
  nmapFastScan: boolean;
  setNmapFastScan: (value: boolean) => void;
  nmapIPv6Scan: boolean;
  setNmapIPv6Scan: (value: boolean) => void;
  nmapExtraArgs: string;
  setNmapExtraArgs: (value: string) => void;
}

export const NmapSettingsTab: React.FC<NmapSettingsTabProps> = ({
  nmapTiming,
  setNmapTiming,
  nmapFragmentation,
  setNmapFragmentation,
  nmapFastScan,
  setNmapFastScan,
  nmapIPv6Scan,
  setNmapIPv6Scan,
  nmapExtraArgs,
  setNmapExtraArgs,
}) => {
  const [siriusSmartScan, setSiriusSmartScan] = useState(false);
  const [portsOption, setPortsOption] = useState("top1000");
  const [customPorts, setCustomPorts] = useState("");

  const getPortsString = useCallback(() => {
    switch (portsOption) {
      case "top20":
        return "-p 21,22,23,25,53,80,110,111,135,139,143,443,445,993,995,1723,3306,3389,5900,8080";
      case "top1000":
        return "--top-ports 1000";
      case "web":
        return "-p 80,443,8080,8443,3000,8000,8008,8800";
      case "db":
        return "-p 1433,3306,5432,6379,27017,9200,5984";
      case "shares":
        return "-p 135,137,138,139,445";
      case "custom":
        return customPorts ? `-p ${customPorts}` : "";
      default:
        return "";
    }
  }, [portsOption, customPorts]);

  // Generate NMAP command string based on settings
  const commandString = siriusSmartScan
    ? "nmap [target]"
    : `nmap -T${nmapTiming} ${nmapFragmentation ? "-f " : ""}${
        nmapFastScan ? "-F " : ""
      }${
        nmapIPv6Scan ? "-6 " : ""
      }${getPortsString()} ${nmapExtraArgs} [target]`;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Switch
          id="siriusSmartScan"
          checked={true}
          onCheckedChange={setSiriusSmartScan}
        />
        <Label
          htmlFor="siriusSmartScan"
          className="text-sm font-semibold text-gray-400"
        >
          Sirius Smart Scan
        </Label>
        <span className="text-xs text-gray-500">
          (Sirius intelligently selects vulnerability modules)
        </span>
      </div>

      <div>
        <Label
          htmlFor="commandString"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Command String
        </Label>
        <Input
          id="commandString"
          className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 font-mono text-white"
          value={commandString}
          readOnly
          disabled={true}
        />
      </div>

      <div>
        <Label
          htmlFor="nmapTiming"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Timing Template (-T)
        </Label>
        <Select
          value={nmapTiming}
          onValueChange={setNmapTiming}
          disabled={true}
        >
          <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
            <SelectValue placeholder="Select timing template" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="0">T0 (Paranoid)</SelectItem>
            <SelectItem value="1">T1 (Sneaky)</SelectItem>
            <SelectItem value="2">T2 (Polite)</SelectItem>
            <SelectItem value="3">T3 (Normal)</SelectItem>
            <SelectItem value="4">T4 (Aggressive)</SelectItem>
            <SelectItem value="5">T5 (Insane)</SelectItem>
          </SelectContent>
        </Select>
        <span className="mt-1 text-xs text-gray-500">
          Higher values are faster but noisier
        </span>
      </div>

      <div>
        <Label
          htmlFor="portsOption"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Ports Selection
        </Label>
        <Select
          value={portsOption}
          onValueChange={setPortsOption}
          disabled={true}
        >
          <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
            <SelectValue placeholder="Select ports" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="top20">Top 20</SelectItem>
            <SelectItem value="top1000">Top 1,000</SelectItem>
            <SelectItem value="web">Web Ports</SelectItem>
            <SelectItem value="db">Database Ports</SelectItem>
            <SelectItem value="shares">File Sharing Ports</SelectItem>
            <SelectItem value="custom">Custom Ports</SelectItem>
          </SelectContent>
        </Select>
        {portsOption === "custom" && (
          <div className="mt-2">
            <Input
              id="customPorts"
              className={cn(
                "w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white",
                siriusSmartScan ? "opacity-50" : ""
              )}
              placeholder="e.g., 80,443,8080-8090"
              value={customPorts}
              onChange={(e) => setCustomPorts(e.target.value)}
              disabled={true}
            />
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="nmapFragmentation"
            className="text-sm font-semibold text-gray-400"
          >
            Packet Fragmentation (-f)
          </Label>
          <Switch
            id="nmapFragmentation"
            checked={nmapFragmentation}
            onCheckedChange={setNmapFragmentation}
            disabled={true}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="nmapFastScan"
            className="text-sm font-semibold text-gray-400"
          >
            Fast Scan (-F)
          </Label>
          <Switch
            id="nmapFastScan"
            checked={nmapFastScan}
            onCheckedChange={setNmapFastScan}
            disabled={true}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="nmapIPv6Scan"
            className="text-sm font-semibold text-gray-400"
          >
            IPv6 Scan (-6)
          </Label>
          <Switch
            id="nmapIPv6Scan"
            checked={nmapIPv6Scan}
            onCheckedChange={setNmapIPv6Scan}
            disabled={true}
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="nmapExtraArgs"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Extra Arguments
        </Label>
        <Input
          id="nmapExtraArgs"
          className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white"
          placeholder="-sV -sC -A --script vuln"
          value={nmapExtraArgs}
          onChange={(e) => setNmapExtraArgs(e.target.value)}
          disabled={true}
        />
        <span className="mt-1 text-xs text-gray-500">
          Additional NMAP arguments
        </span>
      </div>
    </div>
  );
};

export default NmapSettingsTab;

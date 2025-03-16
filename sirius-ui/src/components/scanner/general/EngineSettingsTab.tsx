import React from "react";
import { Label } from "~/components/lib/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";

interface EngineSettingsTabProps {
  scanEngine: string;
  setScanEngine: (value: string) => void;
  scanPriority: string;
  setScanPriority: (value: string) => void;
  reportFormat: string;
  setReportFormat: (value: string) => void;
}

const EngineSettingsTab: React.FC<EngineSettingsTabProps> = ({
  scanEngine,
  setScanEngine,
  scanPriority,
  setScanPriority,
  reportFormat,
  setReportFormat,
}) => {
  return (
    <>
      <div>
        <Label
          htmlFor="scanEngine"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Scan Engine
        </Label>
        <Select value={scanEngine} onValueChange={setScanEngine}>
          <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
            <SelectValue placeholder="Select a scan engine" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="nmap">Nmap</SelectItem>
            <SelectItem value="rustscan">RustScan</SelectItem>
            <SelectItem value="nuclei">Nuclei</SelectItem>
            <SelectItem value="hybrid">
              Hybrid (Multiple engines)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="scanPriority"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Scan Priority
        </Label>
        <Select value={scanPriority} onValueChange={setScanPriority}>
          <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
            <SelectValue placeholder="Select priority level" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="1">Highest</SelectItem>
            <SelectItem value="2">High</SelectItem>
            <SelectItem value="3">Normal</SelectItem>
            <SelectItem value="4">Low</SelectItem>
            <SelectItem value="5">Lowest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="reportFormat"
          className="mb-2 block text-sm font-semibold text-gray-400"
        >
          Report Format
        </Label>
        <Select value={reportFormat} onValueChange={setReportFormat}>
          <SelectTrigger className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white">
            <SelectValue placeholder="Select report format" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-white">
            <SelectItem value="json">JSON</SelectItem>
            <SelectItem value="xml">XML</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default EngineSettingsTab; 
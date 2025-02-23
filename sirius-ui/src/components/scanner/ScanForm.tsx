// src/components/scanner/ScanForm.tsx
import React, { useCallback, useState } from "react";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { TemplatePicker } from "./TemplatePicker";
import { type ScanTemplate } from "~/types/scanTypes";

interface ScanFormProps {
  targetList: string[];
  addTarget: (newTarget: string) => void;
  removeTarget: (target: string) => void;
  startScan: () => void;
  selectedTemplate: ScanTemplate;
  setSelectedTemplate: (template: ScanTemplate) => void;
}

const ScanForm: React.FC<ScanFormProps> = ({
  targetList,
  addTarget,
  removeTarget,
  startScan,
  selectedTemplate,
  setSelectedTemplate,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateInput = (value: string): boolean => {
    // CIDR validation
    const cidrPattern = /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (cidrPattern.test(value)) {
      const [ip, mask] = value.split('/');
      if (!mask || parseInt(mask) < 0 || parseInt(mask) > 32) {
        setError("Invalid CIDR mask (must be between 0 and 32)");
        return false;
      }
      return true;
    }

    // IP Range validation
    const ipRangePattern = /^(?:\d{1,3}\.){3}\d{1,3}-(?:\d{1,3}\.){3}\d{1,3}$/;
    if (ipRangePattern.test(value)) {
      return true;
    }

    // Single IP validation
    const singleIpPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;
    if (singleIpPattern.test(value)) {
      const parts = value.split('.');
      const valid = parts.every(part => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
      });
      if (!valid) {
        setError("Invalid IP address");
        return false;
      }
      return true;
    }

    // DNS name validation
    const dnsPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (dnsPattern.test(value)) {
      return true;
    }

    setError("Invalid target format");
    return false;
  };

  const handleAddTarget = useCallback(() => {
    setError(null);
    if (inputValue.trim() && validateInput(inputValue.trim())) {
      addTarget(inputValue.trim());
      setInputValue("");
    }
  }, [addTarget, inputValue]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddTarget();
      }
    },
    [handleAddTarget]
  );

  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-violet-100">Add Target</label>
          <div className="flex">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter IP, Range, or CIDR"
              className={`h-12 w-72 max-w-md rounded-l-md rounded-r-none border-violet-100/30 bg-transparent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 ${error ? 'border-red-500' : ''}`}
            />
            <Button
              variant="outline"
              className="h-12 rounded-none border-r-0 border-violet-100/30 bg-violet-500"
              onClick={handleAddTarget}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-l-none rounded-r-md border-l-0 border-violet-100/30 bg-violet-500 text-violet-100"
              onClick={startScan}
            >
              Start Scan
            </Button>
          </div>
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
        </div>
        <TemplatePicker 
          value={selectedTemplate}
          onChange={setSelectedTemplate}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {targetList.map((target) => (
          <div
            key={target}
            className="flex items-center gap-2 rounded-md bg-violet-700/10 px-2 py-1"
          >
            <span className="text-sm font-mono text-violet-100">{target}</span>
            <button
              onClick={() => removeTarget(target)}
              className="text-violet-100 hover:text-violet-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Wrap in React.memo to avoid unnecessary re-renders.
export default React.memo(ScanForm);
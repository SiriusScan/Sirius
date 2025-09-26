import { useState } from "react";
import { Button } from "../lib/ui/button";
import { Input } from "../lib/ui/input";
import { type TargetType } from "~/hooks/useStartScan";

interface TargetInputProps {
  onAddTarget: (target: string) => void;
  targets: string[];
  onRemoveTarget: (target: string) => void;
}

export const TargetInput: React.FC<TargetInputProps> = ({
  onAddTarget,
  targets,
  onRemoveTarget,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateInput = (value: string): boolean => {
    // CIDR validation
    const cidrPattern = /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    if (cidrPattern.test(value)) {
      const [ip, mask] = value.split("/");
      if (!mask) {
        setError("Invalid CIDR format");
        return false;
      }
      const maskNum = parseInt(mask);
      if (maskNum < 0 || maskNum > 32) {
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
      const parts = value.split(".");
      const valid = parts.every((part) => {
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
    const dnsPattern =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (dnsPattern.test(value)) {
      return true;
    }

    setError("Invalid target format");
    return false;
  };

  const handleAddTarget = () => {
    setError(null);
    if (inputValue.trim() && validateInput(inputValue.trim())) {
      onAddTarget(inputValue.trim());
      setInputValue("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-violet-100">Targets</label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter IP, range, or CIDR"
          className={`bg-transparent text-violet-100 ${
            error ? "border-red-500" : ""
          }`}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAddTarget();
            }
          }}
        />
        <Button onClick={handleAddTarget}>Add</Button>
      </div>
      {error && <div className="text-sm text-red-500">{error}</div>}
      <div className="flex flex-wrap gap-2">
        {targets.map((target) => (
          <div
            key={target}
            className="flex items-center gap-2 rounded-md bg-violet-700/10 px-2 py-1"
          >
            <span className="text-sm text-violet-100">{target}</span>
            <button
              onClick={() => onRemoveTarget(target)}
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

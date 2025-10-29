import React, { useState } from "react";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { MinusCircle, Info } from "lucide-react";

interface TargetExclusionsProps {
  exclusions: string[];
  onExclusionsChange: (exclusions: string[]) => void;
}

const TargetExclusions: React.FC<TargetExclusionsProps> = ({
  exclusions,
  onExclusionsChange,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddExclusion = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Handle comma-separated values
    const newExclusions = trimmed
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e && !exclusions.includes(e));

    if (newExclusions.length > 0) {
      onExclusionsChange([...exclusions, ...newExclusions]);
      setInputValue("");
    }
  };

  const handleRemoveExclusion = (exclusion: string) => {
    onExclusionsChange(exclusions.filter((e) => e !== exclusion));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddExclusion();
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-violet-100/20 bg-gray-800/20 p-4">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400" />
        <div>
          <h4 className="text-sm font-medium text-white">Target Exclusions</h4>
          <p className="text-xs text-gray-400">
            Exclude specific IPs from expanded CIDR ranges or IP ranges. These
            will not be scanned.
          </p>
        </div>
      </div>

      {/* Input for adding exclusions */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter IPs to exclude (e.g., 192.168.1.1, 10.0.0.1)"
          className="flex-1 border-violet-100/30 bg-gray-800/20 text-violet-100 placeholder:text-gray-500"
        />
        <Button
          onClick={handleAddExclusion}
          disabled={!inputValue.trim()}
          size="sm"
          className="bg-violet-600 hover:bg-violet-500"
        >
          Add
        </Button>
      </div>

      {/* List of exclusions */}
      {exclusions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400">
            Excluded IPs ({exclusions.length}):
          </div>
          <div className="flex flex-wrap gap-2">
            {exclusions.map((exclusion) => (
              <Badge
                key={exclusion}
                variant="outline"
                className="flex items-center gap-1 border-red-500/30 bg-red-500/10 text-red-300"
              >
                <code className="font-mono text-xs">{exclusion}</code>
                <button
                  onClick={() => handleRemoveExclusion(exclusion)}
                  className="ml-1 hover:text-red-100"
                >
                  <MinusCircle className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onExclusionsChange([])}
            className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
          >
            Clear All Exclusions
          </Button>
        </div>
      )}

      {exclusions.length === 0 && (
        <div className="rounded bg-gray-900/30 p-3 text-center">
          <p className="text-xs text-gray-500">
            No exclusions set. All IPs in ranges will be scanned.
          </p>
        </div>
      )}
    </div>
  );
};

export default TargetExclusions;


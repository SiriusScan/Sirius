import React, { useState, useCallback, useEffect } from "react";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { type PatternProps } from "./types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileUp,
  Clipboard,
  Trash2,
  Server,
  Network,
  Globe,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { Textarea } from "~/components/lib/ui/textarea";
import { Badge } from "~/components/lib/ui/badge";

const SplitPanePattern: React.FC<PatternProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [targets, setTargets] = useState<ParsedTarget[]>(initialTargets);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<
    "all" | "valid" | "invalid" | "warnings"
  >("all");

  // Update parent when targets change
  useEffect(() => {
    onTargetsChange(targets);
  }, [targets, onTargetsChange]);

  // Parse and add targets
  const handleParse = useCallback(() => {
    if (!inputValue.trim()) return;

    const newTargets = parseTargets(inputValue);
    setTargets((prev) => {
      const existingValues = new Set(prev.map((t) => t.value));
      const uniqueNew = newTargets.filter((t) => !existingValues.has(t.value));
      return [...prev, ...uniqueNew];
    });
    setInputValue("");
  }, [inputValue]);

  // Paste from clipboard
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputValue((prev) => (prev ? prev + "\n" + text : text));
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  }, []);

  // Remove target
  const handleRemove = useCallback((id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Get filtered targets
  const filteredTargets = targets.filter((t) => {
    if (filter === "valid") return t.isValid && !t.warning;
    if (filter === "invalid") return !t.isValid;
    if (filter === "warnings") return t.warning !== undefined;
    return true;
  });

  // Get icon for target type
  const getTypeIcon = (type: string) => {
    if (type === "single_ip") return <Server className="h-3 w-3" />;
    if (type === "cidr" || type === "range")
      return <Network className="h-3 w-3" />;
    return <Globe className="h-3 w-3" />;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 shadow-lg">
        <label className="mb-2 block text-sm font-medium text-white">
          Pattern B: Split Pane with Action Bar
        </label>
        <p className="mb-3 text-xs text-gray-400">
          Input on left, validated list on right. Drag & drop zone included.
        </p>

        {/* Split Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Input */}
          <div className="space-y-2">
            <div className="rounded-lg border-2 border-dashed border-violet-500/30 bg-violet-500/5 p-4 text-center text-sm text-gray-400 transition hover:border-violet-500/50">
              Drag & drop CSV/TXT files here
            </div>

            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="192.168.1.1&#10;192.168.1.0/24&#10;scanme.example.com"
              className="min-h-[120px] border-violet-500/30 bg-gray-900/50 font-mono text-sm text-violet-100"
              rows={6}
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePaste}
                className="flex-1 border-violet-500/30 bg-violet-500/10 text-xs text-violet-200 hover:bg-violet-500/20"
              >
                <Clipboard className="mr-1.5 h-3 w-3" />
                Paste
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInputValue("")}
                className="flex-1 border-violet-500/30 bg-violet-500/10 text-xs text-violet-200 hover:bg-violet-500/20"
              >
                <Trash2 className="mr-1.5 h-3 w-3" />
                Clear
              </Button>
            </div>

            <Button
              onClick={handleParse}
              disabled={!inputValue.trim()}
              className="w-full text-sm disabled:opacity-50"
            >
              Add Targets
            </Button>
          </div>

          {/* Right: List */}
          <div className="flex flex-col space-y-2">
            {/* Filter Buttons */}
            <div className="flex gap-1">
              {(
                ["all", "valid", "invalid", "warnings"] as (
                  | "all"
                  | "valid"
                  | "invalid"
                  | "warnings"
                )[]
              ).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 rounded px-2 py-1 text-xs transition ${
                    filter === f
                      ? "bg-violet-500/20 text-violet-200"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Target Cards */}
            <div className="max-h-[220px] space-y-2 overflow-y-auto rounded-lg bg-gray-900/30 p-2">
              {filteredTargets.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No targets yet
                </div>
              ) : (
                filteredTargets.map((target) => (
                  <div
                    key={target.id}
                    className="flex items-center justify-between rounded border border-violet-500/20 bg-gray-800/40 p-2"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {target.isValid ? (
                        target.warning ? (
                          <AlertTriangle className="h-3 w-3 flex-shrink-0 text-yellow-500" />
                        ) : (
                          <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                        )
                      ) : (
                        <XCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
                      )}
                      {getTypeIcon(target.type)}
                      <span className="truncate font-mono text-xs text-white">
                        {target.value}
                      </span>
                      {target.hostCount && target.hostCount > 1 && (
                        <Badge className="bg-violet-500/20 text-xs text-violet-300">
                          {target.hostCount}
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(target.id)}
                      className="ml-2 rounded p-0.5 hover:bg-red-500/20"
                    >
                      <XCircle className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Summary Bar */}
        {targets.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs text-gray-300">
            <span>
              {targets.length} target{targets.length !== 1 ? "s" : ""}
            </span>
            <span>
              {targets.filter((t) => t.isValid).length} valid •{" "}
              {targets.filter((t) => !t.isValid).length} invalid
            </span>
            <span>
              {targets.reduce((sum, t) => sum + (t.hostCount || 1), 0)} total
              hosts
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitPanePattern;


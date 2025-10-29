import React, { useState, useCallback, useEffect } from "react";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { type PatternProps } from "./types";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";

const AccordionPattern: React.FC<PatternProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [targets, setTargets] = useState<ParsedTarget[]>(initialTargets);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Update parent when targets change
  useEffect(() => {
    onTargetsChange(targets);
  }, [targets, onTargetsChange]);

  // Add targets
  const handleAdd = useCallback(() => {
    if (!inputValue.trim()) return;
    const newTargets = parseTargets(inputValue);
    setTargets((prev) => {
      const existingValues = new Set(prev.map((t) => t.value));
      const uniqueNew = newTargets.filter((t) => !existingValues.has(t.value));
      return [...prev, ...uniqueNew];
    });
    setInputValue("");
    setIsExpanded(true); // Auto-expand after adding
  }, [inputValue]);

  // Remove target
  const handleRemove = useCallback((id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const validCount = targets.filter((t) => t.isValid && !t.warning).length;
  const invalidCount = targets.filter((t) => !t.isValid).length;
  const warningCount = targets.filter((t) => t.warning).length;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 shadow-lg">
        <label className="block p-4 pb-2 text-sm font-medium text-white">
          Pattern C: Accordion Progressive Disclosure
        </label>
        <p className="px-4 pb-3 text-xs text-gray-400">
          Collapsed by default, expands on interaction. Three-tier disclosure.
        </p>

        {/* Collapsed/Summary View */}
        {!isExpanded ? (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex w-full items-center justify-between rounded-b-xl border-t border-violet-500/20 bg-violet-500/5 p-4 transition hover:bg-violet-500/10"
          >
            <div className="flex items-center gap-3">
              <Plus className="h-5 w-5 text-violet-400" />
              <span className="text-sm font-medium text-white">
                Add Scan Targets
              </span>
            </div>

            {targets.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge className="bg-violet-500/20 text-xs text-violet-300">
                  {targets.length} target{targets.length !== 1 ? "s" : ""}
                </Badge>
                {invalidCount > 0 && (
                  <Badge className="bg-red-500/20 text-xs text-red-300">
                    {invalidCount} invalid
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge className="bg-yellow-500/20 text-xs text-yellow-300">
                    {warningCount} warning{warningCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
            )}
          </button>
        ) : (
          <div className="border-t border-violet-500/20 p-4">
            {/* Input Area */}
            <div className="mb-3 space-y-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder="192.168.1.1, 192.168.1.0/24, scanme.example.com..."
                className="w-full rounded-lg border border-violet-500/30 bg-gray-900/50 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
                >
                  Add Targets
                </Button>
                <Button
                  onClick={() => setIsExpanded(false)}
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  Collapse
                </Button>
              </div>
            </div>

            {/* Compact Tags View */}
            {targets.length > 0 && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 rounded-lg border border-violet-500/20 bg-gray-900/30 p-2">
                  {targets.map((target) => (
                    <div
                      key={target.id}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                        !target.isValid
                          ? "border border-red-500/50 bg-red-500/10 text-red-300"
                          : target.warning
                          ? "border border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
                          : "border border-green-500/50 bg-green-500/10 text-green-300"
                      }`}
                    >
                      {!target.isValid ? (
                        <XCircle className="h-3 w-3" />
                      ) : target.warning ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      <span className="font-mono">{target.value}</span>
                      <button
                        onClick={() => handleRemove(target.id)}
                        className="rounded hover:bg-white/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Toggle Detailed View */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 py-2 text-xs text-violet-300 transition hover:bg-violet-500/10"
                >
                  {showDetails ? (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-3 w-3" />
                      Show Details
                    </>
                  )}
                </button>

                {/* Detailed Panel */}
                {showDetails && (
                  <div className="space-y-2 rounded-lg border border-violet-500/20 bg-gray-900/50 p-3">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-medium text-white">
                        Target Details
                      </span>
                      <span className="text-gray-400">
                        {targets.reduce(
                          (sum, t) => sum + (t.hostCount || 1),
                          0
                        )}{" "}
                        total hosts
                      </span>
                    </div>
                    {targets.map((target) => (
                      <div
                        key={target.id}
                        className="rounded border border-violet-500/10 bg-gray-800/30 p-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {!target.isValid ? (
                                <XCircle className="h-3 w-3 text-red-500" />
                              ) : target.warning ? (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              ) : (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              )}
                              <code className="text-xs text-white">
                                {target.value}
                              </code>
                              <Badge className="bg-violet-500/20 text-xs text-violet-300">
                                {target.type.toUpperCase()}
                              </Badge>
                            </div>
                            {(target.error || target.warning) && (
                              <p className="mt-1 text-xs text-gray-400">
                                {target.error || target.warning}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemove(target.id)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccordionPattern;


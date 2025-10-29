import React, { useState, useCallback, useRef, useEffect } from "react";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { type PatternProps } from "./types";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import { Button } from "~/components/lib/ui/button";

const ChipInputPattern: React.FC<PatternProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [targets, setTargets] = useState<ParsedTarget[]>(initialTargets);
  const [inputValue, setInputValue] = useState("");
  const [focusedChipId, setFocusedChipId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update parent when targets change
  useEffect(() => {
    onTargetsChange(targets);
  }, [targets, onTargetsChange]);

  // Add target from input
  const handleAddTarget = useCallback(() => {
    if (!inputValue.trim()) return;

    const newTargets = parseTargets(inputValue);
    setTargets((prev) => {
      // Deduplicate
      const existingValues = new Set(prev.map((t) => t.value));
      const uniqueNew = newTargets.filter((t) => !existingValues.has(t.value));
      return [...prev, ...uniqueNew];
    });
    setInputValue("");
  }, [inputValue]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        handleAddTarget();
      } else if (e.key === "Backspace" && !inputValue && targets.length > 0) {
        // Remove last target on backspace when input is empty
        setTargets((prev) => prev.slice(0, -1));
      }
    },
    [handleAddTarget, inputValue, targets.length]
  );

  // Remove specific target
  const handleRemoveTarget = useCallback((id: string) => {
    setTargets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Get status icon for chip
  const getStatusIcon = (target: ParsedTarget) => {
    if (!target.isValid) {
      return <XCircle className="h-3 w-3 text-red-500" />;
    }
    if (target.warning) {
      return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    }
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  };

  // Get chip border color based on validation
  const getChipClasses = (target: ParsedTarget) => {
    const base =
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm transition-all m-1";
    if (!target.isValid) {
      return `${base} bg-red-500/10 border border-red-500/50 text-red-300`;
    }
    if (target.warning) {
      return `${base} bg-yellow-500/10 border border-yellow-500/50 text-yellow-300`;
    }
    return `${base} bg-green-500/10 border border-green-500/50 text-green-300`;
  };

  return (
    <div className="space-y-3">
      {/* Input Area */}
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 shadow-lg">
        <label className="mb-2 block text-sm font-medium text-white">
          Pattern A: Email-Style Chip Input
        </label>
        <p className="mb-3 text-xs text-gray-400">
          Type targets and press Enter or comma to create chips. Click X to
          remove.
        </p>

        {/* Chips Container with Input */}
        <div
          className="flex min-h-[48px] flex-wrap items-center gap-1 rounded-lg border border-violet-500/30 bg-gray-900/50 p-2"
          onClick={() => inputRef.current?.focus()}
        >
          {targets.map((target) => (
            <div
              key={target.id}
              className={getChipClasses(target)}
              title={
                target.error || target.warning || `${target.hostCount} hosts`
              }
            >
              {getStatusIcon(target)}
              <span className="font-mono text-xs">{target.value}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTarget(target.id);
                }}
                className="ml-1 rounded hover:bg-white/10"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Inline Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAddTarget}
            placeholder={
              targets.length === 0 ? "192.168.1.1, 10.0.0.0/24, ..." : ""
            }
            className="min-w-[200px] flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="mt-2 text-xs text-gray-500">
          {targets.length} target{targets.length !== 1 ? "s" : ""} •{" "}
          {targets.reduce((sum, t) => sum + (t.hostCount || 1), 0)} hosts
        </div>
      </div>

      {/* Clear All Button */}
      {targets.length > 0 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setTargets([])}
            className="text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChipInputPattern;


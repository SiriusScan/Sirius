import React, { useState, useCallback, useRef, useEffect } from "react";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { type PatternProps } from "./types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  FileUp,
  Upload,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";

const ChipTargetInput: React.FC<PatternProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [targets, setTargets] = useState<ParsedTarget[]>(initialTargets);
  const [inputValue, setInputValue] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initializedFromProps, setInitializedFromProps] = useState(false);

  // Sync with initialTargets when they change (e.g., from URL params)
  useEffect(() => {
    if (initialTargets.length > 0 && !initializedFromProps) {
      setTargets((prev) => {
        // Merge initial targets with any existing targets, avoiding duplicates
        const existingValues = new Set(prev.map((t) => t.value));
        const newTargets = initialTargets.filter((t) => !existingValues.has(t.value));
        return [...prev, ...newTargets];
      });
      setInitializedFromProps(true);
    }
  }, [initialTargets, initializedFromProps]);

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

  // Handle file import
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const newTargets = parseTargets(text);
          setTargets((prev) => {
            const existingValues = new Set(prev.map((t) => t.value));
            const uniqueNew = newTargets.filter(
              (t) => !existingValues.has(t.value)
            );
            return [...prev, ...uniqueNew];
          });
        };
        reader.readAsText(file);
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    []
  );

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newTargets = parseTargets(text);
        setTargets((prev) => {
          const existingValues = new Set(prev.map((t) => t.value));
          const uniqueNew = newTargets.filter(
            (t) => !existingValues.has(t.value)
          );
          return [...prev, ...uniqueNew];
        });
      };
      reader.readAsText(file);
    });
  }, []);

  // Get status icon for chip
  const getStatusIcon = (target: ParsedTarget) => {
    if (!target.isValid) {
      return <XCircle className="h-3 w-3 text-red-400" />;
    }
    if (target.warning) {
      return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
    }
    return <CheckCircle className="h-3 w-3 text-green-400" />;
  };

  // Get chip border color based on validation
  const getChipClasses = (target: ParsedTarget) => {
    const base =
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all m-1 font-mono";
    if (!target.isValid) {
      return `${base} bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20`;
    }
    if (target.warning) {
      return `${base} bg-yellow-500/10 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/20`;
    }
    return `${base} bg-green-500/10 border border-green-500/40 text-green-300 hover:bg-green-500/20`;
  };

  const validCount = targets.filter(
    (t) => t.isValid && !t.warning?.includes("Duplicate")
  ).length;
  const totalHosts = targets.reduce((sum, t) => sum + (t.hostCount || 1), 0);

  return (
    <div className="space-y-3">
      {/* Main Input Area */}
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-5 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">Scan Targets</h3>
            <p className="text-xs text-gray-400">
              Add IP addresses, CIDR ranges, IP ranges, or domain names
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 border-violet-500/30 bg-violet-500/10 text-xs text-violet-200 hover:bg-violet-500/20"
            >
              <FileUp className="mr-1.5 h-3.5 w-3.5" />
              Import File
            </Button>
          </div>
        </div>

        {/* Chips Container with Input and Drag-Drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex min-h-[56px] flex-wrap items-center gap-1 rounded-lg border p-3 transition-all ${
            isDragging
              ? "border-violet-500 bg-violet-500/10"
              : "border-violet-500/30 bg-gray-900/50"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Drag overlay */}
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-violet-500/20 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2 text-violet-300">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">
                  Drop files to import targets
                </span>
              </div>
            </div>
          )}

          {targets.map((target) => (
            <div
              key={target.id}
              className={getChipClasses(target)}
              title={
                target.error ||
                target.warning ||
                `${target.type.toUpperCase()}: ${target.hostCount || 1} host${
                  (target.hostCount || 1) > 1 ? "s" : ""
                }`
              }
            >
              {getStatusIcon(target)}
              <span className="text-xs">{target.value}</span>
              {target.hostCount && target.hostCount > 1 && (
                <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-xs text-white/80">
                  {target.hostCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTarget(target.id);
                }}
                className="ml-1 rounded p-0.5 hover:bg-white/10"
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
              targets.length === 0
                ? "Type or paste targets (192.168.1.1, 10.0.0.0/24, scanme.nmap.org...)"
                : "Add more..."
            }
            className="min-w-[240px] flex-1 bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {/* Stats and Actions */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-gray-400">
            {targets.length > 0 && (
              <>
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  {validCount} valid
                </span>
                <span className="text-violet-400">•</span>
                <span>{totalHosts.toLocaleString()} total hosts</span>
              </>
            )}
            {targets.length === 0 && (
              <span className="text-gray-500">
                No targets yet. Type, paste, or drop files to begin.
              </span>
            )}
          </div>
          {targets.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setTargets([])}
              className="h-6 px-2 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 p-3 text-xs text-violet-300">
        <strong>Tip:</strong> Press{" "}
        <kbd className="rounded bg-violet-500/20 px-1.5 py-0.5">Enter</kbd> or{" "}
        <kbd className="rounded bg-violet-500/20 px-1.5 py-0.5">comma</kbd> to
        add targets. Drag & drop CSV/TXT files, or paste multiple targets at
        once.
      </div>
    </div>
  );
};

export { ChipTargetInput };
export default ChipTargetInput;

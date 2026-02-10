import React, { useState, useCallback, useEffect } from "react";
import { Textarea } from "~/components/lib/ui/textarea";
import { Button } from "~/components/lib/ui/button";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import ParsedTargetList from "./ParsedTargetList";
import TargetSummary from "./TargetSummary";
import TargetExclusions from "./TargetExclusions";
import TargetImportExportDialog from "./TargetImportExportDialog";
import SavedTargetListsDialog from "./SavedTargetListsDialog";
import { FileUp, Star, Plus, RefreshCw, Trash2 } from "lucide-react";

interface TargetInputPanelProps {
  onTargetsChange: (targets: ParsedTarget[]) => void;
  initialTargets?: ParsedTarget[];
}

const TargetInputPanel: React.FC<TargetInputPanelProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [inputValue, setInputValue] = useState("");
  const [parsedTargets, setParsedTargets] =
    useState<ParsedTarget[]>(initialTargets);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [showExclusions, setShowExclusions] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showSavedLists, setShowSavedLists] = useState(false);

  // Parse input on blur or explicit trigger
  const handleParse = useCallback(() => {
    if (!inputValue.trim()) return;

    const newTargets = parseTargets(inputValue);
    setParsedTargets((prev) => [...prev, ...newTargets]);
    setInputValue("");
  }, [inputValue]);

  // Handle paste event for bulk import
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");

    // If pasting multiple lines, parse immediately
    if (pastedText.includes("\n")) {
      e.preventDefault();
      const newTargets = parseTargets(pastedText);
      setParsedTargets((prev) => [...prev, ...newTargets]);
    }
  }, []);

  // Handle key down for quick actions
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Ctrl/Cmd + Enter to parse
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleParse();
      }
    },
    [handleParse]
  );

  // Remove a specific target
  const handleRemoveTarget = useCallback((targetId: string) => {
    setParsedTargets((prev) => prev.filter((t) => t.id !== targetId));
  }, []);

  // Clear all targets
  const handleClearAll = useCallback(() => {
    setParsedTargets([]);
    setInputValue("");
  }, []);

  // Validate all targets
  const handleValidateAll = useCallback(() => {
    // Re-parse all targets to refresh validation
    const allRaw = parsedTargets.map((t) => t.raw).join("\n");
    const revalidated = parseTargets(allRaw);
    setParsedTargets(revalidated);
  }, [parsedTargets]);

  // Handle import from dialog
  const handleImportTargets = useCallback((imported: ParsedTarget[]) => {
    setParsedTargets((prev) => [...prev, ...imported]);
  }, []);

  // Handle loading saved list
  const handleLoadSavedList = useCallback((targets: ParsedTarget[]) => {
    setParsedTargets(targets);
  }, []);

  // Notify parent of changes
  useEffect(() => {
    onTargetsChange(parsedTargets);
  }, [parsedTargets, onTargetsChange]);

  const validTargets = parsedTargets.filter(
    (t) => t.isValid && !t.warning?.includes("Duplicate")
  );
  const characterCount = inputValue.length;

  return (
    <div className="space-y-6">
      {/* Quick Actions Bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportExport(true)}
            className="h-8 border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
          >
            <FileUp className="mr-1.5 h-3.5 w-3.5" />
            Import File
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSavedLists(true)}
            className="h-8 border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
          >
            <Star className="mr-1.5 h-3.5 w-3.5" />
            Saved Lists
          </Button>
          {parsedTargets.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExclusions(!showExclusions)}
              className="h-8 border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            >
              {showExclusions ? "Hide" : "Show"} Exclusions
            </Button>
          )}
        </div>
      </div>

      {/* Main Input Card */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="mb-1 text-lg font-semibold text-white">
            Add Scan Targets
          </h3>
          <p className="text-sm text-gray-400">
            Paste or type IP addresses, CIDR ranges, IP ranges, or domain names
          </p>
        </div>

        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleParse}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder="192.168.1.1
192.168.1.0/24
192.168.1.1-192.168.1.50
scanme.example.com

One target per line, or comma-separated. Press Ctrl+Enter to add."
          className="min-h-[140px] w-full rounded-lg border border-violet-500/30 bg-gray-900/50 p-4 font-mono text-sm text-violet-100 placeholder:text-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
          rows={6}
        />

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {characterCount > 0
              ? `${characterCount} characters`
              : "Ready for input"}
          </span>
          <div className="flex gap-2">
            {inputValue.trim() && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setInputValue("")}
                className="h-8 text-xs text-gray-400 hover:text-white"
              >
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleParse}
              disabled={!inputValue.trim()}
              className="h-8 px-4 text-xs font-medium disabled:opacity-50"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Targets
            </Button>
          </div>
        </div>
      </div>

      {/* Exclusions Panel (conditionally shown) */}
      {showExclusions && (
        <TargetExclusions
          exclusions={exclusions}
          onExclusionsChange={setExclusions}
        />
      )}

      {/* Parsed Target List */}
      {parsedTargets.length > 0 && (
        <div className="space-y-4">
          {/* Summary Stats Card */}
          <TargetSummary targets={parsedTargets} />

          {/* Target List Card */}
          <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="text-base font-semibold text-white">
                  Target List
                </h4>
                <p className="text-sm text-gray-400">
                  {validTargets.length} valid target
                  {validTargets.length !== 1 ? "s" : ""} ready to scan
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleValidateAll}
                  className="h-8 text-xs text-violet-300 hover:bg-violet-500/10 hover:text-violet-200"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Revalidate
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearAll}
                  className="h-8 text-xs text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Clear All
                </Button>
              </div>
            </div>

            <ParsedTargetList
              targets={parsedTargets}
              onRemoveTarget={handleRemoveTarget}
              exclusions={exclusions}
            />
          </div>
        </div>
      )}

      {/* Dialogs */}
      <TargetImportExportDialog
        isOpen={showImportExport}
        onClose={() => setShowImportExport(false)}
        onImport={handleImportTargets}
        currentTargets={parsedTargets}
      />

      <SavedTargetListsDialog
        isOpen={showSavedLists}
        onClose={() => setShowSavedLists(false)}
        onLoadList={handleLoadSavedList}
        currentTargets={parsedTargets}
      />
    </div>
  );
};

export default TargetInputPanel;

import React, { useState, useCallback, useEffect, useRef } from "react";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { type PatternProps } from "./types";
import {
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Server,
  Network,
  Globe,
  X,
  FileText,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { Textarea } from "~/components/lib/ui/textarea";

const CardGridPattern: React.FC<PatternProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [targets, setTargets] = useState<ParsedTarget[]>(initialTargets);
  const [isDragging, setIsDragging] = useState(false);
  const [showTextarea, setShowTextarea] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent when targets change
  useEffect(() => {
    onTargetsChange(targets);
  }, [targets, onTargetsChange]);

  // Handle drag events
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

  // Handle file input
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
    },
    []
  );

  // Add from textarea
  const handleAddFromText = useCallback(() => {
    if (!inputValue.trim()) return;
    const newTargets = parseTargets(inputValue);
    setTargets((prev) => {
      const existingValues = new Set(prev.map((t) => t.value));
      const uniqueNew = newTargets.filter((t) => !existingValues.has(t.value));
      return [...prev, ...uniqueNew];
    });
    setInputValue("");
    setShowTextarea(false);
  }, [inputValue]);

  // Toggle selection
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Remove selected
  const handleRemoveSelected = useCallback(() => {
    setTargets((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  // Get icon for target type
  const getTypeIcon = (type: string) => {
    if (type === "single_ip") return <Server className="h-4 w-4" />;
    if (type === "cidr" || type === "range")
      return <Network className="h-4 w-4" />;
    return <Globe className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 shadow-lg">
        <label className="mb-2 block text-sm font-medium text-white">
          Pattern D: Card Grid with Drag-Drop Zone
        </label>
        <p className="mb-3 text-xs text-gray-400">
          Visual upload-first design with prominent drop zone. Cards in grid
          layout.
        </p>

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-4 rounded-xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-violet-500 bg-violet-500/20"
              : "border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50"
          }`}
        >
          <Upload
            className={`mx-auto mb-3 h-8 w-8 transition ${
              isDragging ? "text-violet-400" : "text-violet-500/50"
            }`}
          />
          <p className="mb-2 text-sm font-medium text-white">
            Drop CSV or TXT files here
          </p>
          <p className="mb-3 text-xs text-gray-400">Or click to browse files</p>
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            >
              <FileText className="mr-1.5 h-3 w-3" />
              Browse Files
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowTextarea(!showTextarea)}
              className="border-violet-500/30 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20"
            >
              Paste Text
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Textarea Option */}
        {showTextarea && (
          <div className="mb-4 space-y-2">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="192.168.1.1&#10;192.168.1.0/24&#10;scanme.example.com"
              className="border-violet-500/30 bg-gray-900/50 font-mono text-sm text-violet-100"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAddFromText}
                disabled={!inputValue.trim()}
                size="sm"
                className="flex-1 disabled:opacity-50"
              >
                Add Targets
              </Button>
              <Button
                onClick={() => {
                  setShowTextarea(false);
                  setInputValue("");
                }}
                size="sm"
                variant="ghost"
                className="text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions Toolbar */}
        {selectedIds.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2">
            <span className="text-sm text-violet-200">
              {selectedIds.size} selected
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRemoveSelected}
              className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              Remove Selected
            </Button>
          </div>
        )}

        {/* Card Grid */}
        {targets.length > 0 && (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {targets.map((target) => (
              <div
                key={target.id}
                onClick={() => toggleSelect(target.id)}
                className={`group relative cursor-pointer rounded-lg border p-3 transition ${
                  selectedIds.has(target.id)
                    ? "border-violet-500 bg-violet-500/10"
                    : "border-violet-500/20 bg-gray-800/30 hover:border-violet-500/40 hover:bg-gray-800/50"
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute right-2 top-2">
                  <div
                    className={`h-4 w-4 rounded border ${
                      selectedIds.has(target.id)
                        ? "border-violet-500 bg-violet-500"
                        : "border-gray-500 bg-transparent"
                    }`}
                  >
                    {selectedIds.has(target.id) && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 text-violet-400">
                    {getTypeIcon(target.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <code className="block truncate text-xs text-white">
                      {target.value}
                    </code>
                    <div className="mt-1 flex items-center gap-1">
                      {!target.isValid ? (
                        <XCircle className="h-3 w-3 text-red-500" />
                      ) : target.warning ? (
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                      <span className="text-xs text-gray-400">
                        {target.type.toUpperCase()}
                      </span>
                    </div>
                    {target.hostCount && target.hostCount > 1 && (
                      <Badge className="mt-1 bg-violet-500/20 text-xs text-violet-300">
                        {target.hostCount} hosts
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {targets.length === 0 && !showTextarea && (
          <div className="rounded-lg border border-violet-500/20 bg-gray-900/30 py-8 text-center text-sm text-gray-400">
            No targets added yet. Drop files or paste text to begin.
          </div>
        )}
      </div>
    </div>
  );
};

export default CardGridPattern;


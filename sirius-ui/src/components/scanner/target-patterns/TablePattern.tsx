import React, { useState, useCallback, useEffect } from "react";
import { parseTargets, type ParsedTarget } from "~/utils/targetParser";
import { type PatternProps } from "./types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";

type SortColumn = "target" | "type" | "hosts" | "status";
type SortDirection = "asc" | "desc";

const TablePattern: React.FC<PatternProps> = ({
  onTargetsChange,
  initialTargets = [],
}) => {
  const [targets, setTargets] = useState<ParsedTarget[]>(initialTargets);
  const [sortColumn, setSortColumn] = useState<SortColumn>("target");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [newTargetValue, setNewTargetValue] = useState("");

  // Update parent when targets change
  useEffect(() => {
    onTargetsChange(targets);
  }, [targets, onTargetsChange]);

  // Sort targets
  const sortedTargets = [...targets].sort((a, b) => {
    let compareValue = 0;

    switch (sortColumn) {
      case "target":
        compareValue = a.value.localeCompare(b.value);
        break;
      case "type":
        compareValue = a.type.localeCompare(b.type);
        break;
      case "hosts":
        compareValue = (a.hostCount || 1) - (b.hostCount || 1);
        break;
      case "status":
        compareValue =
          (a.isValid ? 1 : 0) - (b.isValid ? 1 : 0) ||
          (a.warning ? 1 : 0) - (b.warning ? 1 : 0);
        break;
    }

    return sortDirection === "asc" ? compareValue : -compareValue;
  });

  // Toggle sort
  const handleSort = useCallback((column: SortColumn) => {
    setSortColumn((prev) => {
      if (prev === column) {
        setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
        return prev;
      }
      setSortDirection("asc");
      return column;
    });
  }, []);

  // Start editing
  const startEdit = useCallback((target: ParsedTarget) => {
    setEditingId(target.id);
    setEditValue(target.value);
  }, []);

  // Save edit
  const saveEdit = useCallback(() => {
    if (!editingId || !editValue.trim()) {
      setEditingId(null);
      return;
    }

    const parsed = parseTargets(editValue);
    if (parsed.length > 0) {
      setTargets((prev) =>
        prev.map((t) => (t.id === editingId ? { ...parsed[0]!, id: t.id } : t))
      );
    }
    setEditingId(null);
    setEditValue("");
  }, [editingId, editValue]);

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  // Add new target
  const handleAddTarget = useCallback(() => {
    if (!newTargetValue.trim()) return;

    const newTargets = parseTargets(newTargetValue);
    setTargets((prev) => {
      const existingValues = new Set(prev.map((t) => t.value));
      const uniqueNew = newTargets.filter((t) => !existingValues.has(t.value));
      return [...prev, ...uniqueNew];
    });
    setNewTargetValue("");
  }, [newTargetValue]);

  // Toggle row selection
  const toggleSelection = useCallback((id: string, shiftKey?: boolean) => {
    if (!shiftKey) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      // Shift-click multi-select logic could go here
      setSelectedIds((prev) => new Set([...prev, id]));
    }
  }, []);

  // Remove selected
  const handleRemoveSelected = useCallback(() => {
    setTargets((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  }, [selectedIds]);

  // Get status icon
  const getStatusIcon = (target: ParsedTarget) => {
    if (!target.isValid) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (target.warning) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-4 shadow-lg">
        <label className="mb-2 block text-sm font-medium text-white">
          Pattern E: Table-Style with Inline Editing
        </label>
        <p className="mb-3 text-xs text-gray-400">
          Spreadsheet-like for power users. Sort by column, inline edit, bulk
          actions.
        </p>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm">
            <span className="text-violet-200">
              {selectedIds.size} row{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-gray-400 hover:text-white"
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveSelected}
                className="text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-violet-500/20 bg-gray-900/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-violet-500/20 bg-violet-500/5">
                <th className="w-10 p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === targets.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(new Set(targets.map((t) => t.id)));
                      } else {
                        setSelectedIds(new Set());
                      }
                    }}
                    className="rounded border-violet-500/30"
                  />
                </th>
                <th className="p-2 text-left">
                  <button
                    onClick={() => handleSort("target")}
                    className="flex items-center gap-1 text-xs font-medium text-violet-200 hover:text-white"
                  >
                    Target
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-2 text-left">
                  <button
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1 text-xs font-medium text-violet-200 hover:text-white"
                  >
                    Type
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="p-2 text-left">
                  <button
                    onClick={() => handleSort("hosts")}
                    className="flex items-center gap-1 text-xs font-medium text-violet-200 hover:text-white"
                  >
                    Hosts
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="w-20 p-2 text-center">
                  <button
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 text-xs font-medium text-violet-200 hover:text-white"
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="w-24 p-2 text-center text-xs font-medium text-violet-200">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTargets.map((target) => (
                <tr
                  key={target.id}
                  className={`border-b border-violet-500/10 transition hover:bg-violet-500/5 ${
                    selectedIds.has(target.id) ? "bg-violet-500/10" : ""
                  }`}
                >
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(target.id)}
                      onChange={(e) =>
                        toggleSelection(
                          target.id,
                          (e.nativeEvent as MouseEvent).shiftKey
                        )
                      }
                      className="rounded border-violet-500/30"
                    />
                  </td>
                  <td className="p-2">
                    {editingId === target.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                        className="w-full rounded border border-violet-500/30 bg-gray-800 px-2 py-1 text-xs text-white"
                        autoFocus
                      />
                    ) : (
                      <code className="text-xs text-white">{target.value}</code>
                    )}
                  </td>
                  <td className="p-2 text-xs text-gray-300">
                    {target.type.toUpperCase()}
                  </td>
                  <td className="p-2 text-xs text-gray-300">
                    {target.hostCount?.toLocaleString() || 1}
                  </td>
                  <td className="p-2 text-center">{getStatusIcon(target)}</td>
                  <td className="p-2 text-center">
                    {editingId === target.id ? (
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={saveEdit}
                          className="rounded p-1 text-green-400 hover:bg-green-500/20"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded p-1 text-red-400 hover:bg-red-500/20"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => startEdit(target)}
                          className="rounded p-1 text-violet-400 hover:bg-violet-500/20"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() =>
                            setTargets((prev) =>
                              prev.filter((t) => t.id !== target.id)
                            )
                          }
                          className="rounded p-1 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {/* Add New Row */}
              <tr className="border-t border-violet-500/20 bg-violet-500/5">
                <td className="p-2">
                  <Plus className="h-4 w-4 text-violet-400" />
                </td>
                <td colSpan={4} className="p-2">
                  <input
                    type="text"
                    value={newTargetValue}
                    onChange={(e) => setNewTargetValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddTarget();
                    }}
                    placeholder="Add new target..."
                    className="w-full rounded border border-violet-500/30 bg-gray-800/50 px-2 py-1 text-xs text-white placeholder:text-gray-500"
                  />
                </td>
                <td className="p-2 text-center">
                  <Button
                    size="sm"
                    onClick={handleAddTarget}
                    disabled={!newTargetValue.trim()}
                    className="h-7 px-3 text-xs disabled:opacity-50"
                  >
                    Add
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {targets.length === 0 && (
          <div className="mt-3 rounded-lg border border-violet-500/20 bg-gray-900/30 py-8 text-center text-sm text-gray-400">
            No targets yet. Add one using the row above.
          </div>
        )}
      </div>
    </div>
  );
};

export default TablePattern;

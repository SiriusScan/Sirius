import React, { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import { Badge } from "~/components/lib/ui/badge";
import { Checkbox } from "~/components/lib/ui/checkbox";
import {
  Save,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";
import { api } from "~/utils/api";
import ScriptTable from "../shared/ScriptTable";
import type { NmapScript } from "../nmap/mockScriptsData";

interface TemplateEditorTabProps {
  templateId?: string;
  onClose: () => void;
}

const TemplateEditorTab: React.FC<TemplateEditorTabProps> = ({
  templateId,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupByProtocol, setGroupByProtocol] = useState(true);
  const [filterMode, setFilterMode] = useState<
    "all" | "selected" | "unselected"
  >("all");
  const [collapsedProtocols, setCollapsedProtocols] = useState<Set<string>>(
    new Set()
  );

  const utils = api.useContext();

  // Fetch existing template if editing
  const { data: existingTemplate } = api.templates.getTemplate.useQuery(
    { id: templateId! },
    { enabled: !!templateId }
  );

  // Fetch scripts - with proper loading and error handling
  const {
    data: scripts,
    isLoading: scriptsLoading,
    error: scriptsError,
  } = api.store.getNseScripts.useQuery(undefined, {
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const availableScripts = useMemo(() => scripts || [], [scripts]);

  // Initialize form with existing template data
  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || "");
      setSelectedScripts(existingTemplate.enabled_scripts || []);
    }
  }, [existingTemplate]);

  // Check for missing scripts (scripts in profile but not in available list)
  const missingScripts = useMemo(() => {
    if (selectedScripts.length === 0 || availableScripts.length === 0)
      return [];
    const availableIds = new Set(availableScripts.map((s) => s.id));
    return selectedScripts.filter((id) => !availableIds.has(id));
  }, [selectedScripts, availableScripts]);

  // Valid selected scripts (only those that exist)
  const validSelectedScripts = useMemo(() => {
    if (selectedScripts.length === 0 || availableScripts.length === 0)
      return selectedScripts;
    const availableIds = new Set(availableScripts.map((s) => s.id));
    return selectedScripts.filter((id) => availableIds.has(id));
  }, [selectedScripts, availableScripts]);

  const createMutation = api.templates.createTemplate.useMutation({
    onSuccess: () => {
      utils.templates.getTemplates.invalidate();
      onClose();
    },
  });

  const updateMutation = api.templates.updateTemplate.useMutation({
    onSuccess: () => {
      utils.templates.getTemplates.invalidate();
      onClose();
    },
  });

  const handleToggleScript = (scriptId: string) => {
    setSelectedScripts((prev) =>
      prev.includes(scriptId)
        ? prev.filter((id) => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const handleSelectAll = () => {
    // Select all filtered scripts, not all available scripts
    const newSelections = filteredScripts.map((s) => s.id);
    setSelectedScripts((prev) => {
      const combined = [...prev, ...newSelections];
      return Array.from(new Set(combined)); // Remove duplicates
    });
  };

  const handleDeselectAll = () => {
    setSelectedScripts([]);
  };

  const handleToggleProtocol = (protocol: string) => {
    // Use filteredScripts instead of availableScripts to respect current filters
    const protocolScripts = filteredScripts
      .filter((s) => s.protocol === protocol)
      .map((s) => s.id);

    const allSelected = protocolScripts.every((id) =>
      selectedScripts.includes(id)
    );

    if (allSelected) {
      setSelectedScripts((prev) =>
        prev.filter((id) => !protocolScripts.includes(id))
      );
    } else {
      setSelectedScripts((prev) => [
        ...prev,
        ...protocolScripts.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const toggleProtocolCollapse = (protocol: string) => {
    setCollapsedProtocols((prev) => {
      const next = new Set(prev);
      if (next.has(protocol)) {
        next.delete(protocol);
      } else {
        next.add(protocol);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedProtocols(new Set());
  const collapseAll = () =>
    setCollapsedProtocols(new Set(Object.keys(scriptsByProtocol)));

  const handleSave = () => {
    if (!name.trim()) return;

    const baseData = {
      name: name.trim(),
      description: description.trim(),
      enabled_scripts: selectedScripts,
      type: "custom" as const,
      scan_options: {
        scan_types: ["discovery", "vulnerability"],
        port_range: "1-1000", // Top 1000 ports - fast and comprehensive (change to "1-65535" for full scan)
        aggressive: false,
        max_retries: 3,
        parallel: true,
      },
    };

    if (templateId && !isSystemProfile) {
      // Update existing custom profile
      updateMutation.mutate({ id: templateId, ...baseData });
    } else {
      // Create new profile (either new or copy of system profile)
      const newId = `custom-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      createMutation.mutate({ id: newId, ...baseData });
    }
  };

  const handleSaveAsCopy = () => {
    // Set name to copy version
    setName(`${name} (Copy)`);
    // Force create new by treating as if no templateId
    // We'll trigger save on next render
    setTimeout(() => {
      const newId = `custom-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const baseData = {
        name: `${existingTemplate?.name || name} (Copy)`,
        description: description.trim(),
        enabled_scripts: selectedScripts,
        type: "custom" as const,
        scan_options: {
          scan_types: ["discovery", "vulnerability"],
          port_range: "1-1000", // Top 1000 ports - fast and comprehensive (change to "1-65535" for full scan)
          aggressive: false,
          max_retries: 3,
          parallel: true,
        },
      };
      createMutation.mutate({ id: newId, ...baseData });
    }, 0);
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  // Filter and search scripts
  const filteredScripts = useMemo(() => {
    let filtered = availableScripts;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (script) =>
          script.name.toLowerCase().includes(query) ||
          script.description.toLowerCase().includes(query) ||
          script.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          script.author.toLowerCase().includes(query)
      );
    }

    // Apply filter mode
    if (filterMode === "selected") {
      filtered = filtered.filter((script) =>
        selectedScripts.includes(script.id)
      );
    } else if (filterMode === "unselected") {
      filtered = filtered.filter(
        (script) => !selectedScripts.includes(script.id)
      );
    }

    return filtered;
  }, [availableScripts, searchQuery, filterMode, selectedScripts]);

  // Group scripts by protocol
  const scriptsByProtocol = useMemo(() => {
    const grouped: Record<string, NmapScript[]> = {};
    filteredScripts.forEach((script) => {
      const protocol = script.protocol || "other";
      if (!grouped[protocol]) {
        grouped[protocol] = [];
      }
      grouped[protocol]!.push(script);
    });
    return grouped;
  }, [filteredScripts]);

  // Check if this is a system profile (read-only)
  const isSystemProfile = existingTemplate?.type === "system";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-white">
            {templateId ? "Edit Profile" : "Create New Profile"}
          </h4>
          {isSystemProfile && (
            <p className="mt-1 text-xs text-yellow-400">
              System profiles are read-only. Create a copy to customize.
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Template Info */}
      <div className="space-y-4 rounded-md border border-gray-700 bg-gray-800/20 p-4">
        <div>
          <Label htmlFor="templateName" className="text-gray-400">
            Profile Name
          </Label>
          <Input
            id="templateName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Web Application Security Scan"
            disabled={isSystemProfile}
            className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
          />
        </div>
        <div>
          <Label htmlFor="templateDescription" className="text-gray-400">
            Description
          </Label>
          <Textarea
            id="templateDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this profile is for..."
            disabled={isSystemProfile}
            className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
            rows={3}
          />
        </div>
      </div>

      {/* Script Selection */}
      {scriptsLoading ? (
        <div className="flex items-center justify-center rounded-md border border-gray-700 bg-gray-800/20 p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            <p className="text-sm text-gray-400">Loading NSE scripts...</p>
          </div>
        </div>
      ) : scriptsError ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h5 className="font-medium text-red-300">
                Failed to Load Scripts
              </h5>
              <p className="mt-1 text-sm text-red-400">
                Unable to fetch NSE scripts from the backend. Please ensure the
                sirius-valkey service is running and scripts are initialized.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => utils.store.getNseScripts.invalidate()}
                className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : availableScripts.length === 0 ? (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
          <h5 className="mb-2 font-medium text-yellow-300">
            No NSE Scripts Available
          </h5>
          <p className="text-sm text-yellow-400">
            No NSE scripts found in the database. Initialize scripts using the
            scanner to populate them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Missing scripts warning */}
          {missingScripts.length > 0 && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">
                    {missingScripts.length} Selected Scripts Not Found
                  </p>
                  <p className="text-xs text-yellow-400">
                    This profile references {missingScripts.length} script
                    {missingScripts.length !== 1 ? "s" : ""} that{" "}
                    {missingScripts.length !== 1 ? "are" : "is"} not in the
                    current NSE script database.
                    {missingScripts.length <= 5 && (
                      <span className="ml-1">
                        ({missingScripts.join(", ")})
                      </span>
                    )}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Remove missing scripts from selection
                      setSelectedScripts(validSelectedScripts);
                    }}
                    className="mt-2 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                  >
                    Remove Missing Scripts
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header with counts and actions */}
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-white">
                NSE Scripts ({validSelectedScripts.length} of{" "}
                {availableScripts.length} selected)
                {missingScripts.length > 0 && (
                  <span className="ml-2 text-xs text-yellow-400">
                    + {missingScripts.length} missing
                  </span>
                )}
              </h5>
              <p className="text-xs text-gray-400">
                {filteredScripts.length < availableScripts.length && (
                  <span className="text-violet-400">
                    Showing {filteredScripts.length} matching scripts
                  </span>
                )}
                {filteredScripts.length === availableScripts.length && (
                  <span>
                    Choose which NSE scripts to include in this profile
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-gray-600 hover:bg-gray-700"
              >
                <CheckSquare className="mr-1 h-3 w-3" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="border-gray-600 hover:bg-gray-700"
              >
                <Square className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search scripts by name, description, tags, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-600 bg-gray-800/50 pl-10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("all")}
                className={
                  filterMode === "all"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "border-gray-600 hover:bg-gray-700"
                }
              >
                All
              </Button>
              <Button
                variant={filterMode === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("selected")}
                className={
                  filterMode === "selected"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "border-gray-600 hover:bg-gray-700"
                }
              >
                <Filter className="mr-1 h-3 w-3" />
                Selected ({validSelectedScripts.length})
                {missingScripts.length > 0 && (
                  <span className="ml-1 text-xs opacity-60">
                    +{missingScripts.length}
                  </span>
                )}
              </Button>
              <Button
                variant={filterMode === "unselected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("unselected")}
                className={
                  filterMode === "unselected"
                    ? "bg-violet-600 hover:bg-violet-700"
                    : "border-gray-600 hover:bg-gray-700"
                }
              >
                Unselected
              </Button>
            </div>
          </div>

          {/* Group by protocol checkbox + expand/collapse */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="groupByProtocol"
                checked={groupByProtocol}
                onCheckedChange={(checked) => setGroupByProtocol(!!checked)}
              />
              <Label
                htmlFor="groupByProtocol"
                className="text-sm text-gray-400"
              >
                Group by protocol
              </Label>
            </div>
            {groupByProtocol && Object.keys(scriptsByProtocol).length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={expandAll}
                  className="h-7 text-xs text-gray-400 hover:text-white"
                >
                  Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={collapseAll}
                  className="h-7 text-xs text-gray-400 hover:text-white"
                >
                  Collapse All
                </Button>
              </div>
            )}
          </div>

          {groupByProtocol ? (
            <div className="space-y-3">
              {Object.entries(scriptsByProtocol).length === 0 ? (
                <div className="rounded-md border border-gray-700 bg-gray-800/20 p-8 text-center">
                  <p className="text-sm text-gray-400">
                    No scripts match your current filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterMode("all");
                    }}
                    className="mt-3 border-gray-600 hover:bg-gray-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                Object.entries(scriptsByProtocol).map(
                  ([protocol, protocolScripts]) => {
                    const allSelected = protocolScripts.every((s) =>
                      selectedScripts.includes(s.id)
                    );
                    const someSelected = protocolScripts.some((s) =>
                      selectedScripts.includes(s.id)
                    );
                    const selectedCount = protocolScripts.filter((s) =>
                      selectedScripts.includes(s.id)
                    ).length;
                    const isCollapsed = collapsedProtocols.has(protocol);

                    return (
                      <div
                        key={protocol}
                        className="rounded-md border border-gray-700 bg-gray-800/20"
                      >
                        {/* Protocol Header - Collapsible */}
                        <div
                          className="flex cursor-pointer items-center gap-3 border-b border-gray-700 p-3 transition-colors hover:bg-gray-700/30"
                          onClick={() => toggleProtocolCollapse(protocol)}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() =>
                              handleToggleProtocol(protocol)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={
                              someSelected && !allSelected ? "opacity-50" : ""
                            }
                          />
                          <Badge
                            variant="outline"
                            className="bg-violet-800/20 text-violet-200"
                          >
                            {protocol}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            {protocolScripts.length}{" "}
                            {protocolScripts.length === 1
                              ? "script"
                              : "scripts"}
                          </span>
                          {selectedCount > 0 && (
                            <Badge className="bg-green-600/20 text-green-300">
                              {selectedCount} selected
                            </Badge>
                          )}
                          <div className="flex-1" /> {/* Spacer */}
                          <span className="text-xs text-gray-500">
                            Click to {isCollapsed ? "expand" : "collapse"}
                          </span>
                        </div>

                        {/* Protocol Scripts - Collapsible */}
                        {!isCollapsed && (
                          <div className="p-2">
                            <ScriptTable
                              scripts={protocolScripts}
                              showCheckboxes={true}
                              selectedScripts={selectedScripts}
                              onToggleScript={handleToggleScript}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )
              )}
            </div>
          ) : (
            <ScriptTable
              scripts={filteredScripts}
              showCheckboxes={true}
              selectedScripts={selectedScripts}
              onToggleScript={handleToggleScript}
            />
          )}
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-10 flex justify-between gap-2 border-t border-gray-700 bg-gray-900/95 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {validSelectedScripts.length > 0 && (
            <span>
              {validSelectedScripts.length} script
              {validSelectedScripts.length !== 1 ? "s" : ""} selected
            </span>
          )}
          {missingScripts.length > 0 && (
            <span className="text-yellow-400">
              + {missingScripts.length} missing
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-white hover:bg-gray-700"
            disabled={isLoading}
          >
            Cancel
          </Button>
          {isSystemProfile ? (
            <Button
              onClick={handleSaveAsCopy}
              className="bg-violet-600 text-white hover:bg-violet-700"
              disabled={isLoading || scriptsLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Copy
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              className="bg-violet-600 text-white hover:bg-violet-700"
              disabled={!name.trim() || isLoading || scriptsLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading
                ? "Saving..."
                : templateId
                ? "Update Profile"
                : "Create Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorTab;

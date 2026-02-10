import React, { useState, useMemo } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import {
  ScriptFilters,
  initialScriptFilterState,
  type ScriptLibraryFilters,
  type ScriptViewMode,
} from "./ScriptFilters";
import { Plus, Eye, Edit, Trash2, FileCode, Globe } from "lucide-react";
import type { NmapScript } from "./mockScriptsData";
import { cn } from "~/components/lib/utils";

interface ScriptLibraryProps {
  scripts: NmapScript[];
  onCreateNew: () => void;
  onView: (script: NmapScript) => void;
  onDelete: (script: NmapScript) => void;
  isLoading?: boolean;
}

const protocolColors: Record<string, string> = {
  tcp: "bg-blue-500/20 text-blue-400",
  udp: "bg-green-500/20 text-green-400",
  http: "bg-orange-500/20 text-orange-400",
  ssl: "bg-yellow-500/20 text-yellow-400",
  tls: "bg-yellow-500/20 text-yellow-400",
  dns: "bg-cyan-500/20 text-cyan-400",
  smb: "bg-red-500/20 text-red-400",
  ssh: "bg-indigo-500/20 text-indigo-400",
  "*": "bg-gray-500/20 text-gray-400",
};

export const ScriptLibrary: React.FC<ScriptLibraryProps> = ({
  scripts,
  onCreateNew,
  onView,
  onDelete,
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<ScriptLibraryFilters>(
    initialScriptFilterState
  );
  const [viewMode, setViewMode] = useState<ScriptViewMode>("grid");

  // Filter and sort scripts
  const filteredScripts = useMemo(() => {
    let result = [...scripts];

    // Apply search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.author.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          s.id.toLowerCase().includes(search) ||
          (s.protocol && s.protocol.toLowerCase().includes(search)) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Apply protocol filter
    if (filters.protocols.length > 0) {
      result = result.filter(
        (s) => s.protocol && filters.protocols.includes(s.protocol)
      );
    }

    // Apply tag filter
    if (filters.tags.length > 0) {
      result = result.filter((s) =>
        filters.tags.some((tag) => s.tags?.includes(tag))
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "author":
          comparison = a.author.localeCompare(b.author);
          break;
        case "protocol":
          comparison = (a.protocol || "*").localeCompare(b.protocol || "*");
          break;
      }
      return filters.sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [scripts, filters]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-400">Loading scripts...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Script Library</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage NSE scripts for network scanning
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-violet-600 text-white hover:bg-violet-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Script
        </Button>
      </div>

      {/* Filters */}
      <ScriptFilters
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={scripts.length}
        filteredCount={filteredScripts.length}
        scripts={scripts}
      />

      {/* Empty State */}
      {filteredScripts.length === 0 && (
        <div className="scanner-section border-gray-700 bg-gray-800/50">
          <div className="scanner-section-padding flex flex-col items-center justify-center py-12">
            <FileCode className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No scripts found
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {filters.search ||
              filters.protocols.length > 0 ||
              filters.tags.length > 0
                ? "Try adjusting your filters"
                : "Get started by creating your first script"}
            </p>
            {scripts.length === 0 && (
              <Button
                onClick={onCreateNew}
                className="mt-4 bg-violet-600 text-white hover:bg-violet-500"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Script
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Script Cards */}
      {filteredScripts.length > 0 && (
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col"
          )}
        >
          {filteredScripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              onView={onView}
              onDelete={onDelete}
              viewMode={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Script Card ---

interface ScriptCardProps {
  script: NmapScript;
  onView: (script: NmapScript) => void;
  onDelete: (script: NmapScript) => void;
  viewMode: ScriptViewMode;
}

const ScriptCard: React.FC<ScriptCardProps> = ({
  script,
  onView,
  onDelete,
  viewMode,
}) => {
  const displayTags = (script.tags || []).slice(0, 3);
  const remainingTags = (script.tags || []).length - 3;
  const protocolClass =
    protocolColors[script.protocol || "*"] || protocolColors["*"];

  if (viewMode === "list") {
    return (
      <div className="scanner-section border-2 border-gray-700 bg-gray-800/50 transition-all hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10">
        <div className="scanner-section-padding flex items-center justify-between overflow-hidden p-4">
          <div className="flex flex-1 items-center gap-4 overflow-hidden">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600/10">
              <FileCode className="h-5 w-5 text-violet-400" />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-base font-semibold text-white">
                  {script.name}
                </h4>
                {script.protocol && script.protocol !== "*" && (
                  <Badge className={cn("text-xs", protocolClass)}>
                    {script.protocol}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 line-clamp-1 text-sm text-gray-400">
                {script.description}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Author */}
              <span className="hidden text-sm text-gray-500 lg:block">
                {script.author}
              </span>

              {/* Tags */}
              {displayTags.length > 0 && (
                <div className="hidden items-center gap-1 md:flex">
                  {displayTags.map((tag: string) => (
                    <Badge
                      key={tag}
                      className="bg-gray-700 text-xs text-gray-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {remainingTags > 0 && (
                    <Badge className="bg-gray-700 text-xs text-gray-300">
                      +{remainingTags}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onView(script)}
              className="h-8 w-8 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onView(script)}
              className="h-8 w-8 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onDelete(script)}
              className="h-8 w-8 border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="scanner-section group border-2 border-gray-700 bg-gray-800/50 transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20">
      <div className="scanner-section-padding flex h-full flex-col space-y-3 p-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-600/10">
                <FileCode className="h-4 w-4 text-violet-400" />
              </div>
              <h4 className="line-clamp-1 flex-1 text-base font-semibold text-white">
                {script.name}
              </h4>
            </div>
            {script.protocol && script.protocol !== "*" && (
              <Badge className={cn("flex-shrink-0 text-xs", protocolClass)}>
                {script.protocol}
              </Badge>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="line-clamp-2 flex-1 text-sm text-gray-400">
          {script.description}
        </p>

        {/* Author */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Globe className="h-3 w-3" />
          {script.author}
        </div>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag: string) => (
              <Badge key={tag} className="bg-gray-700 text-xs text-gray-300">
                {tag}
              </Badge>
            ))}
            {remainingTags > 0 && (
              <Badge className="bg-gray-700 text-xs text-gray-300">
                +{remainingTags}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-gray-700 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(script)}
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(script)}
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={() => onDelete(script)}
            className="h-8 w-8 flex-shrink-0 border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

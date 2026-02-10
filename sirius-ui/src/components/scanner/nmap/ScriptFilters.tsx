import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { Label } from "~/components/lib/ui/label";
import { Checkbox } from "~/components/lib/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/lib/ui/popover";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SortAsc,
  SortDesc,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "~/components/lib/utils";
import type { NmapScript } from "./mockScriptsData";

// --- Filter Types ---

export interface ScriptLibraryFilters {
  search: string;
  protocols: string[];
  tags: string[];
  sortBy: "name" | "author" | "protocol";
  sortDirection: "asc" | "desc";
}

export type ScriptViewMode = "grid" | "list";

export const initialScriptFilterState: ScriptLibraryFilters = {
  search: "",
  protocols: [],
  tags: [],
  sortBy: "name",
  sortDirection: "asc",
};

// --- Component ---

interface ScriptFiltersProps {
  filters: ScriptLibraryFilters;
  onFiltersChange: (filters: ScriptLibraryFilters) => void;
  viewMode: ScriptViewMode;
  onViewModeChange: (mode: ScriptViewMode) => void;
  totalCount: number;
  filteredCount: number;
  /** All scripts, used to derive available protocol/tag options dynamically */
  scripts: NmapScript[];
}

const sortOptions: { value: ScriptLibraryFilters["sortBy"]; label: string }[] =
  [
    { value: "name", label: "Name" },
    { value: "author", label: "Author" },
    { value: "protocol", label: "Protocol" },
  ];

export const ScriptFilters: React.FC<ScriptFiltersProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  scripts,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Derive available protocols from the actual script data
  const protocolOptions = useMemo(() => {
    const protocols = new Set<string>();
    scripts.forEach((s) => {
      if (s.protocol && s.protocol !== "*") {
        protocols.add(s.protocol);
      }
    });
    return Array.from(protocols).sort();
  }, [scripts]);

  // Derive available tags from the actual script data
  const tagOptions = useMemo(() => {
    const tags = new Set<string>();
    scripts.forEach((s) => {
      s.tags?.forEach((t) => {
        if (t && t !== "*") tags.add(t);
      });
    });
    return Array.from(tags).sort();
  }, [scripts]);

  const toggleProtocol = useCallback(
    (protocol: string) => {
      const next = filters.protocols.includes(protocol)
        ? filters.protocols.filter((p) => p !== protocol)
        : [...filters.protocols, protocol];
      onFiltersChange({ ...filters, protocols: next });
    },
    [filters, onFiltersChange]
  );

  const toggleTag = useCallback(
    (tag: string) => {
      const next = filters.tags.includes(tag)
        ? filters.tags.filter((t) => t !== tag)
        : [...filters.tags, tag];
      onFiltersChange({ ...filters, tags: next });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    onFiltersChange(initialScriptFilterState);
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.protocols.length > 0 ||
    filters.tags.length > 0;

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.protocols.length +
    filters.tags.length;

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search scripts..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border-gray-700 bg-gray-800 pl-10 text-white placeholder:text-gray-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "px-3",
              viewMode === "grid"
                ? "border-violet-500/30 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30"
                : "border-gray-700 bg-gray-800 hover:bg-gray-700"
            )}
          >
            <LayoutGrid className="mr-1.5 h-4 w-4" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "px-3",
              viewMode === "list"
                ? "border-violet-500/30 bg-violet-500/20 text-violet-200 hover:bg-violet-500/30"
                : "border-gray-700 bg-gray-800 hover:bg-gray-700"
            )}
          >
            <List className="mr-1.5 h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Protocol Filter */}
        {protocolOptions.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700"
              >
                <Filter className="mr-2 h-4 w-4" />
                Protocol
                {filters.protocols.length > 0 && (
                  <Badge className="ml-2 border border-violet-500/30 bg-violet-500/20 text-violet-200">
                    {filters.protocols.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 border-gray-700 bg-gray-800 p-3">
              <Label className="mb-2 text-sm font-medium text-gray-200">
                Filter by Protocol
              </Label>
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {protocolOptions.map((protocol) => (
                  <div
                    key={protocol}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`protocol-${protocol}`}
                      checked={filters.protocols.includes(protocol)}
                      onCheckedChange={() => toggleProtocol(protocol)}
                    />
                    <Label
                      htmlFor={`protocol-${protocol}`}
                      className="cursor-pointer text-sm text-gray-300"
                    >
                      {protocol}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Tag Filter */}
        {tagOptions.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 bg-gray-800 hover:bg-gray-700"
              >
                Tags
                {filters.tags.length > 0 && (
                  <Badge className="ml-2 border border-violet-500/30 bg-violet-500/20 text-violet-200">
                    {filters.tags.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 border-gray-700 bg-gray-800 p-3">
              <Label className="mb-2 text-sm font-medium text-gray-200">
                Filter by Tag
              </Label>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {tagOptions.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag}`}
                      checked={filters.tags.includes(tag)}
                      onCheckedChange={() => toggleTag(tag)}
                    />
                    <Label
                      htmlFor={`tag-${tag}`}
                      className="cursor-pointer text-sm text-gray-300"
                    >
                      <Badge className="bg-violet-600/20 text-xs text-gray-300">
                        {tag}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Sort */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              {filters.sortDirection === "asc" ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              Sort
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 border-gray-700 bg-gray-800 p-3">
            <Label className="mb-2 text-sm font-medium text-gray-200">
              Sort By
            </Label>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onFiltersChange({ ...filters, sortBy: option.value })
                  }
                  className={cn(
                    "w-full rounded px-2 py-1 text-left text-sm transition-colors",
                    filters.sortBy === option.value
                      ? "bg-violet-500/20 text-violet-200"
                      : "text-gray-300 hover:bg-gray-700"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-3 border-t border-gray-700 pt-3">
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    sortDirection:
                      filters.sortDirection === "asc" ? "desc" : "asc",
                  })
                }
                className="w-full rounded px-2 py-1 text-left text-sm text-gray-300 hover:bg-gray-700"
              >
                {filters.sortDirection === "asc"
                  ? "↑ Ascending"
                  : "↓ Descending"}
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-violet-400 hover:text-violet-300"
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto text-sm text-gray-400">
          Showing {filteredCount} of {totalCount} scripts
          {activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge className="bg-gray-700 text-gray-300">
              Search: &quot;{filters.search}&quot;
              <button
                onClick={() => {
                  setSearchInput("");
                  onFiltersChange({ ...filters, search: "" });
                }}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.protocols.map((protocol) => (
            <Badge key={protocol} className="bg-gray-700 text-gray-300">
              Protocol: {protocol}
              <button
                onClick={() => toggleProtocol(protocol)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.tags.map((tag) => (
            <Badge key={tag} className="bg-gray-700 text-gray-300">
              {tag}
              <button
                onClick={() => toggleTag(tag)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

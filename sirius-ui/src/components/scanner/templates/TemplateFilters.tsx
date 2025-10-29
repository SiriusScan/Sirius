import React, { useState, useCallback, useEffect } from "react";
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
} from "lucide-react";
import type {
  TemplateLibraryFilters,
  TemplateViewMode,
} from "~/types/templateBuilderTypes";
import type { Platform, Severity } from "~/types/agentTemplateTypes";
import { cn } from "~/components/lib/utils";

interface TemplateFiltersProps {
  filters: TemplateLibraryFilters;
  onFiltersChange: (filters: TemplateLibraryFilters) => void;
  viewMode: TemplateViewMode;
  onViewModeChange: (mode: TemplateViewMode) => void;
  totalCount: number;
  filteredCount: number;
}

const severityOptions: { value: Severity; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "bg-red-500/20 text-red-400" },
  { value: "high", label: "High", color: "bg-orange-500/20 text-orange-400" },
  {
    value: "medium",
    label: "Medium",
    color: "bg-yellow-500/20 text-yellow-400",
  },
  { value: "low", label: "Low", color: "bg-blue-500/20 text-blue-400" },
  { value: "info", label: "Info", color: "bg-gray-500/20 text-gray-400" },
];

const platformOptions: { value: Platform; label: string }[] = [
  { value: "linux", label: "Linux" },
  { value: "darwin", label: "macOS" },
  { value: "windows", label: "Windows" },
];

const typeOptions: { value: "repository" | "custom"; label: string }[] = [
  { value: "repository", label: "Repository" },
  { value: "custom", label: "Custom" },
];

const sortOptions: {
  value: TemplateLibraryFilters["sortBy"];
  label: string;
}[] = [
  { value: "name", label: "Name" },
  { value: "severity", label: "Severity" },
  { value: "createdAt", label: "Date Created" },
  { value: "updatedAt", label: "Date Modified" },
];

export const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
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

  const toggleSeverity = useCallback(
    (severity: Severity) => {
      const newSeverity = filters.severity.includes(severity)
        ? filters.severity.filter((s) => s !== severity)
        : [...filters.severity, severity];
      onFiltersChange({ ...filters, severity: newSeverity });
    },
    [filters, onFiltersChange]
  );

  const togglePlatform = useCallback(
    (platform: Platform) => {
      const newPlatforms = filters.platforms.includes(platform)
        ? filters.platforms.filter((p) => p !== platform)
        : [...filters.platforms, platform];
      onFiltersChange({ ...filters, platforms: newPlatforms });
    },
    [filters, onFiltersChange]
  );

  const toggleType = useCallback(
    (type: "repository" | "custom") => {
      const newTypes = filters.type.includes(type)
        ? filters.type.filter((t) => t !== type)
        : [...filters.type, type];
      onFiltersChange({ ...filters, type: newTypes });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    setSearchInput("");
    onFiltersChange({
      search: "",
      severity: [],
      platforms: [],
      type: [],
      sortBy: "name",
      sortDirection: "asc",
    });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.search ||
    filters.severity.length > 0 ||
    filters.platforms.length > 0 ||
    filters.type.length > 0;

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.severity.length +
    filters.platforms.length +
    filters.type.length;

  return (
    <div className="space-y-4">
      {/* Search and Actions Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search templates..."
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
                ? "border-violet-500/50 bg-violet-600 text-white hover:bg-violet-500"
                : "border-gray-700 bg-gray-800 hover:bg-gray-700"
            )}
          >
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "px-3",
              viewMode === "list"
                ? "border-violet-500/50 bg-violet-600 text-white hover:bg-violet-500"
                : "border-gray-700 bg-gray-800 hover:bg-gray-700"
            )}
          >
            List
          </Button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Severity Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              <Filter className="mr-2 h-4 w-4" />
              Severity
              {filters.severity.length > 0 && (
                <Badge className="ml-2 bg-violet-600 text-white">
                  {filters.severity.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 border-gray-700 bg-gray-800 p-3">
            <Label className="mb-2 text-sm font-medium text-gray-200">
              Filter by Severity
            </Label>
            <div className="space-y-2">
              {severityOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`severity-${option.value}`}
                    checked={filters.severity.includes(option.value)}
                    onCheckedChange={() => toggleSeverity(option.value)}
                  />
                  <Label
                    htmlFor={`severity-${option.value}`}
                    className="cursor-pointer text-sm text-gray-300"
                  >
                    <Badge className={cn("text-xs", option.color)}>
                      {option.label}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Platform Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              Platform
              {filters.platforms.length > 0 && (
                <Badge className="ml-2 bg-violet-600 text-white">
                  {filters.platforms.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 border-gray-700 bg-gray-800 p-3">
            <Label className="mb-2 text-sm font-medium text-gray-200">
              Filter by Platform
            </Label>
            <div className="space-y-2">
              {platformOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${option.value}`}
                    checked={filters.platforms.includes(option.value)}
                    onCheckedChange={() => togglePlatform(option.value)}
                  />
                  <Label
                    htmlFor={`platform-${option.value}`}
                    className="cursor-pointer text-sm text-gray-300"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Type Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              Type
              {filters.type.length > 0 && (
                <Badge className="ml-2 bg-violet-600 text-white">
                  {filters.type.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 border-gray-700 bg-gray-800 p-3">
            <Label className="mb-2 text-sm font-medium text-gray-200">
              Filter by Type
            </Label>
            <div className="space-y-2">
              {typeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={filters.type.includes(option.value)}
                    onCheckedChange={() => toggleType(option.value)}
                  />
                  <Label
                    htmlFor={`type-${option.value}`}
                    className="cursor-pointer text-sm text-gray-300"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

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
                      ? "bg-violet-600 text-white"
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
                {filters.sortDirection === "asc" ? "Ascending" : "Descending"}
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
          Showing {filteredCount} of {totalCount} templates
          {activeFilterCount > 0 && ` (${activeFilterCount} filters active)`}
        </div>
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge className="bg-gray-700 text-gray-300">
              Search: "{filters.search}"
              <button
                onClick={() => setSearchInput("")}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.severity.map((severity) => (
            <Badge key={severity} className="bg-gray-700 text-gray-300">
              {severityOptions.find((s) => s.value === severity)?.label}
              <button
                onClick={() => toggleSeverity(severity)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.platforms.map((platform) => (
            <Badge key={platform} className="bg-gray-700 text-gray-300">
              {platformOptions.find((p) => p.value === platform)?.label}
              <button
                onClick={() => togglePlatform(platform)}
                className="ml-1 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.type.map((type) => (
            <Badge key={type} className="bg-gray-700 text-gray-300">
              {typeOptions.find((t) => t.value === type)?.label}
              <button
                onClick={() => toggleType(type)}
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

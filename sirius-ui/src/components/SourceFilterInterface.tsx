"use client";

import React, { useState, useEffect } from "react";
import { cn } from "~/components/lib/utils";
import { Filter, X, Calendar, Shield, Search, RotateCcw } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import {
  sourceFilterOptions,
  confidenceFilterOptions,
} from "./VulnerabilityTableSourceColumns";

export interface SourceFilterState {
  sources: string[];
  confidence: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  searchTerm: string;
}

interface SourceFilterInterfaceProps {
  onFilterChange: (filters: SourceFilterState) => void;
  className?: string;
  showAdvanced?: boolean;
}

export const SourceFilterInterface: React.FC<SourceFilterInterfaceProps> = ({
  onFilterChange,
  className,
  showAdvanced = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SourceFilterState>({
    sources: [],
    confidence: [],
    dateRange: {},
    searchTerm: "",
  });

  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleSourceToggle = (source: string) => {
    setFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  };

  const handleConfidenceToggle = (confidence: string) => {
    setFilters((prev) => ({
      ...prev,
      confidence: prev.confidence.includes(confidence)
        ? prev.confidence.filter((c) => c !== confidence)
        : [...prev.confidence, confidence],
    }));
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value || undefined,
      },
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      sources: [],
      confidence: [],
      dateRange: {},
      searchTerm: "",
    });
  };

  const hasActiveFilters =
    filters.sources.length > 0 ||
    filters.confidence.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.searchTerm.length > 0;

  const getSourceBadgeColor = (source: string) => {
    const option = sourceFilterOptions.find((opt) => opt.value === source);
    switch (option?.color) {
      case "blue":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "green":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "orange":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "purple":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "cyan":
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
        className
      )}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Vulnerability Filters
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
              {filters.sources.length +
                filters.confidence.length +
                (filters.dateRange.start ? 1 : 0) +
                (filters.searchTerm ? 1 : 0)}{" "}
              active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
          {showAdvanced && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? "Less" : "More"} Filters
            </Button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Source Filters */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sources:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sourceFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSourceToggle(option.value)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.sources.includes(option.value)
                  ? getSourceBadgeColor(option.value)
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              )}
            >
              {option.label}
              {filters.sources.includes(option.value) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Confidence Filters */}
      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confidence Level:
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {confidenceFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleConfidenceToggle(option.value)}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                filters.confidence.includes(option.value)
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              )}
            >
              {option.label}
              {filters.confidence.includes(option.value) && (
                <X className="ml-1 h-3 w-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && showAdvanced && (
        <div className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Date Range:
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                From:
              </label>
              <input
                type="date"
                value={filters.dateRange.start || ""}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                To:
              </label>
              <input
                type="date"
                value={filters.dateRange.end || ""}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-transparent focus:ring-2 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-gray-50 p-4 dark:bg-gray-900/50">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium">Active filters:</span>
            {filters.sources.length > 0 && (
              <span className="ml-2">
                Sources: {filters.sources.join(", ")}
              </span>
            )}
            {filters.confidence.length > 0 && (
              <span className="ml-2">
                Confidence: {filters.confidence.join(", ")}
              </span>
            )}
            {filters.dateRange.start && (
              <span className="ml-2">From: {filters.dateRange.start}</span>
            )}
            {filters.dateRange.end && (
              <span className="ml-2">To: {filters.dateRange.end}</span>
            )}
            {filters.searchTerm && (
              <span className="ml-2">Search: "{filters.searchTerm}"</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceFilterInterface;

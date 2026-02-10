"use client";

import React, { useState, useEffect } from "react";
import { cn } from "~/components/lib/utils";
import { Filter, X, Calendar, Shield, Search, RotateCcw } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { getSourceColor } from "~/components/shared/SourceBadge";
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

  const getSourceBadgeColor = (source: string) =>
    getSourceColor(source, "badge");

  return (
    <div
      className={cn(
        "rounded-lg border border-gray-700 bg-gray-800",
        className
      )}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-gray-700 border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-100">
            Vulnerability Filters
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300">
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
      <div className="border-b border-gray-700 border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 py-2 pl-10 pr-4 text-sm text-gray-100 placeholder-gray-500 focus:border-transparent focus:ring-2 text-gray-100 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Source Filters */}
      <div className="border-b border-gray-700 border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">
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
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
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
      <div className="border-b border-gray-700 border-gray-700">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-300">
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
                  ? "bg-green-500/20 text-green-300"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600"
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
            <span className="text-sm font-medium text-gray-300">
              Date Range:
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                From:
              </label>
              <input
                type="date"
                value={filters.dateRange.start || ""}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-transparent focus:ring-2 text-gray-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-400">
                To:
              </label>
              <input
                type="date"
                value={filters.dateRange.end || ""}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-100 focus:border-transparent focus:ring-2 text-gray-100"
              />
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-gray-800 bg-gray-900/50">
          <div className="text-xs text-gray-400">
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

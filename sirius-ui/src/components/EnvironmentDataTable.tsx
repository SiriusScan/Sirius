"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  type Row,
} from "@tanstack/react-table";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { useRouter } from "next/router";
import { cn } from "~/components/lib/utils";
import { Download, Filter, MoreHorizontal, RefreshCw } from "lucide-react";
import { getRiskLevel as getRiskLevelUtil } from "~/utils/riskScoreCalculator";
import { matchesSourceFilter } from "~/utils/tableFilters";

/**
 * Custom global filter that searches across all relevant string fields
 * in the row data (hostname, ip, os, tags) regardless of how column
 * accessors are defined.  Works for both environment-page and scanner-page
 * data shapes because both share these fields.
 */
const rowGlobalFilter: FilterFn<EnvironmentTableData> = (
  row: Row<EnvironmentTableData>,
  _columnId: string,
  filterValue: string
): boolean => {
  const search = filterValue.toLowerCase().trim();
  if (!search) return true;

  const d = row.original;
  if (d.hostname?.toLowerCase().includes(search)) return true;
  if (d.ip?.toLowerCase().includes(search)) return true;
  if (d.os?.toLowerCase().includes(search)) return true;
  if (d.tags?.some((tag) => tag.toLowerCase().includes(search))) return true;

  // Also search vulnerability count as a string (e.g. "14")
  if (String(d.vulnerabilityCount ?? "").includes(search)) return true;

  return false;
};

interface EnvironmentDataTableProps {
  columns: ColumnDef<EnvironmentTableData, any>[];
  data: EnvironmentTableData[];
  onRefresh?: () => void;
}

export function EnvironmentDataTable({
  columns,
  data,
  onRefresh,
}: EnvironmentDataTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Dropdown filter state
  const [osFilter, setOsFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Advanced filter state
  const [advIpRange, setAdvIpRange] = useState("");
  const [advDateRange, setAdvDateRange] = useState("");
  const [advTags, setAdvTags] = useState("");

  const exportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // getRiskLevel — uses centralized util (count-only fallback)
  const getRiskLevel = (count: number): string =>
    getRiskLevelUtil(undefined, count);

  // ── Pre-filter data based on quick-filters, dropdowns, and advanced ──
  const filteredData = useMemo(() => {
    let rows = data;

    // Quick-filter presets
    if (activeFilters.includes("highRisk")) {
      rows = rows.filter(
        (h) =>
          getRiskLevel(h.vulnerabilityCount ?? 0) === "critical" ||
          getRiskLevel(h.vulnerabilityCount ?? 0) === "high"
      );
    }
    if (activeFilters.includes("windows")) {
      rows = rows.filter((h) =>
        h.os?.toLowerCase().includes("windows")
      );
    }
    if (activeFilters.includes("linux")) {
      rows = rows.filter(
        (h) =>
          h.os?.toLowerCase().includes("linux") ||
          h.os?.toLowerCase().includes("ubuntu") ||
          h.os?.toLowerCase().includes("debian") ||
          h.os?.toLowerCase().includes("centos") ||
          h.os?.toLowerCase().includes("fedora") ||
          h.os?.toLowerCase().includes("rhel")
      );
    }
    // "Recently Scanned" – no scan-date field available on the data type,
    // so we treat it as a no-op for now (all visible hosts are recent).

    // Dropdown filters
    if (osFilter) {
      rows = rows.filter((h) =>
        h.os?.toLowerCase().includes(osFilter.toLowerCase())
      );
    }
    if (riskFilter) {
      rows = rows.filter(
        (h) => getRiskLevel(h.vulnerabilityCount ?? 0) === riskFilter
      );
    }
    if (sourceFilter) {
      rows = rows.filter((h) => matchesSourceFilter(h, sourceFilter));
    }

    // Advanced filters
    if (advIpRange.trim()) {
      const term = advIpRange.trim().toLowerCase();
      // Simple prefix / substring match (e.g. "192.168.1")
      // For CIDR we'd need a library – substring covers 90 % of use-cases
      rows = rows.filter((h) => h.ip?.toLowerCase().includes(term));
    }
    if (advTags.trim()) {
      const wanted = advTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
      if (wanted.length > 0) {
        rows = rows.filter((h) =>
          wanted.some((w) =>
            h.tags?.some((tag) => tag.toLowerCase().includes(w))
          )
        );
      }
    }
    // advDateRange is a no-op since the table data doesn't carry scan timestamps.

    return rows;
  }, [data, activeFilters, osFilter, riskFilter, sourceFilter, advIpRange, advTags, advDateRange]);

  // Track clicks outside of export dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setShowExportDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter columns to exclude status column
  const filteredColumns = useMemo(() => {
    return columns.filter((column) => {
      // Filter out the status column if it exists
      if ("accessorKey" in column && column.accessorKey === "status") {
        return false;
      }
      if ("id" in column && column.id === "status") {
        return false;
      }
      return true;
    });
  }, [columns]);

  // Enable row selection by adding a selection column
  const selectionColumn: ColumnDef<EnvironmentTableData, any> = {
    id: "select",
    header: ({ table }) => (
      <div className="px-1">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-600 text-violet-500 focus:ring-violet-500"
          checked={table.getIsAllPageRowsSelected()}
          ref={(input) => {
            if (input) {
              input.indeterminate =
                table.getIsSomePageRowsSelected() &&
                !table.getIsAllPageRowsSelected();
            }
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-1" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-600 text-violet-500 focus:ring-violet-500"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      </div>
    ),
    enableSorting: false,
    enableGlobalFilter: false,
  };

  // Add selection column to columns array
  const columnsWithSelection = useMemo(() => {
    return [selectionColumn, ...filteredColumns];
  }, [filteredColumns]);

  const table = useReactTable({
    data: filteredData,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: rowGlobalFilter,
    state: {
      globalFilter,
      columnFilters,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    enableRowSelection: true,
  });

  // Handle search input
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
  };

  // Handle row click - navigate to host details
  const handleRowClick = (host: EnvironmentTableData) => {
    // Use router.push with a properly formatted path
    router.push({
      pathname: "/host/[ip]",
      query: { ip: host.ip },
    });
  };

  // Handle refresh click
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Default refresh behavior if no callback is provided
      window.location.reload();
    }
  };

  // Define filter presets
  const filterPresets = [
    { name: "High Risk Hosts", filter: "highRisk" },
    { name: "Windows Hosts", filter: "windows" },
    { name: "Linux Hosts", filter: "linux" },
    { name: "Recently Scanned", filter: "recentlyScan" },
  ];

  // Toggle a quick-filter preset on/off
  const applyFilterPreset = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle export
  const handleExport = (format: "csv" | "json") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const dataToExport =
      selectedRows.length > 0
        ? selectedRows.map((row) => row.original)
        : filteredData;

    if (format === "csv") {
      // CSV export logic
      const headers = Object.keys(dataToExport[0] || {}).join(",");
      const csvRows = dataToExport.map((row) => Object.values(row).join(","));
      const csvContent = [headers, ...csvRows].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "environment-hosts.csv");
      link.click();
      setShowExportDropdown(false);
    } else if (format === "json") {
      // JSON export logic
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "environment-hosts.json");
      link.click();
      setShowExportDropdown(false);
    }
  };

  // Calculate summary of selected hosts
  const selectedHostsSummary = useMemo(() => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return null;

    return {
      count: selectedRows.length,
      vulnerabilities: selectedRows.reduce(
        (sum, row) => sum + (row.original.vulnerabilityCount || 0),
        0
      ),
    };
  }, [table.getSelectedRowModel().rows]);

  // Column filter components
  const renderColumnFilters = () => {
    return (
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          className="rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1 text-gray-200 outline-none focus:border-violet-500/40"
          value={osFilter}
          onChange={(e) => setOsFilter(e.target.value)}
        >
          <option value="">OS Type</option>
          <option value="windows">Windows</option>
          <option value="linux">Linux</option>
          <option value="macos">macOS</option>
          <option value="unknown">Unknown</option>
        </select>

        <select
          className="rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1 text-gray-200 outline-none focus:border-violet-500/40"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
        >
          <option value="">Risk Level</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>

        <select
          className="rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1 text-gray-200 outline-none focus:border-violet-500/40"
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
        >
          <option value="">Source</option>
          <option value="network">Network</option>
          <option value="agent">Agent</option>
        </select>
      </div>
    );
  };

  // Advanced filter components
  const renderAdvancedFilters = () => {
    if (!showAdvancedFilters) return null;

    return (
      <div className="mb-4 rounded-md border border-violet-500/20 bg-gray-900/50 p-4 backdrop-blur-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-100">
          Advanced Filters
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              IP Address / Subnet
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.1"
              value={advIpRange}
              onChange={(e) => setAdvIpRange(e.target.value)}
              className="w-full rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-200 focus:border-violet-500/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              Last Scan Date
            </label>
            <select
              value={advDateRange}
              onChange={(e) => setAdvDateRange(e.target.value)}
              className="w-full rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-200 outline-none focus:border-violet-500/40"
            >
              <option value="">Any time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              Tags
            </label>
            <input
              type="text"
              placeholder="Comma separated tags"
              value={advTags}
              onChange={(e) => setAdvTags(e.target.value)}
              className="w-full rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-200 focus:border-violet-500/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-300">
              Discovery Source
            </label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-200 outline-none focus:border-violet-500/40"
            >
              <option value="">All Sources</option>
              <option value="network">Network</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-violet-500/20 px-3 py-1 text-gray-300 transition-colors hover:border-violet-500/30"
            onClick={() => {
              setAdvIpRange("");
              setAdvDateRange("");
              setAdvTags("");
              setSourceFilter("");
              setShowAdvancedFilters(false);
            }}
          >
            Clear &amp; Close
          </button>
          <button
            className="rounded-md bg-violet-500 px-3 py-1 text-sm text-white hover:bg-violet-600"
            onClick={() => setShowAdvancedFilters(false)}
          >
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                type="text"
                placeholder="Search hosts..."
                value={globalFilter}
                onChange={handleSearch}
                className="h-10 w-64 rounded-md border border-violet-500/20 bg-gray-900/50 px-10 text-sm text-gray-100 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              />
              {globalFilter && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500"
                  onClick={() => setGlobalFilter("")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="ml-4 text-sm text-gray-500">
              {table.getFilteredRowModel().rows.length} hosts found
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className="flex items-center rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-300 transition-colors hover:border-violet-500/30 hover:bg-gray-900/70"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Refresh
            </button>
            <div className="relative" ref={exportRef}>
              <button
                className="flex items-center rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-300 transition-colors hover:border-violet-500/30 hover:bg-gray-900/70"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border border-violet-500/20 bg-gray-900 py-1 shadow-lg">
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-violet-500/[0.06]"
                    onClick={() => handleExport("csv")}
                  >
                    Export as CSV
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-violet-500/[0.06]"
                    onClick={() => handleExport("json")}
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            <button
              className="flex items-center rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-1.5 text-gray-300 transition-colors hover:border-violet-500/30 hover:bg-gray-900/70"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="mr-1.5 h-4 w-4" />
              Advanced Filter
            </button>
          </div>
        </div>

        {/* Advanced filters */}
        {renderAdvancedFilters()}

        {/* Filter presets */}
        <div className="flex flex-wrap gap-2">
          {filterPresets.map((preset) => (
            <button
              key={preset.filter}
              onClick={() => applyFilterPreset(preset.filter)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeFilters.includes(preset.filter)
                  ? "border border-violet-500/30 bg-violet-500/20 text-violet-300"
                  : "border border-violet-500/10 bg-gray-900/50 text-gray-400 hover:border-violet-500/20 hover:text-gray-300"
              )}
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Column-specific filters */}
        {renderColumnFilters()}

        {/* Selected hosts summary */}
        {selectedHostsSummary && (
          <div className="rounded-md bg-violet-900/20 px-4 py-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">
                  {selectedHostsSummary.count} hosts selected
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  with {selectedHostsSummary.vulnerabilities} total
                  vulnerabilities
                </span>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-300 hover:bg-violet-500/20 transition-colors">
                  Scan Selected
                </button>
                <button className="rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm text-violet-300 hover:bg-violet-500/20 transition-colors">
                  Tag Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-violet-500/20 bg-gray-900/30 overflow-hidden">
        <table className="w-full divide-y divide-violet-500/10">
          <thead className="bg-gray-900/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "px-4 py-3.5 text-left text-sm font-semibold text-violet-200/80",
                      header.id !== "select" && "cursor-pointer"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.getCanSort() && (
                        <div
                          className={
                            header.column.getIsSorted()
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100"
                          }
                        >
                          {{
                            asc: (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m5 15 7-7 7 7"></path>
                              </svg>
                            ),
                            desc: (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m19 9-7 7-7-7"></path>
                              </svg>
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-violet-500/5">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer odd:bg-gray-800/40 even:bg-gray-900/40 hover:bg-violet-500/[0.06] transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-200"
                      onClick={
                        cell.column.id === "select"
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
                    >
                      {cell.column.id === "actions" ? (
                        <div className="flex items-center justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log("Quick action for", row.original.ip);
                            }}
                            className="rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-gray-200 transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnsWithSelection.length}
                  className="py-10 text-center text-gray-500"
                >
                  No hosts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="rounded-lg border border-violet-500/20 bg-gray-900/50 px-2 py-1 text-sm text-gray-300 outline-none focus:border-violet-500/40"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            Showing{" "}
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}{" "}
            to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} hosts
          </span>
        </div>
        <div className="flex gap-2">
          <button
            className={cn(
              "rounded-md border border-violet-500/20 px-3 py-1 text-sm text-gray-400 transition-colors hover:border-violet-500/30 hover:text-gray-300",
              !table.getCanPreviousPage() && "cursor-not-allowed opacity-40"
            )}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
            const pageIndex = i;
            return (
              <button
                key={i}
                className={cn(
                  "rounded-md border px-3 py-1 text-sm transition-colors",
                  table.getState().pagination.pageIndex === pageIndex
                    ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
                    : "border-violet-500/20 text-gray-400 hover:border-violet-500/30 hover:text-gray-300"
                )}
                onClick={() => table.setPageIndex(pageIndex)}
              >
                {pageIndex + 1}
              </button>
            );
          })}
          <button
            className={cn(
              "rounded-md border border-violet-500/20 px-3 py-1 text-sm text-gray-400 transition-colors hover:border-violet-500/30 hover:text-gray-300",
              !table.getCanNextPage() && "cursor-not-allowed opacity-40"
            )}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

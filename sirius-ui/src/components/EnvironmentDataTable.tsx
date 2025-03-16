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
} from "@tanstack/react-table";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { useRouter } from "next/router";
import { cn } from "~/components/lib/utils";
import { Download, Filter, MoreHorizontal, RefreshCw } from "lucide-react";

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
  const exportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
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
          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
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
    data,
    columns: columnsWithSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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

  // Apply filter preset
  const applyFilterPreset = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter));
      // Remove the filter logic here
      switch (filter) {
        case "highRisk":
          table.getColumn("riskScore")?.setFilterValue(undefined);
          break;
        case "windows":
          table.getColumn("os")?.setFilterValue(undefined);
          break;
        case "linux":
          table.getColumn("os")?.setFilterValue(undefined);
          break;
        default:
          break;
      }
    } else {
      setActiveFilters([...activeFilters, filter]);
      // Apply the filter logic here
      switch (filter) {
        case "highRisk":
          // Example: Filter for high risk hosts
          table.getColumn("riskScore")?.setFilterValue("high");
          break;
        case "windows":
          // Example: Filter for Windows hosts
          table.getColumn("os")?.setFilterValue("Windows");
          break;
        case "linux":
          // Example: Filter for Linux hosts
          table.getColumn("os")?.setFilterValue("Linux");
          break;
        default:
          break;
      }
    }
  };

  // Handle export
  const handleExport = (format: "csv" | "json") => {
    const selectedRows = table.getSelectedRowModel().rows;
    const dataToExport =
      selectedRows.length > 0 ? selectedRows.map((row) => row.original) : data;

    if (format === "csv") {
      // CSV export logic
      const headers = Object.keys(data[0] || {}).join(",");
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
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          onChange={(e) =>
            table.getColumn("os")?.setFilterValue(e.target.value || undefined)
          }
        >
          <option value="">OS Type</option>
          <option value="Windows">Windows</option>
          <option value="Linux">Linux</option>
          <option value="macOS">macOS</option>
        </select>

        <select
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          onChange={(e) =>
            table
              .getColumn("riskScore")
              ?.setFilterValue(e.target.value || undefined)
          }
        >
          <option value="">Risk Level</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    );
  };

  // Advanced filter components
  const renderAdvancedFilters = () => {
    if (!showAdvancedFilters) return null;

    return (
      <div className="mb-4 rounded-md border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
          Advanced Filters
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              IP Address Range
            </label>
            <input
              type="text"
              placeholder="e.g. 192.168.1.0/24"
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Last Scan Date
            </label>
            <select className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              <option value="">Any time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <input
              type="text"
              placeholder="Comma separated tags"
              className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-md border border-gray-200 px-3 py-1 text-sm dark:border-gray-700"
            onClick={() => setShowAdvancedFilters(false)}
          >
            Cancel
          </button>
          <button className="rounded-md bg-violet-500 px-3 py-1 text-sm text-white">
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
                className="h-10 w-64 rounded-md border border-gray-200 bg-white px-10 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
              className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
              onClick={handleRefresh}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Refresh
            </button>
            <div className="relative" ref={exportRef}>
              <button
                className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
                onClick={() => setShowExportDropdown(!showExportDropdown)}
              >
                <Download className="mr-1.5 h-4 w-4" />
                Export
              </button>
              {showExportDropdown && (
                <div className="absolute right-0 top-full z-10 mt-1 w-36 rounded-md border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleExport("csv")}
                  >
                    Export as CSV
                  </button>
                  <button
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => handleExport("json")}
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            <button
              className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
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
                "rounded-full px-3 py-1 text-xs font-medium",
                activeFilters.includes(preset.filter)
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
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
          <div className="rounded-md bg-violet-50 p-3 dark:bg-violet-900/10">
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
                <button className="rounded-md border border-violet-200 bg-violet-50 px-3 py-1 text-sm text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
                  Scan Selected
                </button>
                <button className="rounded-md border border-violet-200 bg-violet-50 px-3 py-1 text-sm text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
                  Tag Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border border-gray-200 dark:border-gray-700">
        <table className="w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "px-4 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100",
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
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
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
                            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800"
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
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
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
              "rounded-md border border-gray-200 px-3 py-1 text-sm dark:border-gray-700",
              !table.getCanPreviousPage() && "cursor-not-allowed opacity-50"
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
                  "rounded-md border px-3 py-1 text-sm",
                  table.getState().pagination.pageIndex === pageIndex
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-300"
                    : "border-gray-200 dark:border-gray-700"
                )}
                onClick={() => table.setPageIndex(pageIndex)}
              >
                {pageIndex + 1}
              </button>
            );
          })}
          <button
            className={cn(
              "rounded-md border border-gray-200 px-3 py-1 text-sm dark:border-gray-700",
              !table.getCanNextPage() && "cursor-not-allowed opacity-50"
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

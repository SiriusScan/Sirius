"use client";

import React, { useState, useEffect } from "react";

import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/lib/ui/table";
import { useRouter } from "next/router";

interface EnvironmentDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function EnvironmentDataTable<TData, TValue>({
  columns,
  data,
}: EnvironmentDataTableProps<TData, TValue>) {
  const router = useRouter();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [tableData, setTableData] = useState(data); // Replace data with your actual data
  const [originalData, setOriginalData] = useState(data); // Keep a copy of all rows for filtering

  // Looks like I hand no idea about useQuery cache invalidation when I wrote this... leaving commented for now
  // useEffect(() => {
  //   setOriginalData(data); // Update originalData whenever data changes
  // }, [data]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();

    // Manually filter rows based on the search value
    const filteredRows = originalData.filter((row) => {
      return (
        row.os.includes(searchValue) ||
        row.ip.includes(searchValue) ||
        row.hostname.includes(searchValue) ||
        row.tags.includes(searchValue) ||
        row.groups.includes(searchValue)
      );
    });

    // Update the displayed rows
    setTableData(filteredRows);
  };

  const handleRowClick = async (ip: string) => {
    try {
      await router.push(`/host?id=${ip}`);
    } catch (error) {
      console.error("Failed to navigate to the host page", error);
    }
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(), // This one made me cry
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const columnWidths = {
    select: "4%",
    os: "5%",
    hostname: "22%",
    ip: "22%",
    groups: "22%",
    tags: "22%",
    count: "2%",
    actions: "1%",
  };

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search"
          onChange={handleSearch}
          className="max-w-sm rounded-l-md rounded-r-none border-violet-100/30"
        />

        <Button
          variant="outline"
          className="text-md h-12 rounded-l-none rounded-r-md border-violet-100/30 bg-violet-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </Button>
      </div>

      <div className="">
        <Table className="rounded-md border border-violet-200/20">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-violet-200/20"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={header.id === "count" ? "text-center" : ""}
                      style={{ width: columnWidths[header.id] || "auto" }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer border-b border-violet-200/20"
                  onClick={() => handleRowClick(row.getValue("ip"))}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "count" || cell.column.id === "cvss"
                          ? "text-center"
                          : "" || cell.column.id === "os"
                          ? "text-right"
                          : ""
                      }
                      style={{ width: columnWidths[cell.column.id] || "auto" }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Object.keys(columnWidths).length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-row items-center justify-end">
        <div className="flex space-x-2 py-4">
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

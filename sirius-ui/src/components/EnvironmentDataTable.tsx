/**
 * EnvironmentDataTable — the Environment hosts table (R04).
 *
 * One filter row: search by hostname, IP or OS; the compact SeverityStrip as
 * a severity filter (held in `?severity=`); a Filters popover for OS and
 * source; Export (CSV of the hosts that match, in the order shown). Rows
 * sort by the server's risk score (ADR-3), highest first. Clicking a row,
 * the host cell or the action opens /host/<ip>.
 */

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, X } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { SeverityStrip } from "~/components/shared/SeverityStrip";
import { hostHref } from "~/components/shared/HostCell";
import { useSeverityParam } from "~/components/shared/useSeverityParam";
import { pageWindow, paginate } from "~/components/shared/vulnTableModel";
import type { Severity, SeverityCounts } from "~/components/shared/severity";
import { HostFiltersPopover } from "~/components/environment/HostFiltersPopover";
import {
  DEFAULT_HOST_SORT,
  filterHosts,
  hostsCsv,
  hostsCsvFilename,
  hostsFooterLabel,
  nextHostSort,
  osOptions,
  sortHosts,
  sourceOptions,
  type HostRow,
  type HostSort,
} from "~/components/environment/hostsTableModel";
import { HOST_COLUMNS, HostColumnCell } from "~/components/EnvironmentDataTableColumns";

const PAGE_SIZE = 25;
const NO_SEVERITIES: readonly Severity[] = [];
const cellPad = "px-3 py-3";

export interface EnvironmentDataTableProps<T extends HostRow> {
  rows: readonly T[];
  /** Skeleton rows while the inventory loads. */
  loading?: boolean;
  /**
   * Open findings by severity across the inventory (useSummaryStats), for
   * the severity pills. Without it the pills and their filter are hidden.
   */
  severityCounts?: SeverityCounts;
  /** Show only these IPs (the banner's "Show new hosts"); null shows all. */
  onlyIps?: ReadonlySet<string> | null;
  /** Clears `onlyIps`; shown as "New hosts only ×" while it is set. */
  onClearOnlyIps?: () => void;
  className?: string;
}

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function PagerButton({
  label,
  disabled,
  active,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-xs tabular-nums transition-colors disabled:cursor-default disabled:opacity-40",
        active ? "bg-violet-500/20 text-violet-200" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200",
      )}
    >
      {children}
    </button>
  );
}

export function EnvironmentDataTable<T extends HostRow>({
  rows,
  loading = false,
  severityCounts,
  onlyIps = null,
  onClearOnlyIps,
  className,
}: EnvironmentDataTableProps<T>) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [os, setOs] = useState<string[]>([]);
  const [sources, setSources] = useState<string[]>([]);
  const [sort, setSort] = useState<HostSort>(DEFAULT_HOST_SORT);
  const [page, setPage] = useState(1);
  const [severities, setSeverities, toggleSeverity] = useSeverityParam();
  // The severity filter only applies while its pills are on screen.
  const activeSeverities = severityCounts ? severities : NO_SEVERITIES;

  const osChoices = useMemo(() => osOptions(rows), [rows]);
  const sourceChoices = useMemo(() => sourceOptions(rows), [rows]);

  const visible = useMemo(
    () =>
      sortHosts(
        filterHosts(rows, { search, severities: activeSeverities, os, sources, onlyIps }),
        sort,
      ),
    [rows, search, activeSeverities, os, sources, onlyIps, sort],
  );

  // Any filter change starts again from the first page; new rows keep the
  // page (paginate clamps it).
  const filterKey = [search, activeSeverities.join(","), os.join(","), sources.join(","), onlyIps ? [...onlyIps].join(",") : ""].join("|");
  useEffect(() => setPage(1), [filterKey]);

  const slice = paginate(visible, page, PAGE_SIZE);
  const filtering = visible.length !== rows.length;

  const clearAll = () => {
    setSearch("");
    setOs([]);
    setSources([]);
    if (activeSeverities.length > 0) setSeverities([]);
    onClearOnlyIps?.();
  };

  const onRowClick = (e: React.MouseEvent, ip: string) => {
    // Links and buttons in the row handle themselves; selecting text is not a click.
    if ((e.target as HTMLElement).closest("a,button,input,label")) return;
    if (window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(hostHref(ip), "_blank", "noopener");
      return;
    }
    void router.push(hostHref(ip));
  };

  return (
    <div className={cn("min-w-0", className)}>
      {/* One filter row */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="relative flex min-w-[14rem] max-w-xs flex-1 items-center">
          <span className="sr-only">Search hosts</span>
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-gray-500" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by hostname, IP or OS"
            className="h-8 w-full rounded-md border border-gray-700/70 bg-gray-900/60 pl-8 pr-7 text-xs text-gray-200 placeholder:text-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-1.5 rounded p-0.5 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>

        {severityCounts && (
          <SeverityStrip
            variant="compact"
            counts={severityCounts}
            selected={activeSeverities}
            onSelect={toggleSeverity}
            aria-label="Show hosts with open findings at these severities"
          />
        )}

        {onlyIps && (
          <button
            type="button"
            onClick={onClearOnlyIps}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2.5 text-xs font-medium text-green-300 hover:bg-green-500/15"
            aria-label="Show all hosts"
          >
            New hosts only
            <X className="h-3 w-3" aria-hidden />
          </button>
        )}

        <span className="flex-1" />

        <div className="flex items-center gap-2">
          <HostFiltersPopover
            osOptions={osChoices}
            sourceOptions={sourceChoices}
            os={os}
            sources={sources}
            onOsChange={setOs}
            onSourcesChange={setSources}
          />
          <button
            type="button"
            disabled={loading || visible.length === 0}
            onClick={() => download(hostsCsvFilename(), hostsCsv(visible))}
            title={
              visible.length > 0
                ? `Download the ${visible.length.toLocaleString("en-US")} host${visible.length === 1 ? "" : "s"} shown as CSV`
                : undefined
            }
            className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-gray-700/70 px-2.5 text-xs font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] table-fixed border-collapse text-sm">
          <colgroup>
            {HOST_COLUMNS.map((c) => (
              <col key={c.id} className={c.col} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-violet-500/10">
              {HOST_COLUMNS.map((c) => {
                const active = !!c.sortKey && sort.key === c.sortKey;
                return (
                  <th
                    key={c.id}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500",
                      c.align === "right" ? "text-right" : "text-left",
                    )}
                  >
                    {c.sortKey ? (
                      <button
                        type="button"
                        title={c.sortTitle}
                        onClick={() => setSort((s) => nextHostSort(s, c.sortKey!))}
                        className={cn(
                          "inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-gray-300",
                          active && "text-gray-300",
                        )}
                      >
                        {c.label}
                        {active &&
                          (sort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" aria-hidden />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden />
                          ))}
                      </button>
                    ) : c.label ? (
                      c.label
                    ) : (
                      <span className="sr-only">Actions</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-violet-500/5">
                  {HOST_COLUMNS.map((c) => (
                    <td key={c.id} className={cellPad}>
                      {c.id === "host" ? (
                        <div className="space-y-2">
                          <Skeleton className="h-3.5 w-48 max-w-full bg-gray-800" />
                          <Skeleton className="h-1.5 w-full bg-gray-800" />
                        </div>
                      ) : c.id === "actions" ? null : (
                        <Skeleton className="h-3 w-full max-w-[7rem] bg-gray-800" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && slice.rows.length === 0 && (
              <tr>
                <td colSpan={HOST_COLUMNS.length} className="px-3 py-10 text-center text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    No hosts match
                    <button type="button" onClick={clearAll} className="text-violet-400 hover:text-violet-300">
                      Clear filters
                    </button>
                  </span>
                </td>
              </tr>
            )}

            {!loading &&
              slice.rows.map((row) => (
                <tr
                  key={row.ip}
                  onClick={(e) => onRowClick(e, row.ip)}
                  className="cursor-pointer border-b border-violet-500/5 align-middle transition-colors hover:bg-violet-500/5"
                >
                  {HOST_COLUMNS.map((c) => (
                    <td
                      key={c.id}
                      className={cn(cellPad, "overflow-hidden", c.align === "right" && "text-right")}
                    >
                      <HostColumnCell column={c.id} host={row} />
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          <span className="tabular-nums">
            {hostsFooterLabel(visible.length, sort, filtering ? rows.length : undefined)}
          </span>
          <span className="flex-1" />
          {slice.pageCount > 1 && (
            <nav aria-label="Pages" className="flex items-center gap-1">
              <span className="mr-2 tabular-nums">
                {slice.from.toLocaleString("en-US")}–{slice.to.toLocaleString("en-US")}
              </span>
              <PagerButton label="Previous page" disabled={slice.page <= 1} onClick={() => setPage(slice.page - 1)}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PagerButton>
              {pageWindow(slice.page, slice.pageCount).map((p, i) =>
                p === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-gray-600">
                    …
                  </span>
                ) : (
                  <PagerButton key={p} label={`Page ${p}`} active={p === slice.page} onClick={() => setPage(p)}>
                    {p}
                  </PagerButton>
                ),
              )}
              <PagerButton
                label="Next page"
                disabled={slice.page >= slice.pageCount}
                onClick={() => setPage(slice.page + 1)}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </PagerButton>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

export default EnvironmentDataTable;

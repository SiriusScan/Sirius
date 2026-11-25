/**
 * VulnTable — the one vulnerability table, with three column presets:
 *
 * - "scan":      CVE, Severity, CVSS, Summary, Port/Service, Hosts
 * - "host":      CVE, Severity, CVSS, Summary, Port/Service, Sources, First seen
 * - "inventory": CVE, Severity, CVSS, Summary, Hosts, Sources, First seen
 *
 * Rows sort by CVSS, highest first; clicking a sortable header re-sorts.
 * With `renderDetail`, a chevron before the CVE expands a detail row under
 * it (the System Monitor resources table's pattern), e.g. a host finding's
 * per-source records.
 * A search box matches the CVE, summary and port/service; `severityFilter`
 * (usually a SeverityStrip selection) narrows the rows. Clicking a row opens
 * /vulnerability?id=<id>. Rows are paginated (10, 25 or 50 per page), so at
 * most 50 rows render at once and no virtualisation is needed.
 *
 * Summaries are the API's clean `summary` (ADR-4), never the raw scanner text.
 */

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowDown, ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { getCvssBarColor, getCvssTextColor } from "~/utils/severityTheme";
import { formatDateTime } from "~/utils/formatDateTime";
import { SourceBadge } from "./SourceBadge";
import { SeverityTag } from "./SeverityTag";
import type { Severity } from "./severity";
import {
  DEFAULT_VULN_SORT,
  PAGE_SIZES,
  SORTABLE_COLUMNS,
  VULN_PRESET_COLUMNS,
  filterVulnRows,
  nextSort,
  pageWindow,
  paginate,
  sortVulnRows,
  vulnerabilityHref,
  type PageSize,
  type VulnColumnId,
  type VulnRow,
  type VulnSort,
  type VulnSortKey,
  type VulnTablePreset,
} from "./vulnTableModel";

export type { VulnRow, VulnTablePreset } from "./vulnTableModel";

export interface VulnTableProps {
  preset: VulnTablePreset;
  rows: readonly VulnRow[];
  /** Show only these levels; empty or absent shows all. */
  severityFilter?: readonly Severity[];
  /** Skeleton rows while the data loads. */
  loading?: boolean;
  /** Right of the search box, e.g. a compact SeverityStrip or Export. */
  toolbar?: React.ReactNode;
  /** Shown instead of the table when there are no rows at all. */
  emptyState?: React.ReactNode;
  /** Left of the pager, e.g. "Open all 162 in Vulnerabilities". */
  footer?: React.ReactNode;
  defaultPageSize?: PageSize;
  searchPlaceholder?: string;
  /** When set, each row can expand to show this under it. */
  renderDetail?: (row: VulnRow) => React.ReactNode;
  /** What the expanded row shows, for the toggle's label, e.g. "source records". */
  detailLabel?: string;
  className?: string;
}

const HEADERS: Record<VulnColumnId, { label: string; col: string; align?: "right" | "center" }> = {
  id: { label: "CVE", col: "w-40" },
  severity: { label: "Severity", col: "w-24" },
  cvss: { label: "CVSS", col: "w-24" },
  summary: { label: "Summary", col: "" },
  portService: { label: "Port / service", col: "w-48" },
  hosts: { label: "Hosts", col: "w-20", align: "right" },
  sources: { label: "Sources", col: "w-32" },
  firstSeen: { label: "First seen", col: "w-36" },
};

const cellPad = "px-3 py-2.5";

function CvssCell({ score }: { score: number }) {
  if (!(Number.isFinite(score) && score > 0)) return <span className="text-gray-600">—</span>;
  const value = Math.min(score, 10);
  return (
    <span className="flex items-center gap-2">
      <span className={cn("w-7 text-xs font-semibold tabular-nums", getCvssTextColor(value))}>
        {value.toFixed(1)}
      </span>
      <span className="h-1 w-10 overflow-hidden rounded-full bg-gray-800" aria-hidden>
        <span
          className={cn("block h-full rounded-full", getCvssBarColor(value))}
          style={{ width: `${value * 10}%` }}
        />
      </span>
    </span>
  );
}

function Cell({ column, row }: { column: VulnColumnId; row: VulnRow }) {
  switch (column) {
    case "id":
      return (
        <Link
          href={vulnerabilityHref(row.id)}
          onClick={(e) => e.stopPropagation()}
          className="block truncate font-mono text-xs font-semibold text-white transition-colors hover:text-violet-300"
          title={row.id}
        >
          {row.id}
        </Link>
      );
    case "severity":
      return <SeverityTag severity={row.severity} />;
    case "cvss":
      return <CvssCell score={row.cvss} />;
    case "summary":
      return row.summary ? (
        <span className="block truncate text-gray-300" title={row.summary}>
          {row.summary}
        </span>
      ) : (
        <span className="text-gray-600">—</span>
      );
    case "portService":
      return row.portService ? (
        <span className="block truncate whitespace-nowrap font-mono text-xs text-gray-400" title={row.portServiceDetail ?? row.portService}>
          {row.portService}
        </span>
      ) : (
        <span className="text-gray-600">—</span>
      );
    case "hosts":
      return typeof row.hosts === "number" ? (
        <span className="tabular-nums text-gray-300">{row.hosts.toLocaleString("en-US")}</span>
      ) : (
        <span className="text-gray-600">—</span>
      );
    case "sources": {
      const sources = row.sources ?? [];
      if (sources.length === 0) return <span className="text-gray-600">—</span>;
      const shown = sources.slice(0, 2);
      return (
        <span className="flex items-center gap-1" title={sources.join(", ")}>
          {shown.map((s) => (
            <SourceBadge key={s} source={s} className="px-1.5 text-[10px]" />
          ))}
          {sources.length > shown.length && (
            <span className="text-[10px] text-gray-500">+{sources.length - shown.length}</span>
          )}
        </span>
      );
    }
    case "firstSeen": {
      const title = [
        row.firstSeen && `First seen ${formatDateTime(row.firstSeen, "long")}`,
        row.lastSeen && `Last seen ${formatDateTime(row.lastSeen, "long")}`,
      ]
        .filter(Boolean)
        .join("\n");
      return (
        <span className="whitespace-nowrap text-xs text-gray-400" title={title || undefined}>
          {formatDateTime(row.firstSeen)}
        </span>
      );
    }
  }
}

export function VulnTable({
  preset,
  rows,
  severityFilter,
  loading = false,
  toolbar,
  emptyState,
  footer,
  defaultPageSize = 10,
  searchPlaceholder = "Search CVE, summary or port",
  renderDetail,
  detailLabel = "details",
  className,
}: VulnTableProps) {
  const router = useRouter();
  const columns = VULN_PRESET_COLUMNS[preset];
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<VulnSort>(DEFAULT_VULN_SORT);
  const [pageSize, setPageSize] = useState<PageSize>(defaultPageSize);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggleDetail = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Keyed by content, so a new array with the same levels changes nothing.
  const filterKey = (severityFilter ?? []).join(",");
  const severities = useMemo(
    () => (filterKey ? (filterKey.split(",") as Severity[]) : []),
    [filterKey],
  );
  // A new filter starts again from the first page (as do search and page
  // size, in their handlers). New rows keep the page; paginate clamps it.
  useEffect(() => setPage(1), [filterKey]);

  const visible = useMemo(
    () => sortVulnRows(filterVulnRows(rows, { search, severities }), sort),
    [rows, search, severities, sort],
  );
  const slice = paginate(visible, page, pageSize);

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const open = (id: string) => void router.push(vulnerabilityHref(id));

  const onRowClick = (e: React.MouseEvent, id: string) => {
    // Let people select text without navigating.
    if (window.getSelection()?.toString()) return;
    if (e.metaKey || e.ctrlKey) {
      window.open(vulnerabilityHref(id), "_blank", "noopener");
      return;
    }
    open(id);
  };

  if (!loading && rows.length === 0 && emptyState) return <>{emptyState}</>;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <label className="relative flex min-w-[14rem] max-w-sm flex-1 items-center">
          <span className="sr-only">Search vulnerabilities</span>
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-gray-500" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-md border border-gray-700/70 bg-gray-900/60 pl-8 pr-7 text-xs text-gray-200 placeholder:text-gray-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => changeSearch("")}
              className="absolute right-1.5 rounded p-0.5 text-gray-500 hover:text-gray-300"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </label>
        {toolbar && <div className="flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <colgroup>
            {columns.map((c) => (
              <col key={c} className={HEADERS[c].col} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-violet-500/10">
              {columns.map((c) => {
                const h = HEADERS[c];
                const sortable = SORTABLE_COLUMNS.has(c);
                const active = sortable && sort.key === c;
                const align = h.align === "right" ? "text-right" : "text-left";
                return (
                  <th
                    key={c}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn(
                      "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500",
                      align,
                    )}
                  >
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => setSort((s) => nextSort(s, c as VulnSortKey))}
                        className={cn(
                          "inline-flex items-center gap-1 uppercase tracking-wider transition-colors hover:text-gray-300",
                          active && "text-gray-300",
                        )}
                      >
                        {h.label}
                        {active &&
                          (sort.dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" aria-hidden />
                          ) : (
                            <ArrowDown className="h-3 w-3" aria-hidden />
                          ))}
                      </button>
                    ) : (
                      h.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-violet-500/5">
                  {columns.map((c) => (
                    <td key={c} className={cellPad}>
                      <Skeleton className="h-3 w-full max-w-[10rem] bg-gray-800" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading && slice.rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-sm text-gray-500">
                  {rows.length === 0 ? (
                    "No vulnerabilities"
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      No vulnerabilities match
                      {search && (
                        <button
                          type="button"
                          onClick={() => changeSearch("")}
                          className="text-violet-400 hover:text-violet-300"
                        >
                          Clear search
                        </button>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            )}

            {!loading &&
              slice.rows.map((row) => {
                const isExpanded = !!renderDetail && expanded.has(row.id);
                const Chevron = isExpanded ? ChevronDown : ChevronRight;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      tabIndex={0}
                      onClick={(e) => onRowClick(e, row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.target === e.currentTarget) open(row.id);
                      }}
                      aria-expanded={renderDetail ? isExpanded : undefined}
                      className="cursor-pointer border-b border-violet-500/5 outline-none transition-colors hover:bg-violet-500/5 focus-visible:bg-violet-500/10"
                    >
                      {columns.map((c) => (
                        <td
                          key={c}
                          className={cn(cellPad, "overflow-hidden", HEADERS[c].align === "right" && "text-right")}
                        >
                          {c === "id" && renderDetail ? (
                            <span className="flex min-w-0 items-center gap-1.5">
                              <button
                                type="button"
                                aria-label={`${isExpanded ? "Hide" : "Show"} ${detailLabel} for ${row.id}`}
                                aria-expanded={isExpanded}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDetail(row.id);
                                }}
                                onKeyDown={(e) => e.stopPropagation()}
                                className="shrink-0 rounded text-gray-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                              >
                                <Chevron className="h-4 w-4" aria-hidden />
                              </button>
                              <span className="min-w-0">
                                <Cell column={c} row={row} />
                              </span>
                            </span>
                          ) : (
                            <Cell column={c} row={row} />
                          )}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-violet-500/5 bg-gray-900/40">
                        <td colSpan={columns.length} className="px-3 py-3 pl-9">
                          {renderDetail(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {!loading && (slice.total > 0 || footer) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
          {slice.total > 0 && (
            <span className="tabular-nums">
              Showing {slice.from.toLocaleString("en-US")}–{slice.to.toLocaleString("en-US")} of{" "}
              {slice.total.toLocaleString("en-US")}
              {slice.total !== rows.length && ` (filtered from ${rows.length.toLocaleString("en-US")})`}
            </span>
          )}
          {footer}
          <span className="flex-1" />
          {slice.total > PAGE_SIZES[0] && (
            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value) as PageSize);
                  setPage(1);
                }}
                className="h-7 rounded-md border border-gray-700/70 bg-gray-900/60 px-1.5 text-xs text-gray-300 focus:border-violet-500/50 focus:outline-none"
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          {slice.pageCount > 1 && (
            <nav aria-label="Pages" className="flex items-center gap-1">
              <PagerButton
                label="Previous page"
                disabled={slice.page <= 1}
                onClick={() => setPage(slice.page - 1)}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </PagerButton>
              {pageWindow(slice.page, slice.pageCount).map((p, i) =>
                p === "gap" ? (
                  <span key={`gap-${i}`} className="px-1 text-gray-600">
                    …
                  </span>
                ) : (
                  <PagerButton
                    key={p}
                    label={`Page ${p}`}
                    current={p === slice.page}
                    onClick={() => setPage(p)}
                  >
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

function PagerButton({
  label,
  current = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  current?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40",
        current
          ? "bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/30"
          : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200",
      )}
    >
      {children}
    </button>
  );
}

export default VulnTable;

/**
 * vulnTableModel.ts — VulnTable's pure parts: row type, presets, search,
 * severity filter, sorting and pagination. Tested in vulnTableModel.test.ts.
 */

import { severityRank, type Severity } from "./severity";

export type VulnRow = {
  /** CVE or finding id; the row opens /vulnerability?id=<id>. */
  id: string;
  severity: Severity;
  /** 0–10; 0 or less shows "—". */
  cvss: number;
  /** Clean description from the API (ADR-4), not the raw scanner text. */
  summary: string;
  /** Affected hosts. */
  hosts?: number;
  /** e.g. "22/tcp OpenSSH 10.0p2". */
  portService?: string;
  sources?: string[];
  firstSeen?: string;
  lastSeen?: string;
};

export type VulnTablePreset = "scan" | "inventory" | "host";

export type VulnColumnId =
  | "id"
  | "severity"
  | "cvss"
  | "summary"
  | "portService"
  | "hosts"
  | "sources"
  | "firstSeen";

export const VULN_PRESET_COLUMNS: Record<VulnTablePreset, readonly VulnColumnId[]> = {
  scan: ["id", "severity", "cvss", "summary", "portService", "hosts"],
  host: ["id", "severity", "cvss", "summary", "portService", "sources", "firstSeen"],
  inventory: ["id", "severity", "cvss", "summary", "hosts", "sources", "firstSeen"],
};

export type VulnSortKey = "id" | "severity" | "cvss" | "hosts" | "firstSeen";

export const SORTABLE_COLUMNS: ReadonlySet<VulnColumnId> = new Set<VulnColumnId>([
  "id",
  "severity",
  "cvss",
  "hosts",
  "firstSeen",
]);

export type SortDirection = "asc" | "desc";

export interface VulnSort {
  key: VulnSortKey;
  dir: SortDirection;
}

export const DEFAULT_VULN_SORT: VulnSort = { key: "cvss", dir: "desc" };

export const PAGE_SIZES = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export function vulnerabilityHref(id: string): string {
  return `/vulnerability?id=${encodeURIComponent(id)}`;
}

/** Matches the query against the id, summary and port/service. */
export function filterVulnRows(
  rows: readonly VulnRow[],
  { search = "", severities = [] }: { search?: string; severities?: readonly Severity[] } = {},
): VulnRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (severities.length > 0 && !severities.includes(row.severity)) return false;
    if (!q) return true;
    return (
      row.id.toLowerCase().includes(q) ||
      (row.summary ?? "").toLowerCase().includes(q) ||
      (row.portService ?? "").toLowerCase().includes(q)
    );
  });
}

function timeOf(value: string | undefined): number | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function sortValue(row: VulnRow, key: VulnSortKey): number | string | null {
  switch (key) {
    case "id":
      return row.id;
    case "severity":
      return severityRank(row.severity);
    case "cvss":
      return Number.isFinite(row.cvss) && row.cvss > 0 ? row.cvss : null;
    case "hosts":
      return typeof row.hosts === "number" ? row.hosts : null;
    case "firstSeen":
      return timeOf(row.firstSeen);
  }
}

/**
 * Sorts a copy. Missing values go last in either direction; ties fall back
 * to severity, then CVSS (both most severe first), then id.
 */
export function sortVulnRows(rows: readonly VulnRow[], sort: VulnSort = DEFAULT_VULN_SORT): VulnRow[] {
  const sign = sort.dir === "asc" ? 1 : -1;
  const compare = (a: VulnRow, b: VulnRow): number => {
    const av = sortValue(a, sort.key);
    const bv = sortValue(b, sort.key);
    if (av !== bv) {
      if (av === null) return 1;
      if (bv === null) return -1;
      const c =
        typeof av === "string" && typeof bv === "string"
          ? av.localeCompare(bv, "en", { numeric: true })
          : (av as number) - (bv as number);
      if (c !== 0) return c * sign;
    }
    const sev = severityRank(b.severity) - severityRank(a.severity);
    if (sev !== 0) return sev;
    const cvss = (b.cvss || 0) - (a.cvss || 0);
    if (cvss !== 0) return cvss;
    return a.id.localeCompare(b.id, "en", { numeric: true });
  };
  return [...rows].sort(compare);
}

/** Clicking a column sorts it; clicking it again flips the direction. */
export function nextSort(current: VulnSort, key: VulnSortKey): VulnSort {
  if (current.key === key) return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  // Text reads A→Z first; numbers, severity and dates most/newest first.
  return { key, dir: key === "id" ? "asc" : "desc" };
}

export interface PageSlice<T> {
  rows: T[];
  /** 1-based, clamped to the available pages. */
  page: number;
  pageCount: number;
  /** 1-based index of the first and last row shown; 0 when empty. */
  from: number;
  to: number;
  total: number;
}

export function paginate<T>(rows: readonly T[], page: number, pageSize: number): PageSlice<T> {
  const total = rows.length;
  const size = Math.max(1, Math.floor(pageSize));
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);
  const start = (current - 1) * size;
  const slice = rows.slice(start, start + size);
  return {
    rows: slice,
    page: current,
    pageCount,
    from: total === 0 ? 0 : start + 1,
    to: start + slice.length,
    total,
  };
}

/** Page buttons around the current page: [1, "gap", 4, 5, 6, "gap", 17]. */
export function pageWindow(page: number, pageCount: number, width = 5): Array<number | "gap"> {
  if (pageCount <= width + 2) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const half = Math.floor(width / 2);
  let start = Math.max(2, page - half);
  let end = Math.min(pageCount - 1, page + half);
  if (page - half < 2) end = Math.min(pageCount - 1, width);
  if (page + half > pageCount - 1) start = Math.max(2, pageCount - width + 1);
  const pages: Array<number | "gap"> = [1];
  if (start > 2) pages.push("gap");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push("gap");
  pages.push(pageCount);
  return pages;
}

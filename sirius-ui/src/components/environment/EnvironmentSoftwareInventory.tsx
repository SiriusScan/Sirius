/**
 * EnvironmentSoftwareInventory — the Environment page's Software tab: every
 * package the Sirius agent reported, across hosts, with search, filters, an
 * SBOM export and a details dialog.
 *
 * Packages come only from the agent; a network scan can't see them, so an
 * empty inventory says so and points to the agent. The API does not yet
 * correlate packages with vulnerabilities (vulnerability_count is always 0),
 * so this view makes no security claim about a package.
 */

import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Eye, Search, Server, SlidersHorizontal, X } from "lucide-react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import { Skeleton } from "~/components/lib/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { EmptyState } from "~/components/shared/EmptyState";
import { formatDateTime } from "~/utils/formatDateTime";
import type { EnvironmentTableData } from "~/server/api/routers/host";

// ── Types ────────────────────────────────────────────────────────────────────

interface EnvironmentPackage {
  name: string;
  version: string;
  publisher: string;
  architecture: string;
  source: string;
  host_count: number;
  hosts: string[];
  install_dates?: string[];
  size_mb?: number;
  size_bytes?: number;
  description?: string;
  cpe?: string;
  dependencies?: string[];
  latest_install_date?: string;
}

interface PackageFilters {
  search: string;
  publisher: string;
  architecture: string;
  source: string;
}

const NO_FILTERS: PackageFilters = { search: "", publisher: "", architecture: "", source: "" };

/** The operator console's Agent view. */
const AGENT_HREF = "/terminal?view=agent";

export interface EnvironmentSoftwareInventoryProps {
  /** Unused; kept so older callers still type. */
  softwareStats?: unknown;
  /** Unused; kept so older callers still type. */
  hosts?: EnvironmentTableData[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sizeLabel(pkg: Pick<EnvironmentPackage, "size_mb" | "size_bytes">): string | null {
  if (pkg.size_mb) return `${pkg.size_mb.toFixed(1)} MB`;
  if (pkg.size_bytes) return `${(pkg.size_bytes / 1024 / 1024).toFixed(1)} MB`;
  return null;
}

function latestInstall(pkg: EnvironmentPackage): string | null {
  if (pkg.latest_install_date) return pkg.latest_install_date;
  const times = (pkg.install_dates ?? [])
    .map((d) => Date.parse(d))
    .filter((t) => Number.isFinite(t));
  return times.length > 0 ? new Date(Math.max(...times)).toISOString() : null;
}

function unique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b));
}

const selectClass =
  "mt-1 h-8 w-full rounded-md border border-gray-700/70 bg-gray-900/60 px-2 text-xs text-gray-200 focus:border-violet-500/50 focus:outline-none";
const toolbarButton =
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border border-gray-700/70 px-2.5 text-xs font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-800/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:cursor-default disabled:opacity-40";

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-0.5 truncate text-sm text-gray-200">{children}</dd>
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export const EnvironmentSoftwareInventory: React.FC<EnvironmentSoftwareInventoryProps> = () => {
  const [filters, setFilters] = useState<PackageFilters>(NO_FILTERS);
  const [search, setSearch] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<EnvironmentPackage | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Search the server after typing pauses, not on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.search === search ? f : { ...f, search })), 300);
    return () => clearTimeout(t);
  }, [search]);

  const inventoryQuery = api.host.getEnvironmentSoftwareInventory.useQuery(
    {
      search: filters.search,
      publisher: filters.publisher || undefined,
      architecture: filters.architecture || undefined,
      source: filters.source || undefined,
      limit: 100,
    },
    {
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );
  const inventory = inventoryQuery.data;
  const packages = useMemo(
    () => (inventory?.packages ?? []) as EnvironmentPackage[],
    [inventory],
  );

  const filterOptions = useMemo(
    () => ({
      publishers: unique(packages.map((p) => p.publisher)),
      architectures: unique(packages.map((p) => p.architecture)),
      sources: unique(packages.map((p) => p.source)),
    }),
    [packages],
  );

  const filtering =
    !!filters.search || !!filters.publisher || !!filters.architecture || !!filters.source;
  const activeFilterCount = [filters.publisher, filters.architecture, filters.source].filter(Boolean).length;

  const setFilter = (key: Exclude<keyof PackageFilters, "search">, value: string) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setSearch("");
    setFilters(NO_FILTERS);
  };

  const exportSbom = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      total_packages: inventory?.total_packages ?? 0,
      total_hosts: inventory?.total_hosts ?? 0,
      packages,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sirius-sbom-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  // ── States ────────────────────────────────────────────────────────────
  if (inventoryQuery.isError && !inventory) {
    return (
      <EmptyState
        variant="error"
        title="Couldn't load software"
        reason="The Sirius API didn't answer. The rest of the page still works."
        primary={{ label: "Retry", onClick: () => void inventoryQuery.refetch() }}
      />
    );
  }

  if (!inventoryQuery.isLoading && packages.length === 0 && !filtering) {
    return (
      <EmptyState
        variant="needs-agent"
        title="No software inventory yet"
        reason="A network scan can't see installed packages. Install the Sirius agent on a host to list its software here."
        primary={{ label: "Get the agent", href: AGENT_HREF }}
      />
    );
  }

  const total = inventory?.total_packages ?? 0;

  return (
    <section className="scanner-section scanner-section-padding" aria-label="Software">
      {/* Filter row */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <label className="relative flex min-w-[14rem] max-w-xs flex-1 items-center">
          <span className="sr-only">Search packages</span>
          <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-gray-500" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search packages by name"
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
        <span className="text-xs tabular-nums text-gray-500">
          {total.toLocaleString("en-US")} package{total === 1 ? "" : "s"}
        </span>
        <span className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            className={cn(toolbarButton, activeFilterCount > 0 && "border-violet-500/40 bg-violet-500/15 text-violet-200")}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-violet-500/25 px-1.5 text-[10px] leading-4 tabular-nums">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showFilters && "rotate-180")} aria-hidden />
          </button>
          <button type="button" onClick={exportSbom} disabled={packages.length === 0} className={toolbarButton}>
            <Download className="h-3.5 w-3.5" aria-hidden />
            Export SBOM
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 grid grid-cols-1 gap-3 rounded-md border border-violet-500/10 bg-gray-900/40 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs text-gray-400">
            Publisher
            <select
              value={filters.publisher}
              onChange={(e) => setFilter("publisher", e.target.value)}
              className={selectClass}
            >
              <option value="">All publishers</option>
              {filterOptions.publishers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-gray-400">
            Architecture
            <select
              value={filters.architecture}
              onChange={(e) => setFilter("architecture", e.target.value)}
              className={selectClass}
            >
              <option value="">All architectures</option>
              {filterOptions.architectures.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-gray-400">
            Source
            <select
              value={filters.source}
              onChange={(e) => setFilter("source", e.target.value)}
              className={selectClass}
            >
              <option value="">All sources</option>
              {filterOptions.sources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={clearFilters} className={toolbarButton}>
              <X className="h-3.5 w-3.5" aria-hidden />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Package table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
          <colgroup>
            <col />
            <col className="w-48" />
            <col className="w-32" />
            <col className="w-24" />
            <col className="w-20" />
            <col className="w-12" />
          </colgroup>
          <thead>
            <tr className="border-b border-violet-500/10 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <th scope="col" className="px-3 py-2">Package</th>
              <th scope="col" className="px-3 py-2">Publisher</th>
              <th scope="col" className="px-3 py-2">Architecture</th>
              <th scope="col" className="px-3 py-2">Size</th>
              <th scope="col" className="px-3 py-2 text-right">Hosts</th>
              <th scope="col" className="px-3 py-2">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {inventoryQuery.isLoading &&
              Array.from({ length: 4 }, (_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-violet-500/5">
                  {Array.from({ length: 5 }, (__, j) => (
                    <td key={j} className="px-3 py-3">
                      <Skeleton className="h-3 w-full max-w-[8rem] bg-gray-800" />
                    </td>
                  ))}
                  <td />
                </tr>
              ))}

            {!inventoryQuery.isLoading && packages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    No packages match
                    <button type="button" onClick={clearFilters} className="text-violet-400 hover:text-violet-300">
                      Clear filters
                    </button>
                  </span>
                </td>
              </tr>
            )}

            {!inventoryQuery.isLoading &&
              packages.map((pkg, index) => (
                <tr
                  key={`${pkg.name}-${pkg.version}-${pkg.architecture}-${index}`}
                  onClick={() => setSelectedPackage(pkg)}
                  className="cursor-pointer border-b border-violet-500/5 transition-colors hover:bg-violet-500/5"
                >
                  <td className="overflow-hidden px-3 py-2.5">
                    <div className="truncate font-medium text-gray-100" title={pkg.name}>
                      {pkg.name}
                    </div>
                    <div className="truncate font-mono text-xs text-gray-500">{pkg.version}</div>
                  </td>
                  <td className="truncate px-3 py-2.5 text-gray-300">{pkg.publisher || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded border border-gray-700/70 bg-gray-800/60 px-1.5 py-0.5 font-mono text-[11px] text-gray-300">
                      {pkg.architecture || "any"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs tabular-nums text-gray-400">{sizeLabel(pkg) ?? "—"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-gray-300">
                    {pkg.host_count.toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPackage(pkg);
                      }}
                      aria-label={`Details for ${pkg.name}`}
                      className="rounded p-1 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300"
                    >
                      <Eye className="h-4 w-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!inventoryQuery.isLoading && packages.length > 0 && total > packages.length && (
        <p className="mt-3 text-xs text-gray-500">
          Showing the first {packages.length.toLocaleString("en-US")} of {total.toLocaleString("en-US")}. Search to
          narrow the list.
        </p>
      )}

      {/* Package details (portaled above the header by Dialog) */}
      <Dialog open={!!selectedPackage} onOpenChange={(open) => !open && setSelectedPackage(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-violet-500/20 bg-gray-900 text-gray-100">
          {selectedPackage && (
            <>
              <DialogHeader>
                <DialogTitle className="text-base text-white">{selectedPackage.name}</DialogTitle>
                <DialogDescription className="font-mono text-xs text-gray-400">
                  {selectedPackage.version}
                </DialogDescription>
              </DialogHeader>
              {selectedPackage.description && (
                <p className="text-sm text-gray-300">{selectedPackage.description}</p>
              )}
              <dl className="grid grid-cols-2 gap-4">
                <Detail label="Publisher">{selectedPackage.publisher || "—"}</Detail>
                <Detail label="Architecture">{selectedPackage.architecture || "any"}</Detail>
                <Detail label="Source">{selectedPackage.source || "—"}</Detail>
                <Detail label="Size">{sizeLabel(selectedPackage) ?? "—"}</Detail>
                <Detail label="Hosts">{selectedPackage.host_count.toLocaleString("en-US")}</Detail>
                <Detail label="Latest install">{formatDateTime(latestInstall(selectedPackage))}</Detail>
              </dl>
              {selectedPackage.cpe && (
                <Detail label="CPE">
                  <span className="font-mono text-xs">{selectedPackage.cpe}</span>
                </Detail>
              )}
              {selectedPackage.dependencies && selectedPackage.dependencies.length > 0 && (
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                    Dependencies
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {selectedPackage.dependencies.slice(0, 10).map((dep) => (
                      <span
                        key={dep}
                        className="rounded border border-gray-700/70 bg-gray-800/60 px-1.5 py-0.5 font-mono text-[11px] text-gray-300"
                      >
                        {dep}
                      </span>
                    ))}
                    {selectedPackage.dependencies.length > 10 && (
                      <span className="text-xs text-gray-500">
                        +{selectedPackage.dependencies.length - 10} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  Installed on
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selectedPackage.hosts.map((host) => (
                    <span
                      key={host}
                      className="inline-flex items-center gap-1 rounded-md border border-violet-500/20 bg-gray-900/50 px-2 py-0.5 text-xs text-gray-200"
                    >
                      <Server className="h-3 w-3 text-gray-500" aria-hidden />
                      {host}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default EnvironmentSoftwareInventory;

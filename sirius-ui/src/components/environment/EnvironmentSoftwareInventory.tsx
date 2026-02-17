/**
 * EnvironmentSoftwareInventory — Extracted from environment.tsx.
 * Displays the full SBOM software inventory with search, filters, and detail modal.
 * V4 dark-first styling with violet accents.
 */

import React, { useMemo, useState } from "react";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import { SeverityBadge } from "~/components/shared/SeverityBadge";
import {
  Search,
  Filter,
  Package,
  AlertTriangle,
  Shield,
  ChevronDown,
  X,
  Eye,
  Server,
  Download,
} from "lucide-react";

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
  vulnerability_count?: number;
  size_mb?: number;
  description?: string;
  cpe?: string;
  dependencies?: string[];
  size_bytes?: number;
  latest_install_date?: string;
  oldest_install_date?: string;
}

interface PackageFilters {
  search: string;
  publisher: string;
  architecture: string;
  vulnerabilityStatus: "all" | "vulnerable" | "clean";
  source: string;
  sizeRange: "all" | "small" | "medium" | "large";
  hasVulnerabilities: "all" | "yes" | "no";
}

interface EnvironmentSoftwareInventoryProps {
  softwareStats: any;
  hosts: EnvironmentTableData[];
}

// ── Component ────────────────────────────────────────────────────────────────

export const EnvironmentSoftwareInventory: React.FC<
  EnvironmentSoftwareInventoryProps
> = ({ softwareStats, hosts }) => {
  const [filters, setFilters] = useState<PackageFilters>({
    search: "",
    publisher: "",
    architecture: "",
    vulnerabilityStatus: "all",
    source: "",
    sizeRange: "all",
    hasVulnerabilities: "all",
  });
  const [selectedPackage, setSelectedPackage] =
    useState<EnvironmentPackage | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch environment software inventory
  const { data: packageInventory, isLoading: isPackageLoading } =
    api.host.getEnvironmentSoftwareInventory.useQuery(
      {
        search: filters.search,
        publisher: filters.publisher || undefined,
        architecture: filters.architecture || undefined,
        vulnerability_status:
          filters.vulnerabilityStatus !== "all"
            ? filters.vulnerabilityStatus
            : undefined,
        source: filters.source || undefined,
        limit: 100,
      },
      {
        enabled: true,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  // Get unique filter options
  const filterOptions = useMemo(() => {
    if (!packageInventory?.packages)
      return { publishers: [], architectures: [], sources: [] };

    const publishers = [
      ...new Set(
        packageInventory.packages.map((p: any) => p.publisher).filter(Boolean),
      ),
    ];
    const architectures = [
      ...new Set(
        packageInventory.packages
          .map((p: any) => p.architecture)
          .filter(Boolean),
      ),
    ];
    const sources = [
      ...new Set(
        packageInventory.packages.map((p: any) => p.source).filter(Boolean),
      ),
    ];

    return { publishers, architectures, sources };
  }, [packageInventory]);

  const handleFilterChange = (key: keyof PackageFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      publisher: "",
      architecture: "",
      vulnerabilityStatus: "all",
      source: "",
      sizeRange: "all",
      hasVulnerabilities: "all",
    });
  };

  const getVulnerabilityBadge = (count?: number) => {
    if (!count || count === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
          <Shield className="mr-1 h-3 w-3" />
          Clean
        </span>
      );
    }

    const severity = count >= 5 ? "critical" : count >= 2 ? "high" : "medium";

    return (
      <span className="inline-flex items-center gap-1.5">
        <SeverityBadge severity={severity} />
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span className="text-xs">{count} vulns</span>
      </span>
    );
  };

  if (isPackageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500" />
        <span className="ml-2 text-gray-400">
          Loading software inventory...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Software Inventory Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-violet-400" />
          <h2 className="text-xl font-semibold text-gray-100">
            Software Inventory
          </h2>
          <span className="rounded-full bg-violet-500/20 px-3 py-1 text-sm font-medium text-violet-300">
            {packageInventory?.total_packages || 0} packages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const exportData = {
                timestamp: new Date().toISOString(),
                total_packages: packageInventory?.total_packages || 0,
                total_hosts: packageInventory?.total_hosts || 0,
                packages: packageInventory?.packages || [],
              };
              const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `sirius-sbom-${new Date().toISOString().split("T")[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-violet-500/30 hover:bg-gray-900/70"
          >
            <Download className="h-4 w-4" />
            Export SBOM
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-violet-500/30 hover:bg-gray-900/70"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showFilters && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages by name..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full rounded-md border border-violet-500/20 bg-gray-900/50 py-2 pl-10 pr-4 text-sm text-gray-200 focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-violet-500/20 bg-gray-900/50 p-4 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Publisher
              </label>
              <select
                value={filters.publisher}
                onChange={(e) =>
                  handleFilterChange("publisher", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-violet-500/20 bg-gray-900/70 px-3 py-2 text-gray-200"
              >
                <option value="">All Publishers</option>
                {filterOptions.publishers.map((publisher: any) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Architecture
              </label>
              <select
                value={filters.architecture}
                onChange={(e) =>
                  handleFilterChange("architecture", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-violet-500/20 bg-gray-900/70 px-3 py-2 text-gray-200"
              >
                <option value="">All Architectures</option>
                {filterOptions.architectures.map((arch: any) => (
                  <option key={arch} value={arch}>
                    {arch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Vulnerability Status
              </label>
              <select
                value={filters.vulnerabilityStatus}
                onChange={(e) =>
                  handleFilterChange(
                    "vulnerabilityStatus",
                    e.target.value as any,
                  )
                }
                className="mt-1 w-full rounded-md border border-violet-500/20 bg-gray-900/70 px-3 py-2 text-gray-200"
              >
                <option value="all">All Packages</option>
                <option value="vulnerable">Vulnerable</option>
                <option value="clean">Clean</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                className="mt-1 w-full rounded-md border border-violet-500/20 bg-gray-900/70 px-3 py-2 text-gray-200"
              >
                <option value="">All Sources</option>
                {filterOptions.sources.map((source: any) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Package Size
              </label>
              <select
                value={filters.sizeRange}
                onChange={(e) =>
                  handleFilterChange("sizeRange", e.target.value as any)
                }
                className="mt-1 w-full rounded-md border border-violet-500/20 bg-gray-900/70 px-3 py-2 text-gray-200"
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (&lt;1MB)</option>
                <option value="medium">Medium (1-50MB)</option>
                <option value="large">Large (&gt;50MB)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-md border border-violet-500/20 bg-gray-900/50 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-900/70"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Package Table */}
      <div className="scanner-section overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-violet-500/10">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Publisher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Architecture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Host Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Security Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-violet-200/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-500/5">
              {packageInventory?.packages?.map(
                (pkg: any, index: number) => (
                  <tr
                    key={`${pkg.name}-${pkg.version}-${index}`}
                    className="odd:bg-gray-800/40 even:bg-gray-900/40 hover:bg-violet-500/[0.06] transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-100">
                          {pkg.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          v{pkg.version}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-200">
                      {pkg.publisher || "Unknown"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300">
                        {pkg.architecture || "any"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-200">
                      {pkg.size_mb
                        ? `${pkg.size_mb.toFixed(1)} MB`
                        : pkg.size_bytes
                          ? `${(pkg.size_bytes / 1024 / 1024).toFixed(1)} MB`
                          : "Unknown"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <Server className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-200">
                          {pkg.host_count}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getVulnerabilityBadge(pkg.vulnerability_count)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => setSelectedPackage(pkg)}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ),
              ) || (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No packages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Package Details Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setSelectedPackage(null)}
            />

            <div className="inline-block transform overflow-hidden rounded-lg border border-violet-500/20 bg-gray-900 text-left align-bottom shadow-xl sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-100">
                    Package Details
                  </h3>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-100">
                      {selectedPackage.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Version {selectedPackage.version}
                    </p>
                    {selectedPackage.description && (
                      <p className="mt-2 text-sm text-gray-300">
                        {selectedPackage.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Publisher:
                      </span>
                      <p className="text-sm text-gray-200">
                        {selectedPackage.publisher || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Architecture:
                      </span>
                      <p className="text-sm text-gray-200">
                        {selectedPackage.architecture || "any"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Source:
                      </span>
                      <p className="text-sm text-gray-200">
                        {selectedPackage.source}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Size:
                      </span>
                      <p className="text-sm text-gray-200">
                        {selectedPackage.size_mb
                          ? `${selectedPackage.size_mb.toFixed(1)} MB`
                          : selectedPackage.size_bytes
                            ? `${(selectedPackage.size_bytes / 1024 / 1024).toFixed(1)} MB`
                            : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Host Count:
                      </span>
                      <p className="text-sm text-gray-200">
                        {selectedPackage.host_count}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Latest Install:
                      </span>
                      <p className="text-sm text-gray-200">
                        {selectedPackage.latest_install_date
                          ? new Date(
                              selectedPackage.latest_install_date,
                            ).toLocaleDateString()
                          : selectedPackage.install_dates &&
                              selectedPackage.install_dates.length > 0
                            ? new Date(
                                Math.max(
                                  ...selectedPackage.install_dates.map((d) =>
                                    new Date(d).getTime(),
                                  ),
                                ),
                              ).toLocaleDateString()
                            : "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* CPE Identifier */}
                  {selectedPackage.cpe && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        CPE Identifier:
                      </span>
                      <p className="font-mono text-sm text-gray-200">
                        {selectedPackage.cpe}
                      </p>
                    </div>
                  )}

                  {/* Dependencies */}
                  {selectedPackage.dependencies &&
                    selectedPackage.dependencies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Dependencies:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedPackage.dependencies
                            .slice(0, 10)
                            .map((dep, index) => (
                              <span
                                key={index}
                                className="inline-flex rounded bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-300"
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
                    <span className="text-sm font-medium text-gray-500">
                      Installed on Hosts:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedPackage.hosts.map((host) => (
                        <span
                          key={host}
                          className="inline-flex rounded-full border border-violet-500/20 bg-gray-900/50 px-2 py-1 text-xs font-medium text-gray-200"
                        >
                          {host}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Security Status:
                    </span>
                    <div className="mt-2">
                      {getVulnerabilityBadge(
                        selectedPackage.vulnerability_count,
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-violet-500/10 px-6 py-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-violet-500/20 bg-gray-900/50 px-4 py-2 text-base font-medium text-gray-200 shadow-sm transition-colors hover:bg-gray-900/70 focus:outline-none focus:ring-2 focus:ring-violet-500 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedPackage(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentSoftwareInventory;

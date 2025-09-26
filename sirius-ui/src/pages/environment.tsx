import React, { useMemo, useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { columns } from "~/components/EnvironmentDataTableColumns";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";
import { api } from "~/utils/api";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { type HostVulnerabilityCounts } from "~/types/vulnerabilityTypes";
import { generateMockHostVulnerabilityMap } from "~/utils/generate-mock-data";
import { Tab } from "@headlessui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "~/components/lib/utils";
import { debugLog } from "~/utils/debug";
import PageWrapper from "~/components/PageWrapper";
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
  Calendar,
  User,
  Download,
  HardDrive,
} from "lucide-react";

// For SEO
export const metadata = {
  title: "Environment | Sirius",
  description: "View and manage hosts in your environment",
};

// Types for software inventory
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
  sizeRange: "all" | "small" | "medium" | "large"; // <1MB, 1-50MB, >50MB
  hasVulnerabilities: "all" | "yes" | "no";
}

// Software Inventory Component
const EnvironmentSoftwareInventory: React.FC<{
  softwareStats: any;
  hosts: EnvironmentTableData[];
}> = ({ softwareStats, hosts }) => {
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
        limit: 100, // Pagination
      },
      {
        enabled: true,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
      }
    );

  // Get unique filter options
  const filterOptions = useMemo(() => {
    if (!packageInventory?.packages)
      return { publishers: [], architectures: [], sources: [] };

    const publishers = [
      ...new Set(
        packageInventory.packages.map((p) => p.publisher).filter(Boolean)
      ),
    ];
    const architectures = [
      ...new Set(
        packageInventory.packages.map((p) => p.architecture).filter(Boolean)
      ),
    ];
    const sources = [
      ...new Set(
        packageInventory.packages.map((p) => p.source).filter(Boolean)
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
        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <Shield className="mr-1 h-3 w-3" />
          Clean
        </span>
      );
    }

    const severity = count >= 5 ? "critical" : count >= 2 ? "high" : "medium";
    const colors = {
      critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    };

    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
          colors[severity]
        )}
      >
        <AlertTriangle className="mr-1 h-3 w-3" />
        {count} vulns
      </span>
    );
  };

  if (isPackageLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
        <span className="ml-2">Loading software inventory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Software Inventory Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-violet-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Software Inventory
          </h2>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
            {packageInventory?.total_packages || 0} packages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Export SBOM data as JSON
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
              link.download = `sirius-sbom-${
                new Date().toISOString().split("T")[0]
              }.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Download className="h-4 w-4" />
            Export SBOM
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showFilters && "rotate-180"
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
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          />
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:grid-cols-3 lg:grid-cols-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Publisher
              </label>
              <select
                value={filters.publisher}
                onChange={(e) =>
                  handleFilterChange("publisher", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">All Publishers</option>
                {filterOptions.publishers.map((publisher) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Architecture
              </label>
              <select
                value={filters.architecture}
                onChange={(e) =>
                  handleFilterChange("architecture", e.target.value)
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">All Architectures</option>
                {filterOptions.architectures.map((arch) => (
                  <option key={arch} value={arch}>
                    {arch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vulnerability Status
              </label>
              <select
                value={filters.vulnerabilityStatus}
                onChange={(e) =>
                  handleFilterChange(
                    "vulnerabilityStatus",
                    e.target.value as any
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="all">All Packages</option>
                <option value="vulnerable">Vulnerable</option>
                <option value="clean">Clean</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Source
              </label>
              <select
                value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">All Sources</option>
                {filterOptions.sources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Package Size
              </label>
              <select
                value={filters.sizeRange}
                onChange={(e) =>
                  handleFilterChange("sizeRange", e.target.value as any)
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="all">All Sizes</option>
                <option value="small">Small (&lt;1MB)</option>
                <option value="medium">Medium (1-50MB)</option>
                <option value="large">Large (&gt;50MB)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Has Vulnerabilities
              </label>
              <select
                value={filters.hasVulnerabilities}
                onChange={(e) =>
                  handleFilterChange(
                    "hasVulnerabilities",
                    e.target.value as any
                  )
                }
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="all">All Packages</option>
                <option value="yes">With Vulnerabilities</option>
                <option value="no">No Vulnerabilities</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Package Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Publisher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Architecture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Host Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Security Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {packageInventory?.packages?.map((pkg, index) => (
                <tr
                  key={`${pkg.name}-${pkg.version}-${index}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {pkg.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        v{pkg.version}
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {pkg.publisher || "Unknown"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                      {pkg.architecture || "any"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {pkg.size_mb
                      ? `${pkg.size_mb.toFixed(1)} MB`
                      : pkg.size_bytes
                      ? `${(pkg.size_bytes / 1024 / 1024).toFixed(1)} MB`
                      : "Unknown"}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <Server className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
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
                      className="text-violet-600 hover:text-violet-900 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
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
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setSelectedPackage(null)}
            ></div>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-white px-4 pb-4 pt-5 dark:bg-gray-800 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    Package Details
                  </h3>
                  <button
                    onClick={() => setSelectedPackage(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedPackage.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Version {selectedPackage.version}
                    </p>
                    {selectedPackage.description && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        {selectedPackage.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Publisher:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.publisher || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Architecture:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.architecture || "any"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Source:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.source}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Size:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.size_mb
                          ? `${selectedPackage.size_mb.toFixed(1)} MB`
                          : selectedPackage.size_bytes
                          ? `${(
                              selectedPackage.size_bytes /
                              1024 /
                              1024
                            ).toFixed(1)} MB`
                          : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Host Count:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.host_count}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Latest Install:
                      </span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.latest_install_date
                          ? new Date(
                              selectedPackage.latest_install_date
                            ).toLocaleDateString()
                          : selectedPackage.install_dates &&
                            selectedPackage.install_dates.length > 0
                          ? new Date(
                              Math.max(
                                ...selectedPackage.install_dates.map((d) =>
                                  new Date(d).getTime()
                                )
                              )
                            ).toLocaleDateString()
                          : "Unknown"}
                      </p>
                    </div>
                  </div>

                  {/* CPE Identifier */}
                  {selectedPackage.cpe && (
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        CPE Identifier:
                      </span>
                      <p className="font-mono text-sm text-gray-900 dark:text-gray-100">
                        {selectedPackage.cpe}
                      </p>
                    </div>
                  )}

                  {/* Dependencies */}
                  {selectedPackage.dependencies &&
                    selectedPackage.dependencies.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Dependencies:
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {selectedPackage.dependencies
                            .slice(0, 10)
                            .map((dep, index) => (
                              <span
                                key={index}
                                className="inline-flex rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                              >
                                {dep}
                              </span>
                            ))}
                          {selectedPackage.dependencies.length > 10 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{selectedPackage.dependencies.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Installed on Hosts:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedPackage.hosts.map((host) => (
                        <span
                          key={host}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {host}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Security Status:
                    </span>
                    <div className="mt-2">
                      {getVulnerabilityBadge(
                        selectedPackage.vulnerability_count
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 dark:bg-gray-700 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
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

// System Fingerprinting Component
const EnvironmentSystemFingerprinting: React.FC<{
  hosts: EnvironmentTableData[];
}> = ({ hosts }) => {
  const [selectedHost, setSelectedHost] = useState<string | null>(null);

  // Fetch enhanced host data for fingerprinting
  const { data: enhancedHostData, isLoading: isHostLoading } =
    api.host.getEnhancedHostData.useQuery(
      {
        ip: selectedHost || "",
        include: ["fingerprint", "metadata"],
        enhanced: true,
      },
      {
        enabled: !!selectedHost,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    );

  const systemFingerprint = enhancedHostData?.system_fingerprint;

  return (
    <div className="space-y-6">
      {/* System Fingerprinting Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-6 w-6 text-violet-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            System Fingerprinting
          </h2>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
            {hosts.length} hosts
          </span>
        </div>
      </div>

      {/* Host Selection */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Host for Detailed Fingerprinting:
        </label>
        <select
          value={selectedHost || ""}
          onChange={(e) => setSelectedHost(e.target.value || null)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 md:w-96"
        >
          <option value="">Select a host...</option>
          {hosts.map((host) => (
            <option key={host.hid} value={host.ip}>
              {host.hostname} ({host.ip}) - {host.os}
            </option>
          ))}
        </select>
      </div>

      {/* Fingerprinting Data Display */}
      {selectedHost && (
        <div className="space-y-6">
          {isHostLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
              <span className="ml-2">Loading fingerprinting data...</span>
            </div>
          ) : systemFingerprint ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Hardware Information */}
              {systemFingerprint.fingerprint?.hardware && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Hardware Information
                  </h3>
                  <div className="space-y-4">
                    {systemFingerprint.fingerprint.hardware.cpu && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          CPU
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            {systemFingerprint.fingerprint.hardware.cpu.model}
                          </p>
                          <p>
                            {systemFingerprint.fingerprint.hardware.cpu.cores}{" "}
                            cores,{" "}
                            {
                              systemFingerprint.fingerprint.hardware.cpu
                                .architecture
                            }
                          </p>
                        </div>
                      </div>
                    )}
                    {systemFingerprint.fingerprint.hardware.memory && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Memory
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            Total:{" "}
                            {(
                              systemFingerprint.fingerprint.hardware.memory
                                .total_bytes /
                              1024 /
                              1024 /
                              1024
                            ).toFixed(1)}{" "}
                            GB
                          </p>
                          <p>
                            Available:{" "}
                            {(
                              systemFingerprint.fingerprint.hardware.memory
                                .available_bytes /
                              1024 /
                              1024 /
                              1024
                            ).toFixed(1)}{" "}
                            GB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Network Information */}
              {systemFingerprint.fingerprint?.network && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Network Configuration
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Network Interfaces
                      </h4>
                      <div className="mt-2 space-y-2">
                        {systemFingerprint.fingerprint.network.interfaces
                          ?.slice(0, 5)
                          .map((iface: any, index: number) => (
                            <div
                              key={index}
                              className="rounded bg-gray-50 p-3 dark:bg-gray-700"
                            >
                              <div className="text-sm">
                                <span className="font-medium">
                                  {iface.name || iface.display_name}
                                </span>
                                {iface.type && (
                                  <span className="ml-2 text-gray-500">
                                    ({iface.type})
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {iface.ipv4_addresses?.join(", ") || "No IPv4"}
                              </div>
                              {iface.mac_address && (
                                <div className="text-xs text-gray-500">
                                  MAC: {iface.mac_address}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                    {systemFingerprint.fingerprint.network.dns_servers && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          DNS Servers
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {systemFingerprint.fingerprint.network.dns_servers.join(
                            ", "
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Collection Information */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                  Collection Information
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Platform:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {systemFingerprint.platform}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Collected At:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {systemFingerprint.collected_at
                        ? new Date(
                            systemFingerprint.collected_at
                          ).toLocaleString()
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Collection Time:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {systemFingerprint.collection_duration_ms ||
                      enhancedHostData?.agent_metadata?.scan_summary
                        ?.collection_duration_ms
                        ? `${
                            systemFingerprint.collection_duration_ms ||
                            enhancedHostData.agent_metadata.scan_summary
                              .collection_duration_ms
                          }ms`
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Source:
                    </span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {systemFingerprint.source || "sirius-agent"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No fingerprinting data available for this host.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EnvironmentContent = () => {
  const [activeView, setActiveView] = useState("table");
  const [networkSummary, setNetworkSummary] = useState({
    totalHosts: 0,
    activeHosts: 0,
    operatingSystems: {} as Record<string, number>,
    riskyHosts: 0,
  });

  // Fetch hosts data from API - with optimized settings
  const environmentQuery = api.host.getEnvironmentSummary.useQuery(undefined, {
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch aggregated vulnerability data - sequential to prevent overloading
  const vulnerabilityQuery = api.vulnerability.getAllVulnerabilities.useQuery(
    undefined,
    {
      enabled: !environmentQuery.isLoading,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Fetch enhanced software statistics for SBOM data
  const softwareStatsQuery = api.host.getEnvironmentSoftwareStats.useQuery(
    undefined,
    {
      enabled: !environmentQuery.isLoading,
      retry: 1,
      retryDelay: 1000,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  // Loading state - more granular control
  const isDataLoading =
    environmentQuery.isLoading ||
    vulnerabilityQuery.isLoading ||
    softwareStatsQuery.isLoading;

  // Process the vulnerability data from the vulnerability query
  const hostVulnMap = useMemo(() => {
    if (vulnerabilityQuery.data) {
      return vulnerabilityQuery.data.hostTotals || {};
    }
    return {};
  }, [vulnerabilityQuery.data]);

  // Process and enhance the host data with vulnerability information if needed
  const hosts = useMemo(() => {
    // No hosts data yet
    if (!environmentQuery.data || environmentQuery.data.length === 0) {
      return [];
    }

    // If we have vulnerability data from the query, we can enhance the environment data
    if (vulnerabilityQuery.data) {
      return environmentQuery.data.map((host) => ({
        ...host,
        // Update vulnerabilityCount with the actual count from our vulnerability query if available
        vulnerabilityCount:
          hostVulnMap[host.ip]?.total || host.vulnerabilityCount || 0,
      }));
    }

    // Otherwise just use the environment data as is
    return environmentQuery.data;
  }, [environmentQuery.data, vulnerabilityQuery.data, hostVulnMap]);

  // Calculate network summary statistics
  useEffect(() => {
    if (hosts && hosts.length > 0) {
      // Count operating systems
      const osCounts: Record<string, number> = {};
      hosts.forEach((host) => {
        const os = host.os || "Unknown";
        osCounts[os] = (osCounts[os] || 0) + 1;
      });

      // Count risky hosts (hosts with critical or high vulnerabilities)
      const riskyHosts = hosts.filter(
        (host) => host.vulnerabilityCount > 20
      ).length;

      setNetworkSummary({
        totalHosts: hosts.length,
        activeHosts: hosts.filter((host) => host.status !== "offline").length,
        operatingSystems: osCounts,
        riskyHosts,
      });
    }
  }, [hosts]);

  // Prepare data for charts
  const osChartData = useMemo(() => {
    return Object.entries(networkSummary.operatingSystems).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [networkSummary.operatingSystems]);

  // Error handling
  const error =
    environmentQuery.error ||
    vulnerabilityQuery.error ||
    softwareStatsQuery.error;
  const errorMessage = error ? error.message : null;

  debugLog("Environment", "Render state", {
    isDataLoading,
    environmentLoading: environmentQuery.isLoading,
    vulnerabilityLoading: vulnerabilityQuery.isLoading,
    softwareStatsLoading: softwareStatsQuery.isLoading,
    hostsCount: hosts?.length || 0,
  });

  return (
    <div className="relative z-20">
      {/* Header */}
      <div className="z-10 mb-6 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <EnvironmentIcon
            width="35px"
            height="35px"
            className="ml-4 mt-1 flex dark:fill-white"
          />
          <h1 className="ml-3 text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100">
            Environment
          </h1>
        </div>
        <div className="mr-4 flex items-center gap-2">
          <button className="rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
            Add Host
          </button>
          <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            Schedule Scan
          </button>
        </div>
      </div>

      {/* Network Summary Cards */}
      {!isDataLoading && !error && hosts && hosts.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Hosts
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {networkSummary.totalHosts}
              </div>
              <div className="text-sm font-medium text-green-500">
                {networkSummary.activeHosts} active
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              High Risk Hosts
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {networkSummary.riskyHosts}
              </div>
              <div className="text-sm font-medium text-red-500">
                {networkSummary.riskyHosts > 0
                  ? "Action Required"
                  : "All Clear"}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Vulnerabilities
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {vulnerabilityQuery.data?.counts.total || 0}
              </div>
              <div className="flex gap-2">
                <div className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-300">
                  {vulnerabilityQuery.data?.counts.critical || 0} Critical
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Software Packages
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {softwareStatsQuery.data?.total_packages || 0}
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-blue-500">
                  {softwareStatsQuery.data?.top_software.length || 0} Publishers
                </div>
                <div className="text-xs text-gray-500">
                  {
                    Object.keys(
                      softwareStatsQuery.data?.architecture_distribution || {}
                    ).length
                  }{" "}
                  Architectures
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              SBOM Collection
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {/* Calculate hosts with SBOM data */}
                {Math.round(
                  (softwareStatsQuery.data?.total_packages || 0) > 0
                    ? softwareStatsQuery.data?.total_hosts || 0
                    : 0
                )}
              </div>
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-green-500">
                  {softwareStatsQuery.data?.total_hosts || 0 > 0
                    ? `${Math.round(
                        (softwareStatsQuery.data?.total_packages || 0) > 0
                          ? 100
                          : 0
                      )}% Coverage`
                    : "No Data"}
                </div>
                <div className="text-xs text-gray-500">Agent Enhanced</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Last Scan
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                {/* Calculate most recent scan timestamp */}
                {hosts.some((h) => h.lastScanDate)
                  ? new Date(
                      Math.max(
                        ...hosts
                          .filter((h) => h.lastScanDate)
                          .map((h) => new Date(h.lastScanDate || 0).getTime())
                      )
                    ).toLocaleDateString()
                  : "Never"}
              </div>
              <button className="text-sm font-medium text-violet-500 hover:text-violet-600">
                Run New Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      {!isDataLoading && !error && hosts && hosts.length > 0 && (
        <div className="mb-4 px-4">
          <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeView === "table"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
              onClick={() => setActiveView("table")}
            >
              Table View
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeView === "software"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
              onClick={() => setActiveView("software")}
            >
              Software Inventory
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeView === "fingerprinting"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
              onClick={() => setActiveView("fingerprinting")}
            >
              System Fingerprinting
            </button>
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium",
                activeView === "visual"
                  ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
              onClick={() => setActiveView("visual")}
            >
              Visual View
            </button>
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-6 px-4">
        <p className="text-gray-600 dark:text-gray-300">
          {activeView === "software"
            ? "View and analyze all software packages installed across your environment. Search, filter, and inspect package details for security assessment."
            : activeView === "fingerprinting"
            ? "Examine detailed system fingerprinting data including hardware configuration, network interfaces, and collection metadata from agent scans."
            : "Manage and monitor all hosts in your environment. View vulnerability statistics and risk assessments for each host."}
        </p>
      </div>

      {/* Data Table, Software Inventory, or Visual View */}
      <div className="px-4">
        {isDataLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
            <span className="ml-2">
              Loading hosts and vulnerability data...
            </span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
            <p>Error loading data: {errorMessage}</p>
          </div>
        ) : !hosts || hosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
            <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <EnvironmentIcon
                width="24px"
                height="24px"
                className="text-gray-500"
              />
            </div>
            <h3 className="mb-2 text-lg font-medium">No hosts found</h3>
            <p className="text-sm text-gray-500">
              Add hosts to your environment to start tracking vulnerabilities.
            </p>
            <button className="mt-4 rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
              Add First Host
            </button>
          </div>
        ) : (
          <div>
            {activeView === "table" ? (
              <EnvironmentDataTable columns={columns} data={hosts} />
            ) : activeView === "software" ? (
              <EnvironmentSoftwareInventory
                softwareStats={softwareStatsQuery.data}
                hosts={hosts}
              />
            ) : activeView === "fingerprinting" ? (
              <EnvironmentSystemFingerprinting hosts={hosts} />
            ) : (
              <div>
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* OS Distribution Chart */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="mb-4 text-lg font-medium">
                      OS Distribution
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={osChartData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Software Architecture Distribution */}
                  {softwareStatsQuery.data && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <h3 className="mb-4 text-lg font-medium">
                        Software Architecture Distribution
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(
                              softwareStatsQuery.data.architecture_distribution
                            ).map(([name, value]) => ({ name, value }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Software Publishers */}
                {softwareStatsQuery.data &&
                  softwareStatsQuery.data.top_software.length > 0 && (
                    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                      <h3 className="mb-4 text-lg font-medium">
                        Top Software Publishers
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {softwareStatsQuery.data.top_software
                          .slice(0, 9)
                          .map(({ publisher, count }) => (
                            <div
                              key={publisher}
                              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                            >
                              <span className="mr-2 truncate font-medium text-gray-900 dark:text-gray-100">
                                {publisher}
                              </span>
                              <span className="whitespace-nowrap rounded bg-blue-100 px-2 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                {count} packages
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Environment = () => {
  return (
    <Layout>
      <PageWrapper pageName="Environment">
        <EnvironmentContent />
      </PageWrapper>
    </Layout>
  );
};

export default Environment;

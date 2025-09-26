import React, { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "~/utils/api";
import {
  Package,
  Search,
  Filter,
  Download,
  Calendar,
  HardDrive,
} from "lucide-react";
import { Badge } from "~/components/lib/ui/badge";

interface SoftwareInventoryProps {
  hostIp: string;
}

interface PackageInfo {
  name: string;
  version: string;
  architecture?: string;
  install_date?: string;
  size_bytes?: number;
  description?: string;
  publisher?: string;
  source?: string;
}

// Custom hook for debouncing values
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const SoftwareInventory: React.FC<SoftwareInventoryProps> = ({ hostIp }) => {
  // Input state (for immediate UI updates)
  const [searchFilter, setSearchFilter] = useState("");
  const [architectureFilter, setArchitectureFilter] = useState("");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Debounced values (for API calls)
  const debouncedSearchFilter = useDebounce(searchFilter, 300);
  const debouncedArchitectureFilter = useDebounce(architectureFilter, 300);
  const debouncedPublisherFilter = useDebounce(publisherFilter, 300);

  // Event handlers with useCallback to prevent unnecessary re-renders
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchFilter(e.target.value);
    },
    []
  );

  const handleArchitectureChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setArchitectureFilter(e.target.value);
    },
    []
  );

  const handlePublisherChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPublisherFilter(e.target.value);
    },
    []
  );

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev) => !prev);
  }, []);

  // Fetch software inventory data using debounced values
  const {
    data: inventoryData,
    isLoading,
    isError,
    refetch,
  } = api.host.getHostSoftwareInventory.useQuery(
    {
      ip: hostIp,
      filter: debouncedSearchFilter || undefined,
      architecture: debouncedArchitectureFilter || undefined,
      publisher: debouncedPublisherFilter || undefined,
    },
    {
      enabled: !!hostIp,
      staleTime: 60000, // Cache for 1 minute
      // Keep previous data while loading new results
      keepPreviousData: true,
    }
  );

  // Get unique architectures and publishers for filter dropdowns
  const filterOptions = useMemo(() => {
    if (!inventoryData?.packages) return { architectures: [], publishers: [] };

    const architectures = new Set<string>();
    const publishers = new Set<string>();

    inventoryData.packages.forEach((pkg: PackageInfo) => {
      if (pkg.architecture) architectures.add(pkg.architecture);
      if (pkg.publisher) publishers.add(pkg.publisher);
    });

    return {
      architectures: Array.from(architectures).sort(),
      publishers: Array.from(publishers).sort(),
    };
  }, [inventoryData?.packages]);

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "N/A";
    const sizes = ["B", "KB", "MB", "GB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < sizes.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${sizes[i]}`;
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  // Get source badge color
  const getSourceBadgeColor = (source?: string) => {
    switch (source?.toLowerCase()) {
      case "dpkg":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "rpm":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "snap":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "pip":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
      case "npm":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "registry":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
          <span className="ml-2">Loading software inventory...</span>
        </div>
      </div>
    );
  }

  if (isError || !inventoryData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Package className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Software Inventory
          </h3>
        </div>
        <div className="text-center">
          <p className="mb-4 text-gray-500">
            Failed to load software inventory data.
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-violet-500 px-4 py-2 text-white hover:bg-violet-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Statistics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-violet-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Software Inventory
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(inventoryData.collected_at)}
            </p>
            <p className="text-sm text-gray-500">
              Source: {inventoryData.source}
            </p>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-md bg-violet-50 p-4 dark:bg-violet-900/20">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-violet-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Packages
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {inventoryData.total_count}
                </p>
              </div>
            </div>
          </div>

          {inventoryData.statistics?.architectures && (
            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Architectures
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(inventoryData.statistics.architectures).length}
                  </p>
                </div>
              </div>
            </div>
          )}

          {inventoryData.statistics?.publishers && (
            <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
              <div className="flex items-center">
                <Download className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Publishers
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Object.keys(inventoryData.statistics.publishers).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Filter Packages
          </h4>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm text-violet-500 hover:text-violet-600"
          >
            <Filter className="mr-1 h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        <div className="space-y-4">
          {/* Search Filter */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchFilter}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Architecture and Publisher Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Architecture
                </label>
                <select
                  value={architectureFilter}
                  onChange={handleArchitectureChange}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                  Publisher
                </label>
                <select
                  value={publisherFilter}
                  onChange={handlePublisherChange}
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Publishers</option>
                  {filterOptions.publishers.map((pub) => (
                    <option key={pub} value={pub}>
                      {pub}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Package List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="p-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Packages ({inventoryData.package_count})
          </h4>
        </div>

        {inventoryData.packages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Package
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Version
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Architecture
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Size
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Installed
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {inventoryData.packages.map(
                  (pkg: PackageInfo, index: number) => (
                    <tr
                      key={`${pkg.name}-${pkg.version}-${index}`}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {pkg.name}
                          </div>
                          {pkg.description && (
                            <div className="max-w-xs truncate text-sm text-gray-500">
                              {pkg.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {pkg.version}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {pkg.architecture || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {formatFileSize(pkg.size_bytes)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(pkg.install_date)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          className={`text-xs ${getSourceBadgeColor(
                            pkg.source
                          )}`}
                        >
                          {pkg.source || "unknown"}
                        </Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No packages found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No software packages match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoftwareInventory;

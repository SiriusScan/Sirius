import React, { useState, useMemo, useEffect, useCallback } from "react";
import { api } from "~/utils/api";
import { Package, Search, Filter, HardDrive } from "lucide-react";
import { SECTION_HEADER } from "~/utils/themeConstants";

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

const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const SoftwareInventory: React.FC<SoftwareInventoryProps> = ({ hostIp }) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [architectureFilter, setArchitectureFilter] = useState("");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchFilter, 300);
  const debouncedArch = useDebounce(architectureFilter, 300);
  const debouncedPub = useDebounce(publisherFilter, 300);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchFilter(e.target.value),
    [],
  );

  const {
    data: inventoryData,
    isLoading,
    isError,
    refetch,
  } = api.host.getHostSoftwareInventory.useQuery(
    {
      ip: hostIp,
      filter: debouncedSearch || undefined,
      architecture: debouncedArch || undefined,
      publisher: debouncedPub || undefined,
    },
    { enabled: !!hostIp, staleTime: 60000, keepPreviousData: true },
  );

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

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "—";
    const sizes = ["B", "KB", "MB", "GB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < sizes.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${sizes[i]}`;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !inventoryData) {
    return (
      <div className="scanner-section scanner-section-padding">
        <div className="flex flex-col items-center gap-3 py-6">
          <Package className="h-6 w-6 text-gray-600" />
          <p className="text-sm text-gray-500">Failed to load software inventory</p>
          <button
            onClick={() => void refetch()}
            className="rounded-md border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="flex items-center gap-4">
        <div className="scanner-section flex items-center gap-2 px-3 py-2">
          <Package className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-sm font-semibold text-white">{inventoryData.total_count ?? inventoryData.package_count}</span>
          <span className="text-[10px] text-gray-500">packages</span>
        </div>
        {inventoryData.statistics?.architectures && (
          <div className="scanner-section flex items-center gap-2 px-3 py-2">
            <HardDrive className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-sm font-semibold text-white">{Object.keys(inventoryData.statistics.architectures).length}</span>
            <span className="text-[10px] text-gray-500">architectures</span>
          </div>
        )}
      </div>

      {/* Search & filters */}
      <div className="scanner-section scanner-section-padding">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search packages..."
              value={searchFilter}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-violet-500/10 bg-gray-900/50 py-1.5 pl-8 pr-3 text-xs text-white placeholder-gray-600 focus:border-violet-500/30 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[10px] font-medium transition-colors ${
              showFilters
                ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                : "border-violet-500/10 text-gray-500 hover:text-gray-300"
            }`}
          >
            <Filter className="h-3 w-3" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-violet-500/5 pt-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Architecture
              </label>
              <select
                value={architectureFilter}
                onChange={(e) => setArchitectureFilter(e.target.value)}
                className="w-full rounded-md border border-violet-500/10 bg-gray-900/50 px-2.5 py-1.5 text-xs text-white focus:border-violet-500/30 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-gray-300"
              >
                <option value="">All</option>
                {filterOptions.architectures.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-gray-500">
                Publisher
              </label>
              <select
                value={publisherFilter}
                onChange={(e) => setPublisherFilter(e.target.value)}
                className="w-full rounded-md border border-violet-500/10 bg-gray-900/50 px-2.5 py-1.5 text-xs text-white focus:border-violet-500/30 focus:outline-none [&>option]:bg-gray-900 [&>option]:text-gray-300"
              >
                <option value="">All</option>
                {filterOptions.publishers.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Package table */}
      <div className="scanner-section overflow-hidden">
        {inventoryData.packages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-violet-500/10 text-left text-gray-500">
                  <th className="px-3 py-2 font-medium">Package</th>
                  <th className="px-3 py-2 font-medium">Version</th>
                  <th className="px-3 py-2 font-medium">Arch</th>
                  <th className="px-3 py-2 font-medium">Size</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/5">
                {inventoryData.packages.map((pkg: PackageInfo, idx: number) => (
                  <tr key={`${pkg.name}-${idx}`} className="text-gray-300 hover:bg-gray-900/30">
                    <td className="px-3 py-1.5">
                      <div className="font-medium text-white">{pkg.name}</div>
                      {pkg.description && (
                        <div className="max-w-xs truncate text-[10px] text-gray-600">{pkg.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-gray-400">{pkg.version}</td>
                    <td className="px-3 py-1.5 text-gray-500">{pkg.architecture || "—"}</td>
                    <td className="px-3 py-1.5 text-gray-500">{formatFileSize(pkg.size_bytes)}</td>
                    <td className="px-3 py-1.5">
                      {pkg.source && (
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${getSourceColor(pkg.source)}`}>
                          {pkg.source}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8">
            <Package className="h-5 w-5 text-gray-600" />
            <p className="text-xs text-gray-500">No packages match filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

function getSourceColor(source?: string): string {
  switch (source?.toLowerCase()) {
    case "dpkg": return "bg-blue-500/15 text-blue-400";
    case "rpm": return "bg-red-500/15 text-red-400";
    case "snap": return "bg-emerald-500/15 text-emerald-400";
    case "pip": return "bg-yellow-500/15 text-yellow-400";
    case "npm": return "bg-orange-500/15 text-orange-400";
    case "registry": return "bg-violet-500/15 text-violet-400";
    default: return "bg-gray-800 text-gray-400";
  }
}

export default SoftwareInventory;

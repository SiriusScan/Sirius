import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import {
  VulnerabilityCommandTable,
  type VulnTableItem,
} from "~/components/VulnerabilityCommandTable";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Download,
  FileJson,
  FileSpreadsheet,
  SlidersHorizontal,
  CommandIcon as Command,
  LayoutList,
  LayoutGrid,
  AlertTriangle,
  MoreVertical,
  FileText,
  Tag,
  ClipboardList,
  CheckCircle2,
  Settings,
  Trash2,
  Share2,
  Copy,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "~/components/lib/ui/tabs";
import { columns } from "~/components/VulnerabilityTableColumns";
import { cn } from "~/components/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";
import { VulnerabilityTable } from "~/components/VulnerabilityTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/lib/ui/dropdown-menu";
import { useToast } from "~/components/Toast";
import { ViewModeSelector } from "~/components/ViewModeSelector";

// Define our vulnerability interface based on the API structure
interface SimpleVulnerability {
  vid: string;
  title: string;
  hostCount: number;
  description: string;
  riskScore: number;
}

// Map to our table data format
interface VulnTableData {
  cve: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  description: string;
  published: string;
  lastModified: string;
  references: string[];
  affectedHosts: string[];
  riskScore: number;
  selected?: boolean;
}

// Selected view mode for the vulnerability table
type ViewMode = "table" | "command" | "grouped";

// Add this interface after the ViewMode type definition
interface AdvancedFilters {
  riskScoreRange: [number, number];
  dateRange: string;
  hasExploit: boolean | null;
  hasFixAvailable: boolean | null;
  affectedHostsRange: [number, number];
  selectedTags: string[];
}

// Central Vulnerability Navigator
const VulnerabilityNavigator: NextPage = () => {
  // Core state
  const [vulnerabilities, setVulnerabilities] = useState<VulnTableData[]>([]);
  const [filteredVulns, setFilteredVulns] = useState<VulnTableData[]>([]);
  const [selectedVulns, setSelectedVulns] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverities, setActiveSeverities] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("command");
  const [expandedVuln, setExpandedVuln] = useState<string | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Add new state for advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
    riskScoreRange: [0, 10],
    dateRange: "all",
    hasExploit: null,
    hasFixAvailable: null,
    affectedHostsRange: [0, Infinity],
    selectedTags: [],
  });

  // Fetch all vulnerabilities using our API
  const {
    data: vulnData,
    isLoading,
    refetch,
  } = api.vulnerability.getAllVulnerabilities.useQuery(undefined, {
    // Refetch vulnerability data every 5 minutes or when window regains focus
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fix the applyFilters function to return the filtered array
  const applyFilters = useCallback(
    (items: VulnTableData[]): VulnTableData[] => {
      return items.filter((vuln) => {
        // Search query filter
        if (
          searchQuery &&
          !vuln.cve.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !vuln.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Severity filter
        if (
          activeSeverities.length > 0 &&
          !activeSeverities.includes(vuln.severity)
        ) {
          return false;
        }

        return true;
      });
    },
    [searchQuery, activeSeverities]
  );

  // Fix the applyAdvancedFilters function to properly handle undefined values
  const applyAdvancedFilters = useCallback(
    (vulns: VulnTableData[]): VulnTableData[] => {
      if (!advancedFilters) return vulns;

      return vulns.filter((vuln) => {
        // Risk score filter
        if (
          vuln.riskScore < advancedFilters.riskScoreRange[0] ||
          vuln.riskScore > advancedFilters.riskScoreRange[1]
        ) {
          return false;
        }

        // Date range filter
        if (advancedFilters.dateRange !== "all") {
          const vulnDate = new Date(vuln.published);
          const now = new Date();
          const daysDiff = Math.floor(
            (now.getTime() - vulnDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          switch (advancedFilters.dateRange) {
            case "24h":
              if (daysDiff > 1) return false;
              break;
            case "7d":
              if (daysDiff > 7) return false;
              break;
            case "30d":
              if (daysDiff > 30) return false;
              break;
            case "90d":
              if (daysDiff > 90) return false;
              break;
          }
        }

        // Affected hosts range filter
        const hostCount = vuln.affectedHosts.length;
        if (
          hostCount < advancedFilters.affectedHostsRange[0] ||
          (advancedFilters.affectedHostsRange[1] !== Infinity &&
            hostCount > advancedFilters.affectedHostsRange[1])
        ) {
          return false;
        }

        return true;
      });
    },
    [advancedFilters]
  );

  // Process data when vulnerability data is loaded
  useEffect(() => {
    if (vulnData?.vulnerabilities?.length) {
      // Map API data to our table format
      const processedVulns: VulnTableData[] = vulnData.vulnerabilities.map(
        (vuln: SimpleVulnerability) => ({
          cve: vuln.vid,
          // Calculate severity from CVSS score
          severity: determineSeverity(vuln.riskScore),
          description: vuln.description,
          riskScore: vuln.riskScore,
          published: new Date().toISOString(), // Use current date as fallback
          lastModified: new Date().toISOString(),
          references: [],
          affectedHosts: Array(vuln.hostCount).fill("dummy-host"), // Placeholder for host data
        })
      );

      setVulnerabilities(processedVulns);
      setFilteredVulns(processedVulns);
    }
  }, [vulnData]);

  // Update the existing useEffect for filters to include advanced filters
  useEffect(() => {
    let filtered = [...vulnerabilities];

    // Apply search and severity filters first
    if (searchQuery || activeSeverities.length > 0) {
      filtered = applyFilters(filtered);
    }

    // Then apply advanced filters
    filtered = applyAdvancedFilters(filtered);

    // Important: Make sure we preserve selection state when filtering
    const selectedCVEs = new Set(selectedVulns);
    filtered = filtered.map((vuln) => ({
      ...vuln,
      selected: selectedCVEs.has(vuln.cve),
    }));

    setFilteredVulns(filtered);
  }, [
    vulnerabilities,
    searchQuery,
    activeSeverities,
    applyFilters,
    applyAdvancedFilters,
    selectedVulns,
  ]);

  // Extract severity counts for display
  const severityCounts = useMemo(() => {
    return {
      critical: vulnData?.counts?.critical || 0,
      high: vulnData?.counts?.high || 0,
      medium: vulnData?.counts?.medium || 0,
      low: vulnData?.counts?.low || 0,
      informational: vulnData?.counts?.informational || 0,
    };
  }, [vulnData]);

  // Handle table refresh
  const handleRefresh = () => {
    void refetch();
  };

  // Keyboard shortcut handlers - limiting scope to avoid navigation interference
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if we're not in an input field or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        // Only handle escape for input fields
        if (
          e.key === "Escape" &&
          document.activeElement === searchInputRef.current
        ) {
          setSearchQuery("");
        }
        return;
      }

      // Cmd/Ctrl+F to focus search - only when not in an input
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Cmd/Ctrl+K to open command palette - only when not in an input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Improved row selection handler
  const handleRowSelection = (selectedCVEs: string[]) => {
    // Update the selected vulns state
    setSelectedVulns(selectedCVEs);

    // Update the filtered vulns to reflect selection state
    // but be careful not to trigger unnecessary re-renders
    setFilteredVulns((prev) => {
      // First check if we need to update at all
      const currentlySelected = new Set(selectedCVEs);
      const needsUpdate = prev.some(
        (vuln) =>
          (vuln.selected && !currentlySelected.has(vuln.cve)) ||
          (!vuln.selected && currentlySelected.has(vuln.cve))
      );

      if (!needsUpdate) return prev;

      // Only update if there's an actual change
      return prev.map((vuln) => ({
        ...vuln,
        selected: currentlySelected.has(vuln.cve),
      }));
    });
  };

  // Toggle a vulnerability selection
  const toggleVulnSelection = (cve: string) => {
    setSelectedVulns((prev) =>
      prev.includes(cve) ? prev.filter((id) => id !== cve) : [...prev, cve]
    );
  };

  // Handle vulnerability details view
  const handleViewDetails = (cve: string | null) => {
    setExpandedVuln(expandedVuln === cve ? null : cve);
  };

  // Toggle severity filter
  const toggleSeverity = (severity: string) => {
    setActiveSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setActiveSeverities([]);
  };

  // Helper function to determine severity based on CVSS score
  function determineSeverity(
    cvssScore: number
  ): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL" {
    if (cvssScore >= 9.0) return "CRITICAL";
    if (cvssScore >= 7.0) return "HIGH";
    if (cvssScore >= 4.0) return "MEDIUM";
    if (cvssScore > 0) return "LOW";
    return "INFORMATIONAL";
  }

  // Interface for the severity badge component
  interface SeverityBadgeProps {
    severity: string;
    count: number;
    active: boolean;
    onClick: () => void;
  }

  // Fix the SeverityBadge component to handle undefined colorConfig
  const SeverityBadge = ({
    severity,
    count,
    active,
    onClick,
  }: SeverityBadgeProps) => {
    const colorConfig = severityColorMap[severity];

    // Early return with a default styling if colorConfig is undefined
    if (!colorConfig) {
      return (
        <button
          disabled={count === 0}
          className={cn(
            "relative flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all hover:opacity-90",
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
            active &&
              "bg-gray-200 ring-1 ring-gray-300 dark:bg-gray-700 dark:ring-gray-600",
            count === 0 && "cursor-not-allowed opacity-50"
          )}
          onClick={onClick}
        >
          <span>{severity}</span>
          <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
            {count}
          </span>
        </button>
      );
    }

    return (
      <button
        disabled={count === 0}
        className={cn(
          "relative flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all hover:opacity-90",
          colorConfig.text,
          active
            ? `${colorConfig.activeBg} ring-1 ${colorConfig.ring}`
            : colorConfig.bg,
          count === 0 && "cursor-not-allowed opacity-50"
        )}
        onClick={onClick}
      >
        <span>{severity}</span>
        <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium dark:bg-gray-700">
          {count}
        </span>
      </button>
    );
  };

  // Add vulnerability statistics summary component
  const VulnerabilityStatisticsSummary = ({
    counts,
  }: {
    counts: Record<string, number>;
  }) => {
    const totalVulns = counts.total || 0;

    // Ensure all counts are numbers, defaulting to 0 if undefined
    const critical = counts.critical || 0;
    const high = counts.high || 0;
    const medium = counts.medium || 0;
    const low = counts.low || 0;
    const informational = counts.informational || 0;

    return (
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          Vulnerability Summary
        </h3>

        <div className="mb-2 grid grid-cols-5 gap-2 sm:gap-4">
          <div className="flex flex-col items-center rounded-lg bg-red-100 p-2 dark:bg-red-900/20">
            <span className="text-lg font-semibold text-red-700 dark:text-red-400">
              {critical}
            </span>
            <span className="text-xs text-red-600 dark:text-red-300">
              Critical
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-orange-100 p-2 dark:bg-orange-900/20">
            <span className="text-lg font-semibold text-orange-700 dark:text-orange-400">
              {high}
            </span>
            <span className="text-xs text-orange-600 dark:text-orange-300">
              High
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/20">
            <span className="text-lg font-semibold text-yellow-700 dark:text-yellow-400">
              {medium}
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-300">
              Medium
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-green-100 p-2 dark:bg-green-900/20">
            <span className="text-lg font-semibold text-green-700 dark:text-green-400">
              {low}
            </span>
            <span className="text-xs text-green-600 dark:text-green-300">
              Low
            </span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
            <span className="text-lg font-semibold text-blue-700 dark:text-blue-400">
              {informational}
            </span>
            <span className="text-xs text-blue-600 dark:text-blue-300">
              Info
            </span>
          </div>
        </div>

        <div className="mt-3 h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
          {totalVulns > 0 && (
            <>
              {critical > 0 && (
                <div
                  className="h-1.5 rounded-l-full bg-red-500"
                  style={{
                    width: `${Math.min(100 * (critical / totalVulns), 100)}%`,
                  }}
                ></div>
              )}
              {high > 0 && (
                <div
                  className="h-1.5 bg-orange-500"
                  style={{
                    width: `${Math.min(100 * (high / totalVulns), 100)}%`,
                  }}
                ></div>
              )}
              {medium > 0 && (
                <div
                  className="h-1.5 bg-yellow-500"
                  style={{
                    width: `${Math.min(100 * (medium / totalVulns), 100)}%`,
                  }}
                ></div>
              )}
              {low > 0 && (
                <div
                  className="h-1.5 bg-green-500"
                  style={{
                    width: `${Math.min(100 * (low / totalVulns), 100)}%`,
                  }}
                ></div>
              )}
              {informational > 0 && (
                <div
                  className="h-1.5 rounded-r-full bg-blue-500"
                  style={{
                    width: `${Math.min(
                      100 * (informational / totalVulns),
                      100
                    )}%`,
                  }}
                ></div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Add the AdvancedFilters component
  const AdvancedFiltersPanel = () => {
    return (
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Risk Score Range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Risk Score Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={advancedFilters.riskScoreRange[0]}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    riskScoreRange: [
                      parseFloat(e.target.value),
                      prev.riskScoreRange[1],
                    ],
                  }))
                }
                className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={advancedFilters.riskScoreRange[1]}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    riskScoreRange: [
                      prev.riskScoreRange[0],
                      parseFloat(e.target.value),
                    ],
                  }))
                }
                className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Published Date
            </label>
            <select
              value={advancedFilters.dateRange}
              onChange={(e) =>
                setAdvancedFilters((prev) => ({
                  ...prev,
                  dateRange: e.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">All time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Affected Hosts Range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Affected Hosts
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={advancedFilters.affectedHostsRange[0]}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    affectedHostsRange: [
                      parseInt(e.target.value),
                      prev.affectedHostsRange[1],
                    ],
                  }))
                }
                className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
              <span>to</span>
              <input
                type="number"
                min="0"
                value={
                  advancedFilters.affectedHostsRange[1] === Infinity
                    ? ""
                    : advancedFilters.affectedHostsRange[1]
                }
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({
                    ...prev,
                    affectedHostsRange: [
                      prev.affectedHostsRange[0],
                      e.target.value === ""
                        ? Infinity
                        : parseInt(e.target.value),
                    ],
                  }))
                }
                placeholder="∞"
                className="w-20 rounded-md border border-gray-200 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Additional Filters */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Additional Filters
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={advancedFilters.hasExploit === true}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      hasExploit: e.target.checked ? true : null,
                    }))
                  }
                  className="rounded border-gray-300 text-violet-600"
                />
                <span className="text-sm">Has known exploit</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={advancedFilters.hasFixAvailable === true}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({
                      ...prev,
                      hasFixAvailable: e.target.checked ? true : null,
                    }))
                  }
                  className="rounded border-gray-300 text-violet-600"
                />
                <span className="text-sm">Has fix available</span>
              </label>
            </div>
          </div>
        </div>

        {/* Filter Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAdvancedFilters({
                riskScoreRange: [0, 10],
                dateRange: "all",
                hasExploit: null,
                hasFixAvailable: null,
                affectedHostsRange: [0, Infinity],
                selectedTags: [],
              });
            }}
          >
            Reset Filters
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAdvancedFilters(false)}
          >
            Apply Filters
          </Button>
        </div>
      </div>
    );
  };

  // Add these action handlers after resetFilters function
  const handleExportSelected = (format: "csv" | "json") => {
    if (selectedVulns.length === 0) return;

    const selectedVulnerabilities = filteredVulns.filter((vuln) =>
      selectedVulns.includes(vuln.cve)
    );

    if (format === "csv") {
      // CSV export logic
      const headers = [
        "CVE ID",
        "Severity",
        "Risk Score",
        "Description",
        "Affected Hosts",
      ];
      const rows = selectedVulnerabilities.map((vuln) => [
        vuln.cve,
        vuln.severity,
        vuln.riskScore.toString(),
        `"${vuln.description.replace(/"/g, '""')}"`, // Escape quotes in CSV
        vuln.affectedHosts.length.toString(),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "selected-vulnerabilities.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // JSON export logic
      const jsonData = selectedVulnerabilities.map((vuln) => ({
        cve: vuln.cve,
        severity: vuln.severity,
        riskScore: vuln.riskScore,
        description: vuln.description,
        affectedHosts: vuln.affectedHosts.length,
      }));

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "selected-vulnerabilities.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleGenerateReport = () => {
    if (selectedVulns.length === 0) return;

    // In a real application, this would generate a report
    // For now, we'll show a toast notification
    showToast(
      `Report for ${selectedVulns.length} vulnerabilities has been generated.`,
      "success"
    );
  };

  const handleTagSelected = () => {
    if (selectedVulns.length === 0) return;
    showToast(
      `Ready to add tags to ${selectedVulns.length} vulnerabilities.`,
      "success"
    );
  };

  const handleMarkAsResolved = () => {
    if (selectedVulns.length === 0) return;
    showToast(
      `${selectedVulns.length} vulnerabilities marked as resolved.`,
      "success"
    );
  };

  const handleRescanSelected = () => {
    if (selectedVulns.length === 0) return;
    showToast(`Rescanning ${selectedVulns.length} vulnerabilities.`, "success");
  };

  const handleCopyToClipboard = () => {
    const text = selectedVulns.join(", ");
    navigator.clipboard.writeText(text).then(
      () => {
        showToast(
          `${selectedVulns.length} CVE IDs copied to clipboard.`,
          "success"
        );
      },
      () => {
        showToast("Failed to copy to clipboard.", "error");
      }
    );
  };

  return (
    <Layout title="Vulnerability Management">
      <div className="relative z-20 mb-5">
        {/* Header with vulnerability counts */}
        <div className="z-10 mb-6 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <VulnerabilityIcon
              className="ml-4 mt-1 flex"
              width="35px"
              height="35px"
            />
            <h1 className="ml-3 text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100">
              Vulnerability Navigator
            </h1>
          </div>

          <div className="mr-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Vulnerability Statistics Summary */}
        {!isLoading && vulnData?.counts && (
          <VulnerabilityStatisticsSummary counts={vulnData.counts} />
        )}

        {/* Quick filter bar */}
        <div className="mb-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search vulnerabilities..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Use our refactored view mode selector component */}
              <ViewModeSelector
                viewMode={viewMode}
                onViewChange={setViewMode}
                className="ml-4"
              />
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2">
              {/* Severity filter buttons */}
              <div className="flex items-center gap-2">
                <SeverityBadge
                  severity="CRITICAL"
                  count={severityCounts.critical}
                  active={activeSeverities.includes("CRITICAL")}
                  onClick={() => toggleSeverity("CRITICAL")}
                />
                <SeverityBadge
                  severity="HIGH"
                  count={severityCounts.high}
                  active={activeSeverities.includes("HIGH")}
                  onClick={() => toggleSeverity("HIGH")}
                />
                <SeverityBadge
                  severity="MEDIUM"
                  count={severityCounts.medium}
                  active={activeSeverities.includes("MEDIUM")}
                  onClick={() => toggleSeverity("MEDIUM")}
                />
                <SeverityBadge
                  severity="LOW"
                  count={severityCounts.low}
                  active={activeSeverities.includes("LOW")}
                  onClick={() => toggleSeverity("LOW")}
                />
              </div>

              {/* Advanced Filters Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={cn(
                  "gap-2",
                  showAdvancedFilters &&
                    "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
                {Object.values(advancedFilters).some(
                  (value) =>
                    (Array.isArray(value) &&
                      value.some((v) => v !== 0 && v !== Infinity)) ||
                    (typeof value === "boolean" && value !== null)
                ) && (
                  <span className="ml-1 rounded-full bg-violet-100 px-1.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                    •
                  </span>
                )}
              </Button>

              {/* Reset filters */}
              {(searchQuery || activeSeverities.length > 0) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs"
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && <AdvancedFiltersPanel />}
        </div>

        {/* Main content area */}
        <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Selection info when items are selected */}
          {selectedVulns.length > 0 && (
            <div className="flex items-center justify-between border-b border-gray-200 bg-violet-50 px-4 py-2 dark:border-gray-700 dark:bg-violet-900/10">
              <div className="text-sm font-medium">
                <span className="text-violet-700 dark:text-violet-300">
                  {selectedVulns.length}
                </span>{" "}
                vulnerabilities selected
              </div>
              <div className="flex gap-2">
                {/* Primary actions */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVulns([]);
                  }}
                >
                  <X className="mr-1 h-3.5 w-3.5" />
                  Deselect all
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRescanSelected();
                  }}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Rescan selected
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportSelected("csv");
                  }}
                >
                  <Download className="mr-1 h-3.5 w-3.5" />
                  Export CSV
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateReport();
                  }}
                >
                  <FileText className="mr-1 h-3.5 w-3.5" />
                  Generate report
                </Button>

                {/* Completely isolate the dropdown from other event handlers */}
                <div
                  className="inline-block"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.nativeEvent.stopImmediatePropagation();
                  }}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleTagSelected}>
                        <Tag className="mr-2 h-4 w-4" />
                        Add tags
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleMarkAsResolved}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleExportSelected("json")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCopyToClipboard}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy CVE IDs
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          showToast(
                            "Adjusting access permissions...",
                            "success"
                          );
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage access
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          showToast("Creating shareable link...", "success");
                        }}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share selection
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500 dark:text-red-400"
                        onClick={() => {
                          showToast(
                            `${selectedVulns.length} vulnerabilities deleted from view.`,
                            "success"
                          );
                          setSelectedVulns([]);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove from list
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          )}

          {/* Data Views */}
          <div className="h-[calc(100vh-320px)] max-h-[800px] min-h-[400px]">
            {viewMode === "command" ? (
              <VulnerabilityCommandTable
                data={filteredVulns}
                onSelectRow={handleRowSelection}
                onViewDetails={handleViewDetails}
                onRefresh={handleRefresh}
                selectedRows={selectedVulns}
                isLoading={isLoading}
              />
            ) : viewMode === "table" ? (
              <div className="h-full overflow-auto p-4">
                <VulnerabilityTable
                  columns={columns}
                  data={filteredVulns}
                  onRefresh={handleRefresh}
                />
              </div>
            ) : (
              <div className="h-full overflow-auto">
                <GroupedVulnerabilityView
                  vulnerabilities={filteredVulns}
                  onSelect={toggleVulnSelection}
                  selectedIds={selectedVulns}
                  onExpand={handleViewDetails}
                  expandedId={expandedVuln}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command Palette Modal (optional) */}
      {showCommandPalette && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center">
                <Command className="mr-2 h-5 w-5 text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Type a command..."
                  className="w-full border-none bg-transparent text-sm outline-none"
                />
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto p-2">
              <div className="space-y-1 p-1">
                {/* Command groups would go here */}
                <div className="px-2 pb-1 pt-2 text-xs font-semibold text-gray-500">
                  Actions
                </div>
                <div className="cursor-pointer rounded px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span>Run New Vulnerability Scan</span>
                    </div>
                    <div className="text-xs text-gray-400">⌘S</div>
                  </div>
                </div>
                {/* More commands... */}
              </div>
            </div>
            <div className="border-t border-gray-200 p-2 text-center text-xs text-gray-500 dark:border-gray-700">
              <kbd className="mx-1 rounded border border-gray-200 px-1.5 py-0.5 dark:border-gray-600">
                ↑
              </kbd>
              <kbd className="mx-1 rounded border border-gray-200 px-1.5 py-0.5 dark:border-gray-600">
                ↓
              </kbd>
              to navigate,
              <kbd className="mx-1 rounded border border-gray-200 px-1.5 py-0.5 dark:border-gray-600">
                Enter
              </kbd>
              to select,
              <kbd className="mx-1 rounded border border-gray-200 px-1.5 py-0.5 dark:border-gray-600">
                Esc
              </kbd>
              to close
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10 cursor-pointer"
            onClick={() => setShowCommandPalette(false)}
          ></div>
        </div>
      )}
    </Layout>
  );
};

// Grouped view component for showing vulnerabilities by severity
interface GroupedVulnerabilityViewProps {
  vulnerabilities: VulnTableData[];
  onSelect: (id: string) => void;
  selectedIds: string[];
  onExpand: (id: string | null) => void;
  expandedId: string | null;
}

const GroupedVulnerabilityView = ({
  vulnerabilities,
  onSelect,
  selectedIds,
  onExpand,
  expandedId,
}: GroupedVulnerabilityViewProps) => {
  // Group vulnerabilities by severity
  const groupedVulns = useMemo(() => {
    const groups: Record<string, VulnTableData[]> = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      informational: [],
    };

    vulnerabilities.forEach((vuln) => {
      if (vuln && vuln.severity) {
        const severity = vuln.severity.toLowerCase();
        if (groups[severity]) {
          groups[severity].push(vuln);
        }
      }
    });

    return groups;
  }, [vulnerabilities]);

  // State to track expanded severity groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {
      critical: true,
      high: true,
      medium: true,
      low: false,
      informational: false,
    }
  );

  // Toggle a severity group expansion
  const toggleGroup = (severity: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [severity]: !prev[severity],
    }));
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Object.entries(groupedVulns).map(
        ([severity, vulns]) =>
          vulns.length > 0 && (
            <div key={severity} className="bg-white dark:bg-gray-800">
              {/* Severity Header */}
              <button
                onClick={() => toggleGroup(severity)}
                className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  {expandedGroups[severity] ? (
                    <ChevronDown className="mr-1 h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="mr-1 h-4 w-4 text-gray-500" />
                  )}
                  <span className="mr-2 font-medium capitalize text-gray-900 dark:text-white">
                    {severity}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    {vulns.length}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {expandedGroups[severity] ? "Collapse" : "Expand"}
                </div>
              </button>

              {/* Vulnerability Items - Simplified to focus on important fields */}
              {expandedGroups[severity] && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {vulns.map((vuln) => (
                    <div
                      key={vuln.cve}
                      className={cn(
                        "group flex items-start px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700",
                        expandedId === vuln.cve
                          ? "bg-violet-50 dark:bg-violet-900/10"
                          : ""
                      )}
                    >
                      <div className="mr-2 mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(vuln.cve)}
                          onChange={() => onSelect(vuln.cve)}
                          className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-600 dark:border-gray-600 dark:bg-gray-700"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">
                            {vuln.cve}
                          </span>
                          <span className="text-xs text-gray-500">
                            CVSS: {vuln.riskScore.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {vuln.affectedHosts.length}{" "}
                            {vuln.affectedHosts.length === 1 ? "host" : "hosts"}
                          </span>
                        </div>

                        <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                          {vuln.description}
                        </p>

                        {expandedId === vuln.cve && (
                          <div className="mt-3 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                            <h4 className="text-xs font-medium text-gray-900 dark:text-white">
                              CVSS Score: {vuln.riskScore.toFixed(1)}
                            </h4>
                            <div className="mt-1 max-h-32 overflow-y-auto">
                              <p className="text-xs text-gray-600 dark:text-gray-300">
                                Affects {vuln.affectedHosts.length} host
                                {vuln.affectedHosts.length !== 1 && "s"}
                              </p>
                              <div className="mt-2">
                                <a
                                  href={`https://nvd.nist.gov/vuln/detail/${vuln.cve}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
                                >
                                  View in NVD Database
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-2 flex flex-shrink-0 items-center gap-2">
                        <button
                          onClick={() =>
                            onExpand(expandedId === vuln.cve ? null : vuln.cve)
                          }
                          className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        >
                          {expandedId === vuln.cve ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
      )}
    </div>
  );
};

const severityColorMap: Record<
  string,
  {
    bg: string;
    text: string;
    activeBg: string;
    ring: string;
  }
> = {
  CRITICAL: {
    bg: "bg-red-100 dark:bg-red-900/20",
    text: "text-red-800 dark:text-red-300",
    activeBg: "bg-red-200 dark:bg-red-900/40",
    ring: "ring-red-300 dark:ring-red-800",
  },
  HIGH: {
    bg: "bg-orange-100 dark:bg-orange-900/20",
    text: "text-orange-800 dark:text-orange-300",
    activeBg: "bg-orange-200 dark:bg-orange-900/40",
    ring: "ring-orange-300 dark:ring-orange-800",
  },
  // And so on for other severity levels
};

export default VulnerabilityNavigator;

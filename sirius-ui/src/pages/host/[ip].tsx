// src/pages/host/[ip].tsx
import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { VulnerabilityTable } from "~/components/VulnerabilityTable";
import { columns } from "~/components/VulnerabilityTableColumns";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";
import { Badge } from "~/components/lib/ui/badge";
import UnknownIcon from "~/components/icons/UnknownIcon";
import WindowsIcon from "~/components/icons/WindowsIcon";
import AppleIcon from "~/components/icons/AppleIcon";
import LinuxIcon from "~/components/icons/LinuxIcon";
import HostHeader from "~/components/host/HostHeader";
import HostHistory from "~/components/host/HostHistory";
import HostTabs from "~/components/host/HostTabs";
import HostOverview from "~/components/host/HostOverview";
import HostVulnerabilities from "~/components/host/HostVulnerabilities";
import HostSystemInfo from "~/components/host/HostSystemInfo";
import HostNetwork from "~/components/host/HostNetwork";

import { type SiriusHost } from "~/server/api/routers/host";
import { type EnvironmentTableData } from "~/server/api/routers/host";

// Define tab types for type safety
type TabType =
  | "overview"
  | "vulnerabilities"
  | "system"
  | "network"
  | "history";

// Define CveItem type since it's missing
interface CveItem {
  cve: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATIONAL";
  description: string;
  published: string;
  lastModified: string;
  references: string[];
  affectedHosts: string[];
}

// Create a custom component for the overview tab that focuses on penetration testing information
const PentestOverview = ({
  host,
  vulnerabilities,
}: {
  host: SiriusHost;
  vulnerabilities: CveItem[];
}) => {
  const criticalVulnerabilities = vulnerabilities.filter(
    (v) => v.severity === "CRITICAL"
  );
  const highVulnerabilities = vulnerabilities.filter(
    (v) => v.severity === "HIGH"
  );

  return (
    <div className="mt-6 space-y-6">
      {/* Quick summary for penetration testers */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Attack Surface Summary
        </h2>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Open Ports
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {host.ports?.length || 0}
            </div>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Running Services
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {host.services?.length || 0}
            </div>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              User Accounts
            </div>
            <div className="mt-1 text-2xl font-semibold">
              {host.users?.length || 0}
            </div>
          </div>
          <div className="rounded-md bg-white p-3 shadow-sm dark:bg-gray-800">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Critical Vulns
            </div>
            <div className="mt-1 text-2xl font-semibold text-red-600">
              {criticalVulnerabilities.length}
            </div>
          </div>
        </div>
      </div>

      {/* Open Ports Section - Most important for pentesting */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          Open Ports & Services
        </h2>
        {host.ports && host.ports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Port</th>
                  <th className="px-4 py-2 text-left">Protocol</th>
                  <th className="px-4 py-2 text-left">State</th>
                  <th className="px-4 py-2 text-left">Service</th>
                  <th className="px-4 py-2 text-left">Version</th>
                </tr>
              </thead>
              <tbody>
                {host.ports.map((port, index) => {
                  // Find matching service if any
                  const service = host.services?.find(
                    (s) => s.port === port.id
                  );

                  return (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-4 py-2 font-medium">{port.id}</td>
                      <td className="px-4 py-2">{port.protocol}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            port.state === "open"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {port.state}
                        </span>
                      </td>
                      <td className="px-4 py-2">{service?.name || "—"}</td>
                      <td className="px-4 py-2">{service?.version || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">
              No open ports detected
            </p>
          </div>
        )}
      </div>

      {/* High Priority Vulnerabilities */}
      {(criticalVulnerabilities.length > 0 ||
        highVulnerabilities.length > 0) && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
            High Priority Vulnerabilities
          </h2>
          <div className="space-y-3">
            {criticalVulnerabilities
              .concat(highVulnerabilities)
              .slice(0, 5)
              .map((vuln, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg p-3 ${
                    vuln.severity === "CRITICAL"
                      ? "bg-red-50 dark:bg-red-900/10"
                      : "bg-orange-50 dark:bg-orange-900/10"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            vuln.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                              : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                          }`}
                        >
                          {vuln.severity}
                        </span>
                        <span className="ml-2 font-medium">{vuln.cve}</span>
                      </div>
                      <p className="mt-1 text-sm">{vuln.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            {criticalVulnerabilities.length + highVulnerabilities.length >
              5 && (
              <div className="text-center">
                <button
                  onClick={() => {
                    /* logic to switch to vulnerabilities tab */
                  }}
                  className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  View all{" "}
                  {criticalVulnerabilities.length + highVulnerabilities.length}{" "}
                  high priority vulnerabilities
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Information - Focus on potentially exploitable info */}
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <h2 className="mb-3 text-lg font-medium text-gray-900 dark:text-gray-100">
          System Fingerprinting
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  OS Type:
                </span>
                <span className="font-medium">{host.os || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  OS Version:
                </span>
                <span className="font-medium">
                  {host.osversion || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Asset Type:
                </span>
                <span className="font-medium">
                  {host.asset_type || "Unknown"}
                </span>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Users:</span>
                <span className="font-medium">
                  {host.users?.length || 0} detected
                </span>
              </div>
              {host.users && host.users.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Admin Users:
                  </span>
                  <span className="font-medium">
                    {host.users.filter((u) =>
                      u.type?.toLowerCase().includes("admin")
                    ).length || 0}{" "}
                    detected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* User list - Potential targets for privilege escalation */}
      {host.users && host.users.length > 0 && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              User Accounts
            </h2>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {host.users.slice(0, 5).map((user, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-2 font-medium">{user.username}</td>
                    <td className="px-4 py-2">
                      {user.type &&
                      user.type.toLowerCase().includes("admin") ? (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          {user.type}
                        </span>
                      ) : (
                        user.type
                      )}
                    </td>
                    <td className="px-4 py-2">{user.details || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {host.users.length > 5 && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => {
                    /* logic to switch to system tab */
                  }}
                  className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  View all {host.users.length} users
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const HostDetailsPage = () => {
  // Get IP from URL parameter
  const router = useRouter();
  const { ip } = router.query;

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isScanning, setIsScanning] = useState(false);

  // Fetch host data using the getHost API (similar to host-old.tsx)
  const {
    data: hostData,
    isLoading: isHostLoading,
    isError: isHostError,
    refetch: refetchHost,
  } = api.host.getHost.useQuery(
    { hid: ip as string },
    {
      enabled: !!ip,
      retry: 3,
      staleTime: 30000,
    }
  );
  console.log("Host data:", hostData);

  // Define an empty host for fallback
  const emptyHost: SiriusHost = {
    hid: "1",
    hostname: "N/A",
    ip: (ip as string) || "N/A",
    os: "unknown",
    osversion: "N/A",
    asset_type: "unknown",
    services: [],
    ports: [],
    vulnerabilities: [],
  };

  // Use the host data or fallback to empty host
  const host = hostData ?? emptyHost;

  // Fetch host statistics
  const {
    data: vulnStats,
    isLoading: isStatsLoading,
    isError: isStatsError,
    refetch: refetchStats,
  } = api.host.getHostStatistics.useQuery(
    { hid: ip as string },
    {
      enabled: !!ip,
      retry: 3,
      staleTime: 30000,
    }
  );
  console.log("Vulnerability stats:", vulnStats);

  // Process vulnerability data from host
  const vulnerabilities = useMemo<CveItem[]>(() => {
    if (!host.vulnerabilities || host.vulnerabilities.length === 0) return [];

    return host.vulnerabilities.map((vuln) => ({
      cve: vuln.vid || "Unknown",
      severity: determineSeverity(vuln.riskScore),
      description: vuln.description || "No description available",
      published: vuln.published || new Date().toISOString(),
      lastModified: vuln.published || new Date().toISOString(), // Using published as fallback
      references: [],
      affectedHosts: [ip as string],
    }));
  }, [host.vulnerabilities, ip]);
  console.log("Processed vulnerabilities:", vulnerabilities);

  // Process vulnerability statistics
  const processedVulnMetrics = useMemo(() => {
    const defaultCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
      total: 0,
    };

    if (vulnStats?.hostSeverityCounts) {
      return {
        ...defaultCounts,
        ...vulnStats.hostSeverityCounts,
        total: vulnerabilities.length,
      };
    }

    return defaultCounts;
  }, [vulnStats, vulnerabilities.length]);

  // Select OS icon based on OS
  const osIcon = useMemo(() => {
    if (!host.os) return <UnknownIcon width="35px" height="35px" />;

    switch (host.os.toLowerCase()) {
      case "windows":
        return <WindowsIcon width="35px" height="35px" />;
      case "linux":
        return <LinuxIcon width="35px" height="35px" />;
      case "macos":
        return <AppleIcon width="35px" height="35px" />;
      default:
        return <UnknownIcon width="35px" height="35px" />;
    }
  }, [host.os]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle scan action
  const handleScan = async () => {
    setIsScanning(true);

    // Simulate a scan taking place
    setTimeout(() => {
      setIsScanning(false);
      // Refetch data after scan
      refetchHost();
      refetchStats();
    }, 3000);
  };

  // If the page is still loading the router query params
  if (router.isReady === false) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (isHostLoading) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
          <span className="ml-2">Loading host information...</span>
        </div>
      </Layout>
    );
  }

  // Error state
  if (isHostError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
            <h2 className="mb-4 text-xl font-bold">Host Not Found</h2>
            <p className="mb-4">Could not find host with IP: {ip}</p>
            <div className="flex gap-4">
              <button
                className="rounded-md bg-red-100 px-4 py-2 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                onClick={() => router.back()}
              >
                Go Back
              </button>
              <button
                className="rounded-md bg-violet-500 px-4 py-2 text-white hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700"
                onClick={() => router.push("/environment")}
              >
                View All Hosts
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Convert SiriusHost to EnvironmentTableData for compatibility with components
  const environmentData: EnvironmentTableData = {
    hid: host.hid,
    hostname: host.hostname,
    ip: host.ip,
    os: host.os,
    vulnerabilityCount: host.vulnerabilities?.length || 0,
    groups: host.tags || [],
    tags: host.tags || [],
    vulnerabilities: host.vulnerabilities || [],
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Host Header with OS Icon and Info */}
        <div className="mb-6">
          <div className="flex flex-col items-start justify-between space-y-3 md:flex-row md:items-center md:space-y-0">
            <div className="flex items-center">
              <div className="mr-4 flex dark:fill-white">{osIcon}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {host.hostname || host.ip}
                </h1>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{host.ip}</span>
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    online
                  </span>
                </div>
                {host.osversion && (
                  <div className="text-sm text-violet-500 dark:text-violet-400">
                    {host.osversion}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
                onClick={handleScan}
                disabled={isScanning}
              >
                <svg
                  className={`mr-1.5 h-4 w-4 ${
                    isScanning ? "animate-spin" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                </svg>
                {isScanning ? "Scanning..." : "Scan Now"}
              </button>

              <button className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700">
                <svg
                  className="mr-1.5 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Manage Tags
              </button>

              <button className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700">
                <svg
                  className="mr-1.5 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Report
              </button>
            </div>
          </div>

          {/* Host tags */}
          {host.tags && host.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {host.tags.map((tag, index) => (
                <Badge key={index} variant="default">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Vulnerability Summary Cards */}
        <div className="mb-6">
          <VulnerabilitySeverityCardsHorizontal counts={processedVulnMetrics} />
        </div>

        {/* Tab Navigation */}
        <HostTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          vulnerabilityCount={processedVulnMetrics.total}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <>
              <HostOverview host={host} vulnerabilities={vulnerabilities} />
              <PentestOverview host={host} vulnerabilities={vulnerabilities} />
            </>
          )}

          {activeTab === "vulnerabilities" && (
            <HostVulnerabilities
              vulnerabilities={vulnerabilities}
              isLoading={isStatsLoading}
            />
          )}

          {activeTab === "system" && <HostSystemInfo host={environmentData} />}

          {activeTab === "network" && <HostNetwork host={environmentData} />}

          {activeTab === "history" && <HostHistory hostIp={ip as string} />}
        </div>
      </div>
    </Layout>
  );
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

export default HostDetailsPage;

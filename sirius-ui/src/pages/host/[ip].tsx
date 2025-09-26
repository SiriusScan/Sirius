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
import {
  type HostWithSources,
  type VulnerabilityWithSource,
  type PortWithSource,
} from "~/server/api/routers/host";

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
  riskScore: number; // Add risk score field required by VulnTableData
  sources?: string[]; // Add sources to show where this vulnerability was found
}

// Deduplicated port type with sources
interface DeduplicatedPort {
  id: number;
  protocol: string;
  state: string;
  sources: string[];
  service?: {
    name?: string;
    version?: string;
  };
}

// Source badge component
const SourceBadge = ({ source }: { source: string }) => {
  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case "nmap":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "rustscan":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      case "naabu":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "agent":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "manual":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
      default:
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getSourceColor(
        source
      )}`}
    >
      {source}
    </span>
  );
};

const HostDetailsPage = () => {
  // Get IP from URL parameter
  const router = useRouter();
  const { ip } = router.query;

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isScanning, setIsScanning] = useState(false);

  // Fetch host data using the new source-aware API
  const {
    data: hostWithSources,
    isLoading: isHostLoading,
    isError: isHostError,
    refetch: refetchHost,
  } = api.host.getHostWithSources.useQuery(
    { ip: ip as string },
    {
      enabled: !!ip,
      retry: 3,
      staleTime: 30000,
    }
  );
  console.log("Host with sources data:", hostWithSources);

  // Process and deduplicate port data
  const deduplicatedPorts = useMemo<DeduplicatedPort[]>(() => {
    if (!hostWithSources?.port_sources) return [];

    console.log("🔍 Raw port sources:", hostWithSources.port_sources);

    const portMap = new Map<number, DeduplicatedPort>();

    hostWithSources.port_sources.forEach((portSource) => {
      console.log(`🔍 Processing port source:`, portSource);
      const portId = portSource.ID;

      if (portMap.has(portId)) {
        // Add source to existing port
        const existing = portMap.get(portId)!;
        if (!existing.sources.includes(portSource.source)) {
          existing.sources.push(portSource.source);
        }
      } else {
        // Create new deduplicated port entry
        portMap.set(portId, {
          id: portSource.ID,
          protocol: portSource.Protocol,
          state: portSource.State,
          sources: [portSource.source],
          service: undefined, // Service info would need to be added separately
        });
        console.log(
          `✅ Created port ${portId} with state: "${portSource.State}"`
        );
      }
    });

    const result = Array.from(portMap.values());
    console.log("🎯 Final deduplicated ports:", result);
    return result;
  }, [hostWithSources?.port_sources]);

  // Process and deduplicate vulnerability data
  const deduplicatedVulnerabilities = useMemo<CveItem[]>(() => {
    if (!hostWithSources?.vulnerability_sources) return [];

    console.log(
      "🔍 Raw vulnerability sources:",
      hostWithSources.vulnerability_sources
    );

    const vulnMap = new Map<string, CveItem>();

    hostWithSources.vulnerability_sources.forEach((vulnSource) => {
      const vulnId = vulnSource.VID;

      if (vulnMap.has(vulnId)) {
        // Add source to existing vulnerability
        const existing = vulnMap.get(vulnId)!;
        if (existing.sources && !existing.sources.includes(vulnSource.source)) {
          existing.sources.push(vulnSource.source);
          console.log(
            `✅ Added source ${vulnSource.source} to existing vulnerability ${vulnId}`
          );
        }
      } else {
        // Create new deduplicated vulnerability entry
        vulnMap.set(vulnId, {
          cve: vulnSource.VID,
          severity: determineSeverity(vulnSource.RiskScore),
          description: vulnSource.Description || "No description available",
          published: vulnSource.first_seen || new Date().toISOString(),
          lastModified: vulnSource.last_seen || new Date().toISOString(),
          references: [],
          affectedHosts: [ip as string],
          riskScore: vulnSource.RiskScore,
          sources: [vulnSource.source],
        });
        console.log(
          `🆕 Created new vulnerability entry for ${vulnId} from source ${vulnSource.source}`
        );
      }
    });

    const result = Array.from(vulnMap.values());
    console.log("🎯 Final deduplicated vulnerabilities:", result);
    return result;
  }, [hostWithSources?.vulnerability_sources, ip]);

  // Create a host object for backward compatibility with EnvironmentTableData type
  const host = useMemo(() => {
    if (!hostWithSources) return null;

    return {
      hid: hostWithSources.ID.toString(),
      hostname: hostWithSources.Hostname,
      ip: hostWithSources.IP,
      os: hostWithSources.OS,
      osversion: hostWithSources.OSVersion,
      vulnerabilityCount: deduplicatedVulnerabilities.length,
      groups: [],
      tags: [],
      sources: hostWithSources.sources,
      vulnerabilities: deduplicatedVulnerabilities.map((vuln) => ({
        vid: vuln.cve,
        description: vuln.description,
        severity: vuln.severity,
        riskScore: vuln.riskScore,
        published: vuln.published,
      })),
      ports: deduplicatedPorts,
    };
  }, [hostWithSources, deduplicatedVulnerabilities, deduplicatedPorts]);

  // Calculate vulnerability counts for severity cards
  const vulnerabilityCounts = useMemo(() => {
    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    deduplicatedVulnerabilities.forEach((vuln) => {
      switch (vuln.severity) {
        case "CRITICAL":
          counts.critical++;
          break;
        case "HIGH":
          counts.high++;
          break;
        case "MEDIUM":
          counts.medium++;
          break;
        case "LOW":
          counts.low++;
          break;
        default:
          counts.informational++;
          break;
      }
    });

    return counts;
  }, [deduplicatedVulnerabilities]);

  // Enhanced columns with source attribution - MOVED HERE BEFORE EARLY RETURNS
  const enhancedColumns = useMemo(() => {
    return [
      ...columns,
      {
        accessorKey: "sources",
        header: "Sources",
        cell: ({ row }) => {
          const sources = row.original.sources as string[] | undefined;
          return (
            <div className="flex flex-wrap gap-1">
              {sources?.map((source) => (
                <SourceBadge key={source} source={source} />
              )) || (
                <Badge variant="secondary" className="text-xs">
                  Unknown
                </Badge>
              )}
            </div>
          );
        },
      },
    ];
  }, []);

  // Handle tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle scan initiation
  const handleScan = () => {
    setIsScanning(true);
    // Implement scan logic here
    setTimeout(() => {
      setIsScanning(false);
      refetchHost();
    }, 3000);
  };

  // Loading state
  const isLoadingAnyData = isHostLoading;

  if (isHostLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
            <span className="ml-2">Loading host information...</span>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (isHostError || !host) {
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

  // Main render with complete original layout
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Host Header */}
        <HostHeader host={host} onScan={handleScan} isScanning={isScanning} />

        {/* Vulnerability Severity Cards */}
        <div className="mb-6">
          <VulnerabilitySeverityCardsHorizontal counts={vulnerabilityCounts} />
        </div>

        {/* Host Tabs */}
        <HostTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          vulnerabilityCount={deduplicatedVulnerabilities.length}
        />

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && <HostOverview host={host} />}
          {activeTab === "vulnerabilities" && (
            <div>
              <VulnerabilityTable
                columns={enhancedColumns}
                data={deduplicatedVulnerabilities}
                onRowClick={(vuln) => {
                  // Navigate to vulnerability detail page
                  const cveId = vuln.cve || vuln.id;
                  if (cveId) {
                    void router.push(
                      `/vulnerability?id=${encodeURIComponent(cveId)}`
                    );
                  }
                }}
              />
            </div>
          )}
          {activeTab === "system" && <HostSystemInfo host={host} />}
          {activeTab === "network" && <HostNetwork host={host} />}
          {activeTab === "history" && <HostHistory hostIp={ip as string} />}
        </div>
      </div>
    </Layout>
  );
};

// Keep existing helper function
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

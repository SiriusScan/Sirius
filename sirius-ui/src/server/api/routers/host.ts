import axios from "axios";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { storeMockHosts } from "./shared-mock-data";
import { type VulnerabilitySeverityCounts } from "~/components/VulnerabilityBarGraph";

import {
  mockHostData,
  mockHostStatistics,
  mockEnvironmentSummaryData,
} from "~/utils/mock/mockHostData";
import { type SourceCoverageStats } from "~/types/scanTypes";

// Create an axios instance
const httpClient = axios.create({
  baseURL: env.SIRIUS_API_URL,
  timeout: 5000,
});

export type SiriusHost = {
  hid: string;
  ip: string;
  hostname: string;
  tags?: string[];
  os: string;
  osversion: string;
  asset_type: "workstation" | "server" | "network" | "unknown";
  vulnerabilities: Vulnerability[];
  ports: Port[];
  services: Service[];
  users?: User[];
};

type Port = {
  id: number;
  protocol: string;
  state: string;
};

type User = {
  id: string;
  username: string;
  uid: string;
  type: string;
  domain?: string;
  password?: {
    hash?: string;
    algorithm?: string;
    plaintext?: string;
  };
  details?: string;
};

type Service = {
  id: string;
  name: string;
  port: number;
  protocol: string;
  version: string;
};

export type Vulnerability = {
  vid: string;
  riskScore: number;
  cve?: string;
  description: string;
  published: string;
  severity: string;
};

export interface EnvironmentTableData {
  hid: string;
  hostname: string;
  ip: string;
  os: string;
  vulnerabilityCount: number;
  groups: string[];
  tags: string[];
  vulnerabilities: Vulnerability[];
  ports?: Port[];
}

export type HostStatistics = {
  vulnerabilityCount: number;
  totalRiskScore: number;
  averageRiskScore: number;
  hostSeverityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
};

// Helper function to generate mock vulnerabilities for testing
function generateMockVulnerabilities(count: number): Vulnerability[] {
  const severities = [
    "critical",
    "high",
    "medium",
    "low",
    "informational",
  ] as const;
  const vulnerabilities: Vulnerability[] = [];

  for (let i = 0; i < count; i++) {
    // Pick a severity from the array - we need a non-null severity value
    const severityIndex = Math.floor(Math.random() * severities.length);
    const severity = severities[severityIndex];

    vulnerabilities.push({
      vid: `VID-${Math.floor(Math.random() * 10000)}`,
      riskScore:
        severity === "critical"
          ? 9.5
          : severity === "high"
          ? 7.5
          : severity === "medium"
          ? 5.5
          : severity === "low"
          ? 3.5
          : 1.5,
      cve: `CVE-${Math.floor(Math.random() * 10000)}-${Math.floor(
        Math.random() * 10000
      )}`,
      description: `This is a ${severity} vulnerability that affects system security.`,
      published: new Date().toISOString(),
      severity: severity, // This is now guaranteed to be a non-undefined string
    });
  }

  return vulnerabilities;
}

// Helper function to fetch host statistics directly
async function fetchHostStatistics(
  hid: string
): Promise<HostStatistics | null> {
  try {
    if (!hid || hid.trim() === "") {
      console.warn("fetchHostStatistics called with invalid ID");
      // Return default empty statistics instead of throwing
      return {
        vulnerabilityCount: 0,
        totalRiskScore: 0,
        averageRiskScore: 0,
        hostSeverityCounts: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          informational: 0,
        },
      };
    }
    const response = await httpClient.get<HostStatistics>(
      `host/statistics/${hid}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching host statistics (routers/host.ts): ${hid}`,
      error
    );
    // Return default empty statistics
    return {
      vulnerabilityCount: 0,
      totalRiskScore: 0,
      averageRiskScore: 0,
      hostSeverityCounts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 0,
      },
    };
  }
}

// Add type definition for the source-aware host response
export type HostWithSources = {
  // Host data is at the top level, not nested
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  HID: string;
  OS: string;
  OSVersion: string;
  IP: string;
  Hostname: string;
  Ports: null;
  Services: null;
  Vulnerabilities: null;
  HostVulnerabilities: null;
  HostPorts: null;
  CPEs: null;
  Users: null;
  Notes: null;
  AgentID: number;
  vulnerability_sources: VulnerabilityWithSource[];
  port_sources: PortWithSource[] | null;
  sources: string[];
};

export type EnhancedHostData = {
  host: SiriusHost;
  software_inventory?: {
    packages: Array<{
      name: string;
      version: string;
      architecture?: string;
      install_date?: string;
      size_bytes?: number;
      description?: string;
      publisher?: string;
      source?: string;
      cpe?: string;
      dependencies?: string[];
    }>;
    package_count: number;
    collected_at: string;
    source: string;
    statistics?: {
      architectures: Record<string, number>;
      publishers: Record<string, number>;
    };
  };
  system_fingerprint?: {
    fingerprint: {
      hardware?: {
        cpu?: {
          model: string;
          cores: number;
          architecture: string;
        };
        memory?: {
          total_gb: number;
          available_gb: number;
        };
        storage?: Array<{
          device: string;
          size_gb: number;
          type: string;
          filesystem: string;
        }>;
      };
      network?: {
        interfaces: Array<{
          name: string;
          mac: string;
          ipv4: string[];
          ipv6: string[];
        }>;
        dns_servers: string[];
      };
      services?: Array<{
        name: string;
        status: string;
        pid?: number;
        description?: string;
      }>;
      users?: Array<{
        name: string;
        uid: number;
        groups: string[];
        shell?: string;
      }>;
      certificates?: Array<{
        subject: string;
        issuer: string;
        expires: string;
        fingerprint: string;
        store: string;
      }>;
    };
    collected_at: string;
    source: string;
    platform: string;
    collection_duration_ms: number;
  };
  agent_metadata?: {
    agent_version?: string;
    scan_duration?: number;
    scan_modules?: string[];
    template_results?: Array<{
      template_id: string;
      vulnerability_id: string;
      vulnerable: boolean;
      confidence: number;
    }>;
  };
};

export type SoftwareStatistics = {
  total_packages: number;
  architectures: Record<string, number>;
  publishers: Record<string, number>;
  packages_by_source: Record<string, number>;
  last_updated: string;
};

export type VulnerabilityWithSource = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  VID: string;
  Description: string;
  Title: string;
  Hosts: null;
  HostVulnerabilities: null;
  RiskScore: number;
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  confidence: number;
  port?: number;
  service_info?: string;
  notes?: string;
};

export type PortWithSource = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  Protocol: string;
  State: string;
  source: string;
  source_version: string;
  first_seen: string;
  last_seen: string;
  status: string;
  notes?: string;
};

export const hostRouter = createTRPCRouter({
  getHost: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ input }) => {
      const { hid } = input;
      try {
        if (!hid) {
          throw new Error("No ID provided");
        }
        const response = await httpClient.get<SiriusHost>(`host/${hid}`);
        const host = response.data;

        return host;
        // return mockHostData;
      } catch (error) {
        console.error("Error fetching host (routers/host.ts):", hid);
        // console.error(error);
        return null;
      }
    }),

  getHostStatistics: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ input }) => {
      const { hid } = input;
      return fetchHostStatistics(hid);
    }),

  // Retrieve a EnvironmentTableData[] with the statistics for each host
  getEnvironmentSummary: publicProcedure.query(async () => {
    try {
      const response = await httpClient.get<SiriusHost[]>("host/");
      const hostList = response.data;

      // Ensure hostList is an array, default to empty array if null/undefined
      if (!hostList || !Array.isArray(hostList)) {
        console.log(
          "getEnvironmentSummary: No valid host data received, returning empty array"
        );
        return [];
      }

      // For each host, get the statistics
      const hostStatistics = await Promise.all(
        hostList.map(async (host) => {
          try {
            // Check if host.hid is valid before proceeding
            if (!host || !host.hid) {
              return null;
            }

            const statistics = await fetchHostStatistics(host.hid);
            return {
              hostId: host.hid,
              statistics,
            };
          } catch (hostError) {
            return null;
          }
        })
      );

      // Filter out null values from hostStatistics
      const validHostStatistics = hostStatistics.filter(
        (stat) => stat !== null
      );

      // Map vulnerability info from host.vulnerabilities to our VulnerabilitySeverityCounts structure
      const vulnerabilitiesMap: Record<string, VulnerabilitySeverityCounts> =
        {};

      hostList.forEach((host) => {
        if (!host || !host.vulnerabilities || host.vulnerabilities.length === 0)
          return;

        const counts: VulnerabilitySeverityCounts = {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          informational: 0,
        };

        // Count vulnerabilities by severity
        host.vulnerabilities.forEach((vuln) => {
          const severity = vuln.severity?.toLowerCase();
          if (severity === "critical") counts.critical++;
          else if (severity === "high") counts.high++;
          else if (severity === "medium") counts.medium++;
          else if (severity === "low") counts.low++;
          else if (severity === "informational" || severity === "info")
            counts.informational++;
        });

        vulnerabilitiesMap[host.hid] = counts;
      });

      // Convert hostStatistics and hostList to EnvironmentTableData[]
      const environmentTableData: EnvironmentTableData[] = hostList.map(
        (host) => {
          // Find matching statistics for this host
          const hostStats = validHostStatistics.find(
            (stat) => stat?.hostId === host.hid
          )?.statistics;

          // Get vulnerability counts either from our processed map or from host statistics
          const vulnCounts = vulnerabilitiesMap[host.hid] || {
            critical: hostStats?.hostSeverityCounts?.critical || 0,
            high: hostStats?.hostSeverityCounts?.high || 0,
            medium: hostStats?.hostSeverityCounts?.medium || 0,
            low: hostStats?.hostSeverityCounts?.low || 0,
            informational: hostStats?.hostSeverityCounts?.informational || 0,
          };

          return {
            hid: host.hid || `host-${host.ip.replace(/\./g, "-")}`, // Ensure we always have an ID
            hostname: host.hostname || "Unknown",
            ip: host.ip || "0.0.0.0",
            os: host.os || "Unknown",
            vulnerabilityCount:
              hostStats?.vulnerabilityCount ||
              host.vulnerabilities?.length ||
              0,
            groups: host.tags || [],
            tags: host.tags || [],
            // Make sure we have properly structured Vulnerability objects
            vulnerabilities: host.vulnerabilities || [],
          };
        }
      );

      return environmentTableData;
    } catch (error) {
      return [];
    }
  }),

  // Retrieve all host/environment data
  getAllHosts: publicProcedure.query(async () => {
    try {
      // Call to Go API
      const response = await httpClient.get<SiriusHost[]>("host/");
      const hostList = response.data;

      // Ensure hostList is an array, default to empty array if null/undefined
      if (!hostList || !Array.isArray(hostList)) {
        console.log(
          "getAllHosts: No valid host data received, returning empty array"
        );
        return [];
      }

      // Log the host IDs for debugging
      console.log(
        "getAllHosts: Received hosts with IDs:",
        hostList.map((h) => h.hid || "missing-id")
      );

      // Map SiriusHost[] to EnvironmentTableData[]
      const tableData: EnvironmentTableData[] = hostList
        .filter((host) => !!host) // Filter out null hosts
        .map((host) => {
          return {
            hid: host.hid || `host-${host.ip.replace(/\./g, "-")}`, // Ensure we always have an ID
            hostname: host.hostname || "Unknown",
            ip: host.ip || "0.0.0.0",
            os: host.os ?? "unknown",
            vulnerabilityCount: host.vulnerabilities?.length ?? 0,
            groups: host.tags ?? [],
            tags: host.tags ?? [],
            vulnerabilities: host.vulnerabilities
              ? [...host.vulnerabilities]
              : [],
          };
        });

      // Return the actual data from the API
      if (tableData?.length > 0) {
        return tableData;
      } else {
        return [];
      }
    } catch (error) {
      // Handle the error accordingly
      console.error("Error fetching hosts:", error);
      return [];
    }
  }),

  // Get source coverage statistics
  getSourceCoverage: publicProcedure.query(async () => {
    try {
      const response = await httpClient.get("host/source-coverage");
      // The API returns { source_coverage_stats: [...], total_sources: n }
      // Extract just the array for the frontend
      if (response.data?.source_coverage_stats) {
        return response.data.source_coverage_stats as SourceCoverageStats[];
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching source coverage stats:", error);
      // Return empty array instead of mock data
      return [];
    }
  }),

  // Get host with source attribution (deduplicated data)
  getHostWithSources: publicProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Call the source-aware API endpoint
        const response = await httpClient.get<HostWithSources>(
          `host/${ip}/sources`
        );
        const hostWithSources = response.data;

        return hostWithSources;
      } catch (error) {
        console.error("Error fetching host with sources:", error);
        return null;
      }
    }),

  // Get host software inventory (packages)
  getHostSoftwareInventory: publicProcedure
    .input(
      z.object({
        ip: z.string(),
        filter: z.string().optional(),
        architecture: z.string().optional(),
        publisher: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { ip, filter, architecture, publisher } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Build query parameters
        const params = new URLSearchParams();
        if (filter) params.append("filter", filter);
        if (architecture) params.append("architecture", architecture);
        if (publisher) params.append("publisher", publisher);

        const queryString = params.toString();
        const url = `host/${ip}/packages${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await httpClient.get(url);
        return response.data;
      } catch (error) {
        console.error("Error fetching host software inventory:", error);
        return null;
      }
    }),

  // Get host software statistics
  getHostSoftwareStats: publicProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        const response = await httpClient.get(`host/${ip}/software-stats`);
        return response.data;
      } catch (error) {
        console.error("Error fetching host software statistics:", error);
        return null;
      }
    }),

  // Get host system fingerprint
  getHostSystemFingerprint: publicProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        const response = await httpClient.get(`host/${ip}/fingerprint`);
        return response.data;
      } catch (error) {
        console.error("Error fetching host system fingerprint:", error);
        return null;
      }
    }),

  // Get enhanced host data with SBOM and fingerprint information
  getEnhancedHostData: publicProcedure
    .input(
      z.object({
        ip: z.string(),
        include: z.array(z.string()).optional(),
        enhanced: z.boolean().optional(),
      })
    )
    .query(async ({ input }) => {
      const { ip, include, enhanced } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Build query parameters for the enhanced endpoint
        const params = new URLSearchParams();
        if (include && include.length > 0) {
          params.append("include", include.join(","));
        }
        if (enhanced) {
          params.append("enhanced", "true");
        }

        const queryString = params.toString();
        const url = `host/${ip}${queryString ? `?${queryString}` : ""}`;

        const response = await httpClient.get<EnhancedHostData>(url);
        return response.data;
      } catch (error) {
        console.error("Error fetching enhanced host data:", error);
        return null;
      }
    }),

  // Get host system fingerprint data
  getHostSystemFingerprint: publicProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        const response = await httpClient.get(`host/${ip}/fingerprint`);
        return response.data;
      } catch (error) {
        console.error("Error fetching host system fingerprint:", error);
        return null;
      }
    }),

  // Get enhanced software statistics for environment overview
  getEnvironmentSoftwareStats: publicProcedure.query(async () => {
    try {
      // Get all hosts first
      const hostsResponse = await httpClient.get<SiriusHost[]>("host/");
      const hosts = hostsResponse.data;

      if (!hosts || !Array.isArray(hosts)) {
        return {
          total_hosts: 0,
          total_packages: 0,
          top_software: [],
          architecture_distribution: {},
          publisher_distribution: {},
        };
      }

      // Aggregate software statistics across all hosts
      let totalPackages = 0;
      const softwareCount: Record<string, number> = {};
      const architectureDistribution: Record<string, number> = {};
      const publisherDistribution: Record<string, number> = {};

      // Get software stats for each host
      const statsPromises = hosts.map(async (host) => {
        try {
          const statsResponse = await httpClient.get(
            `host/${host.ip}/software-stats`
          );
          return { ip: host.ip, stats: statsResponse.data };
        } catch (error) {
          return { ip: host.ip, stats: null };
        }
      });

      const allStats = await Promise.all(statsPromises);

      allStats.forEach(({ stats }) => {
        if (stats) {
          totalPackages += stats.total_packages || 0;

          // Aggregate architectures
          if (stats.architectures) {
            Object.entries(stats.architectures).forEach(([arch, count]) => {
              architectureDistribution[arch] =
                (architectureDistribution[arch] || 0) + count;
            });
          }

          // Aggregate publishers
          if (stats.publishers) {
            Object.entries(stats.publishers).forEach(([publisher, count]) => {
              publisherDistribution[publisher] =
                (publisherDistribution[publisher] || 0) + count;
            });
          }
        }
      });

      // Get top 10 publishers
      const topPublishers = Object.entries(publisherDistribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([publisher, count]) => ({ publisher, count }));

      return {
        total_hosts: hosts.length,
        total_packages: totalPackages,
        top_software: topPublishers,
        architecture_distribution: architectureDistribution,
        publisher_distribution: publisherDistribution,
      };
    } catch (error) {
      console.error("Error fetching environment software stats:", error);
      return {
        total_hosts: 0,
        total_packages: 0,
        top_software: [],
        architecture_distribution: {},
        publisher_distribution: {},
      };
    }
  }),

  // Get template detection results for a host
  getHostTemplateResults: publicProcedure
    .input(z.object({ ip: z.string() }))
    .query(async ({ input }) => {
      const { ip } = input;
      try {
        if (!ip) {
          throw new Error("No IP provided");
        }

        // Get enhanced host data that includes agent metadata with template results
        const response = await httpClient.get<EnhancedHostData>(
          `host/${ip}?include=metadata&enhanced=true`
        );

        if (response.data?.agent_metadata?.template_results) {
          return {
            host_ip: ip,
            template_results: response.data.agent_metadata.template_results,
            scan_date: response.data.agent_metadata.scan_date || null,
          };
        }

        return {
          host_ip: ip,
          template_results: [],
          scan_date: null,
        };
      } catch (error) {
        console.error("Error fetching host template results:", error);
        return {
          host_ip: ip,
          template_results: [],
          scan_date: null,
        };
      }
    }),

  // Get environment-wide software inventory with aggregation and filtering
  getEnvironmentSoftwareInventory: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        publisher: z.string().optional(),
        architecture: z.string().optional(),
        vulnerability_status: z.enum(["vulnerable", "clean"]).optional(),
        source: z.string().optional(),
        limit: z.number().optional().default(100),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input }) => {
      const {
        search,
        publisher,
        architecture,
        vulnerability_status,
        source,
        limit,
        offset,
      } = input;

      try {
        // Get all hosts first
        const hostsResponse = await httpClient.get<SiriusHost[]>("host/");
        const hosts = hostsResponse.data;

        if (!hosts || !Array.isArray(hosts)) {
          return {
            packages: [],
            total_packages: 0,
            total_hosts: 0,
            filtered_count: 0,
          };
        }

        // Collect software inventory from all hosts
        const inventoryPromises = hosts.map(async (host) => {
          try {
            const response = await httpClient.get(`host/${host.ip}/packages`);
            return {
              host_ip: host.ip,
              hostname: host.hostname,
              inventory: response.data,
            };
          } catch (error) {
            console.log(`Failed to get inventory for host ${host.ip}:`, error);
            return {
              host_ip: host.ip,
              hostname: host.hostname,
              inventory: null,
            };
          }
        });

        const allInventories = await Promise.all(inventoryPromises);

        // Aggregate packages across all hosts
        const packageMap = new Map<
          string,
          {
            name: string;
            version: string;
            publisher: string;
            architecture: string;
            source: string;
            hosts: string[];
            host_count: number;
            vulnerability_count?: number;
            size_mb?: number;
            description?: string;
            install_dates?: string[];
          }
        >();

        allInventories.forEach(({ host_ip, hostname, inventory }) => {
          if (!inventory?.packages) return;

          inventory.packages.forEach((pkg: any) => {
            const key = `${pkg.name}:${pkg.version}:${
              pkg.publisher || "unknown"
            }:${pkg.architecture || "any"}`;

            if (packageMap.has(key)) {
              const existing = packageMap.get(key)!;
              existing.hosts.push(hostname || host_ip);
              existing.host_count += 1;
              if (pkg.install_date) {
                existing.install_dates = existing.install_dates || [];
                existing.install_dates.push(pkg.install_date);
              }
            } else {
              packageMap.set(key, {
                name: pkg.name,
                version: pkg.version,
                publisher: pkg.publisher || "Unknown",
                architecture: pkg.architecture || "any",
                source: pkg.source || "unknown",
                hosts: [hostname || host_ip],
                host_count: 1,
                description: pkg.description,
                size_mb: pkg.size_bytes
                  ? Math.round((pkg.size_bytes / 1024 / 1024) * 100) / 100
                  : undefined,
                install_dates: pkg.install_date
                  ? [pkg.install_date]
                  : undefined,
                vulnerability_count: 0, // TODO: Implement vulnerability correlation
              });
            }
          });
        });

        // Convert to array and apply filters
        let packages = Array.from(packageMap.values());

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          packages = packages.filter(
            (pkg) =>
              pkg.name.toLowerCase().includes(searchLower) ||
              pkg.description?.toLowerCase().includes(searchLower)
          );
        }

        // Apply publisher filter
        if (publisher) {
          packages = packages.filter(
            (pkg) => pkg.publisher.toLowerCase() === publisher.toLowerCase()
          );
        }

        // Apply architecture filter
        if (architecture) {
          packages = packages.filter(
            (pkg) =>
              pkg.architecture.toLowerCase() === architecture.toLowerCase()
          );
        }

        // Apply source filter
        if (source) {
          packages = packages.filter(
            (pkg) => pkg.source.toLowerCase() === source.toLowerCase()
          );
        }

        // Apply vulnerability status filter
        if (vulnerability_status) {
          if (vulnerability_status === "vulnerable") {
            packages = packages.filter(
              (pkg) => (pkg.vulnerability_count || 0) > 0
            );
          } else if (vulnerability_status === "clean") {
            packages = packages.filter(
              (pkg) => (pkg.vulnerability_count || 0) === 0
            );
          }
        }

        // Sort by host count (most widespread packages first)
        packages.sort((a, b) => b.host_count - a.host_count);

        // Apply pagination
        const totalCount = packages.length;
        const paginatedPackages = packages.slice(offset, offset + limit);

        return {
          packages: paginatedPackages,
          total_packages: totalCount,
          total_hosts: hosts.length,
          filtered_count: totalCount,
          pagination: {
            limit,
            offset,
            has_more: offset + limit < totalCount,
          },
        };
      } catch (error) {
        console.error("Error fetching environment software inventory:", error);
        return {
          packages: [],
          total_packages: 0,
          total_hosts: 0,
          filtered_count: 0,
        };
      }
    }),
});

/// MOCK DATA ///
const mockHostList: EnvironmentTableData[] = [
  {
    hid: "host1-id",
    hostname: "host1",
    ip: "192.168.1.10",
    os: "Linux",
    vulnerabilityCount: 5,
    groups: ["group1", "group2"],
    tags: ["tag1", "tag2"],
    vulnerabilities: generateMockVulnerabilities(5),
  },
  {
    hid: "host2-id",
    hostname: "host2",
    ip: "192.168.1.11",
    os: "Windows",
    vulnerabilityCount: 3,
    groups: ["group1"],
    tags: ["tag3"],
    vulnerabilities: generateMockVulnerabilities(3),
  },
];

const mockVulnerabilitySummary: VulnerabilitySummary[] = [
  {
    id: "1",
    severity: "critical",
    title: "CVE-2017-0145",
    description:
      "A remote code execution vulnerability exists when the Windows Server service improperly handles certain requests.",
  },
  {
    id: "2",
    severity: "critical",
    title: "CVE-2014-0468",
    description:
      "A remote code execution vulnerability exists in the way that the Microsoft Server service handles specially crafted packets.",
  },
];

const mockScanResults: ScanResult = {
  id: "1",
  status: "running",
  targets: ["192.168.123.234"],
  hosts: ["192.168.123.234", "192.168.123.235"],
  hostsCompleted: 1,
  vulnerabilities: mockVulnerabilitySummary,
};

const mockVulnerabilityList: VulnerabilityTableData[] = [
  {
    cve: "CVE-2020-7165",
    cvss: 1.2,
    description:
      "Improper handling of user input in SuperCoolApp 3.2.1 allows remote attackers to execute arbitrary code.",
    published: "2023-07-09",
    severity: "medium",
    count: 39,
  },
  {
    cve: "CVE-2023-4729",
    cvss: 1.9,
    description:
      "Unauthenticated remote attackers can cause a denial of service in MegaApp 2.0 by sending malformed packets.",
    published: "2023-08-08",
    severity: "low",
    count: 49,
  },
  {
    cve: "CVE-2018-9148",
    cvss: 10,
    description:
      "UltraLib 1.4.0 mishandles file uploads, allowing for remote code execution.",
    published: "2023-07-13",
    severity: "critical",
    count: 42,
  },
  {
    cve: "CVE-2020-3817",
    cvss: 4.8,
    description:
      "An insecure deserialization issue in AwesomeTool 5.2 could allow attackers to execute arbitrary code on the server.",
    published: "2023-07-04",
    severity: "medium",
    count: 47,
  },
  {
    cve: "CVE-2021-6088",
    cvss: 1.6,
    description:
      "CryptoLib 2.1 fails to validate encryption integrity, making it vulnerable to Man-in-the-Middle attacks.",
    published: "2023-08-16",
    severity: "medium",
    count: 8,
  },
  {
    cve: "CVE-2018-3106",
    cvss: 8.3,
    description:
      "A buffer overflow in YetAnotherApp 6.0 allows for privilege escalation via specially crafted network traffic.",
    published: "2023-07-05",
    severity: "high",
    count: 9,
  },
  {
    cve: "CVE-2022-5371",
    cvss: 7.9,
    description:
      "An SQL injection vulnerability in WebStore 3.0 allows attackers to execute arbitrary SQL commands.",
    published: "2023-06-10",
    severity: "high",
    count: 15,
  },
  {
    cve: "CVE-2020-6771",
    cvss: 4.4,
    description:
      "SmartApp 7.0 stores sensitive user information in plaintext, potentially exposing it to unauthorized actors.",
    published: "2023-06-18",
    severity: "medium",
    count: 26,
  },
  {
    cve: "CVE-2021-1165",
    cvss: 9.0,
    description:
      "A use-after-free vulnerability in GameEngine 2.0 can result in arbitrary code execution when processing malformed game files.",
    published: "2023-07-24",
    severity: "high",
    count: 3,
  },
  {
    cve: "CVE-2023-4954",
    cvss: 9.5,
    description:
      "An out-of-bounds read in FileParser 1.0 can cause the application to crash, leading to a denial of service.",
    published: "2023-07-19",
    severity: "critical",
    count: 1,
  },
  {
    cve: "CVE-2022-6318",
    cvss: 8.5,
    description:
      "A heap-based buffer overflow in VideoPlayer 5.0 allows attackers to execute arbitrary code via a crafted video file.",
    published: "2023-07-05",
    severity: "high",
    count: 2,
  },
  {
    cve: "CVE-2020-4997",
    cvss: 4.0,
    description:
      "An XML external entity (XXE) vulnerability in XMLParser 4.0 allows for disclosure of internal files.",
    published: "2023-06-20",
    severity: "medium",
    count: 46,
  },
  {
    cve: "CVE-2023-7714",
    cvss: 2.1,
    description:
      "Improper input validation in ImageProcessor 2.0 allows attackers to read arbitrary files on the host machine.",
    published: "2023-06-06",
    severity: "low",
    count: 45,
  },
  {
    cve: "CVE-2019-7814",
    cvss: 2.5,
    description:
      "Insecure default configurations in WebService 3.0 could allow attackers to intercept sensitive information.",
    published: "2023-07-03",
    severity: "medium",
    count: 21,
  },
  {
    cve: "CVE-2022-3072",
    cvss: 7.8,
    description:
      "An open redirect vulnerability in AuthManager 1.1 could allow for phishing attacks.",
    published: "2023-06-10",
    severity: "high",
    count: 31,
  },
  {
    cve: "CVE-2019-4933",
    cvss: 5.2,
    description:
      "An insecure direct object reference (IDOR) in FileManager 6.0 could allow unauthorized access to files.",
    published: "2023-08-18",
    severity: "medium",
    count: 50,
  },
  {
    cve: "CVE-2023-9064",
    cvss: 2.7,
    description:
      "A cross-site scripting (XSS) vulnerability in ChatApp 1.5 allows attackers to inject arbitrary web scripts.",
    published: "2023-07-21",
    severity: "low",
    count: 32,
  },
  {
    cve: "CVE-2022-2921",
    cvss: 4.5,
    description:
      "A timing attack vulnerability in CryptoService 2.0 could allow attackers to guess encrypted values.",
    published: "2023-06-13",
    severity: "low",
    count: 13,
  },
  {
    cve: "CVE-2020-5294",
    cvss: 9.9,
    description:
      "Improper access control in NetworkManager 8.0 could allow for unauthorized network changes.",
    published: "2023-08-29",
    severity: "critical",
    count: 24,
  },
  {
    cve: "CVE-2023-2596",
    cvss: 1.8,
    description:
      "A server-side request forgery (SSRF) in APIGateway 3.0 could allow attackers to make unauthorized HTTP requests.",
    published: "2023-06-04",
    severity: "low",
    count: 1,
  },
];

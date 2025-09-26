import React from "react";
import {
  type EnvironmentTableData,
  type Vulnerability,
} from "~/server/api/routers/host";
import { api } from "~/utils/api";
import {
  Shield,
  Server,
  Clock,
  AlertTriangle,
  Network,
  Users,
  Bug,
  Lock,
  Package,
  HardDrive,
  Cpu,
  Wifi,
} from "lucide-react";

interface HostOverviewProps {
  host: EnvironmentTableData;
}

// Source badge component for ports
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

export const HostOverview: React.FC<HostOverviewProps> = ({ host }) => {
  // Fetch enhanced data for overview statistics
  const { data: softwareInventory } =
    api.host.getHostSoftwareInventory.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip, staleTime: 60000 }
    );

  const { data: systemFingerprint } =
    api.host.getHostSystemFingerprint.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip, staleTime: 60000 }
    );

  const { data: softwareStats } = api.host.getHostSoftwareStats.useQuery(
    { ip: host.ip },
    { enabled: !!host.ip, staleTime: 60000 }
  );

  const vulnerabilities = host.vulnerabilities || [];

  // Calculate vulnerability statistics
  const criticalCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "critical"
  ).length;
  const highCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "high"
  ).length;
  const mediumCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "medium"
  ).length;
  const lowCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "low"
  ).length;

  // Extract real statistics from enhanced data
  const softwarePackages =
    softwareInventory?.package_count || softwareStats?.total_packages || 0;
  const networkInterfaces =
    systemFingerprint?.fingerprint?.network?.interfaces?.length || 0;
  const userAccounts =
    systemFingerprint?.fingerprint?.users?.users?.length || 0;

  // Safely handle services - ensure it's an array before filtering
  const servicesArray = Array.isArray(systemFingerprint?.fingerprint?.services)
    ? systemFingerprint.fingerprint.services
    : [];
  const runningServices = servicesArray.filter(
    (service: {
      name: string;
      status: string;
      pid?: number;
      description?: string;
    }) =>
      service.status?.toLowerCase() === "running" ||
      service.status?.toLowerCase() === "active"
  ).length;
  const totalServices = servicesArray.length;
  const cpuCores = systemFingerprint?.fingerprint?.hardware?.cpu?.cores || 0;
  const totalMemoryGB =
    systemFingerprint?.fingerprint?.hardware?.memory?.total_gb || 0;
  const storageDevices =
    systemFingerprint?.fingerprint?.hardware?.storage?.length || 0;
  const certificates =
    systemFingerprint?.fingerprint?.certificates?.length || 0;

  // Calculate risk score
  const riskScore = calculateRiskScore(vulnerabilities);
  const riskLevel = getRiskLevel(riskScore);

  // Format last scan time
  const lastScanTime =
    softwareInventory?.collected_at || systemFingerprint?.collected_at;
  const formatLastScan = (dateString?: string) => {
    if (!dateString) return "Never";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
      if (diffHours > 0)
        return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
      if (diffMinutes > 0)
        return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
      return "Just now";
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <Server className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Operating System
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {host.os || "Unknown"}
          </div>
          <div className="text-sm text-gray-500">
            {host.hostname || "Unknown hostname"}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last Scan
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {formatLastScan(lastScanTime)}
          </div>
          <div className="text-sm text-gray-500">Enhanced data available</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Vulnerabilities
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {vulnerabilities.length}
          </div>
          <div className="text-sm text-gray-500">
            {criticalCount > 0 && (
              <span className="text-red-600">{criticalCount} critical</span>
            )}
            {criticalCount > 0 && highCount > 0 && ", "}
            {highCount > 0 && (
              <span className="text-orange-600">{highCount} high</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Risk Score
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {riskScore}
          </div>
          <div className="text-sm text-gray-500">{riskLevel}</div>
        </div>
      </div>

      {/* Enhanced System Statistics */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          System Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Package className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {softwarePackages.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Software Packages</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {userAccounts}
            </div>
            <div className="text-sm text-gray-500">User Accounts</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Network className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {networkInterfaces}
            </div>
            <div className="text-sm text-gray-500">Network Interfaces</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Server className="h-8 w-8 text-orange-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {runningServices}
            </div>
            <div className="text-sm text-gray-500">Running Services</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Cpu className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {cpuCores}
            </div>
            <div className="text-sm text-gray-500">CPU Cores</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <HardDrive className="h-8 w-8 text-gray-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {storageDevices}
            </div>
            <div className="text-sm text-gray-500">Storage Devices</div>
          </div>
        </div>

        {/* Hardware Summary */}
        {(cpuCores > 0 || totalMemoryGB > 0) && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Hardware:</strong>
              {cpuCores > 0 && ` ${cpuCores} CPU cores`}
              {cpuCores > 0 && totalMemoryGB > 0 && `, `}
              {totalMemoryGB > 0 && ` ${totalMemoryGB.toFixed(1)} GB RAM`}
              {storageDevices > 0 &&
                `, ${storageDevices} storage device${
                  storageDevices > 1 ? "s" : ""
                }`}
              {certificates > 0 &&
                `, ${certificates} certificate${certificates > 1 ? "s" : ""}`}
            </div>
          </div>
        )}
      </div>

      {/* Vulnerability Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Vulnerability Distribution
        </h3>
        {vulnerabilities.length > 0 ? (
          <>
            <div className="flex h-10 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
              {criticalCount > 0 && (
                <div
                  className="bg-red-500 dark:bg-red-700"
                  style={{
                    width: `${(criticalCount / vulnerabilities.length) * 100}%`,
                  }}
                  title={`Critical: ${criticalCount}`}
                ></div>
              )}
              {highCount > 0 && (
                <div
                  className="bg-orange-500 dark:bg-orange-700"
                  style={{
                    width: `${(highCount / vulnerabilities.length) * 100}%`,
                  }}
                  title={`High: ${highCount}`}
                ></div>
              )}
              {mediumCount > 0 && (
                <div
                  className="bg-yellow-500 dark:bg-yellow-700"
                  style={{
                    width: `${(mediumCount / vulnerabilities.length) * 100}%`,
                  }}
                  title={`Medium: ${mediumCount}`}
                ></div>
              )}
              {lowCount > 0 && (
                <div
                  className="bg-green-500 dark:bg-green-700"
                  style={{
                    width: `${(lowCount / vulnerabilities.length) * 100}%`,
                  }}
                  title={`Low: ${lowCount}`}
                ></div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm">
                  Critical: {criticalCount} (
                  {Math.round((criticalCount / vulnerabilities.length) * 100)}%)
                </span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="text-sm">
                  High: {highCount} (
                  {Math.round((highCount / vulnerabilities.length) * 100)}%)
                </span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm">
                  Medium: {mediumCount} (
                  {Math.round((mediumCount / vulnerabilities.length) * 100)}%)
                </span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm">
                  Low: {lowCount} (
                  {Math.round((lowCount / vulnerabilities.length) * 100)}%)
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <Shield className="mx-auto mb-4 h-12 w-12 text-green-500" />
            <h4 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
              No Vulnerabilities Found
            </h4>
            <p className="text-sm text-gray-500">
              This host appears to be clean of known vulnerabilities.
            </p>
          </div>
        )}
      </div>

      {/* Network Ports */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center">
            <Wifi className="mr-2 h-4 w-4 text-violet-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Network Ports
            </h3>
            <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-300">
              {host.ports?.length || 0}
            </span>
          </div>
        </div>

        {host.ports && host.ports.length > 0 ? (
          <div className="space-y-2">
            {/* Compact Port List */}
            <div className="max-h-48 overflow-y-auto">
              <div className="space-y-1">
                {host.ports
                  .sort((a, b) => (a.id || 0) - (b.id || 0))
                  .map((port, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <div
                            className={`mr-2 h-2 w-2 rounded-full ${
                              port.state?.toLowerCase() === "open"
                                ? "bg-green-500"
                                : port.state?.toLowerCase() === "closed"
                                ? "bg-red-500"
                                : port.state?.toLowerCase() === "filtered"
                                ? "bg-yellow-500"
                                : "bg-gray-500"
                            }`}
                          ></div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {port.id}
                            </span>
                            <span className="ml-1 text-gray-500">
                              {port.protocol?.toLowerCase()}
                            </span>
                          </div>
                        </div>
                        {port.service && (
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {port.service.name}
                            {port.service.version &&
                              ` v${port.service.version}`}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {port.sources?.map((source) => (
                          <SourceBadge key={source} source={source} />
                        )) || <SourceBadge source="unknown" />}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Compact Summary */}
            {(host.ports.filter((p) => p.state?.toLowerCase() === "open")
              .length > 0 ||
              host.ports.some((p) => p.service?.name)) && (
              <div className="rounded bg-gray-50 p-2 dark:bg-gray-700">
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {host.ports.filter((p) => p.state?.toLowerCase() === "open")
                    .length > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      {
                        host.ports.filter(
                          (p) => p.state?.toLowerCase() === "open"
                        ).length
                      }{" "}
                      open
                    </span>
                  )}
                  {host.ports.filter((p) => p.state?.toLowerCase() === "open")
                    .length > 0 &&
                    host.ports.some((p) => p.service?.name) &&
                    " • "}
                  {host.ports.some((p) => p.service?.name) && (
                    <span>
                      Services:{" "}
                      {host.ports
                        .filter((p) => p.service?.name)
                        .map((p) => p.service?.name)
                        .join(", ")}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center">
            <Network className="mx-auto mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-500">No ports detected</p>
          </div>
        )}
      </div>

      {/* Security Overview */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Security Overview
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Bug className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {criticalCount}
            </div>
            <div className="text-sm text-gray-500">Critical Vulns</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Network className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {networkInterfaces}
            </div>
            <div className="text-sm text-gray-500">Attack Vectors</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Users className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {userAccounts}
            </div>
            <div className="text-sm text-gray-500">Privilege Points</div>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Lock className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {certificates}
            </div>
            <div className="text-sm text-gray-500">Certificates</div>
          </div>
        </div>

        {/* Security Summary */}
        <div className="mt-4 rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <strong>Security Summary:</strong>
            {criticalCount > 0 &&
              ` ${criticalCount} critical vulnerability${
                criticalCount > 1 ? "ies" : "y"
              } require immediate attention.`}
            {criticalCount === 0 &&
              highCount > 0 &&
              ` ${highCount} high-severity vulnerability${
                highCount > 1 ? "ies" : "y"
              } detected.`}
            {criticalCount === 0 &&
              highCount === 0 &&
              ` System appears secure with ${
                vulnerabilities.length
              } total vulnerability${
                vulnerabilities.length !== 1 ? "ies" : "y"
              }.`}
            {networkInterfaces > 5 &&
              ` Large attack surface with ${networkInterfaces} network interfaces.`}
            {userAccounts > 10 &&
              ` Consider reviewing ${userAccounts} user accounts for privilege management.`}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateRiskScore(vulnerabilities: Vulnerability[]): number {
  // Calculate risk score based on vulnerability severity
  const weights = { critical: 10, high: 5, medium: 2, low: 1 };
  const score = vulnerabilities.reduce((total, vuln) => {
    const severity = vuln.severity?.toLowerCase() as keyof typeof weights;
    return total + (weights[severity] || 0);
  }, 0);

  // Normalize to 0-100 scale
  return Math.min(Math.round(score * 2), 100);
}

function getRiskLevel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Minimal";
}

export default HostOverview;

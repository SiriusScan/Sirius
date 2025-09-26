import React, { useState } from "react";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { api } from "~/utils/api";
import {
  Cpu,
  HardDrive,
  Database,
  Layers,
  Server,
  Package,
  Users,
  Network,
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  Zap,
  Globe,
  Key,
  UserCheck,
  HardwareIcon as Hardware,
  MemoryStick,
} from "lucide-react";
import SoftwareInventory from "./SoftwareInventory";
import SystemFingerprint from "./SystemFingerprint";
import UserAccounts from "./UserAccounts";

interface HostSystemInfoProps {
  host: EnvironmentTableData;
}

type SystemInfoTab = "overview" | "software" | "fingerprint" | "users";

export const HostSystemInfo: React.FC<HostSystemInfoProps> = ({ host }) => {
  const [activeTab, setActiveTab] = useState<SystemInfoTab>("overview");

  // Fetch enhanced data for overview
  const { data: softwareInventory } =
    api.host.getHostSoftwareInventory.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip && activeTab === "overview", staleTime: 60000 }
    );

  const { data: systemFingerprint } =
    api.host.getHostSystemFingerprint.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip && activeTab === "overview", staleTime: 60000 }
    );

  const { data: softwareStats } = api.host.getHostSoftwareStats.useQuery(
    { ip: host.ip },
    { enabled: !!host.ip && activeTab === "overview", staleTime: 60000 }
  );

  // Extract key metrics for overview
  const metrics = React.useMemo(() => {
    const packages =
      softwareInventory?.package_count || softwareStats?.total_packages || 0;
    const users = systemFingerprint?.fingerprint?.users?.users?.length || 0;
    const groups = systemFingerprint?.fingerprint?.users?.groups?.length || 0;
    const networkInterfaces =
      systemFingerprint?.fingerprint?.network?.interfaces?.length || 0;
    const cpuCores = systemFingerprint?.fingerprint?.hardware?.cpu?.cores || 0;
    const totalMemoryGB =
      systemFingerprint?.fingerprint?.hardware?.memory?.total_gb || 0;
    const storageDevices =
      systemFingerprint?.fingerprint?.hardware?.storage?.length || 0;
    const certificates =
      systemFingerprint?.fingerprint?.certificates?.length || 0;

    // Calculate running services
    const servicesArray = Array.isArray(
      systemFingerprint?.fingerprint?.services
    )
      ? systemFingerprint.fingerprint.services
      : [];
    const runningServices = servicesArray.filter(
      (service: any) =>
        service.status?.toLowerCase() === "running" ||
        service.status?.toLowerCase() === "active"
    ).length;
    const totalServices = servicesArray.length;

    // Software diversity metrics
    const architectures = softwareStats?.statistics?.architectures
      ? Object.keys(softwareStats.statistics.architectures).length
      : 0;
    const publishers = softwareStats?.statistics?.publishers
      ? Object.keys(softwareStats.statistics.publishers).length
      : 0;

    return {
      packages,
      users,
      groups,
      networkInterfaces,
      cpuCores,
      totalMemoryGB,
      storageDevices,
      certificates,
      runningServices,
      totalServices,
      architectures,
      publishers,
      vulnerabilities: host.vulnerabilityCount || 0,
    };
  }, [
    softwareInventory,
    systemFingerprint,
    softwareStats,
    host.vulnerabilityCount,
  ]);

  const tabOptions = [
    { id: "overview" as const, label: "System Overview", icon: Server },
    { id: "software" as const, label: "Software Inventory", icon: Package },
    { id: "fingerprint" as const, label: "System Fingerprint", icon: Cpu },
    { id: "users" as const, label: "User Accounts", icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabOptions.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-violet-500 text-violet-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } flex items-center whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium dark:text-gray-300 dark:hover:text-gray-100`}
              >
                <IconComponent className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* System Identity & Status */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Server className="mr-3 h-6 w-6 text-violet-500" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {host.hostname || "Unknown Host"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {host.os || "Unknown OS"} • {host.ip}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last Scan</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {systemFingerprint?.collected_at
                        ? new Date(
                            systemFingerprint.collected_at
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex h-3 w-3 items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>

              {/* Key System Metrics */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">
                        Vulnerabilities
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metrics.vulnerabilities}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">
                        Software
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metrics.packages}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-orange-50 p-4 dark:bg-orange-900/20">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-orange-500" />
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">Users</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metrics.users}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="flex items-center">
                    <Activity className="h-5 w-5 text-green-500" />
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">
                        Services
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metrics.runningServices}/{metrics.totalServices}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
                  <div className="flex items-center">
                    <Network className="h-5 w-5 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">
                        Network
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metrics.networkInterfaces}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
                  <div className="flex items-center">
                    <Key className="h-5 w-5 text-yellow-500" />
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-500">
                        Certificates
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {metrics.certificates}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Hardware Specifications */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center">
                  <Cpu className="mr-3 h-5 w-5 text-green-500" />
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                    Hardware Specifications
                  </h4>
                </div>
                <div className="space-y-4">
                  {metrics.cpuCores > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Cpu className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          CPU Cores
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {metrics.cpuCores}
                      </span>
                    </div>
                  )}
                  {metrics.totalMemoryGB > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MemoryStick className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Memory
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {metrics.totalMemoryGB.toFixed(1)} GB
                      </span>
                    </div>
                  )}
                  {metrics.storageDevices > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <HardDrive className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Storage Devices
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {metrics.storageDevices}
                      </span>
                    </div>
                  )}
                  {metrics.networkInterfaces > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          Network Interfaces
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {metrics.networkInterfaces}
                      </span>
                    </div>
                  )}
                </div>
                {metrics.cpuCores === 0 &&
                  metrics.totalMemoryGB === 0 &&
                  metrics.storageDevices === 0 && (
                    <p className="text-sm text-gray-500">
                      Hardware information not available
                    </p>
                  )}
              </div>

              {/* Security Overview */}
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center">
                  <Shield className="mr-3 h-5 w-5 text-blue-500" />
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                    Security Overview
                  </h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Vulnerabilities
                      </span>
                    </div>
                    <span
                      className={`font-medium ${
                        metrics.vulnerabilities > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {metrics.vulnerabilities === 0
                        ? "None Found"
                        : metrics.vulnerabilities}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserCheck className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        User Accounts
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.users}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        User Groups
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.groups}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Key className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Certificates
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.certificates}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Network className="mr-2 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Attack Surface
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {metrics.networkInterfaces} interfaces
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Software & Environment Summary */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center">
                <Package className="mr-3 h-5 w-5 text-violet-500" />
                <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                  Software Environment
                </h4>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-md bg-violet-50 p-4 dark:bg-violet-900/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-violet-600">
                      {metrics.packages}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Installed Packages
                    </p>
                  </div>
                </div>
                <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.architectures}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Architectures
                    </p>
                  </div>
                </div>
                <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.publishers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Publishers
                    </p>
                  </div>
                </div>
              </div>
              {metrics.packages > 0 && (
                <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <strong>Software Diversity:</strong> {metrics.packages}{" "}
                    packages from {metrics.publishers} publishers across{" "}
                    {metrics.architectures} architecture
                    {metrics.architectures !== 1 ? "s" : ""}.
                    {softwareInventory?.collected_at && (
                      <span className="ml-2">
                        Last updated:{" "}
                        {new Date(
                          softwareInventory.collected_at
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                onClick={() => setActiveTab("software")}
                className="rounded-lg border border-violet-200 bg-violet-50 p-6 text-left transition-all hover:bg-violet-100 hover:shadow-md dark:border-violet-700 dark:bg-violet-900/20 dark:hover:bg-violet-900/30"
              >
                <div className="flex items-center">
                  <Package className="mr-4 h-8 w-8 text-violet-500" />
                  <div>
                    <h4 className="font-semibold text-violet-800 dark:text-violet-200">
                      Explore {metrics.packages} Packages
                    </h4>
                    <p className="text-sm text-violet-700 dark:text-violet-300">
                      View detailed software inventory and dependencies
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("fingerprint")}
                className="rounded-lg border border-green-200 bg-green-50 p-6 text-left transition-all hover:bg-green-100 hover:shadow-md dark:border-green-700 dark:bg-green-900/20 dark:hover:bg-green-900/30"
              >
                <div className="flex items-center">
                  <Cpu className="mr-4 h-8 w-8 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">
                      System Hardware
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      {metrics.cpuCores} cores,{" "}
                      {metrics.totalMemoryGB.toFixed(1)}GB RAM,{" "}
                      {metrics.networkInterfaces} interfaces
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className="rounded-lg border border-orange-200 bg-orange-50 p-6 text-left transition-all hover:bg-orange-100 hover:shadow-md dark:border-orange-700 dark:bg-orange-900/20 dark:hover:bg-orange-900/30"
              >
                <div className="flex items-center">
                  <Users className="mr-4 h-8 w-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                      {metrics.users} User Accounts
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      View user accounts, groups, and security settings
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === "software" && <SoftwareInventory hostIp={host.ip} />}

        {activeTab === "fingerprint" && <SystemFingerprint hostIp={host.ip} />}

        {activeTab === "users" && <UserAccounts hostIp={host.ip} />}
      </div>
    </div>
  );
};

export default HostSystemInfo;

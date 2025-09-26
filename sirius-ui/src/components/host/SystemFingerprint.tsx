import React from "react";
import { api } from "~/utils/api";
import {
  Cpu,
  HardDrive,
  Database,
  Network,
  Server,
  Monitor,
  Wifi,
  Router,
  Info,
} from "lucide-react";
import { Badge } from "~/components/lib/ui/badge";

interface SystemFingerprintProps {
  hostIp: string;
}

const SystemFingerprint: React.FC<SystemFingerprintProps> = ({ hostIp }) => {
  // Fetch system fingerprint data
  const {
    data: fingerprintData,
    isLoading,
    isError,
    refetch,
  } = api.host.getHostSystemFingerprint.useQuery(
    { ip: hostIp },
    {
      enabled: !!hostIp,
      staleTime: 300000, // Cache for 5 minutes
    }
  );

  // Format file size
  const formatFileSize = (gb?: number): string => {
    if (!gb) return "N/A";
    if (gb >= 1024) {
      return `${(gb / 1024).toFixed(1)} TB`;
    }
    return `${gb.toFixed(1)} GB`;
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

  // Format collection duration
  const formatDuration = (ms?: number): string => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
          <span className="ml-2">Loading system fingerprint...</span>
        </div>
      </div>
    );
  }

  if (isError || !fingerprintData) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Server className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Fingerprint
          </h3>
        </div>
        <div className="text-center">
          <p className="mb-4 text-gray-500">
            Failed to load system fingerprint data.
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

  const { fingerprint } = fingerprintData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <Server className="mr-2 h-5 w-5 text-violet-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              System Fingerprint
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Last updated: {formatDate(fingerprintData.collected_at)}
            </p>
            <p className="text-sm text-gray-500">
              Platform: {fingerprintData.platform}
            </p>
            <p className="text-sm text-gray-500">
              Collection time:{" "}
              {formatDuration(fingerprintData.collection_duration_ms)}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center">
              <Cpu className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">CPU Cores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fingerprint.hardware?.cpu?.cores || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Memory</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatFileSize(fingerprint.hardware?.memory?.total_gb)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-orange-50 p-4 dark:bg-orange-900/20">
            <div className="flex items-center">
              <HardDrive className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Storage Devices
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fingerprint.hardware?.storage?.length || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-purple-50 p-4 dark:bg-purple-900/20">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Network Interfaces
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {fingerprint.network?.interfaces?.length || "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Information */}
      {fingerprint.hardware && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center">
            <Monitor className="mr-2 h-5 w-5 text-violet-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Hardware Information
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* CPU Information */}
            {fingerprint.hardware.cpu && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <div className="mb-3 flex items-center">
                  <Cpu className="mr-2 h-4 w-4 text-blue-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    CPU
                  </h5>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Model:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {fingerprint.hardware.cpu.model || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Cores:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {fingerprint.hardware.cpu.cores || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Architecture:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {fingerprint.hardware.cpu.architecture || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Memory Information */}
            {fingerprint.hardware.memory && (
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                <div className="mb-3 flex items-center">
                  <Database className="mr-2 h-4 w-4 text-green-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    Memory
                  </h5>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total:</span>
                    <span className="text-sm text-gray-900 dark:text-white">
                      {formatFileSize(fingerprint.hardware.memory.total_gb)}
                    </span>
                  </div>
                  {fingerprint.hardware.memory.available_gb && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Available:</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {formatFileSize(
                          fingerprint.hardware.memory.available_gb
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Storage Information */}
          {fingerprint.hardware.storage &&
            fingerprint.hardware.storage.length > 0 && (
              <div className="mt-6">
                <div className="mb-4 flex items-center">
                  <HardDrive className="mr-2 h-4 w-4 text-orange-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    Storage Devices
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Device
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Size
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Filesystem
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {fingerprint.hardware.storage.map((device, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {device.device}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {formatFileSize(device.size_gb)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={`text-xs ${
                                device.type?.toLowerCase() === "ssd"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                  : device.type?.toLowerCase() === "hdd"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                              }`}
                            >
                              {device.type || "Unknown"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {device.filesystem || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Network Information */}
      {fingerprint.network && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center">
            <Wifi className="mr-2 h-5 w-5 text-violet-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Network Configuration
            </h4>
          </div>

          {/* DNS Servers */}
          {fingerprint.network.dns_servers &&
            fingerprint.network.dns_servers.length > 0 && (
              <div className="mb-6">
                <div className="mb-3 flex items-center">
                  <Router className="mr-2 h-4 w-4 text-blue-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    DNS Servers
                  </h5>
                </div>
                <div className="flex flex-wrap gap-2">
                  {fingerprint.network.dns_servers.map((server, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {server}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Network Interfaces */}
          {fingerprint.network.interfaces &&
            fingerprint.network.interfaces.length > 0 && (
              <div>
                <div className="mb-4 flex items-center">
                  <Network className="mr-2 h-4 w-4 text-purple-500" />
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    Network Interfaces
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          Interface
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          MAC Address
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          IPv4 Addresses
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                          IPv6 Addresses
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {fingerprint.network.interfaces.map((iface, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {iface.name}
                          </td>
                          <td className="px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">
                            {iface.mac}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {iface.ipv4.map((ip, ipIndex) => (
                                <Badge
                                  key={ipIndex}
                                  className="bg-green-100 font-mono text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                >
                                  {ip}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {iface.ipv6?.map((ip, ipIndex) => (
                                <Badge
                                  key={ipIndex}
                                  className="bg-blue-100 font-mono text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                >
                                  {ip}
                                </Badge>
                              )) || (
                                <span className="text-sm text-gray-500">
                                  None
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Data Collection Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center">
          <Info className="mr-2 h-4 w-4 text-gray-400" />
          <div className="text-sm text-gray-500">
            Data collected from {fingerprintData.source} on{" "}
            {formatDate(fingerprintData.collected_at)}(
            {formatDuration(fingerprintData.collection_duration_ms)} collection
            time)
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemFingerprint;

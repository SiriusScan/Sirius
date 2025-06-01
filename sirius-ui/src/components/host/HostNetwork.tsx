import React from "react";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { Network, Wifi, Globe, Lock } from "lucide-react";

interface HostNetworkProps {
  host: EnvironmentTableData;
}

export const HostNetwork: React.FC<HostNetworkProps> = ({ host }) => {
  return (
    <div className="space-y-6">
      {/* Network Interfaces */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Network className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Network Interfaces
          </h3>
        </div>
        {false ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    IP Address
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    MAC Address
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* No network interfaces available */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
            <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <Network className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              No network interfaces found
            </h3>
            <p className="text-sm text-gray-500">
              Network interface information is not available for this host.
            </p>
          </div>
        )}
      </div>

      {/* Open Ports */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Open Ports
          </h3>
        </div>
        {false ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">
                    Port
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Protocol
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Service
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    State
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* No open ports available */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
            <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium">No open ports found</h3>
            <p className="text-sm text-gray-500">
              No open ports were detected on this host.
            </p>
          </div>
        )}
      </div>

      {/* Routing Table */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Globe className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Routing Table
          </h3>
        </div>
        {false ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">
                    Destination
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Gateway
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Interface
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Metric
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* No routes available */}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
            <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
              <Globe className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium">
              No routing information found
            </h3>
            <p className="text-sm text-gray-500">
              Routing table information is not available for this host.
            </p>
          </div>
        )}
      </div>

      {/* Connection Summary */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Wifi className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Connection Summary
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Active Connections
            </h4>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              0
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Inbound Traffic
            </h4>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              Unknown
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">
              Outbound Traffic
            </h4>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              Unknown
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostNetwork;

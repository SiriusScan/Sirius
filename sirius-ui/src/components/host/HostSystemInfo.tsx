import React from "react";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { Cpu, HardDrive, Database, Layers, Server } from "lucide-react";

interface HostSystemInfoProps {
  host: EnvironmentTableData;
}

export const HostSystemInfo: React.FC<HostSystemInfoProps> = ({ host }) => {
  return (
    <div className="space-y-6">
      {/* Operating System Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Server className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Operating System
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">OS Type</h4>
            <p className="text-gray-900 dark:text-white">
              {host.os || "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">OS Version</h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Kernel</h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Architecture</h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
        </div>
      </div>

      {/* Hardware Information */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <HardDrive className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Hardware
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-gray-500">CPU</h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Memory</h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Disk Space</h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Virtualization
            </h4>
            <p className="text-gray-900 dark:text-white">Unknown</p>
          </div>
        </div>
      </div>

      {/* Installed Software */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Layers className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Installed Software
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
                    Version
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Installed Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* No software available */}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No software information available.</p>
        )}
      </div>

      {/* System Users */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <svg
            className="mr-2 h-5 w-5 text-violet-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Users
          </h3>
        </div>
        {false ? (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left">
                    Username
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    User ID
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Group
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Last Login
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* No users available */}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No user information available.</p>
        )}
      </div>

      {/* System Services */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Cpu className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Services
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
                    Status
                  </th>
                  <th scope="col" className="px-4 py-2 text-left">
                    Port
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* No services available */}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No service information available.</p>
        )}
      </div>
    </div>
  );
};

export default HostSystemInfo;

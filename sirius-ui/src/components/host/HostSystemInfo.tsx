import React from "react";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { Cpu, HardDrive, Memory, Layers, Server } from "lucide-react";

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
            <p className="text-gray-900 dark:text-white">
              {host.osVersion || "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Kernel</h4>
            <p className="text-gray-900 dark:text-white">
              {host.kernel || "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Architecture</h4>
            <p className="text-gray-900 dark:text-white">
              {host.architecture || "Unknown"}
            </p>
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
            <p className="text-gray-900 dark:text-white">
              {host.cpu || "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Memory</h4>
            <p className="text-gray-900 dark:text-white">
              {host.memory ? `${host.memory} GB` : "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Disk Space</h4>
            <p className="text-gray-900 dark:text-white">
              {host.diskSpace ? `${host.diskSpace} GB` : "Unknown"}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Virtualization
            </h4>
            <p className="text-gray-900 dark:text-white">
              {host.virtualization || "Unknown"}
            </p>
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
        {host.installedSoftware && host.installedSoftware.length > 0 ? (
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
                {host.installedSoftware.map((software, index) => (
                  <tr
                    key={index}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {software.name}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {software.version}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {software.installedDate
                        ? new Date(software.installedDate).toLocaleDateString()
                        : "Unknown"}
                    </td>
                  </tr>
                ))}
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
        {host.users && host.users.length > 0 ? (
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
                {host.users.map((user, index) => (
                  <tr
                    key={index}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {user.username}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {user.uid}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {user.group}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Unknown"}
                    </td>
                  </tr>
                ))}
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
        {host.services && host.services.length > 0 ? (
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
                {host.services.map((service, index) => (
                  <tr
                    key={index}
                    className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {service.name}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          service.status === "running"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        {service.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-white">
                      {service.port || "N/A"}
                    </td>
                  </tr>
                ))}
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

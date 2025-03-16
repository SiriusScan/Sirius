import React from "react";
import { Clock, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

interface HostHistoryProps {
  hostIp: string;
}

export const HostHistory: React.FC<HostHistoryProps> = ({ hostIp }) => {
  // This would normally be fetched from an API
  // For now, we'll use mock data
  const scanHistory = [
    {
      id: "scan-1",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      status: "completed",
      vulnerabilitiesFound: 12,
      duration: "3m 45s",
    },
    {
      id: "scan-2",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      status: "completed",
      vulnerabilitiesFound: 15,
      duration: "4m 12s",
    },
    {
      id: "scan-3",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
      status: "failed",
      error: "Connection timeout",
      duration: "1m 30s",
    },
    {
      id: "scan-4",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      status: "completed",
      vulnerabilitiesFound: 18,
      duration: "3m 55s",
    },
  ];

  const vulnerabilityHistory = [
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      added: 2,
      removed: 5,
      critical: 1,
      high: 3,
      medium: 5,
      low: 3,
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      added: 5,
      removed: 0,
      critical: 2,
      high: 5,
      medium: 6,
      low: 2,
    },
    {
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      added: 18,
      removed: 0,
      critical: 3,
      high: 7,
      medium: 5,
      low: 3,
    },
  ];

  const configChanges = [
    {
      id: "change-1",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      type: "software_installed",
      details: "Installed Apache 2.4.52",
    },
    {
      id: "change-2",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
      type: "port_opened",
      details: "Port 443 opened (HTTPS)",
    },
    {
      id: "change-3",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
      type: "user_added",
      details: "User 'admin' added to system",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Scan History */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <RefreshCw className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Scan History
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Status
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Vulnerabilities
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {scanHistory.map((scan) => (
                <tr
                  key={scan.id}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {scan.date.toLocaleDateString()}{" "}
                    {scan.date.toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2">
                    {scan.status === "completed" ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        Failed: {scan.error}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {scan.status === "completed"
                      ? scan.vulnerabilitiesFound
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {scan.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vulnerability Trends */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Vulnerability Trends
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-4 py-2 text-left">
                  Date
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Added
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Removed
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Critical
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  High
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Medium
                </th>
                <th scope="col" className="px-4 py-2 text-left">
                  Low
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {vulnerabilityHistory.map((history, index) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    {history.date.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    <span className="text-red-600 dark:text-red-400">
                      +{history.added}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400">
                      -{history.removed}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    <span className="text-red-600 dark:text-red-400">
                      {history.critical}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    <span className="text-orange-600 dark:text-orange-400">
                      {history.high}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    <span className="text-yellow-600 dark:text-yellow-400">
                      {history.medium}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-900 dark:text-white">
                    <span className="text-green-600 dark:text-green-400">
                      {history.low}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configuration Changes */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-violet-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Configuration Changes
          </h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>

            {/* Timeline items */}
            <div className="space-y-6 pl-10">
              {configChanges.map((change) => (
                <div key={change.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 mt-1.5 h-3 w-3 rounded-full border-2 border-violet-500 bg-white dark:bg-gray-800"></div>

                  {/* Content */}
                  <div>
                    <p className="text-sm text-gray-500">
                      {change.date.toLocaleDateString()}{" "}
                      {change.date.toLocaleTimeString()}
                    </p>
                    <h4 className="mt-1 font-medium text-gray-900 dark:text-white">
                      {change.type === "software_installed"
                        ? "Software Installed"
                        : change.type === "port_opened"
                        ? "Port Opened"
                        : change.type === "user_added"
                        ? "User Added"
                        : "Configuration Change"}
                    </h4>
                    <p className="mt-1 text-gray-600 dark:text-gray-300">
                      {change.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostHistory;

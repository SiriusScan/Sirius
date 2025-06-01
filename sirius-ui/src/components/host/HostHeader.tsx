import React from "react";
import { ShieldAlert, Tag, Download, RefreshCw } from "lucide-react";
import { type EnvironmentTableData } from "~/server/api/routers/host";

interface HostHeaderProps {
  host: EnvironmentTableData;
  onScan: () => void;
  isScanning: boolean;
}

export const HostHeader: React.FC<HostHeaderProps> = ({
  host,
  onScan,
  isScanning,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col items-start justify-between space-y-3 md:flex-row md:items-center md:space-y-0">
        <div className="flex items-center">
          <div className="mr-4 rounded-full bg-violet-100 p-3 dark:bg-violet-900/20">
            <ShieldAlert className="h-6 w-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {host.hostname || host.ip}
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <span>{host.ip}</span>
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                  host.vulnerabilityCount === 0
                    ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                }`}
              >
                {host.vulnerabilityCount === 0
                  ? "Secure"
                  : `${host.vulnerabilityCount} vulnerabilities`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700"
            onClick={onScan}
            disabled={isScanning}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${isScanning ? "animate-spin" : ""}`}
            />
            {isScanning ? "Scanning..." : "Scan Now"}
          </button>

          <button className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700">
            <Tag className="mr-1.5 h-4 w-4" />
            Manage Tags
          </button>

          <button className="flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm dark:border-gray-700">
            <Download className="mr-1.5 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Host tags */}
      {host.tags && host.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {host.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-900/20 dark:text-violet-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostHeader;

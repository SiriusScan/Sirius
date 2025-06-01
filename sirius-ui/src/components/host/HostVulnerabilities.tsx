import React from "react";
import { type Vulnerability } from "~/server/api/routers/host";
import DataTable from "~/components/VulnerabilityTableBasic";
import { SeverityBadge } from "~/components/SeverityBadge";
import type { ColumnDefinition } from "~/components/VulnerabilityTableBasic";

interface HostVulnerabilitiesProps {
  vulnerabilities: Vulnerability[];
  isLoading: boolean;
}

export const HostVulnerabilities: React.FC<HostVulnerabilitiesProps> = ({
  vulnerabilities,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
        <span className="ml-2">Loading vulnerabilities...</span>
      </div>
    );
  }

  if (vulnerabilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
        <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/20">
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium">No vulnerabilities found</h3>
        <p className="text-sm text-gray-500">
          This host appears to be secure. Continue regular scanning to monitor
          for new vulnerabilities.
        </p>
      </div>
    );
  }

  // Define columns for the vulnerability table
  const vulnerabilityColumns: ColumnDefinition<Vulnerability>[] = [
    {
      header: "CVE ID",
      accessor: "cve",
    },
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Severity",
      render: (vuln) => <SeverityBadge severity={vuln.severity || "unknown"} />,
    },
    {
      header: "Risk Score",
      render: (vuln) => <span>{vuln.riskScore?.toFixed(1) || "N/A"}</span>,
    },
  ];

  return (
    <DataTable
      title="Host Vulnerabilities"
      data={vulnerabilities}
      columns={vulnerabilityColumns}
    />
  );
};

export default HostVulnerabilities;

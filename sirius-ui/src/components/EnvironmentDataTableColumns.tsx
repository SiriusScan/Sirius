"use client";

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { VulnerabilityBarGraphCompact } from "~/components/VulnerabilityBarGraph";
import { calculateHostRiskScore } from "~/utils/vulnerability-service";
import { type HostVulnerabilityCounts } from "~/types/vulnerabilityTypes";

import {
  ArrowUp,
  ArrowDown,
  Circle,
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Button } from "~/components/lib/ui/button";
import { Checkbox } from "~/components/lib/ui/checkbox";

import AppleIcon from "~/components/icons/AppleIcon";
import LinuxIcon from "~/components/icons/LinuxIcon";
import WindowsIcon from "~/components/icons/WindowsIcon";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/lib/ui/dropdown-menu";

import { cn } from "~/components/lib/utils";
import { HostRowActions } from "~/components/HostRowActions";

// Calculate risk score based on vulnerability distribution
function calculateRiskScore(host: EnvironmentTableData): number {
  // Calculate risk score directly from the vulnerability count
  // Uses a logarithmic scale to represent diminishing returns on risk
  // (e.g., 100 vulnerabilities isn't 10x as risky as 10)
  const count = host.vulnerabilityCount || 0;
  if (count === 0) return 0;

  // Simple formula: base points per vulnerability with diminishing returns
  return Math.min(Math.round(20 * Math.log10(count + 1)), 100);
}

// Helper for OS icons
const OSIconSelector = ({ os }: { os: string }) => {
  // Normalize OS name for matching
  const osLower = os?.toLowerCase() || "";

  if (osLower.includes("windows")) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-blue-500"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 8h.01"></path>
        <path d="M8 8h.01"></path>
        <path d="M8 16h.01"></path>
        <path d="M16 16h.01"></path>
      </svg>
    );
  } else if (
    osLower.includes("linux") ||
    osLower.includes("ubuntu") ||
    osLower.includes("debian") ||
    osLower.includes("centos")
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-orange-500"
      >
        <path d="M12 21a9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9z"></path>
        <path d="M12 3v4"></path>
        <path d="M12 12h4"></path>
      </svg>
    );
  } else if (
    osLower.includes("mac") ||
    osLower.includes("darwin") ||
    osLower.includes("ios")
  ) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-500"
      >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m2 12 20 0"></path>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    );
  } else {
    // Default unknown OS icon
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 16v-4"></path>
        <path d="M12 8h.01"></path>
      </svg>
    );
  }
};

// Helper for OS name display
const OSSelector = ({ os }: { os: string }) => {
  return (
    <div className="flex items-center">
      <span className="mr-2">
        <OSIconSelector os={os} />
      </span>
      <span>{os || "Unknown"}</span>
    </div>
  );
};

// Risk score badge with color coding
const RiskScoreBadge = ({ score }: { score: number }) => {
  let colorClass = "bg-gray-100 text-gray-800";

  if (score >= 80) {
    colorClass = "bg-red-100 text-red-800";
  } else if (score >= 60) {
    colorClass = "bg-orange-100 text-orange-800";
  } else if (score >= 40) {
    colorClass = "bg-yellow-100 text-yellow-800";
  } else if (score >= 20) {
    colorClass = "bg-green-100 text-green-800";
  } else if (score > 0) {
    colorClass = "bg-blue-100 text-blue-800";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {score}
    </span>
  );
};

// Cell renderer for the vulnerabilities column
function VulnerabilitiesCell({ host }: { host: EnvironmentTableData }) {
  // Directly fetch and display vulnerability data using the host ID
  return (
    <div className="min-w-[200px]">
      <VulnerabilityBarGraphCompact hostId={host.ip} />
    </div>
  );
}

// Create our column helper with the EnvironmentTableData type
const columnHelper = createColumnHelper<EnvironmentTableData>();

// Utility function to render a status badge
const StatusBadge = ({ status }: { status: string }) => {
  const colorMap: Record<
    string,
    { bg: string; text: string; icon: JSX.Element }
  > = {
    online: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-300",
      icon: <Circle className="h-2 w-2 fill-green-500 text-green-500" />,
    },
    offline: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-300",
      icon: <Circle className="h-2 w-2 fill-red-500 text-red-500" />,
    },
    warning: {
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-300",
      icon: <ShieldAlert className="h-3 w-3 text-yellow-500" />,
    },
    secure: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-300",
      icon: <ShieldCheck className="h-3 w-3 text-green-500" />,
    },
  };

  const config = colorMap[status?.toLowerCase()] || colorMap.warning;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-0.5",
        config.bg
      )}
    >
      {config?.icon}
      <span className={cn("text-xs font-medium", config?.text)}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    </div>
  );
};

// Utility function to render a risk badge
const RiskBadge = ({ risk }: { risk: string }) => {
  const colorMap: Record<string, { bg: string; text: string }> = {
    critical: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-300",
    },
    high: {
      bg: "bg-orange-100 dark:bg-orange-900/20",
      text: "text-orange-800 dark:text-orange-300",
    },
    medium: {
      bg: "bg-yellow-100 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-300",
    },
    low: {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-300",
    },
    info: {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-300",
    },
  };

  const config = colorMap[risk.toLowerCase()] || colorMap.medium;

  return (
    <div className={cn("rounded-full px-2 py-0.5 text-center", config.bg)}>
      <span className={cn("text-xs font-medium", config.text)}>
        {risk.charAt(0).toUpperCase() + risk.slice(1)}
      </span>
    </div>
  );
};

// Function to render vulnerability count with color coding
const VulnerabilityCount = ({ count }: { count: number }) => {
  let colorClass = "text-green-600 dark:text-green-400";

  if (count > 50) {
    colorClass = "text-red-600 dark:text-red-400";
  } else if (count > 20) {
    colorClass = "text-orange-600 dark:text-orange-400";
  } else if (count > 5) {
    colorClass = "text-yellow-600 dark:text-yellow-400";
  }

  return <span className={colorClass}>{count}</span>;
};

// Function to determine host risk level based on vulnerability count
const getRiskLevel = (vulnerabilityCount: number): string => {
  if (vulnerabilityCount > 50) return "critical";
  if (vulnerabilityCount > 20) return "high";
  if (vulnerabilityCount > 5) return "medium";
  if (vulnerabilityCount > 0) return "low";
  return "info";
};

// Define the columns
export const columns = [
  // Host column with hostname and IP
  columnHelper.accessor((row) => ({ hostname: row.hostname, ip: row.ip }), {
    id: "host",
    header: "Host",
    cell: ({ getValue }) => {
      const { hostname, ip } = getValue();
      const status = determineHostStatus(getValue());
      return (
        <div className="flex flex-col">
          <div className="font-medium">{hostname || ip}</div>
          {hostname && <div className="text-xs text-gray-500">{ip}</div>}
          <div className="text-xs text-gray-500">{status}</div>
        </div>
      );
    },
  }),

  // OS column
  columnHelper.accessor("os", {
    header: "Operating System",
    cell: ({ getValue }) => <OSSelector os={getValue()} />,
  }),

  // Vulnerabilities column
  columnHelper.accessor("vulnerabilityCount", {
    id: "vulnerabilities",
    header: "Vulnerabilities",
    cell: ({ row }) => {
      const host = row.original;
      return <VulnerabilitiesCell host={host} />;
    },
  }),

  // Risk score column
  columnHelper.accessor((row) => row, {
    id: "riskScore",
    header: "Risk Level",
    cell: ({ getValue, table }) => {
      const host = getValue();
      const riskLevel = getRiskLevel(host.vulnerabilityCount || 0);
      return <RiskBadge risk={riskLevel} />;
    },
  }),

  // Tags column
  columnHelper.accessor("tags", {
    header: "Tags",
    cell: ({ getValue }) => {
      const tags = getValue() || [];
      if (tags.length === 0) return null;

      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      );
    },
  }),

  // Status column
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ getValue }) => <StatusBadge status={getValue()} />,
  }),

  // IP addresses column
  columnHelper.accessor("ipAddresses", {
    header: "IP Addresses",
    cell: ({ getValue }) => {
      const ipAddresses = getValue() || [];
      return (
        <div>
          {ipAddresses.slice(0, 2).join(", ")}
          {ipAddresses.length > 2 && ` +${ipAddresses.length - 2} more`}
        </div>
      );
    },
  }),

  // Last scan date column
  columnHelper.accessor("lastScanDate", {
    header: "Last Scan",
    cell: ({ getValue }) => {
      const lastScanDate = getValue();
      if (!lastScanDate) return <span className="text-gray-500">Never</span>;

      // Format the date (implement your preferred date formatting)
      const formattedDate = new Date(lastScanDate).toLocaleString();
      return <span>{formattedDate}</span>;
    },
  }),

  // Actions column
  columnHelper.accessor((row) => row, {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <HostRowActions
            host={row.original}
            onScan={(host) => {
              console.log("Scanning host:", host.ip);
              // Implement scan logic
            }}
            onTag={(host) => {
              console.log("Managing tags for host:", host.ip);
              // Implement tag management logic
            }}
            onDelete={(host) => {
              console.log("Deleting host:", host.ip);
              // Implement delete logic with confirmation
              if (
                confirm(
                  `Are you sure you want to remove ${
                    host.hostname || host.ip
                  } from the environment?`
                )
              ) {
                // Delete logic here
              }
            }}
          />
        </div>
      );
    },
  }),
];

// Helper function to determine host status - in a real app, this would use actual data
function determineHostStatus(host: EnvironmentTableData): string {
  // This is a placeholder - in a real application you'd determine this based on actual data
  if (!host) return "unknown";

  // Example logic - you'd replace this with real logic based on your data
  if (host.vulnerabilityCount > 20) return "warning";
  if (
    host.lastScanDate &&
    new Date(host.lastScanDate).getTime() > Date.now() - 86400000
  ) {
    return host.vulnerabilityCount > 0 ? "warning" : "secure";
  }

  // Default to online
  return "online";
}

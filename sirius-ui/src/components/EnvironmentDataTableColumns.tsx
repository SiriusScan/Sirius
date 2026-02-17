"use client";

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { VulnerabilityBarGraphCompact } from "~/components/VulnerabilityBarGraph";

import { Circle, ShieldAlert, ShieldCheck } from "lucide-react";

import { cn } from "~/components/lib/utils";
import { HostRowActions } from "~/components/HostRowActions";

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

// Risk score badge with color coding (v4 palette)
const RiskScoreBadge = ({ score }: { score: number }) => {
  let colorClass = "bg-gray-900/50 text-gray-400 border border-violet-500/10";

  if (score >= 80) {
    colorClass = "bg-red-500/20 text-red-300 border border-red-500/20";
  } else if (score >= 60) {
    colorClass = "bg-orange-500/20 text-orange-300 border border-orange-500/20";
  } else if (score >= 40) {
    colorClass = "bg-yellow-500/20 text-yellow-300 border border-yellow-500/20";
  } else if (score >= 20) {
    colorClass = "bg-green-500/20 text-green-300 border border-green-500/20";
  } else if (score > 0) {
    colorClass = "bg-blue-500/20 text-blue-300 border border-blue-500/20";
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
      bg: "bg-green-900/20",
      text: "text-green-300",
      icon: <Circle className="h-2 w-2 fill-green-500 text-green-500" />,
    },
    offline: {
      bg: "bg-red-900/20",
      text: "text-red-300",
      icon: <Circle className="h-2 w-2 fill-red-500 text-red-500" />,
    },
    warning: {
      bg: "bg-yellow-900/20",
      text: "text-yellow-300",
      icon: <ShieldAlert className="h-3 w-3 text-yellow-500" />,
    },
    secure: {
      bg: "bg-green-900/20",
      text: "text-green-300",
      icon: <ShieldCheck className="h-3 w-3 text-green-500" />,
    },
  };

  const statusKey = status?.toLowerCase() || "warning";
  const config = colorMap[statusKey] || colorMap.warning;

  // Ensure config is never undefined
  if (!config) {
    throw new Error("Config should never be undefined");
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2 py-0.5",
        config.bg
      )}
    >
      {config.icon}
      <span className={cn("text-xs font-medium", config.text)}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    </div>
  );
};

// Risk badge — uses shared component
import { RiskBadge } from "~/components/shared/SeverityBadge";

// Function to render vulnerability count with color coding
const VulnerabilityCount = ({ count }: { count: number }) => {
  let colorClass = "text-green-400";

  if (count > 50) {
    colorClass = "text-red-400";
  } else if (count > 20) {
    colorClass = "text-orange-400";
  } else if (count > 5) {
    colorClass = "text-yellow-400";
  }

  return <span className={colorClass}>{count}</span>;
};

// getRiskLevel — uses centralized util, extracts maxCvss from host vulnerabilities
import { getRiskLevel as getRiskLevelUtil } from "~/utils/riskScoreCalculator";
const getRiskLevel = (host: EnvironmentTableData): string => {
  const maxScore =
    host.vulnerabilities && host.vulnerabilities.length > 0
      ? host.vulnerabilities.reduce((max, v) => Math.max(max, v.riskScore || 0), 0)
      : undefined;
  return getRiskLevelUtil(maxScore, host.vulnerabilityCount || 0);
};

// Severity indicator dot — shows the host's highest severity
const SeverityDot = ({ host }: { host: EnvironmentTableData }) => {
  const vulns = host.vulnerabilities ?? [];
  if (vulns.length === 0) return null;

  // Determine the highest severity present
  const hasCritical = vulns.some(
    (v) => v.severity?.toLowerCase() === "critical",
  );
  const hasHigh = vulns.some((v) => v.severity?.toLowerCase() === "high");
  const hasMedium = vulns.some((v) => v.severity?.toLowerCase() === "medium");
  const hasLow = vulns.some((v) => v.severity?.toLowerCase() === "low");

  let dotColor = "bg-blue-500"; // informational
  if (hasCritical) dotColor = "bg-red-500";
  else if (hasHigh) dotColor = "bg-orange-500";
  else if (hasMedium) dotColor = "bg-amber-500";
  else if (hasLow) dotColor = "bg-green-500";

  return (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 rounded-full ring-2 ring-gray-900/50",
        dotColor,
      )}
      title={
        hasCritical
          ? "Critical severity"
          : hasHigh
            ? "High severity"
            : hasMedium
              ? "Medium severity"
              : hasLow
                ? "Low severity"
                : "Informational"
      }
    />
  );
};

// Open Ports cell — renders count + top port badges
const OpenPortsCell = ({ host }: { host: EnvironmentTableData }) => {
  const ports = host.ports ?? [];
  if (ports.length === 0) {
    return <span className="text-xs text-gray-500">—</span>;
  }

  const top3 = ports.slice(0, 3);
  const remaining = ports.length - top3.length;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-medium text-gray-300">{ports.length}</span>
      <div className="flex gap-1">
        {top3.map((p, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium text-violet-300"
          >
            {p.number}
          </span>
        ))}
        {remaining > 0 && (
          <span className="text-[10px] text-gray-500">+{remaining}</span>
        )}
      </div>
    </div>
  );
};

// Define the columns
export const columns = [
  // Host column with hostname, IP, and severity indicator dot
  columnHelper.accessor((row) => ({ hostname: row.hostname, ip: row.ip }), {
    id: "host",
    header: "Host",
    cell: ({ getValue, row }) => {
      const { hostname, ip } = getValue();
      return (
        <div className="flex items-center gap-2.5">
          <SeverityDot host={row.original} />
          <div className="flex flex-col">
            <div className="font-medium">{hostname || ip}</div>
            {hostname && <div className="text-xs text-gray-500">{ip}</div>}
          </div>
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

  // Open Ports column
  columnHelper.accessor((row) => row.ports?.length ?? 0, {
    id: "openPorts",
    header: "Open Ports",
    cell: ({ row }) => <OpenPortsCell host={row.original} />,
  }),

  // Risk score column
  columnHelper.accessor((row) => row, {
    id: "riskScore",
    header: "Risk Level",
    cell: ({ getValue }) => {
      const host = getValue();
      const riskLevel = getRiskLevel(host);
      return <RiskBadge severity={riskLevel} />;
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
              className="inline-flex items-center rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300"
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

  // Status column (computed from host data)
  columnHelper.accessor((row) => row, {
    id: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const host = getValue();
      const status = determineHostStatus(host);
      return <StatusBadge status={status} />;
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
                  } from the environment?`,
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

  // Example logic based on available data
  if (host.vulnerabilityCount > 20) return "warning";
  if (host.vulnerabilityCount > 0) return "warning";

  // Default to online if no vulnerabilities
  return "online";
}

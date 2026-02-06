import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { useSearchParams } from "next/navigation";

import Layout from "~/components/Layout";
import { type gd, columns } from "~/components/VulnerabilityDataTableColumns";
import { VulnerabilityDataTable } from "~/components/VulnerabilityDataTable";
import UnknownIcon from "~/components/icons/UnknownIcon";
import WindowsIcon from "~/components/icons/WindowsIcon";
import AppleIcon from "~/components/icons/AppleIcon";
import LinuxIcon from "~/components/icons/LinuxIcon";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";
import { Button } from "~/components/lib/ui/button";
import { DataBoxTable } from "~/components/DataBoxTable";
import { Badge } from "~/components/lib/ui/badge";

import { api } from "~/utils/api";
import { HostStatistics, type SiriusHost } from "~/server/api/routers/host";

// --------------------------
// Helper Functions
// --------------------------

const determineSeverity = (
  cvssScore: number
): "critical" | "high" | "medium" | "low" | "informational" => {
  if (cvssScore >= 9.0) return "critical";
  if (cvssScore >= 7.0) return "high";
  if (cvssScore >= 4.0) return "medium";
  if (cvssScore > 0) return "low";
  return "informational";
};

const selectOsIcon = (host: SiriusHost) => {
  switch (host.os) {
    case "windows":
      return <WindowsIcon width="35px" height="35px" />;
    case "linux":
      return <LinuxIcon width="35px" height="35px" />;
    case "macos":
      return <AppleIcon width="35px" height="35px" />;
    default:
      return <UnknownIcon width="35px" height="35px" />;
  }
};

// --------------------------
// Main Component
// --------------------------
interface VulnTableRow {
  id: string;
  severity: "critical" | "high" | "medium" | "low" | "informational";
  cvss: number;
  cve: string;
  count: number;
  description: string;
  published: string;
}

const Host = () => {
  const [view, setView] = React.useState<string>("host-details");

  const searchParams = useSearchParams();
  const currentHost = searchParams.get("id");

  const {
    data: hostData,
    isLoading,
    isError,
  } = api.host.getHost.useQuery(
    { hid: currentHost! },
    {
      enabled: currentHost !== null,
    }
  );

  const emptyHost: SiriusHost = {
    hid: "1",
    hostname: "N/A",
    ip: "N/A",
    os: "linux",
    osversion: "N/A",
    asset_type: "server",
    services: [],
    ports: [],
    users: [],
    vulnerabilities: [],
    tags: [],
  };

  const host = hostData ?? emptyHost;

  const osIcon = useMemo(() => selectOsIcon(host), [host]);

  // Map users to string array.
  const userData =
    host.users?.map((user) => [
      user.username,
      user.type,
      user.details ?? "N/A",
    ]) ?? [];

  const vulnData: VulnTableRow[] = useMemo(() => {
    return (
      host.vulnerabilities?.map((vuln) => ({
        id: vuln.vid,
        severity: determineSeverity(vuln.riskScore),
        cvss: vuln.riskScore,
        cve: vuln.vid ?? "N/A",
        count: 1,
        description: vuln.description,
        published: vuln.published,
      })) ?? []
    );
  }, [host.vulnerabilities]);

  const { data: vulnStats } = api.host.getHostStatistics.useQuery(
    { hid: currentHost ?? "" },
    { enabled: !!currentHost }
  );

  const processedVulnMetrics = useMemo(() => {
    const defaultCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };
    return {
      ...defaultCounts,
      ...vulnStats?.hostSeverityCounts,
    };
  }, [vulnStats]);

  const userHeaders = ["Username", "Type", "Details"];

  const handleViewNavigator = useCallback((view: string) => {
    console.log(view);
    setView(view);
  }, []);

  const renderTags = (tags: string[]) => (
    <>
      {tags.map((tag, index) => (
        <Badge key={index} variant="default" className="mr-2">
          {tag}
        </Badge>
      ))}
    </>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    return <div>An error occurred loading host data.</div>;
  }
  if (!currentHost) {
    return <p>No host selected.</p>;
  }

  // Optionally, prepare a list of views to render the navigation buttons.
  const views = [
    { key: "host-details", label: "Host Details" },
    { key: "vulnerabilities", label: "Vulnerabilities" },
    { key: "users", label: "Users" },
    { key: "terminal", label: "Terminal" },
  ];

  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className="z-10 flex flex-row items-center">
          <div className="ml-4 mt-7 flex dark:fill-white">{osIcon}</div>
          <h1 className="ml-3 mt-5 flex text-4xl font-extralight">
            {host.hostname} - {host.ip}
          </h1>
        </div>
        <div className="ml-20 text-violet-100/70">{host.osversion}</div>
        <div className="m-auto justify-center">
          <VulnerabilitySeverityCardsHorizontal counts={processedVulnMetrics} />
        </div>
        <div className="ml-5 mt-2">{renderTags(host.tags ?? [])}</div>
        <div className="ml-4 py-3">
          <div className="flex gap-2">
            {views.map((v) => (
              <Button
                key={v.key}
                variant={view === v.key ? "secondary" : "default"}
                onClick={() => handleViewNavigator(v.key)}
              >
                {v.label}
              </Button>
            ))}
          </div>

          {view === "vulnerabilities" && (
            <VulnerabilityDataTable columns={columns} data={vulnData} />
          )}
          {view === "users" && (
            <UserView userHeaders={userHeaders} userData={userData} />
          )}
          {view === "host-details" && vulnStats && (
            <HostDetails host={host} vulnStats={vulnStats} />
          )}
          {view === "terminal" && <Terminal />}
        </div>
      </div>
    </Layout>
  );
};

export default Host;

// --------------------------
// Subcomponents
// --------------------------
const Terminal = () => {
  return (
    <div className="my-auto mt-4 h-full rounded-md border border-violet-200/20 p-4">
      <div className="mb-4 mr-2 text-sm text-gray-400">
        No Agent Registered...
      </div>
      <div className="flex flex-row items-center">
        <div className="mr-2 text-sm text-gray-400">{"sirius>"}</div>
        <input
          type="text"
          className="w-full border-none bg-transparent focus:outline-none"
        />
      </div>
    </div>
  );
};

interface UserViewProps {
  userHeaders: string[];
  userData: string[][];
}

const UserView = ({ userHeaders, userData }: UserViewProps) => {
  return (
    <div>
      <DataBoxTable title="Users" headers={userHeaders} data={userData} />
    </div>
  );
};

interface HostDetailsProps {
  host: SiriusHost;
  vulnStats: HostStatistics;
}

const HostDetails = ({ host, vulnStats }: HostDetailsProps) => {
  const serviceHeaders = ["Name", "Port", "Fingerprint"];
  const serviceDataArray =
    host.ports?.map((port) => [
      port.protocol,
      port.number?.toString(),
      port.state,
    ]) ?? [];

  // A small helper function for rendering tables.
  const renderTable = (headers: string[], data: string[][]) => (
    <tbody>
      {data.map((row, index) => (
        <tr
          key={index}
          className="h-14 border-b border-gray-300 dark:border-gray-600"
        >
          {headers.map((header, i) => (
            <td
              key={i}
              className="pr-4 text-sm text-gray-600 dark:text-gray-400"
            >
              {row[i]}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  const systemInfoHeaders = ["Property", "Value"];
  const systemInfoData = [
    ["Hostname", host.hostname],
    ["Addresses", host.ip],
    ["Operating System", host.os.charAt(0).toUpperCase() + host.os.slice(1)],
    ["OS Version", host.osversion],
    [
      "Asset Type",
      host.asset_type?.charAt(0).toUpperCase() + host.asset_type?.slice(1),
    ],
  ];

  const securityDetailsHeaders = ["Property", "Value"];
  const securityDetailsData = [
    ["Composite Risk", vulnStats.totalRiskScore],
    ["Last Scan Date", "10/5/2024 1:45:30 PM"],
    ["Next Scan", "Not Set"],
    ["Asset Class", "Business Critical"],
  ];

  const agentStatusHeaders = ["Property", "Value"];
  const agentStatusData = [
    ["Agent Status", "Not Installed"],
    ["Agent Version", "N/A"],
    ["Agent Last Seen", "N/A"],
    ["Agent Last Updated", "N/A"],
  ];

  return (
    <div>
      <div className="bg-paper mt-4 flex flex-col gap-4 rounded-md border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
        <h2 className="text-2xl font-extralight">Host Details</h2>
        <div className="flex items-start gap-4">
          <div className="flex">
            <table className="rounded-md bg-gray-800/20">
              System Information
              {renderTable(systemInfoHeaders, systemInfoData)}
            </table>
          </div>
          <div className="flex items-start">
            <table className="rounded-md bg-gray-800/20">
              Security Details
              {renderTable(securityDetailsHeaders, securityDetailsData)}
            </table>
          </div>
          <div className="flex items-start">
            <table className="rounded-md bg-gray-800/20">
              Agent Status
              {renderTable(agentStatusHeaders, agentStatusData)}
            </table>
          </div>
        </div>
        <DataBoxTable
          title="Network Services"
          variant="ghost"
          headers={serviceHeaders}
          data={serviceDataArray}
        />
        <h2 className="mt-4 text-2xl font-extralight">Analyst Notes</h2>
        <textarea
          className="h-32 w-full rounded-md bg-gray-800/20 p-4 dark:bg-violet-300/5"
          placeholder="Add your notes here..."
        />
      </div>
    </div>
  );
};

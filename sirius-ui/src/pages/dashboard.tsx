import React, { useEffect, useState } from "react";
import DashNumberCard from "~/components/DashNumberCard";
import Layout from "~/components/Layout";
import VulnerabilitiesOverTimeChart from "~/components/VulnerabilitiesOverTimeChart";
import DashboardIcon from "~/components/icons/DashboardIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import HostsIcon from "~/components/icons/HostsIcon";
import AgentIcon from "~/components/icons/AgentIcon";
import { api } from "~/utils/api";
import { VulnerabilitySeverityCardsVertical } from "~/components/VulnerabilitySeverityCards";
import { ScanBar } from "~/components/ScanBar";
import DataTable, {
  type ColumnDefinition,
} from "~/components/VulnerabilityTableBasic";
import {
  type ScanResult,
  type Vulnerability as ScanVulnerability,
  type VulnerabilitySummary,
  ScanStatus,
  type VulnerabilitySeverityCardsProps,
} from "~/components/scanner/ScanStatus";
import { SeverityBadge } from "~/components/SeverityBadge";
import { render } from "react-dom";
import { ThreatBar } from "~/components/vulnerabilityReport/ThreatBar";
import { NextPage } from "next";

function b64Decode(base64String: string) {
  if (!base64String) {
    return null;
  }
  try {
    const decodedString = atob(base64String);
    return JSON.parse(decodedString) as ScanResult;
  } catch (error) {
    console.error("Failed to decode Base64 JSON:", error);
    return null;
  }
}

const mockVulnerabilityData = [
  {
    id: 1,
    name: "Cross-Site Scripting",
    severity: "High",
    dateFound: "2023-07-28",
  },
  {
    id: 2,
    name: "SQL Injection",
    severity: "Critical",
    dateFound: "2023-07-20",
  },
  {
    id: 3,
    name: "Insecure Deserialization",
    severity: "Medium",
    dateFound: "2023-07-15",
  },
  {
    id: 4,
    name: "Broken Authentication",
    severity: "High",
    dateFound: "2023-07-10",
  },
];

const Dashboard: NextPage = () => {
  const { data: hosts } = api.host.getAllHosts.useQuery();
  const { data: latestScan } = api.store.getValue.useQuery({
    key: "currentScan",
  });
  const scanResults = b64Decode(latestScan ?? "")!;

  const { data: vuln } = api.vulnerability.getAllVulnerabilities.useQuery();
  const severityCount = {
    critical: vuln?.filter((v) => v.severity === "critical").length ?? 0,
    high: vuln?.filter((v) => v.severity === "high").length ?? 0,
    medium: vuln?.filter((v) => v.severity === "medium").length ?? 0,
    low: vuln?.filter((v) => v.severity === "low").length ?? 0,
    informational:
      vuln?.filter((v) => v.severity === "informational").length ?? 0,
  };

  const assetSummary = [
    {
      title: "Hosts",
      number: scanResults?.hosts.length,
      color: "blue",
      icon: (
        <HostsIcon className="h-4 w-4 fill-gray-700 text-white" fill="white" />
      ),
    },
    {
      title: "Vulnerabilities",
      number: scanResults?.vulnerabilities.length,
      color: "red",
      icon: (
        <VulnerabilityIcon
          className="h-4 w-4 fill-gray-700 text-white"
          fill="red"
        />
      ),
    },
    {
      title: "Agents",
      number: 0,
      color: "#1ff498",
      icon: <AgentIcon className="h-4 w-4 text-white" fill="none" />,
    },
  ];

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  return (
    <Layout title="Dashboard">
      <div className="relative z-20 mb-5 h-56">
        <DashboardHeader scanResults={scanResults} />
        <div className="ml-4 mt-6 flex gap-8">
          {assetSummary.map((item) => (
            <DashNumberCard
              key={item.title}
              title={item.title}
              number={item.number}
              color={item.color}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
      {/* <div className="flex flex-row">
        <VulnerabilitiesOverTimeChart />
      </div> */}

      <div className="mb-8 mt-[-30px] flex flex-row">
        <VulnerabilitySeverityCardsVertical
          counts={{
            critical: severityCount.critical,
            high: severityCount.high,
            medium: severityCount.medium,
            low: severityCount.low,
            informational: severityCount.informational,
          }}
        />

        <HostVulnOverview scanResults={scanResults} />
      </div>
      {/* <div className="mb-8 ml-4 border-b border-violet-100/20 pb-2">
        <span className="text-2xl font-extralight">Environment Overview</span>
      </div> */}
      {/* <EnvironmentOverview /> */}
    </Layout>
  );
};

export default Dashboard;

interface HostVulnOverviewProps {
  scanResults: ScanResult;
}

interface Vulnerability {
  name: string;
  severity: string;
  dateFound: string;
}

const HostVulnOverview: React.FC<HostVulnOverviewProps> = ({ scanResults }) => {
  const vulnerabilityColumns: ColumnDefinition<Vulnerability>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Severity",
      render: (vuln) => <SeverityBadge severity={vuln.severity} />,
    },
    {
      header: "Date Found",
      accessor: "dateFound",
    },
  ];

  const vulnerabilities: Vulnerability[] =
    scanResults?.vulnerabilities
      ?.slice(0, 5)
      .map((vulnerability: ScanVulnerability) => ({
        name: vulnerability.title,
        severity: vulnerability.severity,
        dateFound: scanResults.status,
      })) ?? [];

  return (
    <>
      <DataTable
        title="Latest Vulnerabilities"
        data={vulnerabilities}
        columns={vulnerabilityColumns}
      />
    </>
  );
};

const DashboardHeader = ({ scanResults }: { scanResults: ScanResult }) => {
  return (
    <div className="z-10 flex flex-row items-center">
      <DashboardIcon className="ml-4 mt-7 flex dark:fill-white" />
      <h1 className="ml-3 mt-5 flex text-4xl font-extralight ">Dashboard</h1>
      <div className="ml-12 mt-3 min-w-[300px]">
        <ScanBar
          isScanning={scanResults?.status === "running"}
          hasRun={scanResults?.status === "completed"}
        />
      </div>
    </div>
  );
};

const EnvironmentOverview = () => {
  return (
    <div className="ml-4 flex flex-row gap-4">
      <div className="flex flex-col">
        <div>Ports & Services</div>
      </div>
      <div className="flex flex-col">
        <div>Operating System Distribution</div>
      </div>
      <div className="flex flex-col">
        <div>Scan Details</div>
      </div>
    </div>
  );
};

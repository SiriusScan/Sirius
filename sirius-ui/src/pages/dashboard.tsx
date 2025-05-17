import React, { useState, useMemo } from "react";
import { NextPage } from "next";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import DashNumberCard from "~/components/DashNumberCard";
import VulnerabilitiesOverTimeChart from "~/components/VulnerabilitiesOverTimeChart";
import DashboardIcon from "~/components/icons/DashboardIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import HostsIcon from "~/components/icons/HostsIcon";
import AgentIcon from "~/components/icons/AgentIcon";
import { VulnerabilitySeverityCardsVertical } from "~/components/VulnerabilitySeverityCards";
import { ScanBar } from "~/components/ScanBar";
import DataTable, {
  type ColumnDefinition,
} from "~/components/VulnerabilityTableBasic";
import { SeverityBadge } from "~/components/SeverityBadge";
import { DashboardThreatBar } from "~/components/vulnerabilityReport/ThreatBar";
import {
  type ScanResult,
  type Vulnerability as ScanVulnerability,
  type VulnerabilitySummary,
  ScanStatus,
} from "~/components/scanner/ScanStatus";
import { SiriusHost } from "~/server/api/routers/host";

// Helper function for base64 decoding (preserved from original)
function b64Decode(base64String: string) {
  if (typeof window === "undefined") {
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

// Dashboard component
const Dashboard: NextPage = () => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">(
    "week"
  );

  // Fetch data using existing API endpoints
  const { data: hosts } = api.host.getAllHosts.useQuery();
  const { data: latestScan } = api.store.getValue.useQuery({
    key: "currentScan",
  });
  const { data: vuln } = api.vulnerability.getAllVulnerabilities.useQuery();

  // Parse scan results
  const scanResults = b64Decode(latestScan ?? "");

  // Calculate vulnerability statistics
  const severityCount = {
    critical:
      scanResults?.vulnerabilities?.filter(
        (v: VulnerabilitySummary) => v.severity === "critical"
      ).length ?? 0,
    high:
      scanResults?.vulnerabilities?.filter(
        (v: VulnerabilitySummary) => v.severity === "high"
      ).length ?? 0,
    medium:
      scanResults?.vulnerabilities?.filter(
        (v: VulnerabilitySummary) => v.severity === "medium"
      ).length ?? 0,
    low:
      scanResults?.vulnerabilities?.filter(
        (v: VulnerabilitySummary) => v.severity === "low"
      ).length ?? 0,
    informational:
      scanResults?.vulnerabilities?.filter(
        (v: VulnerabilitySummary) => v.severity === "informational"
      ).length ?? 0,
  };

  // Calculate total vulnerability count
  const totalVulnerabilityCount =
    severityCount.critical +
    severityCount.high +
    severityCount.medium +
    severityCount.low +
    severityCount.informational;

  // Calculate security health score (0-100)
  const securityHealthScore = useMemo(() => {
    if (totalVulnerabilityCount === 0) return 100;

    // Calculate weighted score (lower is better)
    const weightedScore =
      severityCount.critical * 10 +
      severityCount.high * 5 +
      severityCount.medium * 2 +
      severityCount.low * 0.5;

    // Normalize to 0-100 scale (100 is best)
    const normalizedScore = Math.max(
      0,
      100 - (weightedScore / totalVulnerabilityCount) * 20
    );

    return Math.round(normalizedScore);
  }, [severityCount, totalVulnerabilityCount]);

  // Find most vulnerable hosts
  const topVulnerableHosts = useMemo(() => {
    if (!scanResults?.hosts) return [];

    return [...scanResults.hosts]
      .sort(
        (a, b) =>
          (b.vulnerabilities?.length || 0) - (a.vulnerabilities?.length || 0)
      )
      .slice(0, 5)
      .map((host) => ({
        hostname: host.hostname || host.ip,
        ip: host.ip,
        os: host.os,
        vulnerabilityCount: host.vulnerabilities?.length || 0,
        criticalCount:
          host.vulnerabilities?.filter(
            (v: ScanVulnerability) => v.severity === "critical"
          ).length || 0,
      }));
  }, [scanResults]);

  // Get critical vulnerabilities
  const criticalVulnerabilities = useMemo(() => {
    if (!scanResults?.vulnerabilities) return [];

    return scanResults.vulnerabilities
      .filter((v: VulnerabilitySummary) => v.severity === "critical")
      .slice(0, 5);
  }, [scanResults]);

  // Asset summary for dashboard cards
  const assetSummary = [
    {
      title: "Security Health",
      number: securityHealthScore,
      suffix: "/100",
      color:
        securityHealthScore > 70
          ? "green"
          : securityHealthScore > 50
          ? "yellow"
          : "red",
      icon: (
        <HostsIcon className="h-4 w-4 fill-gray-700 text-white" fill="white" />
      ),
    },
    {
      title: "Hosts",
      number: scanResults?.hosts.length || 0,
      color: "blue",
      icon: (
        <HostsIcon className="h-4 w-4 fill-gray-700 text-white" fill="white" />
      ),
    },
    {
      title: "Vulnerabilities",
      number: totalVulnerabilityCount,
      color: "red",
      icon: (
        <VulnerabilityIcon
          className="h-4 w-4 fill-gray-700 text-white"
          fill="red"
        />
      ),
    },
    {
      title: "Critical Issues",
      number: severityCount.critical,
      color: "purple",
      icon: (
        <VulnerabilityIcon
          className="h-4 w-4 fill-gray-700 text-white"
          fill="purple"
        />
      ),
    },
  ];

  // Vulnerability table columns
  const vulnerabilityColumns: ColumnDefinition<ScanVulnerability>[] = [
    {
      header: "Description",
      accessor: "description",
    },
    {
      header: "Severity",
      render: (vuln) => <SeverityBadge severity={vuln.severity} />,
    },
    {
      header: "Risk Score",
      render: (vuln) => <span>{vuln.riskScore?.toFixed(1) || "N/A"}</span>,
    },
  ];

  return (
    <Layout title="Security Dashboard">
      <div className="relative z-20 mb-5">
        {/* Dashboard Header */}
        <div className="z-10 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <DashboardIcon className="ml-4 mt-7 flex dark:fill-white" />
            <h1 className="ml-3 mt-5 flex text-4xl font-extralight">
              Security Dashboard
            </h1>
            <div className="ml-12 w-80">
              <ScanBar
                isScanning={scanResults?.status === "running"}
                hasRun={scanResults?.status === "completed"}
              />
            </div>
          </div>
        </div>

        {/* Security Metrics Cards */}
        <div className="mt-6 flex gap-8">
          {assetSummary.map((item) => (
            <DashNumberCard
              key={item.title}
              title={item.title}
              number={item.number}
              suffix={item.suffix}
              color={item.color}
              icon={item.icon}
            />
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="mt-8 flex">
          {/* Vulnerability Severity Distribution - Thin Column */}
          <div className="w-[150px] flex-shrink-0">
            <h2 className="mb-4 text-xl font-light">Severity</h2>
            <VulnerabilitySeverityCardsVertical
              counts={{
                critical: severityCount.critical,
                high: severityCount.high,
                medium: severityCount.medium,
                low: severityCount.low,
                informational: severityCount.informational,
              }}
            />
          </div>

          {/* Critical Vulnerabilities - Right Side */}
          <div className="ml-8 flex-grow">
            <h2 className="mb-4 text-xl font-light">
              Critical Vulnerabilities
            </h2>
            {criticalVulnerabilities.length > 0 ? (
              <DataTable
                title="Highest Risk Issues"
                data={criticalVulnerabilities as ScanVulnerability[]}
                columns={vulnerabilityColumns}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
                <div className="text-green-500">
                  <VulnerabilityIcon
                    className="mx-auto h-12 w-12"
                    fill="#10b981"
                  />
                </div>
                <h3 className="mt-2 text-lg font-medium">
                  No Critical Vulnerabilities!
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Your environment has no critical vulnerabilities
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Vulnerable Hosts */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-light">Most Vulnerable Hosts</h2>
          {topVulnerableHosts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {topVulnerableHosts.map((host, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{host.hostname}</h4>
                    {host.criticalCount > 0 && (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
                        {host.criticalCount} Critical
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{host.ip}</span>
                    <span>{host.vulnerabilityCount} issues</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{host.os}</div>
                  <DashboardThreatBar
                    count={host.vulnerabilityCount}
                    critical={host.criticalCount}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
              <div className="text-green-500">
                <HostsIcon className="mx-auto h-12 w-12" fill="#10b981" />
              </div>
              <h3 className="mt-2 text-lg font-medium">No Vulnerable Hosts!</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                No hosts with vulnerabilities detected
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="ml-4 mt-8">
          <h2 className="mb-4 text-xl font-light">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <ActionCard
              title="Run Full Scan"
              description="Perform a comprehensive scan of your environment"
              icon={<HostsIcon className="h-5 w-5" fill="#6366f1" />}
              buttonText="Start Scan"
              buttonAction={() => console.log("Run full scan")}
            />

            <ActionCard
              title="Review Critical Findings"
              description="Analyze and triage all critical vulnerabilities"
              icon={<VulnerabilityIcon className="h-5 w-5" fill="#ef4444" />}
              buttonText="View Report"
              buttonAction={() => console.log("View critical findings")}
              isDestructive={severityCount.critical > 0}
            />

            <ActionCard
              title="Security Recommendations"
              description="Get personalized security improvement suggestions"
              icon={<AgentIcon className="h-5 w-5" />}
              buttonText="Get Recommendations"
              buttonAction={() => console.log("Get recommendations")}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Helper component for action cards
interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonAction: () => void;
  isDestructive?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonAction,
  isDestructive = false,
}) => {
  return (
    <div
      className={`rounded-lg border p-4 ${
        isDestructive
          ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50"
          : ""
      }`}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`rounded-full p-2 ${
            isDestructive
              ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
              : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={buttonAction}
          className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white ${
            isDestructive
              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
              : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

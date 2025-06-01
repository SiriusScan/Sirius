import { type NextPage } from "next";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import DashNumberCard from "~/components/DashNumberCard";
import { VulnerabilitySeverityCardsVertical } from "~/components/VulnerabilitySeverityCards";
import DataTable from "~/components/VulnerabilityTableBasic";
import { SeverityBadge } from "~/components/SeverityBadge";
import { ScanBar } from "~/components/ScanBar";
import { useMemo } from "react";
import type {
  ScanVulnerability,
  VulnerabilitySummary,
  ColumnDefinition,
} from "~/types/scanner";

// Icons
import DashboardIcon from "~/components/icons/DashboardIcon";
import HostsIcon from "~/components/icons/HostsIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import ScanIcon from "~/components/icons/ScanIcon";
import SettingsIcon from "~/components/icons/SettingsIcon";
import { Button } from "~/components/lib/ui/button";
import { useRouter } from "next/router";

// Base64 decode function
function b64Decode(base64String: string) {
  try {
    if (!base64String) return null;
    const jsonString = atob(base64String);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error decoding base64 scan results:", error);
    return null;
  }
}

const Dashboard: NextPage = () => {
  const router = useRouter();

  // Get latest scan results
  const { data: latestScan } = api.scanner.getLatestScan.useQuery();

  // Get vulnerability data from API
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
                data={criticalVulnerabilities}
                columns={vulnerabilityColumns}
                className="max-h-96"
              />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800">
                <VulnerabilityIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  No Critical Vulnerabilities
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Great! No critical vulnerabilities were found in your latest
                  scan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-light">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <ActionCard
              title="Start New Scan"
              description="Initiate a comprehensive security scan of your network"
              icon={<ScanIcon className="h-6 w-6" />}
              buttonText="Start Scan"
              buttonAction={() => router.push("/scanner")}
            />
            <ActionCard
              title="View All Hosts"
              description="Browse and manage all discovered hosts in your network"
              icon={<HostsIcon className="h-6 w-6" />}
              buttonText="View Hosts"
              buttonAction={() => router.push("/host")}
            />
            <ActionCard
              title="Vulnerability Reports"
              description="Generate detailed vulnerability assessment reports"
              icon={<VulnerabilityIcon className="h-6 w-6" />}
              buttonText="View Reports"
              buttonAction={() => router.push("/vulnerability")}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

// Action Card Component
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center">
        <div className="mr-3 rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="mb-4 text-gray-600 dark:text-gray-400">{description}</p>
      <Button
        onClick={buttonAction}
        variant={isDestructive ? "destructive" : "default"}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
};

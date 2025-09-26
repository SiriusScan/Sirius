import { type NextPage } from "next";
import { api } from "~/utils/api";
import Layout from "~/components/Layout";
import DashNumberCard from "~/components/DashNumberCard";
import { VulnerabilitySeverityCardsVertical } from "~/components/VulnerabilitySeverityCards";
import { useMemo } from "react";

// Icons
import DashboardIcon from "~/components/icons/DashboardIcon";
import HostsIcon from "~/components/icons/HostsIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import { Button } from "~/components/lib/ui/button";
import { useRouter } from "next/router";

// Helper function to determine severity from risk score
const determineSeverity = (
  riskScore: number
): "critical" | "high" | "medium" | "low" | "informational" => {
  if (riskScore >= 9.0) return "critical";
  if (riskScore >= 7.0) return "high";
  if (riskScore >= 4.0) return "medium";
  if (riskScore > 0) return "low";
  return "informational";
};

const Dashboard: NextPage = () => {
  const router = useRouter();

  // Get vulnerability data from API
  const { data: vulnerabilityData, isLoading: vulnerabilityLoading } =
    api.vulnerability.getAllVulnerabilities.useQuery();

  // Get agent data from API
  const { data: agentData, isLoading: agentLoading } =
    api.agent.listAgentsWithHosts.useQuery();

  // Get host data from API
  const { data: hostData, isLoading: hostLoading } =
    api.host.getAllHosts.useQuery();

  // Calculate vulnerability statistics
  const vulnerabilityStats = useMemo(() => {
    if (!vulnerabilityData?.vulnerabilities) {
      return {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        informational: 0,
      };
    }

    const vulns = vulnerabilityData.vulnerabilities;
    const stats = {
      total: vulns.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    vulns.forEach((vuln) => {
      const severity = determineSeverity(vuln.riskScore);
      stats[severity]++;
    });

    return stats;
  }, [vulnerabilityData]);

  // Calculate agent statistics
  const agentStats = useMemo(() => {
    if (!agentData) {
      return {
        total: 0,
        online: 0,
      };
    }

    return {
      total: agentData.length,
      online: agentData.filter(
        (agent) => agent.status?.toLowerCase() === "online"
      ).length,
    };
  }, [agentData]);

  // Dashboard metrics for top-level cards
  const dashboardMetrics = [
    {
      title: "Agents",
      number: agentStats.total,
      color: "green",
      icon: (
        <HostsIcon className="h-4 w-4 fill-gray-700 text-white" fill="white" />
      ),
    },
    {
      title: "Hosts",
      number: hostData?.length || 0,
      color: "blue",
      icon: (
        <HostsIcon className="h-4 w-4 fill-gray-700 text-white" fill="white" />
      ),
    },
    {
      title: "Vulnerabilities",
      number: vulnerabilityStats.total,
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
      number: vulnerabilityStats.critical,
      color: "purple",
      icon: (
        <VulnerabilityIcon
          className="h-4 w-4 fill-gray-700 text-white"
          fill="purple"
        />
      ),
    },
  ];

  const isLoading = vulnerabilityLoading || agentLoading || hostLoading;

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
          </div>
        </div>

        {/* Top-Level Vulnerability Distribution Cards */}
        <div className="mt-6 flex gap-8">
          {dashboardMetrics.map((metric) => (
            <DashNumberCard
              key={metric.title}
              title={metric.title}
              number={isLoading ? 0 : metric.number}
              color={metric.color}
              icon={metric.icon}
            />
          ))}
        </div>

        {/* Main Dashboard Content */}
        <div className="mt-8">
          {/* Vulnerability Overview Section */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-light">Vulnerability Overview</h2>

            {isLoading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                    <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
                      Loading Dashboard Data
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Fetching vulnerability and agent information...
                    </p>
                  </div>
                </div>
              </div>
            ) : vulnerabilityStats.total === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex h-[400px] items-center justify-center">
                  <div className="text-center">
                    <VulnerabilityIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                    <h3 className="mb-2 text-xl font-medium text-gray-900 dark:text-white">
                      No Vulnerabilities Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Run a security scan to discover vulnerabilities in your
                      environment.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {/* Vulnerability Statistics */}
                  <div className="lg:col-span-2">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                      Vulnerability Summary
                    </h3>
                    <div className="space-y-4">
                      {/* Critical Vulnerabilities */}
                      <div className="flex items-center justify-between rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex items-center">
                          <div className="mr-3 h-3 w-3 rounded-full bg-red-500"></div>
                          <span className="font-medium text-red-700 dark:text-red-300">
                            Critical
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-red-700 dark:text-red-300">
                          {vulnerabilityStats.critical}
                        </span>
                      </div>

                      {/* High Vulnerabilities */}
                      <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4 dark:bg-orange-900/20">
                        <div className="flex items-center">
                          <div className="mr-3 h-3 w-3 rounded-full bg-orange-500"></div>
                          <span className="font-medium text-orange-700 dark:text-orange-300">
                            High
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          {vulnerabilityStats.high}
                        </span>
                      </div>

                      {/* Medium Vulnerabilities */}
                      <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                        <div className="flex items-center">
                          <div className="mr-3 h-3 w-3 rounded-full bg-yellow-500"></div>
                          <span className="font-medium text-yellow-700 dark:text-yellow-300">
                            Medium
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                          {vulnerabilityStats.medium}
                        </span>
                      </div>

                      {/* Low Vulnerabilities */}
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                        <div className="flex items-center">
                          <div className="mr-3 h-3 w-3 rounded-full bg-green-500"></div>
                          <span className="font-medium text-green-700 dark:text-green-300">
                            Low
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-green-700 dark:text-green-300">
                          {vulnerabilityStats.low}
                        </span>
                      </div>

                      {/* Informational */}
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <div className="flex items-center">
                          <div className="mr-3 h-3 w-3 rounded-full bg-blue-500"></div>
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            Informational
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                          {vulnerabilityStats.informational}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agent Status */}
                  <div>
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
                      Agent Status
                    </h3>
                    <div className="space-y-4">
                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {agentStats.total}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total Agents
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {agentStats.online}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Online Agents
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                            {agentStats.total - agentStats.online}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Offline Agents
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-light">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ActionCard
                title="Start New Scan"
                description="Initiate a comprehensive security scan of your network"
                icon={<VulnerabilityIcon className="h-6 w-6" />}
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
                title="Manage Agents"
                description="View and control connected security agents"
                icon={<HostsIcon className="h-6 w-6" />}
                buttonText="View Agents"
                buttonAction={() => router.push("/terminal")}
              />
            </div>
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

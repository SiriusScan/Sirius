import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import Layout from "~/components/Layout";
import { Button } from "~/components/lib/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import {
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
} from "lucide-react";

// Icons
import DashboardIcon from "~/components/icons/DashboardIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import { Shield, Server, Activity } from "lucide-react";

// Dashboard components
import { DashboardCard } from "~/components/dashboard/DashboardCard";
import { DashboardHeroCard } from "~/components/dashboard/DashboardHeroCard";
import { CriticalAlertBanner } from "~/components/dashboard/CriticalAlertBanner";
import { DashboardSection } from "~/components/dashboard/DashboardGrid";
import {
  VulnerabilityTrendChart,
  VulnerabilityTrendChartSkeleton,
} from "~/components/dashboard/VulnerabilityTrendChart";
import {
  TopVulnerableHostsWidget,
  TopVulnerableHostsWidgetSkeleton,
} from "~/components/dashboard/TopVulnerableHostsWidget";
import {
  SecurityScoreGauge,
  SecurityScoreGaugeSkeleton,
} from "~/components/dashboard/SecurityScoreGauge";
import {
  SystemHealthMiniWidget,
  SystemHealthMiniWidgetSkeleton,
} from "~/components/dashboard/SystemHealthMiniWidget";
import {
  RecentActivityTimeline,
  RecentActivityTimelineSkeleton,
} from "~/components/dashboard/RecentActivityTimeline";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";

// Hook
import { useDashboardData } from "~/hooks/useDashboardData";

const Dashboard: NextPage = () => {
  const router = useRouter();
  const [refreshInterval, setRefreshInterval] = useState<string>("30");
  const [showSystemHealth, setShowSystemHealth] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showSystemHealth");
      return stored ? stored === "true" : false;
    }
    return false;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const { data, isLoading, error, lastUpdated, refresh } = useDashboardData({
    enableSystemMetrics: showSystemHealth,
    vulnerabilityRefetch: parseInt(refreshInterval) * 1000,
    hostRefetch: parseInt(refreshInterval) * 1000,
    agentRefetch: Math.min(parseInt(refreshInterval), 30) * 1000, // Agent status more frequent
  });

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Toggle system health visibility
  const toggleSystemHealth = useCallback(() => {
    const newValue = !showSystemHealth;
    setShowSystemHealth(newValue);
    if (typeof window !== "undefined") {
      localStorage.setItem("showSystemHealth", String(newValue));
    }
  }, [showSystemHealth]);

  return (
    <Layout title="Security Dashboard">
      <div className="relative z-20 space-y-8">
        {/* Glassmorphism Header */}
        <div className="sticky top-0 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 pb-4 pt-6 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 ring-2 ring-violet-500/20">
                <Shield className="h-7 w-7 text-violet-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Security Command Center
                </h1>
                <p className="text-sm text-violet-300/70">
                  Real-time security posture and vulnerability analytics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Last updated */}
              {lastUpdated && (
                <span className="text-xs text-gray-400">
                  Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}

              {/* Refresh interval selector */}
              <Select
                value={refreshInterval}
                onValueChange={setRefreshInterval}
              >
                <SelectTrigger className="w-32 border-violet-500/20 bg-gray-800/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Manual</SelectItem>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                </SelectContent>
              </Select>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-red-400">
              <Activity className="h-4 w-4" />
              <span>Error loading dashboard data: {error}</span>
            </div>
          </div>
        )}

        {/* Critical Alert Banner */}
        {data && data.vulnerabilities.critical > 0 && (
          <CriticalAlertBanner criticalCount={data.vulnerabilities.critical} />
        )}

        {/* Hero Metrics Row - Large, Dramatic Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <DashboardHeroCard
            title="Total Vulnerabilities"
            value={data?.vulnerabilities.total || 0}
            icon={Target}
            trend={
              data?.vulnerabilities.total
                ? { value: "+12 this week", direction: "up" }
                : undefined
            }
            cta={{ label: "View All", href: "/vulnerabilities" }}
            variant="default"
          />

          <DashboardHeroCard
            title="Critical Issues"
            value={data?.vulnerabilities.critical || 0}
            icon={AlertTriangle}
            subtitle={
              data?.vulnerabilities.critical
                ? "⚠️ Action Required"
                : "✓ No Critical Issues"
            }
            cta={
              data?.vulnerabilities.critical
                ? {
                    label: "Fix Now",
                    href: "/vulnerabilities?severity=CRITICAL",
                  }
                : undefined
            }
            variant={data?.vulnerabilities.critical ? "critical" : "success"}
          />

          <DashboardHeroCard
            title="Active Hosts"
            value={`${data?.hosts.online || 0} / ${data?.hosts.total || 0}`}
            icon={Server}
            subtitle={
              data?.hosts.total
                ? `${Math.round(
                    ((data?.hosts.online || 0) / data.hosts.total) * 100
                  )}% online`
                : "No hosts discovered"
            }
            cta={{ label: "View Hosts", href: "/host" }}
            variant="default"
          />
        </div>

        {/* Severity Breakdown - Prominent Section */}
        <div className="rounded-lg border border-violet-500/20 bg-gray-900/50 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-violet-300">
              Vulnerability Breakdown by Severity
            </h2>
          </div>
          {data ? (
            <VulnerabilitySeverityCardsHorizontal
              counts={data.vulnerabilities}
            />
          ) : (
            <div className="flex justify-center gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 w-32 animate-pulse rounded-lg bg-gray-800"
                />
              ))}
            </div>
          )}
        </div>

        {/* Main Visualizations - Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Vulnerability Trend Chart - Takes 2 columns */}
          <div className="lg:col-span-2">
            <DashboardCard
              title="Vulnerability Trends"
              icon={<Activity className="h-4 w-4 text-violet-400" />}
              loading={isLoading}
              className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm"
            >
              {data ? (
                <VulnerabilityTrendChart
                  currentCounts={data.vulnerabilities}
                  height={400}
                />
              ) : (
                <VulnerabilityTrendChartSkeleton height={400} />
              )}
            </DashboardCard>
          </div>

          {/* Right Column: Stacked Widgets */}
          <div className="space-y-6">
            {/* Top Vulnerable Hosts */}
            <DashboardCard
              title="Most Vulnerable Hosts"
              icon={<Server className="h-4 w-4 text-violet-400" />}
              loading={isLoading}
              className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm"
            >
              {!isLoading ? (
                <TopVulnerableHostsWidget height={180} limit={5} />
              ) : (
                <TopVulnerableHostsWidgetSkeleton height={180} />
              )}
            </DashboardCard>

            {/* Security Score Gauge */}
            <DashboardCard
              title="Security Posture Score"
              icon={<Shield className="h-4 w-4 text-violet-400" />}
              loading={isLoading}
              className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm"
            >
              {data ? (
                <SecurityScoreGauge
                  vulnerabilityCounts={data.vulnerabilities}
                  totalHosts={data.hosts.total}
                  vulnerableHosts={data.hosts.withVulnerabilities}
                  totalAgents={data.agents.total}
                  onlineAgents={data.agents.online}
                />
              ) : (
                <SecurityScoreGaugeSkeleton />
              )}
            </DashboardCard>
          </div>
        </div>

        {/* System Health Section (Toggle-able) */}
        <DashboardSection>
          <button
            onClick={toggleSystemHealth}
            className="flex w-full items-center justify-between rounded-lg border border-violet-500/20 bg-gray-900/50 p-4 text-sm font-medium backdrop-blur-sm transition-all hover:border-violet-500/40 hover:bg-gray-900/70"
          >
            <span className="flex items-center gap-2 text-violet-300">
              <Activity className="h-4 w-4" />
              System Health Monitoring
            </span>
            {showSystemHealth ? (
              <ChevronUp className="h-4 w-4 text-violet-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-violet-400" />
            )}
          </button>

          {showSystemHealth && (
            <div className="mt-4 duration-300 animate-in fade-in-50">
              {!isLoading ? (
                <SystemHealthMiniWidget />
              ) : (
                <SystemHealthMiniWidgetSkeleton />
              )}
            </div>
          )}
        </DashboardSection>

        {/* Bottom Section: Activity & Actions */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity Timeline - Takes 2 columns */}
          <div className="lg:col-span-2">
            <DashboardCard
              title="Recent Security Events"
              icon={<Activity className="h-4 w-4 text-violet-400" />}
              loading={isLoading}
              className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm"
            >
              {data ? (
                <RecentActivityTimeline
                  vulnerabilityCount={data.vulnerabilities.total}
                  hostCount={data.hosts.total}
                  agentCount={data.agents.total}
                  limit={10}
                />
              ) : (
                <RecentActivityTimelineSkeleton />
              )}
            </DashboardCard>
          </div>

          {/* Quick Actions */}
          <div>
            <DashboardCard
              title="Quick Actions"
              icon={<Activity className="h-4 w-4 text-violet-400" />}
              className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="space-y-3">
                <ActionButton
                  icon={
                    <VulnerabilityIcon
                      className="h-5 w-5"
                      fill="currentColor"
                    />
                  }
                  title="Start New Scan"
                  description="Initiate a security scan"
                  onClick={() => router.push("/scanner")}
                />
                <ActionButton
                  icon={<Server className="h-5 w-5" />}
                  title="View All Hosts"
                  description="Browse discovered hosts"
                  onClick={() => router.push("/host")}
                />
                <ActionButton
                  icon={
                    <VulnerabilityIcon
                      className="h-5 w-5"
                      fill="currentColor"
                    />
                  }
                  title="View Vulnerabilities"
                  description="Review all findings"
                  onClick={() => router.push("/vulnerabilities")}
                />
                <ActionButton
                  icon={<Activity className="h-5 w-5" />}
                  title="Manage Agents"
                  description="Control security agents"
                  onClick={() => router.push("/terminal")}
                />
              </div>
            </DashboardCard>
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Action Button Component
interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-lg border border-violet-500/20 bg-gray-800/50 p-3 text-left transition-all hover:border-violet-500/50 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/5"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 transition-all group-hover:bg-violet-500/20 group-hover:ring-violet-500/40">
        {icon}
      </div>
      <div className="flex-1">
        <div className="font-medium text-white group-hover:text-violet-300">
          {title}
        </div>
        <div className="text-xs text-gray-400">{description}</div>
      </div>
    </button>
  );
};

export default Dashboard;

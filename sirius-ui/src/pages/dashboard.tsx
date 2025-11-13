import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import Layout from "~/components/Layout";
import { ChevronDown, ChevronUp, Target, AlertTriangle } from "lucide-react";

// Icons
import DashboardIcon from "~/components/icons/DashboardIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import { Shield, Server, Activity } from "lucide-react";

// Dashboard components
import { DashboardCard } from "~/components/dashboard/DashboardCard";
import { DashboardHeroCard } from "~/components/dashboard/DashboardHeroCard";
import { CriticalAlertBanner } from "~/components/dashboard/CriticalAlertBanner";
import { DashboardSection } from "~/components/dashboard/DashboardGrid";
import { CreateSnapshotButton } from "~/components/dashboard/CreateSnapshotButton";
import {
  VulnerabilityTrendChart,
  VulnerabilityTrendChartSkeleton,
} from "~/components/dashboard/VulnerabilityTrendChart";
import {
  TopVulnerableHostsWidget,
  TopVulnerableHostsWidgetSkeleton,
} from "~/components/dashboard/TopVulnerableHostsWidget";
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
  const [showSystemHealth, setShowSystemHealth] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("showSystemHealth");
      return stored ? stored === "true" : false;
    }
    return false;
  });

  // Fetch dashboard data (no auto-refresh)
  const { data, isLoading, error } = useDashboardData({
    enableSystemMetrics: showSystemHealth,
    vulnerabilityRefetch: false,
    hostRefetch: false,
    agentRefetch: false,
  });

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
      <div className="relative z-20 -mt-20 space-y-8">
        {/* Compact Single-Line Header */}
        <div className="sticky top-2 z-30 -mx-4 flex border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
          <div className="flex items-center gap-3">
            {/* Left-aligned Title */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
              <Shield className="h-6 w-6 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Security Command Center
            </h1>
          </div>

          {/* Quick Stats Pills - Positioned Below */}
          <div className="ml-4 mt-1 flex items-center gap-3">
            {/* Total Vulnerabilities */}
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
              <Target className="h-4 w-4 text-violet-400" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-white">
                  {data?.vulnerabilities.total || 0}
                </span>
                <span className="text-xs text-violet-300/60">
                  vulnerabilities
                </span>
              </div>
            </div>

            {/* Critical Issues */}
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-red-400">
                  {data?.vulnerabilities.critical || 0}
                </span>
                <span className="text-xs text-violet-300/60">critical</span>
              </div>
            </div>

            {/* Active Hosts */}
            <div className="flex items-center gap-2 rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-1.5">
              <Server className="h-4 w-4 text-violet-400" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-semibold text-white">
                  {data?.hosts.online || 0}/{data?.hosts.total || 0}
                </span>
                <span className="text-xs text-violet-300/60">hosts</span>
              </div>
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

        {/* Main Visualizations - Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Stacked Components */}
          <div className="space-y-6 lg:col-span-2">
            {/* Severity Breakdown */}
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

            {/* Vulnerability Trend Chart */}
            <DashboardCard
              title="Vulnerability Trends"
              icon={<Activity className="h-4 w-4 text-violet-400" />}
              loading={isLoading}
              className="border-violet-500/20 bg-gray-900/50 backdrop-blur-sm"
              actions={<CreateSnapshotButton />}
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

          {/* Right Column: Most Vulnerable Hosts */}
          <div>
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

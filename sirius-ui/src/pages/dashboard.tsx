import { type NextPage } from "next";
import { Activity, Clock, RefreshCw, Shield } from "lucide-react";
import Layout from "~/components/Layout";
import { PageHeader, HeaderChip } from "~/components/shared/PageHeader";
import { SeverityStrip } from "~/components/shared/SeverityStrip";
import { EmptyState } from "~/components/shared/EmptyState";
import { useSummaryStats } from "~/hooks/useSummaryStats";
import { formatDateTime } from "~/utils/formatDateTime";
import { DashboardPanel, PanelLink } from "~/components/dashboard/DashboardPanel";
import { DashboardSkeleton } from "~/components/dashboard/DashboardSkeleton";
import { FirstRunCard } from "~/components/dashboard/FirstRunCard";
import { FixTheseFirstCard } from "~/components/dashboard/FixTheseFirstCard";
import { RecentActivityTimeline } from "~/components/dashboard/RecentActivityTimeline";
import { RiskiestHostsCard } from "~/components/dashboard/RiskiestHostsCard";
import { SinceLastScanCard } from "~/components/dashboard/SinceLastScanCard";
import { StartScanLink } from "~/components/dashboard/StartScanLink";
import { TrendCard } from "~/components/dashboard/TrendCard";
import {
  isFirstRun,
  lastScanEndedAt,
  severityHref,
} from "~/components/dashboard/dashboardModel";
import type { SummaryStats } from "~/types/riskSummary";

/**
 * Dashboard (R01, R02). Every count on this page comes from one place,
 * `useSummaryStats()` (ADR-2): the headline stats, the severity tiles, the
 * riskiest hosts and the findings to fix first. Security events and the
 * trend have their own sources (events API, saved snapshots).
 */
function DashboardContent({ summary }: { summary: SummaryStats }) {
  if (isFirstRun(summary)) return <FirstRunCard lastScan={summary.lastScan} />;

  return (
    <div className="space-y-4">
      <SinceLastScanCard summary={summary} />

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <DashboardPanel icon={Activity} title="Open findings by severity" className="lg:col-span-2">
          <SeverityStrip
            variant="tiles"
            counts={summary.findings.bySeverity}
            getHref={severityHref}
            aria-label="Open findings by severity"
            className="grid-cols-3 sm:grid-cols-5"
          />
          <p className="mt-2 text-xs text-gray-500">
            Select a level to open Vulnerabilities filtered to it.
          </p>
        </DashboardPanel>
        <RiskiestHostsCard hosts={summary.riskiestHosts} />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <FixTheseFirstCard findings={summary.topFindings} className="lg:col-span-2" />
        <DashboardPanel
          icon={Shield}
          title="Security events"
          footer={<PanelLink href="/system-monitor">System events live in System Monitor</PanelLink>}
        >
          <RecentActivityTimeline limit={5} />
        </DashboardPanel>
      </div>

      <TrendCard />
    </div>
  );
}

const Dashboard: NextPage = () => {
  const { data: summary, isLoading, error, refetch, isFetching } = useSummaryStats();
  const endedAt = lastScanEndedAt(summary?.lastScan);

  return (
    <Layout title="Security Dashboard">
      <div className="relative z-20 -mt-14 space-y-4">
        <PageHeader
          icon={Shield}
          title="Dashboard"
          meta={
            endedAt ? (
              <HeaderChip icon={Clock} title={`Last scan ${formatDateTime(endedAt, "long")}`}>
                Last scan {formatDateTime(endedAt)}
              </HeaderChip>
            ) : undefined
          }
          actions={<StartScanLink />}
        />

        {summary ? (
          <DashboardContent summary={summary} />
        ) : isLoading ? (
          <DashboardSkeleton />
        ) : (
          <EmptyState
            variant="error"
            title="Couldn't load the dashboard"
            reason={error?.message || "The summary didn't answer. The rest of Sirius still works."}
            primary={{
              label: isFetching ? "Retrying…" : "Retry",
              icon: RefreshCw,
              onClick: () => void refetch(),
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;

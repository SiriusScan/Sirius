import React, { useState } from "react";
import dynamic from "next/dynamic";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import { Button } from "~/components/lib/ui/button";
import { Shield, AlertTriangle, Activity, Database } from "lucide-react";

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false }
);

const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((m) => m.ResponsivePie),
  { ssr: false }
);

interface ChartSettings {
  chartType: "bar" | "pie";
  showValues: boolean;
}

interface Props {
  className?: string;
}

// Helper function to determine severity from risk score (matching backend logic)
const determineSeverity = (riskScore: number): string => {
  if (riskScore >= 9.0) return "critical";
  if (riskScore >= 7.0) return "high";
  if (riskScore >= 4.0) return "medium";
  if (riskScore > 0) return "low";
  return "informational";
};

const VulnerabilityDashboard: React.FC<Props> = ({ className }) => {
  const [settings, setSettings] = useState<ChartSettings>({
    chartType: "bar",
    showValues: true,
  });

  // Get real vulnerability data
  const { data: vulnerabilityData, isLoading } =
    api.vulnerability.getAllVulnerabilities.useQuery();

  // Process vulnerability data
  const processedData = React.useMemo(() => {
    if (!vulnerabilityData?.vulnerabilities) {
      return {
        severityData: [],
        riskData: [],
        summaryStats: {
          totalVulnerabilities: 0,
          totalHosts: 0,
          avgRiskScore: 0,
          highestRisk: 0,
        },
      };
    }

    const vulns = vulnerabilityData.vulnerabilities;

    // Count vulnerabilities by severity
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      informational: 0,
    };

    // Count by risk score ranges
    const riskRanges = {
      "9.0-10.0": 0,
      "7.0-8.9": 0,
      "4.0-6.9": 0,
      "1.0-3.9": 0,
      "0.0-0.9": 0,
    };

    vulns.forEach((vuln) => {
      const severity = determineSeverity(vuln.riskScore);
      severityCounts[severity as keyof typeof severityCounts]++;

      // Risk score distribution
      if (vuln.riskScore >= 9.0) riskRanges["9.0-10.0"]++;
      else if (vuln.riskScore >= 7.0) riskRanges["7.0-8.9"]++;
      else if (vuln.riskScore >= 4.0) riskRanges["4.0-6.9"]++;
      else if (vuln.riskScore >= 1.0) riskRanges["1.0-3.9"]++;
      else riskRanges["0.0-0.9"]++;
    });

    // Prepare data for charts
    const severityData = [
      {
        severity: "Critical",
        count: severityCounts.critical,
        color: "#dc2626",
      },
      { severity: "High", count: severityCounts.high, color: "#ea580c" },
      { severity: "Medium", count: severityCounts.medium, color: "#ca8a04" },
      { severity: "Low", count: severityCounts.low, color: "#16a34a" },
      {
        severity: "Info",
        count: severityCounts.informational,
        color: "#2563eb",
      },
    ].filter((item) => item.count > 0); // Only show severities that have vulnerabilities

    const riskData = Object.entries(riskRanges)
      .map(([range, count]) => ({ range, count }))
      .filter((item) => item.count > 0);

    // Summary statistics
    const totalVulns = vulns.length;
    const totalHosts = vulns.reduce((sum, vuln) => sum + vuln.hostCount, 0);
    const avgRisk =
      vulns.length > 0
        ? vulns.reduce((sum, vuln) => sum + vuln.riskScore, 0) / vulns.length
        : 0;
    const highestRisk =
      vulns.length > 0 ? Math.max(...vulns.map((v) => v.riskScore)) : 0;

    return {
      severityData,
      riskData,
      summaryStats: {
        totalVulnerabilities: totalVulns,
        totalHosts: totalHosts,
        avgRiskScore: avgRisk,
        highestRisk: highestRisk,
      },
    };
  }, [vulnerabilityData]);

  if (isLoading) {
    return (
      <div
        className={cn(
          "rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900",
          className
        )}
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Vulnerability Dashboard
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading vulnerability data...
          </p>
        </div>
        <div className="h-96 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  const { severityData, summaryStats } = processedData;

  return (
    <div
      className={cn(
        "rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-900",
        className
      )}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Vulnerability Dashboard
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Current vulnerability analysis across your infrastructure
        </p>
      </div>

      {/* Summary Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-100">
                Total Vulnerabilities
              </p>
              <p className="text-2xl font-bold">
                {summaryStats.totalVulnerabilities}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
          <div className="flex items-center">
            <Database className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-100">
                Affected Hosts
              </p>
              <p className="text-2xl font-bold">{summaryStats.totalHosts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
          <div className="flex items-center">
            <Activity className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-100">
                Avg Risk Score
              </p>
              <p className="text-2xl font-bold">
                {summaryStats.avgRiskScore.toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 p-4 text-white">
          <div className="flex items-center">
            <Shield className="h-8 w-8" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-100">
                Highest Risk
              </p>
              <p className="text-2xl font-bold">
                {summaryStats.highestRisk.toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          variant={settings.chartType === "bar" ? "default" : "outline"}
          size="sm"
          onClick={() => setSettings({ ...settings, chartType: "bar" })}
        >
          Bar Chart
        </Button>
        <Button
          variant={settings.chartType === "pie" ? "default" : "outline"}
          size="sm"
          onClick={() => setSettings({ ...settings, chartType: "pie" })}
        >
          Pie Chart
        </Button>
        <Button
          variant={settings.showValues ? "default" : "outline"}
          size="sm"
          onClick={() =>
            setSettings({ ...settings, showValues: !settings.showValues })
          }
        >
          {settings.showValues ? "Hide Values" : "Show Values"}
        </Button>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        {severityData.length > 0 ? (
          settings.chartType === "bar" ? (
            <ResponsiveBar
              data={severityData}
              keys={["count"]}
              indexBy="severity"
              margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors={({ data }) => data.color}
              borderColor={{
                from: "color",
                modifiers: [["darker", 1.6]],
              }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Severity Level",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Vulnerability Count",
                legendPosition: "middle",
                legendOffset: -40,
              }}
              enableLabel={settings.showValues}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{
                from: "color",
                modifiers: [["darker", 1.6]],
              }}
              legends={[]}
              role="application"
              ariaLabel="Vulnerability severity distribution bar chart"
              theme={{
                background: "transparent",
                text: {
                  fontSize: 11,
                  fill: "#374151",
                },
                axis: {
                  domain: {
                    line: {
                      stroke: "#e5e7eb",
                      strokeWidth: 1,
                    },
                  },
                  legend: {
                    text: {
                      fontSize: 12,
                      fill: "#374151",
                    },
                  },
                  ticks: {
                    line: {
                      stroke: "#e5e7eb",
                      strokeWidth: 1,
                    },
                    text: {
                      fontSize: 11,
                      fill: "#6b7280",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "#f3f4f6",
                    strokeWidth: 1,
                  },
                },
                tooltip: {
                  container: {
                    background: "#1f2937",
                    color: "#f9fafb",
                    fontSize: 12,
                    borderRadius: 4,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  },
                },
              }}
            />
          ) : (
            <ResponsivePie
              data={severityData.map((item) => ({
                id: item.severity,
                label: item.severity,
                value: item.count,
                color: item.color,
              }))}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={({ data }) => data.color}
              borderWidth={1}
              borderColor={{
                from: "color",
                modifiers: [["darker", 0.2]],
              }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{
                from: "color",
                modifiers: [["darker", 2]],
              }}
              enableArcLabels={settings.showValues}
              enableArcLinkLabels={true}
              theme={{
                background: "transparent",
                text: {
                  fontSize: 11,
                  fill: "#374151",
                },
                tooltip: {
                  container: {
                    background: "#1f2937",
                    color: "#f9fafb",
                    fontSize: 12,
                    borderRadius: 4,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  },
                },
              }}
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            No vulnerability data available
          </div>
        )}
      </div>
    </div>
  );
};

export default VulnerabilityDashboard;

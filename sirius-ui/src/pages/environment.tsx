import React, { useMemo, useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { columns } from "~/components/EnvironmentDataTableColumns";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";
import { api } from "~/utils/api";
import { type EnvironmentTableData } from "~/server/api/routers/host";
import { type HostVulnerabilityCounts } from "~/types/vulnerabilityTypes";
import { generateMockHostVulnerabilityMap } from "~/utils/generate-mock-data";
import { Tab } from "@headlessui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "~/components/lib/utils";

// For SEO
export const metadata = {
  title: "Environment | Sirius",
  description: "View and manage hosts in your environment",
};

const Environment = () => {
  const [activeView, setActiveView] = useState("table");
  const [networkSummary, setNetworkSummary] = useState({
    totalHosts: 0,
    activeHosts: 0,
    operatingSystems: {} as Record<string, number>,
    riskyHosts: 0,
  });

  // Fetch hosts data from API - using getEnvironmentSummary instead of getAllHosts
  const environmentQuery = api.host.getEnvironmentSummary.useQuery();

  // Fetch aggregated vulnerability data
  const vulnerabilityQuery = api.vulnerability.getAllVulnerabilities.useQuery();

  // Loading state
  const isLoading = environmentQuery.isLoading || vulnerabilityQuery.isLoading;

  // Process the vulnerability data from the vulnerability query
  const hostVulnMap = useMemo(() => {
    if (vulnerabilityQuery.data) {
      return vulnerabilityQuery.data.hostTotals || {};
    }
    return {};
  }, [vulnerabilityQuery.data]);

  // Process and enhance the host data with vulnerability information if needed
  const hosts = useMemo(() => {
    // No hosts data yet
    if (!environmentQuery.data || environmentQuery.data.length === 0) {
      return [];
    }

    // If we have vulnerability data from the query, we can enhance the environment data
    if (vulnerabilityQuery.data) {
      return environmentQuery.data.map((host) => ({
        ...host,
        // Update vulnerabilityCount with the actual count from our vulnerability query if available
        vulnerabilityCount:
          hostVulnMap[host.ip]?.total || host.vulnerabilityCount || 0,
      }));
    }

    // Otherwise just use the environment data as is
    return environmentQuery.data;
  }, [environmentQuery.data, vulnerabilityQuery.data, hostVulnMap]);

  // Calculate network summary statistics
  useEffect(() => {
    if (hosts && hosts.length > 0) {
      // Count operating systems
      const osCounts: Record<string, number> = {};
      hosts.forEach((host) => {
        const os = host.os || "Unknown";
        osCounts[os] = (osCounts[os] || 0) + 1;
      });

      // Count risky hosts (hosts with critical or high vulnerabilities)
      const riskyHosts = hosts.filter(
        (host) => host.vulnerabilityCount > 20
      ).length;

      setNetworkSummary({
        totalHosts: hosts.length,
        activeHosts: hosts.filter((host) => host.status !== "offline").length,
        operatingSystems: osCounts,
        riskyHosts,
      });
    }
  }, [hosts]);

  // Prepare data for charts
  const osChartData = useMemo(() => {
    return Object.entries(networkSummary.operatingSystems).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
  }, [networkSummary.operatingSystems]);

  // Error handling
  const error = environmentQuery.error || vulnerabilityQuery.error;
  const errorMessage = error ? error.message : null;

  return (
    <Layout>
      <div className="relative z-20">
        {/* Header */}
        <div className="z-10 mb-6 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <EnvironmentIcon
              width="35px"
              height="35px"
              className="ml-4 mt-1 flex dark:fill-white"
            />
            <h1 className="ml-3 text-3xl font-light tracking-tight text-gray-900 dark:text-gray-100">
              Environment
            </h1>
          </div>
          <div className="mr-4 flex items-center gap-2">
            <button className="rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
              Add Host
            </button>
            <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
              Schedule Scan
            </button>
          </div>
        </div>

        {/* Network Summary Cards */}
        {!isLoading && !error && hosts && hosts.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Hosts
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {networkSummary.totalHosts}
                </div>
                <div className="text-sm font-medium text-green-500">
                  {networkSummary.activeHosts} active
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                High Risk Hosts
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {networkSummary.riskyHosts}
                </div>
                <div className="text-sm font-medium text-red-500">
                  {networkSummary.riskyHosts > 0
                    ? "Action Required"
                    : "All Clear"}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Vulnerabilities
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {vulnerabilityQuery.data?.counts.total || 0}
                </div>
                <div className="flex gap-2">
                  <div className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/20 dark:text-red-300">
                    {vulnerabilityQuery.data?.counts.critical || 0} Critical
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Scan
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-gray-900 dark:text-white">
                  {/* Calculate most recent scan timestamp */}
                  {hosts.some((h) => h.lastScanDate)
                    ? new Date(
                        Math.max(
                          ...hosts
                            .filter((h) => h.lastScanDate)
                            .map((h) => new Date(h.lastScanDate || 0).getTime())
                        )
                      ).toLocaleDateString()
                    : "Never"}
                </div>
                <button className="text-sm font-medium text-violet-500 hover:text-violet-600">
                  Run New Scan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Toggle */}
        {!isLoading && !error && hosts && hosts.length > 0 && (
          <div className="mb-4 px-4">
            <div className="inline-flex rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  activeView === "table"
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveView("table")}
              >
                Table View
              </button>
              <button
                className={cn(
                  "px-4 py-2 text-sm font-medium",
                  activeView === "visual"
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
                onClick={() => setActiveView("visual")}
              >
                Visual View
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6 px-4">
          <p className="text-gray-600 dark:text-gray-300">
            Manage and monitor all hosts in your environment. View vulnerability
            statistics and risk assessments for each host.
          </p>
        </div>

        {/* Data Table or Visual View */}
        <div className="px-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-violet-500"></div>
              <span className="ml-2">
                Loading hosts and vulnerability data...
              </span>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400">
              <p>Error loading data: {errorMessage}</p>
            </div>
          ) : !hosts || hosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 p-8 text-center dark:border-gray-700">
              <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                <EnvironmentIcon
                  width="24px"
                  height="24px"
                  className="text-gray-500"
                />
              </div>
              <h3 className="mb-2 text-lg font-medium">No hosts found</h3>
              <p className="text-sm text-gray-500">
                Add hosts to your environment to start tracking vulnerabilities.
              </p>
              <button className="mt-4 rounded-md bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600">
                Add First Host
              </button>
            </div>
          ) : (
            <div>
              {activeView === "table" ? (
                <EnvironmentDataTable columns={columns} data={hosts} />
              ) : (
                <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                  <h3 className="mb-4 text-lg font-medium">OS Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={osChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Additional charts/visualizations would go here */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Environment;

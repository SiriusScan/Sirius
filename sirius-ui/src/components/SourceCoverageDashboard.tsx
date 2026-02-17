"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "~/components/lib/utils";
import { getSourceColor } from "~/components/shared/SourceBadge";
import {
  Activity,
  Shield,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Radar,
  RefreshCw,
} from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { type SourceCoverageStats } from "~/types/scanTypes";
import { timeAgo, getConfidenceColor } from "~/utils/formatters";

interface SourceCoverageDashboardProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

interface CoverageMetrics {
  totalHosts: number;
  totalVulnerabilities: number;
  totalPorts: number;
  sourceCount: number;
  averageConfidence: number;
  lastScanTime: Date | null;
  coverageGaps: string[];
  reliabilityScore: number;
}

export const SourceCoverageDashboard: React.FC<
  SourceCoverageDashboardProps
> = ({
  className,
  refreshInterval = 30000, // 30 seconds default
}) => {
  const [coverageStats, setCoverageStats] = useState<SourceCoverageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch coverage statistics
  const fetchCoverageStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/host/source-coverage");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCoverageStats(data.source_coverage_stats || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch coverage statistics"
      );
      console.error("Error fetching coverage stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and refresh interval
  useEffect(() => {
    fetchCoverageStats();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchCoverageStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Calculate overall metrics
  const metrics = useMemo((): CoverageMetrics => {
    if (!coverageStats.length) {
      return {
        totalHosts: 0,
        totalVulnerabilities: 0,
        totalPorts: 0,
        sourceCount: 0,
        averageConfidence: 0,
        lastScanTime: null,
        coverageGaps: [],
        reliabilityScore: 0,
      };
    }

    const totalHosts = Math.max(...coverageStats.map((s) => s.hosts_scanned));
    const totalVulnerabilities = coverageStats.reduce(
      (sum, s) => sum + s.vulnerabilities_found,
      0
    );
    const totalPorts = coverageStats.reduce(
      (sum, s) => sum + s.ports_discovered,
      0
    );
    const sourceCount = coverageStats.length;

    const averageConfidence =
      coverageStats.reduce((sum, s) => sum + s.average_confidence, 0) /
      sourceCount;

    const lastScanTime = coverageStats.reduce((latest, s) => {
      const scanTime = new Date(s.last_scan_time);
      return !latest || scanTime > latest ? scanTime : latest;
    }, null as Date | null);

    // Identify coverage gaps (sources with low host coverage)
    const coverageGaps = coverageStats
      .filter((s) => s.hosts_scanned < totalHosts * 0.8) // Less than 80% coverage
      .map((s) => s.source);

    // Calculate reliability score based on confidence and coverage
    const reliabilityScore =
      coverageStats.reduce((sum, s) => {
        const coverageRatio = s.hosts_scanned / totalHosts;
        const reliabilityFactor = s.average_confidence * coverageRatio;
        return sum + reliabilityFactor;
      }, 0) / sourceCount;

    return {
      totalHosts,
      totalVulnerabilities,
      totalPorts,
      sourceCount,
      averageConfidence,
      lastScanTime,
      coverageGaps,
      reliabilityScore,
    };
  }, [coverageStats]);

  // Use shared getSourceColor("solid") + " text-white" for dashboard elements
  const getDashboardSourceColor = (source: string) =>
    getSourceColor(source, "solid") + " text-white";

  if (loading && !coverageStats.length) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <RefreshCw className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
          <p className="text-sm text-gray-400">
            Loading coverage statistics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-500" />
          <p className="mb-2 text-sm text-red-400">{error}</p>
          <Button onClick={fetchCoverageStats} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-100">
            Source Coverage Dashboard
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Last updated: {timeAgo(lastRefresh)}
          </div>
          <Button
            onClick={fetchCoverageStats}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-700 bg-gray-800 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Total Sources
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {metrics.sourceCount}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Hosts Covered
              </p>
              <p className="text-2xl font-bold text-gray-100">
                {metrics.totalHosts}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Avg Confidence
              </p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  getConfidenceColor(metrics.averageConfidence)
                )}
              >
                {(metrics.averageConfidence * 100).toFixed(0)}%
              </p>
            </div>
            <Shield className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-700 bg-gray-800 bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">
                Reliability Score
              </p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  getConfidenceColor(metrics.reliabilityScore)
                )}
              >
                {(metrics.reliabilityScore * 100).toFixed(0)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Coverage Gaps Alert */}
      {metrics.coverageGaps.length > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 bg-yellow-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-400" />
            <div>
              <h4 className="text-sm font-medium text-yellow-200">
                Coverage Gaps Detected
              </h4>
              <p className="mt-1 text-sm text-yellow-300">
                The following sources have incomplete host coverage:{" "}
                {metrics.coverageGaps.join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Source Details */}
      <div className="rounded-lg border border-gray-700 bg-gray-800">
        <div className="border-b border-gray-700 border-gray-700">
          <h4 className="text-lg font-medium text-gray-100">
            Source Performance
          </h4>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {coverageStats.map((source) => (
              <div
                key={source.source}
                className="flex items-center justify-between rounded-lg bg-gray-800 bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "rounded-full px-3 py-1 text-sm font-medium",
                      getDashboardSourceColor(source.source)
                    )}
                  >
                    {source.source}
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-sm">
                    <div>
                      <span className="text-gray-400">
                        Hosts:
                      </span>
                      <span className="ml-1 font-medium text-gray-100">
                        {source.hosts_scanned}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        Vulns:
                      </span>
                      <span className="ml-1 font-medium text-gray-100">
                        {source.vulnerabilities_found}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">
                        Ports:
                      </span>
                      <span className="ml-1 font-medium text-gray-100">
                        {source.ports_discovered}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div
                      className={cn(
                        "text-sm font-medium",
                        getConfidenceColor(source.average_confidence)
                      )}
                    >
                      {(source.average_confidence * 100).toFixed(0)}% confidence
                    </div>
                    <div className="text-xs text-gray-400">
                      Last scan:{" "}
                      {timeAgo(new Date(source.last_scan_time))}
                    </div>
                  </div>
                  <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-600">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        source.average_confidence >= 0.9
                          ? "bg-green-500"
                          : source.average_confidence >= 0.7
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                      style={{ width: `${source.average_confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage Visualization */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Host Coverage Chart */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 bg-gray-800">
          <h4 className="mb-4 text-lg font-medium text-gray-100">
            Host Coverage
          </h4>
          <div className="space-y-3">
            {coverageStats.map((source) => {
              const coveragePercentage =
                (source.hosts_scanned / metrics.totalHosts) * 100;
              return (
                <div key={source.source} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {source.source}
                    </span>
                    <span className="text-gray-100">
                      {source.hosts_scanned}/{metrics.totalHosts} (
                      {coveragePercentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-700">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        getDashboardSourceColor(source.source).replace("text-white", "")
                      )}
                      style={{ width: `${Math.min(coveragePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vulnerability Discovery */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 bg-gray-800">
          <h4 className="mb-4 text-lg font-medium text-gray-100">
            Vulnerability Discovery
          </h4>
          <div className="space-y-3">
            {coverageStats
              .filter((s) => s.vulnerabilities_found > 0)
              .sort((a, b) => b.vulnerabilities_found - a.vulnerabilities_found)
              .map((source) => {
                const discoveryPercentage =
                  (source.vulnerabilities_found /
                    metrics.totalVulnerabilities) *
                  100;
                return (
                  <div key={source.source} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">
                        {source.source}
                      </span>
                      <span className="text-gray-100">
                        {source.vulnerabilities_found} (
                        {discoveryPercentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-700">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all",
                          getDashboardSourceColor(source.source).replace(
                            "text-white",
                            ""
                          )
                        )}
                        style={{
                          width: `${Math.min(discoveryPercentage, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="rounded-lg bg-gray-800 bg-gray-900/50">
        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
          <div>
            <div className="text-2xl font-bold text-gray-100">
              {metrics.totalVulnerabilities}
            </div>
            <div className="text-sm text-gray-400">
              Total Vulnerabilities
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-100">
              {metrics.totalPorts}
            </div>
            <div className="text-sm text-gray-400">
              Ports Discovered
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-100">
              {metrics.lastScanTime
                ? timeAgo(metrics.lastScanTime)
                : "Never"}
            </div>
            <div className="text-sm text-gray-400">
              Last Scan Activity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceCoverageDashboard;

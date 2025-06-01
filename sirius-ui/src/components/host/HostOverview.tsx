import React from "react";
import {
  type EnvironmentTableData,
  type Vulnerability,
} from "~/server/api/routers/host";
import { Shield, Server, Clock, AlertTriangle } from "lucide-react";

interface HostOverviewProps {
  host: EnvironmentTableData;
}

export const HostOverview: React.FC<HostOverviewProps> = ({ host }) => {
  const vulnerabilities = host.vulnerabilities || [];

  // Calculate vulnerability statistics
  const criticalCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "critical"
  ).length;
  const highCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "high"
  ).length;
  const mediumCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "medium"
  ).length;
  const lowCount = vulnerabilities.filter(
    (v) => v.severity?.toLowerCase() === "low"
  ).length;

  // Calculate risk score
  const riskScore = calculateRiskScore(vulnerabilities);
  const riskLevel = getRiskLevel(riskScore);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <Server className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Operating System
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {host.os || "Unknown"}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <Clock className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last Scan
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            Never
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Vulnerabilities
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {vulnerabilities.length}
          </div>
          <div className="text-sm text-gray-500">
            {criticalCount > 0 && (
              <span className="text-red-600">{criticalCount} critical</span>
            )}
            {criticalCount > 0 && highCount > 0 && ", "}
            {highCount > 0 && (
              <span className="text-orange-600">{highCount} high</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-gray-400" />
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Risk Score
            </div>
          </div>
          <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">
            {riskScore}
          </div>
          <div className="text-sm text-gray-500">{riskLevel}</div>
        </div>
      </div>

      {/* Vulnerability Distribution */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
          Vulnerability Distribution
        </h3>
        <div className="flex h-10 w-full overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
          {criticalCount > 0 && (
            <div
              className="bg-red-500 dark:bg-red-700"
              style={{
                width: `${(criticalCount / vulnerabilities.length) * 100}%`,
              }}
              title={`Critical: ${criticalCount}`}
            ></div>
          )}
          {highCount > 0 && (
            <div
              className="bg-orange-500 dark:bg-orange-700"
              style={{
                width: `${(highCount / vulnerabilities.length) * 100}%`,
              }}
              title={`High: ${highCount}`}
            ></div>
          )}
          {mediumCount > 0 && (
            <div
              className="bg-yellow-500 dark:bg-yellow-700"
              style={{
                width: `${(mediumCount / vulnerabilities.length) * 100}%`,
              }}
              title={`Medium: ${mediumCount}`}
            ></div>
          )}
          {lowCount > 0 && (
            <div
              className="bg-green-500 dark:bg-green-700"
              style={{
                width: `${(lowCount / vulnerabilities.length) * 100}%`,
              }}
              title={`Low: ${lowCount}`}
            ></div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
            <span className="text-sm">
              Critical: {criticalCount} (
              {vulnerabilities.length > 0
                ? Math.round((criticalCount / vulnerabilities.length) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">
              High: {highCount} (
              {vulnerabilities.length > 0
                ? Math.round((highCount / vulnerabilities.length) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">
              Medium: {mediumCount} (
              {vulnerabilities.length > 0
                ? Math.round((mediumCount / vulnerabilities.length) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
            <span className="text-sm">
              Low: {lowCount} (
              {vulnerabilities.length > 0
                ? Math.round((lowCount / vulnerabilities.length) * 100)
                : 0}
              %)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateRiskScore(vulnerabilities: Vulnerability[]): number {
  // Calculate risk score based on vulnerability severity
  const weights = { critical: 10, high: 5, medium: 2, low: 1 };
  const score = vulnerabilities.reduce((total, vuln) => {
    const severity = vuln.severity?.toLowerCase() as keyof typeof weights;
    return total + (weights[severity] || 0);
  }, 0);

  // Normalize to 0-100 scale
  return Math.min(Math.round(score * 2), 100);
}

function getRiskLevel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Minimal";
}

export default HostOverview;

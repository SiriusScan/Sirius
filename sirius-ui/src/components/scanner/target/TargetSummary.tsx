import React from "react";
import { type ParsedTarget, getTargetStats } from "~/utils/targetParser";
import { Badge } from "~/components/lib/ui/badge";
import {
  Server,
  Network,
  Globe,
  Activity,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react";

interface TargetSummaryProps {
  targets: ParsedTarget[];
}

const TargetSummary: React.FC<TargetSummaryProps> = ({ targets }) => {
  const stats = getTargetStats(targets);

  if (targets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Hosts - Prominent Display */}
        <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5 p-5 shadow-lg">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-violet-300">
            <Activity className="h-4 w-4" />
            Total Hosts
          </div>
          <div className="text-4xl font-bold text-white">
            {stats.totalHosts.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-400">Ready to scan</div>
        </div>

        {/* Status Overview */}
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-5 shadow-lg">
          <div className="mb-3 text-sm font-medium text-white">Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm text-gray-400">
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                Valid
              </div>
              <span className="text-lg font-semibold text-green-400">
                {stats.valid}
              </span>
            </div>
            {stats.invalid > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  Invalid
                </div>
                <span className="text-lg font-semibold text-red-400">
                  {stats.invalid}
                </span>
              </div>
            )}
            {stats.warnings > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm text-gray-400">
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />
                  Warnings
                </div>
                <span className="text-lg font-semibold text-yellow-400">
                  {stats.warnings}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Target Types */}
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-5 shadow-lg">
          <div className="mb-3 text-sm font-medium text-white">
            Target Types
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.byType.ip > 0 && (
              <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-300">
                <Server className="mr-1 h-3 w-3" />
                {stats.byType.ip} IP{stats.byType.ip !== 1 ? "s" : ""}
              </Badge>
            )}
            {stats.byType.cidr > 0 && (
              <Badge className="border-purple-500/30 bg-purple-500/10 text-purple-300">
                <Network className="mr-1 h-3 w-3" />
                {stats.byType.cidr} CIDR{stats.byType.cidr !== 1 ? "s" : ""}
              </Badge>
            )}
            {stats.byType.range > 0 && (
              <Badge className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
                <Network className="mr-1 h-3 w-3" />
                {stats.byType.range} Range{stats.byType.range !== 1 ? "s" : ""}
              </Badge>
            )}
            {stats.byType.domain > 0 && (
              <Badge className="border-pink-500/30 bg-pink-500/10 text-pink-300">
                <Globe className="mr-1 h-3 w-3" />
                {stats.byType.domain} Domain
                {stats.byType.domain !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Full-width Alerts */}
      <div className="space-y-3">
        {/* Warning Banner for Large Scans */}
        {stats.totalHosts > 1000 && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-orange-500/5 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-yellow-400" />
            <div className="flex-1">
              <div className="font-semibold text-yellow-300">
                Large Scan Warning
              </div>
              <div className="mt-1 text-sm text-yellow-400/80">
                This scan will target {stats.totalHosts.toLocaleString()} hosts
                and may take significant time to complete.
              </div>
            </div>
          </div>
        )}

        {/* Error Summary */}
        {stats.invalid > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-500/10 to-pink-500/5 p-4">
            <XCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
            <div className="flex-1">
              <div className="font-semibold text-red-300">Invalid Targets</div>
              <div className="mt-1 text-sm text-red-400/80">
                {stats.invalid} target{stats.invalid !== 1 ? "s" : ""} failed
                validation and will be skipped during the scan.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetSummary;

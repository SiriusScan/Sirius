import React from "react";
import { cn } from "~/components/lib/utils";
import { Users, CheckCircle } from "lucide-react";

interface StatusDashboardProps {
  agentCount: number;
  onlineCount: number;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({
  agentCount,
  onlineCount,
}) => {
  const connectivityPercentage = agentCount > 0 ? Math.round((onlineCount / agentCount) * 100) : 0;
  const isHealthy = connectivityPercentage >= 80;

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
        System Status
      </h3>
      
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Total: {agentCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className={cn(
                "h-4 w-4",
                isHealthy ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
              )} />
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Online: {onlineCount}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">Connectivity</span>
          <span className={cn(
            "text-lg font-bold",
            isHealthy ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
          )}>
            {connectivityPercentage}%
          </span>
        </div>
      </div>
    </div>
  );
}; 
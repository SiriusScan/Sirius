import React from "react";
import { useSystemResources } from "~/hooks/useSystemResources";
import { useRouter } from "next/router";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { Cpu, MemoryStick, Activity, ChevronRight } from "lucide-react";

interface SystemHealthMiniWidgetProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

export const SystemHealthMiniWidget: React.FC<SystemHealthMiniWidgetProps> = ({
  className = "",
  refreshInterval = 10000, // 10s default
}) => {
  const router = useRouter();
  const { data, loading, hasFresh, stale } = useSystemResources(refreshInterval);

  const getCpuColor = (cpuPercent: number) => {
    if (cpuPercent < 25) return "text-green-500";
    if (cpuPercent < 50) return "text-yellow-500";
    if (cpuPercent < 75) return "text-orange-500";
    return "text-red-500";
  };

  const getMemoryColor = (memoryPercent: number) => {
    if (memoryPercent < 25) return "text-green-500";
    if (memoryPercent < 50) return "text-yellow-500";
    if (memoryPercent < 75) return "text-orange-500";
    return "text-red-500";
  };

  if (loading && !data) {
    return <SystemHealthMiniWidgetSkeleton />;
  }

  if (!data || !hasFresh) {
    const observedAt = data?.summary.latest_observed_at;
    return (
      <div className={`rounded-lg border bg-card p-4 ${className}`}>
        <h3 className="text-sm font-medium">System Telemetry</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {stale ? "Current telemetry is stale." : "Current telemetry is unavailable."}
        </p>
        {observedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Latest observation {new Date(observedAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  }

  const { summary } = data;

  return (
    <div
      className={`cursor-pointer rounded-lg border bg-card p-4 transition-all hover:shadow-md ${className}`}
      onClick={() => router.push("/system-monitor")}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Activity className="h-4 w-4" />
          System Telemetry
        </h3>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Containers */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span className="text-xs">Containers</span>
          </div>
          <div className="text-lg font-bold">
            {summary.fresh_containers}/{summary.total_containers}
          </div>
          <div className="text-xs text-muted-foreground">
            With fresh telemetry
          </div>
        </div>

        {/* CPU */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Cpu className="h-3 w-3" />
            <span className="text-xs">CPU</span>
          </div>
          <div
            className={`text-lg font-bold ${getCpuColor(
              summary.total_cpu_percent
            )}`}
          >
            {summary.total_cpu_percent.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {summary.total_cpu_percent < 50 ? "Normal" : "High"}
          </div>
        </div>

        {/* Memory */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-muted-foreground">
            <MemoryStick className="h-3 w-3" />
            <span className="text-xs">Memory</span>
          </div>
          <div
            className={`text-lg font-bold ${getMemoryColor(
              summary.total_memory_percent
            )}`}
          >
            {summary.total_memory_percent.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {summary.total_memory_usage}
          </div>
        </div>
      </div>

      <div className="mt-3 border-t pt-3 text-center text-xs text-muted-foreground">
        {summary.latest_observed_at && (
          <>Latest observation {new Date(summary.latest_observed_at).toLocaleString()}</>
        )}
      </div>
    </div>
  );
};

// Loading skeleton
export const SystemHealthMiniWidgetSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-3 w-14" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
};

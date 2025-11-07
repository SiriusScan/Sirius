import React, { useMemo } from "react";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { AlertTriangle, Server, Shield, Activity } from "lucide-react";

interface ActivityEvent {
  id: string;
  type: "vulnerability" | "scan" | "agent" | "host";
  title: string;
  description: string;
  timestamp: Date;
  severity?: "critical" | "high" | "medium" | "low" | "info";
}

interface RecentActivityTimelineProps {
  vulnerabilityCount?: number;
  hostCount?: number;
  agentCount?: number;
  className?: string;
  limit?: number;
}

// Static mock timeline events
const STATIC_MOCK_EVENTS: ActivityEvent[] = (() => {
  const now = new Date();
  const hoursAgo = (hours: number) =>
    new Date(now.getTime() - hours * 60 * 60 * 1000);

  return [
    {
      id: "event-1",
      type: "vulnerability",
      title: "Critical Vulnerabilities Detected",
      description: "Discovered 12 new critical vulnerabilities during scan",
      timestamp: hoursAgo(2),
      severity: "critical",
    },
    {
      id: "event-2",
      type: "scan",
      title: "Network Scan Completed",
      description: "Successfully scanned 10 hosts in production network",
      timestamp: hoursAgo(3),
      severity: "info",
    },
    {
      id: "event-3",
      type: "host",
      title: "New Hosts Discovered",
      description: "Added 3 new hosts to inventory",
      timestamp: hoursAgo(5),
      severity: "info",
    },
    {
      id: "event-4",
      type: "agent",
      title: "Agent Connected",
      description: "Security agent web-server-01 is now online",
      timestamp: hoursAgo(8),
      severity: "info",
    },
    {
      id: "event-5",
      type: "scan",
      title: "Port Scan Initiated",
      description: "Started comprehensive port scan on 192.168.1.0/24",
      timestamp: hoursAgo(10),
      severity: "info",
    },
    {
      id: "event-6",
      type: "vulnerability",
      title: "Vulnerability Database Updated",
      description: "NVD database synchronized with 152 new CVEs",
      timestamp: hoursAgo(14),
      severity: "info",
    },
    {
      id: "event-7",
      type: "host",
      title: "Host Configuration Changed",
      description: "db-primary firewall rules updated",
      timestamp: hoursAgo(18),
      severity: "info",
    },
    {
      id: "event-8",
      type: "agent",
      title: "System Health Check",
      description: "All 3 agents passed health verification",
      timestamp: hoursAgo(24),
      severity: "info",
    },
  ];
})();

const getEventIcon = (type: string) => {
  switch (type) {
    case "vulnerability":
      return AlertTriangle;
    case "scan":
      return Activity;
    case "agent":
      return Shield;
    case "host":
      return Server;
    default:
      return Activity;
  }
};

const getSeverityColor = (severity?: string) => {
  switch (severity) {
    case "critical":
      return "text-red-500 bg-red-500/10 border-red-500/20";
    case "high":
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    case "medium":
      return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    case "low":
      return "text-green-500 bg-green-500/10 border-green-500/20";
    default:
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  }
};

const formatTimestamp = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return timestamp.toLocaleDateString();
};

const RecentActivityTimelineComponent: React.FC<
  RecentActivityTimelineProps
> = ({
  vulnerabilityCount = 0,
  hostCount = 0,
  agentCount = 0,
  className = "",
  limit = 10,
}) => {
  // Use static mock events, sliced to limit
  const events = useMemo(() => STATIC_MOCK_EVENTS.slice(0, limit), [limit]);

  if (events.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-8 ${className}`}
      >
        <Activity className="mb-2 h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground">
          Start a scan to see events
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Recent Activity</h3>
        <span className="text-xs text-muted-foreground">
          Simulated timeline
        </span>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4 pl-6">
        {/* Vertical line */}
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />

        {events.map((event, index) => {
          const Icon = getEventIcon(event.type);
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative">
              {/* Icon */}
              <div
                className={`absolute -left-6 mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${getSeverityColor(
                  event.severity
                )}`}
              >
                <Icon className="h-2.5 w-2.5" />
              </div>

              {/* Content */}
              <div className={`pb-4 ${isLast ? "" : "border-b"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="text-sm font-medium leading-none">
                      {event.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.description}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Timeline shows simulated recent events
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const RecentActivityTimeline = React.memo(
  RecentActivityTimelineComponent
);

// Loading skeleton
export const RecentActivityTimelineSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-4 w-4 flex-shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

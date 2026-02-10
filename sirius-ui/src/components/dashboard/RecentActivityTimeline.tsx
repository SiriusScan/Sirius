import React, { useMemo } from "react";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { AlertTriangle, Server, Shield, Activity } from "lucide-react";
import { api } from "~/utils/api";
import { getSeverityColors } from "~/utils/severityTheme";

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

// Map backend event_type to frontend type
const mapEventTypeToType = (eventType: string): "vulnerability" | "scan" | "agent" | "host" => {
  if (eventType.includes("vulnerability") || eventType.includes("vulnerabilities")) {
    return "vulnerability";
  }
  if (eventType.includes("scan")) {
    return "scan";
  }
  if (eventType.includes("host")) {
    return "host";
  }
  if (eventType.includes("agent")) {
    return "agent";
  }
  // Default to scan for unknown types
  return "scan";
};

// Map backend severity to frontend severity
const mapSeverity = (severity: string): "critical" | "high" | "medium" | "low" | "info" => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "critical";
    case "error":
      return "high";
    case "warning":
      return "medium";
    case "info":
      return "info";
    default:
      return "info";
  }
};

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
  const c = getSeverityColors(severity ?? "info");
  return [c.text, c.bg, c.border].join(" ");
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
  // Fetch recent events from API
  const { data: eventsData, isLoading, error } = api.events.getRecentEvents.useQuery({
    limit,
  });

  // Map backend events to ActivityEvent format
  const events = useMemo(() => {
    if (!eventsData?.events) return [];

    return eventsData.events.map((event) => ({
      id: event.event_id,
      type: mapEventTypeToType(event.event_type),
      title: event.title,
      description: event.description || "",
      timestamp: new Date(event.timestamp),
      severity: mapSeverity(event.severity),
    })) as ActivityEvent[];
  }, [eventsData]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="mb-3 flex items-center justify-between">
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
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center py-8 ${className}`}
      >
        <AlertTriangle className="mb-2 h-12 w-12 text-red-500 opacity-50" />
        <p className="text-sm text-red-400">Error loading events</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  // Empty state
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
          {events.length} {events.length === 1 ? "event" : "events"}
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

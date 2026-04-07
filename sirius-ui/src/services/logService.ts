// Types and UI helpers for the centralized logging system.
// Runtime reads/writes to protected /api/v1/logs go through session-authenticated
// tRPC (`api.logs.*`), not direct browser fetch.

export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  subcomponent: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, any>;
  context?: Record<string, any>;
}

export interface LogSubmissionRequest {
  service: string;
  subcomponent: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  metadata?: Record<string, any>;
  context?: Record<string, any>;
}

export interface LogRetrievalRequest {
  service?: string;
  level?: string;
  subcomponent?: string;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface LogRetrievalResponse {
  logs: LogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface LogStatsResponse {
  total_logs: number;
  service_stats: Record<string, number>;
  level_stats: Record<string, number>;
  recent_logs: LogEntry[];
}

function getLogLevelColor(level: string): string {
  switch (level) {
    case "error":
      return "text-red-500";
    case "warn":
      return "text-yellow-500";
    case "info":
      return "text-blue-500";
    case "debug":
      return "text-gray-500";
    default:
      return "text-gray-400";
  }
}

function getLogLevelBadgeVariant(
  level: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case "error":
      return "destructive";
    case "warn":
      return "outline";
    case "info":
      return "default";
    case "debug":
      return "secondary";
    default:
      return "secondary";
  }
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return timestamp;
  }
}

function formatRelativeTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  } catch {
    return "Unknown";
  }
}

/** Presentation helpers used by log UI components. */
export const logService = {
  getLogLevelColor,
  getLogLevelBadgeVariant,
  formatTimestamp,
  formatRelativeTime,
};

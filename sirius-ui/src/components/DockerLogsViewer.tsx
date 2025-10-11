import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import { Button } from "~/components/lib/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import { Input } from "~/components/lib/ui/input";
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";

interface DockerLogsViewerProps {
  className?: string;
}

interface LogEntry {
  container: string;
  timestamp: string;
  level: string;
  message: string;
}

interface DockerLogsData {
  logs: LogEntry[];
  summary: {
    total_logs: number;
    containers: string[];
  };
  timestamp: string;
  container: string;
  lines: string;
}

export const DockerLogsViewer: React.FC<DockerLogsViewerProps> = ({
  className,
}) => {
  const [data, setData] = useState<DockerLogsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContainer, setSelectedContainer] = useState<string>("all");
  const [lines, setLines] = useState<string>("100");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<string>("30");

  // Mock data for fallback
  const generateMockData = (): DockerLogsData => {
    const now = new Date();
    return {
      logs: [
        {
          container: "sirius-api",
          timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "🚀 Sirius API starting on port 9001...",
        },
        {
          container: "sirius-api",
          timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "✅ PostgreSQL database connection established",
        },
        {
          container: "sirius-ui",
          timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "Ready - started server on 0.0.0.0:3000",
        },
        {
          container: "sirius-engine",
          timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "Scanner service initialized successfully",
        },
        {
          container: "sirius-postgres",
          timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "database system is ready to accept connections",
        },
        {
          container: "sirius-valkey",
          timestamp: new Date(now.getTime() - 6 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "Valkey server started, ready to accept connections",
        },
        {
          container: "sirius-rabbitmq",
          timestamp: new Date(now.getTime() - 7 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "Server startup complete; 0 plugins started.",
        },
        {
          container: "sirius-api",
          timestamp: new Date(now.getTime() - 8 * 60 * 1000).toISOString(),
          level: "WARN",
          message: "High memory usage detected in container",
        },
        {
          container: "sirius-engine",
          timestamp: new Date(now.getTime() - 9 * 60 * 1000).toISOString(),
          level: "ERROR",
          message: "Failed to connect to external service: timeout",
        },
        {
          container: "sirius-ui",
          timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
          level: "INFO",
          message: "Next.js application compiled successfully",
        },
      ],
      summary: {
        total_logs: 10,
        containers: [
          "sirius-api",
          "sirius-ui",
          "sirius-engine",
          "sirius-postgres",
          "sirius-valkey",
          "sirius-rabbitmq",
        ],
      },
      timestamp: now.toISOString(),
      container: "all",
      lines: "100",
    };
  };

  const loadDockerLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedContainer !== "all") {
        params.append("container", selectedContainer);
      }
      params.append("lines", lines);

      // Fetch real Docker logs from API
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001"
        }/api/v1/system/logs?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiData = await response.json();

      setData(apiData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load Docker logs"
      );
      console.error("Failed to load Docker logs:", err);

      // Fallback to mock data on error
      const mockData = generateMockData();
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDockerLogs();
  }, [selectedContainer, lines]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDockerLogs();
    }, parseInt(refreshInterval) * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, selectedContainer, lines]);

  const handleRefresh = () => {
    loadDockerLogs();
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level.toUpperCase()) {
      case "ERROR":
        return "destructive";
      case "WARN":
      case "WARNING":
        return "outline";
      case "INFO":
        return "default";
      case "DEBUG":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes === 1) return "1 minute ago";
      return `${diffMinutes} minutes ago`;
    } catch {
      return "Unknown";
    }
  };

  // Filter logs based on search term
  const filteredLogs =
    data?.logs.filter(
      (log) =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.container.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.level.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const downloadLogs = () => {
    if (!data) return;

    const logText = filteredLogs
      .map((log) => {
        const timestamp = showTimestamps
          ? `[${formatTimestamp(log.timestamp)}] `
          : "";
        return `${timestamp}[${log.container}] [${log.level}] ${log.message}`;
      })
      .join("\n");

    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `docker-logs-${selectedContainer}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className={`space-y-6 ${className || ""}`}>
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading Docker logs...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Docker Logs</h2>
          <p className="text-muted-foreground">
            Real-time container logs for cloud debugging
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={downloadLogs} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleRefresh} disabled={loading} variant="outline">
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/20 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="font-medium text-red-400">Error</span>
          </div>
          <p className="mt-1 text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Select
            value={selectedContainer}
            onValueChange={setSelectedContainer}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Containers</SelectItem>
              {data?.summary.containers.map((container) => (
                <SelectItem key={container} value={container}>
                  {container}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <Select value={lines} onValueChange={setLines}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
              <SelectItem value="500">500</SelectItem>
              <SelectItem value="1000">1000</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={showTimestamps ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTimestamps(!showTimestamps)}
          >
            {showTimestamps ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
            Timestamps
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Clock className="h-4 w-4" />
            Auto Refresh
          </Button>
          {autoRefresh && (
            <Select value={refreshInterval} onValueChange={setRefreshInterval}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">1m</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Summary */}
      {data && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredLogs.length} of {data.summary.total_logs} logs
            {selectedContainer !== "all" && ` from ${selectedContainer}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
          <div>Last updated: {formatRelativeTime(data.timestamp)}</div>
        </div>
      )}

      {/* Logs Display */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Container Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto font-mono text-sm">
              {filteredLogs.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No logs found matching your criteria
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-2 rounded p-2 hover:bg-muted/50"
                    >
                      {showTimestamps && (
                        <div className="min-w-32 text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </div>
                      )}
                      <Badge
                        variant="outline"
                        className="min-w-16 justify-center text-xs"
                      >
                        {log.container}
                      </Badge>
                      <Badge
                        variant={getLevelBadgeVariant(log.level)}
                        className="min-w-12 justify-center text-xs"
                      >
                        {log.level}
                      </Badge>
                      <div className="flex-1 text-sm">{log.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

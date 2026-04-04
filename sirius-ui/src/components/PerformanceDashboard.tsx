import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/lib/ui/table";
import { Badge } from "~/components/lib/ui/badge";
import { Button } from "~/components/lib/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import {
  RefreshCw,
  TrendingUp,
  Clock,
  AlertTriangle,
  Activity,
} from "lucide-react";

interface PerformanceMetric {
  id: string;
  timestamp: string;
  service: string;
  endpoint: string;
  method: string;
  duration_ms: number;
  status_code: number;
  response_size: number;
  request_id?: string;
}

interface PerformanceSummary {
  total_requests: number;
  average_response_ms: number;
  min_response_ms: number;
  max_response_ms: number;
  error_rate: number;
  requests_per_minute: number;
  top_endpoints: EndpointStats[];
  service_stats: ServiceStats[];
}

interface EndpointStats {
  endpoint: string;
  method: string;
  request_count: number;
  average_response_ms: number;
  error_count: number;
  error_rate: number;
}

interface ServiceStats {
  service: string;
  request_count: number;
  average_response_ms: number;
  error_count: number;
  error_rate: number;
}

interface PerformanceDashboardProps {
  className?: string;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("1h");

  // Mock data for now
  const generateMockData = (): {
    metrics: PerformanceMetric[];
    summary: PerformanceSummary;
  } => {
    const now = new Date();
    const mockMetrics: PerformanceMetric[] = [
      {
        id: "perf_001",
        timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
        service: "sirius-api",
        endpoint: "/api/v1/system/health",
        method: "GET",
        duration_ms: 15,
        status_code: 200,
        response_size: 1024,
        request_id: "req_001",
      },
      {
        id: "perf_002",
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
        service: "sirius-api",
        endpoint: "/api/v1/logs/stats",
        method: "GET",
        duration_ms: 8,
        status_code: 200,
        response_size: 512,
        request_id: "req_002",
      },
      {
        id: "perf_003",
        timestamp: new Date(now.getTime() - 3 * 60 * 1000).toISOString(),
        service: "sirius-api",
        endpoint: "/api/v1/logs",
        method: "POST",
        duration_ms: 25,
        status_code: 201,
        response_size: 256,
        request_id: "req_003",
      },
      {
        id: "perf_004",
        timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        service: "sirius-api",
        endpoint: "/api/v1/hosts",
        method: "GET",
        duration_ms: 45,
        status_code: 200,
        response_size: 2048,
        request_id: "req_004",
      },
      {
        id: "perf_005",
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        service: "sirius-api",
        endpoint: "/api/v1/vulnerabilities",
        method: "GET",
        duration_ms: 120,
        status_code: 200,
        response_size: 4096,
        request_id: "req_005",
      },
      {
        id: "perf_006",
        timestamp: new Date(now.getTime() - 6 * 60 * 1000).toISOString(),
        service: "sirius-api",
        endpoint: "/api/v1/hosts/invalid",
        method: "GET",
        duration_ms: 5,
        status_code: 404,
        response_size: 128,
        request_id: "req_006",
      },
    ];

    const mockSummary: PerformanceSummary = {
      total_requests: 6,
      average_response_ms: 36.3,
      min_response_ms: 5,
      max_response_ms: 120,
      error_rate: 16.7,
      requests_per_minute: 1.0,
      top_endpoints: [
        {
          endpoint: "/api/v1/system/health",
          method: "GET",
          request_count: 1,
          average_response_ms: 15,
          error_count: 0,
          error_rate: 0,
        },
        {
          endpoint: "/api/v1/logs/stats",
          method: "GET",
          request_count: 1,
          average_response_ms: 8,
          error_count: 0,
          error_rate: 0,
        },
        {
          endpoint: "/api/v1/hosts/invalid",
          method: "GET",
          request_count: 1,
          average_response_ms: 5,
          error_count: 1,
          error_rate: 100,
        },
      ],
      service_stats: [
        {
          service: "sirius-api",
          request_count: 6,
          average_response_ms: 36.3,
          error_count: 1,
          error_rate: 16.7,
        },
      ],
    };

    return { metrics: mockMetrics, summary: mockSummary };
  };

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real performance data from API
      const response = await fetch(
        "/api/monitor/proxy/api/v1/performance/metrics"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Transform API response to match our interface
      const transformedMetrics: PerformanceMetric[] = data.metrics.map(
        (metric: any, index: number) => ({
          id: `perf_${index}`,
          timestamp: metric.timestamp,
          service: "sirius-api",
          endpoint: metric.endpoint,
          method: metric.method,
          duration_ms: metric.duration_ms,
          status_code: metric.status_code,
          response_size: 1024, // Default size since API doesn't provide this yet
          request_id: `req_${index}`,
        })
      );

      const transformedSummary: PerformanceSummary = {
        total_requests: data.summary.total_requests,
        average_response_ms: data.summary.average_response_ms,
        min_response_ms: Math.min(
          ...data.metrics.map((m: any) => m.duration_ms)
        ),
        max_response_ms: Math.max(
          ...data.metrics.map((m: any) => m.duration_ms)
        ),
        error_rate: data.summary.error_rate,
        requests_per_minute: data.summary.total_requests,
        top_endpoints: data.metrics.map((metric: any) => ({
          endpoint: metric.endpoint,
          method: metric.method,
          request_count: 1,
          average_response_ms: metric.duration_ms,
          error_count: metric.status_code >= 400 ? 1 : 0,
          error_rate: metric.status_code >= 400 ? 1 : 0,
        })),
        service_stats: [
          {
            service: "sirius-api",
            request_count: data.summary.total_requests,
            average_response_ms: data.summary.average_response_ms,
            error_count: 0,
            error_rate: data.summary.error_rate,
          },
        ],
      };

      setMetrics(transformedMetrics);
      setSummary(transformedSummary);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load performance data"
      );
      console.error("Failed to load performance data:", err);

      // Fallback to mock data on error
      const { metrics: mockMetrics, summary: mockSummary } = generateMockData();
      setMetrics(mockMetrics);
      setSummary(mockSummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, [timeRange]);

  const handleRefresh = () => {
    loadPerformanceData();
  };

  const getStatusBadgeVariant = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return "default";
    if (statusCode >= 300 && statusCode < 400) return "secondary";
    if (statusCode >= 400 && statusCode < 500) return "outline";
    return "destructive";
  };

  const getDurationColor = (duration: number) => {
    if (duration < 50) return "text-green-500";
    if (duration < 100) return "text-yellow-500";
    return "text-red-500";
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Performance Metrics
          </h2>
          <p className="text-muted-foreground">
            Real-time performance monitoring and analytics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_requests}</div>
              <p className="text-xs text-muted-foreground">
                {summary.requests_per_minute.toFixed(1)} req/min
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Response Time
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.average_response_ms.toFixed(1)}ms
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.min_response_ms}ms - {summary.max_response_ms}ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.error_rate > 5 ? "text-red-500" : "text-green-500"
                }`}
              >
                {summary.error_rate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.error_rate > 5
                  ? "High error rate"
                  : "Normal error rate"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.average_response_ms < 100
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {summary.average_response_ms < 100 ? "Good" : "Slow"}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.average_response_ms < 100
                  ? "Fast responses"
                  : "Needs optimization"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Endpoints */}
      {summary && summary.top_endpoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>
              Most frequently accessed endpoints with performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.top_endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{endpoint.method}</Badge>
                    <span className="font-mono text-sm">
                      {endpoint.endpoint}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-muted-foreground">
                      {endpoint.request_count} requests
                    </span>
                    <span
                      className={getDurationColor(endpoint.average_response_ms)}
                    >
                      {endpoint.average_response_ms.toFixed(1)}ms avg
                    </span>
                    {endpoint.error_count > 0 && (
                      <Badge variant="destructive">
                        {endpoint.error_rate.toFixed(1)}% errors
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance Metrics</CardTitle>
          <CardDescription>
            Detailed performance data for recent requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell className="font-mono text-sm">
                      <div>{formatTimestamp(metric.timestamp)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(metric.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {metric.service}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {metric.endpoint}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{metric.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getDurationColor(metric.duration_ms)}>
                        {metric.duration_ms}ms
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(metric.status_code)}
                      >
                        {metric.status_code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {metric.response_size} bytes
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

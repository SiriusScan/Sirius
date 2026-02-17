import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
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
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Activity,
  AlertTriangle,
  Users,
  FileText,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Play,
  Square,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";

interface SystemResourceProps {
  className?: string;
}

interface ContainerResource {
  name: string;
  cpu_percent: number;
  memory_usage: string;
  memory_percent: number;
  network_io: string;
  disk_usage: string;
  disk_percent: number;
  process_count: number;
  file_descriptors: number;
  load_average_1m: number;
  load_average_5m: number;
  load_average_15m: number;
  uptime: string;
  status: string;
}

interface SystemResourcesSummary {
  total_containers: number;
  running_containers: number;
  total_cpu_percent: number;
  total_memory_usage: string;
  total_memory_percent: number;
}

interface SystemResourcesData {
  containers: ContainerResource[];
  summary: SystemResourcesSummary;
  timestamp: string;
}

export const SystemResourcesDashboard: React.FC<SystemResourceProps> = ({
  className,
}) => {
  const [data, setData] = useState<SystemResourcesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<string>("5");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<{
    title: string;
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [restartingContainers, setRestartingContainers] = useState<Set<string>>(
    new Set()
  );
  const [containerUptimes, setContainerUptimes] = useState<Map<string, string>>(
    new Map()
  );
  const [containerLogs, setContainerLogs] = useState<Map<string, any[]>>(
    new Map()
  );

  // Mock data for fallback
  const generateMockData = (): SystemResourcesData => {
    const now = new Date();
    return {
      containers: [
        {
          name: "sirius-api",
          cpu_percent: 2.5,
          memory_usage: "45.2MB",
          memory_percent: 1.2,
          network_io: "1.2kB / 856B",
          disk_usage: "26.1GB / 503.6GB",
          disk_percent: 5.2,
          process_count: 3,
          file_descriptors: 8,
          load_average_1m: 1.96,
          load_average_5m: 1.84,
          load_average_15m: 1.47,
          uptime: "1d 15h",
          status: "running",
        },
        {
          name: "sirius-ui",
          cpu_percent: 1.8,
          memory_usage: "128.5MB",
          memory_percent: 3.4,
          network_io: "2.1kB / 1.2kB",
          disk_usage: "15.2GB / 503.6GB",
          disk_percent: 3.0,
          process_count: 2,
          file_descriptors: 6,
          load_average_1m: 0.85,
          load_average_5m: 0.92,
          load_average_15m: 0.78,
          uptime: "1d 15h",
          status: "running",
        },
        {
          name: "sirius-engine",
          cpu_percent: 0.5,
          memory_usage: "89.3MB",
          memory_percent: 2.1,
          network_io: "856B / 432B",
          disk_usage: "8.7GB / 503.6GB",
          disk_percent: 1.7,
          process_count: 5,
          file_descriptors: 12,
          load_average_1m: 0.45,
          load_average_5m: 0.38,
          load_average_15m: 0.42,
          uptime: "1d 15h",
          status: "running",
        },
        {
          name: "sirius-postgres",
          cpu_percent: 0.2,
          memory_usage: "156.7MB",
          memory_percent: 4.1,
          network_io: "3.2kB / 2.1kB",
          disk_usage: "45.3GB / 503.6GB",
          disk_percent: 9.0,
          process_count: 8,
          file_descriptors: 24,
          load_average_1m: 0.12,
          load_average_5m: 0.15,
          load_average_15m: 0.18,
          uptime: "1d 15h",
          status: "running",
        },
        {
          name: "sirius-valkey",
          cpu_percent: 0.1,
          memory_usage: "12.3MB",
          memory_percent: 0.3,
          network_io: "432B / 256B",
          disk_usage: "2.1GB / 503.6GB",
          disk_percent: 0.4,
          process_count: 1,
          file_descriptors: 4,
          load_average_1m: 0.05,
          load_average_5m: 0.08,
          load_average_15m: 0.06,
          uptime: "1d 15h",
          status: "running",
        },
        {
          name: "sirius-rabbitmq",
          cpu_percent: 0.3,
          memory_usage: "67.8MB",
          memory_percent: 1.8,
          network_io: "1.5kB / 1.1kB",
          disk_usage: "3.4GB / 503.6GB",
          disk_percent: 0.7,
          process_count: 4,
          file_descriptors: 16,
          load_average_1m: 0.18,
          load_average_5m: 0.22,
          load_average_15m: 0.19,
          uptime: "1d 15h",
          status: "running",
        },
      ],
      summary: {
        total_containers: 6,
        running_containers: 6,
        total_cpu_percent: 5.4,
        total_memory_usage: "499.8MB",
        total_memory_percent: 13.1,
      },
      timestamp: now.toISOString(),
    };
  };

  const loadSystemResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real system resource data from API
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001"
        }/api/v1/system/resources`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const apiData = await response.json();

      // Check for container restarts by comparing uptimes
      if (apiData.containers) {
        const newUptimes = new Map<string, string>();
        const newRestartingContainers = new Set(restartingContainers);

        apiData.containers.forEach((container: ContainerResource) => {
          const previousUptime = containerUptimes.get(container.name);
          newUptimes.set(container.name, container.uptime);

          // If uptime changed and container was restarting, it's back online
          if (
            previousUptime &&
            previousUptime !== container.uptime &&
            restartingContainers.has(container.name)
          ) {
            newRestartingContainers.delete(container.name);
            console.log(
              `Container ${container.name} has restarted successfully`
            );
          }
        });

        setContainerUptimes(newUptimes);
        setRestartingContainers(newRestartingContainers);
      }

      setData(apiData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load system resources"
      );
      console.error("Failed to load system resources:", err);

      // Fallback to mock data on error
      const mockData = generateMockData();
      setData(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSystemResources();
  }, []);

  // Auto-refresh based on interval
  useEffect(() => {
    if (refreshInterval === "0") return; // Disabled

    const interval = setInterval(() => {
      loadSystemResources();
    }, parseInt(refreshInterval) * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleRefresh = () => {
    loadSystemResources();
  };

  // Load recent logs for a specific container
  const loadContainerLogs = async (containerName: string) => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001"
        }/api/v1/system/logs?container=${containerName}&lines=3`
      );
      if (response.ok) {
        const data = await response.json();
        setContainerLogs((prev) => {
          const newMap = new Map(prev);
          newMap.set(containerName, data.logs || []);
          return newMap;
        });
      }
    } catch (error) {
      console.error(`Error loading logs for ${containerName}:`, error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "default";
      case "exited":
        return "destructive";
      case "paused":
        return "secondary";
      default:
        return "outline";
    }
  };

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

  const getDiskColor = (diskPercent: number) => {
    if (diskPercent < 25) return "text-green-500";
    if (diskPercent < 50) return "text-yellow-500";
    if (diskPercent < 75) return "text-orange-500";
    return "text-red-500";
  };

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
      // Load logs when expanding
      if (data && data.containers[index]) {
        const containerName = data.containers[index].name;
        loadContainerLogs(containerName);
      }
    }
    setExpandedRows(newExpanded);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Unknown";
    }
  };

  if (loading && !data) {
    return (
      <div className={`space-y-6 ${className || ""}`}>
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading system resources...</span>
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
          <h2 className="text-2xl font-bold tracking-tight">
            System Resources
          </h2>
          <p className="text-muted-foreground">
            Real-time container resource monitoring
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Manual</SelectItem>
              <SelectItem value="2">Live</SelectItem>
              <SelectItem value="5">5s</SelectItem>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="300">5m</SelectItem>
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
      {data && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Containers
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.summary.total_containers}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.summary.running_containers} running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total CPU</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getCpuColor(
                  data.summary.total_cpu_percent
                )}`}
              >
                {data.summary.total_cpu_percent.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.summary.total_cpu_percent < 50
                  ? "Low usage"
                  : "High usage"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Memory
              </CardTitle>
              <MemoryStick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getMemoryColor(
                  data.summary.total_memory_percent
                )}`}
              >
                {data.summary.total_memory_usage}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.summary.total_memory_percent.toFixed(1)}% of system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Updated
              </CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatTimestamp(data.timestamp)}
              </div>
              <p className="text-xs text-muted-foreground">
                {refreshInterval === "0"
                  ? "Manual refresh"
                  : refreshInterval === "2"
                  ? "Live updates"
                  : `Auto ${refreshInterval}s`}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Container Resources Table */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle>Container Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Container</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Network I/O</TableHead>
                  <TableHead>Disk Usage</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.containers.map((container, index) => (
                  <React.Fragment key={index}>
                    <TableRow
                      className={`cursor-pointer hover:bg-muted/50 ${
                        restartingContainers.has(container.name)
                          ? "bg-muted/20 opacity-50"
                          : ""
                      }`}
                      onClick={() => toggleRowExpansion(index)}
                    >
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center space-x-2">
                          {expandedRows.has(index) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {container.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getStatusBadgeVariant(container.status)}
                        >
                          {container.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Cpu className="h-4 w-4" />
                          <span className={getCpuColor(container.cpu_percent)}>
                            {container.cpu_percent.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MemoryStick className="h-4 w-4" />
                          <div>
                            <div className="font-medium">
                              {container.memory_usage}
                            </div>
                            <div
                              className={`text-xs ${getMemoryColor(
                                container.memory_percent
                              )}`}
                            >
                              {container.memory_percent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Network className="h-4 w-4" />
                          <span className="font-mono text-sm">
                            {container.network_io}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <HardDrive className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium">
                              {container.disk_usage}
                            </div>
                            <div
                              className={`text-xs ${getDiskColor(
                                container.disk_percent
                              )}`}
                            >
                              {container.disk_percent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-mono text-sm">
                            {container.uptime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={restartingContainers.has(container.name)}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setDialogContent({
                                title: "Confirm Restart",
                                message: `Are you sure you want to restart ${container.name}? This action cannot be undone.`,
                                type: "success",
                              });
                              setDialogOpen(true);

                              // Store the container name for the actual restart action
                              const targetContainer = container.name;

                              // Handle the restart action
                              const handleRestart = async () => {
                                try {
                                  // Add container to restarting state
                                  setRestartingContainers((prev) =>
                                    new Set(prev).add(targetContainer)
                                  );

                                  const response = await fetch(
                                    `${
                                      process.env.NEXT_PUBLIC_SIRIUS_API_URL ||
                                      "http://localhost:9001"
                                    }/api/v1/admin/command`,
                                    {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                      },
                                      body: JSON.stringify({
                                        action: "restart",
                                        container_name: targetContainer,
                                      }),
                                    }
                                  );

                                  if (response.ok) {
                                    const result = await response.json();
                                    setDialogContent({
                                      title: "Restart Command Sent",
                                      message: `Restart command sent successfully! Request ID: ${result.request_id}. The container will restart shortly.`,
                                      type: "success",
                                    });
                                  } else {
                                    // Remove from restarting state on failure
                                    setRestartingContainers((prev) => {
                                      const newSet = new Set(prev);
                                      newSet.delete(targetContainer);
                                      return newSet;
                                    });
                                    setDialogContent({
                                      title: "Restart Failed",
                                      message:
                                        "Failed to send restart command. Please try again.",
                                      type: "error",
                                    });
                                  }
                                } catch (error) {
                                  // Remove from restarting state on error
                                  setRestartingContainers((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(targetContainer);
                                    return newSet;
                                  });
                                  console.error(
                                    "Error sending restart command:",
                                    error
                                  );
                                  setDialogContent({
                                    title: "Restart Error",
                                    message:
                                      "Error sending restart command. Please check your connection.",
                                    type: "error",
                                  });
                                }
                              };

                              // Store the handler for the dialog
                              (window as any).handleRestart = handleRestart;
                            }}
                          >
                            {restartingContainers.has(container.name) ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded Row Content */}
                    {expandedRows.has(index) && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/20">
                          <div className="space-y-4 p-4">
                            {/* Secondary Metrics */}
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <div>
                                  <div className="text-sm font-medium">
                                    Processes
                                  </div>
                                  <div className="text-lg font-bold">
                                    {container.process_count}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <div>
                                  <div className="text-sm font-medium">
                                    File Descriptors
                                  </div>
                                  <div className="text-lg font-bold">
                                    {container.file_descriptors}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4" />
                                <div>
                                  <div className="text-sm font-medium">
                                    Load Average
                                  </div>
                                  <div className="text-sm">
                                    <div>
                                      1m: {container.load_average_1m.toFixed(2)}
                                    </div>
                                    <div>
                                      5m: {container.load_average_5m.toFixed(2)}
                                    </div>
                                    <div>
                                      15m:{" "}
                                      {container.load_average_15m.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Activity className="h-4 w-4" />
                                  <div>
                                    <div className="text-sm font-medium">
                                      Container Health
                                    </div>
                                    <div className="text-sm">
                                      {container.status === "running" ? (
                                        <span className="flex items-center text-green-500">
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                          Healthy
                                        </span>
                                      ) : (
                                        <span className="flex items-center text-red-500">
                                          <XCircle className="mr-1 h-3 w-3" />
                                          {container.status}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Recent Logs */}
                            <div className="border-t pt-4">
                              <h4 className="mb-2 text-sm font-medium">
                                Recent Logs
                              </h4>
                              {containerLogs.has(container.name) ? (
                                <div className="space-y-2">
                                  {containerLogs
                                    .get(container.name)
                                    ?.slice(0, 3)
                                    .map((log: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="flex items-start space-x-2 text-xs"
                                      >
                                        <span
                                          className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                                            log.level === "ERROR"
                                              ? "bg-red-500/20 text-red-300"
                                              : log.level === "WARN"
                                              ? "bg-yellow-500/20 text-yellow-300"
                                              : "bg-green-500/20 text-green-300"
                                          }`}
                                        >
                                          {log.level}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <div className="text-muted-foreground">
                                            {new Date(
                                              log.timestamp
                                            ).toLocaleTimeString()}
                                          </div>
                                          <div className="truncate">
                                            {log.message}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <div className="text-sm text-muted-foreground">
                                  Loading recent logs...
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>{dialogContent?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {dialogContent?.title === "Confirm Restart" ? (
              <>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if ((window as any).handleRestart) {
                      (window as any).handleRestart();
                    }
                  }}
                >
                  Restart Container
                </Button>
              </>
            ) : (
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

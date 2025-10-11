import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Layout from "~/components/Layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import { Button } from "~/components/lib/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import {
  RefreshCw,
  Server,
  Database,
  MessageSquare,
  Zap,
  Globe,
  AlertCircle,
  FileText,
  Activity,
  HardDrive,
  CheckCircle,
} from "lucide-react";
import {
  healthCheckService,
  type SystemHealthResponse,
  type ServiceHealth,
} from "~/services/healthCheckService";
import { LogDashboard } from "~/components/LogDashboard";
import { SystemResourcesDashboard } from "~/components/SystemResourcesDashboard";
import { DockerLogsViewer } from "~/components/DockerLogsViewer";

// Service configuration
const serviceConfig = [
  {
    id: "sirius-ui",
    name: "Sirius UI",
    icon: Globe,
    description: "Next.js frontend application",
  },
  {
    id: "sirius-api",
    name: "Sirius API",
    icon: Server,
    description: "Go REST API backend",
  },
  {
    id: "sirius-engine",
    name: "Sirius Engine",
    icon: Zap,
    description: "Core processing engine",
  },
  {
    id: "sirius-postgres",
    name: "PostgreSQL",
    icon: Database,
    description: "Primary database",
  },
  {
    id: "sirius-valkey",
    name: "Valkey",
    icon: Database,
    description: "Redis-compatible cache",
  },
  {
    id: "sirius-rabbitmq",
    name: "RabbitMQ",
    icon: MessageSquare,
    description: "Message broker",
  },
];

type ServiceStatus = "up" | "down" | "loading" | "error";

const ServiceStatusCard: React.FC<{
  serviceConfig: (typeof serviceConfig)[0];
  serviceHealth: ServiceHealth | null;
  uptime?: string;
}> = ({ serviceConfig, serviceHealth, uptime }) => {
  const Icon = serviceConfig.icon;

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "up":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "down":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "loading":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "up":
        return "✓";
      case "down":
        return "✗";
      case "loading":
        return "⟳";
      case "error":
        return "⚠";
      default:
        return "?";
    }
  };

  const status = serviceHealth?.status || "loading";
  const message = serviceHealth?.message || "Checking...";
  const timestamp = serviceHealth?.timestamp
    ? new Date(serviceHealth.timestamp)
    : new Date();
  const port = serviceHealth?.port;

  return (
    <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-lg font-medium text-white">
              {serviceConfig.name}
            </CardTitle>
          </div>
          <Badge className={`${getStatusColor(status)} border`}>
            {getStatusIcon(status)} {status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{serviceConfig.description}</p>
        {message && message !== "Checking..." && (
          <p className="mt-1 text-xs text-gray-500">{message}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {port && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Port:</span>
              <span className="text-white">{port}</span>
            </div>
          )}
          {uptime && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-white">{uptime}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SystemMonitor: NextPage = () => {
  const { data: sessionData } = useSession();
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(
    null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [resourceLoading, setResourceLoading] = useState(false);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [errorLogsLoading, setErrorLogsLoading] = useState(false);

  // Load resource data for dashboard
  const loadResourceData = async () => {
    try {
      setResourceLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001"
        }/api/v1/system/resources`
      );
      if (response.ok) {
        const data = await response.json();
        setResourceData(data);
      }
    } catch (error) {
      console.error("Error loading resource data:", error);
    } finally {
      setResourceLoading(false);
    }
  };

  // Load recent error logs for dashboard
  const loadErrorLogs = async () => {
    try {
      setErrorLogsLoading(true);
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_SIRIUS_API_URL || "http://localhost:9001"
        }/api/v1/logs?limit=200`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter for error and warn level logs and take top 3
        const errorLogs = (data.logs || [])
          .filter((log: any) => log.level === "error" || log.level === "warn")
          .slice(0, 3);
        setErrorLogs(errorLogs);
      }
    } catch (error) {
      console.error("Error loading error logs:", error);
    } finally {
      setErrorLogsLoading(false);
    }
  };

  // Get uptime for a specific service from resource data
  const getServiceUptime = (serviceId: string): string | undefined => {
    if (!resourceData?.containers) return undefined;

    // Map service IDs to container names
    const containerNameMap: Record<string, string> = {
      "sirius-ui": "sirius-ui",
      "sirius-api": "sirius-api",
      "sirius-engine": "sirius-engine",
      "sirius-postgres": "sirius-postgres",
      "sirius-valkey": "sirius-valkey",
      "sirius-rabbitmq": "sirius-rabbitmq",
    };

    const containerName = containerNameMap[serviceId];
    if (!containerName) return undefined;

    const container = resourceData.containers.find(
      (c: any) => c.name === containerName
    );
    return container?.uptime;
  };

  // Start polling for health checks on component mount
  useEffect(() => {
    const stopPolling = healthCheckService.startPolling(
      (health) => {
        setSystemHealth(health);
        setError(null);
      },
      (err) => {
        setError(err.message);
        console.error("Health check error:", err);
      },
      {
        interval: 5000, // 5 seconds
        retries: 3,
        timeout: 5000,
      }
    );

    // Load resource data and error logs on mount
    loadResourceData();
    loadErrorLogs();

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      const health = await healthCheckService.checkSystemHealth();
      setSystemHealth(health);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to refresh health status"
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const serviceCounts = healthCheckService.getServiceCounts(systemHealth);
  const upServices = serviceCounts.up;
  const downServices = serviceCounts.down;
  const totalServices = systemHealth
    ? Object.keys(systemHealth.services).length
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extralight text-white">
              System Monitor
            </h1>
            <p className="mt-1 text-gray-400">
              Monitor system health and view real-time logs
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border border-violet-500/30 bg-violet-600/20 text-white hover:bg-violet-600/30"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/20 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="font-medium text-red-400">
                Health Check Error
              </span>
            </div>
            <p className="mt-1 text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Tabs for different monitoring views */}
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              System Logs
            </TabsTrigger>
            {/* Temporarily hidden - will be implemented in future */}
            {/* <TabsTrigger
              value="docker-logs"
              className="flex items-center gap-2"
            >
              <Terminal className="h-4 w-4" />
              Docker Logs
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="services" className="mt-6 space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-green-500/20 p-2">
                      <Server className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {upServices}/{totalServices}
                      </p>
                      <p className="text-sm text-gray-400">Services Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-500/20 p-2">
                      <AlertCircle className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {systemHealth?.overall || "loading"}
                      </p>
                      <p className="text-sm text-gray-400">Overall Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-lg bg-yellow-500/20 p-2">
                      <AlertCircle className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {downServices}
                      </p>
                      <p className="text-sm text-gray-400">Services Down</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resource Overview */}
            <div>
              <h2 className="mb-4 text-xl font-medium text-white">
                Resource Overview
              </h2>
              {resourceLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading resource data...</span>
                  </div>
                </div>
              ) : resourceData?.summary ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {/* Peak CPU Usage */}
                  <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-500/20 p-2">
                          <Activity className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {resourceData.containers &&
                            resourceData.containers.length > 0
                              ? Math.max(
                                  ...resourceData.containers.map(
                                    (c: any) => c.cpu_percent || 0
                                  )
                                ).toFixed(1)
                              : "0.0"}
                            %
                          </p>
                          <p className="text-sm text-gray-400">
                            Peak CPU Usage
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Memory Usage */}
                  <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-purple-500/20 p-2">
                          <HardDrive className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {resourceData.summary.total_memory_percent?.toFixed(
                              1
                            ) || "0.0"}
                            %
                          </p>
                          <p className="text-sm text-gray-400">Memory Usage</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Disk Usage */}
                  <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-green-500/20 p-2">
                          <HardDrive className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {resourceData.containers &&
                            resourceData.containers.length > 0
                              ? resourceData.containers
                                  .reduce(
                                    (sum: number, container: any) =>
                                      sum + (container.disk_percent || 0),
                                    0
                                  )
                                  .toFixed(1)
                              : "0.0"}
                            %
                          </p>
                          <p className="text-sm text-gray-400">
                            Total Disk Usage
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Memory Usage (MB) */}
                  <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-500/20 p-2">
                          <Database className="h-6 w-6 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {resourceData.summary.total_memory_usage || "0MB"}
                          </p>
                          <p className="text-sm text-gray-400">Memory Used</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400">No resource data available</p>
                    <Button
                      onClick={loadResourceData}
                      variant="outline"
                      className="mt-2"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Service Status Grid */}
            <div>
              <h2 className="mb-4 text-xl font-medium text-white">
                Service Status
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {serviceConfig.map((service) => (
                  <ServiceStatusCard
                    key={service.id}
                    serviceConfig={service}
                    serviceHealth={healthCheckService.getServiceStatus(
                      service.id,
                      systemHealth
                    )}
                    uptime={getServiceUptime(service.id)}
                  />
                ))}
              </div>
            </div>

            {/* Recent Error Logs */}
            <div>
              <h2 className="mb-4 text-xl font-medium text-white">
                Recent Issues
              </h2>
              {errorLogsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading error logs...</span>
                  </div>
                </div>
              ) : errorLogs.length > 0 ? (
                <div className="space-y-3">
                  {errorLogs.map((log, index) => (
                    <Card
                      key={index}
                      className="bg-paper border-red-500/20 shadow-md shadow-red-300/10 dark:bg-red-300/5"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="rounded-lg bg-red-500/20 p-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center space-x-2">
                              <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                {log.level?.toUpperCase() || "ERROR"}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {log.service ||
                                  log.container_name ||
                                  log.container}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="break-words text-sm text-white">
                              {log.message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-paper border-green-500/20 shadow-md shadow-green-300/10 dark:bg-green-300/5">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-green-500/20 p-2">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-white">
                          No Recent Errors
                        </p>
                        <p className="text-sm text-gray-400">
                          System is running smoothly with no error logs in the
                          last 200 entries
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="mt-6 space-y-6">
            <SystemResourcesDashboard />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogDashboard />
          </TabsContent>

          {/* Temporarily hidden - will be implemented in future */}
          {/* <TabsContent value="docker-logs" className="space-y-6">
            <DockerLogsViewer />
          </TabsContent> */}
        </Tabs>
      </div>
    </Layout>
  );
};

export default SystemMonitor;

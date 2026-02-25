import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import Layout from "~/components/Layout";
import { Badge } from "~/components/lib/ui/badge";
import { Button } from "~/components/lib/ui/button";
import { cn } from "~/components/lib/utils";
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
  type LucideIcon,
} from "lucide-react";
import {
  healthCheckService,
  type SystemHealthResponse,
  type ServiceHealth,
} from "~/services/healthCheckService";
import { LogDashboard } from "~/components/LogDashboard";
import { SystemResourcesDashboard } from "~/components/SystemResourcesDashboard";
import { DockerLogsViewer } from "~/components/DockerLogsViewer";
import { api } from "~/utils/api";

// ── Tab definitions ───────────────────────────────────────────────────────────
type MonitorTab = "services" | "resources" | "logs";

const monitorTabs: Array<{ id: MonitorTab; label: string; icon: LucideIcon }> =
  [
    { id: "services", label: "Dashboard", icon: Server },
    { id: "resources", label: "Resources", icon: HardDrive },
    { id: "logs", label: "System Logs", icon: FileText },
  ];

// ── Service configuration ─────────────────────────────────────────────────────
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

// ── ServiceStatusCard ─────────────────────────────────────────────────────────
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
  const port = serviceHealth?.port;

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
      <div className="p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-medium text-white">
              {serviceConfig.name}
            </h3>
          </div>
          <Badge className={`${getStatusColor(status)} border`}>
            {getStatusIcon(status)} {status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{serviceConfig.description}</p>
        {message && message !== "Checking..." && (
          <p className="mt-1 text-xs text-gray-500">{message}</p>
        )}
      </div>
      <div className="px-6 pb-6 pt-0">
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
      </div>
    </div>
  );
};

// ── Page Component ────────────────────────────────────────────────────────────
const SystemMonitor: NextPage = () => {
  const { data: sessionData } = useSession();
  const [activeTab, setActiveTab] = useState<MonitorTab>("services");
  const [systemHealth, setSystemHealth] = useState<SystemHealthResponse | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [resourceLoading, setResourceLoading] = useState(false);

  // Fetch recent events and filter for error/warning/critical
  const { data: eventsData, isLoading: errorEventsLoading } =
    api.events.getRecentEvents.useQuery({
      limit: 50,
    });

  // Filter for error, warning, and critical events
  const recentErrorEvents = useMemo(() => {
    if (!eventsData?.events) return [];

    return eventsData.events
      .filter(
        (event) =>
          event.severity === "error" ||
          event.severity === "warning" ||
          event.severity === "critical",
      )
      .slice(0, 3);
  }, [eventsData]);

  // Load resource data for dashboard
  const loadResourceData = async () => {
    try {
      setResourceLoading(true);
      const response = await fetch("/api/monitor/proxy/api/v1/system/resources");
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

  // Get uptime for a specific service from resource data
  const getServiceUptime = (serviceId: string): string | undefined => {
    if (!resourceData?.containers) return undefined;

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
      (c: any) => c.name === containerName,
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
        interval: 5000,
        retries: 3,
        timeout: 5000,
      },
    );

    // Load resource data on mount
    loadResourceData();

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
        err instanceof Error ? err.message : "Failed to refresh health status",
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
      <div className="relative z-20 -mt-14 space-y-4">
        {/* ── Sticky Header ─────────────────────────────────────────────── */}
        <div className="sticky top-2 z-30 -mx-4 border-b border-violet-500/20 bg-gray-900/95 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6">
          <div className="flex items-center gap-3">
            {/* Icon container */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 ring-2 ring-violet-500/20">
              <Activity className="h-6 w-6 text-violet-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Monitor
            </h1>

            {/* Inline tabs */}
            <nav className="ml-1 flex shrink-0 items-center gap-1">
              {monitorTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all",
                    activeTab === id
                      ? "bg-violet-500/20 text-white ring-1 ring-violet-500/30"
                      : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-200",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Refresh button */}
            <div className="flex shrink-0 items-center pr-14">
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Error Display ─────────────────────────────────────────────── */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <span className="font-medium text-red-400">
                Health Check Error
              </span>
            </div>
            <p className="mt-1 text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* ── Dashboard tab ─────────────────────────────────────────────── */}
        {activeTab === "services" && (
          <div className="space-y-6">
            {/* System Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                <div className="p-6">
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
                </div>
              </div>

              <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                <div className="p-6">
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
                </div>
              </div>

              <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                <div className="p-6">
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
                </div>
              </div>
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
                  <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                    <div className="p-6">
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
                                    (c: any) => c.cpu_percent || 0,
                                  ),
                                ).toFixed(1)
                              : "0.0"}
                            %
                          </p>
                          <p className="text-sm text-gray-400">
                            Peak CPU Usage
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Memory Usage */}
                  <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                    <div className="p-6">
                      <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-purple-500/20 p-2">
                          <HardDrive className="h-6 w-6 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {resourceData.summary.total_memory_percent?.toFixed(
                              1,
                            ) || "0.0"}
                            %
                          </p>
                          <p className="text-sm text-gray-400">Memory Usage</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total Disk Usage */}
                  <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                    <div className="p-6">
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
                                    0,
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
                    </div>
                  </div>

                  {/* Memory Usage (MB) */}
                  <div className="rounded-xl border border-gray-700/50 bg-gray-800/40">
                    <div className="p-6">
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
                    </div>
                  </div>
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
                      systemHealth,
                    )}
                    uptime={getServiceUptime(service.id)}
                  />
                ))}
              </div>
            </div>

            {/* Recent Error Events */}
            <div>
              <h2 className="mb-4 text-xl font-medium text-white">
                Recent Issues
              </h2>
              {errorEventsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading events...</span>
                  </div>
                </div>
              ) : recentErrorEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentErrorEvents.map((event, index) => (
                    <div
                      key={event.event_id || index}
                      className="rounded-xl border border-red-500/20 bg-red-500/5"
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="rounded-lg bg-red-500/20 p-2">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex items-center space-x-2">
                              <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-medium text-red-300">
                                {event.severity?.toUpperCase() || "ERROR"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {event.service || "Unknown"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(event.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="break-words text-sm font-medium text-white">
                              {event.title}
                            </p>
                            {event.description && (
                              <p className="mt-1 break-words text-xs text-gray-400">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-green-500/20 bg-green-500/5">
                  <div className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-green-500/20 p-2">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-white">
                          No Recent Issues
                        </p>
                        <p className="text-sm text-gray-400">
                          System is running smoothly with no error, warning, or
                          critical events
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Resources tab ─────────────────────────────────────────────── */}
        {activeTab === "resources" && (
          <div className="space-y-6">
            <SystemResourcesDashboard />
          </div>
        )}

        {/* ── System Logs tab ───────────────────────────────────────────── */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <LogDashboard />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SystemMonitor;

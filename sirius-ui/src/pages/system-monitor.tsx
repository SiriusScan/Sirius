import { type NextPage } from "next";
import { useState, useMemo } from "react";
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
  type ServiceHealth,
} from "~/services/healthCheckService";
import { LogDashboard } from "~/components/LogDashboard";
import { SystemResourcesDashboard } from "~/components/SystemResourcesDashboard";
import { DockerLogsViewer } from "~/components/DockerLogsViewer";
import { api } from "~/utils/api";
import { useSystemResources } from "~/hooks/useSystemResources";
import { formatResourceBytes } from "~/utils/systemResourceObservations";

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
  collectorUptime: string;
  observedAt?: string;
  telemetryStatus: string;
}> = ({ serviceConfig, serviceHealth, collectorUptime, observedAt, telemetryStatus }) => {
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
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Collector uptime</span>
            <span className="text-white">{collectorUptime}</span>
          </div>
          {observedAt && (
            <p className="text-xs text-gray-400">
              {telemetryStatus === "stale" ? "Stale observation" : "Observed"}{" "}
              {new Date(observedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Page Component ────────────────────────────────────────────────────────────
const SystemMonitor: NextPage = () => {
  const [activeTab, setActiveTab] = useState<MonitorTab>("services");
  const health = api.system.health.useQuery(undefined, { refetchInterval: 5000 });
  const systemHealth = health.isError ? null : health.data ?? null;
  const error = health.isError ? health.error.message : null;
  const isRefreshing = health.isFetching;
  const {
    data: resourceData,
    freshCount,
    partial,
    peakCPU,
    peakDisk,
    observedMemory,
    loading: resourceLoading,
    refetch: refetchResources,
  } = useSystemResources(5000, activeTab === "services");

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

  const handleRefresh = async () => {
    await Promise.all([
      health.refetch(),
      activeTab === "services" ? refetchResources() : Promise.resolve(),
    ]);
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
              {resourceData?.summary.latest_observed_at && (
                <p className="mb-3 text-xs text-gray-400">
                  Latest observation {new Date(resourceData.summary.latest_observed_at).toLocaleString()}
                  {partial && " · Partial coverage"}
                </p>
              )}
              {resourceLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span>Loading resource data...</span>
                  </div>
                </div>
              ) : freshCount && resourceData ? (
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
                            {peakCPU === undefined ? "—" : `${peakCPU.toFixed(1)}%`}
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
                            {freshCount}/{resourceData.summary.total_containers}
                          </p>
                          <p className="text-sm text-gray-400">Fresh collectors</p>
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
                            {peakDisk === undefined ? "—" : `${peakDisk.toFixed(1)}%`}
                          </p>
                          <p className="text-sm text-gray-400">
                            Peak Disk Usage
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
                            {observedMemory === undefined ? "—" : formatResourceBytes(observedMemory)}
                          </p>
                          <p className="text-sm text-gray-400">Observed memory</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-400">Current resource telemetry is unavailable.</p>
                    <Button
                      onClick={() => void refetchResources()}
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
                {serviceConfig.map((service) => {
                  const observation = resourceData?.containers.find((row) => row.name === service.id);
                  return (
                    <ServiceStatusCard
                      key={service.id}
                      serviceConfig={service}
                      serviceHealth={healthCheckService.getServiceStatus(service.id, systemHealth)}
                      collectorUptime={observation?.collector_uptime_seconds === undefined ? "Unavailable" : observation.uptime}
                      observedAt={observation?.observed_at}
                      telemetryStatus={observation?.telemetry_status ?? "unavailable"}
                    />
                  );
                })}
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

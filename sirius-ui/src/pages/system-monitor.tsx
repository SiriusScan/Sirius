import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Layout from "~/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/lib/ui/card";
import { Badge } from "~/components/lib/ui/badge";
import { Button } from "~/components/lib/ui/button";
import { RefreshCw, Server, Database, MessageSquare, Zap, Globe, AlertCircle } from "lucide-react";

// Mock data for development
const mockServices = [
  {
    id: "sirius-ui",
    name: "Sirius UI",
    status: "up",
    lastChecked: new Date(),
    port: 3000,
    icon: Globe,
    description: "Next.js frontend application"
  },
  {
    id: "sirius-api",
    name: "Sirius API",
    status: "up",
    lastChecked: new Date(),
    port: 9001,
    icon: Server,
    description: "Go REST API backend"
  },
  {
    id: "sirius-engine",
    name: "Sirius Engine",
    status: "up",
    lastChecked: new Date(),
    port: 5174,
    icon: Zap,
    description: "Core processing engine"
  },
  {
    id: "sirius-postgres",
    name: "PostgreSQL",
    status: "up",
    lastChecked: new Date(),
    port: 5432,
    icon: Database,
    description: "Primary database"
  },
  {
    id: "sirius-valkey",
    name: "Valkey",
    status: "up",
    lastChecked: new Date(),
    port: 6379,
    icon: Database,
    description: "Redis-compatible cache"
  },
  {
    id: "sirius-rabbitmq",
    name: "RabbitMQ",
    status: "down",
    lastChecked: new Date(),
    port: 5672,
    icon: MessageSquare,
    description: "Message broker"
  }
];

const mockLogs = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    service: "sirius-api",
    level: "info",
    message: "Health check endpoint accessed"
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    service: "sirius-engine",
    level: "warn",
    message: "High memory usage detected"
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    service: "sirius-postgres",
    level: "error",
    message: "Connection timeout to database"
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 1000 * 30),
    service: "sirius-ui",
    level: "info",
    message: "User logged in successfully"
  }
];

type ServiceStatus = "up" | "down" | "loading" | "error";

interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  lastChecked: Date;
  port: number;
  icon: any;
  description: string;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  service: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
}

const ServiceStatusCard: React.FC<{ service: Service }> = ({ service }) => {
  const Icon = service.icon;
  
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

  return (
    <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-5 w-5 text-violet-400" />
            <CardTitle className="text-lg font-medium text-white">
              {service.name}
            </CardTitle>
          </div>
          <Badge className={`${getStatusColor(service.status)} border`}>
            {getStatusIcon(service.status)} {service.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">{service.description}</p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Port:</span>
            <span className="text-white">{service.port}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Last Checked:</span>
            <span className="text-white">
              {service.lastChecked.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const LogViewer: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "warn":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "debug":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-white flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-violet-400" />
          <span>System Logs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start space-x-3 p-3 rounded-lg bg-gray-800/20 border border-gray-700/30"
            >
              <Badge className={`${getLevelColor(log.level)} border text-xs`}>
                {log.level.toUpperCase()}
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-400">{log.service}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    {log.timestamp.toLocaleString()}
                  </span>
                </div>
                <p className="text-white text-sm mt-1">{log.message}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SystemMonitor: NextPage = () => {
  const { data: sessionData } = useSession();
  const [services, setServices] = useState<Service[]>(mockServices);
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update mock data with current time
    setServices(prev => prev.map(service => ({
      ...service,
      lastChecked: new Date()
    })));
    
    setLogs(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        service: "system-monitor",
        level: "info",
        message: "System status refreshed"
      }
    ]);
    
    setIsRefreshing(false);
  };

  const upServices = services.filter(s => s.status === "up").length;
  const totalServices = services.length;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extralight text-white">System Monitor</h1>
            <p className="text-gray-400 mt-1">
              Monitor system health and view real-time logs
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-violet-600/20 text-white hover:bg-violet-600/30 border border-violet-500/30"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Server className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{upServices}/{totalServices}</p>
                  <p className="text-sm text-gray-400">Services Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{logs.length}</p>
                  <p className="text-sm text-gray-400">Total Logs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-paper border-violet-700/10 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {logs.filter(l => l.level === 'error').length}
                  </p>
                  <p className="text-sm text-gray-400">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Status Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-white mb-4">Service Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceStatusCard key={service.id} service={service} />
            ))}
          </div>
        </div>

        {/* System Logs */}
        <div>
          <h2 className="text-xl font-medium text-white mb-4">Recent Logs</h2>
          <LogViewer logs={logs} />
        </div>
      </div>
    </Layout>
  );
};

export default SystemMonitor;

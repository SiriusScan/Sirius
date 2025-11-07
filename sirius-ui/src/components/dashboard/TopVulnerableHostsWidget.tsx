import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { Server } from "lucide-react";

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false }
);

interface TopVulnerableHostsWidgetProps {
  className?: string;
  height?: number;
  limit?: number;
}

interface HostVulnerabilityData {
  hostId: string;
  hostname?: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  informational: number;
}

const TopVulnerableHostsWidgetComponent: React.FC<
  TopVulnerableHostsWidgetProps
> = ({ className = "", height = 280, limit = 5 }) => {
  const router = useRouter();

  // Fetch host data
  const { data: hosts, isLoading } = api.host.getAllHosts.useQuery();
  const { data: vulnData } = api.vulnerability.getAllVulnerabilities.useQuery();

  // Static mock data for top vulnerable hosts
  const STATIC_MOCK_HOSTS: HostVulnerabilityData[] = [
    {
      hostId: "192.168.1.10",
      hostname: "web-server-01",
      total: 47,
      critical: 5,
      high: 12,
      medium: 18,
      low: 10,
      informational: 2,
    },
    {
      hostId: "192.168.1.25",
      hostname: "db-primary",
      total: 38,
      critical: 3,
      high: 9,
      medium: 15,
      low: 9,
      informational: 2,
    },
    {
      hostId: "192.168.1.50",
      hostname: "app-server-02",
      total: 32,
      critical: 2,
      high: 8,
      medium: 12,
      low: 8,
      informational: 2,
    },
    {
      hostId: "192.168.1.100",
      hostname: "mail-server",
      total: 28,
      critical: 1,
      high: 6,
      medium: 11,
      low: 8,
      informational: 2,
    },
    {
      hostId: "192.168.1.150",
      hostname: "file-server",
      total: 22,
      critical: 1,
      high: 4,
      medium: 9,
      low: 6,
      informational: 2,
    },
  ];

  // Use static mock data or limit based on prop
  const topHosts = useMemo<HostVulnerabilityData[]>(() => {
    return STATIC_MOCK_HOSTS.slice(0, limit);
  }, [limit]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return topHosts.map((host) => ({
      host: host.hostname || host.hostId,
      hostId: host.hostId,
      Critical: host.critical,
      High: host.high,
      Medium: host.medium,
      Low: host.low,
      Info: host.informational,
    }));
  }, [topHosts]);

  const theme = {
    text: {
      fontSize: 11,
      fill: "currentColor",
    },
    axis: {
      domain: {
        line: {
          stroke: "currentColor",
          strokeWidth: 1,
          strokeOpacity: 0.2,
        },
      },
      ticks: {
        line: {
          stroke: "currentColor",
          strokeWidth: 1,
          strokeOpacity: 0.2,
        },
        text: {
          fontSize: 10,
          fill: "currentColor",
          opacity: 0.7,
        },
      },
    },
    grid: {
      line: {
        stroke: "currentColor",
        strokeWidth: 1,
        strokeOpacity: 0.1,
      },
    },
    legends: {
      text: {
        fontSize: 10,
        fill: "currentColor",
      },
    },
    tooltip: {
      container: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        fontSize: 12,
        borderRadius: "6px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        border: "1px solid hsl(var(--border))",
      },
    },
  };

  if (isLoading) {
    return <TopVulnerableHostsWidgetSkeleton height={height} />;
  }

  if (topHosts.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ height: `${height}px` }}
      >
        <Server className="mb-2 h-12 w-12 text-muted-foreground opacity-50" />
        <p className="text-sm text-muted-foreground">
          No vulnerable hosts found
        </p>
        <p className="text-xs text-muted-foreground">
          Run a scan to discover vulnerabilities
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="mb-2 text-xs text-muted-foreground">
        Top {topHosts.length} most vulnerable{" "}
        {topHosts.length === 1 ? "host" : "hosts"}
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveBar
          data={chartData}
          theme={theme}
          keys={["Critical", "High", "Medium", "Low", "Info"]}
          indexBy="host"
          layout="horizontal"
          margin={{ top: 10, right: 100, bottom: 30, left: 120 }}
          padding={0.3}
          valueScale={{ type: "linear" }}
          indexScale={{ type: "band", round: true }}
          colors={["#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb"]}
          borderRadius={4}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Vulnerabilities",
            legendPosition: "middle",
            legendOffset: 25,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
          }}
          enableLabel={false}
          enableGridY={false}
          labelSkipWidth={12}
          labelSkipHeight={12}
          legends={[
            {
              dataFrom: "keys",
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 90,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 80,
              itemHeight: 16,
              itemDirection: "left-to-right",
              itemOpacity: 0.85,
              symbolSize: 10,
              effects: [
                {
                  on: "hover",
                  style: {
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
          onClick={(node) => {
            const hostId = chartData.find(
              (d) => d.host === node.indexValue
            )?.hostId;
            if (hostId) {
              router.push(`/host/${hostId}`);
            }
          }}
          tooltip={({ id, value, indexValue, data }) => (
            <div className="rounded-md border bg-background p-2 shadow-lg">
              <div className="font-medium">{indexValue}</div>
              <div className="text-sm">
                <span className="font-medium">{id}:</span> {value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Click to view host details
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

// Memoized export to prevent unnecessary re-renders
export const TopVulnerableHostsWidget = React.memo(
  TopVulnerableHostsWidgetComponent
);

// Loading skeleton
export const TopVulnerableHostsWidgetSkeleton: React.FC<{
  height?: number;
}> = ({ height = 280 }) => {
  return (
    <div className="flex flex-col space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="w-full" style={{ height: `${height}px` }} />
    </div>
  );
};

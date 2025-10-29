import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/lib/ui/card";
import { Button } from "~/components/lib/ui/button";
import { RefreshCw, Settings, Maximize2, AlertCircle } from "lucide-react";
import { Skeleton } from "~/components/lib/ui/skeleton";

interface DashboardCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onSettings?: () => void;
  onExpand?: () => void;
  refreshing?: boolean;
  className?: string;
  actions?: ReactNode;
  footer?: ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  children,
  loading = false,
  error = null,
  onRefresh,
  onSettings,
  onExpand,
  refreshing = false,
  className = "",
  actions,
  footer,
}) => {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          {icon}
          <span>{title}</span>
        </CardTitle>

        <div className="flex items-center gap-1">
          {/* Custom actions */}
          {actions}

          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          )}

          {/* Settings button */}
          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onSettings}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Expand button */}
          {onExpand && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={onExpand}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {/* Error state */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {/* Content */}
        {!loading && !error && children}

        {/* Footer */}
        {footer && <div className="mt-4 border-t pt-3">{footer}</div>}
      </CardContent>
    </Card>
  );
};

// Pre-configured card variants for common use cases
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
  loading?: boolean;
}> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  className = "",
  loading = false,
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          {icon && <Skeleton className="h-4 w-4" />}
        </CardHeader>
        <CardContent>
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(subtitle || trendValue) && (
          <div className="flex items-center gap-2 text-xs">
            {subtitle && (
              <span className="text-muted-foreground">{subtitle}</span>
            )}
            {trendValue && (
              <span className={getTrendColor()}>
                {trend === "up" && "↑"}
                {trend === "down" && "↓"}
                {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

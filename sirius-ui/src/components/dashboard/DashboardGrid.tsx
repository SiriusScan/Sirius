import React, { ReactNode } from "react";
import { cn } from "~/components/lib/utils";

interface DashboardGridProps {
  children: ReactNode;
  className?: string;
}

interface DashboardGridItemProps {
  children: ReactNode;
  size?: "small" | "medium" | "large" | "full";
  className?: string;
}

/**
 * DashboardGrid - Responsive grid layout for dashboard widgets
 *
 * Breakpoints:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 */
export const DashboardGrid: React.FC<DashboardGridProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * DashboardGridItem - Grid item with size variants
 *
 * Sizes:
 * - small: 1x1 (default)
 * - medium: 2x1 (spans 2 columns on desktop)
 * - large: 2x2 (spans 2 columns and rows on desktop)
 * - full: Full width
 */
export const DashboardGridItem: React.FC<DashboardGridItemProps> = ({
  children,
  size = "small",
  className = "",
}) => {
  const sizeClasses = {
    small: "", // Default 1x1
    medium: "md:col-span-2", // 2 columns wide
    large: "md:col-span-2 md:row-span-2", // 2x2 grid
    full: "md:col-span-2 lg:col-span-3", // Full width
  };

  return <div className={cn(sizeClasses[size], className)}>{children}</div>;
};

/**
 * DashboardSection - Section wrapper for logical grouping
 */
export const DashboardSection: React.FC<{
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}> = ({ title, description, children, className = "" }) => {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

import React from "react";
import { cn } from "~/components/lib/utils";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface DashboardHeroCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    direction: "up" | "down";
  };
  cta?: {
    label: string;
    href: string;
  };
  variant?: "default" | "critical" | "success";
  className?: string;
}

export const DashboardHeroCard: React.FC<DashboardHeroCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  cta,
  variant = "default",
  className,
}) => {
  const variantStyles = {
    default: "border-violet-500/20 bg-gray-900/50",
    critical: "border-red-500/30 bg-red-950/20 shadow-red-500/10",
    success: "border-green-500/30 bg-green-950/20 shadow-green-500/10",
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border p-6 backdrop-blur-sm transition-all duration-300 hover:border-opacity-40 hover:shadow-lg",
        variantStyles[variant],
        className
      )}
    >
      {/* Glow effect on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          variant === "critical"
            ? "bg-gradient-to-br from-red-500/5 to-transparent"
            : variant === "success"
            ? "bg-gradient-to-br from-green-500/5 to-transparent"
            : "bg-gradient-to-br from-violet-500/5 to-transparent"
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <span
            className={cn(
              "text-sm font-medium uppercase tracking-wide",
              variant === "critical"
                ? "text-red-400"
                : variant === "success"
                ? "text-green-400"
                : "text-violet-300"
            )}
          >
            {Icon && <Icon className="mr-2 inline-block h-4 w-4" />}
            {title}
          </span>
        </div>

        {/* Value */}
        <div className="mb-2">
          <span
            className={cn(
              "text-5xl font-bold",
              variant === "critical"
                ? "text-red-300"
                : variant === "success"
                ? "text-green-300"
                : "text-white"
            )}
          >
            {value}
          </span>
        </div>

        {/* Subtitle or Trend */}
        {(subtitle || trend) && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
            {trend && (
              <span
                className={cn(
                  "flex items-center",
                  trend.direction === "up"
                    ? "text-orange-400"
                    : "text-green-400"
                )}
              >
                {trend.direction === "up" ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}

        {/* CTA */}
        {cta && (
          <Link
            href={cta.href}
            className={cn(
              "inline-flex items-center text-sm font-medium transition-colors",
              variant === "critical"
                ? "text-red-400 hover:text-red-300"
                : variant === "success"
                ? "text-green-400 hover:text-green-300"
                : "text-violet-400 hover:text-violet-300"
            )}
          >
            {cta.label} →
          </Link>
        )}
      </div>
    </div>
  );
};

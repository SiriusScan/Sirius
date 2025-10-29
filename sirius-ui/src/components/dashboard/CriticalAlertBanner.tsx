import React from "react";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "~/components/lib/utils";

interface CriticalAlertBannerProps {
  criticalCount: number;
  className?: string;
}

export const CriticalAlertBanner: React.FC<CriticalAlertBannerProps> = ({
  criticalCount,
  className,
}) => {
  if (criticalCount === 0) return null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border-2 border-red-500/50 bg-gradient-to-r from-red-950/40 via-red-900/30 to-red-950/40 p-6 shadow-lg shadow-red-500/20 backdrop-blur-sm",
        "animate-pulse-slow", // We'll define this animation
        className
      )}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-50 transition-transform duration-1000 group-hover:translate-x-full" />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 ring-2 ring-red-500/50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-300">
              ⚠️ CRITICAL SECURITY ISSUES DETECTED
            </h3>
            <p className="text-sm text-red-400/80">
              {criticalCount} critical{" "}
              {criticalCount === 1 ? "vulnerability" : "vulnerabilities"}{" "}
              require immediate attention
            </p>
          </div>
        </div>

        <Link
          href="/vulnerabilities?severity=CRITICAL"
          className="rounded-lg bg-red-500/20 px-6 py-3 text-sm font-semibold text-red-300 ring-1 ring-red-500/50 transition-all hover:bg-red-500/30 hover:ring-red-500"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
};

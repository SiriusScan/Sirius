import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Badge } from "~/components/lib/ui/badge";
import type { Severity } from "~/types/agentTemplateTypes";
import { AlertTriangle, AlertCircle, Info, Zap, Bug } from "lucide-react";
import { cn } from "~/components/lib/utils";

interface SeveritySelectorProps {
  selected: Severity;
  onChange: (severity: Severity) => void;
  label?: string;
  helperText?: string;
}

const severityConfig: Record<
  Severity,
  {
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }
> = {
  critical: {
    label: "Critical",
    icon: <Zap className="h-4 w-4" />,
    colorClass: "text-red-400",
    bgClass: "bg-[#8c1c1c]/20",
    borderClass: "border-[#8c1c1c]/50",
  },
  high: {
    label: "High",
    icon: <AlertTriangle className="h-4 w-4" />,
    colorClass: "text-red-500",
    bgClass: "bg-red-600/20",
    borderClass: "border-red-600/50",
  },
  medium: {
    label: "Medium",
    icon: <AlertCircle className="h-4 w-4" />,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/20",
    borderClass: "border-amber-500/50",
  },
  low: {
    label: "Low",
    icon: <Bug className="h-4 w-4" />,
    colorClass: "text-blue-400",
    bgClass: "bg-blue-500/20",
    borderClass: "border-blue-500/50",
  },
  info: {
    label: "Info",
    icon: <Info className="h-4 w-4" />,
    colorClass: "text-gray-400",
    bgClass: "bg-gray-500/20",
    borderClass: "border-gray-500/50",
  },
};

export const SeveritySelector: React.FC<SeveritySelectorProps> = ({
  selected,
  onChange,
  label = "Severity Level",
  helperText = "Select the severity level for this vulnerability",
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-200">{label}</Label>
      )}
      {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(Object.keys(severityConfig) as Severity[]).map((severity) => {
          const config = severityConfig[severity];
          const isSelected = selected === severity;

          return (
            <button
              key={severity}
              type="button"
              onClick={() => onChange(severity)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
                "hover:scale-105 hover:shadow-lg",
                isSelected
                  ? `${config.borderClass} ${config.bgClass} ${config.colorClass}`
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
              )}
            >
              {config.icon}
              <span className="text-xs font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


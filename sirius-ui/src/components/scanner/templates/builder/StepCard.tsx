import React from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import {
  Edit,
  Trash2,
  Monitor,
  Apple,
  HardDrive,
  FileCheck,
  FileSearch,
  Terminal,
} from "lucide-react";
import type { DetectionStepFormData } from "~/types/templateBuilderTypes";
import { cn } from "~/components/lib/utils";

// Static icon mapping - created once, never changes
const PLATFORM_ICONS = {
  linux: <Monitor className="h-3 w-3" />,
  darwin: <Apple className="h-3 w-3" />,
  windows: <HardDrive className="h-3 w-3" />,
} as const;

// Static step type configuration - created once, never changes
const STEP_TYPE_CONFIG = {
  file_hash: {
    label: "File Hash",
    icon: <FileCheck className="h-4 w-4" />,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  file_content: {
    label: "File Content",
    icon: <FileSearch className="h-4 w-4" />,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  version_cmd: {
    label: "Version Command",
    icon: <Terminal className="h-4 w-4" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
} as const;

interface StepCardProps {
  step: DetectionStepFormData;
  index: number;
  onEdit: (stepId: string) => void;
  onDelete: (stepId: string) => void;
}

const getStepSummary = (step: DetectionStepFormData): string => {
  switch (step.type) {
    case "file_hash":
      return `Check hash of ${step.path}`;
    case "file_content":
      return `Search ${step.path} for pattern`;
    case "version_cmd":
      return `Run: ${step.command.join(" ")}`;
    default:
      return "Unknown step type";
  }
};

export const StepCard = React.memo<StepCardProps>(
  ({ step, index, onEdit, onDelete }) => {
    const config = STEP_TYPE_CONFIG[step.type];
    const weightPercentage = step.weight * 100;

    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4 transition-colors hover:bg-gray-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">
                Step {index + 1}
              </span>
              <Badge className={cn("text-xs", config.color, config.bgColor)}>
                {config.icon}
                <span className="ml-1">{config.label}</span>
              </Badge>
            </div>

            <p className="mt-1 text-sm text-white">{getStepSummary(step)}</p>

            <div className="mt-2 flex items-center gap-3">
              {/* Platforms */}
              <div className="flex items-center gap-1 text-gray-400">
                {step.platforms.map((platform) => (
                  <div key={platform} title={platform}>
                    {PLATFORM_ICONS[platform]}
                  </div>
                ))}
                {step.platforms.length === 0 && (
                  <span className="text-xs">All platforms</span>
                )}
              </div>

              {/* Weight */}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Weight:</span>
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-700">
                    <div
                      className="h-full bg-violet-500"
                      style={{ width: `${weightPercentage}%` }}
                    />
                  </div>
                  <span className="font-mono text-xs text-gray-400">
                    {step.weight.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(step.id)}
              className="h-8 border-gray-700"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(step.id)}
              className="h-8 border-gray-700 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
);

StepCard.displayName = "StepCard";

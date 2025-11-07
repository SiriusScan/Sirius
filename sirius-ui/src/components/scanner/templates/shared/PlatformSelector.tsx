import React from "react";
import { Checkbox } from "~/components/lib/ui/checkbox";
import { Label } from "~/components/lib/ui/label";
import type { Platform } from "~/types/agentTemplateTypes";
import { Monitor, Apple, HardDrive } from "lucide-react";

interface PlatformSelectorProps {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
  label?: string;
  helperText?: string;
}

const platformConfig: Record<
  Platform,
  { label: string; icon: React.ReactNode }
> = {
  linux: { label: "Linux", icon: <Monitor className="h-4 w-4" /> },
  darwin: { label: "macOS", icon: <Apple className="h-4 w-4" /> },
  windows: { label: "Windows", icon: <HardDrive className="h-4 w-4" /> },
};

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selected,
  onChange,
  label = "Target Platforms",
  helperText = "Select which operating systems this step applies to",
}) => {
  const handleToggle = (platform: Platform) => {
    if (selected.includes(platform)) {
      onChange(selected.filter((p) => p !== platform));
    } else {
      onChange([...selected, platform]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-200">{label}</Label>
      )}
      {helperText && <p className="text-xs text-gray-400">{helperText}</p>}
      <div className="flex flex-wrap gap-4">
        {(Object.keys(platformConfig) as Platform[]).map((platform) => {
          const config = platformConfig[platform];
          const isSelected = selected.includes(platform);

          return (
            <div
              key={platform}
              className="flex items-center space-x-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 transition-colors hover:border-violet-500/50"
            >
              <Checkbox
                id={`platform-${platform}`}
                checked={isSelected}
                onCheckedChange={() => handleToggle(platform)}
                className="data-[state=checked]:border-violet-600 data-[state=checked]:bg-violet-600"
              />
              <Label
                htmlFor={`platform-${platform}`}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-300"
              >
                {config.icon}
                <span>{config.label}</span>
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};


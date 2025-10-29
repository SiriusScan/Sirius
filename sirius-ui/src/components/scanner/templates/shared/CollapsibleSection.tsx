import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "~/components/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  children,
  defaultOpen = true,
  icon,
  badge,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800/50 transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-800"
      >
        <div className="flex items-center gap-3">
          <div className="text-violet-400">
            {isOpen ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </div>
          {icon && <div className="text-gray-400">{icon}</div>}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-white">{title}</h3>
              {badge && <div>{badge}</div>}
            </div>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </button>

      {isOpen && <div className="border-t border-gray-700 p-4">{children}</div>}
    </div>
  );
};

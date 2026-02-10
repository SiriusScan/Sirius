/**
 * HostTabs — Tab navigation for the host detail page.
 *
 * Sits in the space-y-6 flow below the sticky header.
 * Uses the same border/violet accent styling as the rest of v4.
 */

import React from "react";
import { cn } from "~/components/lib/utils";
import type { TabType } from "./types";

interface HostTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  vulnerabilityCount?: number;
  portCount?: number;
}

const tabs: Array<{
  id: TabType;
  label: string;
  countKey?: "vulnerabilityCount" | "portCount";
}> = [
  { id: "overview", label: "Overview" },
  { id: "vulnerabilities", label: "Vulnerabilities", countKey: "vulnerabilityCount" },
  { id: "system", label: "System" },
  { id: "network", label: "Network", countKey: "portCount" },
  { id: "history", label: "History" },
];

export const HostTabs: React.FC<HostTabsProps> = ({
  activeTab,
  onTabChange,
  vulnerabilityCount,
  portCount,
}) => {
  const counts: Record<string, number | undefined> = {
    vulnerabilityCount,
    portCount,
  };

  return (
    <div className="border-b border-violet-500/10">
      <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
        {tabs.map((tab) => {
          const count = tab.countKey ? counts[tab.countKey] : undefined;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-gray-500 hover:border-violet-500/20 hover:text-gray-300",
              )}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none",
                    isActive
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-gray-800 text-gray-500",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default HostTabs;

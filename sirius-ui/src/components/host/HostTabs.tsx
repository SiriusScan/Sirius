import React from "react";
import { cn } from "~/components/lib/utils";

type TabType =
  | "overview"
  | "vulnerabilities"
  | "system"
  | "network"
  | "history";

interface HostTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  vulnerabilityCount: number;
}

export const HostTabs: React.FC<HostTabsProps> = ({
  activeTab,
  onTabChange,
  vulnerabilityCount,
}) => {
  const tabs = [
    { id: "overview", label: "Overview" },
    {
      id: "vulnerabilities",
      label: "Vulnerabilities",
      count: vulnerabilityCount,
    },
    { id: "system", label: "System Information" },
    { id: "network", label: "Network" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={cn(
              "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
              activeTab === tab.id
                ? "border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-300"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  activeTab === tab.id
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default HostTabs;

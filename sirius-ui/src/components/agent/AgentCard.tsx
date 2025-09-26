import React, { useCallback } from "react";
import { useRouter } from "next/router";
import { cn } from "~/components/lib/utils";
import type { AgentWithHost } from "~/server/api/routers/agent";
import { ExternalLinkIcon } from "lucide-react";

// Use the proper agent type
type Agent = AgentWithHost;

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onClick: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onClick,
}) => {
  const router = useRouter();
  const isOnline = agent.status?.toLowerCase() === "online";

  // Use real host data if available, fallback to basic info
  const displayInfo = {
    ip: agent.host?.ip || "No IP available",
    os:
      agent.host?.os && agent.host?.osVersion
        ? `${agent.host.os} ${agent.host.osVersion}`
        : agent.host?.os || "Unknown OS",
  };

  const handleHostNavigation = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent triggering the agent selection

      // Ensure we're on the client side and have a valid IP
      if (typeof window !== "undefined" && agent.host?.ip) {
        router.push(`/host/${agent.host.ip}`);
      }
    },
    [router, agent.host?.ip]
  );

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-md border p-3 text-left transition-all duration-150 hover:shadow-sm",
        isSelected
          ? "border-violet-500 bg-violet-50 shadow-sm dark:border-violet-400 dark:bg-violet-900/20"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div
          className={cn(
            "h-2.5 w-2.5 flex-shrink-0 rounded-full",
            isOnline ? "bg-green-500" : "bg-red-500"
          )}
          title={isOnline ? "Online" : "Offline"}
        />

        {/* Agent information */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
            {agent.host?.hostname || agent.name || agent.id}
          </div>
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
            {displayInfo.ip} • {displayInfo.os}
          </div>
        </div>

        {/* Host details navigation icon */}
        <button
          onClick={handleHostNavigation}
          disabled={!agent.host?.ip}
          className={cn(
            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded transition-colors",
            agent.host?.ip
              ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              : "cursor-not-allowed text-gray-300 dark:text-gray-600"
          )}
          title={
            agent.host?.ip
              ? `View host details for ${displayInfo.ip}`
              : "No host IP available"
          }
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </button>
  );
};

import React from "react";
import { cn } from "~/components/lib/utils";
import type { AgentWithHost } from "~/server/api/routers/agent";

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
  const isOnline = agent.status?.toLowerCase() === "online";
  
  // Use real host data if available, fallback to basic info
  const displayInfo = {
    ip: agent.host?.ip || "No IP available",
    os: agent.host?.os && agent.host?.osVersion 
      ? `${agent.host.os} ${agent.host.osVersion}` 
      : agent.host?.os || "Unknown OS",
  };

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
            "h-2.5 w-2.5 rounded-full flex-shrink-0",
            isOnline ? "bg-green-500" : "bg-red-500"
          )}
          title={isOnline ? "Online" : "Offline"}
        />
        
        {/* Agent information */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {agent.host?.hostname || agent.name || agent.id}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {displayInfo.ip} • {displayInfo.os}
          </div>
        </div>
      </div>
    </button>
  );
}; 
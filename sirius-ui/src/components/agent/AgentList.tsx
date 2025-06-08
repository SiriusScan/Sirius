import React, { useState, useMemo } from "react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import { Input } from "~/components/lib/ui/input";
import { AgentCard } from "./AgentCard";
import type { AgentWithHost } from "~/server/api/routers/agent";
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger,
//   ContextMenuSeparator,
// } from "~/components/lib/ui/context-menu"; // Reverted path
// import { toast } from "sonner";

// Use the proper type from the agent router
type Agent = AgentWithHost;

interface AgentListProps {
  onAgentSelect: (agentId: string) => void; // Callback when an agent is selected
  selectedAgentId?: string | null; // Optional prop to highlight the selected agent
}

export const AgentList: React.FC<AgentListProps> = ({
  onAgentSelect,
  selectedAgentId,
}) => {
  const {
    data: agents,
    isLoading,
    error,
  } = api.agent.listAgentsWithHosts.useQuery(undefined, {
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectAgent = (agentId: string) => {
    onAgentSelect(agentId);
  };

  // Helper to copy text
  // const copyToClipboard = (text: string, label: string) => {
  //   navigator.clipboard
  //     .writeText(text)
  //     .then(() => {
  //       console.log(`${label} copied to clipboard:`, text);
  //       toast.success(`${label} copied!`); // Use toast for feedback
  //     })
  //     .catch((err) => {
  //       console.error(`Failed to copy ${label}:`, err);
  //       toast.error(`Failed to copy ${label}`);
  //     });
  // };

  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    if (!searchTerm) return agents;

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return agents.filter(
      (agent) =>
        agent.id.toLowerCase().includes(lowerCaseSearchTerm) ||
        agent.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        agent.host?.hostname?.toLowerCase().includes(lowerCaseSearchTerm) ||
        agent.host?.ip?.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [agents, searchTerm]);

  if (isLoading && !agents) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        Loading agents...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-red-600 dark:text-red-400">
        Error loading agents: {error.message}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
        No agents found.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Search Input - Only show for 5+ agents */}
      {agents && agents.length >= 5 && (
        <div className="border-b border-gray-200 p-2 dark:border-gray-700">
          <Input
            type="text"
            placeholder="Filter agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 text-sm" // Make input slightly smaller
          />
        </div>
      )}

      {/* Agent List (Scrollable) */}
      <div className="flex-grow space-y-3 overflow-y-auto p-1">
        {/* Display message if loading takes time but we have stale data */}
        {isLoading && agents && (
          <div className="p-2 text-center text-xs text-gray-400">Updating...</div>
        )}
        {/* Display message if no agents match filter */}
        {!isLoading && filteredAgents.length === 0 && (
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? "No matching agents" : "No agents available"}
          </div>
        )}
        {/* Map over filtered agents using AgentCard */}
        {filteredAgents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;

          return (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={isSelected}
              onClick={() => handleSelectAgent(agent.id)}
            />
          );
        })}
      </div>
      {/* Optional Footer/Actions */}
      {/* <div className="border-t border-gray-200 p-2 dark:border-gray-700">
        <button className="w-full text-center text-sm text-violet-600 hover:underline dark:text-violet-400">
          Refresh List
        </button>
      </div> */}
    </div>
  );
};

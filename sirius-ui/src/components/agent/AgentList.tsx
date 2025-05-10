import React, { useState, useMemo } from "react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import { Input } from "~/components/lib/ui/input";
// import {
//   ContextMenu,
//   ContextMenuContent,
//   ContextMenuItem,
//   ContextMenuTrigger,
//   ContextMenuSeparator,
// } from "~/components/lib/ui/context-menu"; // Reverted path
// import { toast } from "sonner";

// Define the shape of an agent object based on listAgents query
// Assuming listAgents returns something like: { id: string, name?: string, status?: string, lastSeen?: string }
// We might need to refine this based on the actual API response type.
type Agent = {
  id: string;
  name?: string | null;
  status?: string | null;
  lastSeen?: string | null; // Assuming string for now, might be Date
};

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
  } = api.terminal.listAgents.useQuery(undefined, {
    refetchInterval: 10000, // Example: Poll every 10 seconds
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
        agent.name?.toLowerCase().includes(lowerCaseSearchTerm)
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
      {/* Search Input */}
      <div className="border-b border-gray-200 p-2 dark:border-gray-700">
        <Input
          type="text"
          placeholder="Filter agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 text-sm" // Make input slightly smaller
        />
      </div>

      {/* Agent List (Scrollable) */}
      <ul className="flex-grow space-y-1 overflow-y-auto p-2">
        {/* Display message if loading takes time but we have stale data */}
        {isLoading && agents && (
          <li className="p-2 text-center text-xs text-gray-400">Updating...</li>
        )}
        {/* Display message if no agents match filter */}
        {!isLoading && filteredAgents.length === 0 && (
          <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? "No matching agents" : "No agents available"}
          </li>
        )}
        {/* Map over filtered agents */}
        {filteredAgents.map((agent) => {
          const isSelected = agent.id === selectedAgentId;
          const isOnline = agent.status?.toLowerCase() === "online";
          // TODO: Improve status parsing/handling if needed

          return (
            <li key={agent.id}>
              {/* <ContextMenu> */}
              {/* <ContextMenuTrigger asChild> */}
              <button
                // Add onClick back to the button directly
                onClick={() => handleSelectAgent(agent.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors duration-150 ease-in-out",
                  isSelected
                    ? "bg-violet-100 text-violet-900 dark:bg-violet-900/30 dark:text-violet-100"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                )}
                aria-current={isSelected ? "page" : undefined}
              >
                {/* Status Indicator */}
                <span
                  className={cn(
                    "h-2.5 w-2.5 flex-shrink-0 rounded-full",
                    isOnline ? "bg-green-500" : "bg-red-500"
                  )}
                  title={isOnline ? "Online" : "Offline"}
                />

                {/* Agent Name/ID */}
                <span className="flex-grow truncate font-medium">
                  {agent.name || `Agent ${agent.id.substring(0, 8)}...`}
                </span>
              </button>
              {/* </ContextMenuTrigger> */}
              {/* <ContextMenuContent className="w-48">
                  <ContextMenuItem onClick={() => handleSelectAgent(agent.id)}>
                    Connect
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => copyToClipboard(agent.id, "Agent ID")}
                  >
                    Copy Agent ID
                  </ContextMenuItem>
                </ContextMenuContent> */}
              {/* </ContextMenu> */}
            </li>
          );
        })}
      </ul>
      {/* Optional Footer/Actions */}
      {/* <div className="border-t border-gray-200 p-2 dark:border-gray-700">
        <button className="w-full text-center text-sm text-violet-600 hover:underline dark:text-violet-400">
          Refresh List
        </button>
      </div> */}
    </div>
  );
};

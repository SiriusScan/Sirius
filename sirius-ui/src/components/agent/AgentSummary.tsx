import React, { useMemo } from "react";

// Re-using the Agent type definition, potentially move to a shared types file later
type Agent = {
  id: string;
  name?: string | null;
  status?: string | null;
  lastSeen?: string | null;
};

interface AgentSummaryProps {
  agents: Agent[] | null | undefined; // Accept null/undefined during loading/error
  isLoading: boolean;
}

export const AgentSummary: React.FC<AgentSummaryProps> = ({
  agents,
  isLoading,
}) => {
  const summary = useMemo(() => {
    if (!agents) {
      return { totalAgents: 0, onlineAgents: 0 };
    }
    const totalAgents = agents.length;
    const onlineAgents = agents.filter(
      (agent) => agent.status?.toLowerCase() === "online"
    ).length;
    return { totalAgents, onlineAgents };
  }, [agents]);

  // Simplified display, similar to environment.tsx cards but more compact for a sidebar
  return (
    <div className="border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
      <div className="flex items-center justify-between gap-4">
        <div className="text-center">
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Total
          </div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            {isLoading ? "-" : summary.totalAgents}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            Online
          </div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {isLoading ? "-" : summary.onlineAgents}
          </div>
        </div>
      </div>
    </div>
  );
};

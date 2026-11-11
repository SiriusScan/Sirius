import React, { useRef, useState } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/lib/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import type { AgentTemplate } from "~/types/agentTemplateTypes";

export function AgentTemplateRunDialog({
  template,
  onClose,
}: {
  template: AgentTemplate;
  onClose: () => void;
}) {
  const [agentId, setAgentId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submitting = useRef(false);
  const agentsQuery = api.agent.listAgentsWithHosts.useQuery(undefined, {
    refetchInterval: 10000,
  });
  const testMutation = api.agentTemplates.testTemplate.useMutation();
  const agents = agentsQuery.data ?? [];
  const selectedAgent = agents.find((agent) => agent.id === agentId);

  const run = async () => {
    if (!selectedAgent || submitting.current || agentsQuery.isError) return;
    submitting.current = true;
    setError(null);
    try {
      await testMutation.mutateAsync({ templateId: template.id, agentId });
      alert(
        `Template "${template.name}" queued for agent "${agentId}"`
      );
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to run template"
      );
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting.current) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run template</DialogTitle>
          <DialogDescription>
            Choose the connected agent on which to run &quot;{template.name}
            &quot;.
          </DialogDescription>
        </DialogHeader>
        <label htmlFor="template-run-agent" className="text-sm font-medium">
          Agent
        </label>
        <select
          id="template-run-agent"
          className="rounded-md border border-input bg-background p-2 text-sm"
          value={agentId}
          onChange={(event) => setAgentId(event.target.value)}
          disabled={
            agentsQuery.isLoading ||
            agentsQuery.isError ||
            testMutation.isLoading
          }
        >
          <option value="">Choose an agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.host?.hostname
                ? `${agent.host.hostname} (${agent.id})`
                : agent.id}
            </option>
          ))}
        </select>
        {agentsQuery.isLoading && (
          <p role="status">Loading connected agents...</p>
        )}
        {agentsQuery.isError && (
          <p role="alert">Failed to load connected agents.</p>
        )}
        {!agentsQuery.isLoading &&
          !agentsQuery.isError &&
          agents.length === 0 && (
            <p role="status">No connected agents are available.</p>
          )}
        {agentId && !selectedAgent && (
          <p role="alert">The selected agent is no longer connected.</p>
        )}
        {error && <p role="alert">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              if (!submitting.current) onClose();
            }}
            disabled={testMutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              void run();
            }}
            disabled={
              !selectedAgent ||
              agentsQuery.isLoading ||
              agentsQuery.isError ||
              testMutation.isLoading
            }
          >
            {testMutation.isLoading ? "Starting..." : "Run on selected agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

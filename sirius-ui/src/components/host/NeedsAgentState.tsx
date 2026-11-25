/**
 * NeedsAgentState — the host page's one empty state for agent-only data
 * (packages, users, fingerprint, interfaces). A network scan can't see inside
 * a host, so these fold into a single "needs the agent" block with one next
 * step, rather than a row of empty sections. When an agent is enrolled but
 * hasn't reported, it says so instead.
 */

import React from "react";
import { Download, Terminal } from "lucide-react";
import { EmptyState } from "~/components/shared/EmptyState";
import { AGENT_HREF } from "./hostModel";

export interface NeedsAgentStateProps {
  /** The host record names an agent, but it hasn't sent data yet. */
  agentInstalled: boolean;
  /** What needs the agent; defaults to the System tab's contents. */
  title?: string;
  reason?: string;
  size?: "compact" | "default";
  framed?: boolean;
  className?: string;
}

export function NeedsAgentState({
  agentInstalled,
  title = "Packages, users and fingerprint need the agent",
  reason = "A network scan can't see inside the host. Install the Sirius agent to fill the System tab.",
  size = "compact",
  framed = false,
  className,
}: NeedsAgentStateProps) {
  if (agentInstalled) {
    return (
      <EmptyState
        variant="no-data"
        size={size}
        framed={framed}
        icon={Terminal}
        title="The agent hasn't reported yet"
        reason="This data appears after the agent's first check-in."
        primary={{ label: "Open the agent console", icon: Terminal, href: AGENT_HREF }}
        className={className}
      />
    );
  }
  return (
    <EmptyState
      variant="needs-agent"
      size={size}
      framed={framed}
      title={title}
      reason={reason}
      primary={{ label: "Get the agent", icon: Download, href: AGENT_HREF }}
      className={className}
    />
  );
}

export default NeedsAgentState;

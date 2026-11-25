/**
 * agentStatus.ts — agent freshness and the console's one agent counter.
 *
 * The console shows a single counter, in its header; the rail lists agents
 * and the cards show each agent's own state. Everything here is pure so the
 * counter and the cards agree.
 */

import { formatDateTime, toDate } from "../../utils/formatDateTime";

/** Where people download the Sirius agent (same link as the Scanner's). */
export const AGENT_DOWNLOAD_URL =
  "https://sirius.opensecurity.com/get-started/downloads";

/** Opens the agent download page in a new tab, keeping the console's state. */
export function openAgentDownloads(): void {
  if (typeof window === "undefined") return;
  window.open(AGENT_DOWNLOAD_URL, "_blank", "noopener,noreferrer");
}

export type AgentFreshness = "online" | "stale" | "offline";

/** No heartbeat for this long: the agent shows as stale. */
export const AGENT_STALE_AFTER_MS = 5 * 60 * 1000;
/** No heartbeat for this long: the agent counts as offline. */
export const AGENT_OFFLINE_AFTER_MS = 30 * 60 * 1000;

export interface AgentStatusFields {
  status?: string | null;
  lastSeen?: string | null;
}

export function getAgentFreshness(
  agent: AgentStatusFields,
  now: number = Date.now(),
): AgentFreshness {
  if (agent.status?.toLowerCase() !== "online") return "offline";
  if (!agent.lastSeen) return "online";
  const seen = new Date(agent.lastSeen).getTime();
  if (Number.isNaN(seen)) return "online";
  const elapsed = now - seen;
  if (elapsed > AGENT_OFFLINE_AFTER_MS) return "offline";
  if (elapsed > AGENT_STALE_AFTER_MS) return "stale";
  return "online";
}

/**
 * When an agent last reported: "42s ago", "5m ago", "3h ago", then the shared
 * date format ("Nov 21, 12:04 PM"). "unknown" when there is no real time.
 */
export function formatLastSeen(
  value: string | null | undefined,
  now: number = Date.now(),
): string {
  const date = toDate(value);
  if (!date) return "unknown";
  const seconds = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDateTime(date, "short", { now: new Date(now) });
}

export interface AgentCounts {
  total: number;
  online: number;
  stale: number;
  offline: number;
}

export function countAgents(
  agents: readonly AgentStatusFields[],
  now: number = Date.now(),
): AgentCounts {
  const counts: AgentCounts = { total: agents.length, online: 0, stale: 0, offline: 0 };
  for (const agent of agents) counts[getAgentFreshness(agent, now)] += 1;
  return counts;
}

/** "0 agents online", "3 agents online", "2 of 3 agents online". */
export function agentCounterLabel(counts: AgentCounts): string {
  const noun = counts.total === 1 ? "agent" : "agents";
  if (counts.total === 0) return "0 agents online";
  if (counts.online === counts.total) return `${counts.total} ${noun} online`;
  return `${counts.online} of ${counts.total} ${noun} online`;
}

/** The breakdown behind the counter, for its tooltip. */
export function agentCounterDetail(counts: AgentCounts): string {
  if (counts.total === 0) return "No agents have connected yet";
  const parts = [`${counts.online} online`];
  if (counts.stale > 0) parts.push(`${counts.stale} stale`);
  if (counts.offline > 0) parts.push(`${counts.offline} offline`);
  return parts.join(", ");
}

/** Dot colour for the counter: none connected, some online, or all away. */
export type AgentCounterTone = "none" | "online" | "away";

export function agentCounterTone(counts: AgentCounts): AgentCounterTone {
  if (counts.total === 0) return "none";
  return counts.online > 0 ? "online" : "away";
}

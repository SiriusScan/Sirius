import { useMemo, useState, useCallback } from "react";
import type { Agent, AgentGroup } from "./types";

// ─── Filter Token Parser (Phase 2.4) ───────────────────────────────────────

interface FilterToken {
  key: string;
  value: string;
}

function parseFilterQuery(query: string): {
  tokens: FilterToken[];
  freeText: string;
} {
  const tokens: FilterToken[] = [];
  const freeWords: string[] = [];

  // Split by spaces but respect quoted strings
  const parts = query.match(/(?:[^\s"]+|"[^"]*")+/g) ?? [];

  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx > 0) {
      const key = part.slice(0, colonIdx).toLowerCase();
      let value = part.slice(colonIdx + 1);
      // Remove surrounding quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      tokens.push({ key, value: value.toLowerCase() });
    } else {
      freeWords.push(part);
    }
  }

  return { tokens, freeText: freeWords.join(" ").toLowerCase() };
}

function matchesWildcard(text: string, pattern: string): boolean {
  if (!pattern.includes("*")) return text.includes(pattern);
  const regex = new RegExp(
    "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
  );
  return regex.test(text);
}

export function filterAgents(
  agents: Agent[],
  query: string,
  agentTags: Record<string, string[]>,
  agentGroups: AgentGroup[]
): Agent[] {
  if (!query.trim()) return agents;

  const { tokens, freeText } = parseFilterQuery(query);

  return agents.filter((agent) => {
    // Apply structured tokens
    for (const token of tokens) {
      switch (token.key) {
        case "os": {
          const os = (agent.host?.os ?? "").toLowerCase();
          if (!matchesWildcard(os, token.value)) return false;
          break;
        }
        case "status": {
          const status = (agent.status ?? "").toLowerCase();
          if (status !== token.value) return false;
          break;
        }
        case "ip": {
          const ip = (agent.host?.ip ?? "").toLowerCase();
          if (!matchesWildcard(ip, token.value)) return false;
          break;
        }
        case "name": {
          const name = (
            agent.host?.hostname ??
            agent.name ??
            ""
          ).toLowerCase();
          if (!matchesWildcard(name, token.value)) return false;
          break;
        }
        case "tag": {
          const tags = agentTags[agent.id] ?? [];
          if (!tags.some((t) => t.toLowerCase() === token.value)) return false;
          break;
        }
        case "group": {
          const inGroup = agentGroups.some(
            (g) =>
              g.name.toLowerCase() === token.value &&
              g.agentIds.includes(agent.id)
          );
          if (!inGroup) return false;
          break;
        }
        case "hostname": {
          const hostname = (agent.host?.hostname ?? "").toLowerCase();
          if (!matchesWildcard(hostname, token.value)) return false;
          break;
        }
        default:
          // Unknown filter key, ignore
          break;
      }
    }

    // Apply free text search
    if (freeText) {
      const searchable = [
        agent.id,
        agent.name,
        agent.host?.hostname,
        agent.host?.ip,
        agent.host?.os,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!searchable.includes(freeText)) return false;
    }

    return true;
  });
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useSmartFilter(
  agents: Agent[] | undefined,
  agentTags: Record<string, string[]>,
  agentGroups: AgentGroup[]
) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!agents) return [];
    return filterAgents(agents, query, agentTags, agentGroups);
  }, [agents, query, agentTags, agentGroups]);

  const clear = useCallback(() => setQuery(""), []);

  return { query, setQuery, filtered, clear };
}

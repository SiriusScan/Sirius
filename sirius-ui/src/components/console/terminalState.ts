import { z } from "zod";
import type { TerminalPersistenceState } from "./types";

const DEFAULT_STATE: TerminalPersistenceState = {
  version: 1,
  commandHistory: [],
  selectedTarget: { type: "engine" },
  activeView: "terminal",
  fontSize: 14,
  sidebarWidth: 288, // w-72 = 18rem = 288px
  sidebarCollapsed: false,
  timestampMode: false,
  concurrencyLimit: 50,
  agentTags: {},
  agentGroups: [],
  agentNotes: {},
  savedFilters: [],
  tabs: [{ id: "main", name: "Main", target: { type: "engine" } }],
  activeTabId: "main",
  groupingMode: "flat",
  annotations: [],
};

const targetSchema = z
  .object({
    type: z.enum(["engine", "agent"]),
    id: z.string().optional(),
    name: z.string().optional(),
  })
  .refine((target) => target.type === "engine" || !!target.id?.trim());

const stateSchema = z.object({
  version: z.literal(1).catch(1),
  commandHistory: z
    .array(z.string())
    .catch(() => [])
    .transform((history) => history.slice(0, 200)),
  selectedTarget: targetSchema.catch(() => ({
    ...DEFAULT_STATE.selectedTarget,
  })),
  activeView: z.enum(["terminal", "history", "agent"]).catch("terminal"),
  fontSize: z.number().finite().min(10).max(24).catch(14),
  sidebarWidth: z.number().finite().min(200).max(500).catch(288),
  sidebarCollapsed: z.boolean().catch(false),
  timestampMode: z.boolean().catch(false),
  concurrencyLimit: z.number().int().min(1).max(500).catch(50),
  agentTags: z.record(z.array(z.string())).catch(() => ({})),
  agentGroups: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        agentIds: z.array(z.string()),
        color: z.string().optional(),
      })
    )
    .catch(() => []),
  agentNotes: z.record(z.string()).catch(() => ({})),
  savedFilters: z
    .array(z.object({ id: z.string(), name: z.string(), query: z.string() }))
    .catch(() => []),
  tabs: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string(),
        target: targetSchema,
      })
    )
    .min(1)
    .max(10)
    .refine((tabs) => new Set(tabs.map((tab) => tab.id)).size === tabs.length)
    .catch(() =>
      DEFAULT_STATE.tabs.map((tab) => ({ ...tab, target: { ...tab.target } }))
    ),
  activeTabId: z.string().nullable().catch("main"),
  groupingMode: z.enum(["flat", "group", "os", "network"]).catch("flat"),
  annotations: z
    .array(
      z.object({
        id: z.string(),
        lineNumber: z.number().int().nonnegative(),
        note: z.string(),
        timestamp: z.number().finite(),
      })
    )
    .catch(() => []),
});

/** Recover each invalid field independently so saved state cannot brick the console. */
export function parseTerminalState(value: unknown): TerminalPersistenceState {
  const supportedVersion = z.object({ version: z.literal(1) }).safeParse(value);
  const state = stateSchema.parse(supportedVersion.success ? value : {});
  if (!state.tabs.some((tab) => tab.id === state.activeTabId)) {
    state.activeTabId = state.tabs[0]?.id ?? "main";
  }
  return state;
}

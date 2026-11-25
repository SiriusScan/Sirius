/**
 * Settings › Scanning (R10, ADR-7): pure shaping of the data the existing
 * procedures return, for the profiles table, the script and template
 * library, the repositories table and the agent scanning form.
 *
 * Every value comes from the store or the API; anything they don't record
 * stays empty ("—") rather than being filled in.
 */

import { canonicalizeScriptId, summarizeScriptRefs } from "~/utils/nseScriptIds";
import {
  formatNsePortRule,
  isPlaceholderAuthor,
  isPlaceholderDescription,
  parseNseAuthor,
  parseNseCategories,
  parseNseDescription,
  parseNsePortRule,
  portRuleSearchTerms,
  type NsePortRule,
} from "./nseScriptMeta";

/* ------------------------------------------------------------------ */
/*  Script manifest (ValKey nse:manifest)                              */
/* ------------------------------------------------------------------ */

export const NSE_MANIFEST_KEY = "nse:manifest";

export interface ManifestEntry {
  /** The repository the scanner synced the script from. */
  repository?: string;
  /** Written by the script editor (scripts/custom/…). */
  custom: boolean;
}

/** Script id → where it came from. Tolerates the object and array forms. */
export function parseNseManifest(raw: string | null | undefined): Map<string, ManifestEntry> {
  const out = new Map<string, ManifestEntry>();
  if (!raw) return out;
  let manifest: unknown;
  try {
    manifest = JSON.parse(raw);
  } catch {
    return out;
  }
  const scripts = (manifest as { scripts?: unknown } | null)?.scripts;
  const add = (rawId: string, value: unknown) => {
    const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    const path = typeof obj.path === "string" ? obj.path : "";
    const id = canonicalizeScriptId(rawId) || canonicalizeScriptId(path);
    if (!id || out.has(id)) return;
    const source = obj.source && typeof obj.source === "object" ? (obj.source as Record<string, unknown>) : {};
    const repository =
      typeof source.repository === "string" && source.repository.trim() ? source.repository.trim() : undefined;
    out.set(id, { ...(repository ? { repository } : {}), custom: /(^|\/)custom\//.test(path) });
  };
  if (Array.isArray(scripts)) {
    scripts.forEach((item) => {
      if (typeof item === "string") add(item, { path: item });
      else if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        add(typeof o.id === "string" ? o.id : typeof o.path === "string" ? o.path : "", o);
      }
    });
  } else if (scripts && typeof scripts === "object") {
    Object.entries(scripts as Record<string, unknown>).forEach(([id, value]) => add(id, value));
  }
  return out;
}

/** Scripts per repository name, from the manifest. */
export function manifestRepositoryCounts(manifest: ReadonlyMap<string, ManifestEntry>): Map<string, number> {
  const counts = new Map<string, number>();
  manifest.forEach((entry) => {
    if (!entry.repository) return;
    counts.set(entry.repository, (counts.get(entry.repository) ?? 0) + 1);
  });
  return counts;
}

/* ------------------------------------------------------------------ */
/*  Library rows                                                       */
/* ------------------------------------------------------------------ */

/** What store.getNseScripts returns per script. */
export interface NseScriptInput {
  id: string;
  name: string;
  author?: string;
  tags?: readonly string[];
  description?: string;
  code?: string;
  protocol?: string;
  path?: string;
}

export interface ScriptRow {
  id: string;
  name: string;
  rule: NsePortRule;
  port: string;
  portTitle: string;
  /** False for "Per host", "Before scan", "—" and similar. */
  portIsPort: boolean;
  categories: string[];
  /** Repository name, "Custom" for scripts written here, or "" when unknown. */
  repository: string;
  description: string;
  author: string;
  /** Lowercased text the search box matches against. */
  search: string;
}

/** Tags the scanner fills in for repository scripts ("*", the protocol). */
function realTags(tags: readonly string[] | undefined, protocol: string | undefined): string[] {
  return (tags ?? [])
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t && t !== "*" && t !== (protocol ?? "").trim().toLowerCase());
}

export function scriptRow(script: NseScriptInput, manifest?: ReadonlyMap<string, ManifestEntry>): ScriptRow {
  const code = script.code ?? "";
  const rule = parseNsePortRule(code);
  const port = formatNsePortRule(rule);
  const parsedCategories = parseNseCategories(code);
  const categories = parsedCategories.length > 0 ? parsedCategories : realTags(script.tags, script.protocol);
  const entry = manifest?.get(canonicalizeScriptId(script.id)) ?? manifest?.get(canonicalizeScriptId(script.path));
  const custom = entry?.custom ?? /(^|\/)custom\//.test(script.path ?? "");
  const repository = entry?.repository ?? (custom ? "Custom" : "");
  const description = isPlaceholderDescription(script.description)
    ? parseNseDescription(code)
    : (script.description ?? "").trim();
  const author = isPlaceholderAuthor(script.author) ? parseNseAuthor(code) : (script.author ?? "").trim();
  const name = script.name || script.id;
  const search = [name, script.id, port.label, ...portRuleSearchTerms(rule), ...categories, repository]
    .join(" ")
    .toLowerCase();
  return {
    id: script.id,
    name,
    rule,
    port: port.label,
    portTitle: port.title,
    portIsPort: port.isPort,
    categories,
    repository,
    description,
    author,
    search,
  };
}

export function scriptRows(
  scripts: readonly NseScriptInput[] | null | undefined,
  manifest?: ReadonlyMap<string, ManifestEntry>,
): ScriptRow[] {
  return (scripts ?? [])
    .map((s) => scriptRow(s, manifest))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
}

/** The agent template fields the library shows. */
export interface AgentTemplateInput {
  id: string;
  name: string;
  description?: string;
  type?: string;
  severity?: string;
  platforms?: readonly string[];
  tags?: readonly string[];
  source?: { type?: string; name?: string } | null;
}

export interface TemplateRow {
  id: string;
  name: string;
  platforms: string[];
  severity: string;
  /** The source repository's name, else "Custom" or "Repository". */
  source: string;
  description: string;
  search: string;
}

const PLATFORM_LABELS: Record<string, string> = { linux: "Linux", darwin: "macOS", windows: "Windows" };

export function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

export function templateRow(template: AgentTemplateInput): TemplateRow {
  const platforms = (template.platforms ?? []).map(platformLabel);
  const sourceName = template.source?.name?.trim();
  const source = sourceName
    ? sourceName
    : template.type === "custom"
      ? "Custom"
      : template.type
        ? "Repository"
        : "";
  const severity = (template.severity ?? "").toLowerCase();
  const search = [template.name, template.id, ...platforms, severity, source, ...(template.tags ?? [])]
    .join(" ")
    .toLowerCase();
  return {
    id: template.id,
    name: template.name || template.id,
    platforms,
    severity,
    source,
    description: (template.description ?? "").trim(),
    search,
  };
}

export function templateRows(templates: readonly AgentTemplateInput[] | null | undefined): TemplateRow[] {
  return (templates ?? []).map(templateRow).sort((a, b) => a.name.localeCompare(b.name, "en"));
}

/** Rows whose search text holds every word of the query. */
export function filterRows<T extends { search: string }>(rows: readonly T[], query: string): T[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return rows.slice();
  return rows.filter((row) => words.every((w) => row.search.includes(w)));
}

/* ------------------------------------------------------------------ */
/*  Profiles                                                           */
/* ------------------------------------------------------------------ */

/** What templates.getTemplates returns per profile. */
export interface ProfileInput {
  id: string;
  name: string;
  description?: string;
  type?: string;
  enabled_scripts?: readonly string[] | null;
  scan_options?: {
    scan_types?: readonly string[] | null;
    agent_scan?: { enabled?: boolean } | null;
  } | null;
}

export interface ProfileChecks {
  /** "14 scripts", "Agent templates", "13 scripts + templates". */
  label: string;
  /** Script references that no longer match a script in the library. */
  missing: number;
  scripts: number;
  agent: boolean;
}

function plural(n: number, one: string, many = `${one}s`): string {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

/**
 * What a profile runs. With the library loaded, script counts are the
 * references that resolve to a script (as the profile editor counts them);
 * before that, the profile's own reference count.
 */
export function profileChecks(profile: ProfileInput, availableScriptIds?: Iterable<string> | null): ProfileChecks {
  const refs = profile.enabled_scripts ?? [];
  const agent = profile.scan_options?.agent_scan?.enabled === true;
  let scripts = refs.length;
  let missing = 0;
  if (availableScriptIds) {
    const summary = summarizeScriptRefs(refs, availableScriptIds);
    scripts = summary.linkedScriptCount;
    missing = summary.missingScriptRefs;
  }
  let label: string;
  if (agent && scripts === 0) label = "Agent templates";
  else if (agent) label = `${plural(scripts, "script")} + templates`;
  else label = scripts === 0 ? "No scripts" : plural(scripts, "script");
  return { label, missing, scripts, agent };
}

/** System profiles first (in API order), then custom ones by name. */
export function sortProfiles<T extends ProfileInput>(profiles: readonly T[] | null | undefined): T[] {
  const list = (profiles ?? []).slice();
  const system = list.filter((p) => p.type === "system");
  const custom = list
    .filter((p) => p.type !== "system")
    .sort((a, b) => a.name.localeCompare(b.name, "en"));
  return [...system, ...custom];
}

/* ------------------------------------------------------------------ */
/*  Repositories                                                       */
/* ------------------------------------------------------------------ */

export type RepositoryKind = "network" | "agent";

export type RepositoryStatusKey = "synced" | "syncing" | "error" | "never_synced" | "not_synced";

export interface RepositoryRow {
  key: string;
  kind: RepositoryKind;
  name: string;
  url: string;
  /** Agent repositories only; script repositories record none. */
  branch?: string;
  status: RepositoryStatusKey;
  error?: string;
  items: number | null;
  lastSync: string | null;
  /** Agent repositories can be turned off; script repositories always sync. */
  enabled: boolean | null;
  /** Agent repository id for the update, sync and delete procedures. */
  id?: string;
  priority?: number;
}

/** What store.getNseRepositories returns. */
export interface NseRepositoryInput {
  name: string;
  url: string;
}

/** What repositories.list returns. */
export interface AgentRepositoryInput {
  id: string;
  name: string;
  url: string;
  branch?: string;
  priority?: number;
  enabled?: boolean;
  last_sync?: string | null;
  template_count?: number;
  status?: string;
  error_message?: string | null;
}

const AGENT_STATUSES: readonly RepositoryStatusKey[] = ["synced", "syncing", "error", "never_synced"];

/**
 * One list for both kinds. A script repository counts as synced when the
 * scanner's manifest holds scripts from it; it records no branch or sync time.
 */
export function repositoryRows(
  nseRepos: readonly NseRepositoryInput[] | null | undefined,
  nseCounts: ReadonlyMap<string, number> | null | undefined,
  agentRepos: readonly AgentRepositoryInput[] | null | undefined,
): RepositoryRow[] {
  const network: RepositoryRow[] = (nseRepos ?? []).map((repo) => {
    const items = nseCounts ? nseCounts.get(repo.name) ?? 0 : null;
    return {
      key: `network:${repo.name}`,
      kind: "network",
      name: repo.name,
      url: repo.url,
      status: items === null ? "not_synced" : items > 0 ? "synced" : "not_synced",
      items,
      lastSync: null,
      enabled: null,
    };
  });
  const agent: RepositoryRow[] = (agentRepos ?? [])
    .slice()
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0) || a.name.localeCompare(b.name, "en"))
    .map((repo) => {
      const status = (AGENT_STATUSES as readonly string[]).includes(repo.status ?? "")
        ? (repo.status as RepositoryStatusKey)
        : "never_synced";
      return {
        key: `agent:${repo.id}`,
        kind: "agent",
        id: repo.id,
        name: repo.name,
        url: repo.url,
        ...(repo.branch ? { branch: repo.branch } : {}),
        status,
        ...(repo.error_message ? { error: repo.error_message } : {}),
        items: typeof repo.template_count === "number" ? repo.template_count : null,
        lastSync: repo.last_sync ?? null,
        enabled: repo.enabled ?? null,
        ...(typeof repo.priority === "number" ? { priority: repo.priority } : {}),
      };
    });
  return [...network, ...agent];
}

/** "github.com/SiriusScan/sirius-nse" from a clone URL. */
export function displayRepositoryUrl(url: string): string {
  return url
    .trim()
    .replace(/^[a-z+]+:\/\//i, "")
    .replace(/^git@([^:]+):/i, "$1/")
    .replace(/\.git$/i, "")
    .replace(/\/$/, "");
}

/** A new agent repository goes after the existing ones. */
export function nextRepositoryPriority(repos: readonly { priority?: number }[] | null | undefined): number {
  const max = Math.max(0, ...(repos ?? []).map((r) => (typeof r.priority === "number" ? r.priority : 0)));
  return max + 1;
}

/** Same checks the store and repositories procedures apply. */
export function validateRepositoryInput(input: { kind: RepositoryKind; name: string; url: string; branch: string }): {
  name?: string;
  url?: string;
  branch?: string;
} {
  const errors: { name?: string; url?: string; branch?: string } = {};
  if (!input.name.trim()) errors.name = "Enter a name.";
  const url = input.url.trim();
  if (!url) errors.url = "Enter the repository URL.";
  else {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") errors.url = "Use an http or https URL.";
    } catch {
      errors.url = "Use a full URL, for example https://github.com/org/repo.";
    }
  }
  if (input.kind === "agent" && !input.branch.trim()) errors.branch = "Enter a branch.";
  return errors;
}

/* ------------------------------------------------------------------ */
/*  Agent scanning settings                                            */
/* ------------------------------------------------------------------ */

/**
 * Kept in ValKey through store.getValue / store.setValue (the store allows
 * the agent_scan: prefix). Scans read it through useAgentScanSettings.
 */
export const AGENT_SCAN_SETTINGS_KEY = "agent_scan:settings";

export type AgentScanModeValue = "comprehensive" | "templates-only" | "scripts-only";

export const AGENT_SCAN_MODES: ReadonlyArray<{ value: AgentScanModeValue; label: string }> = [
  { value: "comprehensive", label: "Comprehensive (templates + scripts)" },
  { value: "templates-only", label: "Templates only" },
  { value: "scripts-only", label: "Scripts only" },
];

export interface AgentScanSettings {
  /** Run an agent scan alongside every scan. */
  enabled: boolean;
  mode: AgentScanModeValue;
  /** Seconds. */
  timeout: number;
  concurrency: number;
}

/** The ranges the old Scanner › Advanced sliders allowed. */
export const AGENT_TIMEOUT_RANGE = { min: 30, max: 600 } as const;
export const AGENT_CONCURRENCY_RANGE = { min: 1, max: 10 } as const;

/** The values the old Scanner › Advanced form started from. */
export const DEFAULT_AGENT_SCAN_SETTINGS: AgentScanSettings = {
  enabled: false,
  mode: "comprehensive",
  timeout: 300,
  concurrency: 3,
};

function isMode(value: unknown): value is AgentScanModeValue {
  return AGENT_SCAN_MODES.some((m) => m.value === value);
}

function clampInt(value: unknown, range: { min: number; max: number }, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  if (!Number.isFinite(n)) return fallback;
  return Math.min(range.max, Math.max(range.min, Math.round(n)));
}

/** The stored settings, or null when none were saved or the value is unreadable. */
export function parseAgentScanSettings(raw: string | null | undefined): AgentScanSettings | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return {
    enabled: v.enabled === true,
    mode: isMode(v.mode) ? v.mode : DEFAULT_AGENT_SCAN_SETTINGS.mode,
    timeout: clampInt(v.timeout, AGENT_TIMEOUT_RANGE, DEFAULT_AGENT_SCAN_SETTINGS.timeout),
    concurrency: clampInt(v.concurrency, AGENT_CONCURRENCY_RANGE, DEFAULT_AGENT_SCAN_SETTINGS.concurrency),
  };
}

export function serializeAgentScanSettings(settings: AgentScanSettings): string {
  return JSON.stringify({
    enabled: settings.enabled,
    mode: settings.mode,
    timeout: settings.timeout,
    concurrency: settings.concurrency,
  });
}

/** Form text → errors for the two number inputs. */
export function validateAgentScanDraft(draft: { timeout: string; concurrency: string }): {
  timeout?: string;
  concurrency?: string;
} {
  const errors: { timeout?: string; concurrency?: string } = {};
  const t = Number(draft.timeout);
  if (!/^\d+$/.test(draft.timeout.trim()) || t < AGENT_TIMEOUT_RANGE.min || t > AGENT_TIMEOUT_RANGE.max) {
    errors.timeout = `Enter ${AGENT_TIMEOUT_RANGE.min} to ${AGENT_TIMEOUT_RANGE.max} seconds.`;
  }
  const c = Number(draft.concurrency);
  if (
    !/^\d+$/.test(draft.concurrency.trim()) ||
    c < AGENT_CONCURRENCY_RANGE.min ||
    c > AGENT_CONCURRENCY_RANGE.max
  ) {
    errors.concurrency = `Enter ${AGENT_CONCURRENCY_RANGE.min} to ${AGENT_CONCURRENCY_RANGE.max}.`;
  }
  return errors;
}

/** The scan's agent config (AgentScanConfig shape), or undefined when off. */
export function toAgentScanConfig(settings: AgentScanSettings | null | undefined):
  | { enabled: true; mode: AgentScanModeValue; agent_ids: string[]; timeout: number; concurrency: number }
  | undefined {
  if (!settings?.enabled) return undefined;
  return {
    enabled: true,
    mode: settings.mode,
    agent_ids: [], // every connected agent
    timeout: settings.timeout,
    concurrency: settings.concurrency,
  };
}

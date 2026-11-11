import { canonicalizeScriptId } from "../utils/nseScriptIds";

export const NSE_MANIFEST_KEY = "nse:manifest";
export const NSE_SCRIPT_PREFIX = "nse:script:";
const MAX_ATTEMPTS = 5;

export interface NseStore {
  get(key: string): Promise<string | null>;
  eval(script: string, numberOfKeys: number, ...args: string[]): Promise<unknown>;
}

type JsonObject = Record<string, unknown>;
type Metadata = { author?: string; tags?: string[]; description?: string };
type Mutation =
  | { type: "create"; id: string; name: string; code: string; protocol?: string; metadata?: Metadata }
  | { type: "update"; id: string; code: string; metadata?: Metadata }
  | { type: "delete"; id: string };

// Compare both snapshots before making any changes. No lock or partial publication.
// Each key has four arguments: expected presence, expected bytes, action, new bytes.
export const NSE_CAS_LUA = `
for i, key in ipairs(KEYS) do
  local base = (i - 1) * 4
  local current = redis.call('GET', key)
  if ARGV[base + 1] == '0' then
    if current ~= false then return 0 end
  elseif current == false or current ~= ARGV[base + 2] then
    return 0
  end
end
for i, key in ipairs(KEYS) do
  local base = (i - 1) * 4
  if ARGV[base + 3] == 'set' then
    redis.call('SET', key, ARGV[base + 4])
  elseif ARGV[base + 3] == 'delete' then
    redis.call('DEL', key)
  end
end
return 1
`;

export function isProtectedNseKey(key: string): boolean {
  return key === NSE_MANIFEST_KEY || key.startsWith(NSE_SCRIPT_PREFIX);
}

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid ${label}`);
  }
  return value as JsonObject;
}

function idOf(raw: string): string {
  const id = canonicalizeScriptId(raw);
  if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(id) || canonicalizeScriptId(id) !== id) {
    throw new Error("Invalid NSE script ID");
  }
  return id;
}

export function parseNseManifest(raw: string | null): JsonObject & {
  scripts: Record<string, JsonObject>;
  deletedScripts: Record<string, true>;
} {
  const root: JsonObject = raw === null ? { scripts: {} } : object(JSON.parse(raw) as unknown, "NSE manifest");
  const scripts = Object.create(null) as Record<string, JsonObject>;
  const canonicalIds = new Set<string>();
  const add = (rawId: string, info: JsonObject) => {
    const id = idOf(rawId);
    if (canonicalIds.has(id)) throw new Error("Duplicate NSE script aliases");
    canonicalIds.add(id);
    // Preserve raw keys until that entry's body can be migrated in the same CAS.
    // The path is an independent execution location, not an ID alias.
    scripts[rawId] = info;
  };
  if (Array.isArray(root.scripts)) {
    for (const value of root.scripts) {
      if (typeof value === "string") add(value, { path: value });
      else {
        const info = object(value, "NSE script entry");
        const rawId = info.id ?? info.path;
        if (typeof rawId !== "string") throw new Error("Invalid NSE script entry ID");
        add(rawId, info);
      }
    }
  } else {
    for (const [rawId, value] of Object.entries(object(root.scripts, "NSE scripts"))) {
      add(rawId, object(value, "NSE script entry"));
    }
  }
  const deletedScripts = Object.create(null) as Record<string, true>;
  if (root.deletedScripts !== undefined) {
    for (const [rawId, value] of Object.entries(object(root.deletedScripts, "NSE tombstones"))) {
      const id = idOf(rawId);
      if (rawId !== id || value !== true || Object.hasOwn(deletedScripts, id)) throw new Error("Invalid NSE tombstone");
      deletedScripts[id] = true;
    }
  }
  for (const id of canonicalIds) {
    if (deletedScripts[id]) throw new Error("NSE entry conflicts with tombstone");
  }
  return { ...root, scripts, deletedScripts };
}

function parseContent(raw: string): JsonObject & { content: string; metadata?: Metadata } {
  const value = object(JSON.parse(raw) as unknown, "NSE content");
  if (typeof value.content !== "string") throw new Error("Invalid NSE content");
  if (value.metadata !== undefined) {
    const metadata = object(value.metadata, "NSE metadata");
    for (const field of ["author", "description"]) {
      if (metadata[field] !== undefined && typeof metadata[field] !== "string") throw new Error("Invalid NSE metadata");
    }
    // Go's legacy REST writer serialized an omitted []string as null.
    // Treat that wire-compatible empty list as [], while rejecting bad members.
    if (metadata.tags === null) metadata.tags = [];
    if (metadata.tags !== undefined && (!Array.isArray(metadata.tags) || metadata.tags.some((tag: unknown) => typeof tag !== "string"))) throw new Error("Invalid NSE metadata tags");
  }
  return value as JsonObject & { content: string; metadata?: Metadata };
}

export async function mutateNseScript(store: NseStore, mutation: Mutation): Promise<string> {
  const id = idOf(mutation.id);
  const contentKey = NSE_SCRIPT_PREFIX + id;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const manifestRaw = await store.get(NSE_MANIFEST_KEY);
    const manifest = parseNseManifest(manifestRaw);
    const rawId = Object.keys(manifest.scripts).find((key) => idOf(key) === id);
    const legacyKey = rawId !== undefined && rawId !== id ? NSE_SCRIPT_PREFIX + rawId : undefined;
    const contentRaw = await store.get(contentKey);
    const legacyRaw = legacyKey === undefined ? null : await store.get(legacyKey);
    if (contentRaw !== null && legacyRaw !== null) throw new Error("Ambiguous NSE script bodies");
    const existingRaw = contentRaw ?? legacyRaw;
    const existingContent = existingRaw === null ? undefined : parseContent(existingRaw);
    let content: JsonObject | undefined;
    if (mutation.type === "create") {
      if (rawId !== undefined || contentRaw !== null) {
        throw new Error(`Script with ID '${id}' already exists`);
      }
      manifest.scripts[id] = {
        name: mutation.name, path: `scripts/custom/${id}.nse`,
        protocol: mutation.protocol === "" ? "*" : mutation.protocol ?? "*", source: { type: "custom" },
      };
      delete manifest.deletedScripts[id];
      content = {
        content: mutation.code,
        metadata: { author: mutation.metadata?.author ?? "User",
          tags: mutation.metadata?.tags ?? [], description: mutation.metadata?.description ?? "" },
        createdAt: Date.now(), updatedAt: Date.now(), custom: true,
      };
    } else {
      if (rawId === undefined) throw new Error(`Script '${id}' not found in manifest`);
      if (mutation.type === "delete") {
        delete manifest.scripts[rawId];
        manifest.deletedScripts[id] = true;
      } else {
        if (!existingContent) throw new Error(`Script content for ${id} not found`);
        manifest.scripts[id] = manifest.scripts[rawId]!;
        if (rawId !== id) delete manifest.scripts[rawId];
        const metadata = { ...(existingContent.metadata as JsonObject | undefined) };
        for (const [key, value] of Object.entries(mutation.metadata ?? {})) {
          if (value !== undefined) metadata[key] = value;
        }
        content = { ...existingContent, content: mutation.code, metadata, updatedAt: Date.now() };
      }
    }
    const args = (old: string | null, action: string, value: string) =>
      [old === null ? "0" : "1", old ?? "", action, value];
    const keys = [NSE_MANIFEST_KEY, contentKey];
    const values = [
      ...args(manifestRaw, "set", JSON.stringify(manifest)),
      ...args(contentRaw, mutation.type === "delete" ? "delete" : "set", content ? JSON.stringify(content) : ""),
    ];
    if (legacyKey !== undefined) {
      keys.push(legacyKey);
      values.push(...args(legacyRaw, "delete", ""));
    }
    const result = await store.eval(NSE_CAS_LUA, keys.length, ...keys, ...values);
    if (result === 1) return id;
    if (result !== 0) throw new Error("Unexpected NSE transaction result");
  }
  throw new Error("NSE scripts changed concurrently; please retry");
}

// Only manifest-derived raw IDs are supplied here. Execution paths are not IDs.
export async function readNseScriptContent(store: Pick<NseStore, "get">, rawId: string) {
  const id = idOf(rawId);
  const canonical = await store.get(NSE_SCRIPT_PREFIX + id);
  const legacy = rawId === id ? null : await store.get(NSE_SCRIPT_PREFIX + rawId);
  if (canonical !== null && legacy !== null) throw new Error("Ambiguous NSE script bodies");
  const raw = canonical ?? legacy;
  if (raw === null) throw new Error(`Script content for ${id} not found`);
  return parseContent(raw);
}

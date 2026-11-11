import { NSE_CAS_LUA, type NseStore } from "./nseMutations";

export const NSE_REPO_MANIFEST_KEY = "nse:repo-manifest";
export const DEFAULT_REPOSITORIES = [
  { name: "sirius-nse", url: "https://github.com/SiriusScan/sirius-nse.git" },
];
type Repository = Record<string, unknown> & { name: string; url: string };
type Manifest = Record<string, unknown> & { repositories: Repository[] };
type Mutation =
  | { type: "add"; name: string; url: string }
  | { type: "remove"; name: string }
  | { type: "initialize" };

// Match the scanner's single path-component requirement without changing case.
export function isSafeRepositoryName(name: string): boolean {
  return name.length > 0 && name !== "." && name !== ".." &&
    !name.includes("/") && !name.includes("\\") && !name.includes("\0");
}

export function parseNseRepositories(raw: string): Manifest {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid repository manifest");
  }
  const root = value as Record<string, unknown>;
  if (!Array.isArray(root.repositories)) throw new Error("Invalid repositories");
  const names = new Set<string>();
  for (const value of root.repositories as unknown[]) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid repository");
    const repo = value as Record<string, unknown>;
    if (typeof repo.name !== "string" || !isSafeRepositoryName(repo.name) || typeof repo.url !== "string") {
      throw new Error("Invalid repository");
    }
    if (names.has(repo.name)) throw new Error("Duplicate repository name");
    names.add(repo.name);
  }
  return root as Manifest;
}

// Retry only explicit CAS conflicts, never an uncertain transport failure.
export async function mutateNseRepository(store: NseStore, mutation: Mutation): Promise<boolean> {
  if (mutation.type !== "initialize" && !isSafeRepositoryName(mutation.name)) {
    throw new Error("Invalid repository name");
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const raw = await store.get(NSE_REPO_MANIFEST_KEY);
    const manifest = raw === null ? { repositories: [] } : parseNseRepositories(raw);
    if (mutation.type === "initialize") {
      if (raw !== null) return false;
      manifest.repositories = DEFAULT_REPOSITORIES.map(repo => ({ ...repo }));
    } else if (mutation.type === "add") {
      if (manifest.repositories.some(repo => repo.name === mutation.name)) {
        throw new Error(`Repository '${mutation.name}' already exists`);
      }
      manifest.repositories.push({ name: mutation.name, url: mutation.url });
    } else {
      if (raw === null) throw new Error("No repository manifest found");
      const remaining = manifest.repositories.filter(repo => repo.name !== mutation.name);
      if (remaining.length === manifest.repositories.length) throw new Error(`Repository '${mutation.name}' not found`);
      manifest.repositories = remaining;
    }
    const result = await store.eval(NSE_CAS_LUA, 1, NSE_REPO_MANIFEST_KEY,
      raw === null ? "0" : "1", raw ?? "", "set", JSON.stringify(manifest));
    if (result === 1) return true;
    if (result !== 0) throw new Error("Unexpected repository CAS response");
  }
  throw new Error("Repository manifest changed concurrently; retry");
}

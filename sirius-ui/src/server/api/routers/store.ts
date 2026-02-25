import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { valkey } from "~/server/valkey";

// Key constants to match backend
const NSE_MANIFEST_KEY = "nse:manifest";
const NSE_REPO_MANIFEST_KEY = "nse:repo-manifest";
const NSE_SCRIPT_PREFIX = "nse:script:";
const ALLOWED_KEY_PREFIXES = ["nse:", "currentScan", "agent_scan:"] as const;

function isAllowedKey(key: string): boolean {
  return ALLOWED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function normalizeScriptId(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const lastSegment = trimmed.split("/").filter(Boolean).pop() ?? trimmed;
  return lastSegment.replace(/\.nse$/i, "");
}

type ManifestScriptInfo = {
  id: string;
  name: string;
  path: string;
  protocol: string;
};

function parseManifestScripts(manifest: unknown): ManifestScriptInfo[] {
  if (!manifest || typeof manifest !== "object") return [];

  const root = manifest as { scripts?: unknown };
  const scripts = root.scripts;
  if (!scripts) return [];

  const out: ManifestScriptInfo[] = [];

  const fromRaw = (rawId: string, raw: unknown): ManifestScriptInfo | null => {
    const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const pathFromObj = typeof obj.path === "string" ? obj.path : "";
    const normalizedId = normalizeScriptId(rawId) || normalizeScriptId(pathFromObj);
    const id = normalizedId || rawId;
    if (!id) return null;
    return {
      id,
      name: (typeof obj.name === "string" && obj.name.trim()) || id,
      path:
        pathFromObj ||
        (typeof obj.id === "string" && obj.id.includes("/")
          ? obj.id
          : `scripts/${id}.nse`),
      protocol:
        (typeof obj.protocol === "string" && obj.protocol.trim()) || "*",
    };
  };

  if (Array.isArray(scripts)) {
    scripts.forEach((item, index) => {
      if (typeof item === "string") {
        const id = normalizeScriptId(item) || `script_${index}`;
        out.push({
          id,
          name: id,
          path: item.includes("/") ? item : `scripts/${id}.nse`,
          protocol: "*",
        });
        return;
      }

      if (item && typeof item === "object") {
        const itemObj = item as Record<string, unknown>;
        const rawId =
          (typeof itemObj.id === "string" && itemObj.id) ||
          (typeof itemObj.path === "string" && itemObj.path) ||
          `script_${index}`;
        const parsed = fromRaw(rawId, itemObj);
        if (parsed) out.push(parsed);
      }
    });
  } else if (typeof scripts === "object") {
    Object.entries(scripts as Record<string, unknown>).forEach(([rawId, rawInfo]) => {
      const parsed = fromRaw(rawId, rawInfo);
      if (parsed) out.push(parsed);
    });
  }

  // De-duplicate by canonical id (first one wins).
  const unique = new Map<string, ManifestScriptInfo>();
  out.forEach((entry) => {
    if (!unique.has(entry.id)) unique.set(entry.id, entry);
  });
  return Array.from(unique.values());
}

// Define schemas for repositories
const RepositorySchema = z.object({
  name: z.string(),
  url: z.string(),
});

const RepositoryListSchema = z.object({
  repositories: z.array(RepositorySchema),
});

// Define the NSE Manifest schema based on backend structure
const ScriptSchema = z.object({
  name: z.string(),
  path: z.string(),
  protocol: z.string(),
});

// Script content schema
const ScriptContentSchema = z.object({
  content: z.string(),
  metadata: z
    .object({
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
    .optional(),
  updatedAt: z.number().optional(),
});

// NmapScript schema for the frontend
const NmapScriptSchema = z.object({
  id: z.string(),
  name: z.string(),
  author: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
  code: z.string(),
  protocol: z.string().optional(),
  path: z.string().optional(),
});

export type NmapScript = z.infer<typeof NmapScriptSchema>;
export type Repository = z.infer<typeof RepositorySchema>;

// Default repository to use if none exists
const DEFAULT_REPOSITORIES = [
  {
    name: "sirius-nse",
    url: "https://github.com/SiriusScan/sirius-nse.git",
  },
];

export const storeRouter = createTRPCRouter({
  // Initialize NSE scripts from the sirius-nse repository
  // Read NSE scripts status from ValKey (populated by scanner at startup)
  initializeNseScripts: protectedProcedure.mutation(async () => {
    try {
      // ✅ CORRECT: Read from ValKey (scanner populates this at startup)
      // The scanner manages the sirius-nse repository and syncs to ValKey
      const manifestData = await valkey.get(NSE_MANIFEST_KEY);

      if (!manifestData) {
        console.warn(
          "No NSE manifest found in ValKey. Scanner may not have started yet."
        );
        return {
          success: false,
          count: 0,
          message:
            "No scripts found. The scanner will sync scripts when it starts.",
        };
      }

      // Parse the manifest
      const manifest = JSON.parse(manifestData);
      const manifestScripts = parseManifestScripts(manifest);
      const count = manifestScripts.length;

      console.log(
        `Found ${count} NSE scripts in ValKey (synced by scanner)`
      );

      return {
        success: count > 0,
        count,
        message:
          count > 0
            ? `Found ${count} NSE scripts (synced by scanner)`
            : "No scripts found. The scanner will sync scripts when it starts.",
      };
    } catch (error) {
      console.error("Failed to read NSE scripts from ValKey:", error);
      return {
        success: false,
        error: String(error),
        message: "Failed to read NSE scripts from ValKey",
      };
    }
  }),

  // Returns the value of a key in the store
  getValue: protectedProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const { key } = input;
      if (!isAllowedKey(key)) {
        throw new Error(`Access denied for key: ${key}`);
      }
      const value = await valkey.get(key);
      return value ?? null;
    }),

  // Sets the value of a key in the store
  setValue: protectedProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const { key, value } = input;
      if (!isAllowedKey(key)) {
        throw new Error(`Write denied for key: ${key}`);
      }
      await valkey.set(key, value);
      return true;
    }),

  // Get NSE scripts from the manifest
  getNseScripts: protectedProcedure.query(async () => {
    try {
      // Get the manifest first
      const manifestData = await valkey.get(NSE_MANIFEST_KEY);
      if (!manifestData) {
        console.warn("No NSE manifest found in ValKey");
        return [];
      }

      const manifest = JSON.parse(manifestData);
      const manifestScripts = parseManifestScripts(manifest);
      if (manifestScripts.length === 0) {
        console.warn("NSE manifest exists but contains no parseable scripts");
        return [];
      }

      // Fetch each script content in parallel
      const scriptPromises = manifestScripts.map(
        async (scriptInfo) => {
          try {
            const contentKeys = [
              `${NSE_SCRIPT_PREFIX}${scriptInfo.id}`,
              `${NSE_SCRIPT_PREFIX}${normalizeScriptId(scriptInfo.path)}`,
            ];
            let scriptContentData: string | null = null;
            for (const key of contentKeys) {
              scriptContentData = await valkey.get(key);
              if (scriptContentData) break;
            }
            let scriptContent: {
              content: string;
              metadata?: {
                author?: string;
                tags?: string[];
                description?: string;
              };
            } = {
              content: "-- No code available",
              metadata: undefined,
            };

            if (scriptContentData) {
              try {
                scriptContent = JSON.parse(scriptContentData);
              } catch (parseError) {
                console.warn(`Failed to parse script content for ${scriptInfo.id}`);
              }
            }

            return {
              id: scriptInfo.id,
              name: scriptInfo.name || scriptInfo.id,
              author: scriptContent.metadata?.author || "Unknown",
              tags: scriptContent.metadata?.tags || [
                scriptInfo.protocol || "*",
              ],
              description:
                scriptContent.metadata?.description ||
                "No description available",
              code: scriptContent.content || "-- No code available",
              protocol: scriptInfo.protocol || "*",
              path: scriptInfo.path || `scripts/${scriptInfo.id}.nse`,
            };
          } catch (error) {
            console.error(`Error processing script ${scriptInfo.id}:`, error);
            return {
              id: scriptInfo.id,
              name: scriptInfo.name || scriptInfo.id,
              author: "Unknown",
              tags: [scriptInfo.protocol || "*"],
              description: "Error loading script",
              code: "-- Error loading script content",
              protocol: scriptInfo.protocol || "*",
              path: scriptInfo.path || `scripts/${scriptInfo.id}.nse`,
            };
          }
        }
      );

      const results = await Promise.all(scriptPromises);
      return results.filter((script) => !!script.id && !!script.name);
    } catch (error) {
      console.error("Failed to fetch NSE scripts:", error);
      return [];
    }
  }),

  getNseScript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const { id } = input;

        // Get the manifest first to get script info
        const manifestData = await valkey.get(NSE_MANIFEST_KEY);
        if (!manifestData) {
          throw new Error("NSE manifest not found");
        }

        const manifest = JSON.parse(manifestData);
        const manifestScripts = parseManifestScripts(manifest);
        const normalizedRequestedId = normalizeScriptId(id);
        const scriptInfo = manifestScripts.find(
          (script) =>
            script.id === id ||
            script.id === normalizedRequestedId ||
            normalizeScriptId(script.path) === normalizedRequestedId
        );

        if (!scriptInfo) {
          throw new Error(`Script with ID ${id} not found in manifest`);
        }

        // Get the script content
        const contentKeys = [
          `${NSE_SCRIPT_PREFIX}${scriptInfo.id}`,
          `${NSE_SCRIPT_PREFIX}${normalizedRequestedId}`,
        ];
        let scriptContentData: string | null = null;
        for (const key of contentKeys) {
          scriptContentData = await valkey.get(key);
          if (scriptContentData) break;
        }
        if (!scriptContentData) {
          throw new Error(`Script content for ${scriptInfo.id} not found`);
        }

        const scriptContent = JSON.parse(scriptContentData);

        return {
          id: scriptInfo.id,
          name: scriptInfo.name || scriptInfo.id,
          author: scriptContent.metadata?.author || "Unknown",
          tags: scriptContent.metadata?.tags || [scriptInfo.protocol || "*"],
          description:
            scriptContent.metadata?.description || "No description available",
          code: scriptContent.content || "-- No code available",
          protocol: scriptInfo.protocol || "*",
          path: scriptInfo.path || `scripts/${scriptInfo.id}.nse`,
        };
      } catch (error) {
        console.error(`Failed to fetch NSE script ${input.id}:`, error);
        throw error;
      }
    }),

  updateNseScript: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        code: z.string(),
        metadata: z
          .object({
            author: z.string().optional(),
            tags: z.array(z.string()).optional(),
            description: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, code, metadata } = input;

        // Get current script content
        const scriptContentData = await valkey.get(`${NSE_SCRIPT_PREFIX}${id}`);
        if (!scriptContentData) {
          throw new Error(`Script content for ${id} not found`);
        }

        let scriptContent = JSON.parse(scriptContentData);

        // Update the code
        scriptContent.content = code;

        // Update metadata if provided
        if (metadata) {
          if (!scriptContent.metadata) {
            scriptContent.metadata = {};
          }

          if (metadata.author) {
            scriptContent.metadata.author = metadata.author;
          }

          if (metadata.tags) {
            scriptContent.metadata.tags = metadata.tags;
          }

          if (metadata.description) {
            scriptContent.metadata.description = metadata.description;
          }
        }

        // Update timestamp
        scriptContent.updatedAt = Date.now();

        // Save back to ValKey
        await valkey.set(
          `${NSE_SCRIPT_PREFIX}${id}`,
          JSON.stringify(scriptContent)
        );

        return { success: true };
      } catch (error) {
        console.error(`Failed to update NSE script ${input.id}:`, error);
        return { success: false, error: String(error) };
      }
    }),

  // Create a new NSE script (adds to manifest + stores content)
  createNseScript: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, "Script ID is required"),
        name: z.string().min(1, "Script name is required"),
        code: z.string(),
        protocol: z.string().optional().default("*"),
        metadata: z
          .object({
            author: z.string().optional(),
            tags: z.array(z.string()).optional(),
            description: z.string().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { id, name, code, protocol, metadata } = input;

        // Get or create the manifest
        let manifest: { scripts: Record<string, any> } = { scripts: {} };
        const manifestData = await valkey.get(NSE_MANIFEST_KEY);
        if (manifestData) {
          manifest = JSON.parse(manifestData);
          if (!manifest.scripts) {
            manifest.scripts = {};
          }
        }

        // Check if script ID already exists
        if (manifest.scripts[id]) {
          return {
            success: false,
            error: `Script with ID '${id}' already exists`,
          };
        }

        // Add to manifest
        manifest.scripts[id] = {
          name,
          path: `scripts/custom/${id}.nse`,
          protocol: protocol || "*",
        };

        // Store script content
        const scriptContent = {
          content: code,
          metadata: {
            author: metadata?.author || "User",
            tags: metadata?.tags || [],
            description: metadata?.description || "",
          },
          updatedAt: Date.now(),
          createdAt: Date.now(),
          custom: true, // Flag to distinguish user-created scripts
        };

        // Write both in parallel
        await Promise.all([
          valkey.set(NSE_MANIFEST_KEY, JSON.stringify(manifest)),
          valkey.set(
            `${NSE_SCRIPT_PREFIX}${id}`,
            JSON.stringify(scriptContent)
          ),
        ]);

        return { success: true, id };
      } catch (error) {
        console.error("Failed to create NSE script:", error);
        return { success: false, error: String(error) };
      }
    }),

  // Delete an NSE script (removes from manifest + deletes content)
  deleteNseScript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id } = input;

        // Get the manifest
        const manifestData = await valkey.get(NSE_MANIFEST_KEY);
        if (!manifestData) {
          return { success: false, error: "No NSE manifest found" };
        }

        const manifest = JSON.parse(manifestData);
        if (!manifest.scripts || !manifest.scripts[id]) {
          return {
            success: false,
            error: `Script '${id}' not found in manifest`,
          };
        }

        // Remove from manifest
        delete manifest.scripts[id];

        // Delete content and update manifest in parallel
        await Promise.all([
          valkey.set(NSE_MANIFEST_KEY, JSON.stringify(manifest)),
          valkey.del(`${NSE_SCRIPT_PREFIX}${id}`),
        ]);

        return { success: true };
      } catch (error) {
        console.error(`Failed to delete NSE script ${input.id}:`, error);
        return { success: false, error: String(error) };
      }
    }),

  // Repository management procedures
  getNseRepositories: protectedProcedure.query(async () => {
    try {
      const repoData = await valkey.get(NSE_REPO_MANIFEST_KEY);
      if (!repoData) {
        console.warn("No repository manifest found");
        return { repositories: DEFAULT_REPOSITORIES };
      }

      const repoManifest = JSON.parse(repoData);
      return repoManifest;
    } catch (error) {
      console.error("Failed to fetch NSE repositories:", error);
      return { repositories: DEFAULT_REPOSITORIES };
    }
  }),

  addNseRepository: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Repository name is required"),
        url: z.string().url("Must be a valid Git URL"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { name, url } = input;

        // Get current repositories
        const repoData = await valkey.get(NSE_REPO_MANIFEST_KEY);
        let repoManifest;

        if (!repoData) {
          repoManifest = { repositories: [] };
        } else {
          repoManifest = JSON.parse(repoData);
        }

        // Check if repository with this name already exists
        const exists = repoManifest.repositories.some(
          (repo: Repository) => repo.name === name
        );

        if (exists) {
          return {
            success: false,
            error: `Repository '${name}' already exists`,
          };
        }

        // Add the new repository
        repoManifest.repositories.push({ name, url });

        // Save back to ValKey
        await valkey.set(NSE_REPO_MANIFEST_KEY, JSON.stringify(repoManifest));

        return { success: true };
      } catch (error) {
        console.error("Failed to add NSE repository:", error);
        return { success: false, error: String(error) };
      }
    }),

  removeNseRepository: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { name } = input;

        // Get current repositories
        const repoData = await valkey.get(NSE_REPO_MANIFEST_KEY);
        if (!repoData) {
          return {
            success: false,
            error: "No repository manifest found",
          };
        }

        const repoManifest = JSON.parse(repoData);

        // Filter out the repository to remove
        const initialCount = repoManifest.repositories.length;
        repoManifest.repositories = repoManifest.repositories.filter(
          (repo: Repository) => repo.name !== name
        );

        // If nothing was removed, return an error
        if (initialCount === repoManifest.repositories.length) {
          return {
            success: false,
            error: `Repository '${name}' not found`,
          };
        }

        // Save back to ValKey
        await valkey.set(NSE_REPO_MANIFEST_KEY, JSON.stringify(repoManifest));

        return { success: true };
      } catch (error) {
        console.error("Failed to remove NSE repository:", error);
        return { success: false, error: String(error) };
      }
    }),

  // Initialize repositories (if none exist)
  initializeNseRepositories: protectedProcedure.mutation(async () => {
    try {
      // Check if repositories already exist
      const repoData = await valkey.get(NSE_REPO_MANIFEST_KEY);
      if (repoData) {
        return {
          success: true,
          message: "Repositories already initialized",
        };
      }

      // Create default repository list
      const defaultRepoManifest = {
        repositories: DEFAULT_REPOSITORIES,
      };

      // Save to ValKey
      await valkey.set(
        NSE_REPO_MANIFEST_KEY,
        JSON.stringify(defaultRepoManifest)
      );

      return {
        success: true,
        message: "Successfully initialized repository manifest",
      };
    } catch (error) {
      console.error("Failed to initialize repositories:", error);
      return { success: false, error: String(error) };
    }
  }),
});

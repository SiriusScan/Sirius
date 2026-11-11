import { safeErrorForLogging } from "~/server/safeErrorForLogging";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { isProtectedNseKey, mutateNseScript, parseNseManifest, readNseScriptContent } from "~/server/nseMutations";
import { DEFAULT_REPOSITORIES, NSE_REPO_MANIFEST_KEY, mutateNseRepository } from "~/server/nseRepositories";
import { valkey } from "~/server/valkey";
import { canonicalizeScriptId as normalizeScriptId } from "~/utils/nseScriptIds";

// Key constants to match backend
const NSE_MANIFEST_KEY = "nse:manifest";
const ALLOWED_KEY_PREFIXES = ["nse:", "currentScan", "agent_scan:"] as const;

function isAllowedKey(key: string): boolean {
  return ALLOWED_KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

type ManifestScriptInfo = {
  id: string;
  rawId: string;
  name: string;
  path: string;
  protocol: string;
};

function parseManifestScripts(manifest: unknown): ManifestScriptInfo[] {
  const parsed = parseNseManifest(JSON.stringify(manifest));
  return Object.entries(parsed.scripts).map(([rawId, info]) => {
    const id = normalizeScriptId(rawId);
    return {
      id, rawId,
      name: typeof info.name === "string" && info.name ? info.name : id,
      path: typeof info.path === "string" && info.path ? info.path : `scripts/${id}.nse`,
      protocol: typeof info.protocol === "string" && info.protocol ? info.protocol : "*",
    };
  });
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
      console.error(
        "Failed to read NSE scripts from ValKey:",
        safeErrorForLogging(error)
      );
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
      if (!isAllowedKey(key) || isProtectedNseKey(key) || key === NSE_REPO_MANIFEST_KEY) {
        throw new Error(`Write denied for key: ${key}; use the NSE mutations`);
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
            const scriptContent = await readNseScriptContent(valkey, scriptInfo.rawId);

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
            console.error(
              `Error processing script ${scriptInfo.id}:`,
              safeErrorForLogging(error)
            );
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
      console.error("Failed to fetch NSE scripts:", safeErrorForLogging(error));
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
            script.id === normalizedRequestedId
        );

        if (!scriptInfo) {
          throw new Error(`Script with ID ${id} not found in manifest`);
        }

        const scriptContent = await readNseScriptContent(valkey, scriptInfo.rawId);

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
        console.error(
          `Failed to fetch NSE script ${input.id}:`,
          safeErrorForLogging(error)
        );
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
        await mutateNseScript(valkey, { type: "update", ...input });

        return { success: true };
      } catch (error) {
        console.error(
          `Failed to update NSE script ${input.id}:`,
          safeErrorForLogging(error)
        );
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
        const id = await mutateNseScript(valkey, { type: "create", ...input });

        return { success: true, id };
      } catch (error) {
        console.error(
          "Failed to create NSE script:",
          safeErrorForLogging(error)
        );
        return { success: false, error: String(error) };
      }
    }),

  // Delete an NSE script (removes from manifest + deletes content)
  deleteNseScript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        await mutateNseScript(valkey, { type: "delete", ...input });

        return { success: true };
      } catch (error) {
        console.error(
          `Failed to delete NSE script ${input.id}:`,
          safeErrorForLogging(error)
        );
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
      console.error(
        "Failed to fetch NSE repositories:",
        safeErrorForLogging(error)
      );
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
        await mutateNseRepository(valkey, { type: "add", ...input });

        return { success: true };
      } catch (error) {
        console.error(
          "Failed to add NSE repository:",
          safeErrorForLogging(error)
        );
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
        await mutateNseRepository(valkey, { type: "remove", ...input });

        return { success: true };
      } catch (error) {
        console.error(
          "Failed to remove NSE repository:",
          safeErrorForLogging(error)
        );
        return { success: false, error: String(error) };
      }
    }),

  // Initialize repositories (if none exist)
  initializeNseRepositories: protectedProcedure.mutation(async () => {
    try {
      const initialized = await mutateNseRepository(valkey, { type: "initialize" });
      return {
        success: true,
        message: initialized
          ? "Successfully initialized repository manifest"
          : "Repositories already initialized",
      };
    } catch (error) {
      console.error(
        "Failed to initialize repositories:",
        safeErrorForLogging(error)
      );
      return { success: false, error: String(error) };
    }
  }),
});

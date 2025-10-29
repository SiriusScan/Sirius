import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import Valkey from "iovalkey";
import { fallbackScripts } from "~/components/scanner/nmap/mockScriptsData";

const valkey = new Valkey({
  port: 6379,
  host: "sirius-valkey",
});

// Key constants to match backend
const NSE_MANIFEST_KEY = "nse:manifest";
const NSE_REPO_MANIFEST_KEY = "nse:repo-manifest";
const NSE_SCRIPT_PREFIX = "nse:script:";

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
  initializeNseScripts: publicProcedure.mutation(async () => {
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
      const scripts = manifest.scripts || {};

      // Count scripts (handle both object and array formats)
      const count = Array.isArray(scripts)
        ? scripts.length
        : Object.keys(scripts).length;

      console.log(
        `Found ${count} NSE scripts in ValKey (synced by scanner)`
      );

      return {
        success: true,
        count,
        message: `Found ${count} NSE scripts (synced by scanner)`,
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
  getValue: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const { key } = input;
      const value = await valkey.get(key);
      return value ?? null;
    }),

  // Sets the value of a key in the store
  setValue: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input }) => {
      const { key, value } = input;
      try {
        await valkey.set(key, value);
        console.log("Value set successfully");
      } catch (error) {
        console.error("Error setting value:", error);
      }

      return true;
    }),

  // Get NSE scripts from the manifest
  getNseScripts: publicProcedure.query(async () => {
    try {
      // Get the manifest first
      const manifestData = await valkey.get(NSE_MANIFEST_KEY);
      if (!manifestData) {
        console.warn("No NSE manifest found in ValKey");
        return [];
      }

      const manifest = JSON.parse(manifestData);
      const scripts = manifest.scripts || {};

      // Fetch each script content in parallel
      const scriptPromises = Object.entries(scripts).map(
        async ([id, scriptInfo]: [string, any]) => {
          try {
            const scriptContentData = await valkey.get(
              `${NSE_SCRIPT_PREFIX}${id}`
            );
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
                console.warn(`Failed to parse script content for ${id}`);
              }
            }

            return {
              id,
              name: scriptInfo.name || id,
              author: scriptContent.metadata?.author || "Unknown",
              tags: scriptContent.metadata?.tags || [
                scriptInfo.protocol || "*",
              ],
              description:
                scriptContent.metadata?.description ||
                "No description available",
              code: scriptContent.content || "-- No code available",
              protocol: scriptInfo.protocol || "*",
              path: scriptInfo.path || `scripts/${id}.nse`,
            };
          } catch (error) {
            console.error(`Error processing script ${id}:`, error);
            return {
              id,
              name: scriptInfo.name || id,
              author: "Unknown",
              tags: [scriptInfo.protocol || "*"],
              description: "Error loading script",
              code: "-- Error loading script content",
              protocol: scriptInfo.protocol || "*",
              path: scriptInfo.path || `scripts/${id}.nse`,
            };
          }
        }
      );

      const results = await Promise.all(scriptPromises);
      return results;
    } catch (error) {
      console.error("Failed to fetch NSE scripts:", error);
      return [];
    }
  }),

  getNseScript: publicProcedure
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
        const scriptInfo = manifest.scripts?.[id];

        if (!scriptInfo) {
          throw new Error(`Script with ID ${id} not found in manifest`);
        }

        // Get the script content
        const scriptContentData = await valkey.get(`${NSE_SCRIPT_PREFIX}${id}`);
        if (!scriptContentData) {
          throw new Error(`Script content for ${id} not found`);
        }

        const scriptContent = JSON.parse(scriptContentData);

        return {
          id,
          name: scriptInfo.name || id,
          author: scriptContent.metadata?.author || "Unknown",
          tags: scriptContent.metadata?.tags || [scriptInfo.protocol || "*"],
          description:
            scriptContent.metadata?.description || "No description available",
          code: scriptContent.content || "-- No code available",
          protocol: scriptInfo.protocol || "*",
          path: scriptInfo.path || `scripts/${id}.nse`,
        };
      } catch (error) {
        console.error(`Failed to fetch NSE script ${input.id}:`, error);
        throw error;
      }
    }),

  updateNseScript: publicProcedure
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

  // Repository management procedures
  getNseRepositories: publicProcedure.query(async () => {
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

  addNseRepository: publicProcedure
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

  removeNseRepository: publicProcedure
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
  initializeNseRepositories: publicProcedure.mutation(async () => {
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

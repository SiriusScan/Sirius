import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { API_BASE_URL, apiFetch } from "~/server/api/shared/apiClient";
import { readApiJson, requireApiOk } from "~/server/api/shared/apiErrors";

// Script interfaces
export interface Script {
  id: string;
  name: string;
  path: string;
  protocol: string;
  content?: ScriptContent;
}

export interface ScriptContent {
  content: string;
  metadata: {
    author: string;
    tags: string[];
    description: string;
  };
  updated_at: number;
}

// Zod schemas for validation
const scriptMetadataSchema = z.object({
  author: z.string(),
  tags: z.array(z.string()),
  description: z.string(),
});

const scriptContentSchema = z.object({
  content: z.string(),
  metadata: scriptMetadataSchema,
  updated_at: z.number().optional(),
});

const scriptSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  protocol: z.string(),
  content: scriptContentSchema.optional(),
});

export const scriptsRouter = createTRPCRouter({
  // Get all scripts
  getScripts: protectedProcedure.query(async () => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/scripts`);

      requireApiOk(response, "Failed to fetch scripts");

      const scripts = (await readApiJson(response)) as Script[];
      return scripts;
    } catch (error) {
      console.error("Error fetching scripts:", error);
      throw new Error("Failed to fetch scripts");
    }
  }),

  // Get a single script by ID (with content)
  getScript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/scripts/${input.id}`);

        if (response.status === 404) {
          return null;
        }
        requireApiOk(response, "Failed to fetch script");

        const script = (await readApiJson(response)) as Script;
        return script;
      } catch (error) {
        console.error("Error fetching script:", error);
        throw new Error("Failed to fetch script");
      }
    }),

  // Update script content
  updateScript: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: scriptContentSchema.omit({ updated_at: true }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/scripts/${input.id}`, {
          method: "PUT",
          body: JSON.stringify(input.content),
        });

        requireApiOk(response, "Failed to update script");

        const result = await readApiJson(response);
        return result;
      } catch (error) {
        console.error("Error updating script:", error);
        throw error;
      }
    }),

  // Create a new custom script
  createScript: protectedProcedure
    .input(scriptSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/scripts`, {
          method: "POST",
          body: JSON.stringify(input),
        });

        requireApiOk(response, "Failed to create script");

        const script = (await readApiJson(response)) as Script;
        return script;
      } catch (error) {
        console.error("Error creating script:", error);
        throw error;
      }
    }),

  // Delete a custom script
  deleteScript: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/scripts/${input.id}`, {
          method: "DELETE",
        });

        requireApiOk(response, "Failed to delete script");

        return { success: true };
      } catch (error) {
        console.error("Error deleting script:", error);
        throw error;
      }
    }),
});




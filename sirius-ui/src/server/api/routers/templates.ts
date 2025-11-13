import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";

const API_BASE_URL = env.SIRIUS_API_URL || "http://localhost:9001";

// Template interfaces
export interface Template {
  id: string;
  name: string;
  description: string;
  type: "system" | "custom";
  enabled_scripts: string[];
  scan_options: {
    scan_types: string[];
    port_range: string;
    aggressive: boolean;
    max_retries: number;
    parallel: boolean;
    exclude_ports?: string[];
  };
  created_at: string;
  updated_at: string;
}

// Zod schemas for validation
const templateOptionsSchema = z.object({
  scan_types: z.array(z.string()),
  port_range: z.string(),
  aggressive: z.boolean(),
  max_retries: z.number(),
  parallel: z.boolean(),
  exclude_ports: z.array(z.string()).optional(),
});

const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(["system", "custom"]),
  enabled_scripts: z.array(z.string()),
  scan_options: templateOptionsSchema,
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const templatesRouter = createTRPCRouter({
  // Get all templates
  getTemplates: publicProcedure.query(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/templates`);

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const templates = (await response.json()) as Template[];
      return templates;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw new Error("Failed to fetch templates");
    }
  }),

  // Get a single template by ID
  getTemplate: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates/${input.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }

        const template = (await response.json()) as Template;
        return template;
      } catch (error) {
        console.error("Error fetching template:", error);
        throw new Error("Failed to fetch template");
      }
    }),

  // Create a new template
  createTemplate: publicProcedure
    .input(templateSchema.omit({ created_at: true, updated_at: true }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to create template");
        }

        const template = (await response.json()) as Template;
        return template;
      } catch (error) {
        console.error("Error creating template:", error);
        throw error;
      }
    }),

  // Update an existing template
  updateTemplate: publicProcedure
    .input(templateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates/${input.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update template");
        }

        const template = (await response.json()) as Template;
        return template;
      } catch (error) {
        console.error("Error updating template:", error);
        throw error;
      }
    }),

  // Delete a template
  deleteTemplate: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(`${API_BASE_URL}/templates/${input.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete template");
        }

        return { success: true };
      } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
      }
    }),
});




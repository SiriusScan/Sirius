import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  staffProcedure,
} from "~/server/api/trpc";
import type { AgentScanConfig } from "~/types/scanTypes";
import { API_BASE_URL, apiFetch } from "~/server/api/shared/apiClient";

// Agent scan config interface - duplicates AgentScanConfig from scanTypes.ts
// Kept for Zod schema compatibility, but uses canonical type for actual data
export type AgentScanConfigData = AgentScanConfig;

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
    agent_scan?: AgentScanConfigData;
  };
  created_at: string;
  updated_at: string;
}

// Zod schemas for validation
const agentScanConfigSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(["comprehensive", "templates-only", "scripts-only"]),
  agent_ids: z.array(z.string()),
  timeout: z.number(),
  concurrency: z.number(),
  template_filter: z.array(z.string()).optional(),
});

const templateOptionsSchema = z.object({
  scan_types: z.array(z.string()),
  port_range: z.string(),
  aggressive: z.boolean(),
  max_retries: z.number(),
  parallel: z.boolean(),
  exclude_ports: z.array(z.string()).optional(),
  agent_scan: agentScanConfigSchema.optional(),
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
  // Get all templates (students: system defaults only)
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/templates`);

      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }

      const templates = (await response.json()) as Template[];
      if (ctx.session.user.role === "student") {
        return templates.filter((t) => t.type === "system");
      }
      return templates;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw new Error("Failed to fetch templates");
    }
  }),

  // Get a single template by ID (students: system templates only)
  getTemplate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/templates/${input.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }

        const template = (await response.json()) as Template;
        if (
          ctx.session.user.role === "student" &&
          template.type !== "system"
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not available for student accounts",
          });
        }
        return template;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Error fetching template:", error);
        throw new Error("Failed to fetch template");
      }
    }),

  // Create a new template
  createTemplate: staffProcedure
    .input(templateSchema.omit({ created_at: true, updated_at: true }))
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/templates`, {
          method: "POST",
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
  updateTemplate: staffProcedure
    .input(templateSchema.partial().extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/templates/${input.id}`, {
          method: "PUT",
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
  deleteTemplate: staffProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/templates/${input.id}`, {
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




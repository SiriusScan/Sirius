import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type {
  AgentTemplate,
  ValidationResult,
  TemplateTestResult,
  TemplateAnalytics,
} from "~/types/agentTemplateTypes";
import { API_BASE_URL, apiFetch } from "~/server/api/shared/apiClient";
import { readApiJson, requireApiOk } from "~/server/api/shared/apiErrors";

// Zod schemas for validation
const templateIdSchema = z.object({
  id: z.string(),
});

const uploadTemplateSchema = z.object({
  content: z.string(),
  filename: z.string(),
  author: z.string().optional(),
});

const validateTemplateSchema = z.object({
  content: z.string(),
});

const updateTemplateSchema = z.object({
  id: z.string(),
  content: z.string(),
  filename: z.string().optional(),
  author: z.string().optional(),
});

const testTemplateSchema = z.object({
  templateId: z.string(),
  agentId: z.string(),
});

const deployTemplateSchema = z.object({
  templateId: z.string(),
  agentIds: z.array(z.string()),
});

export const agentTemplatesRouter = createTRPCRouter({
  // Get all agent templates
  getTemplates: protectedProcedure.query(async (): Promise<AgentTemplate[]> => {
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/agent-templates`);
      requireApiOk(response, "Failed to fetch templates");
      return (await readApiJson(response)) as AgentTemplate[];
    } catch (error) {
      console.error("Error fetching agent templates:", error);
      return [];
    }
  }),

  // Get single template by ID
  getTemplate: protectedProcedure
    .input(templateIdSchema)
    .query(async ({ input }): Promise<AgentTemplate | null> => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}`
        );
        if (response.status === 404) {
          return null;
        }
        requireApiOk(response, "Failed to fetch template");
        return (await readApiJson(response)) as AgentTemplate;
      } catch (error) {
        console.error("Error fetching agent template:", error);
        return null;
      }
    }),

  // Upload custom template
  uploadTemplate: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        filename: z.string(),
        author: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Send as JSON (backend expects JSON, not FormData)
        const response = await apiFetch(`${API_BASE_URL}/api/agent-templates`, {
          method: "POST",
          body: JSON.stringify({
            content: input.content,
            filename: input.filename,
            author: input.author,
          }),
        });

        requireApiOk(response, "Failed to upload template");

        return await readApiJson(response);
      } catch (error) {
        console.error("Error uploading template:", error);
        throw error;
      }
    }),

  // Validate template without saving
  validateTemplate: protectedProcedure
    .input(validateTemplateSchema)
    .mutation(async ({ input }): Promise<ValidationResult> => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          }
        );

        requireApiOk(response, "Validation request failed");

        return (await readApiJson(response)) as ValidationResult;
      } catch (error) {
        console.error("Error validating template:", error);
        return {
          valid: false,
          errors: ["Failed to validate template"],
          warnings: [],
        };
      }
    }),

  // Update custom template
  updateTemplate: protectedProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: input.content,
              filename: input.filename,
              author: input.author,
            }),
          }
        );

        requireApiOk(response, "Failed to update template");

        return await readApiJson(response);
      } catch (error) {
        console.error("Error updating template:", error);
        throw error;
      }
    }),

  // Delete custom template
  deleteTemplate: protectedProcedure
    .input(templateIdSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}`,
          {
            method: "DELETE",
          }
        );

        requireApiOk(response, "Failed to delete template");

        return await readApiJson(response);
      } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
      }
    }),

  // Test template on agent
  testTemplate: protectedProcedure
    .input(testTemplateSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/${input.templateId}/test`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ agent_id: input.agentId }),
          }
        );

        requireApiOk(response, "Failed to test template");

        return await readApiJson(response);
      } catch (error) {
        console.error("Error testing template:", error);
        throw error;
      }
    }),

  // Deploy template to specific agents
  deployTemplate: protectedProcedure
    .input(deployTemplateSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/${input.templateId}/deploy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ agent_ids: input.agentIds }),
          }
        );

        requireApiOk(response, "Failed to deploy template");

        return await readApiJson(response);
      } catch (error) {
        console.error("Error deploying template:", error);
        throw error;
      }
    }),

  // Get template analytics
  getAnalytics: protectedProcedure.query(async (): Promise<TemplateAnalytics> => {
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/api/agent-templates/analytics`
      );

      requireApiOk(response, "Failed to fetch analytics");

      return (await readApiJson(response)) as TemplateAnalytics;
    } catch (error) {
      console.error("Error fetching template analytics:", error);
      return {
        top_templates: [],
        execution_stats: {
          total_executions: 0,
          total_detections: 0,
          average_execution_time_ms: 0,
        },
        platform_distribution: {} as Record<string, number>,
      };
    }
  }),

  // Get historical results for a template
  getTemplateResults: protectedProcedure
    .input(templateIdSchema)
    .query(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}/results`
        );

        requireApiOk(response, "Failed to fetch results");

        return await readApiJson(response);
      } catch (error) {
        console.error("Error fetching template results:", error);
        return {
          template_id: input.id,
          results: [],
        };
      }
    }),
});

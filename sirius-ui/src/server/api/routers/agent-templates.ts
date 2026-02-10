import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import type {
  AgentTemplate,
  ValidationResult,
  TemplateTestResult,
  TemplateAnalytics,
} from "~/types/agentTemplateTypes";
import { API_BASE_URL } from "~/server/api/shared/apiClient";

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
  getTemplates: publicProcedure.query(async (): Promise<AgentTemplate[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agent-templates`);
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.statusText}`);
      }
      return (await response.json()) as AgentTemplate[];
    } catch (error) {
      console.error("Error fetching agent templates:", error);
      return [];
    }
  }),

  // Get single template by ID
  getTemplate: publicProcedure
    .input(templateIdSchema)
    .query(async ({ input }): Promise<AgentTemplate | null> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Failed to fetch template: ${response.statusText}`);
        }
        return (await response.json()) as AgentTemplate;
      } catch (error) {
        console.error("Error fetching agent template:", error);
        return null;
      }
    }),

  // Upload custom template
  uploadTemplate: publicProcedure
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
        const response = await fetch(`${API_BASE_URL}/api/agent-templates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: input.content,
            filename: input.filename,
            author: input.author,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload template");
        }

        return await response.json();
      } catch (error) {
        console.error("Error uploading template:", error);
        throw error;
      }
    }),

  // Validate template without saving
  validateTemplate: publicProcedure
    .input(validateTemplateSchema)
    .mutation(async ({ input }): Promise<ValidationResult> => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/validate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          }
        );

        if (!response.ok) {
          throw new Error(`Validation request failed: ${response.statusText}`);
        }

        return (await response.json()) as ValidationResult;
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
  updateTemplate: publicProcedure
    .input(updateTemplateSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: input.content }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update template");
        }

        return await response.json();
      } catch (error) {
        console.error("Error updating template:", error);
        throw error;
      }
    }),

  // Delete custom template
  deleteTemplate: publicProcedure
    .input(templateIdSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete template");
        }

        return await response.json();
      } catch (error) {
        console.error("Error deleting template:", error);
        throw error;
      }
    }),

  // Test template on agent
  testTemplate: publicProcedure
    .input(testTemplateSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/${input.templateId}/test`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ agent_id: input.agentId }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to test template");
        }

        return await response.json();
      } catch (error) {
        console.error("Error testing template:", error);
        throw error;
      }
    }),

  // Deploy template to specific agents
  deployTemplate: publicProcedure
    .input(deployTemplateSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/${input.templateId}/deploy`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ agent_ids: input.agentIds }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to deploy template");
        }

        return await response.json();
      } catch (error) {
        console.error("Error deploying template:", error);
        throw error;
      }
    }),

  // Get template analytics
  getAnalytics: publicProcedure.query(async (): Promise<TemplateAnalytics> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/agent-templates/analytics`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      return (await response.json()) as TemplateAnalytics;
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
  getTemplateResults: publicProcedure
    .input(templateIdSchema)
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/agent-templates/${input.id}/results`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch results: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching template results:", error);
        return {
          template_id: input.id,
          results: [],
        };
      }
    }),
});

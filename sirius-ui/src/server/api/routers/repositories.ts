import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import type { Repository, SyncStatus } from "~/types/repositoryTypes";
import { API_BASE_URL, apiFetch } from "~/server/api/shared/apiClient";

// Zod schemas for validation
const addRepositorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL"),
  branch: z.string().min(1, "Branch is required"),
  priority: z.number().int().positive(),
  enabled: z.boolean(),
});

const updateRepositorySchema = z.object({
  id: z.string(),
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  branch: z.string().min(1).optional(),
  priority: z.number().int().positive().optional(),
  enabled: z.boolean().optional(),
});

const repositoryIdSchema = z.object({
  id: z.string(),
});

export const repositoriesRouter = createTRPCRouter({
  // Get all repositories
  list: protectedProcedure.query(async (): Promise<Repository[]> => {
    try {
      const response = await apiFetch(
        `${API_BASE_URL}/api/agent-templates/repositories`
      );

      if (!response.ok) {
        console.error("Failed to fetch repositories:", response.status);
        return []; // Return empty array on error
      }

      return (await response.json()) as Repository[];
    } catch (error) {
      console.error("Error fetching repositories:", error);
      return [];
    }
  }),

  // Add new repository
  add: protectedProcedure
    .input(addRepositorySchema)
    .mutation(async ({ input }): Promise<Repository> => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/repositories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(input),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to add repository");
        }

        return (await response.json()) as Repository;
      } catch (error) {
        console.error("Error adding repository:", error);
        throw error;
      }
    }),

  // Update repository
  update: protectedProcedure
    .input(updateRepositorySchema)
    .mutation(async ({ input }): Promise<Repository> => {
      try {
        const { id, ...updates } = input;
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/repositories/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update repository");
        }

        return (await response.json()) as Repository;
      } catch (error) {
        console.error("Error updating repository:", error);
        throw error;
      }
    }),

  // Delete repository
  delete: protectedProcedure
    .input(repositoryIdSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/repositories/${input.id}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to delete repository");
        }

        return await response.json();
      } catch (error) {
        console.error("Error deleting repository:", error);
        throw error;
      }
    }),

  // Trigger repository sync
  sync: protectedProcedure
    .input(repositoryIdSchema)
    .mutation(async ({ input }) => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/repositories/${input.id}/sync`,
          {
            method: "POST",
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to start sync");
        }

        return await response.json();
      } catch (error) {
        console.error("Error starting sync:", error);
        throw error;
      }
    }),

  // Get sync status
  getSyncStatus: protectedProcedure
    .input(repositoryIdSchema)
    .query(async ({ input }): Promise<SyncStatus | null> => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/api/agent-templates/repositories/${input.id}/sync-status`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error("Failed to fetch sync status");
        }

        return (await response.json()) as SyncStatus;
      } catch (error) {
        console.error("Error fetching sync status:", error);
        return null;
      }
    }),
});

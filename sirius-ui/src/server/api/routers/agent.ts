import axios from "axios";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { handleSendMsg, waitForResponse } from "./queue";

// Create an axios instance for Go API
const httpClient = axios.create({
  baseURL: env.SIRIUS_API_URL,
  timeout: 5000,
});

// Agent with host information
export type AgentWithHost = {
  id: string;
  name?: string | null;
  status?: string | null;
  lastSeen?: string | null;
  host?: {
    ip?: string;
    hostname?: string;
    os?: string;
    osVersion?: string;
  } | null;
};

export const agentRouter = createTRPCRouter({
  // Get list of agents with their associated host information
  listAgentsWithHosts: protectedProcedure.query(async ({ ctx }) => {
    try {
      // First get the list of connected agents from the terminal service
      const message = JSON.stringify({
        action: "list_agents",
        userId: ctx.session.user.id,
        timestamp: new Date().toISOString(),
      });

      await handleSendMsg("agent_commands", message);
      const response = await waitForResponse("agent_response");

      let connectedAgentIds: string[] = [];
      try {
        connectedAgentIds = JSON.parse(response);
        if (!Array.isArray(connectedAgentIds)) {
          console.error(
            "[Agent] Invalid agent list response format:",
            response
          );
          connectedAgentIds = [];
        }
      } catch (error) {
        console.error("[Agent] Failed to parse agent list response:", error);
        connectedAgentIds = [];
      }

      // Now get host information for these agents
      const agentsWithHosts: AgentWithHost[] = [];

      // Get all hosts from the database
      try {
        const hostsResponse = await httpClient.get("host/");
        const hosts = hostsResponse.data;

        // Create a map of hosts by their potential agent IDs
        const hostMap = new Map();
        if (Array.isArray(hosts)) {
          hosts.forEach((host: any) => {
            // Match hosts by hostname or IP that might correspond to agent IDs
            hostMap.set(host.hostname, host);
            hostMap.set(host.ip, host);
            hostMap.set(host.hid, host);
          });
        }

        // Build agent list with host information
        for (const agentId of connectedAgentIds) {
          const agent: AgentWithHost = {
            id: agentId,
            name: agentId, // Use ID as name for now
            status: "online", // Since they're in the connected list
            lastSeen: new Date().toISOString(),
            host: null,
          };

          // Try to find matching host information
          const matchingHost = hostMap.get(agentId);
          if (matchingHost) {
            agent.host = {
              ip: matchingHost.ip,
              hostname: matchingHost.hostname,
              os: matchingHost.os,
              osVersion: matchingHost.osversion,
            };
          }

          agentsWithHosts.push(agent);
        }

        return agentsWithHosts;
      } catch (hostError) {
        console.error("[Agent] Failed to fetch host data:", hostError);

        // Fallback: return basic agent info without host data
        return connectedAgentIds.map((id) => ({
          id,
          name: id,
          status: "online" as const,
          lastSeen: new Date().toISOString(),
          host: null,
        }));
      }
    } catch (error) {
      console.error("[Agent] Failed to list agents with hosts:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve agent information",
      });
    }
  }),

  // Get detailed information for a specific agent
  getAgentDetails: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      try {
        const { agentId } = input;

        // Try to find host information for this agent
        const hostsResponse = await httpClient.get("host/");
        const hosts = hostsResponse.data;

        if (Array.isArray(hosts)) {
          const matchingHost = hosts.find(
            (host: any) =>
              host.hostname === agentId ||
              host.ip === agentId ||
              host.hid === agentId
          );

          if (matchingHost) {
            return {
              id: agentId,
              name: matchingHost.hostname || agentId,
              status: "online",
              lastSeen: new Date().toISOString(),
              host: {
                ip: matchingHost.ip,
                hostname: matchingHost.hostname,
                os: matchingHost.os,
                osVersion: matchingHost.osversion,
              },
            };
          }
        }

        // Fallback if no host found
        return {
          id: agentId,
          name: agentId,
          status: "online",
          lastSeen: new Date().toISOString(),
          host: null,
        };
      } catch (error) {
        console.error("[Agent] Failed to get agent details:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve agent details",
        });
      }
    }),

  // Get all templates from the agent
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const message = JSON.stringify({
        action: "list_templates",
        userId: ctx.session.user.id,
        timestamp: new Date().toISOString(),
      });

      await handleSendMsg("agent_commands", message);
      const response = await waitForResponse("agent_response");

      try {
        // First parse the CommandResponse wrapper
        const commandResponse = JSON.parse(response);

        if (!commandResponse.success) {
          console.error(
            "[Agent] List templates command failed:",
            commandResponse.error
          );
          return [];
        }

        // Parse the actual templates from the message field
        const templates = JSON.parse(commandResponse.message || "[]");
        return Array.isArray(templates) ? templates : [];
      } catch (error) {
        console.error("[Agent] Failed to parse templates response:", error);
        return [];
      }
    } catch (error) {
      console.error("[Agent] Failed to get templates:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve templates",
      });
    }
  }),

  // Discover templates from all sources
  discoverTemplates: protectedProcedure.query(async ({ ctx }) => {
    try {
      const message = JSON.stringify({
        action: "discover_templates",
        userId: ctx.session.user.id,
        timestamp: new Date().toISOString(),
      });

      await handleSendMsg("agent_commands", message);
      const response = await waitForResponse("agent_response");

      try {
        // First parse the CommandResponse wrapper
        const commandResponse = JSON.parse(response);

        if (!commandResponse.success) {
          console.error(
            "[Agent] Discovery command failed:",
            commandResponse.error
          );
          throw new Error(commandResponse.error || "Discovery command failed");
        }

        // Parse the actual discovery result from the message field
        const discoveryResult = JSON.parse(commandResponse.message || "{}");
        return discoveryResult;
      } catch (error) {
        console.error("[Agent] Failed to parse discovery response:", error);
        return {
          templates: [],
          sources: {},
          statistics: {
            total_templates: 0,
            custom_templates: 0,
            repository_templates: 0,
            local_templates: 0,
            active_templates: 0,
            last_sync_time: new Date().toISOString(),
          },
          errors: [],
          last_discovery: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error("[Agent] Failed to discover templates:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to discover templates",
      });
    }
  }),

  // NEW: Get templates directly from ValKey
  getTemplatesFromValKey: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Import IOValkey client
      const IOValkey = (await import("iovalkey")).default;
      const client = new IOValkey({
        host: process.env.VALKEY_HOST || "sirius-valkey",
        port: parseInt(process.env.VALKEY_PORT || "6379"),
      });

      try {
        // Get all template metadata keys
        const metaKeys = await client.keys("agent:template:meta:*");

        const templates = [];
        for (const metaKey of metaKeys) {
          try {
            // Extract template ID
            const templateId = metaKey.replace("agent:template:meta:", "");

            // Get template metadata and content
            const [metaResponse, contentResponse] = await Promise.all([
              client.get(metaKey),
              client.get(`agent:template:${templateId}`),
            ]);

            if (metaResponse) {
              const metadata = JSON.parse(metaResponse);
              let templateContent = null;

              // Parse template content to extract missing metadata
              if (contentResponse) {
                try {
                  const contentData = JSON.parse(contentResponse);
                  if (contentData.content) {
                    // Parse YAML content to get info section
                    const yaml = await import("yaml");
                    templateContent = yaml.parse(contentData.content);
                  }
                } catch (contentError) {
                  console.warn(
                    `Failed to parse template content for ${templateId}:`,
                    contentError
                  );
                }
              }

              templates.push({
                id: metadata.id || templateId,
                name:
                  metadata.name || templateContent?.info?.name || templateId,
                description:
                  metadata.description ||
                  templateContent?.info?.description ||
                  "No description available",
                severity:
                  metadata.severity ||
                  templateContent?.info?.severity ||
                  "unknown",
                type:
                  metadata.category ||
                  templateContent?.detection?.type ||
                  "unknown",
                source: metadata.source,
              });
            }
          } catch (error) {
            console.warn(`Failed to load template ${metaKey}:`, error);
            // Continue with other templates
          }
        }

        return templates;
      } finally {
        client.disconnect();
      }
    } catch (error) {
      console.error("[ValKey] Failed to get templates:", error);
      return [];
    }
  }),

  // NEW: Discover templates directly from ValKey
  discoverTemplatesFromValKey: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Import IOValkey client
      const IOValkey = (await import("iovalkey")).default;
      const client = new IOValkey({
        host: process.env.VALKEY_HOST || "sirius-valkey",
        port: parseInt(process.env.VALKEY_PORT || "6379"),
      });

      try {
        // Get global manifest
        let statistics = {
          total_templates: 0,
          custom_templates: 0,
          repository_templates: 0,
          local_templates: 0,
          active_templates: 0,
          last_sync_time: new Date().toISOString(),
        };

        try {
          const manifestResponse = await client.get("agent:template:manifest");
          if (manifestResponse) {
            const manifest = JSON.parse(manifestResponse);
            statistics = manifest.statistics || statistics;
          }
        } catch (error) {
          // Manifest doesn't exist, use default stats
        }

        // Get all template metadata
        const metaKeys = await client.keys("agent:template:meta:*");

        const templates = [];
        for (const metaKey of metaKeys) {
          try {
            const templateId = metaKey.replace("agent:template:meta:", "");

            // Get template metadata and content
            const [metaResponse, contentResponse] = await Promise.all([
              client.get(metaKey),
              client.get(`agent:template:${templateId}`),
            ]);

            if (metaResponse) {
              const metadata = JSON.parse(metaResponse);
              let templateContent = null;

              // Parse template content to extract missing metadata
              if (contentResponse) {
                try {
                  const contentData = JSON.parse(contentResponse);
                  if (contentData.content) {
                    // Parse YAML content to get info section
                    const yaml = await import("yaml");
                    templateContent = yaml.parse(contentData.content);
                  }
                } catch (contentError) {
                  console.warn(
                    `Failed to parse template content for ${templateId}:`,
                    contentError
                  );
                }
              }

              templates.push({
                id: metadata.id || templateId,
                name:
                  metadata.name || templateContent?.info?.name || templateId,
                description:
                  metadata.description ||
                  templateContent?.info?.description ||
                  "No description available",
                severity:
                  metadata.severity ||
                  templateContent?.info?.severity ||
                  "unknown",
                type:
                  metadata.category ||
                  templateContent?.detection?.type ||
                  "unknown",
                source: metadata.source,
                created_at: metadata.created_at,
                updated_at: metadata.updated_at,
              });
            }
          } catch (error) {
            console.warn(`Failed to load template ${metaKey}:`, error);
          }
        }

        // Calculate statistics based on template source types
        statistics.total_templates = templates.length;
        statistics.active_templates = templates.length;
        statistics.custom_templates = templates.filter(
          (t) => t.source?.type === "custom"
        ).length;
        statistics.repository_templates = templates.filter(
          (t) => t.source?.type === "repository"
        ).length;
        statistics.local_templates = templates.filter(
          (t) => t.source?.type === "local"
        ).length;

        return {
          templates,
          sources: {},
          statistics,
          errors: [],
          last_discovery: new Date().toISOString(),
        };
      } finally {
        client.disconnect();
      }
    } catch (error) {
      console.error("[ValKey] Failed to discover templates:", error);
      return {
        templates: [],
        sources: {},
        statistics: {
          total_templates: 0,
          custom_templates: 0,
          repository_templates: 0,
          local_templates: 0,
          active_templates: 0,
          last_sync_time: new Date().toISOString(),
        },
        errors: ["Failed to connect to ValKey"],
        last_discovery: new Date().toISOString(),
      };
    }
  }),

  // NEW: Get individual template with full content
  getTemplateContent: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(async ({ input }) => {
      try {
        const { templateId } = input;

        // Import IOValkey client
        const IOValkey = (await import("iovalkey")).default;
        const client = new IOValkey({
          host: process.env.VALKEY_HOST || "sirius-valkey",
          port: parseInt(process.env.VALKEY_PORT || "6379"),
        });

        try {
          // Get template content and metadata
          const [contentResponse, metaResponse] = await Promise.all([
            client.get(`agent:template:${templateId}`),
            client.get(`agent:template:meta:${templateId}`),
          ]);

          if (!contentResponse || !metaResponse) {
            throw new Error(`Template ${templateId} not found`);
          }

          const content = JSON.parse(contentResponse);
          const metadata = JSON.parse(metaResponse);

          return {
            id: templateId,
            content,
            metadata,
            contentYaml:
              typeof content === "string"
                ? content
                : JSON.stringify(content, null, 2),
            name: metadata.name || content.info?.name || templateId,
            description:
              metadata.description ||
              content.info?.description ||
              "No description available",
            severity: metadata.severity || content.info?.severity || "unknown",
            type: metadata.category || content.detection?.type || "unknown",
            source: metadata.source,
            created_at: metadata.created_at,
            updated_at: metadata.updated_at,
          };
        } finally {
          client.disconnect();
        }
      } catch (error) {
        console.error(
          `[ValKey] Failed to get template content for ${input.templateId}:`,
          error
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Template ${input.templateId} not found`,
        });
      }
    }),

  // NEW: Get scripts directly from ValKey
  getScriptsFromValKey: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Import IOValkey client
      const IOValkey = (await import("iovalkey")).default;
      const client = new IOValkey({
        host: process.env.VALKEY_HOST || "sirius-valkey",
        port: parseInt(process.env.VALKEY_PORT || "6379"),
      });

      try {
        // Get all script metadata keys
        const metaKeys = await client.keys("agent:script:meta:*");

        const scripts = [];
        for (const metaKey of metaKeys) {
          try {
            // Extract script ID
            const scriptId = metaKey.replace("agent:script:meta:", "");

            // Get script metadata and content
            const [metaResponse, contentResponse] = await Promise.all([
              client.get(metaKey),
              client.get(`agent:script:${scriptId}`),
            ]);

            if (metaResponse) {
              const metadata = JSON.parse(metaResponse);
              let scriptContent = null;

              // Parse script content to extract missing metadata
              if (contentResponse) {
                try {
                  const contentData = JSON.parse(contentResponse);
                  if (contentData.content) {
                    // Parse JSON content to get info section
                    scriptContent = JSON.parse(contentData.content);
                  }
                } catch (contentError) {
                  console.warn(
                    `Failed to parse script content for ${scriptId}:`,
                    contentError
                  );
                }
              }

              scripts.push({
                id: metadata.id || scriptId,
                name: metadata.name || scriptContent?.info?.name || scriptId,
                description:
                  metadata.description ||
                  scriptContent?.info?.description ||
                  "No description available",
                language:
                  metadata.language ||
                  scriptContent?.info?.language ||
                  "unknown",
                platform:
                  metadata.platform ||
                  scriptContent?.info?.platform ||
                  "unknown",
                source: metadata.source,
              });
            }
          } catch (error) {
            console.warn(`Failed to load script ${metaKey}:`, error);
            // Continue with other scripts
          }
        }

        return scripts;
      } finally {
        client.disconnect();
      }
    } catch (error) {
      console.error("[ValKey] Failed to get scripts:", error);
      return [];
    }
  }),

  // NEW: Discover scripts directly from ValKey
  discoverScriptsFromValKey: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Import IOValkey client
      const IOValkey = (await import("iovalkey")).default;
      const client = new IOValkey({
        host: process.env.VALKEY_HOST || "sirius-valkey",
        port: parseInt(process.env.VALKEY_PORT || "6379"),
      });

      try {
        // Get global script manifest
        let statistics = {
          total_scripts: 0,
          custom_scripts: 0,
          repository_scripts: 0,
          local_scripts: 0,
          active_scripts: 0,
          last_sync_time: new Date().toISOString(),
        };

        try {
          const manifestResponse = await client.get("agent:script:manifest");
          if (manifestResponse) {
            const manifest = JSON.parse(manifestResponse);
            statistics = manifest.statistics || statistics;
          }
        } catch (error) {
          // Manifest doesn't exist, use default stats
        }

        // Get all script metadata
        const metaKeys = await client.keys("agent:script:meta:*");

        const scripts = [];
        for (const metaKey of metaKeys) {
          try {
            const scriptId = metaKey.replace("agent:script:meta:", "");

            // Get script metadata and content
            const [metaResponse, contentResponse] = await Promise.all([
              client.get(metaKey),
              client.get(`agent:script:${scriptId}`),
            ]);

            if (metaResponse) {
              const metadata = JSON.parse(metaResponse);
              let scriptContent = null;

              // Parse script content to extract missing metadata
              if (contentResponse) {
                try {
                  const contentData = JSON.parse(contentResponse);
                  if (contentData.content) {
                    // Parse JSON content to get info section
                    scriptContent = JSON.parse(contentData.content);
                  }
                } catch (contentError) {
                  console.warn(
                    `Failed to parse script content for ${scriptId}:`,
                    contentError
                  );
                }
              }

              scripts.push({
                id: metadata.id || scriptId,
                name: metadata.name || scriptContent?.info?.name || scriptId,
                description:
                  metadata.description ||
                  scriptContent?.info?.description ||
                  "No description available",
                language:
                  metadata.language ||
                  scriptContent?.info?.language ||
                  "unknown",
                platform:
                  metadata.platform ||
                  scriptContent?.info?.platform ||
                  "unknown",
                source: metadata.source,
                created_at: metadata.created_at,
                updated_at: metadata.updated_at,
              });
            }
          } catch (error) {
            console.warn(`Failed to load script ${metaKey}:`, error);
          }
        }

        // Calculate statistics based on script source types
        statistics.total_scripts = scripts.length;
        statistics.active_scripts = scripts.length;
        statistics.custom_scripts = scripts.filter(
          (s) => s.source?.type === "custom"
        ).length;
        statistics.repository_scripts = scripts.filter(
          (s) => s.source?.type === "repository"
        ).length;
        statistics.local_scripts = scripts.filter(
          (s) => s.source?.type === "local"
        ).length;

        return {
          scripts,
          statistics,
          success: true,
        };
      } finally {
        client.disconnect();
      }
    } catch (error) {
      console.error("[ValKey] Failed to discover scripts:", error);
      return {
        scripts: [],
        statistics: {
          total_scripts: 0,
          custom_scripts: 0,
          repository_scripts: 0,
          local_scripts: 0,
          active_scripts: 0,
          last_sync_time: new Date().toISOString(),
        },
        success: false,
      };
    }
  }),

  // NEW: Get individual script with full content
  getScriptContent: protectedProcedure
    .input(z.object({ scriptId: z.string() }))
    .query(async ({ input }) => {
      try {
        const { scriptId } = input;

        // Import IOValkey client
        const IOValkey = (await import("iovalkey")).default;
        const client = new IOValkey({
          host: process.env.VALKEY_HOST || "sirius-valkey",
          port: parseInt(process.env.VALKEY_PORT || "6379"),
        });

        try {
          // Get script content and metadata
          const [contentResponse, metaResponse] = await Promise.all([
            client.get(`agent:script:${scriptId}`),
            client.get(`agent:script:meta:${scriptId}`),
          ]);

          if (!contentResponse || !metaResponse) {
            throw new Error(`Script ${scriptId} not found`);
          }

          const content = JSON.parse(contentResponse);
          const metadata = JSON.parse(metaResponse);

          // Parse the script content JSON
          let scriptData = null;
          try {
            scriptData = JSON.parse(content.content);
          } catch (parseError) {
            console.warn(
              `Failed to parse script content for ${scriptId}:`,
              parseError
            );
          }

          return {
            id: scriptId,
            content,
            metadata,
            scriptContent:
              scriptData?.script || content.content || "No content available",
            name: metadata.name || scriptData?.info?.name || scriptId,
            description:
              metadata.description ||
              scriptData?.info?.description ||
              "No description available",
            language:
              metadata.language || scriptData?.info?.language || "unknown",
            platform:
              metadata.platform || scriptData?.info?.platform || "unknown",
            source: metadata.source,
            created_at: metadata.created_at,
            updated_at: metadata.updated_at,
          };
        } finally {
          client.disconnect();
        }
      } catch (error) {
        console.error(
          `[ValKey] Failed to get script content for ${input.scriptId}:`,
          error
        );
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Script ${input.scriptId} not found`,
        });
      }
    }),
});

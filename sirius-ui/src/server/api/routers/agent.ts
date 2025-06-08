import axios from "axios";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
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
  listAgentsWithHosts: publicProcedure.query(async ({ ctx }) => {
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
          console.error("[Agent] Invalid agent list response format:", response);
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
        message: "Failed to retrieve agent information" 
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
          const matchingHost = hosts.find((host: any) => 
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
          message: "Failed to retrieve agent details" 
        });
      }
    }),
}); 
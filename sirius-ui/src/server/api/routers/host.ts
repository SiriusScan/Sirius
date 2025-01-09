import axios from "axios";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import {
  mockHostData,
  mockHostStatistics,
  mockEnvironmentSummaryData,
} from "~/utils/mock/mockHostData";

// Create an axios instance
const httpClient = axios.create({
  baseURL: "http://127.0.0.1:9001/",
  timeout: 1000,
});

export type SiriusHost = {
  hid: string;
  ip: string;
  hostname: string;
  tags?: string[];
  os: string;
  osversion: string;
  asset_type: "workstation" | "server" | "network" | "unknown";
  vulnerabilities: Vulnerability[];
  ports: Port[];
  services: Service[];
  users?: User[];
};

type Port = {
  id: number;
  protocol: string;
  state: string;
};

type User = {
  id: string;
  username: string;
  uid: string;
  type: string;
  domain?: string;
  password?: {
    hash?: string;
    algorithm?: string;
    plaintext?: string;
  };
  details?: string;
};

type Service = {
  id: string;
  name: string;
  port: number;
  protocol: string;
  version: string;
};

type Vulnerability = {
  vid: string;
  cvss: number;
  cve?: string;
  description: string;
  published: string;
  severity: string;
};

export interface EnvironmentTableData {
  hostname: string;
  ip: string;
  os: string;
  vulnerabilityCount: number;
  groups: string[];
  tags: string[];
}

export const hostRouter = createTRPCRouter({
  getHost: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ input }) => {
      const { hid } = input;
      try {
        if (!hid) {
          throw new Error("No ID provided");
        }
        console.log("ID:", hid);
        const response = await httpClient.get<SiriusHost>(`host/${hid}`);
        const host = response.data;

        return host;
        // return mockHostData;
      } catch (error) {
        console.error("Error fetching host (routers/host.ts):", hid);
        // console.error(error);
        return null;
      }
    }),

  getHostStatistics: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(({ input }) => {
      const { hid } = input;
      return mockHostStatistics;
    }),

  // Retrieve all host/environment data
  getAllHosts: publicProcedure.query(async () => {
    // Modify into getEnvironmentSummary => We need a query to provide the environment table without getting all data from every host
    try {
      // Call to Go API
      const response = await httpClient.get<SiriusHost[]>("host/");
      const hostList = response.data;
      
      // Map SiriusHost[] to EnvironmentTableData[]
      const tableData: EnvironmentTableData[] = hostList.map((host) => {
        return {
          hostname: host.hostname,
          ip: host.ip,
          os: host.os ?? "unknown",
          vulnerabilityCount: host.vulnerabilities?.length ?? 0,
          groups: host.tags ?? [],
          tags: host.tags ?? [],
        };
      });
  
      // Optionally, if you want them in reverse order:
      // tableData.reverse();
      return tableData;
      // return mockEnvironmentSummaryData;
    } catch (error) {
      // Handle the error accordingly
      console.error("Error fetching hosts:", error);
      return [];
    }
  }),
});

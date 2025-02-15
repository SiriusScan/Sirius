import axios from "axios";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";

import {
  mockHostData,
  mockHostStatistics,
  mockEnvironmentSummaryData,
} from "~/utils/mock/mockHostData";

// Create an axios instance
const httpClient = axios.create({
  baseURL: env.SIRIUS_API_URL,
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
  riskScore: number;
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

export type HostStatistics = {
  vulnerabilityCount: number;
  totalRiskScore: number;
  averageRiskScore: number;
  hostSeverityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
};

export const hostRouter = createTRPCRouter({
  getHost: publicProcedure
    .input(z.object({ hid: z.string() }))
    .query(async ({ input }) => {
      const { hid } = input;
      try {
        if (!hid) {
          throw new Error("No ID provided");
        }
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
    .query(async ({ input }) => {
      const { hid } = input;
      try {
        if (!hid) {
          throw new Error("No ID provided");
        }
        const response = await httpClient.get<HostStatistics>(`host/statistics/${hid}`);
        const statistics = response.data;
        return statistics;
      } catch (error) {
        console.error("Error fetching host statistics (routers/host.ts):", hid);
        return null;
      }
    }),

  // Retrieve all host/environment data
  getAllHosts: publicProcedure.query(async () => {
    // Modify into getEnvironmentSummary => We need a query to provide the environment table without getting all data from every host
    try {
      // Call to Go API
      const response = await httpClient.get<SiriusHost[]>("host/");
      const hostList = response.data;

      // Map SiriusHost[] to EnvironmentTableData[]
      const tableData: EnvironmentTableData[] = hostList?.map((host) => {
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
      if (tableData?.length > 0) {
        return tableData;
      } else {
        return [];
      }

      // return mockEnvironmentSummaryData;
    } catch (error) {
      // Handle the error accordingly
      console.error("Error fetching hosts:", error);
      return [];
    }
  }),
});







/// MOCK DATA ///
const mockHostList: EnvironmentTableData[] = [
  {
    hostname: "host1",
    ip: "192.168.1.10",
    os: "Linux",
    vulnerabilityCount: 5,
    groups: ["group1", "group2"],
    tags: ["tag1", "tag2"],
  },
  {
    hostname: "host2",
    ip: "192.168.1.11",
    os: "Windows",
    vulnerabilityCount: 3,
    groups: ["group1"],
    tags: ["tag3"],
  },
];

const mockVulnerabilitySummary: VulnerabilitySummary[] = [
  {
    id: "1",
    severity: "critical",
    title: "CVE-2017-0145",
    description:
      "A remote code execution vulnerability exists when the Windows Server service improperly handles certain requests.",
  },
  {
    id: "2",
    severity: "critical",
    title: "CVE-2014-0468",
    description:
      "A remote code execution vulnerability exists in the way that the Microsoft Server service handles specially crafted packets.",
  },
];

const mockScanResults: ScanResult = {
  id: "1",
  status: "running",
  targets: ["192.168.123.234"],
  hosts: ["192.168.123.234", "192.168.123.235"],
  hostsCompleted: 1,
  vulnerabilities: mockVulnerabilitySummary,
};

const mockVulnerabilityList: VulnerabilityTableData[] = [
  {
    cve: "CVE-2020-7165",
    cvss: 1.2,
    description:
      "Improper handling of user input in SuperCoolApp 3.2.1 allows remote attackers to execute arbitrary code.",
    published: "2023-07-09",
    severity: "medium",
    count: 39,
  },
  {
    cve: "CVE-2023-4729",
    cvss: 1.9,
    description:
      "Unauthenticated remote attackers can cause a denial of service in MegaApp 2.0 by sending malformed packets.",
    published: "2023-08-08",
    severity: "low",
    count: 49,
  },
  {
    cve: "CVE-2018-9148",
    cvss: 10,
    description:
      "UltraLib 1.4.0 mishandles file uploads, allowing for remote code execution.",
    published: "2023-07-13",
    severity: "critical",
    count: 42,
  },
  {
    cve: "CVE-2020-3817",
    cvss: 4.8,
    description:
      "An insecure deserialization issue in AwesomeTool 5.2 could allow attackers to execute arbitrary code on the server.",
    published: "2023-07-04",
    severity: "medium",
    count: 47,
  },
  {
    cve: "CVE-2021-6088",
    cvss: 1.6,
    description:
      "CryptoLib 2.1 fails to validate encryption integrity, making it vulnerable to Man-in-the-Middle attacks.",
    published: "2023-08-16",
    severity: "medium",
    count: 8,
  },
  {
    cve: "CVE-2018-3106",
    cvss: 8.3,
    description:
      "A buffer overflow in YetAnotherApp 6.0 allows for privilege escalation via specially crafted network traffic.",
    published: "2023-07-05",
    severity: "high",
    count: 9,
  },
  {
    cve: "CVE-2022-5371",
    cvss: 7.9,
    description:
      "An SQL injection vulnerability in WebStore 3.0 allows attackers to execute arbitrary SQL commands.",
    published: "2023-06-10",
    severity: "high",
    count: 15,
  },
  {
    cve: "CVE-2020-6771",
    cvss: 4.4,
    description:
      "SmartApp 7.0 stores sensitive user information in plaintext, potentially exposing it to unauthorized actors.",
    published: "2023-06-18",
    severity: "medium",
    count: 26,
  },
  {
    cve: "CVE-2021-1165",
    cvss: 9.0,
    description:
      "A use-after-free vulnerability in GameEngine 2.0 can result in arbitrary code execution when processing malformed game files.",
    published: "2023-07-24",
    severity: "high",
    count: 3,
  },
  {
    cve: "CVE-2023-4954",
    cvss: 9.5,
    description:
      "An out-of-bounds read in FileParser 1.0 can cause the application to crash, leading to a denial of service.",
    published: "2023-07-19",
    severity: "critical",
    count: 1,
  },
  {
    cve: "CVE-2022-6318",
    cvss: 8.5,
    description:
      "A heap-based buffer overflow in VideoPlayer 5.0 allows attackers to execute arbitrary code via a crafted video file.",
    published: "2023-07-05",
    severity: "high",
    count: 2,
  },
  {
    cve: "CVE-2020-4997",
    cvss: 4.0,
    description:
      "An XML external entity (XXE) vulnerability in XMLParser 4.0 allows for disclosure of internal files.",
    published: "2023-06-20",
    severity: "medium",
    count: 46,
  },
  {
    cve: "CVE-2023-7714",
    cvss: 2.1,
    description:
      "Improper input validation in ImageProcessor 2.0 allows attackers to read arbitrary files on the host machine.",
    published: "2023-06-06",
    severity: "low",
    count: 45,
  },
  {
    cve: "CVE-2019-7814",
    cvss: 2.5,
    description:
      "Insecure default configurations in WebService 3.0 could allow attackers to intercept sensitive information.",
    published: "2023-07-03",
    severity: "medium",
    count: 21,
  },
  {
    cve: "CVE-2022-3072",
    cvss: 7.8,
    description:
      "An open redirect vulnerability in AuthManager 1.1 could allow for phishing attacks.",
    published: "2023-06-10",
    severity: "high",
    count: 31,
  },
  {
    cve: "CVE-2019-4933",
    cvss: 5.2,
    description:
      "An insecure direct object reference (IDOR) in FileManager 6.0 could allow unauthorized access to files.",
    published: "2023-08-18",
    severity: "medium",
    count: 50,
  },
  {
    cve: "CVE-2023-9064",
    cvss: 2.7,
    description:
      "A cross-site scripting (XSS) vulnerability in ChatApp 1.5 allows attackers to inject arbitrary web scripts.",
    published: "2023-07-21",
    severity: "low",
    count: 32,
  },
  {
    cve: "CVE-2022-2921",
    cvss: 4.5,
    description:
      "A timing attack vulnerability in CryptoService 2.0 could allow attackers to guess encrypted values.",
    published: "2023-06-13",
    severity: "low",
    count: 13,
  },
  {
    cve: "CVE-2020-5294",
    cvss: 9.9,
    description:
      "Improper access control in NetworkManager 8.0 could allow for unauthorized network changes.",
    published: "2023-08-29",
    severity: "critical",
    count: 24,
  },
  {
    cve: "CVE-2023-2596",
    cvss: 1.8,
    description:
      "A server-side request forgery (SSRF) in APIGateway 3.0 could allow attackers to make unauthorized HTTP requests.",
    published: "2023-06-04",
    severity: "low",
    count: 1,
  },
];
import type { SiriusHost } from "~/server/api/routers/host";
import { type EnvironmentTableData } from "~/server/api/routers/host";

export const mockHostData: SiriusHost = {
  hid: "1",
  ip: "192.168.0.1",
  hostname: "host1",
  tags: ["tag1", "tag2"],
  os: "linux",
  osversion: "Ubuntu 20.04",
  asset_type: "workstation",
  vulnerabilities: [
    {
      vid: "1",
      cvss: 7.5,
      description: "This is a test vulnerability",
      published: "2021-01-01",
      severity: "High",
    },
    {
      vid: "2",
      cvss: 5.0,
      description: "This is another test vulnerability",
      published: "2021-01-01",
      severity: "Medium",
    },
  ],
  services: [
    {
      id: "1",
      name: "ssh",
      port: 22,
      protocol: "tcp",
      version: "OpenSSH 8.2p1",
    },
    {
      id: "2",
      name: "http",
      port: 80,
      protocol: "tcp",
      version: "Apache 2.4.41",
    },
    {
      id: "3",
      name: "https",
      port: 443,
      protocol: "tcp",
      version: "Apache 2.4.41",
    },
  ],
  users: [
    {
      id: "1",
      username: "root",
      uid: "0",
      type: "system",
      password: {
        hash: "123456",
        algorithm: "sha256",
      },
      details: "Local Administrator",
    },
  ],
};

// Will need to type this eventually
export const mockHostStatistics = {
  critical: 2,
  high: 12,
  medium: 34,
  low: 1,
  informational: 10,
};

export const mockEnvironmentSummaryData: EnvironmentTableData[] = [
  {
    hostname: "host1",
    ip: "192.168.0.1",
    os: "linux",
    vulnerabilityCount: 10,
    groups: ["group1", "group2"],
    tags: ["tag1", "tag2"],
  },
  {
    hostname: "host2",
    ip: "192.168.0.2",
    os: "windows",
    vulnerabilityCount: 5,
    groups: ["group1", "group3"],
    tags: ["tag1", "tag3"],
  },
  {
    hostname: "test-host",
    ip: "192.168.69.3",
    os: "windows",
    vulnerabilityCount: 5,
    groups: ["group1", "group3"],
    tags: ["tag1", "tag3"],
  },
];

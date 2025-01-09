import type { SiriusHost } from "../api/router/host";


export const mockHostData: SiriusHost = {
  hid: "1",
  ip: "192.168.0.1",
  hostname: "host1",
  os: "lin",
  osversion: "Ubuntu 20.04",
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
    }
  ],
  services: [
    {
      id: "1",
      name: "ssh",
      port: 22,
      protocol: "tcp",
      version: "1.0",
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
    },
  ],
};
import React, { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import {
  type VulnerabilityTableData,
  columns,
} from "~/components/VulnerabilityDataTableColumns";
import { VulnerabilityDataTable } from "~/components/VulnerabilityDataTable";
import UnknownIcon from "~/components/icons/UnknownIcon";
import WindowsIcon from "~/components/icons/WindowsIcon";
import AppleIcon from "~/components/icons/AppleIcon";
import LinuxIcon from "~/components/icons/LinuxIcon";
import { SeverityBadge } from "~/components/SeverityBadge";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";
import { Button } from "~/components/lib/ui/button";

type Props = {};

const Host = (props: Props) => {
  const [darkMode, setDarkMode] = useState(false);
  const [os, setOs] = useState(<UnknownIcon width="35px" height="35px" />);

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (hostData.os === "win") {
      setOs(<WindowsIcon width="35px" height="35px" />);
    } else if (hostData.os === "lin") {
      setOs(<LinuxIcon width="35px" height="35px" />);
    } else if (hostData.os === "mac") {
      setOs(<AppleIcon width="35px" height="35px" />);
    }
  }, []);

  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";

  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className={hexgradClass} key={hexgradClass}></div>
        <div className="z-10 flex flex-row items-center">
          <div className="ml-4 mt-7 flex dark:fill-white">{os}</div>
          <h1 className="ml-3 mt-5 flex text-4xl font-extralight ">
            {hostData.hostname} - {hostData.ip}
          </h1>
        </div>
        <div className="ml-20 text-violet-100/70">
          Windows Server 2008 R2 Professional
        </div>
        <div className="m-auto justify-center">
          <VulnerabilitySeverityCardsHorizontal
            counts={{
              critical: 12,
              high: 7,
              medium: 15,
              low: 4,
              informational: 10,
            }}
          />
        </div>
        <div className="flex py-6 ml-4">
          <ServicesTable title="Network Services" data={servicesData} />
          <UsersTable title="Users" data={userData} />
        </div>
        <div className="py-6 ml-4">

          <div className="flex gap-2">
            <Button>Vulnerabilities</Button>
            <Button>Host Details</Button>
            <Button>Terminal</Button>
          </div>
          <VulnerabilityDataTable columns={columns} data={vulnerabilityList} />
        </div>
      </div>
    </Layout>
  );
};

export default Host;

const vulnerabilityList: VulnerabilityTableData[] = [
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

type HostData = {
  hostname: string;
  ip: string;
  os: "lin" | "win" | "mac";
};

const hostData: HostData = {
  hostname: "W2k8svr",
  ip: "192.168.23.4",
  os: "lin",
};

interface ServicesTableProps {
  title: string;
  data: {
    id: number;
    name: string;
    port: number;
    fingerprint: string;
  }[];
}

const servicesData = [
  {
    id: 1,
    name: "HTTP",
    port: 80,
    fingerprint: "Apache 2.0 1.3.2",
  },
  {
    id: 2,
    name: "SMB",
    port: 445,
    fingerprint: "Windows SMBv1",
  },
];

const userData = [
  {
    id: 1,
    name: "Administrator",
    credential: "NT Hash",
    source: "Operating System",
  },
  {
    id: 2,
    name: "oz",
    credential: "NT Hash",
    source: "Operating System",
  },
];

const ServicesTable: React.FC<ServicesTableProps> = ({ title, data }) => {
  return (
    <div className="bg-paper mt-4 flex w-96 flex-col gap-4 rounded-md border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
      <h2 className="text-2xl font-extralight">{title}</h2>
      <table className=" rounded-md bg-gray-800/20">
        <thead>
          <tr className="h-16 w-full border-b border-t-2 border-gray-300 dark:border-gray-600">
            <th className="pr-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Port
            </th>
            <th className="pr-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Service
            </th>
            <th className="pr-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Date Found
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((service) => (
            <tr
              key={service.id}
              className="h-14 border-b border-gray-300 dark:border-gray-600"
            >
              <td className="pr-4 text-sm text-gray-600 dark:text-gray-400">
                {service.port}
              </td>
              <td className="pr-4 text-sm text-gray-600 dark:text-gray-400">
                {service.name}
              </td>
              <td className="text-sm text-gray-600 dark:text-gray-400">
                {service.fingerprint}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface UsersTableProps {
  title: string;
  data: {
    id: number;
    name: string;
    credential: string;
    source: string;
  }[];
}

const UsersTable: React.FC<UsersTableProps> = ({ title, data }) => {
  return (
    <div className="bg-paper ml-8 mt-4 flex w-96 flex-col gap-4 rounded-md border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
      <h2 className="text-2xl font-extralight">{title}</h2>
      <table className=" rounded-md bg-gray-800/20">
        <thead>
          <tr className="h-16 w-full border-b border-t-2 border-gray-300 dark:border-gray-600">
            <th className="pr-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Username
            </th>
            <th className="pr-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Credential
            </th>
            <th className="pr-6 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr
              key={user.id}
              className="h-14 border-b border-gray-300 dark:border-gray-600"
            >
              <td className="pr-4 text-sm text-gray-600 dark:text-gray-400">
                {user.name}
              </td>
              <td className="pr-4 text-sm text-gray-600 dark:text-gray-400">
                {user.credential}
              </td>
              <td className="text-sm text-gray-600 dark:text-gray-400">
                {user.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const latestVulnerabilityData = [
  {
    id: 1,
    name: "Cross-Site Scripting",
    severity: "High",
    dateFound: "2023-07-28",
  },
  {
    id: 2,
    name: "SQL Injection",
    severity: "Critical",
    dateFound: "2023-07-20",
  },
  {
    id: 3,
    name: "Insecure Deserialization",
    severity: "Medium",
    dateFound: "2023-07-15",
  },
  {
    id: 4,
    name: "Broken Authentication",
    severity: "High",
    dateFound: "2023-07-10",
  },
  // ... more data
];

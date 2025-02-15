import React, { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import {
  type VulnerabilityTableData,
  columns,
} from "~/components/VulnerabilityDataTableColumns";
import { VulnerabilityDataTable } from "~/components/VulnerabilityDataTable";

import { api } from "~/utils/api";
import { type ScanResult } from "~/components/scanner/ScanStatus";

const Vulnerabilities = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [vulnerabilityList, setVulnerabilityList] = useState<
    VulnerabilityTableData[]
  >([]);

  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";
  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  // tRPC State Management
  const { data: vuln } = api.vulnerability.getAllVulnerabilities.useQuery();
  console.log(vuln);
  
  const severityCount = {
    critical: vuln?.filter((v) => v.severity === "critical").length ?? 0,
    high: vuln?.filter((v) => v.severity === "high").length ?? 0,
    medium: vuln?.filter((v) => v.severity === "medium").length ?? 0,
    low: vuln?.filter((v) => v.severity === "low").length ?? 0,
    informational: vuln?.filter((v) => v.severity === "informational")
      .length ?? 0,
  }

  useEffect(() => {
    if (vuln) {
      // Map vuln to VulnerabilityTableData
      const vulnTableData: VulnerabilityTableData[] = vuln.map((v) => {
        return {
          cve: v.vid,
          cvss: v.riskScore,
          description: v.description,
          published: v.published,
          severity: v.severity,
          count: v.hostCount,
        };
      });
      setVulnerabilityList(vulnTableData);
    }
  }, [vuln]);

  return (
    <Layout>
      <div className={hexgradClass} key={hexgradClass}></div>
      <div className="z-10 mb-10 flex flex-row items-center">
        <VulnerabilityIcon className="ml-4 flex" />
        <h1 className="ml-3 flex text-4xl font-extralight ">
          Vulnerability Navigator
        </h1>
        <div className="m-auto justify-center">
          <VulnerabilitySeverityCardsHorizontal
            counts={{
              critical: severityCount.critical,
              high: severityCount.high,
              medium: severityCount.medium,
              low: severityCount.low,
              informational: severityCount.informational,
            }}
          />
        </div>
      </div>
      <div className="py-6">
        <VulnerabilityDataTable columns={columns} data={vulnerabilityList} />
      </div>
    </Layout>
  );
};

export default Vulnerabilities;

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

function b64Decode(base64String: string) {
  if (!base64String) {
    return null;
  }
  try {
    const decodedString = atob(base64String);
    return JSON.parse(decodedString) as ScanResult;
  } catch (error) {
    console.error("Failed to decode Base64 JSON:", error);
    return null;
  }
}
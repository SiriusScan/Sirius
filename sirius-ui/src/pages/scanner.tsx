import React, { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { ScanBar } from "~/components/ScanBar";
import ScanIcon from "~/components/icons/ScanIcon";

import {
  type VulnerabilityTableData,
  columns,
} from "~/components/VulnerabilityDataTableColumns";
import { VulnerabilityDataTable } from "~/components/VulnerabilityDataTable";
import { Badge } from "~/components/lib/ui/badge";
import { Input } from "~/components/lib/ui/input";
import { Button } from "~/components/lib/ui/button";
import { Form } from "~/components/lib/ui/form";

import { api } from "~/utils/api";
import { sendMsg } from "~/utils/sirius";

const Scanner: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [targetList, setTargetList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";

  const addTarget = (newTarget: string) => {
    if (!targetList.includes(newTarget)) {
      // check for uniqueness
      const newList = [...targetList, newTarget];
      setTargetList(newList);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // prevent default action
      addTarget(inputValue);
      setInputValue(""); // clear the input
    }
  };

  // client-side code
  const startScan = async () => {
    console.log("Starting scan...");

    for (const target of targetList) {
      const payload = {
        message: target,
      };

      try {
        const response = await sendMsg(payload);
        console.log("Scan started successfully:", response);
      } catch (error) {
        console.error("Failed to start scan:", error);
      }
    }
  };

  return (
    <Layout>
      <div className="relative z-20 mb-5 mt-[-40px] h-56">
        <div className={hexgradClass} key={hexgradClass}></div>
        <div className="z-10 flex flex-row items-center">
          <div className="bg-paper ml-8 mt-4 flex flex-col gap-4 rounded-md ">
            <div className="mb-[-16px] flex gap-4 text-xl">
              <div className="rounded-t-md p-2 shadow-violet-300/10 dark:bg-violet-300/5">
                Scanner
              </div>
              <div className="p-2 ">Configuration</div>
              <div className="p-2 ">Profiles</div>
            </div>
            <div className="flex gap-4 border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
              <div>
                <span className="border-violet-100/40 text-xs">Add Target</span>
                <Form>
                  <Input
                    className="w-96 rounded-lg p-4 text-lg"
                    value={inputValue} // controlled component
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                </Form>
                <Button
                  className="mt-4 rounded-r-md border-violet-100/30 bg-violet-500 text-violet-100 hover:bg-violet-100 hover:text-black"
                  onClick={startScan}
                >
                  Start Scan
                </Button>
              </div>
              <div>
                <span className="border-violet-100/40 text-xs">
                  Target List
                </span>
                <div>
                  {targetList?.map((target) => (
                    <Badge
                      key={target}
                      className="mb-1 mr-2 bg-violet-200 font-mono font-light"
                    >
                      {target}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* If Tab is then component show... */}
            <div className="p-4">
              <div className="text-violet-100/80">Ongoing Scans</div>
              <hr />
              <ScanDashboard />

              <div className="text-violet-100/80">Completed Scans</div>
              <hr />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Scanner;

const ScanDashboard = () => {
  return (
    <div className="my-4">
      <div className="border-violet-700/10 p-4 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
        <div className="flex w-[800px] items-center gap-10">
          <VulnerabilitySeverityCards
            counts={{
              critical: 12,
              high: 87,
              medium: 115,
              low: 44,
              informational: 320,
            }}
          />
          <ScanBar progress={55} />
        </div>
        <div className="mt-2 flex gap-6 p-4">
          <div className="flex flex-col border-r border-violet-100/40 pr-6">
            <div className="text-xs font-light text-violet-100">Hosts</div>
            <div className="mt-2 text-5xl font-light text-violet-100">100</div>
          </div>
          <div className="flex flex-col border-r border-violet-100/40 pr-6">
            <div className="text-xs font-light text-violet-100">
              Vulnerabilities
            </div>
            <div className="mt-2 text-5xl font-light text-violet-100">1440</div>
          </div>
          <div className="flex h-[85px] flex-col">
            <div className="mb-2 text-xs font-light text-violet-100">
              Targets
            </div>
            <div className="text-md w-60 text-violet-100">
              {scanTargets.map((target) => (
                <Badge
                  key={target}
                  className="mb-1 mr-2 bg-violet-200 font-mono font-light"
                >
                  {target}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-6 pl-4 pr-4 ">
          <div className="border-r border-violet-100/20 pr-6 text-violet-100">
            Vulnerabilities
          </div>
          <div className=" border-violet-100/40 text-violet-100/60">Hosts</div>
        </div>
        <VulnerabilityDataTable columns={columns} data={vulnerabilityList} />
      </div>
    </div>
  );
};

const scanTargets = ["192.168.1.0/24", "10.0.10.1", "10.0.10.5", "10.0.10.6"];

interface VulnerabilityCountProps {
  count: number;
  color: string;
  severity: string;
  width: number;
}

interface VulnerabilitySeverityCardsProps {
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
}

export const VulnerabilityCount: React.FC<VulnerabilityCountProps> = ({
  count,
  color,
  severity,
  width,
}) => {
  //Force add tailwind styles (nextjs + tailwind won't automatically add style classes that are generated dynamically)
  //bg-red-200 dark:bg-red-700 bg-orange-200 dark:bg-orange-700 bg-yellow-200 dark:bg-yellow-700 bg-green-200 dark:bg-green-700 bg-blue-200 dark:bg-blue-700
  return (
    <div
      style={{ width: `${width}px` }}
      className={`flex flex-col items-center rounded-md p-2 bg-${color}-200 dark:bg-${color}-700`}
    >
      <span className="text-2xl font-semibold">{count}</span>
    </div>
  );
};

export const VulnerabilitySeverityCards: React.FC<
  VulnerabilitySeverityCardsProps
> = ({ counts }) => {
  const [width, setWidth] = useState(60);

  return (
    <div className="ml-4 mt-4 flex flex-row gap-4">
      <VulnerabilityCount
        width={width}
        severity="Critical"
        count={counts.critical}
        color="red"
      />
      <VulnerabilityCount
        width={width}
        severity="High"
        count={counts.high}
        color="orange"
      />
      <VulnerabilityCount
        width={width}
        severity="Medium"
        count={counts.medium}
        color="yellow"
      />
      <VulnerabilityCount
        width={width}
        severity="Low"
        count={counts.low}
        color="green"
      />
      <VulnerabilityCount
        width={width}
        severity="Informational"
        count={counts.informational}
        color="blue"
      />
    </div>
  );
};

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

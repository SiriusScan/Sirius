import React, { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { ScanBar } from "~/components/ScanBar";
import ScanIcon from "~/components/icons/ScanIcon";
import {
  type ScanResult,
  type VulnerabilitySummary,
  ScanStatus,
  type VulnerabilitySeverityCardsProps,
} from "~/components/scanner/ScanStatus";
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
import { Scan } from "lucide-react";

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

const Scanner: React.FC = () => {
  const [view, setView] = useState<string>("scan");
  const [darkMode, setDarkMode] = useState(false);
  const [targetList, setTargetList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const scanStatusQuery = api.store.getValue.useQuery(
    { key: "currentScan" },
    {
      refetchInterval: 3000,
      refetchOnWindowFocus: false,
    }
  );
  const scanResults = b64Decode(scanStatusQuery.data ?? "")!;

  const runThing = () => {
    console.log("Running thing...");
    console.log(JSON.stringify(scanResults));
  };

  const handleViewNavigator = (view: string) => {
    console.log(JSON.stringify(scanResults));
    setView(view);
  };

  // Start Scan
  const { mutateAsync: mutateAsyncScan } = api.store.setValue.useMutation();
  const { mutateAsync: mutateAsyncQueue } = api.queue.sendMsg.useMutation();
  const startScan = async () => {
    console.log("Starting scan...");

    for (const target of targetList) {
      const message = `{"message": "${target}"}`;
      try {
        const response = await mutateAsyncQueue({
          message: message,
          queue: "scan",
        });
        console.log("Scan started successfully:", response);
      } catch (error) {
        console.error("Failed to start scan:", error);
      }
      // Reset the currentScan
      const scan: ScanResult = {
        id: "1",
        status: "running",
        targets: [target],
        hosts: [],
        hostsCompleted: 0,
        vulnerabilities: [],
      };
      try {
        await mutateAsyncScan({ key: "currentScan", value: btoa(JSON.stringify(scan)) });
      } catch (err) {
        console.error("Error reseting scan:", err);
      }
    }
  };

  const addTarget = (newTarget: string) => {
    if (!targetList.includes(newTarget)) {
      // check for uniqueness
      const newList = [...targetList, newTarget];
      setTargetList(newList);
    }
  };
  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);
  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";

  return (
    <Layout>
      <div className="relative z-20 mb-5 mt-[-40px] h-56">
        {/* Admin / Dev Panel */}
        {/* <Button
          className="ml-8 rounded-r-md border-violet-100/30 bg-violet-500 text-violet-100 hover:bg-violet-100 hover:text-black"
          onClick={() => runThing()}
        >
          Run Thing
        </Button>
        <Button
          className="ml-8 rounded-r-md border-violet-100/30 bg-violet-500 text-violet-100 hover:bg-violet-100 hover:text-black"
          onClick={() => handleStartScan()}
        >
          set value
        </Button> */}
        <div className={hexgradClass} key={hexgradClass}></div>
        <div className="z-10 flex flex-row items-center">
          <div className="bg-paper ml-8 mt-4 flex flex-col gap-4 rounded-md ">
            <ScanForm
              addTarget={addTarget}
              inputValue={inputValue}
              setInputValue={setInputValue}
              targetList={targetList}
              startScan={startScan}
            />

            <ScanNavigator
              handleViewNavigator={handleViewNavigator}
              view={view}
            />

            <div className="py-4">
              {view === "scan" && (
                <>
                  <div className="pb-2 text-violet-100/80">Ongoing Scans</div>
                  <hr className="pb-4" />
                  <div className="">
                    <ScanStatus results={scanResults} />
                  </div>
                  <div className="pb-2 pt-4 text-violet-100/80">
                    Completed Scans
                  </div>
                  <hr className="pb-4" />
                  {/* <ScanDashboard /> */}
                </>
              )}
              {view === "config" && (
                <div className="text-violet-100/80">Configuration</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Scanner;

interface ScanNavigatorProps {
  handleViewNavigator: (view: string) => void;
  view: string;
}

const ScanNavigator: React.FC<ScanNavigatorProps> = ({
  handleViewNavigator,
  view,
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={view === "scan" ? "secondary" : "default"}
        onClick={() => handleViewNavigator("scan")}
      >
        Scan Monitor
      </Button>
      <Button
        variant={view === "config" ? "secondary" : "default"}
        onClick={() => handleViewNavigator("config")}
      >
        Configuration
      </Button>
      <Button
        variant={view === "advanced" ? "secondary" : "default"}
        onClick={() => handleViewNavigator("advanced")}
      >
        Advanced
      </Button>
    </div>
  );
};

interface ScanFormProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  targetList: string[];
  addTarget: (newTarget: string) => void;
  startScan: () => void;
}

const ScanForm: React.FC<ScanFormProps> = ({
  inputValue,
  setInputValue,
  targetList,
  addTarget,
  startScan,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault(); // prevent default action
      addTarget(inputValue);
      setInputValue(""); // clear the input
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  return (
    <div className="flex items-center gap-4 pt-4">
      <div className="flex">
        <Input
          placeholder="Add Target"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="h-12 w-72 max-w-md rounded-l-md rounded-r-none border-violet-100/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0"
        />
        <Button
          variant="outline"
          className="h-12 rounded-none border-r-0 border-violet-100/30 bg-violet-500"
          onClick={() => addTarget(inputValue)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </Button>
        <Button
          variant="outline"
          className="h-12 rounded-l-none rounded-r-md border-l-0 border-violet-100/30 bg-violet-500 text-violet-100"
          onClick={startScan}
        >
          Start Scan
        </Button>
      </div>
      <div className="flex w-72 flex-col">
        <span className="border-violet-100/40 text-sm text-violet-100/80">
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
  );
};

//         <VulnerabilityDataTable columns={columns} data={vulnerabilityList} />

// const mockVulnerabilitySummary: VulnerabilitySummary[] = [
//   {
//     id: "1",
//     severity: "critical",
//     title: "CVE-2017-0145",
//     description:
//       "A remote code execution vulnerability exists when the Windows Server service improperly handles certain requests.",
//   },
//   {
//     id: "2",
//     severity: "critical",
//     title: "CVE-2014-0468",
//     description:
//       "A remote code execution vulnerability exists in the way that the Microsoft Server service handles specially crafted packets.",
//   },
// ];

// const mockScanResults: ScanResult = {
//   id: "1",
//   status: "running",
//   targets: ["192.168.123.234"],
//   hosts: ["192.168.123.234", "192.168.123.235"],
//   hostsCompleted: 1,
//   vulnerabilities: mockVulnerabilitySummary,
// };

// const mockVulnerabilityList: VulnerabilityTableData[] = [
//   {
//     cve: "CVE-2020-7165",
//     cvss: 1.2,
//     description:
//       "Improper handling of user input in SuperCoolApp 3.2.1 allows remote attackers to execute arbitrary code.",
//     published: "2023-07-09",
//     severity: "medium",
//     count: 39,
//   },
//   {
//     cve: "CVE-2023-4729",
//     cvss: 1.9,
//     description:
//       "Unauthenticated remote attackers can cause a denial of service in MegaApp 2.0 by sending malformed packets.",
//     published: "2023-08-08",
//     severity: "low",
//     count: 49,
//   },
//   {
//     cve: "CVE-2018-9148",
//     cvss: 10,
//     description:
//       "UltraLib 1.4.0 mishandles file uploads, allowing for remote code execution.",
//     published: "2023-07-13",
//     severity: "critical",
//     count: 42,
//   },
//   {
//     cve: "CVE-2020-3817",
//     cvss: 4.8,
//     description:
//       "An insecure deserialization issue in AwesomeTool 5.2 could allow attackers to execute arbitrary code on the server.",
//     published: "2023-07-04",
//     severity: "medium",
//     count: 47,
//   },
//   {
//     cve: "CVE-2021-6088",
//     cvss: 1.6,
//     description:
//       "CryptoLib 2.1 fails to validate encryption integrity, making it vulnerable to Man-in-the-Middle attacks.",
//     published: "2023-08-16",
//     severity: "medium",
//     count: 8,
//   },
//   {
//     cve: "CVE-2018-3106",
//     cvss: 8.3,
//     description:
//       "A buffer overflow in YetAnotherApp 6.0 allows for privilege escalation via specially crafted network traffic.",
//     published: "2023-07-05",
//     severity: "high",
//     count: 9,
//   },
//   {
//     cve: "CVE-2022-5371",
//     cvss: 7.9,
//     description:
//       "An SQL injection vulnerability in WebStore 3.0 allows attackers to execute arbitrary SQL commands.",
//     published: "2023-06-10",
//     severity: "high",
//     count: 15,
//   },
//   {
//     cve: "CVE-2020-6771",
//     cvss: 4.4,
//     description:
//       "SmartApp 7.0 stores sensitive user information in plaintext, potentially exposing it to unauthorized actors.",
//     published: "2023-06-18",
//     severity: "medium",
//     count: 26,
//   },
//   {
//     cve: "CVE-2021-1165",
//     cvss: 9.0,
//     description:
//       "A use-after-free vulnerability in GameEngine 2.0 can result in arbitrary code execution when processing malformed game files.",
//     published: "2023-07-24",
//     severity: "high",
//     count: 3,
//   },
//   {
//     cve: "CVE-2023-4954",
//     cvss: 9.5,
//     description:
//       "An out-of-bounds read in FileParser 1.0 can cause the application to crash, leading to a denial of service.",
//     published: "2023-07-19",
//     severity: "critical",
//     count: 1,
//   },
//   {
//     cve: "CVE-2022-6318",
//     cvss: 8.5,
//     description:
//       "A heap-based buffer overflow in VideoPlayer 5.0 allows attackers to execute arbitrary code via a crafted video file.",
//     published: "2023-07-05",
//     severity: "high",
//     count: 2,
//   },
//   {
//     cve: "CVE-2020-4997",
//     cvss: 4.0,
//     description:
//       "An XML external entity (XXE) vulnerability in XMLParser 4.0 allows for disclosure of internal files.",
//     published: "2023-06-20",
//     severity: "medium",
//     count: 46,
//   },
//   {
//     cve: "CVE-2023-7714",
//     cvss: 2.1,
//     description:
//       "Improper input validation in ImageProcessor 2.0 allows attackers to read arbitrary files on the host machine.",
//     published: "2023-06-06",
//     severity: "low",
//     count: 45,
//   },
//   {
//     cve: "CVE-2019-7814",
//     cvss: 2.5,
//     description:
//       "Insecure default configurations in WebService 3.0 could allow attackers to intercept sensitive information.",
//     published: "2023-07-03",
//     severity: "medium",
//     count: 21,
//   },
//   {
//     cve: "CVE-2022-3072",
//     cvss: 7.8,
//     description:
//       "An open redirect vulnerability in AuthManager 1.1 could allow for phishing attacks.",
//     published: "2023-06-10",
//     severity: "high",
//     count: 31,
//   },
//   {
//     cve: "CVE-2019-4933",
//     cvss: 5.2,
//     description:
//       "An insecure direct object reference (IDOR) in FileManager 6.0 could allow unauthorized access to files.",
//     published: "2023-08-18",
//     severity: "medium",
//     count: 50,
//   },
//   {
//     cve: "CVE-2023-9064",
//     cvss: 2.7,
//     description:
//       "A cross-site scripting (XSS) vulnerability in ChatApp 1.5 allows attackers to inject arbitrary web scripts.",
//     published: "2023-07-21",
//     severity: "low",
//     count: 32,
//   },
//   {
//     cve: "CVE-2022-2921",
//     cvss: 4.5,
//     description:
//       "A timing attack vulnerability in CryptoService 2.0 could allow attackers to guess encrypted values.",
//     published: "2023-06-13",
//     severity: "low",
//     count: 13,
//   },
//   {
//     cve: "CVE-2020-5294",
//     cvss: 9.9,
//     description:
//       "Improper access control in NetworkManager 8.0 could allow for unauthorized network changes.",
//     published: "2023-08-29",
//     severity: "critical",
//     count: 24,
//   },
//   {
//     cve: "CVE-2023-2596",
//     cvss: 1.8,
//     description:
//       "A server-side request forgery (SSRF) in APIGateway 3.0 could allow attackers to make unauthorized HTTP requests.",
//     published: "2023-06-04",
//     severity: "low",
//     count: 1,
//   },
// ];

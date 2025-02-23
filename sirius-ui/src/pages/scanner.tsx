// In src/components/scanner/Scanner.tsx
import React, { useState, useEffect, useCallback } from "react";
import Layout from "~/components/Layout";
import { ScanStatus } from "~/components/scanner/ScanStatus";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { VulnerabilityDataTable } from "~/components/VulnerabilityDataTable";
import { columns as vulnColumns } from "~/components/VulnerabilityDataTableColumns";
import { columns as hostColumns } from "~/components/EnvironmentDataTableColumns";
import {
  type EnvironmentTableData,
  type VulnerabilityTableData,
} from "~/types/scanTypes";
import { useScanResults } from "~/hooks/useScanResults";
import { useStartScan } from "~/hooks/useStartScan";
import ScanForm from "~/components/scanner/ScanForm";
import { Button } from "~/components/lib/ui/button";
import { type TargetType } from "~/hooks/useStartScan";
import { TemplatePicker } from "~/components/scanner/TemplatePicker";
import { TargetInput } from "~/components/scanner/TargetInput";
import { type ScanTemplate } from "~/types/scanTypes";

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

const Scanner: React.FC = () => {
  const [activeView, setActiveView] = useState("scan");
  const [activeTable, setActiveTable] = useState<"host-table" | "vuln-table">(
    "host-table"
  );
  const [targets, setTargets] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hostList, setHostList] = useState<EnvironmentTableData[]>([]);
  const [vulnerabilityList, setVulnerabilityList] = useState<
    VulnerabilityTableData[]
  >([]);
  const [displayScanDetails, setDisplayScanDetails] = useState(true);
  const [target, setTarget] = useState("");
  const { initiateScan, isLoading, error } = useStartScan();
  const scanResults = useScanResults();
  const [selectedTemplate, setSelectedTemplate] = useState<ScanTemplate>("quick");

  // Update table data based on live scan results.
  useEffect(() => {
    if (scanResults.hosts.length === 0) {
      setHostList([]);
      setVulnerabilityList([]);
      return;
    }

    // Map hosts into table data
    const mappedHosts = scanResults.hosts.map((host) => ({
      hostname: host,
      ip: host,
      os: "linux",
      vulnerabilityCount: 0,
      groups: [],
      tags: [],
    }));
    setHostList(mappedHosts);

    // Map vulnerabilities into table data
    const mappedVulnerabilities = scanResults.vulnerabilities.map((vuln) => ({
      cve: vuln.title,
      cvss: 0,
      description: vuln.description,
      published: "",
      severity: vuln.severity,
      count: 0,
    }));
    setVulnerabilityList(mappedVulnerabilities);
  }, [scanResults.hosts, scanResults.vulnerabilities]);

  const handleScan = async () => {
    try {
      if (!targets.length) {
        throw new Error("No targets specified");
      }

      await initiateScan(
        targets.map(target => ({
          value: target,
          type: determineTargetType(target)
        })),
        selectedTemplate
      );
    } catch (err) {
      console.error("Scan failed:", err);
    }
  };

  const determineTargetType = (value: string): TargetType => {
    // CIDR pattern (e.g., 192.168.1.0/24)
    const cidrPattern = /^(?:\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/;
    
    // IP Range pattern (e.g., 192.168.1.1-192.168.1.255)
    const ipRangePattern = /^(?:\d{1,3}\.){3}\d{1,3}-(?:\d{1,3}\.){3}\d{1,3}$/;
    
    // Single IP pattern
    const singleIpPattern = /^(?:\d{1,3}\.){3}\d{1,3}$/;

    if (cidrPattern.test(value)) {
      return "cidr";
    }
    
    if (ipRangePattern.test(value)) {
      return "ip_range";
    }
    
    if (singleIpPattern.test(value)) {
      return "single_ip";
    }

    // If none of the above, assume it's a DNS name
    return "dns_name";
  };


  const handleViewChange = useCallback((newView: string) => {
    setActiveView(newView);
  }, []);

  const handleAddTarget = (target: string) => {
    setTargets([...targets, target]);
  };

  const handleRemoveTarget = (target: string) => {
    setTargets(targets.filter(t => t !== target));
  };

  return (
    <Layout>
      <div className="relative z-20 mb-5 mt-[-40px] h-56">
        <div className="z-10 flex flex-row items-center">
          <div className="bg-paper ml-8 mt-4 flex flex-col gap-4 rounded-md">
            <ScanForm
              inputValue={inputValue}
              setInputValue={setInputValue}
              targetList={targets}
              addTarget={handleAddTarget}
              removeTarget={handleRemoveTarget}
              startScan={handleScan}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
            />
            <ScanNavigator
              view={activeView}
              handleViewNavigator={handleViewChange}
            />

            <div className="py-4">
              {activeView === "scan" && (
                <>
                  <div className="rounded border-violet-700/10 p-4 shadow-md dark:bg-violet-300/5">
                    {scanResults.scanResult ? (
                      <ScanStatus results={scanResults.scanResult} />
                    ) : (
                      <div>Loading scan status…</div>
                    )}
                    <div className="flex gap-4 p-2 text-xl font-thin">
                      <div
                        className={`flex cursor-pointer flex-col ${
                          activeTable === "host-table" ? "font-light" : ""
                        } hover:font-normal`}
                        onClick={() => {
                          setActiveTable("host-table");
                          setDisplayScanDetails(true);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Show host table"
                      >
                        Hosts
                      </div>
                      <div className="font-thin text-violet-100/40">|</div>
                      <div
                        className={`flex cursor-pointer flex-col ${
                          activeTable === "vuln-table" ? "font-light" : ""
                        } hover:font-normal`}
                        onClick={() => {
                          setActiveTable("vuln-table");
                          setDisplayScanDetails(true);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Show vulnerability table"
                      >
                        Vulnerabilities
                      </div>
                    </div>
                    {displayScanDetails && (
                      <>
                        {activeTable === "host-table" && (
                          <EnvironmentDataTable
                            columns={hostColumns}
                            data={hostList}
                          />
                        )}
                        {activeTable === "vuln-table" && (
                          <VulnerabilityDataTable
                            columns={vulnColumns}
                            data={vulnerabilityList}
                          />
                        )}
                      </>
                    )}
                  </div>
                  <hr className="pb-4" />
                </>
              )}
              {activeView === "config" && (
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
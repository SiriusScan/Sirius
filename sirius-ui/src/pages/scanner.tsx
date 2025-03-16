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
import ConfigView from "~/components/scanner/ConfigView";
import AdvancedView from "~/components/scanner/AdvancedView";
import { VulnerabilityTable } from "~/components/VulnerabilityTable";
import { scannerVulnerabilityColumns } from "~/components/ScannerVulnerabilityColumns";
import { cn } from "~/components/lib/utils";

interface ScanNavigatorProps {
  handleViewNavigator: (view: string) => void;
  view: string;
}

const ScanNavigator: React.FC<ScanNavigatorProps> = ({
  handleViewNavigator,
  view,
}) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        <button
          onClick={() => handleViewNavigator("scan")}
          className={cn(
            "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
            view === "scan"
              ? "border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-300"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
          )}
        >
          Scan Monitor
        </button>
        <button
          onClick={() => handleViewNavigator("config")}
          className={cn(
            "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
            view === "config"
              ? "border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-300"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
          )}
        >
          Configuration
        </button>
        <button
          onClick={() => handleViewNavigator("advanced")}
          className={cn(
            "whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium",
            view === "advanced"
              ? "border-violet-500 text-violet-600 dark:border-violet-400 dark:text-violet-300"
              : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-200"
          )}
        >
          Advanced
        </button>
      </nav>
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
  const [selectedTemplate, setSelectedTemplate] =
    useState<ScanTemplate>("quick");
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<
    string[]
  >([]);

  // Handle report generation
  const handleGenerateReport = (selectedVulns: VulnerabilityTableData[]) => {
    console.log(
      "Generating report for selected vulnerabilities:",
      selectedVulns
    );

    // Create report filename with date
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `sirius-vulnerability-report-${dateStr}.html`;

    // Create HTML report with metadata about the scan
    let reportContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sirius Scan Vulnerability Report</title>
      <meta charset="UTF-8">
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; color: #374151; }
        .logo { max-width: 150px; margin-bottom: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; }
        .report-title { font-size: 24px; font-weight: 600; color: #5b21b6; margin: 0; }
        .timestamp { color: #6b7280; font-size: 14px; }
        .divider { height: 1px; background-color: #e5e7eb; margin: 20px 0; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #111827; }
        .summary-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 20px; }
        .stats { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; }
        .stat-item { flex: 1; min-width: 150px; }
        .stat-value { font-size: 28px; font-weight: 600; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #6b7280; }
        .critical { color: #dc2626; }
        .high { color: #ea580c; }
        .medium { color: #ca8a04; }
        .low { color: #16a34a; }
        .info { color: #2563eb; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { background-color: #f3f4f6; padding: 10px; text-align: left; font-size: 14px; }
        .table td { padding: 12px 10px; border-top: 1px solid #e5e7eb; font-size: 14px; }
        .table tr:hover { background-color: #f9fafb; }
        .severity-badge {
          display: inline-block;
          border-radius: 9999px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 500;
        }
        .badge-critical { background-color: #fee2e2; color: #dc2626; }
        .badge-high { background-color: #ffedd5; color: #ea580c; }
        .badge-medium { background-color: #fef3c7; color: #ca8a04; }
        .badge-low { background-color: #dcfce7; color: #16a34a; }
        .badge-info { background-color: #dbeafe; color: #2563eb; }
        .cvss-bar {
          height: 6px;
          width: 80px;
          background-color: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          display: inline-block;
          margin-left: 10px;
          vertical-align: middle;
        }
        .cvss-fill {
          height: 100%;
          border-radius: 3px;
        }
        .footer { margin-top: 40px; font-size: 12px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="report-title">Sirius Scan Vulnerability Report</h1>
        <div class="timestamp">Generated on ${new Date().toLocaleString()}</div>
      </div>
      
      <div class="divider"></div>
      
      <div class="section">
        <div class="section-title">Scan Information</div>
        <div class="summary-box">
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">${selectedVulns.length}</div>
              <div class="stat-label">Vulnerabilities</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${targets.length}</div>
              <div class="stat-label">Targets Scanned</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${scanResults.hosts.length}</div>
              <div class="stat-label">Hosts Affected</div>
            </div>
          </div>
          <div>
            <strong>Scan Template:</strong> ${
              selectedTemplate.charAt(0).toUpperCase() +
              selectedTemplate.slice(1)
            }<br>
            <strong>Targets:</strong> ${targets.join(", ") || "None"}<br>
            <strong>Scan Date:</strong> ${new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Vulnerability Summary</div>
    `;

    // Count vulnerabilities by severity
    const severityCounts: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      INFO: 0,
    };

    selectedVulns.forEach((vuln) => {
      const severity = (vuln.severity || "").toUpperCase();
      if (severity.includes("CRIT")) severityCounts.CRITICAL++;
      else if (severity.includes("HIGH")) severityCounts.HIGH++;
      else if (severity.includes("MED")) severityCounts.MEDIUM++;
      else if (severity.includes("LOW")) severityCounts.LOW++;
      else severityCounts.INFO++;
    });

    // Add severity stats
    reportContent += `
        <div class="summary-box">
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value critical">${severityCounts.CRITICAL}</div>
              <div class="stat-label">Critical</div>
            </div>
            <div class="stat-item">
              <div class="stat-value high">${severityCounts.HIGH}</div>
              <div class="stat-label">High</div>
            </div>
            <div class="stat-item">
              <div class="stat-value medium">${severityCounts.MEDIUM}</div>
              <div class="stat-label">Medium</div>
            </div>
            <div class="stat-item">
              <div class="stat-value low">${severityCounts.LOW}</div>
              <div class="stat-label">Low</div>
            </div>
            <div class="stat-item">
              <div class="stat-value info">${severityCounts.INFO}</div>
              <div class="stat-label">Info</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">Detailed Findings</div>
        <table class="table">
          <thead>
            <tr>
              <th>CVE ID</th>
              <th>Severity</th>
              <th>CVSS Score</th>
              <th>Affected Hosts</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
    `;

    // Sort vulnerabilities by severity (highest first)
    const sortedVulns = [...selectedVulns].sort((a, b) => {
      const getSeverityValue = (severity: string) => {
        if (severity.toUpperCase().includes("CRIT")) return 4;
        if (severity.toUpperCase().includes("HIGH")) return 3;
        if (severity.toUpperCase().includes("MED")) return 2;
        if (severity.toUpperCase().includes("LOW")) return 1;
        return 0;
      };

      return getSeverityValue(b.severity) - getSeverityValue(a.severity);
    });

    // Add vulnerability details
    sortedVulns.forEach((vuln) => {
      const severity = (vuln.severity || "UNKNOWN").toUpperCase();
      let badgeClass = "badge-info";

      if (severity.includes("CRIT")) badgeClass = "badge-critical";
      else if (severity.includes("HIGH")) badgeClass = "badge-high";
      else if (severity.includes("MED")) badgeClass = "badge-medium";
      else if (severity.includes("LOW")) badgeClass = "badge-low";

      // Format the CVSS score and determine color
      const cvssScore = parseFloat(String(vuln.cvss || 0));
      let cvssColor = "#3b82f6"; // Default blue

      if (cvssScore >= 9.0) cvssColor = "#dc2626"; // Red
      else if (cvssScore >= 7.0) cvssColor = "#ea580c"; // Orange
      else if (cvssScore >= 4.0) cvssColor = "#ca8a04"; // Yellow
      else if (cvssScore > 0) cvssColor = "#16a34a"; // Green

      const formattedSeverity =
        severity.charAt(0) + severity.slice(1).toLowerCase();

      reportContent += `
        <tr>
          <td>${vuln.cve || "N/A"}</td>
          <td><span class="severity-badge ${badgeClass}">${formattedSeverity}</span></td>
          <td>
            ${isNaN(cvssScore) ? "N/A" : cvssScore.toFixed(1)}
            <div class="cvss-bar">
              <div class="cvss-fill" style="width: ${Math.min(
                cvssScore * 10,
                100
              )}%; background-color: ${cvssColor};"></div>
            </div>
          </td>
          <td>${vuln.count || 0}</td>
          <td>${vuln.description || "No description available"}</td>
        </tr>
      `;
    });

    // Close report HTML
    reportContent += `
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p>This report was generated by Sirius Scanner. The information in this report should be used for remediation planning and vulnerability management.</p>
      </div>
    </body>
    </html>
    `;

    // Create blob and download the report
    const blob = new Blob([reportContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

    // Map vulnerabilities into table data with improved CVSS score handling
    const mappedVulnerabilities = scanResults.vulnerabilities.map((vuln) => {
      // Extract or generate a reasonable CVSS score
      let cvssScore = 0;

      // Try to parse from various possible properties
      if (typeof vuln.cvss === "number") {
        cvssScore = vuln.cvss;
      } else if (typeof vuln.riskScore === "number") {
        cvssScore = vuln.riskScore;
      } else if (typeof vuln.score === "number") {
        cvssScore = vuln.score;
      } else {
        // Generate a score based on severity if no explicit score exists
        const severity = (vuln.severity || "").toUpperCase();
        if (severity.includes("CRIT")) cvssScore = 9.5;
        else if (severity.includes("HIGH")) cvssScore = 7.5;
        else if (severity.includes("MED")) cvssScore = 5.0;
        else if (severity.includes("LOW")) cvssScore = 2.5;
        else cvssScore = 1.0;
      }

      // Calculate affected host count
      const hostCount = Array.isArray(vuln.affectedHosts)
        ? vuln.affectedHosts.length
        : typeof vuln.count === "number"
        ? vuln.count
        : 1;

      return {
        cve: vuln.title || vuln.id || "Unknown",
        cvss: cvssScore,
        description: vuln.description || "No description available",
        severity: vuln.severity || "MEDIUM",
        count: hostCount,
      };
    });

    setVulnerabilityList(mappedVulnerabilities);
  }, [scanResults.hosts, scanResults.vulnerabilities]);

  const handleScan = async () => {
    try {
      if (!targets.length) {
        throw new Error("No targets specified");
      }

      await initiateScan(
        targets.map((target) => ({
          value: target,
          type: determineTargetType(target),
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
    setTargets(targets.filter((t) => t !== target));
  };

  const handleVulnerabilitySelection = (ids: string[]) => {
    setSelectedVulnerabilities(ids);
  };

  const handleViewVulnerabilityDetails = (id: string) => {
    console.log(`View details for vulnerability: ${id}`);
    // Implement navigation to vulnerability details
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
                          <div className="mt-4">
                            <EnvironmentDataTable
                              columns={hostColumns}
                              data={hostList as any}
                            />
                          </div>
                        )}
                        {activeTable === "vuln-table" && (
                          <div className="mt-4">
                            <VulnerabilityTable
                              columns={scannerVulnerabilityColumns}
                              data={vulnerabilityList}
                              onSelectionChange={(selected) => {
                                setSelectedVulnerabilities(
                                  selected.map((v) => v.cve)
                                );
                              }}
                              onGenerateReport={handleGenerateReport}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <hr className="pb-4" />
                </>
              )}
              {activeView === "config" && (
                <div className="rounded-lg border-violet-700/10 p-4 shadow-md dark:bg-violet-300/5">
                  <ConfigView />
                </div>
              )}
              {activeView === "advanced" && (
                <div className="rounded-lg  border-violet-700/10 p-4 shadow-md dark:bg-violet-300/5">
                  <AdvancedView />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Scanner;

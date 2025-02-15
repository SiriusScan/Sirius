import React, { useState } from "react";
import { ScanBar } from "../ScanBar";
import ScanIcon from "../icons/ScanIcon";
import { Badge } from "../lib/ui/badge";
import { Result } from "postcss";

interface VulnerabilityCountProps {
  count: number;
  color: string;
  severity: string;
  width: number;
}

export interface VulnerabilitySeverityCardsProps {
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

export type ScanResult = {
  id: string;
  status: string;
  targets: string[];
  hosts: string[]; // Prob not right
  hostsCompleted: number;
  vulnerabilities: VulnerabilitySummary[];
};
export type VulnerabilitySummary = {
  id: string;
  severity: string;
  title: string;
  description: string;
};

interface ScanStatusProps {
  results: ScanResult;
}

export const ScanStatus: React.FC<ScanStatusProps> = ({ results }) => {
  // Count vulnerabilities by severity
  const severityCounts = results?.vulnerabilities?.reduce<Record<string, number>>(
    (acc, vuln) => {
      acc[vuln.severity] = (acc[vuln.severity] ?? 0) + 1;
      return acc;
    },
    {}
  );
  return (
    <div className="">
      <div className="flex items-center gap-4">
        <div className="flex w-[800px] items-center gap-10">
          <VulnerabilitySeverityCards
            counts={{
              critical: severityCounts?.critical ?? 0,
              high: severityCounts?.high ?? 0,
              medium: severityCounts?.medium ?? 0,
              low: severityCounts?.low ?? 0,
              informational: severityCounts?.informational ?? 0,
            }}
          />
          <ScanBar hosts={results?.hosts?.length} hostsCompleted={results?.hostsCompleted} />
        </div>
        
      </div>
      <div className="mt-2 flex gap-6 p-4">
        <div className="flex flex-col border-r border-violet-100/40 pr-6">
          <div className="text-xs font-light text-violet-100">Hosts</div>
          <div className="mt-2 text-5xl font-light text-violet-100">{results?.hosts?.length}</div>
        </div>
        <div className="flex flex-col border-r border-violet-100/40 pr-6">
          <div className="text-xs font-light text-violet-100">
            Vulnerabilities
          </div>
          <div className="mt-2 text-5xl font-light text-violet-100">{results?.vulnerabilities?.length}</div>
        </div>
        <div className="flex h-[85px] flex-col">
          <div className="mb-2 text-xs font-light text-violet-100">Targets</div>
          <div className="text-md w-60 text-violet-100">
            {results?.targets?.map((target) => (
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
    </div>
  );
};
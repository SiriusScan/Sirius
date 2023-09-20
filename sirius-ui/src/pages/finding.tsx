import React, { useEffect, useState } from "react";

import Layout from "~/components/Layout";
import {
  type VulnerabilityTableData,
  columns,
} from "~/components/VulnerabilityDataTableColumns";
import { VulnerabilityDataTable } from "~/components/VulnerabilityDataTable";
import UnknownIcon from "~/components/icons/UnknownIcon";
import { VulnerabilitySeverityCardsHorizontal } from "~/components/VulnerabilitySeverityCards";
import { Button } from "~/components/lib/ui/button";
import { SeverityGage } from "~/components/vulnerabilityReport/SeverityGauge";
import { CvssBox } from "~/components/vulnerabilityReport/CvssBox";

import { data } from "~/cve";
import { CpeBox } from "~/components/vulnerabilityReport/CpeBox";
import ReactMarkdown from "react-markdown";
import { LongDescription } from "~/components/vulnerabilityReport/LongDescription";
import { References } from "~/components/vulnerabilityReport/References";
import { Remediation } from "~/components/vulnerabilityReport/Remediation";
import { ThreatBar } from "~/components/vulnerabilityReport/ThreatBar";
import { ThreatReport } from "~/components/vulnerabilityReport/ThreatReport";

type Props = {};

const name = "CVE-2017-0143 - SMB v1.0 Remote Code Execution";

const Finding = (props: Props) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [os, setOs] = useState(<UnknownIcon width="35px" height="35px" />);

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";

  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className={hexgradClass} key={hexgradClass}></div>
        {data.map((cve, index) => (
          <div
            key={index}
            className="mb-2 mt-2 max-w-min rounded-md border-violet-700/10 p-2 shadow-md shadow-violet-300/10 dark:bg-violet-300/5"
          >
            <div className="">
              <div className="z-10">
                <h1 className="mb-5 ml-3 mt-5 text-4xl font-extralight">
                  {cve.CVEDataMeta.ID} - {cve.Analysis.short_title}
                </h1>
              </div>
              <div className="flex flex-row">
                <div className="mb-2 flex flex-row rounded-md border p-2 shadow-lg">
                  <div className="flex h-48 w-72 flex-col">
                    <SeverityGage />
                  </div>
                  <div className="font-roboto flex flex-row px-2 md:mt-6 md:gap-4">
                    <CvssBox score={cve.CVSSV3.baseScore} />
                    {isMobile ? (
                      <CpeBox cve={cve} mobile={true} />
                    ) : (
                      <CpeBox cve={cve} mobile={false} />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-row">
                <div className="mb-2 justify-between gap-4 text-xl sm:flex-col">
                  <div className="font-orbitron pb-1 text-xs font-bold uppercase tracking-wider text-violet-100 text-opacity-70">
                    Short Description
                  </div>
                  <div className="font-roboto">
                    <div className="font-roboto space-y-2">
                      <ReactMarkdown>
                        {cve.Analysis.short_description}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              <LongDescription cve={cve} />
              <ThreatBar cve={cve} />
              <ThreatReport cve={cve} />
              <Remediation cve={cve} />
              <References cve={cve} />
            </div>
          </div>
        ))}

        <div className="ml-4 flex py-6"></div>
        <div className="ml-4 py-6">
          <div className="flex gap-2">
            <Button>Vulnerabilities</Button>
            <Button>Host Details</Button>
            <Button>Terminal</Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Finding;

export interface Cve {
  CVEDataFormat: string;
  CVEDataType: string;
  CVEDataVersion: string;
  CVEDataNumberOfCVEs: string;
  CVEDataTimestamp: string;
  CVEItems: null;
  CVEDataMeta: CVEDataMeta;
  Description: Description;
  Analysis: Analysis;
  CPE: Cpe;
  CVSSV3: Cvssv3;
  References: string[];
  Tags: null;
}

export interface Analysis {
  short_title: string;
  long_description: string;
  short_description: string;
  threat_analysis: string;
  remediation_plan: string;
  tags: string[];
}

export interface Cpe {
  operator: string;
  children: Child[];
}

export interface Child {
  operator: string;
  cpe_match: CpeMatch[];
}

export interface CpeMatch {
  vulnerable: boolean;
  cpe23Uri: string;
}

export interface CVEDataMeta {
  ID: string;
  ASSIGNER: string;
}

export interface Cvssv3 {
  version: string;
  vectorString: string;
  attackVector: string;
  attackComplexity: string;
  privilegesRequired: string;
  userInteraction: string;
  scope: string;
  confidentialityImpact: string;
  integrityImpact: string;
  availabilityImpact: string;
  baseScore: number;
  baseSeverity: string;
}

export interface Description {
  description_data: DescriptionDatum[];
}

export interface DescriptionDatum {
  lang: string;
  value: string;
}

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Layout from "~/components/Layout";
import { SeverityGage } from "~/components/vulnerabilityReport/SeverityGauge";
import { CvssBox } from "~/components/vulnerabilityReport/CvssBox";

import { CpeBox } from "~/components/vulnerabilityReport/CpeBox";
import ReactMarkdown from "react-markdown";
import { LongDescription } from "~/components/vulnerabilityReport/LongDescription";
import { References } from "~/components/vulnerabilityReport/References";
import { Remediation } from "~/components/vulnerabilityReport/Remediation";
import { ThreatBar } from "~/components/vulnerabilityReport/ThreatBar";
import { ThreatReport } from "~/components/vulnerabilityReport/ThreatReport";

import { type SiriusVulnerability } from "~/server/api/routers/vulnerability";

import { api } from "~/utils/api";

const Finding = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [siriusVuln, setSiriusVuln] = useState<SiriusVulnerability>();
  const [isMobile, setIsMobile] = useState(false);

  // tRPC State Management
  const router = useRouter();
  const vulnId = router.query.id as string;
  const {
    data: vuln,
    isLoading,
    isError,
  } = api.vulnerability.getVulnerability.useQuery(
    { id: vulnId },
    { enabled: vulnId !== undefined }
  );

  useEffect(() => {
    if (!vuln) return; // Exit if no vuln data
    setSiriusVuln(vuln);
  }, [vuln]);

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";
  if (isLoading) {
    return <div>Loading...</div>; // Loading state handler
  }
  if (isError || !siriusVuln) {
    return (
      <Layout>
        <div className="text-center">Error loading vulnerability</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className={hexgradClass} key={hexgradClass}></div>
        <div className="mb-2 mt-2 max-w-min rounded-md border-violet-700/10 p-2 shadow-md shadow-violet-300/10 dark:bg-violet-300/5">
          {siriusVuln?.cve ? (
            <ReportBody siriusVuln={siriusVuln} isMobile={isMobile} />
          ) : null}
        </div>
      </div>
    </Layout>
  );
};

export default Finding;

interface ReportBodyProps {
  siriusVuln: SiriusVulnerability;
  isMobile: boolean;
}

const ReportBody = ({ siriusVuln, isMobile }: ReportBodyProps) => {
  return (
    <div className="">
      <div className="z-10">
        <h1 className="mb-5 ml-3 mt-5 text-4xl font-extralight">
          {siriusVuln.vid} - {siriusVuln.cve?.Analysis.short_title}
        </h1>
      </div>
      <div className="flex flex-row">
        <div className="mb-2 flex flex-row rounded-md border p-2 shadow-lg">
          <div className="flex h-48 w-72 flex-col">
            <SeverityGage />
          </div>
          <div className="font-roboto flex flex-row px-2 md:mt-6 md:gap-4">
            <CvssBox score={siriusVuln.cve?.CVSSV3.baseScore || 0} />
            {isMobile ? (
              <CpeBox cve={siriusVuln.cve} mobile={true} />
            ) : (
              <CpeBox cve={siriusVuln.cve} mobile={false} />
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
                {siriusVuln.cve?.Analysis.short_description ?? ""}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      <LongDescription cve={siriusVuln.cve} />
      <ThreatBar cve={siriusVuln.cve} />
      <ThreatReport cve={siriusVuln.cve} />
      <Remediation cve={siriusVuln.cve} />
      <References cve={siriusVuln.cve} />
    </div>
  );
};

import { map } from "@trpc/server/observable";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import DashNumberCard from "~/components/DashNumberCard";
import Layout from "~/components/Layout";
import VulnerabilitiesOverTimeChart from "~/components/VulnerabilitiesOverTimeChart";
import DashboardIcon from "~/components/icons/DashboardIcon";
import VulnerabilityIcon from "~/components/icons/VulnerabilityIcon";
import HostsIcon from "~/components/icons/HostsIcon";
import AgentIcon from "~/components/icons/AgentIcon";
import { api } from "~/utils/api";
import { VulnerabilitySeverityCardsVertical } from "~/components/VulnerabilitySeverityCards";
import { ScanBar } from "~/components/ScanBar";
import VulnerabilityTableBasic from "~/components/VulnerabilityTableBasic";

type Props = {};

//Hardcoded data for VulnerabilityTableBasic => Pull from API response in future
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

const Dashboard = (props: Props) => {
  // Dummy data for DashNumberCard
  const data = [
    {
      title: "Vulnerabilities",
      number: 1082,
      color: "red",
      icon: (
        <VulnerabilityIcon
          className="h-4 w-4 fill-gray-700 text-white"
          fill="red"
        />
      ),
    },
    {
      title: "Hosts",
      number: 134,
      color: "blue",
      icon: (
        <HostsIcon className="h-4 w-4 fill-gray-700 text-white" fill="white" />
      ),
    },
    {
      title: "Agents",
      number: 56,
      color: "#1ff498",
      icon: <AgentIcon className="h-4 w-4 text-white" fill="none" />,
    },
  ];

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
  }, []);

  const hexgradClass = darkMode ? "hexgrad" : "light-hexgrad";

  return (
    <Layout>
      <div className="relative z-20 mb-5 h-56">
        <div className={hexgradClass} key={hexgradClass}></div>
        <div className="z-10 flex flex-row items-center">
          <DashboardIcon className="ml-4 mt-7 flex dark:fill-white" />
          <h1 className="ml-3 mt-5 flex text-4xl font-extralight ">
            Dashboard
          </h1>
          <div className="ml-12 mt-3 min-w-[300px]">
            <ScanBar progress={55} />
          </div>
        </div>
        <div className="ml-4 mt-6 flex gap-8">
          {data.map((item) => (
            <DashNumberCard
              key={item.title}
              title={item.title}
              number={item.number}
              color={item.color}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-row">
        <VulnerabilitiesOverTimeChart />
      </div>

      <div className="mb-8 mt-[-30px] flex flex-row">
        <VulnerabilitySeverityCardsVertical
          counts={{
            critical: 12,
            high: 7,
            medium: 15,
            low: 4,
            informational: 10,
          }}
        />
        <VulnerabilityTableBasic
          title="Latest Vulnerabilities"
          data={latestVulnerabilityData}
        />
        <VulnerabilityTableBasic
          title="Top Threats"
          data={latestVulnerabilityData}
        />
      </div>
      <div className="mb-8 ml-4 border-b border-violet-100/20 pb-2">
        <span className="text-2xl font-extralight">Environment Overview</span>
      </div>
      <EnvironmentOverview />
    </Layout>
  );
};

export default Dashboard;

const EnvironmentOverview = () => {
  return (
    <div className="ml-4 flex flex-row gap-4">
      <div className="flex flex-col">
        <div>Ports & Services</div>
      </div>
      <div className="flex flex-col">
        <div>Operating System Distribution</div>
      </div>
      <div className="flex flex-col">
        <div>Scan Details</div>
      </div>
    </div>
  );
};

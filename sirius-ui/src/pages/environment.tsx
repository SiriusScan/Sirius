import { DashboardIcon } from "@radix-ui/react-icons";
import React, { useEffect, useState } from "react";
import Layout from "~/components/Layout";
import { EnvironmentDataTable } from "~/components/EnvironmentDataTable";
import { columns } from "~/components/EnvironmentDataTableColumns";
import EnvironmentIcon from "~/components/icons/EnvironmentIcon";

type Props = {};

export type EnvironmentTableData = {
  hostname: string;
  ip: string;
  os: "linux" | "windows" | "macos";
  vulnerabilityCount: number;
  groups: string[];
  tags: string[];
};

const Environment = (props: Props) => {
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
          <div className="ml-4 mt-7 flex dark:fill-white">
            <EnvironmentIcon
              width="35px"
              height="35px"
              fill="white"
            />
          </div>
          <h1 className="ml-3 mt-5 flex text-4xl font-extralight ">
            Environment
          </h1>
        </div>
        <div className="py-6">
          <EnvironmentDataTable columns={columns} data={environmentList} />
        </div>
      </div>
    </Layout>
  );
};

export default Environment;

const environmentList: EnvironmentTableData[] = [
  {
    hostname: "host-01",
    ip: "192.168.1.2",
    os: "linux",
    vulnerabilityCount: 5,
    groups: ["web", "database"],
    tags: ["production"],
  },
  {
    hostname: "host-02",
    ip: "192.168.1.3",
    os: "windows",
    vulnerabilityCount: 8,
    groups: ["web"],
    tags: ["production", "critical"],
  },
  {
    hostname: "host-03",
    ip: "192.168.1.4",
    os: "macos",
    vulnerabilityCount: 2,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-04",
    ip: "192.168.1.5",
    os: "linux",
    vulnerabilityCount: 4,
    groups: ["database"],
    tags: ["production"],
  },
  {
    hostname: "host-05",
    ip: "192.168.1.6",
    os: "windows",
    vulnerabilityCount: 7,
    groups: ["web"],
    tags: ["staging"],
  },
  {
    hostname: "host-06",
    ip: "192.168.1.7",
    os: "linux",
    vulnerabilityCount: 3,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-07",
    ip: "192.168.1.8",
    os: "macos",
    vulnerabilityCount: 5,
    groups: ["database"],
    tags: ["production"],
  },
  {
    hostname: "host-08",
    ip: "192.168.1.9",
    os: "linux",
    vulnerabilityCount: 9,
    groups: ["web", "database"],
    tags: ["production", "critical"],
  },
  {
    hostname: "host-09",
    ip: "192.168.1.10",
    os: "windows",
    vulnerabilityCount: 1,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-10",
    ip: "192.168.1.11",
    os: "linux",
    vulnerabilityCount: 6,
    groups: ["web"],
    tags: ["staging"],
  },
  {
    hostname: "host-11",
    ip: "192.168.1.12",
    os: "macos",
    vulnerabilityCount: 7,
    groups: ["database"],
    tags: ["production"],
  },
  {
    hostname: "host-12",
    ip: "192.168.1.13",
    os: "linux",
    vulnerabilityCount: 3,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-13",
    ip: "192.168.1.14",
    os: "windows",
    vulnerabilityCount: 8,
    groups: ["web", "database"],
    tags: ["production", "critical"],
  },
  {
    hostname: "host-14",
    ip: "192.168.1.15",
    os: "macos",
    vulnerabilityCount: 4,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-15",
    ip: "192.168.1.16",
    os: "linux",
    vulnerabilityCount: 5,
    groups: ["web"],
    tags: ["staging"],
  },
  {
    hostname: "host-16",
    ip: "192.168.1.17",
    os: "windows",
    vulnerabilityCount: 6,
    groups: ["database"],
    tags: ["production"],
  },
  {
    hostname: "host-17",
    ip: "192.168.1.18",
    os: "linux",
    vulnerabilityCount: 9,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-18",
    ip: "192.168.1.19",
    os: "macos",
    vulnerabilityCount: 2,
    groups: ["web", "database"],
    tags: ["production", "critical"],
  },
  {
    hostname: "host-19",
    ip: "192.168.1.20",
    os: "linux",
    vulnerabilityCount: 7,
    groups: ["frontend"],
    tags: ["development"],
  },
  {
    hostname: "host-20",
    ip: "192.168.1.21",
    os: "windows",
    vulnerabilityCount: 4,
    groups: ["web"],
    tags: ["staging"],
  },
];

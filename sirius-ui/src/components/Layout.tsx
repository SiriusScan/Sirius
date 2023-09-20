// components/Layout.tsx
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ScanIcon from "./icons/ScanIcon";
import SiriusIcon from "./icons/SiriusIcon";
import Header from "./Header";
import VulnerabilityIcon from "./icons/VulnerabilityIcon";
import HostsIcon from "./icons/HostsIcon";
import AgentIcon from "./icons/AgentIcon";
import Link from "next/link";
import Head from "next/head";
import EnvironmentIcon from "./icons/EnvironmentIcon";

export const getServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return { props: {} };
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!session?.user && router.pathname !== "/" && status != "loading") {
      void router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const isDark = window.localStorage.getItem("darkMode") === "true";
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  //Loading Session data for component mount
  if (status === "loading") {
    return <>Loading</>;
  }

  const pages = [
    {
      name: (
        <VulnerabilityIcon
          className="pl-1 pr-1"
          width="35px"
          height="35px"
          fill="white"
        />
      ),
      href: "/vulnerabilities",
      current: false,
    },
    {
      name: (
        <EnvironmentIcon
          className="pl-1 pr-1"
          width="35px"
          height="35px"
          fill="white"
        />
      ),
      href: "/environment",
      current: false,
    },
    {
      name: (
        <ScanIcon
          className="pl-1 pr-1"
          width="35px"
          height="35px"
          fill="white"
        />
      ),
      href: "/scanner",
      current: false,
    },
    {
      name: (
        <AgentIcon
          className="pl-1 pr-1"
          width="35px"
          height="35px"
          fill="none"
        />
      ),
      href: "/scanner",
      current: false,
    },
  ];

  return (
    <div className="flex h-full min-h-screen flex-row">
      <Nav pages={pages} />
      <div className="ml-20 flex flex-grow flex-col">
        <Header title="Sirius Scan" />
        <Head>
          <title>Sirius Scan</title>
          <meta name="description" content="The Sirius Vulnerability Scanner" />
          <link rel="icon" href="/sirius-logo-square.png" />
        </Head>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
};

export default Layout;

interface NavProps {
  pages: {
    name: React.ReactNode;
    href: string;
    current: boolean;
  }[];
}

const Nav: React.FC<NavProps> = ({ pages }) => {
  return (
    <nav className="fixed h-full min-h-screen bg-secondary p-4 shadow-md shadow-black/30 dark:shadow-violet-300/20">
      <Link href="/dashboard">
        <div className="mb-2 block border-b border-violet-950 pb-3">
          <img
            src="/sirius-logo-square.png"
            alt="sirius-scan"
            className="h-[35px] w-[35px]"
          />
        </div>
      </Link>
      {pages.map((page) => (
        <a
          key={page.href}
          href={page.href}
          className="mb-2 block"
          aria-current={page.current ? "page" : undefined}
        >
          {page.name}
        </a>
      ))}
      <div className="mb-2 block border-b border-violet-950 pb-3"></div>
      <VulnerabilityIcon
        className="pl-1 pr-1"
        width="35px"
        height="35px"
        fill="white"
      />
    </nav>
  );
};

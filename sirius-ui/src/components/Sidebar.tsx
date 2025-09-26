import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import VulnerabilityIcon from "./icons/VulnerabilityIcon";
import EnvironmentIcon from "./icons/EnvironmentIcon";
import ScanIcon from "./icons/ScanIcon";
import AgentIcon from "./icons/AgentIcon";
import SiriusIcon from "./icons/SiriusIcon";
import { initializeTheme } from "~/utils/theme";

const navigationItems = [
  {
    name: "Scanner",
    href: "/scanner",
    icon: ScanIcon,
  },
  {
    name: "Vulnerabilities",
    href: "/vulnerabilities",
    icon: VulnerabilityIcon,
  },
  {
    name: "Environment",
    href: "/environment",
    icon: EnvironmentIcon,
  },
  {
    name: "Terminal",
    href: "/terminal",
    icon: AgentIcon,
  },
];

const Sidebar = () => {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const isDark = initializeTheme();
    setIsDarkMode(isDark);

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          setIsDarkMode(document.documentElement.classList.contains("dark"));
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="fixed h-full min-h-screen w-20 bg-secondary p-4 shadow-md shadow-black/30 dark:shadow-violet-300/20">
      <Link href="/dashboard" passHref>
        <div className="mb-2 ml-2 block cursor-pointer items-center border-b border-violet-950 pb-3">
          <SiriusIcon
            className={"h-[35px] w-[35px] fill-white dark:fill-white"}
          />
        </div>
      </Link>

      <div className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = router.pathname.startsWith(item.href);

          return (
            <Link key={item.href} href={item.href} passHref>
              <div className="group block cursor-pointer">
                <div
                  className={`flex w-full items-center justify-center rounded-md p-2 transition-colors ${
                    isActive
                      ? "bg-violet-600/20 text-white"
                      : "text-white hover:bg-violet-600/10 hover:text-white"
                  }`}
                  onClick={(e) => {
                    // Prevent double navigation if already on the current page
                    if (router.pathname === item.href) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Icon
                    className="transition-colors"
                    width="35px"
                    height="35px"
                    stroke="currentColor"
                    fill={isDarkMode ? "white" : "white"}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Sidebar;

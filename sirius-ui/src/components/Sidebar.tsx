import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Tooltip from "@radix-ui/react-tooltip";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = initializeTheme();
    setIsDarkMode(isDark);
    setMounted(true);

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
    <Tooltip.Provider delayDuration={100}>
      <nav className="fixed h-full min-h-screen w-20 bg-secondary px-2 py-3 shadow-lg shadow-black/30 dark:shadow-violet-300/20">
        {/* Sirius Logo */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link href="/dashboard" passHref>
              <div
                className={`
                  group relative mb-2 flex h-16 w-16 cursor-pointer items-center justify-center 
                  overflow-hidden rounded-xl
                  transition-all duration-300 ease-out
                  hover:scale-105
                `}
                style={{
                  animation: mounted
                    ? `fade-in-up 0.4s ease-out forwards`
                    : "none",
                  animationDelay: "0s",
                }}
              >
                {/* Clean background for logo - only when selected */}
                {router.pathname === "/dashboard" && (
                  <>
                    {/* Main background with softer glassmorphism */}
                    <div className="from-violet-500/15 to-purple-600/15 absolute inset-0 rounded-xl bg-gradient-to-br via-violet-600/10 backdrop-blur-sm" />

                    {/* Subtle border glow */}
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-violet-400/10" />
                  </>
                )}

                {/* Icon with smooth rotation on hover */}
                <div
                  className={`
                    relative z-10 transition-all duration-300
                    ${
                      router.pathname === "/dashboard"
                        ? "scale-105 drop-shadow-[0_0_10px_rgba(167,139,250,0.9)]"
                        : "group-hover:rotate-12 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]"
                    }
                  `}
                >
                  <SiriusIcon
                    width="45px"
                    height="45px"
                    fill={isDarkMode ? "white" : "white"}
                  />
                </div>
              </div>
            </Link>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right"
              sideOffset={12}
              className="animate-fade-in-up z-50 rounded-md border border-violet-500/30 bg-violet-950 px-3 py-2 text-sm font-medium text-white shadow-lg"
            >
              Dashboard
              <Tooltip.Arrow className="fill-violet-950" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Subtle separator */}
        <div className="mb-1 h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* Navigation Items */}
        <div className="ml-1 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = router.pathname.startsWith(item.href);

            return (
              <Tooltip.Root key={item.href}>
                <Tooltip.Trigger asChild>
                  <Link href={item.href} passHref>
                    <div
                      className="group relative block cursor-pointer"
                      style={{
                        animation: mounted
                          ? `fade-in-up 0.4s ease-out forwards`
                          : "none",
                        animationDelay: `${(index + 1) * 0.1}s`,
                        opacity: mounted ? 1 : 0,
                      }}
                    >
                      <div
                        className={`
                          relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl
                          transition-all duration-200 ease-out
                          ${
                            isActive
                              ? "scale-105"
                              : "scale-100 group-hover:scale-105"
                          }
                        `}
                        onClick={(e) => {
                          // Prevent double navigation if already on the current page
                          if (router.pathname === item.href) {
                            e.preventDefault();
                          }
                        }}
                      >
                        {/* Clean selected state background - only when active */}
                        {isActive && (
                          <>
                            {/* Main background with softer glassmorphism */}
                            <div className="from-violet-500/15 to-purple-600/15 absolute inset-0 rounded-xl bg-gradient-to-br via-violet-600/10 backdrop-blur-sm" />

                            {/* Subtle border glow */}
                            <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-violet-400/10" />

                            {/* Sleek full-height left accent bar */}
                            <div className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-violet-400 via-violet-500 to-violet-400" />
                          </>
                        )}

                        {/* Icon with smooth animations */}
                        <div
                          className={`
                            relative z-10 transition-all duration-200
                            ${
                              isActive
                                ? "scale-105 drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]"
                                : "group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(167,139,250,0.6)]"
                            }
                          `}
                        >
                          <Icon
                            className="transition-all duration-200"
                            width="35px"
                            height="35px"
                            stroke="currentColor"
                            fill={isDarkMode ? "white" : "white"}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={12}
                    className="animate-fade-in-up z-50 rounded-md border border-violet-500/30 bg-violet-950 px-3 py-2 text-sm font-medium text-white shadow-lg"
                  >
                    {item.name}
                    <Tooltip.Arrow className="fill-violet-950" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </div>
      </nav>
    </Tooltip.Provider>
  );
};

export default Sidebar;

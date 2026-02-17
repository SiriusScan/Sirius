import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Tooltip from "@radix-ui/react-tooltip";
import VulnerabilityIcon from "./icons/VulnerabilityIcon";
import EnvironmentIcon from "./icons/EnvironmentIcon";
import ScanIcon from "./icons/ScanIcon";
import AgentIcon from "./icons/AgentIcon";
import SiriusIcon from "./icons/SiriusIcon";

const navigationItems = [
  {
    name: "Scanner",
    href: "/scanner",
    matchPaths: ["/scanner"],
    icon: ScanIcon,
  },
  {
    name: "Vulnerabilities",
    href: "/vulnerabilities",
    matchPaths: ["/vulnerabilities", "/vulnerability"],
    icon: VulnerabilityIcon,
  },
  {
    name: "Environment",
    href: "/environment",
    matchPaths: ["/environment", "/host"],
    icon: EnvironmentIcon,
  },
  {
    name: "Terminal",
    href: "/terminal",
    matchPaths: ["/terminal"],
    icon: AgentIcon,
  },
];

const Sidebar = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Tooltip.Provider delayDuration={100}>
      <nav className="fixed h-full min-h-screen w-20 bg-secondary px-2 py-3 shadow-lg shadow-violet-300/20">
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
                {router.pathname.startsWith("/dashboard") && (
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
                      router.pathname.startsWith("/dashboard")
                        ? "scale-105 text-white"
                        : "text-white/80 group-hover:text-white group-hover:rotate-12 group-hover:scale-105"
                    }
                  `}
                >
                  <SiriusIcon
                    width="45px"
                    height="45px"
                    fill="currentColor"
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
            const isActive = item.matchPaths.some((p) =>
              router.pathname.startsWith(p),
            );

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
                              : "scale-100 group-hover:scale-105 group-hover:bg-white/5"
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
                                ? "scale-105 text-white"
                                : "text-white/80 group-hover:text-white group-hover:scale-105"
                            }
                          `}
                        >
                          <Icon
                            className="transition-all duration-200"
                            width="35px"
                            height="35px"
                            stroke="currentColor"
                            fill="currentColor"
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

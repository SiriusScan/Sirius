import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as Tooltip from "@radix-ui/react-tooltip";
import SiriusIcon from "./icons/SiriusIcon";
import { uiExtensionRegistry, useCapabilities } from "~/ui/extensions";

// Tooltips stay inside the 80px rail (w-20) so they never cover page content
// beside it, such as Chat's conversation search: they open below an icon
// (above it in the footer), centered, no wider than the rail.
const TOOLTIP_CLASS =
  "pointer-events-none z-[100] max-w-[76px] break-words rounded-md border border-violet-500/50 bg-[#161224] px-1 py-1 text-center text-[10px] font-medium leading-tight tracking-tight text-white shadow-lg shadow-black/60";

function RailTooltip({ side, children }: { side: "top" | "bottom"; children: React.ReactNode }) {
  return (
    <Tooltip.Portal>
      <Tooltip.Content
        side={side}
        align="center"
        sideOffset={4}
        collisionPadding={2}
        className={TOOLTIP_CLASS}
      >
        {children}
        <Tooltip.Arrow width={8} height={4} className="fill-[#161224]" />
      </Tooltip.Content>
    </Tooltip.Portal>
  );
}

const Sidebar = () => {
  const router = useRouter();
  const { hasAll } = useCapabilities();
  const [mounted, setMounted] = useState(false);
  const visibleItems = uiExtensionRegistry.navigationItems.filter((item) =>
    hasAll(item.requiredCapabilities ?? []),
  );
  const navigationItems = visibleItems.filter(
    (item) => (item.placement ?? "main") === "main",
  );
  // Extension items pinned to the bottom of the sidebar; none in Community,
  // so its sidebar renders only the main group, exactly as before.
  const footerItems = visibleItems.filter((item) => item.placement === "footer");
  const groups = [
    { id: "main", className: "ml-1 space-y-2", items: navigationItems, offset: 0 },
    ...(footerItems.length > 0
      ? [{ id: "footer", className: "absolute bottom-3 left-2 ml-1 space-y-2", items: footerItems, offset: navigationItems.length }]
      : []),
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Tooltip.Provider delayDuration={100}>
      <nav className="fixed h-full min-h-screen w-20 bg-secondary px-2 py-3 shadow-lg shadow-violet-300/20">
        {/* Sirius Logo */}
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Link href="/dashboard" passHref aria-label="Dashboard">
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
          <RailTooltip side="bottom">Dashboard</RailTooltip>
        </Tooltip.Root>

        {/* Subtle separator */}
        <div className="mb-1 h-px w-full bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

        {/* Navigation Items */}
        {groups.map((group) => (
          <div key={group.id} className={group.className}>
          {group.items.map((item, itemIndex) => {
            const index = group.offset + itemIndex;
              const Icon = item.icon;
              const isActive = item.matchPaths.some((path) =>
                router.pathname === path ||
                router.pathname.startsWith(`${path}/`),
              );

              return (
                <Tooltip.Root key={item.href}>
                  <Tooltip.Trigger asChild>
                    <Link
                      href={item.href}
                      passHref
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                    >
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
                  <RailTooltip side={group.id === "footer" ? "top" : "bottom"}>
                    {item.label}
                  </RailTooltip>
                </Tooltip.Root>
              );
          })}
          </div>
        ))}
      </nav>
    </Tooltip.Provider>
  );
};

export default Sidebar;

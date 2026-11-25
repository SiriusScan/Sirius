/**
 * PageTabs — underline tabs under a page header, as on the Host and CVE pages,
 * with the active tab held in the URL (`?tab=<id>` by default) so it can be
 * linked and restored with Back (ADR-6).
 *
 *   const TABS = [{ id: "overview", label: "Overview" },
 *                 { id: "vulnerabilities", label: "Vulnerabilities", count: 162 }];
 *   const tab = usePageTab(TABS.map((t) => t.id), "overview");
 *   <PageHeader ... tabs={<PageTabs tabs={TABS} defaultTab="overview" />} />
 *   {tab === "overview" && <Overview />}
 *
 * In PageHeader's `tabs` slot the strip drops its own rule, sits on the
 * header's bottom border and follows the title (`h1 ~ nav`).
 */

import React, { createContext, useContext, useMemo } from "react";
import { cn } from "~/components/lib/utils";
import { useUrlTab } from "~/hooks/useUrlTab";

export interface PageTab {
  id: string;
  label: string;
  /** Shown as a small chip after the label; omit to show none. */
  count?: number;
}

export interface PageTabsProps {
  tabs: readonly PageTab[];
  defaultTab: string;
  /** Query parameter that holds the tab. Default "tab". */
  param?: string;
  /** Called after the URL changes, for pages that also track the tab. */
  onTabChange?: (id: string) => void;
  className?: string;
  "aria-label"?: string;
}

/** Set by PageHeader so tabs inside it sit on the header's border. */
export const PageTabsEmbedContext = createContext(false);

/** The active tab id from the URL, falling back to `defaultTab`. */
export function usePageTab<T extends string>(
  tabIds: readonly T[],
  defaultTab: T,
  param = "tab",
): T {
  return useUrlTab(tabIds, defaultTab, param)[0];
}

export function PageTabs({
  tabs,
  defaultTab,
  param = "tab",
  onTabChange,
  className,
  "aria-label": ariaLabel = "Page sections",
}: PageTabsProps) {
  const embedded = useContext(PageTabsEmbedContext);
  const ids = useMemo(() => tabs.map((t) => t.id), [tabs]);
  const [active, setTab] = useUrlTab(ids, defaultTab, param);

  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        embedded ? "col-span-full row-start-3 -mb-px mt-1.5" : "border-b border-violet-500/10 px-1",
        className,
      )}
    >
      <div role="tablist" className={cn("flex gap-1 overflow-x-auto", !embedded && "-mb-px")}>
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${param}-${tab.id}`}
              aria-selected={isActive}
              data-tab={tab.id}
              onClick={() => {
                if (isActive) return;
                setTab(tab.id);
                onTabChange?.(tab.id);
              }}
              className={cn(
                "relative flex shrink-0 items-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/40",
                isActive
                  ? "border-violet-500 text-violet-300"
                  : "border-transparent text-gray-500 hover:border-violet-500/20 hover:text-gray-300",
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "ml-1.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums",
                    isActive ? "bg-violet-500/20 text-violet-300" : "bg-gray-800 text-gray-500",
                  )}
                >
                  {tab.count.toLocaleString("en-US")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default PageTabs;

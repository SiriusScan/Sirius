/**
 * PageHeader — the sticky header of a document-frame page: icon tile, a small
 * breadcrumb line above the title, meta chips beside it, actions at the
 * right, and optional PageTabs along its bottom border.
 *
 *   <Layout>
 *     <div className="relative z-20 -mt-14 space-y-6">
 *       <PageHeader
 *         icon={Server}
 *         breadcrumb={[{ label: "Environment", href: "/environment" }]}
 *         title="web-01.example"
 *         meta={<HeaderChip mono>192.0.2.12</HeaderChip>}
 *         actions={<Button>Rescan host</Button>}
 *         tabs={<PageTabs tabs={TABS} defaultTab="overview" />}
 *       />
 *       ...
 *
 * The account menu floats over the header's top-right corner; the header
 * keeps that corner clear using the width Header publishes in
 * --sirius-header-reserve (wider while the scan pill shows), 3.5rem otherwise.
 * Pages without a PageHeader get the scan indicator as a badge on the avatar.
 */

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { PageTabsEmbedContext } from "./PageTabs";
import { HEADER_RESERVE_VAR, useReserveHeaderRoom } from "./headerRoom";

export interface Crumb {
  label: string;
  href?: string;
}

export type PageHeaderIcon =
  | LucideIcon
  | React.ComponentType<{ className?: string }>
  | React.ReactElement;

export interface PageHeaderProps {
  /** A lucide icon (or any component taking className), or a ready element. */
  icon: PageHeaderIcon;
  title: React.ReactNode;
  breadcrumb?: readonly Crumb[];
  /** Chips beside the title, e.g. <HeaderChip mono>192.0.2.12</HeaderChip>. */
  meta?: React.ReactNode;
  /** Right-aligned buttons. */
  actions?: React.ReactNode;
  /** Usually <PageTabs ... />; rendered on the header's bottom border. */
  tabs?: React.ReactNode;
  /** Stick to the top while the page scrolls. Default true. */
  sticky?: boolean;
  className?: string;
}

const RESERVE = `var(${HEADER_RESERVE_VAR}, 3.5rem)`;

function renderIcon(icon: PageHeaderIcon) {
  if (React.isValidElement(icon)) return icon;
  const Icon = icon as React.ComponentType<{ className?: string }>;
  return <Icon className="h-5 w-5 text-violet-400" />;
}

export function PageHeader({
  icon,
  title,
  breadcrumb,
  meta,
  actions,
  tabs,
  sticky = true,
  className,
}: PageHeaderProps) {
  // Tell the app Header this page keeps room for the scan pill.
  useReserveHeaderRoom();
  const hasCrumbs = !!breadcrumb && breadcrumb.length > 0;
  // With a breadcrumb the icon and actions centre on both text lines.
  const sideRows = hasCrumbs ? "row-span-2 row-start-1" : "row-start-2";

  return (
    <header
      className={cn(
        "z-header -mx-4 grid grid-cols-[auto_minmax(0,max-content)_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-violet-500/20 bg-gray-900/95 px-4 pt-2.5 shadow-lg shadow-black/20 backdrop-blur-sm md:-mx-6 md:px-6",
        sticky ? "sticky top-2" : "relative",
        tabs ? "pb-0" : "pb-2.5",
        className,
      )}
    >
      <div
        className={cn(
          "col-start-1 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-violet-500/20",
          sideRows,
        )}
      >
        {renderIcon(icon)}
      </div>

      {hasCrumbs && (
        <div
          role="navigation"
          aria-label="Breadcrumb"
          className="col-span-2 col-start-2 row-start-1 flex min-w-0 items-center gap-1 text-[11px] leading-4 text-gray-500"
        >
          {breadcrumb.map((crumb, i) => (
            <React.Fragment key={`${crumb.label}-${i}`}>
              {i > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-gray-600" aria-hidden />}
              {crumb.href ? (
                <Link href={crumb.href} className="truncate transition-colors hover:text-violet-300">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      <h1 className="col-start-2 row-start-2 truncate text-xl font-bold leading-7 tracking-tight text-white">
        {title}
      </h1>

      <div className="col-start-3 row-start-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 overflow-hidden">
        {meta}
      </div>

      <div
        className={cn("col-start-4 flex shrink-0 items-center gap-2", sideRows)}
        style={{ marginRight: RESERVE }}
      >
        {actions}
      </div>

      {tabs && (
        <PageTabsEmbedContext.Provider value={true}>{tabs}</PageTabsEmbedContext.Provider>
      )}
    </header>
  );
}

/** A small chip for PageHeader's meta slot; `mono` for IPs and ids. */
export function HeaderChip({
  children,
  icon: Icon,
  mono = false,
  title,
  className,
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  mono?: boolean;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex min-w-0 max-w-full items-center gap-1.5 whitespace-nowrap rounded-md border border-violet-500/20 bg-violet-500/5 px-2 py-0.5 text-xs text-gray-300",
        mono && "font-mono",
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-violet-400" aria-hidden />}
      <span className="truncate">{children}</span>
    </span>
  );
}

export default PageHeader;

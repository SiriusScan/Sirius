/**
 * HostHeader (R05) — the host page's sticky header, built on the kit's
 * PageHeader: the server icon tile, an "Environment" breadcrumb above the
 * hostname, chips for the IP, the OS and each source, and the actions
 * Edit and "Rescan host" (the primary action: the verify loop). The tabs
 * sit on its bottom border.
 */

import React from "react";
import Link from "next/link";
import { Monitor, Pencil, RotateCw, Server } from "lucide-react";
import { HeaderChip, PageHeader } from "~/components/shared/PageHeader";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { osLabel, realText, rescanHref } from "./hostModel";

export interface HostHeaderHost {
  hostname?: string | null;
  os?: string | null;
  osversion?: string | null;
  sources?: readonly string[];
}

interface HostHeaderProps {
  ip: string;
  /** Null while loading: the header shows the address and no actions. */
  host?: HostHeaderHost | null;
  tabs?: React.ReactNode;
  onEdit?: () => void;
}

const BREADCRUMB = [{ label: "Environment", href: "/environment" }] as const;

/** The solid violet primary action, sized for the header. */
const PRIMARY_ACTION =
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-3 text-xs font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60";

/** The lib/ui ghost button look, at the header's size. */
const GHOST_ACTION =
  "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-xs font-medium text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40";

export const HostHeader: React.FC<HostHeaderProps> = ({ ip, host, tabs, onEdit }) => {
  const hostname = realText(host?.hostname);
  const os = host ? osLabel(host.os, host.osversion) : undefined;
  const sources = host?.sources ?? [];

  const meta = host ? (
    <>
      {hostname && (
        <HeaderChip mono title="IP address">
          {ip}
        </HeaderChip>
      )}
      {os && (
        <HeaderChip icon={Monitor} title="Operating system">
          {os}
        </HeaderChip>
      )}
      {sources.map((source) => (
        <SourceBadge key={source} source={source} className="px-2 py-0.5 text-[11px]" />
      ))}
    </>
  ) : undefined;

  const actions = host ? (
    <>
      {onEdit && (
        <button type="button" className={GHOST_ACTION} onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Edit</span>
          <span className="sr-only sm:hidden">Edit host</span>
        </button>
      )}
      <Link href={rescanHref(ip)} className={PRIMARY_ACTION} title={`Scan ${ip} again`}>
        <RotateCw className="h-3.5 w-3.5" aria-hidden />
        <span className="hidden sm:inline">Rescan host</span>
        <span className="sr-only sm:hidden">Rescan host</span>
      </Link>
    </>
  ) : undefined;

  return (
    <PageHeader
      icon={Server}
      breadcrumb={BREADCRUMB}
      title={hostname ?? (ip ? <span className="font-mono">{ip}</span> : "Host")}
      meta={meta}
      actions={actions}
      tabs={tabs}
    />
  );
};

export default HostHeader;

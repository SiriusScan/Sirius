/**
 * HostRowActions — a host row's action: open the host page (R04).
 *
 * The old menu offered scan, tag and remove items that did nothing; they are
 * gone. Rescans start from the host page ("Rescan host").
 */

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { hostHref } from "~/components/shared/HostCell";

export interface HostRowActionsProps {
  host: { ip: string; hostname?: string | null };
  className?: string;
}

export const HostRowActions: React.FC<HostRowActionsProps> = ({ host, className }) => {
  const hostname = host.hostname?.trim();
  const name = hostname ? hostname : host.ip;
  return (
    <Link
      href={hostHref(host.ip)}
      aria-label={`Open ${name}`}
      title={`Open ${name}`}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md border border-violet-500/30 text-violet-300 transition-colors hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
        className,
      )}
    >
      <ChevronRight className="h-4 w-4" aria-hidden />
    </Link>
  );
};

export default HostRowActions;

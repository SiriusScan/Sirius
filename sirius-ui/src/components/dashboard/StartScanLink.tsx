/**
 * StartScanLink — the Dashboard header's one primary action ("Start scan"),
 * styled like the kit's EmptyState primary button.
 */

import React from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "~/components/lib/utils";

export function StartScanLink({ className }: { className?: string }) {
  return (
    <Link
      href="/scanner"
      aria-label="Start scan"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md bg-violet-600 px-3 text-xs font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60",
        className,
      )}
    >
      <Play className="h-3.5 w-3.5" aria-hidden />
      <span className="hidden sm:inline">Start scan</span>
    </Link>
  );
}

export default StartScanLink;

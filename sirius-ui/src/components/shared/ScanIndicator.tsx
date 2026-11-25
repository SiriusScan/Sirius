/**
 * ScanIndicator — header pill while a scan runs ("Scanning 1 target · 48%"),
 * linking to /scanner. Renders nothing when idle, on /scanner itself, and
 * for viewers who can't open the Scanner.
 *
 * variant "pill" (default) sits beside the account menu; "badge" is a small
 * dot on the avatar's corner for frames whose own top bar only keeps the
 * avatar's width clear (the workspace frame).
 */

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Loader2 } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { uiExtensionRegistry, useCapabilities } from "~/ui/extensions";
import { useActiveScan } from "~/hooks/useActiveScan";
import { scanIndicatorLabel, type ActiveScan } from "./scanSummary";

const SCANNER_PATH = "/scanner";

export interface ScanIndicatorProps {
  variant?: "pill" | "badge";
  className?: string;
}

export function ScanIndicator(props: ScanIndicatorProps) {
  const router = useRouter();
  const { hasAll } = useCapabilities();
  const canOpenScanner = hasAll(
    uiExtensionRegistry.getRequiredCapabilitiesForPath(SCANNER_PATH),
  );
  const onScanner =
    router.pathname === SCANNER_PATH || router.pathname.startsWith(`${SCANNER_PATH}/`);
  if (!canOpenScanner || onScanner) return null;
  return <ActiveScanIndicator {...props} />;
}

function ActiveScanIndicator(props: ScanIndicatorProps) {
  const scan = useActiveScan();
  return <ScanIndicatorView scan={scan} {...props} />;
}

/** The indicator for a given scan summary; renders nothing when idle. */
export function ScanIndicatorView({
  scan,
  variant = "pill",
  className,
}: ScanIndicatorProps & { scan: ActiveScan }) {
  if (!scan.active) return null;
  const label = scanIndicatorLabel(scan);

  if (variant === "badge") {
    return (
      <Link
        href={SCANNER_PATH}
        title={label}
        aria-label={label}
        data-scan-indicator="badge"
        className={cn(
          "pointer-events-auto flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white shadow-md shadow-black/40 ring-2 ring-gray-900 transition-colors hover:bg-violet-500",
          className,
        )}
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href={SCANNER_PATH}
      title="Open the Scanner"
      data-scan-indicator="pill"
      className={cn(
        "pointer-events-auto inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-full border border-violet-500/30 bg-gray-900/90 px-3 text-xs font-medium text-violet-200 shadow-md shadow-black/30 backdrop-blur-sm transition-colors hover:border-violet-400/50 hover:bg-violet-500/15",
        className,
      )}
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
      </span>
      <span>{label}</span>
      {scan.progress !== undefined && scan.status !== "cancelling" && (
        <span className="h-1 w-10 overflow-hidden rounded-full bg-violet-500/20" aria-hidden>
          <span
            className="block h-full rounded-full bg-violet-400 transition-[width] duration-500"
            style={{ width: `${scan.progress}%` }}
          />
        </span>
      )}
    </Link>
  );
}

export default ScanIndicator;

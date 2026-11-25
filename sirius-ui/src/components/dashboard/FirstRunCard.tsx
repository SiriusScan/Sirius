/**
 * FirstRunCard (R02) — what the Dashboard shows while the inventory is
 * empty: three ways to start and how the pieces fit together, instead of
 * empty widgets and 0/0 counts.
 *
 * When a scan has already run but found nothing, the heading says so rather
 * than "Nothing has been scanned yet".
 */

import React from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Layers, Radar, Server, User } from "lucide-react";
import { cn } from "~/components/lib/utils";
import type { SummaryLastScan } from "~/types/riskSummary";
import { lastScanHeading, scanPhase } from "./dashboardModel";

/** Where "Add host" goes: the Environment page's Add Host form. */
export const ADD_HOST_HREF = "/environment?add=";
/** The operator console's Agent view (`?view=agent`). */
export const AGENT_HREF = "/terminal?view=agent";

const primaryAction =
  "inline-flex h-8 items-center gap-1.5 rounded-md bg-violet-600 px-3 text-xs font-medium text-white transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60";
const secondaryAction =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-violet-500/20 bg-violet-500/10 px-3 text-xs font-medium text-violet-200 transition-colors hover:border-violet-500/30 hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60";

function StarterCard({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action: { label: string; href: string; primary?: boolean };
}) {
  return (
    <div className="flex flex-col rounded-lg border border-violet-500/15 bg-gray-950/30 p-4">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h3 className="mt-3 text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 flex-1 text-xs leading-5 text-gray-400">{body}</p>
      <div className="mt-3">
        <Link href={action.href} className={action.primary ? primaryAction : secondaryAction}>
          {action.label}
        </Link>
      </div>
    </div>
  );
}

const STEPS: Array<{ title: string; body: string }> = [
  { title: "Scan", body: "Discover hosts, ports and services" },
  { title: "Review hosts", body: "Each host's risk and findings in one place" },
  { title: "Fix", body: "Named fixed versions per CVE" },
  { title: "Verify", body: "Rescan the host to confirm the fix" },
];

export function FirstRunCard({
  lastScan,
  className,
}: {
  lastScan?: SummaryLastScan | null;
  className?: string;
}) {
  const scanned = !!lastScan;
  const running = !!lastScan && scanPhase(lastScan) === "running";
  const heading = lastScanHeading(lastScan);
  const title = running
    ? "A scan is running. Nothing is in the inventory yet."
    : scanned
      ? "No hosts in the inventory yet."
      : "Welcome to Sirius. Nothing has been scanned yet.";
  const reason = running
    ? "Every host the scan finds is saved to Environment, and the dashboard fills in as results arrive."
    : scanned
      ? `The last scan${heading.when ? ` (${heading.when})` : ""} found no hosts. Try another target, add a host by hand, or install the agent.`
      : "The dashboard fills in after your first scan: counts, the riskiest hosts and what to fix first. Pick a starting point.";

  return (
    <div className={cn("space-y-4", className)}>
      <section aria-labelledby="first-run-title" className="scanner-section p-4 md:p-5">
        <h2 id="first-run-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-400">{reason}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <StarterCard
            icon={Radar}
            title={scanned && !running ? "Run another scan" : "Run your first scan"}
            body="Enter an IP, range or hostname. Every host the scan finds is saved to Environment automatically."
            action={{ label: "Start a scan", href: "/scanner", primary: true }}
          />
          <StarterCard
            icon={Server}
            title="Add a host by hand"
            body="For assets a network scan can't reach yet. You can scan them later from the host page."
            action={{ label: "Add host", href: ADD_HOST_HREF }}
          />
          <StarterCard
            icon={User}
            title="Install the Sirius agent"
            body="Agents report packages, users and local findings that a network scan can't see."
            action={{ label: "Get the agent", href: AGENT_HREF }}
          />
        </div>
      </section>

      <section aria-labelledby="first-run-steps" className="scanner-section p-4">
        <h2 id="first-run-steps" className="flex items-center gap-2 text-sm font-semibold text-white">
          <Layers className="h-4 w-4 text-violet-400" aria-hidden />
          How it fits together
        </h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-[11px] font-semibold text-violet-300 ring-1 ring-violet-500/20">
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-white">{step.title}</span>
                <span className="block text-xs text-gray-400">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

export default FirstRunCard;

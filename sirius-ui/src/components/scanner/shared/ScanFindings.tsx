/**
 * This scan's findings (R03): a compact SeverityStrip labelled "this scan"
 * (ADR-2: inventory totals live on the Dashboard), and the shared VulnTable
 * with the scan preset. Clicking a level in the strip filters the table.
 */

import React from "react";
import Link from "next/link";
import { ArrowRight, Bug, FileText, ListChecks } from "lucide-react";
import { Button } from "~/components/lib/ui/button";
import { SeverityStrip } from "~/components/shared/SeverityStrip";
import { VulnTable, type VulnRow } from "~/components/shared/VulnTable";
import { formatSeverityParam, type Severity, type SeverityCounts } from "~/components/shared/severity";
import { ScanSection } from "./ScanSection";

export interface ScanFindingsSummaryProps {
  counts: SeverityCounts;
  selected: readonly Severity[];
  onSelect: (severity: Severity) => void;
  scanActive: boolean;
}

export function ScanFindingsSummary({ counts, selected, onSelect, scanActive }: ScanFindingsSummaryProps) {
  return (
    <ScanSection
      icon={ListChecks}
      title={scanActive ? "Findings so far, this scan" : "Findings, this scan"}
      aside={
        <span>
          Counts for this scan only. Inventory totals live on the{" "}
          <Link href="/dashboard" className="text-violet-400 hover:text-violet-300">
            Dashboard
          </Link>
          .
        </span>
      }
    >
      <SeverityStrip
        variant="compact"
        counts={counts}
        selected={selected}
        onSelect={onSelect}
        aria-label="Findings by severity, this scan"
      />
    </ScanSection>
  );
}

export interface ScanFindingsTableProps {
  /** One row per CVE (aggregateScanFindings). */
  rows: readonly VulnRow[];
  /** Findings as the scan reported them, one per host and CVE. */
  total: number;
  severityFilter: readonly Severity[];
  scanActive: boolean;
  /** Opens a printable report of these findings; omitted when not offered. */
  onReport?: () => void;
}

export function ScanFindingsTable({ rows, total, severityFilter, scanActive, onReport }: ScanFindingsTableProps) {
  const severityParam = formatSeverityParam(severityFilter);
  const vulnerabilitiesHref = severityParam
    ? `/vulnerabilities?severity=${encodeURIComponent(severityParam)}`
    : "/vulnerabilities";

  return (
    <ScanSection
      icon={Bug}
      title="Findings"
      count={total}
      aside={
        rows.length > 0 && rows.length !== total ? (
          <span className="tabular-nums">
            {rows.length.toLocaleString("en-US")} unique CVE{rows.length === 1 ? "" : "s"}
          </span>
        ) : undefined
      }
    >
      <VulnTable
        preset="scan"
        rows={rows}
        severityFilter={severityFilter}
        defaultPageSize={10}
        searchPlaceholder="Search this scan's findings"
        emptyState={
          <p className="text-sm text-gray-500">
            {scanActive ? "No findings reported yet." : "This scan reported no findings."}
          </p>
        }
        toolbar={
          onReport && rows.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={onReport} title="Open a printable report of this scan's findings">
              <FileText className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Report
            </Button>
          ) : undefined
        }
        footer={
          rows.length > 0 ? (
            <Link
              href={vulnerabilitiesHref}
              className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300"
              title="Vulnerabilities lists every open finding in the inventory, this scan's included"
            >
              Open in Vulnerabilities
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : undefined
        }
      />
    </ScanSection>
  );
}

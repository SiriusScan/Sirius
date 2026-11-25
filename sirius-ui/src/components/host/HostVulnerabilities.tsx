/**
 * HostVulnerabilities (R06) — the host's open findings in the shared
 * VulnTable, Host preset (port/service and sources instead of a host
 * column). Summaries are the server's clean `summary` (ADR-4); the raw
 * scanner text stays on the CVE page's evidence. Each row expands to every
 * source's stored record of the finding on this host (FindingEvidence):
 * status, times, port/service, remediation, evidence and references.
 *
 * The compact severity strip is the filter, held in the URL
 * (`?tab=vulnerabilities&severity=high`), so the Overview's tiles and a
 * shared link open the same view. Export downloads the findings the
 * severity filter shows, as CSV.
 */

import React, { useCallback, useMemo } from "react";
import { Download, RotateCw, X } from "lucide-react";
import { EmptyState } from "~/components/shared/EmptyState";
import { SeverityStrip } from "~/components/shared/SeverityStrip";
import { useSeverityParam } from "~/components/shared/useSeverityParam";
import { VulnTable, type VulnRow } from "~/components/shared/VulnTable";
import type { HostPageDataWithRisk } from "~/hooks/useHostData";
import { FindingEvidence } from "./FindingEvidence";
import {
  findingToVulnRow,
  hostCsvFilename,
  hostFindingsCsv,
  plural,
  rescanHref,
} from "./hostModel";

interface HostVulnerabilitiesProps {
  host: HostPageDataWithRisk;
}

function downloadText(text: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Give the browser a moment to start the download first.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export const HostVulnerabilities: React.FC<HostVulnerabilitiesProps> = ({ host }) => {
  const [severities, setSeverities, toggleSeverity] = useSeverityParam();
  const rows = useMemo(() => host.findings.map(findingToVulnRow), [host.findings]);
  const observationsById = useMemo(
    () => new Map(host.vulnerabilities.map((v) => [v.cve, v.observations])),
    [host.vulnerabilities],
  );
  const renderEvidence = useCallback(
    (row: VulnRow) => <FindingEvidence observations={observationsById.get(row.id) ?? []} />,
    [observationsById],
  );

  // Server counts (ADR-2): every open finding, or the selected levels.
  const exportCount =
    severities.length === 0
      ? host.openFindings
      : severities.reduce((sum, s) => sum + (host.counts[s] ?? 0), 0);

  const exportCsv = useCallback(() => {
    downloadText(
      hostFindingsCsv(host.findings, severities),
      hostCsvFilename(host.ip, severities),
      "text/csv;charset=utf-8",
    );
  }, [host.findings, host.ip, severities]);

  return (
    <section className="scanner-section scanner-section-padding" aria-label="Vulnerabilities on this host">
      <VulnTable
        preset="host"
        rows={rows}
        severityFilter={severities}
        searchPlaceholder="Search CVE, summary or service"
        renderDetail={renderEvidence}
        detailLabel="source records"
        toolbar={
          <>
            <SeverityStrip
              variant="compact"
              counts={host.counts}
              selected={severities}
              onSelect={toggleSeverity}
              aria-label="Filter by severity"
            />
            {severities.length > 0 && (
              <button
                type="button"
                onClick={() => setSeverities([])}
                className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-gray-400 transition-colors hover:bg-gray-800/60 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={exportCsv}
              disabled={exportCount === 0}
              title={`Download ${plural(exportCount, "finding")} as CSV`}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-gray-600 px-2.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:pointer-events-none disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              Export
            </button>
          </>
        }
        emptyState={
          <EmptyState
            variant="no-data"
            size="compact"
            framed={false}
            title="No open findings recorded on this host"
            reason="Scans of this host haven't recorded any open findings. Assessment coverage is unknown, so this doesn't mean the host is clean. Rescan it to check again."
            primary={{ label: "Rescan host", icon: RotateCw, href: rescanHref(host.ip) }}
          />
        }
      />
    </section>
  );
};

export default HostVulnerabilities;

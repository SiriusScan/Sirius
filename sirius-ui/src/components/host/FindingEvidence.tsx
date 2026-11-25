/**
 * FindingEvidence — every source's stored record of one finding on a host
 * (#198): the newest observation per source, with its status, times,
 * confidence, port/service and notes, plus that source's own snapshot of the
 * finding (title, description, reported severity, remediation, evidence and
 * HTTP(S) references), all shown as text. Unknown values read "Unknown";
 * nothing is filled in. Shown in the host Vulnerabilities tab's expanded row.
 */

import React from "react";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { formatDateTime } from "~/utils/formatDateTime";
import type { HostFindingObservation, HostFindingSnapshot } from "./types";

function ObservationTime({ value }: { value?: string }) {
  return value ? (
    <time dateTime={value} title={formatDateTime(value, "long")}>
      {formatDateTime(value)}
    </time>
  ) : (
    <span className="text-gray-500">Unknown</span>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-words text-xs text-gray-200">{children}</dd>
    </div>
  );
}

function RecordedSnapshot({ snapshot }: { snapshot?: HostFindingSnapshot }) {
  if (!snapshot) {
    return <p className="mt-3 text-xs text-gray-500">Source finding details unavailable.</p>;
  }

  return (
    <div className="mt-3 space-y-2 border-t border-violet-500/10 pt-3 text-xs text-gray-300">
      {snapshot.title && <p className="font-medium text-gray-100">{snapshot.title}</p>}
      {snapshot.description && <p className="whitespace-pre-wrap break-words">{snapshot.description}</p>}
      <dl className="space-y-2">
        {snapshot.severity && <Fact label="Reported severity">{snapshot.severity}</Fact>}
        {snapshot.remediation && (
          <Fact label="Remediation">
            <span className="whitespace-pre-wrap">{snapshot.remediation}</span>
          </Fact>
        )}
        {snapshot.evidence.map(({ label, text }) => (
          <Fact key={label} label={label}>
            <span className="whitespace-pre-wrap font-mono text-[11px] text-gray-300">{text}</span>
          </Fact>
        ))}
        {snapshot.references.length > 0 && (
          <Fact label="References">
            <ul className="space-y-1">
              {snapshot.references.map((reference) => (
                <li key={reference}>
                  <a
                    href={reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-violet-300 underline-offset-2 transition-colors hover:text-violet-200 hover:underline"
                  >
                    {reference}
                  </a>
                </li>
              ))}
            </ul>
          </Fact>
        )}
      </dl>
    </div>
  );
}

export function FindingEvidence({ observations }: { observations: readonly HostFindingObservation[] }) {
  if (observations.length === 0) {
    return <p className="text-xs text-gray-500">No stored source records for this finding.</p>;
  }
  return (
    <ul
      className={observations.length > 1 ? "grid gap-3 lg:grid-cols-2" : "grid gap-3"}
      aria-label="Source records"
    >
      {observations.map((observation) => (
        <li key={observation.key} className="min-w-0 rounded-md border border-violet-500/15 bg-gray-900/60 p-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {observation.source ? (
              <SourceBadge source={observation.source} />
            ) : (
              <span className="text-xs text-gray-400">Unknown source</span>
            )}
            {observation.version && <span className="text-[11px] text-gray-500">{observation.version}</span>}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            <Fact label="Status">{observation.status ?? <span className="text-gray-500">Unknown</span>}</Fact>
            <Fact label="First seen">
              <ObservationTime value={observation.firstSeen} />
            </Fact>
            <Fact label="Last seen">
              <ObservationTime value={observation.lastSeen} />
            </Fact>
            <Fact label="Confidence">
              {observation.confidence === undefined ? (
                <span className="text-gray-500">Unknown</span>
              ) : (
                `${Math.round(observation.confidence * 100)}%`
              )}
            </Fact>
            {observation.port !== undefined && <Fact label="Port">{observation.port}</Fact>}
            {observation.serviceInfo && <Fact label="Service">{observation.serviceInfo}</Fact>}
            {observation.notes && (
              <div className="col-span-2 sm:col-span-4">
                <Fact label="Notes">
                  <span className="whitespace-pre-wrap">{observation.notes}</span>
                </Fact>
              </div>
            )}
          </dl>
          <RecordedSnapshot snapshot={observation.snapshot} />
        </li>
      ))}
    </ul>
  );
}

export default FindingEvidence;

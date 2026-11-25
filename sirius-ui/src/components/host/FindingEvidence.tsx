import { SourceBadge } from "~/components/shared/SourceBadge";
import type { DeduplicatedVulnerability } from "./types";

function ObservationTime({ value }: { value?: string }) {
  return value ? (
    <time dateTime={value}>{new Date(value).toLocaleString()}</time>
  ) : (
    "Unknown"
  );
}

export function FindingEvidence({ finding }: { finding: DeduplicatedVulnerability }) {
  const count = finding.observations.length;
  return (
    <details className="min-w-48" onClick={(event) => event.stopPropagation()}>
      <summary className="cursor-pointer text-xs font-medium text-violet-300 hover:text-violet-200">
        <span>View {count} source {count === 1 ? "record" : "records"}</span>
        <span className="mt-1 flex flex-wrap gap-1">
          {finding.sources.map((source) => (
            <SourceBadge key={source} source={source} />
          ))}
          {finding.sources.length === 0 && <span className="text-gray-400">Unknown source</span>}
        </span>
      </summary>
      <ul className="mt-2 space-y-2">
        {finding.observations.map((observation) => (
          <li
            key={observation.key}
            className="rounded border border-violet-500/20 bg-gray-900/60 p-2"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {observation.source ? (
                <SourceBadge source={observation.source} />
              ) : (
                <span className="text-xs text-gray-400">Unknown source</span>
              )}
              {observation.version && (
                <span className="text-xs text-gray-400">{observation.version}</span>
              )}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-gray-400">Status</dt>
              <dd>{observation.status ?? "Unknown"}</dd>
              <dt className="text-gray-400">First seen</dt>
              <dd><ObservationTime value={observation.firstSeen} /></dd>
              <dt className="text-gray-400">Last seen</dt>
              <dd><ObservationTime value={observation.lastSeen} /></dd>
              <dt className="text-gray-400">Confidence</dt>
              <dd>
                {observation.confidence === undefined
                  ? "Unknown"
                  : `${Math.round(observation.confidence * 100)}%`}
              </dd>
              {observation.port !== undefined && (
                <>
                  <dt className="text-gray-400">Port</dt>
                  <dd>{observation.port}</dd>
                </>
              )}
              {observation.serviceInfo && (
                <>
                  <dt className="text-gray-400">Service</dt>
                  <dd className="break-words">{observation.serviceInfo}</dd>
                </>
              )}
              {observation.notes && (
                <>
                  <dt className="text-gray-400">Notes</dt>
                  <dd className="whitespace-pre-wrap break-words">{observation.notes}</dd>
                </>
              )}
            </dl>
          </li>
        ))}
      </ul>
    </details>
  );
}

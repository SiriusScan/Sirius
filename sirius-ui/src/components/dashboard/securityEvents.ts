/**
 * securityEvents.ts — turns a security event (ADR-5: scan_started,
 * scan_completed, host_discovered, host_created, vulnerabilities_found) into
 * a compact Dashboard row: a short title, one line of detail from the
 * event's own metadata, and a link when the event names a host or a CVE.
 *
 * Only what the event carries is shown; a missing field is left out, and an
 * unknown event type falls back to its own title and description.
 */

import { shortScanId, plural, targetsLabel } from "./dashboardModel";

/** The fields of the Go API event the Dashboard reads. */
export interface SecurityEventInput {
  event_id: string;
  event_type: string;
  title: string;
  description?: string | null;
  timestamp: string;
  metadata?: unknown;
  entity_type?: string | null;
  entity_id?: string | null;
}

export type SecurityEventKind =
  | "scan_started"
  | "scan_completed"
  | "host_discovered"
  | "host_created"
  | "finding"
  | "other";

export interface SecurityEventRow {
  id: string;
  kind: SecurityEventKind;
  title: string;
  /** One line from the event's metadata; empty when it carries nothing. */
  detail: string;
  /** ISO time of the event. */
  timestamp: string;
  /** The host or CVE the event is about, when it names one. */
  href?: string;
  /** Hover text for the detail when it shortens something (the full scan id). */
  detailTitle?: string;
}

type Meta = Record<string, unknown>;

function asMeta(value: unknown): Meta {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Meta) : {};
}

function str(meta: Meta, key: string): string | undefined {
  const value = meta[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function num(meta: Meta, key: string): number | undefined {
  const value = meta[key];
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : undefined;
}

function strings(meta: Meta, key: string): string[] | undefined {
  const value = meta[key];
  if (!Array.isArray(value)) return undefined;
  const list = value.filter((v): v is string => typeof v === "string" && !!v.trim());
  return list.length ? list : undefined;
}

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;
const CVE = /^CVE-\d{4}-\d{4,}$/i;

function hostIpOf(event: SecurityEventInput, meta: Meta): string | undefined {
  const fromMeta = str(meta, "host_ip") ?? str(meta, "ip");
  if (fromMeta) return fromMeta;
  const entity = event.entity_id?.trim();
  if (entity && (event.entity_type === "host" || IPV4.test(entity))) return entity;
  return undefined;
}

function hostHref(ip: string | undefined): string | undefined {
  return ip ? `/host/${encodeURIComponent(ip)}` : undefined;
}

function fullScanIdOf(event: SecurityEventInput, meta: Meta): string | undefined {
  const id = str(meta, "scan_id") ?? (event.entity_type === "scan" ? event.entity_id?.trim() : undefined);
  return id ? id : undefined;
}

/** "Scan all3 · …" over "Scan scan-1795609195467-all3 · …" on hover. */
function scanDetailTitle(fullId: string | undefined, detail: string): { detailTitle?: string } {
  if (!fullId || !detail) return {};
  const short = shortScanId(fullId);
  if (!short || short === fullId) return {};
  return { detailTitle: detail.replace(`Scan ${short}`, `Scan ${fullId}`) };
}

function join(parts: Array<string | undefined | false>): string {
  return parts.filter((p): p is string => !!p).join(" · ");
}

export function toSecurityEventRow(event: SecurityEventInput): SecurityEventRow {
  const meta = asMeta(event.metadata);
  const base = { id: event.event_id, timestamp: event.timestamp };
  const fallbackDetail = event.description?.trim() ?? "";

  switch (event.event_type) {
    case "scan_started": {
      const targets = strings(meta, "targets");
      const count = num(meta, "target_count") ?? targets?.length;
      const fullId = fullScanIdOf(event, meta);
      const scan = shortScanId(fullId);
      const detail =
        join([
          scan && `Scan ${scan}`,
          targetsLabel(targets) ?? (count !== undefined && plural(count, "target")),
        ]) || fallbackDetail;
      return {
        ...base,
        kind: "scan_started",
        title: "Scan started",
        detail,
        ...scanDetailTitle(fullId, detail),
      };
    }
    case "scan_completed": {
      const hosts = num(meta, "hosts_discovered");
      const findings = num(meta, "vulnerabilities_found");
      const fullId = fullScanIdOf(event, meta);
      const scan = shortScanId(fullId);
      const detail =
        join([
          scan && `Scan ${scan}`,
          hosts !== undefined && `${plural(hosts, "host")} found`,
          findings !== undefined && plural(findings, "finding"),
        ]) || fallbackDetail;
      return {
        ...base,
        kind: "scan_completed",
        title: "Scan completed",
        detail,
        ...scanDetailTitle(fullId, detail),
      };
    }
    case "host_discovered": {
      const ip = hostIpOf(event, meta);
      const ports = num(meta, "ports_found");
      const os = str(meta, "os");
      return {
        ...base,
        kind: "host_discovered",
        title: "Host discovered",
        detail: join([ip, ports !== undefined && plural(ports, "open port"), os]) || fallbackDetail,
        ...(hostHref(ip) ? { href: hostHref(ip) } : {}),
      };
    }
    case "host_created": {
      const ip = hostIpOf(event, meta);
      const hostname = str(meta, "hostname");
      const source = str(meta, "source");
      return {
        ...base,
        kind: "host_created",
        title: "Host saved to inventory",
        detail: join([hostname && hostname !== ip && hostname, ip, source && `from ${source}`]) || fallbackDetail,
        ...(hostHref(ip) ? { href: hostHref(ip) } : {}),
      };
    }
    case "vulnerabilities_found": {
      const ip = hostIpOf(event, meta);
      const entityVuln = event.entity_type === "vulnerability" ? event.entity_id?.trim() : undefined;
      const vulnId = str(meta, "vulnerability_id") ?? (entityVuln ? entityVuln : undefined);
      const isCve = !!vulnId && CVE.test(vulnId);
      const listed = Array.isArray(meta.vulnerabilities) ? meta.vulnerabilities.length : undefined;
      const count = num(meta, "vulnerabilities_found") ?? num(meta, "count") ?? listed;
      const title =
        vulnId !== undefined || count === undefined
          ? "Vulnerability found"
          : `${plural(count, "vulnerability", "vulnerabilities")} found`;
      return {
        ...base,
        kind: "finding",
        title,
        detail: (vulnId && ip ? `${vulnId} on ${ip}` : vulnId ?? ip) ?? fallbackDetail,
        ...(isCve
          ? { href: `/vulnerability?id=${encodeURIComponent(vulnId)}` }
          : hostHref(ip)
            ? { href: hostHref(ip) }
            : {}),
      };
    }
    default:
      return {
        ...base,
        kind: "other",
        title: event.title?.trim() || event.event_type,
        detail: fallbackDetail,
      };
  }
}

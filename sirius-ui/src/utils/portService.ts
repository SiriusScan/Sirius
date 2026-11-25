/**
 * portService.ts — one "Port / service" label from a finding's real,
 * structured fields (port, protocol, service_info), as the scanner and the
 * inventory store them. Nothing is parsed out of notes or free text.
 *
 *   { port: 8080, protocol: "tcp", serviceInfo: "http (Apache Tomcat 8.5.19)" }
 *     → "8080/tcp · http (Apache Tomcat 8.5.19)"
 *
 * Table cells show the compact "8080/tcp · http" (compactPortService) with
 * the full label on hover.
 *
 * Pure and dependency-free; tested in portService.test.ts.
 */

export interface PortServiceInput {
  port?: number | null;
  protocol?: string | null;
  serviceInfo?: string | null;
  /** Used when the finding carries no service text (e.g. the CPE product). */
  fallback?: string | null;
}

function text(value: string | null | undefined): string | undefined {
  const v = typeof value === "string" ? value.trim() : "";
  return v && v.toLowerCase() !== "unknown" ? v : undefined;
}

/** A real TCP/UDP port number, or undefined. */
export function validPort(port: unknown): number | undefined {
  return typeof port === "number" && Number.isInteger(port) && port > 0 && port <= 65535
    ? port
    : undefined;
}

/**
 * "8080/tcp · http", "8080 · OpenSSH", "8080/tcp", "http", the fallback, or
 * undefined when nothing is known.
 */
export function formatPortService(input: PortServiceInput): string | undefined {
  const port = validPort(input.port);
  const protocol = text(input.protocol)?.toLowerCase();
  const portPart = port === undefined ? undefined : protocol ? `${port}/${protocol}` : String(port);
  const service = text(input.serviceInfo) ?? text(input.fallback);
  if (portPart && service) return `${portPart} · ${service}`;
  return portPart ?? service;
}

/** The port part of a label ("80/tcp" from "80/tcp · Apache httpd"). */
function portPartOf(label: string): string | undefined {
  const head = label.split(" · ")[0]?.trim();
  return head && /^\d+(?:\/\w+)?$/.test(head) ? head : undefined;
}

/**
 * The service name a scanner's service_info leads with, without the product
 * detail in parentheses: "http (Apache Tomcat 8.5.19)" → "http". Text with
 * no parenthesised detail is returned as is.
 */
export function serviceName(serviceInfo: string): string {
  const v = serviceInfo.trim();
  const paren = v.indexOf("(");
  const name = paren > 0 ? v.slice(0, paren).trim() : "";
  return name || v;
}

/**
 * A compact form of a port/service label for a narrow table cell, cut at a
 * word boundary: "8080/tcp · http (Apache Tomcat 8.5.19)" → "8080/tcp · http".
 * The full label belongs in the cell's tooltip.
 */
export function compactPortService(label: string): string {
  const port = portPartOf(label);
  if (!port) return serviceName(label);
  const sep = label.indexOf(" · ");
  const service = sep >= 0 ? label.slice(sep + 3).trim() : "";
  return service ? `${port} · ${serviceName(service)}` : port;
}

/**
 * One cell for a CVE seen on several hosts. `byHost` maps a host to its
 * label. One distinct label shows as is; several show as
 * "80/tcp · 2 versions" (same port) or "2 services", and `detail` lists
 * every host's label for the cell's tooltip.
 */
export function combinePortServices(
  byHost: ReadonlyArray<readonly [host: string, label: string | undefined]>,
): { label?: string; detail?: string } {
  const distinct: string[] = [];
  for (const [, label] of byHost) if (label && !distinct.includes(label)) distinct.push(label);
  if (distinct.length === 0) return {};
  if (distinct.length === 1) {
    const full = distinct[0]!;
    const label = compactPortService(full);
    return label === full ? { label } : { label, detail: full };
  }
  const ports = new Set(distinct.map(portPartOf));
  const [onlyPort] = [...ports];
  const label =
    ports.size === 1 && onlyPort
      ? `${onlyPort} · ${distinct.length} versions`
      : `${distinct.length} services`;
  const detail = byHost
    .filter(([, l]) => l)
    .map(([host, l]) => (host.startsWith("#") ? l! : `${host}: ${l}`))
    .join("\n");
  return { label, detail };
}

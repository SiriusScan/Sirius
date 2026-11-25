/**
 * findingSummary.ts — clean descriptions, scanner text kept as evidence (ADR-4).
 *
 * Scanner findings arrive with text such as
 *   "cpe:/a:openbsd:openssh:10.0p2 CVE-2026-60002\t9.4\thttps://vulners.com/cve/CVE-2026-60002"
 * which tables used to show verbatim. `summaryFor` picks a clean summary (the
 * catalog/NVD description when it is real prose, else the scanner text with
 * CPEs, ids, scores, URLs and boilerplate stripped) and keeps the raw text as
 * `evidence`. Pure and dependency-free so both routers and hooks can use it.
 */

import type {
  FindingComponent,
  FindingSummaryFields,
} from "../types/riskSummary";

export type { FindingComponent, FindingSummaryFields };

// CPE 2.2 URIs ("cpe:/a:vendor:product:version") and CPE 2.3 strings.
const CPE_RE = /\bcpe:(?:\/[aho]?|2\.3):[^\s]*/gi;

// Advisory ids, optionally prefixed ("MEND:CVE-…", "CVE:CVE-…", "PRION:CVE-…"),
// plus the bare score vulners prints right after an id.
const ADVISORY_ID =
  "(?:[A-Za-z][A-Za-z0-9_-]*:)*CVE-\\d{4}-\\d{4,}" +
  "|(?:PACKETSTORM|EDB-ID|SSV|EXPLOITPACK|MSF|OSV|GHSA|PRION|MEND|BID|OSVDB|CNVD|CNNVD|SAINT|ZDI|SECURITYVULNS|GITHUBEXPLOIT|CVELIST):[^\\s]+" +
  "|1337DAY-ID-\\d+";
const ADVISORY_WITH_SCORE_RE = new RegExp(
  `(^|\\s)(?:${ADVISORY_ID})(?:\\s+\\d{1,2}(?:\\.\\d+)?(?=\\s|$))?`,
  "gi",
);

const URL_RE = /\b(?:https?:\/\/|www\.)[^\s]+/gi;

// Nmap / NSE output decoration and labels with no meaning on their own.
const BOILERPLATE_RES: RegExp[] = [
  /\*EXPLOIT\*/gi,
  /^\s*\|_?/gm,
  /\s\|_?\s/g,
  /\bvulners:\s*/gi,
  /\bState:\s*(?:LIKELY\s+)?(?:NOT\s+)?VULNERABLE(?:\s*\([^)]*\))?/gi,
  /\bVULNERABLE:?(?=\s|$)/g,
  /\bIDs:/gi,
  /\bReferences:/gi,
  /\bRisk factor:\s*\w+/gi,
  /\bDisclosure date:\s*[\d-]+/gi,
  /\bCheck results:/gi,
  /\bExtra information:/gi,
];

// Separators left behind once tokens are gone.
const EDGE_PUNCT_RE = /^[\s:;,.|\-–—]+|[\s:;,|\-–—]+$/g;

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** True when text has any real words left (at least one run of 3 letters). */
function hasWords(text: string): boolean {
  return /[A-Za-z]{3,}/.test(text);
}

/**
 * Whether text looks like scanner output rather than prose: a leading CPE,
 * a vulners URL, tab-separated columns, an id followed by a bare score, nmap
 * pipes, an exploit marker or NSE vuln-script labels.
 */
export function looksLikeScannerText(text: string | null | undefined): boolean {
  if (!text) return false;
  return (
    /^\s*cpe:/i.test(text) ||
    /vulners\.com/i.test(text) ||
    /\t/.test(text) ||
    /(?:^|\s)(?:[A-Za-z]+:)*CVE-\d{4}-\d{4,}\s+\d{1,2}\.\d(?:\s|$)/.test(text) ||
    /^\s*\|/.test(text) ||
    /\*EXPLOIT\*/i.test(text) ||
    // NSE vuln-script output.
    /\bVULNERABLE\b/.test(text) ||
    /\bIDs:\s/.test(text) ||
    /\bCVE:CVE-\d/.test(text)
  );
}

/**
 * Strip scanner noise: CPE tokens, advisory ids (CVE, MEND:CVE, …) and the
 * score printed after them, URLs and NSE boilerplate; collapse whitespace.
 * Returns "" when nothing meaningful remains.
 */
export function cleanFindingSummary(text: string | null | undefined): string {
  if (!text) return "";
  let out = text.replace(/\r/g, "");
  out = out.replace(URL_RE, " ");
  out = out.replace(CPE_RE, " ");
  for (const re of BOILERPLATE_RES) out = out.replace(re, " ");
  out = collapse(out);
  out = out.replace(ADVISORY_WITH_SCORE_RE, "$1 ");
  out = collapse(out)
    // A score or two left on its own (e.g. "9.4" or "9.4 9.4").
    .replace(/^(?:\d{1,2}(?:\.\d+)?\s*)+$/, "")
    .replace(/\(\s*\)/g, " ");
  out = collapse(out).replace(EDGE_PUNCT_RE, "");
  return hasWords(out) ? out : "";
}

function cpeLabelPart(value: string): string {
  return value.replace(/\\/g, "").replace(/_/g, " ").trim();
}

/**
 * The product a scanner CPE names, e.g. "cpe:/a:apache:http_server:2.4.49"
 * → { vendor: "apache", product: "http_server", version: "2.4.49",
 *     label: "apache http server 2.4.49" }.
 */
export function parseFindingComponent(
  text: string | null | undefined,
): FindingComponent | undefined {
  if (!text) return undefined;
  const match = text.match(/\bcpe:(?:\/([aho])|2\.3:([aho])):[^\s]*/i);
  if (!match) return undefined;
  const cpe = match[0].replace(/:+$/, "");
  const part = (match[1] ?? match[2])?.toLowerCase() as
    | "a"
    | "o"
    | "h"
    | undefined;
  const fields = cpe.startsWith("cpe:2.3:")
    ? cpe.slice("cpe:2.3:".length).split(":").slice(1)
    : cpe.replace(/^cpe:\/[aho]?:?/i, "").split(":");
  const [vendor = "", product = "", rawVersion] = fields;
  if (!vendor || !product) return undefined;
  const version =
    rawVersion && rawVersion !== "*" && rawVersion !== "-" ? rawVersion : undefined;
  const vendorLabel = cpeLabelPart(vendor);
  const productLabel = cpeLabelPart(product);
  const name = productLabel.toLowerCase().startsWith(vendorLabel.toLowerCase())
    ? productLabel
    : `${vendorLabel} ${productLabel}`;
  return {
    cpe,
    ...(part ? { part } : {}),
    vendor,
    product,
    ...(version ? { version } : {}),
    label: version ? `${name} ${version}` : name,
  };
}

export interface SummaryInput {
  /** The finding's own text (scanner output for network findings). */
  description?: string | null;
  /** Raw evidence when it is stored apart from `description`. */
  evidence?: string | null;
  /** The shared catalog description for this CVE. */
  catalogDescription?: string | null;
  /** An NVD description, when the caller has one. */
  nvdDescription?: string | null;
}

/**
 * Pick a clean summary for a finding (ADR-4):
 * 1. the NVD or catalog description when it is prose, not scanner output;
 * 2. else the finding's text — as is when it is prose, cleaned when it is
 *    scanner output;
 * 3. else, when the scanner named a product, "Affects <product version>";
 * 4. else "".
 * `evidence` is always the raw finding text, unchanged.
 */
export function summaryFor(input: SummaryInput): FindingSummaryFields {
  const evidence = (input.evidence ?? input.description ?? "").trim();
  const component =
    parseFindingComponent(evidence) ??
    parseFindingComponent(input.catalogDescription);
  const withComponent = component ? { component } : {};

  for (const text of [input.nvdDescription, input.catalogDescription]) {
    if (text && !looksLikeScannerText(text)) {
      const prose = collapse(text);
      if (hasWords(prose)) {
        return { summary: prose, evidence, summarySource: "catalog", ...withComponent };
      }
    }
  }

  const own = looksLikeScannerText(evidence)
    ? cleanFindingSummary(evidence)
    : hasWords(evidence)
      ? collapse(evidence)
      : "";
  if (own) {
    return { summary: own, evidence, summarySource: "scanner", ...withComponent };
  }

  const fromCatalog = cleanFindingSummary(input.catalogDescription);
  if (fromCatalog) {
    return { summary: fromCatalog, evidence, summarySource: "scanner", ...withComponent };
  }

  if (component) {
    return {
      summary: `Affects ${component.label}`,
      evidence,
      summarySource: "component",
      component,
    };
  }

  return { summary: "", evidence, summarySource: "none" };
}

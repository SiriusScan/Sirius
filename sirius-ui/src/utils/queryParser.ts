/**
 * queryParser.ts — Structured search query parser for the Vulnerability table.
 *
 * Supports field-qualified searches, comparison operators, comma-OR within
 * a single field, and top-level OR / AND combinators.
 *
 * Examples:
 *   "severity:critical"
 *   "severity:critical,high cvss:>=7"
 *   "severity:low OR cvss:<4"
 *   "nginx"                          (plain-text → description search)
 *   "cve:2022 severity:critical"     (implicit AND)
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type QueryField = "severity" | "cvss" | "cve" | "description" | "title";
export type QueryOperator = "eq" | "contains" | "gt" | "gte" | "lt" | "lte";

export interface QueryFilter {
  field: QueryField;
  operator: QueryOperator;
  values: string[]; // severity accepts multiple comma-separated values
}

export interface ParsedQuery {
  /** Individual filter clauses. */
  groups: QueryFilter[][]; // each inner array is AND-ed; outer arrays are OR-ed
}

/** Minimal row shape the query system needs. */
export interface QueryRow {
  cve: string;
  severity: string;
  riskScore: number;
  description: string;
  title?: string;
}

/* ------------------------------------------------------------------ */
/*  Aliases — so users can type short forms                            */
/* ------------------------------------------------------------------ */

const FIELD_ALIASES: Record<string, QueryField> = {
  severity: "severity",
  sev: "severity",
  cvss: "cvss",
  score: "cvss",
  cve: "cve",
  id: "cve",
  desc: "description",
  description: "description",
  title: "title",
};

const SEVERITY_ALIASES: Record<string, string> = {
  crit: "critical",
  critical: "critical",
  high: "high",
  hi: "high",
  medium: "medium",
  med: "medium",
  low: "low",
  lo: "low",
  info: "informational",
  informational: "informational",
};

/* ------------------------------------------------------------------ */
/*  Parser                                                             */
/* ------------------------------------------------------------------ */

/**
 * Parse a raw query string into a structured `ParsedQuery`.
 *
 * Splitting strategy:
 *   1. Split on ` OR ` (case-sensitive) to get OR-groups.
 *   2. Within each OR-group, split on whitespace for AND tokens.
 *   3. Each token is either `field:value` or plain text.
 */
export function parseQuery(input: string): ParsedQuery {
  const trimmed = input.trim();
  if (!trimmed) return { groups: [] };

  // Split on " OR " (case-insensitive by normalising the delimiter check)
  const orSegments = splitOnOr(trimmed);

  const groups: QueryFilter[][] = orSegments.map((segment) => {
    const tokens = segment.trim().split(/\s+/).filter(Boolean);
    return tokens.map(parseToken);
  });

  return { groups };
}

/**
 * Split a string on ` OR ` while preserving other content intact.
 * Handles case-insensitive OR but requires surrounding spaces.
 */
function splitOnOr(input: string): string[] {
  // Split on " OR " case-insensitively
  return input.split(/\s+OR\s+/i);
}

/**
 * Parse a single token into a QueryFilter.
 *
 * Recognised forms:
 *   field:value
 *   field:>value   field:>=value   field:<value   field:<=value
 *   field:val1,val2
 *   plaintext  →  description contains
 */
function parseToken(token: string): QueryFilter {
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) {
    // Plain text → search description + cve + title
    return {
      field: "description",
      operator: "contains",
      values: [token.toLowerCase()],
    };
  }

  const rawField = token.slice(0, colonIdx).toLowerCase();
  let rawValue = token.slice(colonIdx + 1);

  const field = FIELD_ALIASES[rawField];
  if (!field) {
    // Unknown field qualifier → treat entire token as plain-text search
    return {
      field: "description",
      operator: "contains",
      values: [token.toLowerCase()],
    };
  }

  // Determine operator for numeric fields (cvss)
  if (field === "cvss") {
    return parseCvssToken(rawValue);
  }

  // Severity: normalise aliases and support comma-separated values
  if (field === "severity") {
    const values = rawValue
      .toLowerCase()
      .split(",")
      .map((v) => SEVERITY_ALIASES[v.trim()] ?? v.trim())
      .filter(Boolean);
    return { field: "severity", operator: "eq", values };
  }

  // CVE / description / title: substring match
  return {
    field,
    operator: "contains",
    values: [rawValue.toLowerCase()],
  };
}

/** Parse a CVSS token value that may start with >, >=, <, <= */
function parseCvssToken(rawValue: string): QueryFilter {
  let operator: QueryOperator = "gte"; // default: cvss:7 means >=7
  let numStr = rawValue;

  if (rawValue.startsWith(">=")) {
    operator = "gte";
    numStr = rawValue.slice(2);
  } else if (rawValue.startsWith(">")) {
    operator = "gt";
    numStr = rawValue.slice(1);
  } else if (rawValue.startsWith("<=")) {
    operator = "lte";
    numStr = rawValue.slice(2);
  } else if (rawValue.startsWith("<")) {
    operator = "lt";
    numStr = rawValue.slice(1);
  }

  return {
    field: "cvss",
    operator,
    values: [numStr.trim()],
  };
}

/* ------------------------------------------------------------------ */
/*  Matcher                                                            */
/* ------------------------------------------------------------------ */

/**
 * Test whether a data row satisfies a parsed query.
 *
 * - Empty query (no groups) → matches everything.
 * - Multiple groups → OR (at least one group must match).
 * - Filters within a group → AND (all must match).
 */
export function applyQuery(query: ParsedQuery, row: QueryRow): boolean {
  if (query.groups.length === 0) return true;

  return query.groups.some((filters) =>
    filters.every((filter) => matchFilter(filter, row)),
  );
}

function matchFilter(filter: QueryFilter, row: QueryRow): boolean {
  switch (filter.field) {
    case "severity":
      return matchSeverity(filter, row);
    case "cvss":
      return matchCvss(filter, row);
    case "cve":
      return matchContains(filter.values[0] ?? "", row.cve);
    case "title":
      return matchContains(filter.values[0] ?? "", row.title ?? "");
    case "description":
      return matchDescription(filter, row);
    default:
      return true;
  }
}

function matchSeverity(filter: QueryFilter, row: QueryRow): boolean {
  const rowSev = normalizeSev(row.severity);
  return filter.values.some((v) => normalizeSev(v) === rowSev);
}

function normalizeSev(s: string): string {
  const low = s.toLowerCase().trim();
  if (low.includes("crit")) return "critical";
  if (low.includes("high")) return "high";
  if (low.includes("med")) return "medium";
  if (low.includes("low")) return "low";
  return "informational";
}

function matchCvss(filter: QueryFilter, row: QueryRow): boolean {
  const threshold = parseFloat(filter.values[0] ?? "0");
  if (isNaN(threshold)) return true;

  switch (filter.operator) {
    case "gt":
      return row.riskScore > threshold;
    case "gte":
      return row.riskScore >= threshold;
    case "lt":
      return row.riskScore < threshold;
    case "lte":
      return row.riskScore <= threshold;
    case "eq":
      return row.riskScore === threshold;
    default:
      return row.riskScore >= threshold;
  }
}

function matchContains(query: string, value: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

/** Plain-text searches across description, CVE ID, and title. */
function matchDescription(filter: QueryFilter, row: QueryRow): boolean {
  const q = filter.values[0] ?? "";
  if (!q) return true;
  if (row.cve?.toLowerCase().includes(q)) return true;
  if (row.description?.toLowerCase().includes(q)) return true;
  if (row.title?.toLowerCase().includes(q)) return true;
  if (String(row.riskScore ?? "").includes(q)) return true;
  return false;
}

/* ------------------------------------------------------------------ */
/*  Query syntax help text (for the UI tooltip)                        */
/* ------------------------------------------------------------------ */

export const QUERY_SYNTAX_HELP = [
  { example: "severity:critical", desc: "Filter by severity level" },
  { example: "severity:high,medium", desc: "Multiple severities (OR)" },
  { example: "cvss:>7", desc: "CVSS score above 7" },
  { example: "cvss:>=9.0", desc: "CVSS score 9.0 or higher" },
  { example: "cve:2022", desc: "CVE ID containing \"2022\"" },
  { example: "nginx", desc: "Search descriptions for text" },
  {
    example: "severity:critical OR cvss:>9",
    desc: "OR combinator between clauses",
  },
  {
    example: "severity:high cvss:>=7",
    desc: "AND combinator (space-separated)",
  },
] as const;

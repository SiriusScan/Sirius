/**
 * Report Generator Utility
 *
 * Generates HTML vulnerability reports and handles opening them in new windows.
 * Extracted from scanner.tsx to eliminate duplication and keep the page lean.
 */

import {
  normalizeSeverity,
  getSeverityPriority,
} from "~/utils/riskScoreCalculator";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ReportVulnerabilityItem {
  cve: string;
  severity: string;
  description: string;
  riskScore?: number;
  cvss?: number;
  count?: number;
  affectedHosts?: string[] | number;
  references?: string[];
}

export interface ReportOptions {
  title?: string;
  scanProfile?: string;
  targetsCount?: number;
  hostsAffected?: number;
  targetsList?: string;
  scanDate?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSeverityColorHex(severity: string): string {
  switch (normalizeSeverity(severity)) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#f59e0b";
    case "low":
      return "#22c55e";
    default:
      return "#3b82f6";
  }
}

/* ------------------------------------------------------------------ */
/*  Main generator                                                     */
/* ------------------------------------------------------------------ */

/**
 * Generate a full HTML vulnerability report document.
 *
 * @param data    Array of vulnerability items to include in the report.
 * @param options Optional metadata (title, scan profile, dates, etc.)
 * @returns       Complete HTML document string.
 */
export function generateVulnerabilityReportHtml(
  data: ReportVulnerabilityItem[],
  options: ReportOptions = {}
): string {
  const title = options.title ?? "Vulnerability Report";
  const date = options.scanDate ?? new Date().toLocaleDateString();

  // Sort by severity (critical first)
  const sorted = [...data].sort(
    (a, b) => getSeverityPriority(b.severity) - getSeverityPriority(a.severity)
  );

  // Group by severity for summary
  const groups: Record<string, number> = {};
  sorted.forEach((v) => {
    const key = normalizeSeverity(v.severity);
    groups[key] = (groups[key] ?? 0) + 1;
  });

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 2rem; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #f8fafc; }
    h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; color: #cbd5e1; border-bottom: 1px solid #334155; padding-bottom: 0.5rem; }
    .meta { color: #94a3b8; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .summary { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .summary-card { background: #1e293b; border-radius: 0.5rem; padding: 1rem 1.25rem; min-width: 140px; border: 1px solid #334155; }
    .summary-card .label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-card .value { font-size: 1.5rem; font-weight: 700; margin-top: 0.25rem; }
    .scan-info { background: #1e293b; border-radius: 0.5rem; padding: 1rem 1.25rem; margin-bottom: 1.5rem; border: 1px solid #334155; }
    .scan-info dt { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
    .scan-info dd { margin-bottom: 0.5rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; }
    th { background: #1e293b; text-align: left; padding: 0.625rem 0.75rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; border-bottom: 2px solid #334155; }
    td { padding: 0.625rem 0.75rem; border-bottom: 1px solid #1e293b; font-size: 0.875rem; vertical-align: top; }
    tr:hover td { background: #1e293b66; }
    .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
    .desc { max-width: 400px; color: #94a3b8; }
    .refs { font-size: 0.75rem; color: #60a5fa; }
    .refs a { color: #60a5fa; text-decoration: none; }
    .refs a:hover { text-decoration: underline; }
    @media print { body { background: #fff; color: #0f172a; } th { background: #f1f5f9; color: #334155; } td { border-color: #e2e8f0; } .badge { border: 1px solid currentColor; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    <p class="meta">Generated on ${escapeHtml(date)} &mdash; ${sorted.length} vulnerabilities</p>
`;

  // Scan info section
  if (options.scanProfile || options.targetsCount || options.hostsAffected) {
    html += `    <div class="scan-info"><dl>`;
    if (options.scanProfile)
      html += `<dt>Profile</dt><dd>${escapeHtml(options.scanProfile)}</dd>`;
    if (options.targetsCount !== undefined)
      html += `<dt>Targets Scanned</dt><dd>${options.targetsCount}</dd>`;
    if (options.hostsAffected !== undefined)
      html += `<dt>Hosts Affected</dt><dd>${options.hostsAffected}</dd>`;
    if (options.targetsList)
      html += `<dt>Target List</dt><dd>${escapeHtml(options.targetsList)}</dd>`;
    html += `</dl></div>\n`;
  }

  // Severity summary cards
  html += `    <div class="summary">\n`;
  for (const sev of ["critical", "high", "medium", "low", "info"] as const) {
    const count = groups[sev] ?? 0;
    if (count > 0) {
      html += `      <div class="summary-card"><div class="label">${sev}</div><div class="value" style="color: ${getSeverityColorHex(sev)}">${count}</div></div>\n`;
    }
  }
  html += `    </div>\n`;

  // Detail table
  html += `    <h2>Detailed Findings</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Severity</th>
          <th>CVSS</th>
          <th>Affected</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
`;

  sorted.forEach((item) => {
    const sev = normalizeSeverity(item.severity);
    const color = getSeverityColorHex(sev);
    const cvss =
      typeof item.cvss === "number"
        ? item.cvss.toFixed(1)
        : typeof item.riskScore === "number"
          ? item.riskScore.toFixed(1)
          : "N/A";
    const affected =
      typeof item.affectedHosts === "number"
        ? item.affectedHosts
        : Array.isArray(item.affectedHosts)
          ? item.affectedHosts.length
          : (item.count ?? "—");
    const desc = escapeHtml(
      (item.description || "No description").slice(0, 300)
    );

    html += `        <tr>
          <td><strong>${escapeHtml(item.cve)}</strong></td>
          <td><span class="badge" style="background: ${color}22; color: ${color}">${sev}</span></td>
          <td>${cvss}</td>
          <td>${affected}</td>
          <td class="desc">${desc}</td>
        </tr>\n`;
  });

  html += `      </tbody>
    </table>
  </div>
</body>
</html>`;

  return html;
}

/* ------------------------------------------------------------------ */
/*  Window helper                                                      */
/* ------------------------------------------------------------------ */

/**
 * Open an HTML string in a new browser tab.
 * Uses a Blob URL so the content is self-contained.
 */
export function openReportInNewWindow(html: string): void {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  // Revoke after a short delay so the browser has time to load
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  if (!win) {
    // Fallback: download as file
    const a = document.createElement("a");
    a.href = url;
    a.download = "vulnerability-report.html";
    a.click();
  }
}

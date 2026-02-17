/**
 * formatters.ts — Shared formatting and display utility functions.
 *
 * Consolidates duplicated helpers that were previously scattered
 * across VulnColumns, SourceCoverageDashboard, RecentActivityTimeline, etc.
 */

/* ------------------------------------------------------------------ */
/*  Time formatting                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert a date (or date-string) into a human-readable "X ago" label.
 * Handles both Date objects and ISO date strings.
 *
 * Examples: "Today", "1 day ago", "3 weeks ago", "2 months ago"
 */
export function timeAgo(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) return "Just now";

  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

/* ------------------------------------------------------------------ */
/*  Confidence scoring                                                 */
/* ------------------------------------------------------------------ */

/**
 * Get a Tailwind text color class for a confidence score (0-1 range).
 * Uses the v0.4 dark-only palette.
 */
export function getConfidenceColor(score: number): string {
  if (score >= 0.9) return "text-emerald-400";
  if (score >= 0.7) return "text-yellow-400";
  return "text-red-400";
}

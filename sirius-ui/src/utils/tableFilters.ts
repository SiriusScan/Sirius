/**
 * Utility functions for filtering table data
 */

/**
 * Checks if a row matches the given source filter.
 * Supports both scan_sources (array) and scan_source (string) fields.
 * 
 * @param row - The row data to check
 * @param sourceFilter - The source filter value to match (e.g., "network", "agent")
 * @returns true if the row matches the source filter, false otherwise
 */
export function matchesSourceFilter(
  row: { [key: string]: any },
  sourceFilter: string
): boolean {
  if (!sourceFilter) return true;

  // Check scan_sources array first, fall back to scan_source string
  const sources = row.scan_sources as string[] | undefined;
  if (sources && sources.length > 0) {
    return sources.includes(sourceFilter);
  }
  return row.scan_source === sourceFilter;
}

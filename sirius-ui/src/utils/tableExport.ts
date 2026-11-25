export type TableExportMetadata = Record<string, string | number | boolean>;

interface TableExportOptions {
  columns?: string[];
  metadata?: TableExportMetadata;
}

export function serializeTableExport(
  format: "csv" | "json",
  rows: object[],
  { columns = Object.keys(rows[0] ?? {}), metadata }: TableExportOptions = {},
): string {
  const exportRows = metadata ? rows.map((row) => ({ ...row, ...metadata })) : rows;
  if (format === "json") return JSON.stringify(exportRows, null, 2);

  const keys = [...new Set([...columns, ...Object.keys(metadata ?? {})])];
  const csvCell = (value: unknown) => {
    const cell = value == null ? "" : String(value);
    return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
  };
  return [
    keys.map(csvCell).join(","),
    ...exportRows.map((row) => {
      const record = row as Record<string, unknown>;
      return keys.map((key) => csvCell(record[key])).join(",");
    }),
  ].join("\n");
}

export function downloadTableExport(
  format: "csv" | "json",
  rows: object[],
  filename: string,
  options?: TableExportOptions,
) {
  const content = serializeTableExport(format, rows, options);
  const mime = format === "csv" ? "text/csv;charset=utf-8;" : "application/json";
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.${format}`;
  link.click();
  URL.revokeObjectURL(url);
}

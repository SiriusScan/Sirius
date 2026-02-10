// Scan-specific host columns for the scanner page.
// These use live scan data (vulnerabilityCount from the table row)
// instead of fetching persisted data from the database like the
// environment page columns do.
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import { Monitor } from "lucide-react";
import { type EnvironmentTableData } from "~/types/scanTypes";
import { type EnvironmentTableData as HostRouterTableData } from "~/server/api/routers/host";
import { cn } from "~/components/lib/utils";
import { getScannerRiskColors } from "~/components/shared/SeverityBadge";
import { getRiskLevel } from "~/utils/riskScoreCalculator";
import { SourceIconRow } from "~/components/shared/SourceIcon";

export const scanColumnHelper = createColumnHelper<EnvironmentTableData>();

export const scanHostColumns = [
  // Host column
  scanColumnHelper.accessor((row) => ({ hostname: row.hostname, ip: row.ip }), {
    id: "host",
    header: "Host",
    cell: ({ getValue }) => {
      const { hostname, ip } = getValue();
      return (
        <div className="flex flex-col">
          <div className="font-medium">{hostname || ip}</div>
          {hostname && hostname !== ip && (
            <div className="text-xs text-gray-500">{ip}</div>
          )}
          <div className="text-xs text-gray-500">online</div>
        </div>
      );
    },
  }),

  // OS column
  scanColumnHelper.accessor("os", {
    header: "Operating System",
    cell: ({ getValue }) => {
      const os = getValue();
      return (
        <div className="flex items-center gap-2">
          <Monitor size={16} className="text-gray-400" />
          <span>{os || "unknown"}</span>
        </div>
      );
    },
  }),

  // Vulnerabilities column - uses table data directly, NOT a database API call
  scanColumnHelper.accessor("vulnerabilityCount", {
    id: "vulnerabilities",
    header: "Vulnerabilities",
    cell: ({ getValue }) => {
      const count = getValue() ?? 0;
      if (count === 0) {
        return (
          <div className="text-xs text-gray-400">No vulnerabilities</div>
        );
      }
      return (
        <div className="flex w-full min-w-[120px] flex-col">
          <div className="flex justify-between text-xs">
            <span>
              {count} {count === 1 ? "vulnerability" : "vulnerabilities"}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${Math.min(count * 10, 100)}%` }}
            />
          </div>
        </div>
      );
    },
  }),

  // Risk Level column - derived from max CVSS score (preferred) or count
  scanColumnHelper.accessor((row) => row, {
    id: "riskScore",
    header: "Risk Level",
    cell: ({ getValue }) => {
      const host = getValue();
      const risk = getRiskLevel(host.maxCvss, host.vulnerabilityCount || 0);
      const config = getScannerRiskColors(risk);
      return (
        <div className={cn("rounded-full px-2 py-0.5 text-center", config.bg)}>
          <span className={cn("text-xs font-medium", config.text)}>
            {risk.charAt(0).toUpperCase() + risk.slice(1)}
          </span>
        </div>
      );
    },
  }),

  // Source column - shows all discovery sources as icons with tooltips
  scanColumnHelper.accessor((row) => row.scan_sources ?? (row.scan_source ? [row.scan_source] : []), {
    id: "source",
    header: "Source",
    cell: ({ getValue }) => {
      const sources = getValue();
      return <SourceIconRow sources={sources} />;
    },
  }),

  // Tags column
  scanColumnHelper.accessor("tags", {
    header: "Tags",
    cell: ({ getValue }) => {
      const tags = getValue() || [];
      if (tags.length === 0) return null;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300"
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-xs text-gray-500">
              +{tags.length - 3} more
            </span>
          )}
        </div>
      );
    },
  }),
] as unknown as ColumnDef<HostRouterTableData, any>[];

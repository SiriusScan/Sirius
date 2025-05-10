import React from "react";
import { api } from "~/utils/api";
import { cn } from "~/components/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/lib/ui/card"; // Reverting path
import { Skeleton } from "~/components/lib/ui/skeleton"; // Reverting path
import { Button } from "~/components/lib/ui/button"; // Reverting path for Button
import { RefreshCwIcon } from "lucide-react"; // Added icon
import type { DisplayedAgentDetails } from "~/pages/terminal"; // Import the new type
import { toast } from "sonner"; // Re-import toast
import { CopyIcon, ScanLineIcon } from "lucide-react"; // Icon for copy button & scan button

// Define the expected shape of the parsed agent status details
// Based on the `internal:status` output format
// export type ParsedAgentStatus = { // No longer needed here
//   ...
// };

interface AgentDetailsProps {
  agentId: string | null; // Still needed to know *which* agent we're showing details for
  details: DisplayedAgentDetails | null; // Use the combined details type
  isLoading: boolean; // Loading state passed from parent (during command execution)
  onRefresh: () => void; // Callback to trigger refresh
  onRunScan: () => void; // Add callback for running scan
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => {
  if (value === null || value === undefined || value === "") {
    return null; // Don't render row if value is empty
  }
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span
        className="truncate text-right font-medium text-gray-900 dark:text-gray-100"
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
};

const AgentDetailsSkeleton: React.FC = () => (
  <Card className="mt-2 border-none bg-transparent shadow-none">
    <CardHeader className="pb-2 pt-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-6" /> {/* Placeholder for refresh button */}
      </div>
    </CardHeader>
    <CardContent className="space-y-2.5 pt-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-4/6" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

// Original component function
const AgentDetailsComponent: React.FC<AgentDetailsProps> = ({
  agentId,
  details,
  isLoading,
  onRefresh,
  onRunScan,
}) => {
  const formatLastSeen = (isoString: string | null | undefined): string => {
    if (!isoString) return "Never";
    try {
      const date = new Date(isoString);
      // Simple relative time (replace with a library like date-fns for more accuracy)
      const seconds = Math.round((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.round(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      // Fallback to locale string for older dates
      return date.toLocaleString();
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Helper to copy text (moved here from AgentList)
  const copyToClipboard = (text: string | undefined | null, label: string) => {
    if (!text) {
      toast.error(`Cannot copy empty ${label}`);
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log(`${label} copied to clipboard:`, text);
        toast.success(`${label} copied!`);
      })
      .catch((err) => {
        console.error(`Failed to copy ${label}:`, err);
        toast.error(`Failed to copy ${label}`);
      });
  };

  if (!agentId) {
    // Handle case where no agent is selected *at all*
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Select an agent to view details.
      </div>
    );
  }

  // Show skeleton only if loading AND we don't have any details yet
  if (isLoading && !details) {
    return <AgentDetailsSkeleton />;
  }

  // Show refresh prompt if an agent *is* selected, but we have no details (and not loading)
  if (!details) {
    return (
      <Card className="mt-2 border-none bg-transparent shadow-none">
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center justify-between">
            {/* Use agentId prop here as details is null */}
            <CardTitle
              className="truncate text-base font-semibold"
              title={`Agent ${agentId}`}
            >
              {`Agent (${agentId.substring(0, 8)}...)`}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-6 w-6"
            >
              <RefreshCwIcon
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No details available. Click refresh.
        </CardContent>
      </Card>
    );
  }

  // We have details now
  const isOnline = details.status?.toLowerCase() === "online";

  return (
    <Card className="mt-2 border-none bg-transparent shadow-none">
      <CardHeader className="pb-2 pt-3">
        <div className="flex items-center justify-between">
          {/* Display Agent Name if available, fallback to ID from details */}
          <CardTitle
            className="truncate text-base font-semibold"
            title={details.name || details.id}
          >
            {details.name || `Agent (${details.id.substring(0, 8)}...)`}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-6 w-6"
          >
            <RefreshCwIcon
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
          </Button>
        </div>
        {/* Status Badge + Last Seen */}
        <div className="flex items-center gap-1 pt-1">
          {" "}
          {/* Reduced gap */}
          <span
            className={cn(
              "h-2 w-2 flex-shrink-0 rounded-full", // Smaller dot
              isOnline ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isOnline
              ? "Online"
              : `Offline (${formatLastSeen(details.lastSeen)})`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 pt-2 text-xs">
        {" "}
        {/* Reduced spacing */}
        {/* Display curated details based on DisplayedAgentDetails type */}
        <DetailRow label="IP Address" value={details.primaryIp} />
        <DetailRow label="OS/Arch" value={details.osArch} />
        <DetailRow label="Agent Ver" value={details.agentVersion ?? "N/A"} />
        <DetailRow label="Uptime" value={details.uptime} />
      </CardContent>
      <CardFooter className="justify-end gap-2 px-3 pb-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRunScan}
          disabled={
            isLoading || !details || details.status?.toLowerCase() !== "online"
          }
          className="flex items-center gap-1"
          title={
            details?.status?.toLowerCase() !== "online"
              ? "Agent must be online to scan"
              : "Run internal scan"
          }
        >
          <ScanLineIcon className="h-3 w-3" />
          Scan
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(details.id, "Agent ID")}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <CopyIcon className="h-3 w-3" />
          Copy ID
        </Button>
      </CardFooter>
    </Card>
  );
};

// Wrap the component with React.memo
export const AgentDetails = React.memo(AgentDetailsComponent);

import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Tag,
  Trash2,
} from "lucide-react";
import { cn } from "~/components/lib/utils";
import { type EnvironmentTableData } from "~/server/api/routers/host";

interface HostRowActionsProps {
  host: EnvironmentTableData;
  onScan?: (host: EnvironmentTableData) => void;
  onTag?: (host: EnvironmentTableData) => void;
  onDelete?: (host: EnvironmentTableData) => void;
}

export const HostRowActions: React.FC<HostRowActionsProps> = ({
  host,
  onScan,
  onTag,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleAction = (
    e: React.MouseEvent,
    action: (host: EnvironmentTableData) => void
  ) => {
    e.stopPropagation();
    action(host);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleToggle}
        className="rounded-full p-1.5 text-gray-400 hover:bg-gray-700 hover:text-gray-400 focus:outline-none focus:ring-2 hover:hover:text-gray-300"
        aria-label="Host actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-gray-700 bg-gray-800 py-1 bg-gray-800">
          <div className="border-b px-3 border-gray-700">
            <div className="font-medium">{host.hostname || "Unknown host"}</div>
            <div className="text-xs text-gray-500">{host.ip}</div>
          </div>

          {onScan && (
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
              onClick={(e) => handleAction(e, onScan)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Scan Now
            </button>
          )}

          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/host/${host.ip}`, "_blank");
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Details
          </button>

          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              window.open(`/vulnerability/host/${host.ip}`, "_blank");
            }}
          >
            <Shield className="mr-2 h-4 w-4" />
            View Vulnerabilities
          </button>

          {onTag && (
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
              onClick={(e) => handleAction(e, onTag)}
            >
              <Tag className="mr-2 h-4 w-4" />
              Manage Tags
            </button>
          )}

          {onDelete && (
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-red-400 hover:bg-red-900/20"
              onClick={(e) => handleAction(e, onDelete)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove Host
            </button>
          )}
        </div>
      )}
    </div>
  );
};

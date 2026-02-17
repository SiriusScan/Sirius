/**
 * HostSelector — searchable host picker combobox with multi-select
 * and inline "Create Host" trigger.
 *
 * Used by the AddVulnerabilityPanel wizard to select target hosts.
 * Fetches the host list from the `host.getHostList` tRPC query.
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, X, Plus, Server, Shield } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { api } from "~/utils/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SelectedHost {
  ip: string;
  hostname: string;
}

interface HostSelectorProps {
  /** Currently selected host IPs */
  selected: SelectedHost[];
  /** Callback when selection changes */
  onChange: (hosts: SelectedHost[]) => void;
  /** Called when user clicks "+ Create Host" */
  onCreateHost: () => void;
  /** Allow multiple hosts to be selected */
  multi?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const HostSelector: React.FC<HostSelectorProps> = ({
  selected,
  onChange,
  onCreateHost,
  multi = true,
  className,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all hosts
  const { data: hosts = [], isLoading } = api.host.getHostList.useQuery(
    undefined,
    { staleTime: 1000 * 30 },
  );

  // Filter hosts based on search
  const filteredHosts = useMemo(() => {
    if (!search.trim()) return hosts;
    const q = search.toLowerCase();
    return hosts.filter(
      (h) =>
        h.ip.toLowerCase().includes(q) ||
        h.hostname.toLowerCase().includes(q),
    );
  }, [hosts, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSelected = (ip: string) => selected.some((s) => s.ip === ip);

  const toggleHost = (host: { ip: string; hostname: string }) => {
    if (isSelected(host.ip)) {
      onChange(selected.filter((s) => s.ip !== host.ip));
    } else {
      if (multi) {
        onChange([...selected, { ip: host.ip, hostname: host.hostname }]);
      } else {
        onChange([{ ip: host.ip, hostname: host.hostname }]);
        setIsOpen(false);
      }
    }
  };

  const removeHost = (ip: string) => {
    onChange(selected.filter((s) => s.ip !== ip));
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((h) => (
            <div
              key={h.ip}
              className="flex items-center gap-1.5 rounded-lg bg-violet-500/15 px-2.5 py-1 text-xs ring-1 ring-violet-500/30"
            >
              <Server className="h-3 w-3 text-violet-400" />
              <span className="font-mono text-violet-300">{h.ip}</span>
              {h.hostname && (
                <span className="text-gray-400">({h.hostname})</span>
              )}
              <button
                onClick={() => removeHost(h.ip)}
                className="ml-0.5 text-gray-500 hover:text-gray-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search hosts by IP or hostname..."
          className="h-10 w-full rounded-lg border border-gray-700 bg-gray-900 pl-9 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 shadow-2xl shadow-black/50">
          {isLoading && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              Loading hosts...
            </div>
          )}

          {!isLoading && filteredHosts.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500">
              {search
                ? "No hosts match your search"
                : "No hosts in the environment"}
            </div>
          )}

          {!isLoading &&
            filteredHosts.map((host) => {
              const sel = isSelected(host.ip);
              return (
                <button
                  key={host.ip}
                  onClick={() => toggleHost(host)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                    sel
                      ? "bg-violet-500/10 text-white"
                      : "text-gray-300 hover:bg-gray-800",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded border",
                      sel
                        ? "border-violet-500 bg-violet-500"
                        : "border-gray-600 bg-gray-800",
                    )}
                  >
                    {sel && (
                      <svg
                        className="h-3 w-3 text-white"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="font-mono text-white">{host.ip}</span>
                    {host.hostname && (
                      <span className="ml-2 text-gray-500">
                        {host.hostname}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {host.os && <span>{host.os}</span>}
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {host.vulnCount}
                    </div>
                  </div>
                </button>
              );
            })}

          {/* Create host action */}
          <button
            onClick={() => {
              setIsOpen(false);
              onCreateHost();
            }}
            className="flex w-full items-center gap-2 border-t border-gray-700 px-3 py-2.5 text-sm text-violet-400 transition-colors hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Create New Host
          </button>
        </div>
      )}
    </div>
  );
};

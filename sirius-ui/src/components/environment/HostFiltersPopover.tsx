/**
 * HostFiltersPopover — the hosts table's "Filters" button (R04): narrow the
 * list by operating system and by the sources that reported each host.
 * Options come from the hosts listed, with how many hosts each one covers.
 */

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "~/components/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/lib/ui/popover";
import type { FilterOption } from "./hostsTableModel";

export interface HostFiltersPopoverProps {
  osOptions: readonly FilterOption[];
  sourceOptions: readonly FilterOption[];
  os: readonly string[];
  sources: readonly string[];
  onOsChange: (next: string[]) => void;
  onSourcesChange: (next: string[]) => void;
  className?: string;
}

function toggle(list: readonly string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function OptionGroup({
  title,
  options,
  selected,
  onChange,
  empty,
}: {
  title: string;
  options: readonly FilterOption[];
  selected: readonly string[];
  onChange: (next: string[]) => void;
  empty: string;
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </legend>
      {options.length === 0 ? (
        <p className="text-xs text-gray-500">{empty}</p>
      ) : (
        <div className="max-h-40 space-y-0.5 overflow-y-auto">
          {options.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs text-gray-300 hover:bg-violet-500/10"
            >
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => onChange(toggle(selected, o.value))}
                className="h-3.5 w-3.5 rounded border-gray-600 bg-gray-900 accent-violet-500"
              />
              <span className="min-w-0 flex-1 truncate">{o.label}</span>
              <span className="tabular-nums text-gray-500">{o.count.toLocaleString("en-US")}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function HostFiltersPopover({
  osOptions,
  sourceOptions,
  os,
  sources,
  onOsChange,
  onSourcesChange,
  className,
}: HostFiltersPopoverProps) {
  const active = os.length + sources.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
            active > 0
              ? "border-violet-500/40 bg-violet-500/15 text-violet-200"
              : "border-gray-700/70 text-gray-300 hover:border-gray-600 hover:bg-gray-800/60 hover:text-white",
            className,
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
          {active > 0 && (
            <span className="rounded-full bg-violet-500/25 px-1.5 text-[10px] leading-4 tabular-nums">
              {active}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 space-y-4 border-violet-500/20 bg-gray-900 p-3 text-gray-200 shadow-lg shadow-black/40"
      >
        <OptionGroup
          title="Operating system"
          options={osOptions}
          selected={os}
          onChange={onOsChange}
          empty="No hosts listed."
        />
        <OptionGroup
          title="Source"
          options={sourceOptions}
          selected={sources}
          onChange={onSourcesChange}
          empty="No source has reported yet."
        />
        {active > 0 && (
          <div className="border-t border-violet-500/10 pt-2">
            <button
              type="button"
              onClick={() => {
                onOsChange([]);
                onSourcesChange([]);
              }}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              Clear filters
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default HostFiltersPopover;

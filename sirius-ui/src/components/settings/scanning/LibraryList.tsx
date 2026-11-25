/**
 * A virtualised list view for the script and template library (R10): a
 * fixed header and rows rendered with @tanstack/react-virtual, so ~600
 * scripts cost a screenful of DOM. Rows open on click, Enter or Space.
 */

import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "~/components/lib/utils";

export interface LibraryColumn<T> {
  id: string;
  header: string;
  /** Cell content for one row. */
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export interface LibraryListProps<T> {
  rows: readonly T[];
  columns: readonly LibraryColumn<T>[];
  /** CSS grid-template-columns shared by the header and every row. */
  gridTemplate: string;
  rowKey: (row: T) => string;
  onOpen: (row: T) => void;
  /** Accessible name of the list. */
  label: string;
  rowHeight?: number;
  /** Visible height before the list scrolls. */
  maxHeight?: number;
  minWidth?: number;
  className?: string;
}

export function LibraryList<T>({
  rows,
  columns,
  gridTemplate,
  rowKey,
  onOpen,
  label,
  rowHeight = 40,
  maxHeight = 440,
  minWidth = 720,
  className,
}: LibraryListProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan: 8,
  });
  const height = Math.min(maxHeight, rows.length * rowHeight);
  const items = virtualizer.getVirtualItems();

  return (
    <div className={cn("relative overflow-x-auto", className)}>
      <div role="table" aria-label={label} aria-rowcount={rows.length + 1} style={{ minWidth }}>
        <div role="rowgroup">
          <div role="row" aria-rowindex={1} className="grid items-center" style={{ gridTemplateColumns: gridTemplate }}>
            {columns.map((col) => (
              <div
                key={col.id}
                role="columnheader"
                className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500"
              >
                {col.header}
              </div>
            ))}
          </div>
        </div>
        <div ref={scrollRef} role="rowgroup" className="overflow-y-auto overscroll-contain" style={{ height }}>
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {items.map((item) => {
              const row = rows[item.index];
              if (row === undefined) return null;
              return (
                <div
                  key={rowKey(row)}
                  role="row"
                  aria-rowindex={item.index + 2}
                  tabIndex={0}
                  onClick={() => {
                    // Selecting text in a row doesn't open it.
                    if (window.getSelection()?.toString()) return;
                    onOpen(row);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(row);
                    }
                  }}
                  className="absolute left-0 top-0 grid w-full cursor-pointer items-center border-t border-violet-500/10 transition-colors hover:bg-violet-500/5 focus-visible:bg-violet-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/40"
                  style={{
                    gridTemplateColumns: gridTemplate,
                    height: item.size,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  {columns.map((col) => (
                    <div
                      key={col.id}
                      role="cell"
                      className={cn("min-w-0 overflow-hidden px-4 text-xs text-gray-300", col.className)}
                    >
                      {col.cell(row)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LibraryList;

/**
 * DashboardSkeleton — the R01 layout in grey while the summary loads, so the
 * page does not jump when the numbers arrive.
 */

import React from "react";
import { Skeleton } from "~/components/lib/ui/skeleton";

function Block({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`scanner-section p-4 ${className ?? ""}`}>{children}</div>;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading the dashboard">
      <Block>
        <Skeleton className="mb-4 h-4 w-64" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[5.5rem] rounded-lg" />
          ))}
        </div>
      </Block>
      <div className="grid gap-4 lg:grid-cols-3">
        <Block className="lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-48" />
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </Block>
        <Block>
          <Skeleton className="mb-4 h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </Block>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Block className="lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-32" />
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="mb-2 h-6 w-full" />
          ))}
        </Block>
        <Block>
          <Skeleton className="mb-4 h-4 w-32" />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="mb-2 h-8 w-full" />
          ))}
        </Block>
      </div>
    </div>
  );
}

export default DashboardSkeleton;

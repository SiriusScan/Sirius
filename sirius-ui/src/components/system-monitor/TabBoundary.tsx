/**
 * TabBoundary — each System Monitor tab renders inside its own error
 * boundary, so a crash in one tab (the Logs tab used to throw on every
 * render) shows an error block in that tab instead of taking down the page
 * and the app shell.
 */

import React from "react";
import { RefreshCw, RotateCcw } from "lucide-react";
import ErrorBoundary from "~/components/ErrorBoundary";
import { EmptyState } from "~/components/shared/EmptyState";

export function TabBoundary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <ErrorBoundary
      renderFallback={({ error, reset }) => (
        <EmptyState
          variant="error"
          title={`The ${label} tab stopped working`}
          reason={error.message || "Something in this tab failed to render. The other tabs still work."}
          primary={{ label: "Try again", icon: RotateCcw, onClick: reset }}
          secondary={{
            label: "Reload page",
            icon: RefreshCw,
            onClick: () => window.location.reload(),
          }}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default TabBoundary;

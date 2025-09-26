// Debug utilities for routing and component issues

export const debugLog = (component: string, action: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[${component}] ${action}`, data || "");
  }
};

export const debugError = (component: string, error: Error, context?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${component}] Error:`, error, context || "");
  }
};

export const debugRouting = (from: string, to: string, reason?: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Router] Navigation: ${from} → ${to}`, reason || "");
  }
};

export const withPerformanceLogging = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    if (process.env.NODE_ENV === "development") {
      console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }) as T;
};

export const createRouteMonitor = () => {
  if (typeof window === "undefined") return;

  let navigationStartTime = 0;

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    navigationStartTime = performance.now();
    debugLog("Router", "pushState", args[2]);
    return originalPushState.apply(this, args);
  };

  history.replaceState = function (...args) {
    navigationStartTime = performance.now();
    debugLog("Router", "replaceState", args[2]);
    return originalReplaceState.apply(this, args);
  };

  window.addEventListener("popstate", () => {
    debugLog("Router", "popstate", window.location.pathname);
  });

  // Monitor for slow navigation
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "navigation" && entry.duration > 2000) {
        debugError("Router", new Error("Slow navigation detected"), {
          duration: entry.duration,
          url: entry.name,
        });
      }
    }
  });

  try {
    observer.observe({ entryTypes: ["navigation"] });
  } catch (e) {
    // Fallback for browsers that don't support PerformanceObserver
    debugLog("Router", "PerformanceObserver not supported");
  }
};

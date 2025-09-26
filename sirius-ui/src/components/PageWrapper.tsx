import React, { useState, useEffect, ReactNode } from "react";
import { debugLog } from "~/utils/debug";

interface PageWrapperProps {
  children: ReactNode;
  pageName: string;
  delay?: number;
}

/**
 * PageWrapper component that delays child rendering to prevent API calls
 * from blocking navigation during route changes
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  pageName,
  delay = 50,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    debugLog("PageWrapper", `Starting initialization for ${pageName}`);

    if (delay === 0) {
      setIsReady(true);
      return;
    }

    const timer = setTimeout(() => {
      debugLog("PageWrapper", `Initialization complete for ${pageName}`);
      setIsReady(true);
    }, delay);

    return () => {
      clearTimeout(timer);
      debugLog("PageWrapper", `Cleanup for ${pageName}`);
    };
  }, [pageName, delay]);

  if (!isReady) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-gray-400">Loading {pageName}...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PageWrapper;

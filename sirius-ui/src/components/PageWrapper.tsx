import React, { useState, useEffect, ReactNode } from "react";
import { debugLog } from "~/utils/debug";
import { ActiveConstellationV2Loader } from "~/components/loaders";

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
        <ActiveConstellationV2Loader size="full" label={`Loading ${pageName}...`} />
      </div>
    );
  }

  return <>{children}</>;
};

export default PageWrapper;

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import "~/styles/loader-animations.css";
import { ToastProvider } from "~/components/Toast";
import ErrorBoundary from "~/components/ErrorBoundary";
import { createRouteMonitor } from "~/utils/debug";
import { ActiveConstellationV2Loader } from "~/components/loaders";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Initialize route monitoring in development
    if (process.env.NODE_ENV === "development") {
      createRouteMonitor();
    }

    // Track navigation state for smooth transitions
    const handleRouteChangeStart = () => {
      setIsNavigating(true);
    };

    const handleRouteChangeComplete = () => {
      // Minimum display time for smooth UX (300ms)
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    };

    const handleRouteChangeError = () => {
      setIsNavigating(false);
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <ToastProvider>
          {/* Global navigation loading overlay */}
          {isNavigating && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900">
              <ActiveConstellationV2Loader size="full" />
            </div>
          )}
          <Component {...pageProps} />
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);

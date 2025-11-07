import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { useEffect } from "react";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import "~/styles/loader-animations.css";
import { ToastProvider } from "~/components/Toast";
import ErrorBoundary from "~/components/ErrorBoundary";
import { createRouteMonitor } from "~/utils/debug";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  useEffect(() => {
    // Initialize route monitoring in development
    if (process.env.NODE_ENV === "development") {
      createRouteMonitor();
    }
  }, []);

  return (
    <ErrorBoundary>
      <SessionProvider session={session}>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);

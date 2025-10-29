// components/Layout.tsx
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "~/components/lib/ui/sonner";
import { debugLog, debugRouting } from "~/utils/debug";
import { ActiveConstellationV2Loader } from "~/components/loaders";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout = ({ children, title = "Sirius Scan" }: LayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Use useEffect to handle redirects to avoid render loops
  useEffect(() => {
    if (status === "loading") {
      debugLog("Layout", "Session loading", router.pathname);
      return; // Wait for session to load
    }

    // Only redirect if user is not authenticated and not on the home page
    if (!session?.user && router.pathname !== "/") {
      debugRouting(router.pathname, "/", "Unauthenticated user redirect");
      void router.replace("/");
    }
  }, [session, status, router]);

  // Show loading state while session is loading or while redirecting
  if (status === "loading") {
    debugLog("Layout", "Rendering loading state - session loading");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ActiveConstellationV2Loader size="full" label="Loading..." />
      </div>
    );
  }

  // Show loading state while redirecting unauthenticated users
  if (!session?.user && router.pathname !== "/") {
    debugLog(
      "Layout",
      "Rendering loading state - redirecting unauthenticated user"
    );
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ActiveConstellationV2Loader size="full" label="Loading..." />
      </div>
    );
  }

  debugLog("Layout", "Rendering main layout", {
    pathname: router.pathname,
    user: !!session?.user,
  });

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="ml-20 flex w-full flex-1 flex-col overflow-x-hidden">
        <Header title={title} />

        <Head>
          <title>{title}</title>
          <meta name="description" content="The Sirius Vulnerability Scanner" />
          <link rel="icon" href="/sirius-logo-square.png" />
        </Head>

        <main className="flex-1">
          {/* Hexagonal gradient background */}
          <div className="hexgrad fixed inset-0 -z-10" />

          {/* Main content */}
          <div className="relative px-6">
            <div className="mx-auto max-w-[1920px]">{children}</div>
          </div>
        </main>
      </div>

      <Toaster />
    </div>
  );
};

export default Layout;

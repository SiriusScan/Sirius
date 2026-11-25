// components/Layout.tsx
import React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Toaster } from "~/components/lib/ui/sonner";
import { debugLog } from "~/utils/debug";
import { ActiveConstellationV2Loader } from "~/components/loaders";
import { uiExtensionRegistry, useCapabilities } from "~/ui/extensions";
import { useSessionGuard } from "~/hooks/useSessionGuard";

/**
 * How a page sits in the shell.
 * - "document" (default): a padded, centered column, capped at 1920px, that
 *   scrolls with the window. For dashboards, lists and detail pages.
 * - "workspace": an application surface that fills the viewport beside the
 *   sidebar, edge to edge, and scrolls inside its own panes. The page's
 *   children are the flex column that fills `main`; no viewport arithmetic.
 *   The account menu floats over the top-right corner of the page's own top
 *   bar: that bar centers its first row 36px from the top (pt-3 + h-12, like
 *   the operator console header) and keeps its right 3.5rem (pr-14) clear.
 */
export type LayoutFrame = "document" | "workspace";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  frame?: LayoutFrame;
}

const Layout = ({
  children,
  title = "Sirius Scan",
  frame = "document",
}: LayoutProps) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { loading: capabilitiesLoading, hasAll } = useCapabilities();
  const requiredCapabilities =
    uiExtensionRegistry.getRequiredCapabilitiesForPath(router.pathname);
  const hasRouteAccess = hasAll(requiredCapabilities);

  // Redirect to sign-in only once the server confirms there is no session;
  // a failed session fetch alone must not sign the user out (useSessionGuard).
  const sessionGuard = useSessionGuard();

  // Show loading state while session or capability state is loading.
  if (status === "loading" || capabilitiesLoading) {
    debugLog("Layout", "Rendering loading state - session loading");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ActiveConstellationV2Loader size="full" label="Loading..." />
      </div>
    );
  }

  // Route declarations are the server-independent authorization seam for
  // build-time UI extensions. A private route can declare capabilities without
  // adding Pro-specific branches to this shared layout.
  if (session?.user && !hasRouteAccess) {
    debugLog("Layout", "Rendering capability-denied state", {
      pathname: router.pathname,
      requiredCapabilities,
    });
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 px-6 text-center text-white">
        <div>
          <h1 className="text-2xl font-semibold">Access unavailable</h1>
          <p className="mt-2 text-gray-400">
            Your account does not have access to this page.
          </p>
        </div>
      </div>
    );
  }

  if (!session?.user && router.pathname !== "/") {
    if (sessionGuard.state === "unreachable") {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-900 px-6 text-center text-white">
          <div className="max-w-sm">
            <h1 className="text-lg font-semibold">Can&apos;t reach Sirius</h1>
            <p className="mt-2 text-sm text-gray-400">
              The server didn&apos;t answer. This page reconnects by itself
              once it&apos;s back.
            </p>
            <button
              type="button"
              onClick={sessionGuard.retry}
              className="mt-4 rounded-md bg-violet-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    // Checking with the server, or redirecting a signed-out user.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ActiveConstellationV2Loader size="full" label="Loading..." />
      </div>
    );
  }

  debugLog("Layout", "Rendering main layout", {
    pathname: router.pathname,
    user: !!session?.user,
    frame,
  });

  const head = (
    <Head>
      <title>{title}</title>
      <meta name="description" content="The Sirius Vulnerability Scanner" />
      <link rel="icon" href="/sirius-logo-square.png" />
    </Head>
  );

  if (frame === "workspace") {
    return (
      <div className="flex h-screen">
        <Sidebar />

        <div className="relative ml-20 flex min-w-0 flex-1 flex-col">
          <Header title={title} overlay />
          {head}

          <main className="relative flex min-h-0 flex-1 flex-col">
            <div className="hexgrad fixed inset-0 -z-10" />
            {children}
          </main>
        </div>

        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="ml-20 flex w-full flex-1 flex-col overflow-x-hidden">
        <Header title={title} />

        {head}

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

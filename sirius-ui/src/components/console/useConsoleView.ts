import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  CONSOLE_VIEW_PARAM,
  consoleViewHistoryState,
  readConsoleView,
  resolveConsoleView,
  withConsoleView,
} from "./consoleView";

interface UseConsoleViewOptions {
  builtIns: readonly string[];
  /** Every contributed view in the build, before capability filtering. */
  registered: readonly { id: string; initial?: boolean }[];
  /** Contributed view ids this viewer may open. */
  allowed: readonly string[];
  capabilitiesLoading: boolean;
}

function addressBarView(): string | undefined {
  return typeof window === "undefined"
    ? undefined
    : readConsoleView(window.location.search);
}

/**
 * The console's open view, held in `?view=` (ADR-6): /terminal?view=agent
 * opens the Agent view, and without `?view=` the console opens on the
 * contributed view marked `initial`, else the terminal.
 *
 * Switching replaces the current history entry in place (no extra Back step).
 * It writes the address directly rather than through Next's router, as a contributed
 * view may for its own parameters: a router replace, even a shallow one, emits
 * routeChangeStart (the app's full-screen navigation loader) and re-renders
 * every router consumer. The entry keeps Next's shape, and real navigations
 * (links, Back/Forward) are read back from Next's routeChangeComplete.
 *
 * Returns null while the view is undecided (see resolveConsoleView) and a
 * stable `showView`; callers validate ids before calling it.
 */
export function useConsoleView({
  builtIns,
  registered,
  allowed,
  capabilitiesLoading,
}: UseConsoleViewOptions): [string | null, (id: string) => void] {
  const router = useRouter();
  const [requested, setRequested] = useState<string | undefined>(addressBarView);
  const [ready, setReady] = useState(() => typeof window !== "undefined");

  useEffect(() => {
    setReady(true);
    setRequested(addressBarView());
    const onRouteChangeComplete = (url: string) => setRequested(readConsoleView(url));
    router.events.on("routeChangeComplete", onRouteChangeComplete);
    return () => router.events.off("routeChangeComplete", onRouteChangeComplete);
  }, [router.events]);

  const view = resolveConsoleView({
    requested,
    builtIns,
    registered,
    allowed,
    routerReady: ready,
    capabilitiesLoading,
  });

  const showView = useCallback((id: string) => {
    setRequested(id);
    if (typeof window === "undefined") return;
    const { pathname, search, hash } = window.location;
    if (new URLSearchParams(search).get(CONSOLE_VIEW_PARAM) === id) return;
    const as = `${pathname}${withConsoleView(search, id)}${hash}`;
    try {
      window.history.replaceState(
        consoleViewHistoryState(window.history.state, as),
        "",
        as,
      );
    } catch {
      // The URL is a convenience; the view has already switched.
    }
  }, []);

  return [view, showView];
}

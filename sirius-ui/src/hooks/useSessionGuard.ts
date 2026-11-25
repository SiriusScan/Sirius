// hooks/useSessionGuard.ts
import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

/**
 * Decides what to do when the client has no session on a protected page.
 *
 * next-auth's client turns any failed `/api/auth/session` fetch (a restarting
 * server, a proxy 502, a dropped connection) into "no session", and once the
 * session is null it stops refetching on focus. Redirecting on that alone
 * bounced signed-in users to the sign-in form mid-session; only a reload
 * recovered. So before redirecting, ask the server directly:
 * - it answers with no user: the user really is signed out → sign-in form;
 * - it answers with a user: the client dropped a valid session → reload once
 *   so the session provider starts fresh;
 * - it cannot be reached: keep the user where they are and offer a retry.
 */
export type SessionGuardState = "ok" | "checking" | "unreachable";

const RETRY_DELAYS_MS = [0, 1000, 2000, 4000];
const RELOAD_GUARD_KEY = "sirius.sessionGuard.reloadedAt";
const RELOAD_GUARD_MS = 15_000;

type Verdict = "signed-in" | "signed-out" | "unreachable";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function askServer(): Promise<Verdict> {
  for (const delay of RETRY_DELAYS_MS) {
    if (delay) await sleep(delay);
    try {
      const response = await fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) continue;
      const data = (await response.json()) as { user?: unknown } | null;
      return data && typeof data === "object" && data.user ? "signed-in" : "signed-out";
    } catch {
      // Network failure or a non-JSON proxy error page: try again.
    }
  }
  return "unreachable";
}

function reloadedRecently(): boolean {
  try {
    const at = Number(window.sessionStorage.getItem(RELOAD_GUARD_KEY) ?? 0);
    return Date.now() - at < RELOAD_GUARD_MS;
  } catch {
    return false;
  }
}

function markReload() {
  try {
    window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()));
  } catch {
    // Storage unavailable: the reload still happens, just without the guard.
  }
}

export function useSessionGuard(): { state: SessionGuardState; retry: () => void } {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [state, setState] = useState<SessionGuardState>("ok");
  const [attempt, setAttempt] = useState(0);
  const signedIn = Boolean(session?.user);
  const onSignInPage = router.pathname === "/";

  useEffect(() => {
    if (status === "loading" || signedIn || onSignInPage) {
      setState("ok");
      return;
    }
    let cancelled = false;
    // Background re-checks keep the "can't reach" message on screen.
    setState((previous) => (previous === "unreachable" ? previous : "checking"));
    void askServer().then((verdict) => {
      if (cancelled) return;
      if (verdict === "signed-out") {
        void router.replace("/");
      } else if (verdict === "signed-in" && !reloadedRecently()) {
        markReload();
        router.reload();
      } else {
        setState("unreachable");
      }
    });
    return () => {
      cancelled = true;
    };
    // `router` is stable for this purpose; re-run only on session changes or a retry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, signedIn, onSignInPage, attempt]);

  // While the server is unreachable, keep checking in the background.
  useEffect(() => {
    if (state !== "unreachable") return;
    const timer = setTimeout(() => setAttempt((n) => n + 1), 10_000);
    return () => clearTimeout(timer);
  }, [state]);

  const retry = useCallback(() => {
    try {
      window.sessionStorage.removeItem(RELOAD_GUARD_KEY);
    } catch {
      // ignore
    }
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}

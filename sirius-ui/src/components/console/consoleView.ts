/**
 * consoleView.ts — which operator console view is open, held in the URL
 * (`?view=terminal|history|agent|<contributed view id>`, ADR-6), so a mode can
 * be linked, reloaded and restored with Back.
 *
 * Pure functions only; useConsoleView wires them to the page.
 */

/** Query parameter that holds the console view. */
export const CONSOLE_VIEW_PARAM = "view";

/** The view the console opens on when no contributed view opens initially. */
export const DEFAULT_CONSOLE_VIEW = "terminal";

export interface ConsoleViewInput {
  /** The `?view=` value, if any. */
  requested: string | string[] | undefined;
  /** The console's own view ids ("terminal", "history", "agent"). */
  builtIns: readonly string[];
  /** Every contributed view in the build, before capability filtering. */
  registered: readonly { id: string; initial?: boolean }[];
  /** Contributed view ids this viewer may open. */
  allowed: readonly string[];
  /** False until the URL can be read. */
  routerReady: boolean;
  /** True while the capability snapshot that filters contributed views loads. */
  capabilitiesLoading: boolean;
}

function firstValue(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * The view to show, or null while it can't be decided yet (the URL is not
 * readable, or a contributed view it names is waiting on capabilities).
 * Showing nothing for that moment avoids mounting the terminal only to swap
 * it out.
 *
 * A requested built-in or permitted contributed view wins. Anything else
 * falls back to the contributed view marked `initial`, then to the terminal.
 */
export function resolveConsoleView(input: ConsoleViewInput): string | null {
  if (!input.routerReady) return null;
  const requested = firstValue(input.requested);
  if (requested) {
    if (input.builtIns.includes(requested) || input.allowed.includes(requested)) {
      return requested;
    }
    if (input.capabilitiesLoading && input.registered.some((view) => view.id === requested)) {
      return null;
    }
  }
  const initial = input.registered.find((view) => view.initial);
  if (initial) {
    if (input.allowed.includes(initial.id)) return initial.id;
    if (input.capabilitiesLoading) return null;
  }
  return DEFAULT_CONSOLE_VIEW;
}

/** The `?view=` value in a URL, path or search string ("" counts as none). */
export function readConsoleView(url: string): string | undefined {
  const start = url.indexOf("?");
  if (start < 0) return undefined;
  const hash = url.indexOf("#", start);
  const search = url.slice(start + 1, hash < 0 ? undefined : hash);
  const view = new URLSearchParams(search).get(CONSOLE_VIEW_PARAM);
  return view ? view : undefined;
}

/**
 * The search string for `view`, built from the address bar's current one so
 * parameters a view wrote there itself (e.g. a chat view's `?c=`) are kept.
 * `view` comes first so the address reads `?view=agent&…`.
 */
export function withConsoleView(search: string, view: string): string {
  const params = new URLSearchParams([[CONSOLE_VIEW_PARAM, view]]);
  new URLSearchParams(search).forEach((value, key) => {
    if (key !== CONSOLE_VIEW_PARAM) params.append(key, value);
  });
  return `?${params.toString()}`;
}

/**
 * The history entry for a console URL written without Next's router. It keeps
 * Next's entry shape (`__N`, `url`, `as`, `options`, `key`) so Back and Forward
 * still route through Next to the view that was open.
 */
export function consoleViewHistoryState(
  previous: unknown,
  as: string,
): Record<string, unknown> {
  const base =
    previous !== null && typeof previous === "object"
      ? (previous as Record<string, unknown>)
      : {};
  return {
    __N: true,
    options: {},
    key: Math.random().toString(36).slice(2, 10),
    ...base,
    url: as,
    as,
  };
}

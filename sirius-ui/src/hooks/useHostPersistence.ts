/**
 * useHostPersistence.ts — per-viewer conveniences on the host page, kept in
 * this browser's localStorage (debounced, keyed per host).
 *
 * Tabs are not stored here any more: the host tab lives in `?tab=` and the
 * System section in `?sub=` (ADR-6), so they can be linked and restored with
 * Back. Stored records from before (version 1, with tab fields) load without
 * their tab fields. Every storage access is guarded; the page works the same
 * when storage is unavailable.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { HostPersistenceState } from "~/components/host/types";

const DEBOUNCE_MS = 500;
const VERSION = 2;

function storageKey(ip: string) {
  return `sirius:host:${ip}:prefs`;
}

const DEFAULT_STATE: HostPersistenceState = {
  version: VERSION,
  collapsedSections: {},
  vulnSourceFilter: [],
  softwareFilter: "",
  showSystemUsers: false,
};

/** Keep only the fields this version stores, with their types checked. */
function pickState(parsed: Record<string, unknown>): HostPersistenceState {
  const collapsed = parsed.collapsedSections;
  const sources = parsed.vulnSourceFilter;
  return {
    version: VERSION,
    collapsedSections:
      collapsed && typeof collapsed === "object" && !Array.isArray(collapsed)
        ? Object.fromEntries(
            Object.entries(collapsed as Record<string, unknown>).filter(
              (e): e is [string, boolean] => typeof e[1] === "boolean",
            ),
          )
        : {},
    vulnSourceFilter: Array.isArray(sources)
      ? sources.filter((s): s is string => typeof s === "string")
      : [],
    softwareFilter: typeof parsed.softwareFilter === "string" ? parsed.softwareFilter : "",
    showSystemUsers: parsed.showSystemUsers === true,
  };
}

function loadState(ip: string): HostPersistenceState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(storageKey(ip));
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return DEFAULT_STATE;
    const version = (parsed as { version?: unknown }).version;
    if (version !== 1 && version !== VERSION) return DEFAULT_STATE;
    return pickState(parsed as Record<string, unknown>);
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(ip: string, state: HostPersistenceState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(ip), JSON.stringify(state));
  } catch {
    // Storage full, blocked or private browsing: the preference just isn't kept.
  }
}

export function useHostPersistence(ip: string | undefined) {
  const resolvedIp = ip ?? "__none__";
  const [state, setState] = useState<HostPersistenceState>(() => loadState(resolvedIp));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-load when IP changes (navigating between hosts)
  useEffect(() => {
    if (ip) setState(loadState(ip));
  }, [ip]);

  // Debounced persist (the debounce also absorbs the reload above)
  useEffect(() => {
    if (!ip) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveState(ip, state), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state, ip]);

  // ── Setters ──────────────────────────────────────────────────────────────

  const toggleSection = useCallback((sectionId: string) => {
    setState((s) => ({
      ...s,
      collapsedSections: {
        ...s.collapsedSections,
        [sectionId]: !s.collapsedSections[sectionId],
      },
    }));
  }, []);

  const setVulnSourceFilter = useCallback((sources: string[]) => {
    setState((s) => ({ ...s, vulnSourceFilter: sources }));
  }, []);

  const setSoftwareFilter = useCallback((filter: string) => {
    setState((s) => ({ ...s, softwareFilter: filter }));
  }, []);

  const setShowSystemUsers = useCallback((show: boolean) => {
    setState((s) => ({ ...s, showSystemUsers: show }));
  }, []);

  return {
    state,
    toggleSection,
    setVulnSourceFilter,
    setSoftwareFilter,
    setShowSystemUsers,
  };
}

export type HostPersistence = ReturnType<typeof useHostPersistence>;

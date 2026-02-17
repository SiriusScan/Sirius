/**
 * useHostPersistence.ts — Debounced localStorage persistence for the host page.
 *
 * Adapts the proven pattern from console/useTerminalPersistence.ts:
 *   - One state object, one setState
 *   - Individual setters that merge into it
 *   - A single useEffect that debounces writes (500ms)
 *   - Version field for future schema migration
 *
 * Keyed per-host so each host's preferences are independent.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type {
  HostPersistenceState,
  TabType,
  SystemSubTab,
} from "~/components/host/types";

const DEBOUNCE_MS = 500;

function storageKey(ip: string) {
  return `sirius:host:${ip}:prefs`;
}

const DEFAULT_STATE: HostPersistenceState = {
  version: 1,
  activeTab: "overview",
  systemSubTab: "overview",
  collapsedSections: {},
  vulnSourceFilter: [],
  softwareFilter: "",
  showSystemUsers: false,
};

function loadState(ip: string): HostPersistenceState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(storageKey(ip));
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<HostPersistenceState>;
    if (parsed.version !== 1) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(ip: string, state: HostPersistenceState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(ip), JSON.stringify(state));
  } catch {
    // quota exceeded or private browsing — fail silently
  }
}

export function useHostPersistence(ip: string | undefined) {
  const resolvedIp = ip ?? "__none__";
  const [state, setState] = useState<HostPersistenceState>(() =>
    loadState(resolvedIp),
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-load when IP changes (navigating between hosts)
  useEffect(() => {
    if (ip) {
      setState(loadState(ip));
    }
  }, [ip]);

  // Debounced persist
  useEffect(() => {
    if (!ip) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => saveState(ip, state), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [state, ip]);

  // ── Setters ──────────────────────────────────────────────────────────────

  const setActiveTab = useCallback((tab: TabType) => {
    setState((s) => ({ ...s, activeTab: tab }));
  }, []);

  const setSystemSubTab = useCallback((subTab: SystemSubTab) => {
    setState((s) => ({ ...s, systemSubTab: subTab }));
  }, []);

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
    setActiveTab,
    setSystemSubTab,
    toggleSection,
    setVulnSourceFilter,
    setSoftwareFilter,
    setShowSystemUsers,
  };
}

export type HostPersistence = ReturnType<typeof useHostPersistence>;

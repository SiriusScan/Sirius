/**
 * The agent scanning settings from Settings › Scanning, kept in ValKey
 * through the existing store.getValue / store.setValue procedures.
 *
 * They replace the old Scanner › Advanced agent form, whose values lived in
 * component state and reached a scan only after that tab had been opened.
 * The Scanner passes `scanConfig` to useScanOrchestration as
 * `advancedAgentConfig`; a profile with its own agent settings still wins.
 *
 *   const { scanConfig } = useAgentScanSettings();
 *   useScanOrchestration({ ..., advancedAgentConfig: scanConfig });
 */

import { useCallback, useMemo } from "react";
import type { AgentScanConfig } from "~/types/scanTypes";
import { api } from "~/utils/api";
import {
  AGENT_SCAN_SETTINGS_KEY,
  DEFAULT_AGENT_SCAN_SETTINGS,
  parseAgentScanSettings,
  serializeAgentScanSettings,
  toAgentScanConfig,
  type AgentScanSettings,
} from "./scanningModel";

export interface UseAgentScanSettings {
  /** Saved settings, or the defaults when none were saved. */
  settings: AgentScanSettings;
  /** True once settings have been saved at least once. */
  saved: boolean;
  /** The agent config a scan should carry, or undefined when off. */
  scanConfig: AgentScanConfig | undefined;
  isLoading: boolean;
  isError: boolean;
  isSaving: boolean;
  save: (next: AgentScanSettings) => Promise<void>;
}

export function useAgentScanSettings(options: { enabled?: boolean } = {}): UseAgentScanSettings {
  const utils = api.useContext();
  const query = api.store.getValue.useQuery(
    { key: AGENT_SCAN_SETTINGS_KEY },
    {
      enabled: options.enabled ?? true,
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
  const { mutateAsync, isLoading: isSaving } = api.store.setValue.useMutation();

  const stored = useMemo(() => parseAgentScanSettings(query.data), [query.data]);
  const settings = stored ?? DEFAULT_AGENT_SCAN_SETTINGS;
  const scanConfig = useMemo(() => toAgentScanConfig(stored), [stored]);

  const save = useCallback(
    async (next: AgentScanSettings) => {
      const value = serializeAgentScanSettings(next);
      await mutateAsync({ key: AGENT_SCAN_SETTINGS_KEY, value });
      utils.store.getValue.setData({ key: AGENT_SCAN_SETTINGS_KEY }, value);
    },
    [mutateAsync, utils],
  );

  return {
    settings,
    saved: stored !== null,
    scanConfig,
    isLoading: query.isLoading,
    isError: query.isError,
    isSaving,
    save,
  };
}

export default useAgentScanSettings;

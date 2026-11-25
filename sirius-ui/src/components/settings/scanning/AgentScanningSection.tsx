/**
 * Agent scanning (R10): plain inputs in place of the old Scanner › Advanced
 * sliders. The values are saved with the existing store procedures (see
 * useAgentScanSettings) so a scan started from the Scanner can use them; a
 * profile with its own agent settings still uses those.
 */

import React, { useEffect, useId, useState } from "react";
import { Bot, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/lib/ui/button";
import { Checkbox } from "~/components/lib/ui/checkbox";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/lib/ui/select";
import { cn } from "~/components/lib/utils";
import {
  AGENT_CONCURRENCY_RANGE,
  AGENT_SCAN_MODES,
  AGENT_TIMEOUT_RANGE,
  validateAgentScanDraft,
  type AgentScanModeValue,
  type AgentScanSettings,
} from "./scanningModel";
import { SectionError, SettingsSection, SkeletonRows } from "./ui";
import { useAgentScanSettings } from "./useAgentScanSettings";

interface Draft {
  enabled: boolean;
  mode: AgentScanModeValue;
  timeout: string;
  concurrency: string;
}

function toDraft(s: AgentScanSettings): Draft {
  return { enabled: s.enabled, mode: s.mode, timeout: String(s.timeout), concurrency: String(s.concurrency) };
}

function sameDraft(a: Draft, b: Draft): boolean {
  return a.enabled === b.enabled && a.mode === b.mode && a.timeout.trim() === b.timeout.trim() && a.concurrency.trim() === b.concurrency.trim();
}

const FIELD = "border-gray-700 bg-gray-950/60 text-sm text-white";

export function AgentScanningSection() {
  const { settings, saved, isLoading, isError, isSaving, save } = useAgentScanSettings();
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const [touched, setTouched] = useState(false);
  const ids = { mode: useId(), timeout: useId(), concurrency: useId(), enabled: useId() };

  // Load the saved values once they arrive (or after a save elsewhere),
  // unless the form has unsaved edits.
  const baseline = toDraft(settings);
  const baselineKey = JSON.stringify(baseline);
  useEffect(() => {
    if (!touched) setDraft(JSON.parse(baselineKey) as Draft);
  }, [baselineKey, touched]);

  const errors = validateAgentScanDraft(draft);
  const hasErrors = Object.keys(errors).length > 0;
  const dirty = !sameDraft(draft, baseline);

  const update = (patch: Partial<Draft>) => {
    setTouched(true);
    setDraft((d) => ({ ...d, ...patch }));
  };

  const onSave = async () => {
    if (hasErrors) return;
    try {
      await save({
        enabled: draft.enabled,
        mode: draft.mode,
        timeout: Number(draft.timeout),
        concurrency: Number(draft.concurrency),
      });
      setTouched(false);
      toast.success("Agent scanning saved");
    } catch (error) {
      toast.error("Couldn't save agent scanning", {
        description: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <SettingsSection
      icon={Bot}
      title="Agent scanning"
      description="Used by scans whose profile has no agent settings of its own."
      actions={
        <>
          {!dirty && saved && <span className="text-xs text-gray-500">Saved</span>}
          {dirty && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => {
                setDraft(baseline);
                setTouched(false);
              }}
              disabled={isSaving}
            >
              Discard
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            className="h-8 px-3 text-xs"
            onClick={() => void onSave()}
            disabled={!dirty || hasErrors || isSaving || isLoading}
          >
            {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />}
            Save
          </Button>
        </>
      }
    >
      {isLoading ? (
        <SkeletonRows rows={1} />
      ) : isError ? (
        <SectionError title="Couldn't load agent scanning" reason="The settings store didn't answer." />
      ) : (
        <form
          className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start"
          onSubmit={(e) => {
            e.preventDefault();
            void onSave();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor={ids.mode} className="text-xs text-gray-400">
              Scan mode
            </Label>
            <Select value={draft.mode} onValueChange={(v) => update({ mode: v as AgentScanModeValue })}>
              <SelectTrigger id={ids.mode} className={cn(FIELD, "h-9 text-left [&>span]:truncate")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-gray-700 bg-gray-900 text-white">
                {AGENT_SCAN_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={ids.timeout} className="text-xs text-gray-400">
              Agent timeout, seconds
            </Label>
            <Input
              id={ids.timeout}
              type="number"
              inputMode="numeric"
              min={AGENT_TIMEOUT_RANGE.min}
              max={AGENT_TIMEOUT_RANGE.max}
              step={1}
              value={draft.timeout}
              onChange={(e) => update({ timeout: e.target.value })}
              aria-invalid={!!errors.timeout}
              aria-describedby={errors.timeout ? `${ids.timeout}-error` : undefined}
              className={cn(FIELD, "h-9 tabular-nums")}
            />
            {errors.timeout && (
              <p id={`${ids.timeout}-error`} className="text-xs text-red-400">
                {errors.timeout}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor={ids.concurrency} className="text-xs text-gray-400">
              Concurrency limit
            </Label>
            <Input
              id={ids.concurrency}
              type="number"
              inputMode="numeric"
              min={AGENT_CONCURRENCY_RANGE.min}
              max={AGENT_CONCURRENCY_RANGE.max}
              step={1}
              value={draft.concurrency}
              onChange={(e) => update({ concurrency: e.target.value })}
              aria-invalid={!!errors.concurrency}
              aria-describedby={errors.concurrency ? `${ids.concurrency}-error` : undefined}
              className={cn(FIELD, "h-9 tabular-nums")}
            />
            {errors.concurrency && (
              <p id={`${ids.concurrency}-error`} className="text-xs text-red-400">
                {errors.concurrency}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1 lg:pt-7">
            <Checkbox
              id={ids.enabled}
              checked={draft.enabled}
              onCheckedChange={(v) => update({ enabled: v === true })}
              className="border-violet-500/60 data-[state=checked]:border-violet-500 data-[state=checked]:bg-violet-600 data-[state=checked]:text-white"
            />
            <Label htmlFor={ids.enabled} className="cursor-pointer text-xs text-gray-300">
              Run agent scans with every scan
            </Label>
          </div>
        </form>
      )}
    </SettingsSection>
  );
}

export default AgentScanningSection;

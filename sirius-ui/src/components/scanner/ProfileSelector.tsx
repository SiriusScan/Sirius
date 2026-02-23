import React, { useMemo } from "react";
import { api } from "~/utils/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import {
  Bot,
  Layers,
  Shield,
  Zap,
  Search,
  ScanLine,
} from "lucide-react";

interface ProfileSelectorProps {
  value: string; // profile ID
  onChange: (profileId: string) => void;
  showDescription?: boolean;
}

type ScanFlavor =
  | "agent-only"
  | "combined"
  | "vulnerability"
  | "comprehensive"
  | "quick"
  | "network";

interface ScanTypeInfo {
  icon: React.ReactNode;
  label: string;
  flavor: ScanFlavor;
}

// ─── Icon + label config per flavor ───────────────────────────────
const FLAVOR_CONFIG: Record<
  ScanFlavor,
  {
    iconClass: string;
    label: string;
    badgeBg?: string;
    badgeText?: string;
    badgeLabel?: string;
  }
> = {
  "agent-only": {
    iconClass: "text-cyan-400",
    label: "Agent scan",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-400",
    badgeLabel: "Agent",
  },
  combined: {
    iconClass: "text-emerald-400",
    label: "Network + Agent",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-400",
    badgeLabel: "Combined",
  },
  vulnerability: {
    iconClass: "text-rose-400",
    label: "Vulnerability scan",
  },
  comprehensive: {
    iconClass: "text-amber-400",
    label: "Comprehensive scan",
  },
  quick: {
    iconClass: "text-sky-400",
    label: "Quick scan",
  },
  network: {
    iconClass: "text-violet-400",
    label: "Network scan",
  },
};

function flavorIcon(flavor: ScanFlavor): React.ReactNode {
  const cls = `h-3.5 w-3.5 ${FLAVOR_CONFIG[flavor].iconClass}`;
  switch (flavor) {
    case "agent-only":
      return <Bot className={cls} />;
    case "combined":
      return <Layers className={cls} />;
    case "vulnerability":
      return <Shield className={cls} />;
    case "comprehensive":
      return <Search className={cls} />;
    case "quick":
      return <Zap className={cls} />;
    case "network":
    default:
      return <ScanLine className={cls} />;
  }
}

// ─── Profile display order (lower = appears first) ───────────────
const PROFILE_ORDER: Record<string, number> = {
  "quick": 0,
  "high-risk": 1,
  "all": 2,
  "full-scan": 3,
  "agent-only": 4,
};

function profileSortKey(id: string): number {
  return PROFILE_ORDER[id] ?? 10; // custom profiles sort last
}

/**
 * Determines the scan flavor for a profile.
 *
 * Uses a two-pass approach:
 *  1. Check profile ID / name for known agent patterns (bulletproof even
 *     when the agent_scan field isn't stored in ValKey yet).
 *  2. Fall back to data-driven heuristics based on scan_options fields.
 */
function classifyProfile(profile: {
  id?: string;
  name?: string;
  scan_options?: {
    agent_scan?: { enabled?: boolean };
    scan_types?: string[];
    aggressive?: boolean;
  };
  enabled_scripts?: string[];
}): ScanFlavor {
  const id = profile.id ?? "";
  const name = (profile.name ?? "").toLowerCase();
  const agentEnabled = profile.scan_options?.agent_scan?.enabled === true;
  const scanTypes = profile.scan_options?.scan_types ?? [];
  const hasNetworkTypes = scanTypes.length > 0;
  const scriptCount = profile.enabled_scripts?.length ?? 0;
  const isAggressive = profile.scan_options?.aggressive === true;

  // ── Pass 1: ID / name-based identification ──────────────────────
  // This catches agent profiles even when agent_scan data isn't persisted
  if (id === "agent-only" || (!hasNetworkTypes && name.includes("agent"))) {
    return "agent-only";
  }
  if (
    id === "full-scan" ||
    (name.includes("agent") && hasNetworkTypes) ||
    (agentEnabled && hasNetworkTypes)
  ) {
    return "combined";
  }

  // ── Pass 2: agent_scan field (when data IS available) ───────────
  if (agentEnabled && !hasNetworkTypes) return "agent-only";
  if (agentEnabled && hasNetworkTypes) return "combined";

  // ── Pass 3: Network-only heuristics ─────────────────────────────

  // Comprehensive: many scan types or very high script count
  const hasDiscovery = scanTypes.includes("discovery");
  if (
    scanTypes.length >= 4 ||
    scriptCount > 30 ||
    (hasDiscovery && scanTypes.length >= 3)
  ) {
    return "comprehensive";
  }

  // Quick: few scripts, not aggressive
  if (!isAggressive && scriptCount <= 8 && scriptCount > 0) {
    return "quick";
  }

  // Vulnerability-focused: aggressive with vulnerability type
  if (isAggressive && (scanTypes.includes("vulnerability") || scriptCount > 8)) {
    return "vulnerability";
  }

  return "network";
}

// ─── Component ────────────────────────────────────────────────────

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  value,
  onChange,
  showDescription = false,
}) => {
  const {
    data: profiles,
    isLoading,
    isError,
    error,
  } = api.templates.getTemplates.useQuery();

  // Sort profiles into a stable display order
  const sortedProfiles = useMemo(() => {
    if (!profiles) return [];
    return [...profiles].sort(
      (a, b) => profileSortKey(a.id) - profileSortKey(b.id)
    );
  }, [profiles]);

  const selectedProfile = profiles?.find((p) => p.id === value);
  const selectedFlavor = selectedProfile
    ? classifyProfile(selectedProfile)
    : null;

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger className="relative h-12 w-full rounded-lg border-violet-500/30 bg-gray-900/50 px-4 pr-10 text-sm text-white shadow-sm focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:-translate-y-1/2 [&>svg]:text-violet-400 [&>svg]:opacity-70">
          <SelectValue
            placeholder={isLoading ? "Loading profiles..." : "Select profile"}
          />
        </SelectTrigger>
        <SelectContent className="z-50 border-violet-500/20 bg-gray-900/95 text-white shadow-xl backdrop-blur-sm">
          {isLoading ? (
            <SelectItem value="loading" disabled className="text-gray-400">
              Loading profiles...
            </SelectItem>
          ) : sortedProfiles.length > 0 ? (
            sortedProfiles.map((profile) => {
              const flavor = classifyProfile(profile);
              const config = FLAVOR_CONFIG[flavor];
              return (
                <SelectItem
                  key={profile.id}
                  value={profile.id}
                  className="cursor-pointer text-white hover:bg-violet-500/20 focus:bg-violet-500/20 focus:text-violet-100"
                >
                  <span className="flex items-center gap-2">
                    {flavorIcon(flavor)}
                    <span>{profile.name}</span>
                    {config.badgeLabel && (
                      <span
                        className={`ml-1 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${config.badgeBg} ${config.badgeText}`}
                      >
                        {config.badgeLabel}
                      </span>
                    )}
                  </span>
                </SelectItem>
              );
            })
          ) : (
            <SelectItem value="none" disabled className="text-gray-400">
              No profiles available (engine templates not initialized)
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {isError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          Unable to load scan profiles: {error.message}
        </div>
      )}

      {!isLoading && !isError && sortedProfiles.length === 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          No scan profiles are currently available. Verify that `sirius-engine`
          is healthy and template initialization has completed.
        </div>
      )}

      {/* Reactive sub-label — updates when selection changes */}
      {selectedFlavor && (
        <div className="flex items-center gap-1.5 px-1 text-xs text-gray-400">
          {flavorIcon(selectedFlavor)}
          <span>{FLAVOR_CONFIG[selectedFlavor].label}</span>
        </div>
      )}

      {showDescription && selectedProfile && (
        <div className="rounded-lg bg-violet-500/5 p-2 text-xs text-violet-200/70">
          {selectedProfile.description}
        </div>
      )}
    </div>
  );
};

export { ProfileSelector };
export default ProfileSelector;

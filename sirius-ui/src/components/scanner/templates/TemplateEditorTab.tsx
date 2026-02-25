import React, { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import { Badge } from "~/components/lib/ui/badge";
import { Checkbox } from "~/components/lib/ui/checkbox";
import {
  Save,
  X,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  Search,
  ChevronDown,
  ChevronRight,
  Filter,
  Settings2,
  Bot,
} from "lucide-react";
import { api } from "~/utils/api";
import ScriptTable from "../shared/ScriptTable";
import type { NmapScript } from "../nmap/mockScriptsData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";
import { type AgentScanMode, DEFAULT_AGENT_SCAN_CONFIG } from "~/types/scanTypes";
import { toast } from "sonner";

interface TemplateEditorTabProps {
  templateId?: string;
  onClose: () => void;
}

const TemplateEditorTab: React.FC<TemplateEditorTabProps> = ({
  templateId,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupByProtocol, setGroupByProtocol] = useState(true);
  const [filterMode, setFilterMode] = useState<
    "all" | "selected" | "unselected"
  >("all");
  const [collapsedProtocols, setCollapsedProtocols] = useState<Set<string>>(
    new Set()
  );

  // Scan options state
  const [scanTypes, setScanTypes] = useState<string[]>([
    "fingerprint",
    "enumeration",
    "vulnerability",
  ]);
  const [portRange, setPortRange] = useState("");
  const [aggressive, setAggressive] = useState(false);
  const [maxRetries, setMaxRetries] = useState(2);
  const [parallel, setParallel] = useState(true);
  const [excludePorts, setExcludePorts] = useState("");
  const [scanOptionsExpanded, setScanOptionsExpanded] = useState(false);

  // Agent scan config state
  const [agentScanEnabled, setAgentScanEnabled] = useState(false);
  const [agentScanMode, setAgentScanMode] = useState<AgentScanMode>("comprehensive");
  const [agentScanTimeout, setAgentScanTimeout] = useState(300);
  const [agentScanConcurrency, setAgentScanConcurrency] = useState(5);
  const [agentScanExpanded, setAgentScanExpanded] = useState(false);

  const utils = api.useContext();

  // Fetch existing template if editing
  const { data: existingTemplate } = api.templates.getTemplate.useQuery(
    { id: templateId! },
    { enabled: !!templateId }
  );

  // Fetch scripts - with proper loading and error handling
  const {
    data: scripts,
    isLoading: scriptsLoading,
    error: scriptsError,
  } = api.store.getNseScripts.useQuery(undefined, {
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const availableScripts = useMemo(() => scripts || [], [scripts]);

  // Initialize form with existing template data
  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setDescription(existingTemplate.description || "");
      setSelectedScripts(existingTemplate.enabled_scripts || []);
      // Initialize scan options from existing template
      const opts = existingTemplate.scan_options;
      if (opts) {
        setScanTypes(
          opts.scan_types || ["fingerprint", "enumeration", "vulnerability"]
        );
        setPortRange(opts.port_range || "");
        setAggressive(opts.aggressive || false);
        setMaxRetries(opts.max_retries || 2);
        setParallel(opts.parallel ?? true);
        setExcludePorts(opts.exclude_ports?.join(", ") || "");
        // Load agent scan config
        if (opts.agent_scan) {
          setAgentScanEnabled(opts.agent_scan.enabled ?? false);
          setAgentScanMode(opts.agent_scan.mode ?? "comprehensive");
          setAgentScanTimeout(opts.agent_scan.timeout ?? 300);
          setAgentScanConcurrency(opts.agent_scan.concurrency ?? 5);
          if (opts.agent_scan.enabled) setAgentScanExpanded(true);
        }
      }
    }
  }, [existingTemplate]);

  // Check for missing scripts (scripts in profile but not in available list)
  const missingScripts = useMemo(() => {
    if (selectedScripts.length === 0 || availableScripts.length === 0)
      return [];
    const availableIds = new Set(availableScripts.map((s) => s.id));
    return selectedScripts.filter((id) => !availableIds.has(id));
  }, [selectedScripts, availableScripts]);

  // Valid selected scripts (only those that exist)
  const validSelectedScripts = useMemo(() => {
    if (selectedScripts.length === 0 || availableScripts.length === 0)
      return selectedScripts;
    const availableIds = new Set(availableScripts.map((s) => s.id));
    return selectedScripts.filter((id) => availableIds.has(id));
  }, [selectedScripts, availableScripts]);

  const createMutation = api.templates.createTemplate.useMutation({
    onSuccess: () => {
      utils.templates.getTemplates.invalidate();
      onClose();
    },
  });

  const updateMutation = api.templates.updateTemplate.useMutation({
    onSuccess: () => {
      utils.templates.getTemplates.invalidate();
      onClose();
    },
  });

  const handleToggleScript = (scriptId: string) => {
    setSelectedScripts((prev) =>
      prev.includes(scriptId)
        ? prev.filter((id) => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const handleSelectAll = () => {
    // Select all filtered scripts, not all available scripts
    const newSelections = filteredScripts.map((s) => s.id);
    setSelectedScripts((prev) => {
      const combined = [...prev, ...newSelections];
      return Array.from(new Set(combined)); // Remove duplicates
    });
  };

  const handleDeselectAll = () => {
    setSelectedScripts([]);
  };

  const handleToggleProtocol = (protocol: string) => {
    // Use filteredScripts instead of availableScripts to respect current filters
    const protocolScripts = filteredScripts
      .filter((s) => s.protocol === protocol)
      .map((s) => s.id);

    const allSelected = protocolScripts.every((id) =>
      selectedScripts.includes(id)
    );

    if (allSelected) {
      setSelectedScripts((prev) =>
        prev.filter((id) => !protocolScripts.includes(id))
      );
    } else {
      setSelectedScripts((prev) => [
        ...prev,
        ...protocolScripts.filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const toggleProtocolCollapse = (protocol: string) => {
    setCollapsedProtocols((prev) => {
      const next = new Set(prev);
      if (next.has(protocol)) {
        next.delete(protocol);
      } else {
        next.add(protocol);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedProtocols(new Set());
  const collapseAll = () =>
    setCollapsedProtocols(new Set(Object.keys(scriptsByProtocol)));

  const handleSave = () => {
    if (!name.trim()) return;
    if (scanTypes.length === 0) return;
    if (missingScripts.length > 0) {
      toast.error("Profile has unlinked scripts", {
        description:
          "Remove missing script references before saving this profile.",
      });
      return;
    }

    const baseData = {
      name: name.trim(),
      description: description.trim(),
      enabled_scripts: validSelectedScripts,
      type: "custom" as const,
      scan_options: {
        scan_types: scanTypes,
        port_range: portRange,
        aggressive: aggressive,
        max_retries: maxRetries,
        parallel: parallel,
        exclude_ports: excludePorts
          ? excludePorts
              .split(",")
              .map((p) => p.trim())
              .filter(Boolean)
          : undefined,
        agent_scan: agentScanEnabled
          ? {
              enabled: true,
              mode: agentScanMode,
              agent_ids: [] as string[],
              timeout: agentScanTimeout,
              concurrency: agentScanConcurrency,
            }
          : undefined,
      },
    };

    if (templateId && !isSystemProfile) {
      // Update existing custom profile
      updateMutation.mutate({ id: templateId, ...baseData });
    } else {
      // Create new profile (either new or copy of system profile)
      const newId = `custom-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      createMutation.mutate({ id: newId, ...baseData });
    }
  };

  const handleSaveAsCopy = () => {
    if (missingScripts.length > 0) {
      toast.error("Profile has unlinked scripts", {
        description:
          "Remove missing script references before saving this profile copy.",
      });
      return;
    }
    // Set name to copy version
    setName(`${name} (Copy)`);
    // Force create new by treating as if no templateId
    // We'll trigger save on next render
    setTimeout(() => {
      const newId = `custom-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const baseData = {
        name: `${existingTemplate?.name || name} (Copy)`,
        description: description.trim(),
        enabled_scripts: validSelectedScripts,
        type: "custom" as const,
        scan_options: {
          scan_types: scanTypes,
          port_range: portRange,
          aggressive: aggressive,
          max_retries: maxRetries,
          parallel: parallel,
          exclude_ports: excludePorts
            ? excludePorts
                .split(",")
                .map((p) => p.trim())
                .filter(Boolean)
            : undefined,
          agent_scan: agentScanEnabled
            ? {
                enabled: true,
                mode: agentScanMode,
                agent_ids: [] as string[],
                timeout: agentScanTimeout,
                concurrency: agentScanConcurrency,
              }
            : undefined,
        },
      };
      createMutation.mutate({ id: newId, ...baseData });
    }, 0);
  };

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  // Filter and search scripts
  const filteredScripts = useMemo(() => {
    let filtered = availableScripts;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (script) =>
          script.name.toLowerCase().includes(query) ||
          script.description.toLowerCase().includes(query) ||
          script.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          script.author.toLowerCase().includes(query)
      );
    }

    // Apply filter mode
    if (filterMode === "selected") {
      filtered = filtered.filter((script) =>
        selectedScripts.includes(script.id)
      );
    } else if (filterMode === "unselected") {
      filtered = filtered.filter(
        (script) => !selectedScripts.includes(script.id)
      );
    }

    return filtered;
  }, [availableScripts, searchQuery, filterMode, selectedScripts]);

  // Group scripts by protocol
  const scriptsByProtocol = useMemo(() => {
    const grouped: Record<string, NmapScript[]> = {};
    filteredScripts.forEach((script) => {
      const protocol = script.protocol || "other";
      if (!grouped[protocol]) {
        grouped[protocol] = [];
      }
      grouped[protocol]!.push(script);
    });
    return grouped;
  }, [filteredScripts]);

  // Check if this is a system profile (read-only)
  const isSystemProfile = existingTemplate?.type === "system";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-white">
            {templateId ? "Edit Profile" : "Create New Profile"}
          </h4>
          {isSystemProfile && (
            <p className="mt-1 text-xs text-yellow-400">
              System profiles are read-only. Create a copy to customize.
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Template Info */}
      <div className="space-y-4 rounded-md border border-gray-700 bg-gray-800/20 p-4">
        <div>
          <Label htmlFor="templateName" className="text-gray-400">
            Profile Name
          </Label>
          <Input
            id="templateName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Web Application Security Scan"
            disabled={isSystemProfile}
            className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
          />
        </div>
        <div>
          <Label htmlFor="templateDescription" className="text-gray-400">
            Description
          </Label>
          <Textarea
            id="templateDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this profile is for..."
            disabled={isSystemProfile}
            className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
            rows={3}
          />
        </div>
      </div>

      {/* Scan Options - Collapsible */}
      <div className="rounded-md border border-gray-700 bg-gray-800/20">
        <div
          className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-700/30"
          onClick={() => setScanOptionsExpanded(!scanOptionsExpanded)}
        >
          <div className="flex items-center gap-2">
            {scanOptionsExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <Settings2 className="h-4 w-4 text-violet-400" />
            <span className="font-medium text-white">Scan Options</span>
            <span className="text-xs text-gray-500">
              {scanTypes.length} phases, {portRange || "auto"} ports
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Click to {scanOptionsExpanded ? "collapse" : "expand"}
          </span>
        </div>

        {scanOptionsExpanded && (
          <div className="space-y-6 border-t border-gray-700 p-4">
            {/* Scan Phases */}
            <div>
              <Label className="mb-3 block text-gray-400">Scan Phases</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "fingerprint",
                    label: "Fingerprint",
                    desc: "Host liveness & OS detection",
                  },
                  {
                    id: "enumeration",
                    label: "Enumeration",
                    desc: "Port discovery via Naabu",
                  },
                  {
                    id: "discovery",
                    label: "Discovery",
                    desc: "Broader port discovery",
                  },
                  {
                    id: "vulnerability",
                    label: "Vulnerability",
                    desc: "NSE script scanning",
                  },
                ].map((phase) => (
                  <div
                    key={phase.id}
                    className="flex items-start gap-2 rounded-md border border-gray-700 bg-gray-800/30 p-3"
                  >
                    <Checkbox
                      id={`phase-${phase.id}`}
                      checked={scanTypes.includes(phase.id)}
                      disabled={isSystemProfile}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setScanTypes((prev) => [...prev, phase.id]);
                        } else {
                          setScanTypes((prev) =>
                            prev.filter((t) => t !== phase.id)
                          );
                        }
                      }}
                    />
                    <div>
                      <Label
                        htmlFor={`phase-${phase.id}`}
                        className="cursor-pointer text-sm text-white"
                      >
                        {phase.label}
                      </Label>
                      <p className="text-xs text-gray-500">{phase.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {scanTypes.length === 0 && (
                <p className="mt-2 text-xs text-red-400">
                  At least one scan phase is required
                </p>
              )}
            </div>

            {/* Port Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="portRange" className="text-gray-400">
                  Port Range
                </Label>
                <Input
                  id="portRange"
                  value={portRange}
                  onChange={(e) => setPortRange(e.target.value)}
                  placeholder="e.g., 22,80,443 or 1-1000"
                  disabled={isSystemProfile}
                  className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave empty to use discovered ports (recommended)
                </p>
              </div>
              <div>
                <Label htmlFor="excludePorts" className="text-gray-400">
                  Exclude Ports
                </Label>
                <Input
                  id="excludePorts"
                  value={excludePorts}
                  onChange={(e) => setExcludePorts(e.target.value)}
                  placeholder="e.g., 22,3389"
                  disabled={isSystemProfile}
                  className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated ports to skip
                </p>
              </div>
            </div>

            {/* Scan Behavior */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-md border border-gray-700 bg-gray-800/30 p-3">
                <Checkbox
                  id="aggressive"
                  checked={aggressive}
                  disabled={isSystemProfile}
                  onCheckedChange={(checked) => setAggressive(!!checked)}
                />
                <div>
                  <Label
                    htmlFor="aggressive"
                    className="cursor-pointer text-sm text-white"
                  >
                    Aggressive Mode
                  </Label>
                  <p className="text-xs text-gray-500">Faster but noisier</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-gray-700 bg-gray-800/30 p-3">
                <Checkbox
                  id="parallel"
                  checked={parallel}
                  disabled={isSystemProfile}
                  onCheckedChange={(checked) => setParallel(!!checked)}
                />
                <div>
                  <Label
                    htmlFor="parallel"
                    className="cursor-pointer text-sm text-white"
                  >
                    Parallel Execution
                  </Label>
                  <p className="text-xs text-gray-500">
                    Run scripts in parallel
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="maxRetries" className="text-gray-400">
                  Max Retries
                </Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min={1}
                  max={5}
                  value={maxRetries}
                  onChange={(e) =>
                    setMaxRetries(
                      Math.max(1, Math.min(5, parseInt(e.target.value) || 2))
                    )
                  }
                  disabled={isSystemProfile}
                  className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Scan Configuration - Collapsible */}
      <div className="rounded-md border border-gray-700 bg-gray-800/20">
        <div
          className="flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-700/30"
          onClick={() => setAgentScanExpanded(!agentScanExpanded)}
        >
          <div className="flex items-center gap-2">
            {agentScanExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
            <Bot className="h-4 w-4 text-cyan-400" />
            <span className="font-medium text-white">Agent Scan</span>
            {agentScanEnabled ? (
              <Badge className="bg-cyan-600/20 text-cyan-300">Enabled</Badge>
            ) : (
              <span className="text-xs text-gray-500">Disabled</span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Click to {agentScanExpanded ? "collapse" : "expand"}
          </span>
        </div>

        {agentScanExpanded && (
          <div className="space-y-6 border-t border-gray-700 p-4">
            {/* Enable Toggle */}
            <div className="flex items-center gap-3 rounded-md border border-gray-700 bg-gray-800/30 p-3">
              <Checkbox
                id="agentScanEnabled"
                checked={agentScanEnabled}
                disabled={isSystemProfile}
                onCheckedChange={(checked) => setAgentScanEnabled(!!checked)}
              />
              <div>
                <Label
                  htmlFor="agentScanEnabled"
                  className="cursor-pointer text-sm text-white"
                >
                  Include Agent Scan
                </Label>
                <p className="text-xs text-gray-500">
                  Run agent-based vulnerability scans alongside network scans
                </p>
              </div>
            </div>

            {agentScanEnabled && (
              <>
                {/* Scan Mode */}
                <div>
                  <Label className="text-gray-400">Scan Mode</Label>
                  <Select
                    value={agentScanMode}
                    onValueChange={(v) => setAgentScanMode(v as AgentScanMode)}
                    disabled={isSystemProfile}
                  >
                    <SelectTrigger className="mt-1 border-gray-600 bg-gray-800/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-gray-600 bg-gray-900 text-white">
                      <SelectItem value="comprehensive">
                        Comprehensive (Templates + Scripts)
                      </SelectItem>
                      <SelectItem value="templates-only">
                        Templates Only
                      </SelectItem>
                      <SelectItem value="scripts-only">
                        Scripts Only
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">
                    Determines which agent scan modules to execute
                  </p>
                </div>

                {/* Timeout and Concurrency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="agentTimeout" className="text-gray-400">
                      Timeout (seconds)
                    </Label>
                    <Input
                      id="agentTimeout"
                      type="number"
                      min={30}
                      max={3600}
                      value={agentScanTimeout}
                      onChange={(e) =>
                        setAgentScanTimeout(
                          Math.max(30, Math.min(3600, parseInt(e.target.value) || 300))
                        )
                      }
                      disabled={isSystemProfile}
                      className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Max time per agent (30-3600s)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="agentConcurrency" className="text-gray-400">
                      Concurrency
                    </Label>
                    <Input
                      id="agentConcurrency"
                      type="number"
                      min={1}
                      max={20}
                      value={agentScanConcurrency}
                      onChange={(e) =>
                        setAgentScanConcurrency(
                          Math.max(1, Math.min(20, parseInt(e.target.value) || 5))
                        )
                      }
                      disabled={isSystemProfile}
                      className="mt-1 border-gray-600 bg-gray-800/50 text-white disabled:opacity-60"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Parallel template workers per agent (1-20)
                    </p>
                  </div>
                </div>

                {/* Info notice */}
                <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 p-3">
                  <p className="text-xs text-cyan-300">
                    Agent scans target all connected agents by default. You can
                    select specific agents when starting a scan from the Scan Controls.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Script Selection */}
      {scriptsLoading ? (
        <div className="flex items-center justify-center rounded-md border border-gray-700 bg-gray-800/20 p-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            <p className="text-sm text-gray-400">Loading NSE scripts...</p>
          </div>
        </div>
      ) : scriptsError ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h5 className="font-medium text-red-300">
                Failed to Load Scripts
              </h5>
              <p className="mt-1 text-sm text-red-400">
                Unable to fetch NSE scripts from the backend. Please ensure the
                sirius-valkey service is running and scripts are initialized.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => utils.store.getNseScripts.invalidate()}
                className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/10"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      ) : availableScripts.length === 0 ? (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-6 text-center">
          <AlertCircle className="mx-auto mb-3 h-8 w-8 text-yellow-400" />
          <h5 className="mb-2 font-medium text-yellow-300">
            No NSE Scripts Available
          </h5>
          <p className="text-sm text-yellow-400">
            No NSE scripts found in the database. Initialize scripts using the
            scanner to populate them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Missing scripts warning */}
          {missingScripts.length > 0 && (
            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/5 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">
                    {missingScripts.length} Selected Scripts Not Found
                  </p>
                  <p className="text-xs text-yellow-400">
                    This profile references {missingScripts.length} script
                    {missingScripts.length !== 1 ? "s" : ""} that{" "}
                    {missingScripts.length !== 1 ? "are" : "is"} not in the
                    current NSE script database.
                    {missingScripts.length <= 5 && (
                      <span className="ml-1">
                        ({missingScripts.join(", ")})
                      </span>
                    )}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Remove missing scripts from selection
                      setSelectedScripts(validSelectedScripts);
                    }}
                    className="mt-2 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                  >
                    Remove Missing Scripts
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header with counts and actions */}
          <div className="flex items-center justify-between">
            <div>
              <h5 className="text-sm font-medium text-white">
                NSE Scripts ({validSelectedScripts.length} of{" "}
                {availableScripts.length} selected)
                {missingScripts.length > 0 && (
                  <span className="ml-2 text-xs text-yellow-400">
                    + {missingScripts.length} missing
                  </span>
                )}
              </h5>
              <p className="text-xs text-gray-400">
                {filteredScripts.length < availableScripts.length && (
                  <span className="text-violet-400">
                    Showing {filteredScripts.length} matching scripts
                  </span>
                )}
                {filteredScripts.length === availableScripts.length && (
                  <span>
                    Choose which NSE scripts to include in this profile
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="border-gray-600 hover:bg-gray-700"
              >
                <CheckSquare className="mr-1 h-3 w-3" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                className="border-gray-600 hover:bg-gray-700"
              >
                <Square className="mr-1 h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search scripts by name, description, tags, or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-600 bg-gray-800/50 pl-10 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterMode === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("all")}
              >
                All
              </Button>
              <Button
                variant={filterMode === "selected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("selected")}
              >
                <Filter className="mr-1 h-3 w-3" />
                Selected ({validSelectedScripts.length})
                {missingScripts.length > 0 && (
                  <span className="ml-1 text-xs opacity-60">
                    +{missingScripts.length}
                  </span>
                )}
              </Button>
              <Button
                variant={filterMode === "unselected" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterMode("unselected")}
              >
                Unselected
              </Button>
            </div>
          </div>

          {/* Group by protocol checkbox + expand/collapse */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="groupByProtocol"
                checked={groupByProtocol}
                onCheckedChange={(checked) => setGroupByProtocol(!!checked)}
              />
              <Label
                htmlFor="groupByProtocol"
                className="text-sm text-gray-400"
              >
                Group by protocol
              </Label>
            </div>
            {groupByProtocol && Object.keys(scriptsByProtocol).length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={expandAll}
                  className="h-7 text-xs text-gray-400 hover:text-white"
                >
                  Expand All
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={collapseAll}
                  className="h-7 text-xs text-gray-400 hover:text-white"
                >
                  Collapse All
                </Button>
              </div>
            )}
          </div>

          {groupByProtocol ? (
            <div className="space-y-3">
              {Object.entries(scriptsByProtocol).length === 0 ? (
                <div className="rounded-md border border-gray-700 bg-gray-800/20 p-8 text-center">
                  <p className="text-sm text-gray-400">
                    No scripts match your current filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setFilterMode("all");
                    }}
                    className="mt-3 border-gray-600 hover:bg-gray-700"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                Object.entries(scriptsByProtocol).map(
                  ([protocol, protocolScripts]) => {
                    const allSelected = protocolScripts.every((s) =>
                      selectedScripts.includes(s.id)
                    );
                    const someSelected = protocolScripts.some((s) =>
                      selectedScripts.includes(s.id)
                    );
                    const selectedCount = protocolScripts.filter((s) =>
                      selectedScripts.includes(s.id)
                    ).length;
                    const isCollapsed = collapsedProtocols.has(protocol);

                    return (
                      <div
                        key={protocol}
                        className="rounded-md border border-gray-700 bg-gray-800/20"
                      >
                        {/* Protocol Header - Collapsible */}
                        <div
                          className="flex cursor-pointer items-center gap-3 border-b border-gray-700 p-3 transition-colors hover:bg-gray-700/30"
                          onClick={() => toggleProtocolCollapse(protocol)}
                        >
                          {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() =>
                              handleToggleProtocol(protocol)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className={
                              someSelected && !allSelected ? "opacity-50" : ""
                            }
                          />
                          <Badge
                            variant="outline"
                            className="bg-violet-800/20 text-violet-200"
                          >
                            {protocol}
                          </Badge>
                          <span className="text-sm text-gray-400">
                            {protocolScripts.length}{" "}
                            {protocolScripts.length === 1
                              ? "script"
                              : "scripts"}
                          </span>
                          {selectedCount > 0 && (
                            <Badge className="bg-green-600/20 text-green-300">
                              {selectedCount} selected
                            </Badge>
                          )}
                          <div className="flex-1" /> {/* Spacer */}
                          <span className="text-xs text-gray-500">
                            Click to {isCollapsed ? "expand" : "collapse"}
                          </span>
                        </div>

                        {/* Protocol Scripts - Collapsible */}
                        {!isCollapsed && (
                          <div className="p-2">
                            <ScriptTable
                              scripts={protocolScripts}
                              showCheckboxes={true}
                              selectedScripts={selectedScripts}
                              onToggleScript={handleToggleScript}
                            />
                          </div>
                        )}
                      </div>
                    );
                  }
                )
              )}
            </div>
          ) : (
            <ScriptTable
              scripts={filteredScripts}
              showCheckboxes={true}
              selectedScripts={selectedScripts}
              onToggleScript={handleToggleScript}
            />
          )}
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 z-10 flex justify-between gap-2 border-t border-gray-700 bg-gray-900/95 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {validSelectedScripts.length > 0 && (
            <span>
              {validSelectedScripts.length} script
              {validSelectedScripts.length !== 1 ? "s" : ""} selected
            </span>
          )}
          {missingScripts.length > 0 && (
            <span className="text-yellow-400">
              + {missingScripts.length} missing
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-white hover:bg-gray-700"
            disabled={isLoading}
          >
            Cancel
          </Button>
          {isSystemProfile ? (
            <Button
              onClick={handleSaveAsCopy}
              disabled={isLoading || scriptsLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Copy
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={
                !name.trim() ||
                scanTypes.length === 0 ||
                isLoading ||
                scriptsLoading
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {isLoading
                ? "Saving..."
                : templateId
                ? "Update Profile"
                : "Create Profile"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorTab;

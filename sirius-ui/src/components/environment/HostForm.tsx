import React, { useState, useEffect } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { cn } from "~/components/lib/utils";
import { api } from "~/utils/api";
import { toast } from "sonner";
import {
  ArrowLeft,
  Server,
  Globe,
  Monitor,
  Hash,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Network,
  FileText,
  Shield,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/lib/ui/select";

import {
  VulnerabilityEntryRow,
  generateEntryId,
  type VulnEntryData,
} from "~/components/shared/VulnerabilityEntryRow";

// Common operating systems for dropdown
const COMMON_OS_OPTIONS = [
  { value: "Linux", label: "Linux" },
  { value: "Windows", label: "Windows" },
  { value: "macOS", label: "macOS" },
  { value: "FreeBSD", label: "FreeBSD" },
  { value: "Ubuntu", label: "Ubuntu" },
  { value: "CentOS", label: "CentOS" },
  { value: "Debian", label: "Debian" },
  { value: "Red Hat", label: "Red Hat Enterprise Linux" },
  { value: "Windows Server", label: "Windows Server" },
  { value: "Other", label: "Other" },
];

// Protocol options for ports
const PROTOCOL_OPTIONS = [
  { value: "tcp", label: "TCP" },
  { value: "udp", label: "UDP" },
];

// Port state options
const PORT_STATE_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "closed", label: "Closed" },
  { value: "filtered", label: "Filtered" },
];

interface HostFormProps {
  mode: "create" | "edit";
  initialData?: {
    ip: string;
    hostname?: string;
    os?: string;
    osversion?: string;
    ports?: Array<{ number: number; protocol: string; state: string }>;
    notes?: string[];
  };
  onCancel: () => void;
  onSuccess: () => void;
}

interface PortEntry {
  id: string;
  number: string;
  protocol: string;
  state: string;
}

interface FormData {
  ip: string;
  hostname: string;
  os: string;
  customOs: string;
  osversion: string;
  ports: PortEntry[];
  notes: string;
  vulnerabilities: VulnEntryData[];
}

// Simple IP address validation regex
const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// Generate unique ID for port entries
const generateId = () => Math.random().toString(36).substring(2, 9);

export const HostForm: React.FC<HostFormProps> = ({
  mode,
  initialData,
  onCancel,
  onSuccess,
}) => {
  // Determine initial OS value
  const getInitialOs = () => {
    if (!initialData?.os) return "";
    const isCommonOs = COMMON_OS_OPTIONS.some(
      (opt) => opt.value.toLowerCase() === initialData.os?.toLowerCase()
    );
    return isCommonOs ? initialData.os : "Other";
  };

  const [formData, setFormData] = useState<FormData>({
    ip: initialData?.ip || "",
    hostname: initialData?.hostname || "",
    os: getInitialOs(),
    customOs:
      getInitialOs() === "Other" || !getInitialOs()
        ? initialData?.os || ""
        : "",
    osversion: initialData?.osversion || "",
    ports:
      initialData?.ports?.map((p) => ({
        id: generateId(),
        number: String(p.number),
        protocol: p.protocol,
        state: p.state,
      })) || [],
    notes: initialData?.notes?.join("\n") || "",
    vulnerabilities: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<{
    ports: boolean;
    notes: boolean;
    vulnerabilities: boolean;
  }>({
    ports: mode === "edit" && (initialData?.ports?.length ?? 0) > 0,
    notes: mode === "edit" && (initialData?.notes?.length ?? 0) > 0,
    vulnerabilities: false,
  });

  const utils = api.useContext();

  const createHostMutation = api.host.createHost.useMutation({
    onSuccess: () => {
      toast.success("Host created successfully");
      void utils.host.getEnvironmentSummary.invalidate();
      void utils.host.getAllHosts.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create host: ${error.message}`);
    },
  });

  const updateHostMutation = api.host.updateHost.useMutation({
    onSuccess: () => {
      toast.success("Host updated successfully");
      void utils.host.getEnvironmentSummary.invalidate();
      void utils.host.getAllHosts.invalidate();
      void utils.host.getHostWithSources.invalidate();
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to update host: ${error.message}`);
    },
  });

  const isPending =
    createHostMutation.isPending || updateHostMutation.isPending;

  const toggleSection = (section: "ports" | "notes" | "vulnerabilities") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addPort = () => {
    setFormData((prev) => ({
      ...prev,
      ports: [
        ...prev.ports,
        { id: generateId(), number: "", protocol: "tcp", state: "open" },
      ],
    }));
    setExpandedSections((prev) => ({ ...prev, ports: true }));
  };

  const removePort = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      ports: prev.ports.filter((p) => p.id !== id),
    }));
  };

  const updatePort = (id: string, field: keyof PortEntry, value: string) => {
    setFormData((prev) => ({
      ...prev,
      ports: prev.ports.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addVulnerability = () => {
    setFormData((prev) => ({
      ...prev,
      vulnerabilities: [
        ...prev.vulnerabilities,
        {
          id: generateEntryId(),
          vid: "",
          title: "",
          description: "",
          severity: "medium",
          riskScore: 0,
          autoFilled: false,
        },
      ],
    }));
    setExpandedSections((prev) => ({ ...prev, vulnerabilities: true }));
  };

  const removeVulnerability = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.filter((v) => v.id !== id),
    }));
  };

  const updateVulnerability = (updated: VulnEntryData) => {
    setFormData((prev) => ({
      ...prev,
      vulnerabilities: prev.vulnerabilities.map((v) =>
        v.id === updated.id ? updated : v,
      ),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.ip.trim()) {
      newErrors.ip = "IP address is required";
    } else if (!IP_REGEX.test(formData.ip.trim())) {
      newErrors.ip = "Please enter a valid IPv4 address";
    }

    // Validate ports
    formData.ports.forEach((port, index) => {
      if (port.number) {
        const portNum = parseInt(port.number, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
          newErrors[`port_${index}`] = "Port must be between 1 and 65535";
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    // Determine the OS value
    const osValue = formData.os === "Other" ? formData.customOs : formData.os;

    // Build ports array (filter out empty ones)
    const validPorts = formData.ports
      .filter((p) => p.number.trim() !== "")
      .map((p) => ({
        number: parseInt(p.number, 10),
        protocol: p.protocol,
        state: p.state,
      }));

    // Build notes array (filter out empty lines)
    const notesArray = formData.notes
      .split("\n")
      .map((n) => n.trim())
      .filter((n) => n !== "");

    // Build vulnerabilities array (filter out entries with no VID)
    const validVulns = formData.vulnerabilities
      .filter((v) => v.vid.trim() !== "")
      .map((v) => ({
        vid: v.vid.trim(),
        title: v.title || undefined,
        description: v.description,
        riskScore: v.riskScore,
      }));

    if (mode === "create") {
      createHostMutation.mutate({
        ip: formData.ip.trim(),
        hostname: formData.hostname.trim() || undefined,
        os: osValue.trim() || undefined,
        osversion: formData.osversion.trim() || undefined,
        vulnerabilities: validVulns.length > 0 ? validVulns : undefined,
      });
    } else {
      updateHostMutation.mutate({
        ip: formData.ip.trim(),
        hostname: formData.hostname.trim() || undefined,
        os: osValue.trim() || undefined,
        osversion: formData.osversion.trim() || undefined,
        ports: validPorts.length > 0 ? validPorts : undefined,
        notes: notesArray.length > 0 ? notesArray : undefined,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      !isPending &&
      e.target instanceof HTMLInputElement
    ) {
      handleSubmit();
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={onCancel}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {mode === "create" ? "Add New Host" : "Edit Host"}
          </h2>
          <p className="text-sm text-gray-400">
            {mode === "create"
              ? "Add a host to your environment for vulnerability tracking"
              : "Update host information and configuration"}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6">
        <div className="space-y-5">
          {/* === BASIC INFORMATION SECTION === */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Basic Information
            </h3>

            {/* IP Address Field */}
            <div className="space-y-2">
              <Label
                htmlFor="ip-address"
                className="flex items-center gap-2 text-gray-200"
              >
                <Globe className="h-4 w-4 text-violet-400" />
                IP Address <span className="text-red-400">*</span>
              </Label>
              <Input
                id="ip-address"
                value={formData.ip}
                onChange={(e) =>
                  setFormData({ ...formData, ip: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="192.168.1.100"
                className={cn(
                  "border-gray-700 bg-gray-900 font-mono text-white placeholder:text-gray-500",
                  errors.ip && "border-red-500",
                  mode === "edit" && "cursor-not-allowed opacity-60"
                )}
                autoFocus={mode === "create"}
                disabled={mode === "edit"}
              />
              <p className="text-xs text-gray-400">
                {mode === "edit"
                  ? "IP address cannot be changed"
                  : "The IPv4 address of the host (e.g., 192.168.1.100)"}
              </p>
              {errors.ip && <p className="text-xs text-red-400">{errors.ip}</p>}
            </div>

            {/* Hostname Field */}
            <div className="space-y-2">
              <Label
                htmlFor="hostname"
                className="flex items-center gap-2 text-gray-200"
              >
                <Server className="h-4 w-4 text-violet-400" />
                Hostname
              </Label>
              <Input
                id="hostname"
                value={formData.hostname}
                onChange={(e) =>
                  setFormData({ ...formData, hostname: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="web-server-01"
                className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-400">
                Optional hostname or friendly name for the host
              </p>
            </div>

            {/* Operating System Field with Dropdown */}
            <div className="space-y-2">
              <Label
                htmlFor="os"
                className="flex items-center gap-2 text-gray-200"
              >
                <Monitor className="h-4 w-4 text-violet-400" />
                Operating System
              </Label>
              <Select
                value={formData.os}
                onValueChange={(value) =>
                  setFormData({ ...formData, os: value, customOs: "" })
                }
              >
                <SelectTrigger className="border-gray-700 bg-gray-900 text-white">
                  <SelectValue placeholder="Select operating system" />
                </SelectTrigger>
                <SelectContent className="border-gray-700 bg-gray-900">
                  {COMMON_OS_OPTIONS.map((os) => (
                    <SelectItem
                      key={os.value}
                      value={os.value}
                      className="text-white hover:bg-gray-800"
                    >
                      {os.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.os === "Other" && (
                <Input
                  value={formData.customOs}
                  onChange={(e) =>
                    setFormData({ ...formData, customOs: e.target.value })
                  }
                  placeholder="Enter custom OS name"
                  className="mt-2 border-gray-700 bg-gray-900 text-white placeholder:text-gray-500"
                />
              )}
              <p className="text-xs text-gray-400">
                Select the operating system or choose Other for custom entry
              </p>
            </div>

            {/* OS Version Field */}
            <div className="space-y-2">
              <Label
                htmlFor="osversion"
                className="flex items-center gap-2 text-gray-200"
              >
                <Hash className="h-4 w-4 text-violet-400" />
                OS Version
              </Label>
              <Input
                id="osversion"
                value={formData.osversion}
                onChange={(e) =>
                  setFormData({ ...formData, osversion: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="22.04 LTS"
                className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-400">
                Optional version of the operating system
              </p>
            </div>
          </div>

          {/* === PORTS SECTION (Collapsible) === */}
          <div className="border-t border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => toggleSection("ports")}
              className="flex w-full items-center justify-between py-2 text-left"
            >
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-gray-200">
                  Ports ({formData.ports.length})
                </span>
              </div>
              {expandedSections.ports ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.ports && (
              <div className="mt-3 space-y-3">
                {formData.ports.map((port, index) => (
                  <div
                    key={port.id}
                    className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/50 p-3"
                  >
                    <div className="flex-1">
                      <Input
                        type="number"
                        value={port.number}
                        onChange={(e) =>
                          updatePort(port.id, "number", e.target.value)
                        }
                        placeholder="Port"
                        min={1}
                        max={65535}
                        className="border-gray-700 bg-gray-900 text-white placeholder:text-gray-500"
                      />
                      {errors[`port_${index}`] && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors[`port_${index}`]}
                        </p>
                      )}
                    </div>
                    <Select
                      value={port.protocol}
                      onValueChange={(value) =>
                        updatePort(port.id, "protocol", value)
                      }
                    >
                      <SelectTrigger className="w-24 border-gray-700 bg-gray-900 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-700 bg-gray-900">
                        {PROTOCOL_OPTIONS.map((p) => (
                          <SelectItem
                            key={p.value}
                            value={p.value}
                            className="text-white hover:bg-gray-800"
                          >
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={port.state}
                      onValueChange={(value) =>
                        updatePort(port.id, "state", value)
                      }
                    >
                      <SelectTrigger className="w-28 border-gray-700 bg-gray-900 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-gray-700 bg-gray-900">
                        {PORT_STATE_OPTIONS.map((s) => (
                          <SelectItem
                            key={s.value}
                            value={s.value}
                            className="text-white hover:bg-gray-800"
                          >
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      type="button"
                      onClick={() => removePort(port.id)}
                      className="rounded p-2 text-gray-400 hover:bg-gray-700 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPort}
                  className="border-dashed border-gray-600 text-gray-400 hover:border-violet-500 hover:text-violet-400"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Port
                </Button>
              </div>
            )}
          </div>

          {/* === VULNERABILITIES SECTION (Collapsible) === */}
          <div className="border-t border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => toggleSection("vulnerabilities")}
              className="flex w-full items-center justify-between py-2 text-left"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-gray-200">
                  Vulnerabilities ({formData.vulnerabilities.length})
                </span>
              </div>
              {expandedSections.vulnerabilities ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.vulnerabilities && (
              <div className="mt-3 space-y-3">
                {formData.vulnerabilities.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No vulnerabilities added. Add CVE IDs to associate
                    vulnerabilities with this host.
                  </p>
                )}
                {formData.vulnerabilities.map((vuln, i) => (
                  <VulnerabilityEntryRow
                    key={vuln.id}
                    entry={vuln}
                    onChange={updateVulnerability}
                    onRemove={() => removeVulnerability(vuln.id)}
                    compact
                    index={i}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVulnerability}
                  className="border-dashed border-gray-600 text-gray-400 hover:border-violet-500 hover:text-violet-400"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add Vulnerability
                </Button>
              </div>
            )}
          </div>

          {/* === NOTES SECTION (Collapsible) === */}
          <div className="border-t border-gray-700 pt-4">
            <button
              type="button"
              onClick={() => toggleSection("notes")}
              className="flex w-full items-center justify-between py-2 text-left"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-gray-200">Notes</span>
              </div>
              {expandedSections.notes ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedSections.notes && (
              <div className="mt-3">
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Add notes about this host (one per line)..."
                  rows={4}
                  className="w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Each line will be saved as a separate note
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-3 border-t border-gray-700 pt-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Host"
              : "Update Host"}
          </Button>
        </div>
      </div>
    </div>
  );
};

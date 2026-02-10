import React, { useState, useMemo } from "react";
import { api } from "~/utils/api";
import {
  Cpu,
  HardDrive,
  Server,
  Package,
  Users,
  Network,
  Shield,
  AlertTriangle,
  Activity,
  Key,
} from "lucide-react";
import { cn } from "~/components/lib/utils";
import { SECTION_HEADER } from "~/utils/themeConstants";
import SoftwareInventory from "./SoftwareInventory";
import SystemFingerprint from "./SystemFingerprint";
import UserAccounts from "./UserAccounts";
import type { HostPageData, SystemSubTab } from "./types";

interface HostSystemInfoProps {
  host: HostPageData;
  activeSubTab?: SystemSubTab;
  onSubTabChange?: (tab: SystemSubTab) => void;
}

export const HostSystemInfo: React.FC<HostSystemInfoProps> = ({
  host,
  activeSubTab,
  onSubTabChange,
}) => {
  const [localTab, setLocalTab] = useState<SystemSubTab>("overview");
  const activeTab = activeSubTab ?? localTab;
  const setActiveTab = onSubTabChange ?? setLocalTab;

  // Fetch enhanced data for overview
  const { data: softwareInventory } =
    api.host.getHostSoftwareInventory.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip && activeTab === "overview", staleTime: 60000 },
    );

  const { data: systemFingerprint } =
    api.host.getHostSystemFingerprint.useQuery(
      { ip: host.ip },
      { enabled: !!host.ip && activeTab === "overview", staleTime: 60000 },
    );

  const { data: softwareStats } = api.host.getHostSoftwareStats.useQuery(
    { ip: host.ip },
    { enabled: !!host.ip && activeTab === "overview", staleTime: 60000 },
  );

  const metrics = useMemo(() => {
    const packages =
      softwareInventory?.package_count || softwareStats?.total_packages || 0;
    const users = systemFingerprint?.fingerprint?.users?.users?.length || 0;
    const groups = systemFingerprint?.fingerprint?.users?.groups?.length || 0;
    const networkInterfaces =
      systemFingerprint?.fingerprint?.network?.interfaces?.length || 0;
    const cpuCores = systemFingerprint?.fingerprint?.hardware?.cpu?.cores || 0;
    const totalMemoryGB =
      systemFingerprint?.fingerprint?.hardware?.memory?.total_gb || 0;
    const storageDevices =
      systemFingerprint?.fingerprint?.hardware?.storage?.length || 0;
    const certificates =
      systemFingerprint?.fingerprint?.certificates?.length || 0;

    const servicesArray = Array.isArray(
      systemFingerprint?.fingerprint?.services,
    )
      ? systemFingerprint.fingerprint.services
      : [];
    const runningServices = servicesArray.filter(
      (s: { status: string }) =>
        s.status?.toLowerCase() === "running" ||
        s.status?.toLowerCase() === "active",
    ).length;
    const totalServices = servicesArray.length;

    const architectures = softwareStats?.architectures
      ? Object.keys(softwareStats.architectures).length
      : 0;
    const publishers = softwareStats?.publishers
      ? Object.keys(softwareStats.publishers).length
      : 0;

    return {
      packages,
      users,
      groups,
      networkInterfaces,
      cpuCores,
      totalMemoryGB,
      storageDevices,
      certificates,
      runningServices,
      totalServices,
      architectures,
      publishers,
    };
  }, [softwareInventory, systemFingerprint, softwareStats]);

  const subTabs: Array<{ id: SystemSubTab; label: string; icon: typeof Server }> = [
    { id: "overview", label: "Overview", icon: Server },
    { id: "software", label: "Software", icon: Package },
    { id: "fingerprint", label: "Fingerprint", icon: Cpu },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 rounded-lg border border-violet-500/10 bg-gray-900/30 p-1">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-gray-500 hover:text-gray-300",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Metric strip */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
            <MiniMetric icon={<AlertTriangle className="h-3.5 w-3.5 text-red-400" />} label="Vulns" value={host.vulnerabilityCount} />
            <MiniMetric icon={<Package className="h-3.5 w-3.5 text-blue-400" />} label="Packages" value={metrics.packages} />
            <MiniMetric icon={<Users className="h-3.5 w-3.5 text-violet-400" />} label="Users" value={metrics.users} />
            <MiniMetric icon={<Activity className="h-3.5 w-3.5 text-emerald-400" />} label="Services" value={`${metrics.runningServices}/${metrics.totalServices}`} />
            <MiniMetric icon={<Network className="h-3.5 w-3.5 text-cyan-400" />} label="Interfaces" value={metrics.networkInterfaces} />
            <MiniMetric icon={<Key className="h-3.5 w-3.5 text-yellow-400" />} label="Certs" value={metrics.certificates} />
          </div>

          {/* Hardware + Security */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Hardware */}
            <div className="scanner-section scanner-section-padding">
              <h4 className={`${SECTION_HEADER} mb-3`}>Hardware</h4>
              <div className="space-y-2">
                <InfoRow icon={<Cpu className="h-3.5 w-3.5" />} label="CPU" value={metrics.cpuCores > 0 ? `${metrics.cpuCores} cores` : "N/A"} />
                <InfoRow icon={<HardDrive className="h-3.5 w-3.5" />} label="Memory" value={metrics.totalMemoryGB > 0 ? `${metrics.totalMemoryGB.toFixed(1)} GB` : "N/A"} />
                <InfoRow icon={<HardDrive className="h-3.5 w-3.5" />} label="Storage" value={metrics.storageDevices > 0 ? `${metrics.storageDevices} device${metrics.storageDevices > 1 ? "s" : ""}` : "N/A"} />
                <InfoRow icon={<Network className="h-3.5 w-3.5" />} label="Network" value={metrics.networkInterfaces > 0 ? `${metrics.networkInterfaces} interface${metrics.networkInterfaces > 1 ? "s" : ""}` : "N/A"} />
              </div>
            </div>

            {/* Security */}
            <div className="scanner-section scanner-section-padding">
              <h4 className={`${SECTION_HEADER} mb-3`}>Security</h4>
              <div className="space-y-2">
                <InfoRow icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Vulnerabilities" value={host.vulnerabilityCount === 0 ? "None" : String(host.vulnerabilityCount)} valueColor={host.vulnerabilityCount > 0 ? "text-red-400" : "text-emerald-400"} />
                <InfoRow icon={<Users className="h-3.5 w-3.5" />} label="Accounts" value={`${metrics.users} users, ${metrics.groups} groups`} />
                <InfoRow icon={<Key className="h-3.5 w-3.5" />} label="Certificates" value={String(metrics.certificates)} />
                <InfoRow icon={<Shield className="h-3.5 w-3.5" />} label="Attack surface" value={`${metrics.networkInterfaces} interfaces`} />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <QuickAction
              icon={<Package className="h-4 w-4 text-violet-400" />}
              title={`${metrics.packages} Packages`}
              subtitle="Software inventory"
              onClick={() => setActiveTab("software")}
            />
            <QuickAction
              icon={<Cpu className="h-4 w-4 text-emerald-400" />}
              title="System Fingerprint"
              subtitle={metrics.cpuCores > 0 ? `${metrics.cpuCores} cores, ${metrics.totalMemoryGB.toFixed(1)}GB` : "Hardware details"}
              onClick={() => setActiveTab("fingerprint")}
            />
            <QuickAction
              icon={<Users className="h-4 w-4 text-orange-400" />}
              title={`${metrics.users} Users`}
              subtitle="Accounts & groups"
              onClick={() => setActiveTab("users")}
            />
          </div>
        </div>
      )}

      {activeTab === "software" && <SoftwareInventory hostIp={host.ip} />}
      {activeTab === "fingerprint" && <SystemFingerprint hostIp={host.ip} />}
      {activeTab === "users" && <UserAccounts hostIp={host.ip} />}
    </div>
  );
};

// ─── Sub-components ─────────────────────────────────────────────────────────

function MiniMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="scanner-section flex items-center gap-2 px-3 py-2">
      {icon}
      <div>
        <div className="text-sm font-semibold text-white">{value}</div>
        <div className="text-[10px] text-gray-500">{label}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value, valueColor }: { icon: React.ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <span className={cn("font-medium", valueColor ?? "text-gray-300")}>{value}</span>
    </div>
  );
}

function QuickAction({ icon, title, subtitle, onClick }: { icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg border border-violet-500/10 bg-gray-900/30 p-3 text-left transition-colors hover:border-violet-500/20 hover:bg-gray-900/50"
    >
      {icon}
      <div className="min-w-0">
        <div className="text-xs font-medium text-gray-300">{title}</div>
        <div className="truncate text-[10px] text-gray-500">{subtitle}</div>
      </div>
    </button>
  );
}

export default HostSystemInfo;

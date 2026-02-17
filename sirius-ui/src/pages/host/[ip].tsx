/**
 * Host Detail Page — v4 Orchestrator
 *
 * Pure orchestration: hooks provide data, components render it.
 * All data fetching, deduplication, and persistence live in hooks.
 *
 * Page wrapper follows the standard v4 pattern:
 *   relative z-20 -mt-14 space-y-6
 * matching Dashboard, Scanner, etc.
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import Layout from "~/components/Layout";
import { VulnerabilityTable } from "~/components/VulnerabilityTable";
import { columns } from "~/components/VulnerabilityTableColumns";
import { SourceBadge } from "~/components/shared/SourceBadge";
import { Badge } from "~/components/lib/ui/badge";
import HostHeader from "~/components/host/HostHeader";
import HostTabs from "~/components/host/HostTabs";
import HostOverview from "~/components/host/HostOverview";
import HostSystemInfo from "~/components/host/HostSystemInfo";
import HostNetwork from "~/components/host/HostNetwork";
import HostHistory from "~/components/host/HostHistory";
import { HostForm } from "~/components/environment/HostForm";
import { useHostData } from "~/hooks/useHostData";
import { useHostPersistence } from "~/hooks/useHostPersistence";

const HostDetailsPage = () => {
  const router = useRouter();
  const ip = router.query.ip as string | undefined;

  const { hostData, vulnerabilities, severityCounts, editFormData, isLoading, isError, refetch } = useHostData(ip);
  const { state: prefs, setActiveTab, setSystemSubTab } = useHostPersistence(ip);
  const [isEditMode, setIsEditMode] = useState(false);

  // Enhanced columns with source attribution
  const enhancedColumns = useMemo(() => [
    ...columns,
    {
      accessorKey: "sources",
      header: "Sources",
      cell: ({ row }: { row: { original: { sources?: string[] } } }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.sources?.map((s) => (
            <SourceBadge key={s} source={s} />
          )) ?? <Badge variant="secondary" className="text-xs">Unknown</Badge>}
        </div>
      ),
    },
  ], []);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <span className="ml-2 text-sm text-gray-400">Loading host…</span>
        </div>
      </Layout>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────
  if (isError || !hostData) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg py-20 text-center">
          <h2 className="mb-2 text-lg font-semibold text-white">Host Not Found</h2>
          <p className="mb-6 text-sm text-gray-500">Could not find host with IP: {ip}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.back()} className="rounded-md border border-violet-500/20 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Go Back</button>
            <button onClick={() => void router.push("/environment")} className="rounded-md bg-violet-500 px-4 py-2 text-sm text-white hover:bg-violet-600">All Hosts</button>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Edit mode ───────────────────────────────────────────────────────────
  if (isEditMode) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <HostForm mode="edit" initialData={editFormData} onCancel={() => setIsEditMode(false)} onSuccess={() => { setIsEditMode(false); void refetch(); }} />
        </div>
      </Layout>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="relative z-20 -mt-14 space-y-6">
        <HostHeader host={hostData} onEdit={() => setIsEditMode(true)} />
        <HostTabs activeTab={prefs.activeTab} onTabChange={setActiveTab} vulnerabilityCount={hostData.vulnerabilityCount} portCount={hostData.portCount} />

        {prefs.activeTab === "overview" && <HostOverview host={hostData} vulnerabilities={vulnerabilities} />}

        {prefs.activeTab === "vulnerabilities" && (
          <div className="scanner-table-wrapper">
            <VulnerabilityTable columns={enhancedColumns} data={vulnerabilities} onRowClick={(vuln) => {
              const id = vuln.cve || vuln.id;
              if (id) void router.push(`/vulnerability?id=${encodeURIComponent(id as string)}`);
            }} />
          </div>
        )}

        {prefs.activeTab === "system" && <HostSystemInfo host={hostData} activeSubTab={prefs.systemSubTab} onSubTabChange={setSystemSubTab} />}
        {prefs.activeTab === "network" && <HostNetwork host={hostData} />}
        {prefs.activeTab === "history" && <HostHistory hostIp={ip as string} />}
      </div>
    </Layout>
  );
};

export default HostDetailsPage;

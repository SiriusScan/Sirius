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
import { columns, type VulnTableData } from "~/components/VulnerabilityTableColumns";
import { FindingEvidence } from "~/components/host/FindingEvidence";
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
  const ip = typeof router.query.ip === "string" ? router.query.ip : undefined;

  const { hostData, vulnerabilities, editFormData, isLoading, isError, refetch } = useHostData(ip);
  const { state: prefs, setActiveTab, setSystemSubTab } = useHostPersistence(ip);
  const [isEditMode, setIsEditMode] = useState(false);

  const findingsById = useMemo(
    () => new Map(vulnerabilities.map((finding) => [finding.cve, finding])),
    [vulnerabilities],
  );

  const enhancedColumns = useMemo(() => [
    ...columns,
    {
      accessorKey: "sources",
      header: "Source evidence",
      cell: ({ row }: { row: { original: VulnTableData } }) => {
        const finding = findingsById.get(row.original.cve);
        return finding ? <FindingEvidence finding={finding} /> : null;
      },
    },
  ], [findingsById]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (!router.isReady || (ip && isLoading)) {
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
          <h2 className="mb-2 text-lg font-semibold text-white">Host data unavailable</h2>
          <p className="mb-6 text-sm text-gray-400">
            {ip ? `Could not load stored host data for ${ip}.` : "No host address was provided."}
          </p>
          <div className="flex justify-center gap-3">
            {ip && <button onClick={() => void refetch()} className="rounded-md border border-violet-500/20 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">Retry</button>}
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

        {prefs.activeTab === "overview" && (
          <HostOverview
            host={hostData}
            vulnerabilities={vulnerabilities}
            onTabChange={setActiveTab}
          />
        )}

        {prefs.activeTab === "vulnerabilities" && (
          vulnerabilities.length > 0 ? (
            <div className="scanner-table-wrapper">
              <VulnerabilityTable
                columns={enhancedColumns}
                data={vulnerabilities}
                onRowClick={(vuln) => {
                  void router.push(`/vulnerability?id=${encodeURIComponent(vuln.cve)}`);
                }}
              />
            </div>
          ) : (
            <div className="scanner-section scanner-section-padding">
              <p className="text-sm text-gray-300">No findings recorded for this host.</p>
              <p className="mt-1 text-xs text-gray-400">Assessment coverage is unknown.</p>
            </div>
          )
        )}

        {prefs.activeTab === "system" && <HostSystemInfo host={hostData} activeSubTab={prefs.systemSubTab} onSubTabChange={setSystemSubTab} />}
        {prefs.activeTab === "network" && <HostNetwork host={hostData} />}
        {prefs.activeTab === "history" && <HostHistory hostIp={ip as string} />}
      </div>
    </Layout>
  );
};

export default HostDetailsPage;

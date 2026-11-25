/**
 * Host page.
 *
 * Pure orchestration: useHostData brings the server's host summary (risk,
 * counts, findings with clean summaries, open ports, freshness), the
 * components render it. The active tab lives in `?tab=` (ADR-6):
 * overview | vulnerabilities | system | network | history.
 *
 * Page wrapper follows the standard pattern: relative z-20 -mt-14 space-y-6.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Radar, RotateCw } from "lucide-react";
import Layout from "~/components/Layout";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { EmptyState } from "~/components/shared/EmptyState";
import HostHeader from "~/components/host/HostHeader";
import HostTabs, { useHostTab } from "~/components/host/HostTabs";
import HostOverview from "~/components/host/HostOverview";
import HostVulnerabilities from "~/components/host/HostVulnerabilities";
import HostSystemInfo from "~/components/host/HostSystemInfo";
import HostNetwork from "~/components/host/HostNetwork";
import HostHistory from "~/components/host/HostHistory";
import { useHostAgentData } from "~/components/host/useHostAgentData";
import { noteLines, realText } from "~/components/host/hostModel";
import { HostForm } from "~/components/environment/HostForm";
import { useHostData } from "~/hooks/useHostData";

function HostSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading host">
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="scanner-section space-y-3 p-6">
            <Skeleton className="h-4 w-28 bg-gray-800" />
            <Skeleton className="h-12 w-20 bg-gray-800" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="scanner-section space-y-3 p-6 lg:col-span-2">
          <Skeleton className="h-4 w-32 bg-gray-800" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-full bg-gray-800" />
          ))}
        </div>
        <div className="scanner-section space-y-3 p-5">
          <Skeleton className="h-4 w-24 bg-gray-800" />
          <Skeleton className="h-20 w-full bg-gray-800" />
        </div>
      </div>
    </div>
  );
}

const HostDetailsPage = () => {
  const router = useRouter();
  const ip = typeof router.query.ip === "string" ? router.query.ip : undefined;

  const { hostData, editFormData, isLoading, isError, refetch } = useHostData(ip);
  const agent = useHostAgentData(ip, hostData?.agentId ?? 0);
  const tab = useHostTab();
  const [isEditMode, setIsEditMode] = useState(false);

  // Leaving a host (or opening another) ends edit mode.
  useEffect(() => setIsEditMode(false), [ip]);

  // ── Loading ─────────────────────────────────────────────────────────────
  if (!router.isReady || (ip && isLoading)) {
    return (
      <Layout title={ip ?? "Host"}>
        <div className="relative z-20 -mt-14 space-y-6">
          <HostHeader ip={ip ?? ""} host={null} />
          <HostSkeleton />
        </div>
      </Layout>
    );
  }

  // ── Couldn't load ───────────────────────────────────────────────────────
  if (isError) {
    return (
      <Layout title={ip ?? "Host"}>
        <div className="mx-auto max-w-2xl py-16">
          <EmptyState
            variant="error"
            title="Couldn't load this host"
            reason="Sirius didn't get an answer for this address. The rest of the app still works."
            primary={{ label: "Retry", icon: RotateCw, onClick: () => void refetch() }}
            secondary={{ label: "Back to Environment", href: "/environment" }}
          />
        </div>
      </Layout>
    );
  }

  // ── No address ──────────────────────────────────────────────────────────
  if (!ip) {
    return (
      <Layout title="Host">
        <div className="mx-auto max-w-2xl py-16">
          <EmptyState
            variant="not-found"
            title="No host address"
            reason="No host address was provided."
            primary={{ label: "Back to Environment", href: "/environment" }}
          />
        </div>
      </Layout>
    );
  }

  // ── Not in inventory ────────────────────────────────────────────────────
  if (!hostData) {
    const address = ip ?? "";
    return (
      <Layout>
        <div className="mx-auto max-w-2xl py-16">
          <EmptyState
            variant="not-found"
            icon={Radar}
            title={`${address} isn't in your inventory`}
            reason="No scan has reached this address yet. Scanned hosts are added automatically, so this only happens for addresses you typed or linked."
            primary={{
              label: `Scan ${address}`,
              icon: Radar,
              href: `/scanner?target=${encodeURIComponent(address)}`,
            }}
            secondary={{
              label: "Add it by hand",
              href: `/environment?add=${encodeURIComponent(address)}`,
            }}
          />
        </div>
      </Layout>
    );
  }

  const pageTitle = realText(hostData.hostname) ?? hostData.ip;

  // ── Edit mode ───────────────────────────────────────────────────────────
  if (isEditMode) {
    return (
      <Layout title={`Edit ${pageTitle}`}>
        <div className="container mx-auto px-4 py-6">
          <HostForm
            mode="edit"
            initialData={editFormData && { ...editFormData, notes: noteLines(editFormData.notes) }}
            onCancel={() => setIsEditMode(false)}
            onSuccess={() => {
              setIsEditMode(false);
              void refetch();
            }}
          />
        </div>
      </Layout>
    );
  }

  // ── Main render ─────────────────────────────────────────────────────────
  return (
    <Layout title={pageTitle}>
      <div className="relative z-20 -mt-14 space-y-6">
        <HostHeader
          ip={hostData.ip}
          host={hostData}
          onEdit={() => setIsEditMode(true)}
          tabs={<HostTabs vulnerabilityCount={hostData.openFindings} portCount={hostData.openPorts.length} />}
        />

        {tab === "overview" && <HostOverview host={hostData} agent={agent} />}
        {tab === "vulnerabilities" && <HostVulnerabilities host={hostData} />}
        {tab === "system" && <HostSystemInfo host={hostData} agent={agent} />}
        {tab === "network" && <HostNetwork host={hostData} agent={agent} />}
        {tab === "history" && (
          <HostHistory hostIp={hostData.ip} sourceFreshness={hostData.freshness.sources} />
        )}
      </div>
    </Layout>
  );
};

export default HostDetailsPage;

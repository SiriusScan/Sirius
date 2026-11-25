/**
 * Repositories (R10): network script repositories (the scanner's ValKey
 * nse:repo-manifest) and agent template repositories (the API) in one
 * table, using the existing store and repositories procedures.
 *
 * Script repositories record only a name and URL: the scanner syncs every
 * listed one when it starts, so they show no branch, sync time or switch,
 * and "Synced" means the scanner's manifest holds scripts from them.
 */

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, GitBranch, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/lib/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import { api } from "~/utils/api";
import { formatDateTime } from "~/utils/formatDateTime";
import {
  NSE_MANIFEST_KEY,
  displayRepositoryUrl,
  manifestRepositoryCounts,
  nextRepositoryPriority,
  parseNseManifest,
  repositoryRows,
  validateRepositoryInput,
  type RepositoryKind,
  type RepositoryRow,
  type RepositoryStatusKey,
} from "./scanningModel";
import { Chip, ConfirmDialog, HeaderButton, SectionError, SettingsSection, SkeletonRows, TD, TH, TR } from "./ui";

const KIND_LABEL: Record<RepositoryKind, string> = {
  network: "Network scripts",
  agent: "Agent templates",
};

const STATUS: Record<RepositoryStatusKey, { label: string; className: string }> = {
  synced: { label: "Synced", className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
  syncing: { label: "Syncing", className: "border-violet-500/30 bg-violet-500/10 text-violet-300" },
  error: { label: "Sync failed", className: "border-red-500/30 bg-red-500/10 text-red-300" },
  never_synced: { label: "Never synced", className: "border-gray-600 bg-gray-800/70 text-gray-400" },
  not_synced: { label: "Not synced", className: "border-gray-600 bg-gray-800/70 text-gray-400" },
};

function StatusPill({ row }: { row: RepositoryRow }) {
  const s = STATUS[row.status];
  const Icon = row.status === "syncing" ? Loader2 : row.status === "error" ? AlertCircle : row.status === "synced" ? CheckCircle2 : null;
  const title =
    row.status === "error"
      ? row.error ?? "The last sync failed."
      : row.kind === "network"
        ? row.status === "synced"
          ? "The scanner's script manifest holds scripts from this repository."
          : "The scanner syncs script repositories when it starts."
        : undefined;
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] leading-4",
        s.className,
      )}
    >
      {Icon && <Icon className={cn("h-3 w-3", row.status === "syncing" && "animate-spin")} aria-hidden />}
      {s.label}
    </span>
  );
}

interface AddForm {
  kind: RepositoryKind;
  name: string;
  url: string;
  branch: string;
}

const EMPTY_FORM: AddForm = { kind: "network", name: "", url: "", branch: "main" };

export function RepositoriesSection() {
  const utils = api.useContext();
  const nseReposQuery = api.store.getNseRepositories.useQuery(undefined, { staleTime: 30_000 });
  const manifestQuery = api.store.getValue.useQuery(
    { key: NSE_MANIFEST_KEY },
    { staleTime: 60_000, refetchOnWindowFocus: false },
  );
  const agentReposQuery = api.repositories.list.useQuery(undefined, {
    staleTime: 10_000,
    // Follow a running sync until it settles.
    refetchInterval: (data) => (data?.some((r) => r.status === "syncing") ? 3_000 : false),
  });

  const nseCounts = useMemo(
    () => (manifestQuery.data ? manifestRepositoryCounts(parseNseManifest(manifestQuery.data)) : null),
    [manifestQuery.data],
  );
  const nseRepos = (nseReposQuery.data as { repositories?: { name: string; url: string }[] } | undefined)?.repositories;
  const rows = useMemo(
    () => repositoryRows(nseRepos, nseCounts, agentReposQuery.data),
    [nseRepos, nseCounts, agentReposQuery.data],
  );

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<AddForm>(EMPTY_FORM);
  const [touched, setTouched] = useState(false);
  const [toRemove, setToRemove] = useState<RepositoryRow | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const errors = validateRepositoryInput(form);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (!adding) {
      setForm(EMPTY_FORM);
      setTouched(false);
    }
  }, [adding]);

  const refreshNse = () => {
    void utils.store.getNseRepositories.invalidate();
  };
  const refreshAgent = () => {
    void utils.repositories.list.invalidate();
    void utils.agentTemplates.getTemplates.invalidate();
  };

  const addNse = api.store.addNseRepository.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Repository added", { description: "The scanner syncs it the next time it starts." });
        setAdding(false);
        refreshNse();
      } else toast.error("Couldn't add the repository", { description: result.error });
    },
    onError: (error) => toast.error("Couldn't add the repository", { description: error.message }),
  });
  const addAgent = api.repositories.add.useMutation({
    onSuccess: () => {
      toast.success("Repository added");
      setAdding(false);
      refreshAgent();
    },
    onError: (error) => toast.error("Couldn't add the repository", { description: error.message }),
  });
  const removeNse = api.store.removeNseRepository.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Repository removed");
        setToRemove(null);
        refreshNse();
      } else toast.error("Couldn't remove the repository", { description: result.error });
    },
    onError: (error) => toast.error("Couldn't remove the repository", { description: error.message }),
  });
  const removeAgent = api.repositories.delete.useMutation({
    onSuccess: () => {
      toast.success("Repository removed");
      setToRemove(null);
      refreshAgent();
    },
    onError: (error) => toast.error("Couldn't remove the repository", { description: error.message }),
  });
  const updateAgent = api.repositories.update.useMutation({
    onSuccess: () => refreshAgent(),
    onError: (error) => toast.error("Couldn't update the repository", { description: error.message }),
  });
  const syncAgent = api.repositories.sync.useMutation({
    onSuccess: () => {
      toast.success("Sync started");
      refreshAgent();
    },
    onError: (error) => toast.error("Couldn't start the sync", { description: error.message }),
    onSettled: () => setSyncingId(null),
  });

  const submitAdd = () => {
    setTouched(true);
    if (hasErrors) return;
    if (form.kind === "network") {
      addNse.mutate({ name: form.name.trim(), url: form.url.trim() });
    } else {
      addAgent.mutate({
        name: form.name.trim(),
        url: form.url.trim(),
        branch: form.branch.trim(),
        priority: nextRepositoryPriority(agentReposQuery.data),
        enabled: true,
      });
    }
  };

  const loading = nseReposQuery.isLoading || agentReposQuery.isLoading;
  const failed = nseReposQuery.isError && agentReposQuery.isError;
  const addBusy = addNse.isLoading || addAgent.isLoading;

  return (
    <SettingsSection
      icon={GitBranch}
      title="Repositories"
      actions={
        <HeaderButton icon={Plus} onClick={() => setAdding(true)}>
          Add repository
        </HeaderButton>
      }
    >
      {loading ? (
        <SkeletonRows rows={2} />
      ) : failed ? (
        <SectionError
          title="Couldn't load repositories"
          reason="Neither the store nor the Sirius API answered."
          onRetry={() => {
            void nseReposQuery.refetch();
            void agentReposQuery.refetch();
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          variant="no-data"
          size="compact"
          framed={false}
          title="No repositories"
          reason="Add a script or template repository to sync from."
          primary={{ label: "Add repository", icon: Plus, onClick: () => setAdding(true) }}
        />
      ) : (
        <div className="relative overflow-x-auto pb-1">
          <table className="w-full min-w-[860px] table-fixed">
            <colgroup>
              <col />
              <col className="w-[148px]" />
              <col className="w-[84px]" />
              <col className="w-[116px]" />
              <col className="w-[64px]" />
              <col className="w-[140px]" />
              <col className="w-[84px]" />
              <col className="w-[76px]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={TH}>Repository</th>
                <th scope="col" className={TH}>Type</th>
                <th scope="col" className={TH}>Branch</th>
                <th scope="col" className={TH}>Status</th>
                <th scope="col" className={TH}>Items</th>
                <th scope="col" className={TH}>Last sync</th>
                <th scope="col" className={TH}>Enabled</th>
                <th scope="col" className={TH}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isAgent = row.kind === "agent";
                const syncBusy = isAgent && (row.status === "syncing" || syncingId === row.id);
                return (
                  <tr key={row.key} className={TR}>
                    <td className={TD}>
                      <div className="truncate font-semibold text-white" title={row.name}>
                        {row.name}
                      </div>
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={row.url}
                        className="block truncate font-mono text-[11px] text-gray-500 hover:text-violet-300 hover:underline"
                      >
                        {displayRepositoryUrl(row.url)}
                      </a>
                    </td>
                    <td className={TD}>
                      <Chip>{KIND_LABEL[row.kind]}</Chip>
                    </td>
                    <td className={TD}>
                      {row.branch ? <Chip mono>{row.branch}</Chip> : <span className="text-gray-600">—</span>}
                    </td>
                    <td className={TD}>
                      <StatusPill row={row} />
                    </td>
                    <td className={cn(TD, "tabular-nums")}>
                      {row.items === null ? <span className="text-gray-600">—</span> : row.items.toLocaleString("en-US")}
                    </td>
                    <td className={cn(TD, "whitespace-nowrap")} title={row.lastSync ? formatDateTime(row.lastSync, "long") : undefined}>
                      {row.lastSync ? formatDateTime(row.lastSync) : <span className="text-gray-600">—</span>}
                    </td>
                    <td className={TD}>
                      {isAgent && row.enabled !== null ? (
                        <Switch
                          checked={row.enabled}
                          disabled={updateAgent.isLoading}
                          aria-label={`${row.enabled ? "Turn off" : "Turn on"} ${row.name}`}
                          onCheckedChange={(checked) => row.id && updateAgent.mutate({ id: row.id, enabled: checked })}
                        />
                      ) : (
                        <span className="text-gray-500" title="The scanner syncs every script repository it lists.">
                          Always
                        </span>
                      )}
                    </td>
                    <td className={cn(TD, "py-1.5 pr-2")}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={!isAgent || syncBusy}
                          title={
                            isAgent
                              ? syncBusy
                                ? "Syncing"
                                : `Sync ${row.name} now`
                              : "The scanner syncs script repositories when it starts"
                          }
                          aria-label={isAgent ? `Sync ${row.name}` : `${row.name} syncs when the scanner starts`}
                          onClick={() => {
                            if (!row.id) return;
                            setSyncingId(row.id);
                            syncAgent.mutate({ id: row.id });
                          }}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-violet-500/10 hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                        >
                          <RefreshCw className={cn("h-3.5 w-3.5", syncBusy && "animate-spin")} aria-hidden />
                        </button>
                        <button
                          type="button"
                          title={`Remove ${row.name}`}
                          aria-label={`Remove ${row.name}`}
                          onClick={() => setToRemove(row)}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!loading && (nseReposQuery.isError !== agentReposQuery.isError) && (
        <p role="alert" className="border-t border-violet-500/10 px-4 py-2 text-[11px] text-amber-300">
          {nseReposQuery.isError
            ? "Script repositories couldn't be read from the store."
            : "Agent template repositories couldn't be read from the Sirius API."}
        </p>
      )}

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent className="border-gray-700 bg-gray-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add repository</DialogTitle>
            <DialogDescription className="text-gray-400">
              {form.kind === "network"
                ? "A git repository of NSE scripts. The scanner syncs it the next time it starts."
                : "A git repository of agent templates. Sirius syncs it once it's added, and whenever you press sync."}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submitAdd();
            }}
          >
            <fieldset>
              <legend className="mb-1.5 text-sm text-gray-300">Type</legend>
              <div role="radiogroup" className="inline-flex rounded-md border border-gray-700 p-0.5">
                {(["network", "agent"] as const).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    role="radio"
                    aria-checked={form.kind === kind}
                    onClick={() => setForm((f) => ({ ...f, kind }))}
                    className={cn(
                      "rounded px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                      form.kind === kind ? "bg-violet-500/20 text-violet-200" : "text-gray-400 hover:text-gray-200",
                    )}
                  >
                    {KIND_LABEL[kind]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div className="space-y-1.5">
              <Label htmlFor="repo-name" className="text-gray-300">
                Name
              </Label>
              <Input
                id="repo-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder={form.kind === "network" ? "my-nse-scripts" : "My templates"}
                className="border-gray-700 bg-gray-950/60 text-white placeholder:text-gray-600"
                aria-invalid={touched && !!errors.name}
              />
              {touched && errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repo-url" className="text-gray-300">
                Repository URL
              </Label>
              <Input
                id="repo-url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                placeholder="https://github.com/org/repo.git"
                className="border-gray-700 bg-gray-950/60 font-mono text-white placeholder:text-gray-600"
                aria-invalid={touched && !!errors.url}
              />
              {touched && errors.url && <p className="text-xs text-red-400">{errors.url}</p>}
            </div>
            {form.kind === "agent" && (
              <div className="space-y-1.5">
                <Label htmlFor="repo-branch" className="text-gray-300">
                  Branch
                </Label>
                <Input
                  id="repo-branch"
                  value={form.branch}
                  onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                  className="border-gray-700 bg-gray-950/60 font-mono text-white"
                  aria-invalid={touched && !!errors.branch}
                />
                {touched && errors.branch && <p className="text-xs text-red-400">{errors.branch}</p>}
              </div>
            )}
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setAdding(false)} disabled={addBusy}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={addBusy || (touched && hasErrors)}>
                {addBusy ? "Adding…" : "Add repository"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(open) => !open && setToRemove(null)}
        title="Remove repository"
        description={
          toRemove?.kind === "agent" ? (
            <>
              Remove <span className="font-medium text-gray-200">{toRemove?.name}</span>? Sirius stops syncing its
              templates.
            </>
          ) : (
            <>
              Remove <span className="font-medium text-gray-200">{toRemove?.name}</span>? The scanner stops syncing it
              the next time it starts.
            </>
          )
        }
        confirmLabel="Remove repository"
        busy={removeNse.isLoading || removeAgent.isLoading}
        onConfirm={() => {
          if (!toRemove) return;
          if (toRemove.kind === "agent" && toRemove.id) removeAgent.mutate({ id: toRemove.id });
          else removeNse.mutate({ name: toRemove.name });
        }}
      />
    </SettingsSection>
  );
}

export default RepositoriesSection;

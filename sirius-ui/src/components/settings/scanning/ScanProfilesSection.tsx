/**
 * Scan profiles (R10): every profile with what it does, what it runs and
 * whether it ships with Sirius. A row opens the existing profile editor
 * (TemplateEditorTab) in place; system profiles open read-only there and can
 * be saved as a copy.
 */

import React, { useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Layers, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/lib/ui/button";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import TemplateEditorTab from "~/components/scanner/templates/TemplateEditorTab";
import { api } from "~/utils/api";
import {
  NSE_MANIFEST_KEY,
  parseNseManifest,
  profileChecks,
  sortProfiles,
} from "./scanningModel";
import {
  Chip,
  ConfirmDialog,
  HeaderButton,
  SectionError,
  SettingsSection,
  SkeletonRows,
  TD,
  TH,
  TR,
} from "./ui";

type Editing = { id?: string; name?: string } | null;

export function ScanProfilesSection() {
  const utils = api.useContext();
  const profilesQuery = api.templates.getTemplates.useQuery(undefined, { staleTime: 30_000 });
  // The light script manifest (not every script's code) is enough to tell
  // which script references still resolve.
  const manifestQuery = api.store.getValue.useQuery(
    { key: NSE_MANIFEST_KEY },
    { staleTime: 60_000, refetchOnWindowFocus: false },
  );
  const availableIds = useMemo(() => {
    if (manifestQuery.data === undefined || manifestQuery.data === null) return null;
    return Array.from(parseNseManifest(manifestQuery.data).keys());
  }, [manifestQuery.data]);

  const profiles = useMemo(() => sortProfiles(profilesQuery.data), [profilesQuery.data]);
  const [editing, setEditing] = useState<Editing>(null);
  const [toDelete, setToDelete] = useState<{ id: string; name: string } | null>(null);

  const deleteMutation = api.templates.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Profile deleted");
      setToDelete(null);
      void utils.templates.getTemplates.invalidate();
    },
    onError: (error) => toast.error("Couldn't delete the profile", { description: error.message }),
  });

  if (editing) {
    return (
      <SettingsSection
        icon={Layers}
        title={editing.name ? `Scan profiles · ${editing.name}` : "Scan profiles · New profile"}
        actions={
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs" onClick={() => setEditing(null)}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            All profiles
          </Button>
        }
      >
        <div className="px-4 pb-4">
          <TemplateEditorTab templateId={editing.id} onClose={() => setEditing(null)} />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      icon={Layers}
      title="Scan profiles"
      actions={
        <HeaderButton icon={Plus} onClick={() => setEditing({})}>
          New profile
        </HeaderButton>
      }
    >
      {profilesQuery.isLoading ? (
        <SkeletonRows rows={5} />
      ) : profilesQuery.isError ? (
        <SectionError
          title="Couldn't load scan profiles"
          reason="The Sirius API didn't answer. Profiles are unchanged."
          onRetry={() => void profilesQuery.refetch()}
        />
      ) : profiles.length === 0 ? (
        <EmptyState
          variant="no-data"
          size="compact"
          framed={false}
          title="No scan profiles"
          reason="Create a profile to choose which scripts a scan runs."
          primary={{ label: "New profile", onClick: () => setEditing({}), icon: Plus }}
        />
      ) : (
        <div className="relative overflow-x-auto pb-1">
          <table className="w-full min-w-[700px] table-fixed">
            <colgroup>
              <col className="w-[24%]" />
              <col />
              <col className="w-[180px]" />
              <col className="w-[92px]" />
              <col className="w-[76px]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className={TH}>Profile</th>
                <th scope="col" className={TH}>What it does</th>
                <th scope="col" className={TH}>Checks</th>
                <th scope="col" className={TH}>Type</th>
                <th scope="col" className={TH}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => {
                const checks = profileChecks(profile, availableIds);
                const isSystem = profile.type === "system";
                const open = () => setEditing({ id: profile.id, name: profile.name });
                return (
                  <tr
                    key={profile.id}
                    className={cn(TR, "cursor-pointer transition-colors hover:bg-violet-500/5")}
                    onClick={open}
                  >
                    <td className={cn(TD, "truncate font-semibold text-white")} title={profile.name}>
                      {profile.name}
                    </td>
                    <td className={cn(TD, "truncate text-gray-300")} title={profile.description || undefined}>
                      {profile.description || <span className="text-gray-500">—</span>}
                    </td>
                    <td className={cn(TD, "truncate tabular-nums")}>
                      {checks.label}
                      {checks.missing > 0 && (
                        <span
                          className="ml-1.5 text-amber-400"
                          title="Script references that no longer match a script in the library"
                        >
                          {checks.missing} missing
                        </span>
                      )}
                    </td>
                    <td className={TD}>
                      <Chip>{isSystem ? "System" : "Custom"}</Chip>
                    </td>
                    <td className={cn(TD, "py-1.5 pr-2")}>
                      <div className="flex items-center justify-end gap-1">
                        {!isSystem && (
                          <button
                            type="button"
                            title={`Delete ${profile.name}`}
                            aria-label={`Delete ${profile.name}`}
                            className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                            onClick={(e) => {
                              e.stopPropagation();
                              setToDelete({ id: profile.id, name: profile.name });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        )}
                        <button
                          type="button"
                          title={isSystem ? `View ${profile.name}` : `Edit ${profile.name}`}
                          aria-label={isSystem ? `View ${profile.name}` : `Edit ${profile.name}`}
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-violet-500/10 hover:text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40"
                          onClick={(e) => {
                            e.stopPropagation();
                            open();
                          }}
                        >
                          <ChevronRight className="h-4 w-4" aria-hidden />
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

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete scan profile"
        description={
          <>
            Delete <span className="font-medium text-gray-200">{toDelete?.name}</span>? This can&apos;t be undone.
          </>
        }
        confirmLabel="Delete profile"
        busy={deleteMutation.isLoading}
        onConfirm={() => toDelete && deleteMutation.mutate({ id: toDelete.id })}
      />
    </SettingsSection>
  );
}

export default ScanProfilesSection;

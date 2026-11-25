/**
 * Script and template library (R10): network scripts and agent templates in
 * one virtualised list view with a search. Ports, categories and authors are
 * read from each script's code (the synced manifest stores "*" for them);
 * a row opens the existing editor in place: ScriptNavigator for scripts,
 * TemplateViewer / TemplateBuilder for agent templates.
 */

import React, { useCallback, useMemo, useState } from "react";
import { ArrowLeft, FileCode2, Loader2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { cn } from "~/components/lib/utils";
import { EmptyState } from "~/components/shared/EmptyState";
import { SeverityTag } from "~/components/shared/SeverityTag";
import ScriptNavigator from "~/components/scanner/nmap/ScriptNavigator";
import { TemplateBuilder } from "~/components/scanner/templates/TemplateBuilder";
import { TemplateViewer } from "~/components/scanner/templates/TemplateViewer";
import { useUrlTab } from "~/hooks/useUrlTab";
import type { NmapScript } from "~/server/api/routers/store";
import type { AgentTemplate } from "~/types/agentTemplateTypes";
import type { TemplateFormState } from "~/types/templateBuilderTypes";
import { api } from "~/utils/api";
import { convertFormToYAML, generateTemplateFilename } from "~/utils/templateYaml";
import { LibraryList, type LibraryColumn } from "./LibraryList";
import {
  NSE_MANIFEST_KEY,
  filterRows,
  parseNseManifest,
  scriptRows,
  templateRows,
  type ScriptRow,
  type TemplateRow,
} from "./scanningModel";
import { Chip, ConfirmDialog, HeaderButton, SettingsSection, SkeletonRows } from "./ui";

const MODES = ["scripts", "templates"] as const;
type LibraryMode = (typeof MODES)[number];

/** Blank script for the editor's create mode. */
const BLANK_SCRIPT: NmapScript = {
  id: "",
  name: "",
  author: "",
  tags: [],
  description: "",
  code: "",
  protocol: "",
  path: "",
};

const SCRIPT_GRID = "minmax(180px,1.3fr) minmax(130px,0.8fr) minmax(200px,1.6fr) minmax(120px,0.8fr)";
const TEMPLATE_GRID = "minmax(220px,1.8fr) minmax(150px,0.9fr) minmax(90px,0.6fr) minmax(120px,0.8fr)";

function Chips({ values, max = 3 }: { values: readonly string[]; max?: number }) {
  if (values.length === 0) return <span className="text-gray-600">—</span>;
  const shown = values.slice(0, max);
  const more = values.length - shown.length;
  return (
    <div className="flex min-w-0 flex-nowrap items-center gap-1 overflow-hidden" title={values.join(", ")}>
      {shown.map((v) => (
        <Chip key={v}>{v}</Chip>
      ))}
      {more > 0 && <span className="shrink-0 text-[11px] text-gray-500">+{more}</span>}
    </div>
  );
}

const SCRIPT_COLUMNS: LibraryColumn<ScriptRow>[] = [
  {
    id: "script",
    header: "Script",
    cell: (row) => (
      <span className="block truncate font-mono text-xs font-medium text-gray-100" title={row.description || row.name}>
        {row.name}
      </span>
    ),
  },
  {
    id: "port",
    header: "Port",
    cell: (row) => (
      <span
        className={cn("block truncate tabular-nums", row.portIsPort ? "text-gray-300" : "text-gray-500")}
        title={row.portTitle}
      >
        {row.port}
      </span>
    ),
  },
  { id: "categories", header: "Categories", cell: (row) => <Chips values={row.categories} /> },
  {
    id: "repository",
    header: "Repository",
    cell: (row) => (row.repository ? <Chip>{row.repository}</Chip> : <span className="text-gray-600">—</span>),
  },
];

const TEMPLATE_COLUMNS: LibraryColumn<TemplateRow>[] = [
  {
    id: "template",
    header: "Template",
    cell: (row) => (
      <span className="block truncate" title={row.description || row.name}>
        <span className="font-medium text-gray-100">{row.name}</span>
        <span className="ml-2 font-mono text-[11px] text-gray-500">{row.id}</span>
      </span>
    ),
  },
  { id: "platforms", header: "Platforms", cell: (row) => <Chips values={row.platforms} /> },
  {
    id: "severity",
    header: "Severity",
    cell: (row) => (row.severity ? <SeverityTag severity={row.severity} /> : <span className="text-gray-600">—</span>),
  },
  {
    id: "source",
    header: "Source",
    cell: (row) => (row.source ? <Chip>{row.source}</Chip> : <span className="text-gray-600">—</span>),
  },
];

type Editor =
  | { kind: "script"; script: NmapScript; isNew: boolean }
  | { kind: "template-view"; template: AgentTemplate }
  | { kind: "template-build"; template: AgentTemplate | null }
  | null;

export function ScriptLibrarySection() {
  const utils = api.useContext();
  const [mode, setMode] = useUrlTab(MODES, "scripts", "library");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<Editor>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [scriptToDelete, setScriptToDelete] = useState<NmapScript | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<AgentTemplate | null>(null);

  const scriptsQuery = api.store.getNseScripts.useQuery(undefined, {
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const manifestQuery = api.store.getValue.useQuery(
    { key: NSE_MANIFEST_KEY },
    { staleTime: 60_000, refetchOnWindowFocus: false },
  );
  const templatesQuery = api.agentTemplates.getTemplates.useQuery(undefined, { staleTime: 60_000 });

  const manifest = useMemo(() => parseNseManifest(manifestQuery.data), [manifestQuery.data]);
  const allScripts = useMemo(() => scriptRows(scriptsQuery.data, manifest), [scriptsQuery.data, manifest]);
  const allTemplates = useMemo(() => templateRows(templatesQuery.data), [templatesQuery.data]);
  const scripts = useMemo(() => filterRows(allScripts, query), [allScripts, query]);
  const templates = useMemo(() => filterRows(allTemplates, query), [allTemplates, query]);

  // Counts appear once known: the script list, or the light manifest first.
  const scriptCount = scriptsQuery.data
    ? allScripts.length
    : manifestQuery.data
      ? manifest.size
      : undefined;
  const templateCount = templatesQuery.data ? allTemplates.length : undefined;

  const scriptsById = useMemo(
    () => new Map((scriptsQuery.data ?? []).map((s) => [s.id, s] as const)),
    [scriptsQuery.data],
  );

  /* ---------------- mutations ---------------- */

  const deleteScript = api.store.deleteNseScript.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Script deleted");
        setScriptToDelete(null);
        setEditor(null);
        void utils.store.getNseScripts.invalidate();
        void utils.store.getValue.invalidate({ key: NSE_MANIFEST_KEY });
      } else {
        toast.error("Couldn't delete the script", { description: result.error });
      }
    },
    onError: (error) => toast.error("Couldn't delete the script", { description: error.message }),
  });
  const uploadTemplate = api.agentTemplates.uploadTemplate.useMutation();
  const updateTemplate = api.agentTemplates.updateTemplate.useMutation();
  const deleteTemplate = api.agentTemplates.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template deleted");
      setTemplateToDelete(null);
      setEditor(null);
      void utils.agentTemplates.getTemplates.invalidate();
    },
    onError: (error) => toast.error("Couldn't delete the template", { description: error.message }),
  });
  const testTemplate = api.agentTemplates.testTemplate.useMutation({
    onSuccess: (_data, vars) => toast.success("Template sent to all agents", { description: vars.templateId }),
    onError: (error) => toast.error("Couldn't run the template", { description: error.message }),
  });

  /* ---------------- actions ---------------- */

  const openTemplate = useCallback(
    async (id: string, then: "view" | "build") => {
      setOpening(id);
      try {
        // The list omits the YAML; the viewer and builder need it. This goes
        // through tRPC so the API key is attached.
        const full = await utils.agentTemplates.getTemplate.fetch({ id });
        if (!full) throw new Error(`Template ${id} was not found.`);
        setEditor(then === "view" ? { kind: "template-view", template: full } : { kind: "template-build", template: full });
      } catch (error) {
        toast.error("Couldn't open the template", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setOpening(null);
      }
    },
    [utils],
  );

  const saveTemplate = useCallback(
    async (form: TemplateFormState, editing: AgentTemplate | null) => {
      const content = convertFormToYAML(form);
      const filename = generateTemplateFilename(form.id);
      // A duplicate from the viewer has a new id that isn't stored yet.
      const exists = !!editing && (templatesQuery.data ?? []).some((t) => t.id === editing.id);
      if (editing && exists) {
        await updateTemplate.mutateAsync({ id: editing.id, content, filename, author: form.author });
      } else {
        await uploadTemplate.mutateAsync({ content, filename, author: form.author });
      }
      await utils.agentTemplates.getTemplates.invalidate();
      toast.success(editing && exists ? "Template saved" : "Template created");
      setEditor(null);
    },
    [templatesQuery.data, updateTemplate, uploadTemplate, utils],
  );

  const closeEditor = () => setEditor(null);

  const dialogs = (
    <>
      <ConfirmDialog
        open={scriptToDelete !== null}
        onOpenChange={(open) => !open && setScriptToDelete(null)}
        title="Delete script"
        description={
          <>
            Delete <span className="font-mono text-gray-200">{scriptToDelete?.name}</span> from the library?
            Profiles that list it will show it as missing.
          </>
        }
        confirmLabel="Delete script"
        busy={deleteScript.isLoading}
        onConfirm={() => scriptToDelete && deleteScript.mutate({ id: scriptToDelete.id })}
      />
      <ConfirmDialog
        open={templateToDelete !== null}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
        title="Delete template"
        description={
          <>
            Delete <span className="font-medium text-gray-200">{templateToDelete?.name}</span>? This can&apos;t be
            undone.
          </>
        }
        confirmLabel="Delete template"
        busy={deleteTemplate.isLoading}
        onConfirm={() => templateToDelete && deleteTemplate.mutate({ id: templateToDelete.id })}
      />
    </>
  );

  /* ---------------- editor views ---------------- */

  if (editor) {
    const title =
      editor.kind === "script"
        ? editor.isNew
          ? "New script"
          : editor.script.name
        : editor.kind === "template-view"
          ? editor.template.name
          : editor.template
            ? editor.template.name
            : "New template";
    return (
      <SettingsSection
        icon={FileCode2}
        title={`Script and template library · ${title}`}
        actions={
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs" onClick={closeEditor}>
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
            Back to library
          </Button>
        }
      >
        <div className="relative overflow-x-auto px-4 pb-4">
          {editor.kind === "script" && (
            <ScriptNavigator
              key={editor.script.id || "new"}
              script={editor.script}
              isNew={editor.isNew}
              onClose={closeEditor}
              onScriptUpdated={() => {
                void utils.store.getNseScripts.invalidate();
                void utils.store.getValue.invalidate({ key: NSE_MANIFEST_KEY });
              }}
              {...(editor.isNew ? {} : { onDelete: (s: NmapScript) => setScriptToDelete(s) })}
            />
          )}
          {editor.kind === "template-view" && (
            <TemplateViewer
              template={editor.template}
              onClose={closeEditor}
              onEdit={(t) =>
                t.content ? setEditor({ kind: "template-build", template: t }) : void openTemplate(t.id, "build")
              }
              onRun={(t) => testTemplate.mutate({ templateId: t.id, agentId: "all" })}
              {...(editor.template.type === "custom"
                ? { onDelete: (t: AgentTemplate) => setTemplateToDelete(t) }
                : {})}
            />
          )}
          {editor.kind === "template-build" && (
            <TemplateBuilder
              editingTemplate={editor.template}
              onCancel={closeEditor}
              onSave={(form) => saveTemplate(form, editor.template)}
            />
          )}
        </div>
        {dialogs}
      </SettingsSection>
    );
  }

  /* ---------------- list view ---------------- */

  const isScripts = mode === "scripts";
  const loading = isScripts ? scriptsQuery.isLoading : templatesQuery.isLoading;
  const total = isScripts ? allScripts.length : allTemplates.length;
  const shown = isScripts ? scripts.length : templates.length;
  const placeholder = isScripts
    ? `Search ${scriptCount !== undefined ? `${scriptCount.toLocaleString("en-US")} ` : ""}scripts by name, port or tag`
    : `Search ${templateCount !== undefined ? `${templateCount.toLocaleString("en-US")} ` : ""}templates by name, platform or severity`;

  const switchMode = (next: LibraryMode) => {
    if (next !== mode) setMode(next);
  };

  return (
    <SettingsSection
      icon={FileCode2}
      title="Script and template library"
      actions={
        isScripts ? (
          <HeaderButton icon={Plus} onClick={() => setEditor({ kind: "script", script: BLANK_SCRIPT, isNew: true })}>
            New script
          </HeaderButton>
        ) : (
          <HeaderButton icon={Plus} onClick={() => setEditor({ kind: "template-build", template: null })}>
            New template
          </HeaderButton>
        )
      }
    >
      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <label className="relative min-w-[220px] max-w-sm flex-1">
          <span className="sr-only">Search the library</span>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="h-8 border-gray-700 bg-gray-900/60 pl-8 text-xs text-white placeholder:text-gray-500"
          />
        </label>
        <div role="group" aria-label="Library" className="inline-flex rounded-md border border-gray-700 p-0.5">
          {(
            [
              ["scripts", "Network scripts", scriptCount],
              ["templates", "Agent templates", templateCount],
            ] as const
          ).map(([id, text, n]) => (
            <button
              key={id}
              type="button"
              aria-pressed={mode === id}
              onClick={() => switchMode(id)}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40",
                mode === id ? "bg-violet-500/20 text-violet-200" : "text-gray-400 hover:text-gray-200",
              )}
            >
              {text}
              {n !== undefined && <span className="ml-1.5 tabular-nums text-gray-500">{n.toLocaleString("en-US")}</span>}
            </button>
          ))}
        </div>
        {opening && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Opening
          </span>
        )}
      </div>

      {loading ? (
        <SkeletonRows rows={6} />
      ) : total === 0 ? (
        isScripts ? (
          <EmptyState
            variant="no-data"
            size="compact"
            framed={false}
            title="No scripts yet"
            reason="The scanner loads its script repositories when it starts. Scripts you write here are added too."
            primary={{ label: "New script", icon: Plus, onClick: () => setEditor({ kind: "script", script: BLANK_SCRIPT, isNew: true }) }}
          />
        ) : (
          <EmptyState
            variant="no-data"
            size="compact"
            framed={false}
            title="No agent templates"
            reason="Templates come from agent repositories, or write your own."
            primary={{ label: "New template", icon: Plus, onClick: () => setEditor({ kind: "template-build", template: null }) }}
          />
        )
      ) : shown === 0 ? (
        <EmptyState
          variant="not-found"
          size="compact"
          framed={false}
          title="Nothing matches"
          reason={`No ${isScripts ? "scripts" : "templates"} match “${query.trim()}”.`}
          primary={{ label: "Clear search", onClick: () => setQuery("") }}
        />
      ) : isScripts ? (
        <LibraryList
          key="scripts"
          label="Network scripts"
          rows={scripts}
          columns={SCRIPT_COLUMNS}
          gridTemplate={SCRIPT_GRID}
          rowKey={(row) => row.id}
          onOpen={(row) => {
            const script = scriptsById.get(row.id);
            if (script) setEditor({ kind: "script", script, isNew: false });
          }}
        />
      ) : (
        <LibraryList
          key="templates"
          label="Agent templates"
          rows={templates}
          columns={TEMPLATE_COLUMNS}
          gridTemplate={TEMPLATE_GRID}
          rowKey={(row) => row.id}
          onOpen={(row) => void openTemplate(row.id, "view")}
        />
      )}

      {!loading && shown > 0 && (
        <p className="border-t border-violet-500/10 px-4 py-2 text-[11px] text-gray-500">
          {isScripts
            ? `${scripts.length === allScripts.length ? "" : `${scripts.length.toLocaleString("en-US")} of `}${allScripts.length.toLocaleString("en-US")} scripts. Ports and categories are read from each script's code.`
            : `${templates.length === allTemplates.length ? "" : `${templates.length.toLocaleString("en-US")} of `}${allTemplates.length.toLocaleString("en-US")} templates.`}
        </p>
      )}
      {dialogs}
    </SettingsSection>
  );
}

export default ScriptLibrarySection;

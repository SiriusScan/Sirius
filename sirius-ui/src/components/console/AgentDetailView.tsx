import React, { useState, useCallback } from "react";
import { cn } from "~/components/lib/utils";
import {
  ScanLine,
  Copy,
  ExternalLink,
  StickyNote,
  Tag,
  Plus,
  X,
  Server,
  Globe,
  Shield,
  Cpu,
  HardDrive,
  Clock,
  UserCog,
  Pencil,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { DisplayedAgentDetails } from "./types";

interface AgentDetailViewProps {
  agentId: string | null;
  details: DisplayedAgentDetails | null;
  tags: string[];
  note: string;
  onRunScan: () => void;
  onViewHost: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onSetNote: (note: string) => void;
  onCopyId: () => void;
}

export const AgentDetailView: React.FC<AgentDetailViewProps> = ({
  agentId,
  details,
  tags,
  note,
  onRunScan,
  onViewHost,
  onAddTag,
  onRemoveTag,
  onSetNote,
  onCopyId,
}) => {
  const [addingTag, setAddingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [noteInput, setNoteInput] = useState(note);

  // Sync note input when note prop changes (different agent selected)
  React.useEffect(() => {
    setNoteInput(note);
    setEditingNote(false);
  }, [note, agentId]);

  const handleAddTag = useCallback(() => {
    if (tagInput.trim()) {
      onAddTag(tagInput.trim().toLowerCase());
      setTagInput("");
      setAddingTag(false);
    }
  }, [tagInput, onAddTag]);

  const handleSaveNote = useCallback(() => {
    onSetNote(noteInput);
    setEditingNote(false);
  }, [noteInput, onSetNote]);

  const formatLastSeen = (isoString: string | null | undefined): string => {
    if (!isoString) return "Never";
    try {
      const date = new Date(isoString);
      const seconds = Math.round((Date.now() - date.getTime()) / 1000);
      if (seconds < 60) return `${seconds}s ago`;
      const minutes = Math.round(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.round(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return date.toLocaleString();
    } catch {
      return "Invalid Date";
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!agentId || !details) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-gray-950/30 text-gray-500">
        <UserCog className="mb-3 h-8 w-8 text-gray-400" />
        <p className="text-sm font-medium">No Agent Selected</p>
        <p className="mt-1 max-w-xs text-center text-xs text-gray-400">
          Select an agent from the sidebar to view its details, manage tags, and
          add notes.
        </p>
      </div>
    );
  }

  const isOnline = details.status?.toLowerCase() === "online";

  // ── Full agent detail panel ──────────────────────────────────────────────
  return (
    <div className="flex h-full flex-col overflow-y-auto bg-gray-950/30">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="border-b border-violet-500/20 bg-gray-900/50 px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
                <Server className="h-5 w-5 text-violet-400" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-white">
                  {details.name || details.id}
                </h2>
                <div className="mt-0.5 flex items-center gap-2">
                  <div
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      isOnline ? "bg-emerald-400" : "bg-red-400"
                    )}
                  />
                  <span className="text-sm text-gray-400">
                    {isOnline
                      ? "Online"
                      : `Offline — last seen ${formatLastSeen(details.lastSeen)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="ml-4 flex shrink-0 items-center gap-2">
            <button
              onClick={onRunScan}
              disabled={!isOnline}
              className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ScanLine className="h-3.5 w-3.5" />
              Scan
            </button>
            <button
              onClick={onCopyId}
              className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-gray-900/50 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800"
              title="Copy Agent ID"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy ID
            </button>
            <button
              onClick={onViewHost}
              disabled={!details.primaryIp}
              className="flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-gray-900/50 px-3 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Host
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="flex-1 space-y-6 p-6">
        {/* System Info */}
        <section>
          <SectionHeader icon={Cpu} title="System Information" />
          <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-3">
            <InfoField label="IP Address" value={details.primaryIp} icon={Globe} />
            <InfoField label="OS / Architecture" value={details.osArch} icon={HardDrive} />
            <InfoField label="OS Version" value={details.osVersion} icon={Shield} />
            <InfoField label="Agent Version" value={details.agentVersion} icon={Server} />
            <InfoField label="Uptime" value={details.uptime} icon={Clock} />
            <InfoField
              label="Agent ID"
              value={agentId}
              mono
              icon={Cpu}
            />
          </div>
        </section>

        {/* Tags */}
        <section>
          <SectionHeader
            icon={Tag}
            title="Tags"
            badge={tags.length > 0 ? String(tags.length) : undefined}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="group inline-flex items-center gap-1.5 rounded-md bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300 ring-1 ring-violet-500/20"
              >
                {tag}
                <button
                  onClick={() => onRemoveTag(tag)}
                  className="hidden rounded-sm text-gray-500 transition-colors hover:text-red-400 group-hover:inline-flex"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {addingTag ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTag();
                    if (e.key === "Escape") {
                      setAddingTag(false);
                      setTagInput("");
                    }
                  }}
                  onBlur={() => {
                    if (tagInput.trim()) handleAddTag();
                    else setAddingTag(false);
                  }}
                  placeholder="tag name..."
                  className="w-28 rounded-md bg-gray-800 px-2.5 py-1 text-xs text-white outline-none ring-1 ring-violet-500/30 placeholder:text-gray-400"
                />
              </div>
            ) : (
              <button
                onClick={() => setAddingTag(true)}
                className="inline-flex items-center gap-1 rounded-md border border-dashed border-violet-500/25 px-2.5 py-1 text-xs text-gray-500 transition-colors hover:border-violet-500/40 hover:text-violet-300"
              >
                <Plus className="h-3 w-3" />
                Add tag
              </button>
            )}
          </div>
          {tags.length === 0 && !addingTag && (
            <p className="mt-2 text-xs text-gray-400">
              No tags yet. Tags help organize and filter your agents.
            </p>
          )}
        </section>

        {/* Notes */}
        <section>
          <SectionHeader icon={StickyNote} title="Notes" />
          <div className="mt-3">
            {editingNote ? (
              <div className="space-y-3">
                <textarea
                  autoFocus
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="min-h-[120px] w-full resize-y rounded-lg bg-gray-800/80 p-4 text-sm leading-relaxed text-white outline-none ring-1 ring-violet-500/30 placeholder:text-gray-400 focus:ring-violet-500/50"
                  placeholder="Write notes about this agent — deployment info, special configs, owner, purpose..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNote}
                    className="flex items-center gap-1.5 rounded-lg bg-violet-500/20 px-4 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingNote(false);
                      setNoteInput(note);
                    }}
                    className="rounded-lg px-4 py-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : note ? (
              <div
                className="group cursor-pointer rounded-lg bg-gray-800/50 p-4 text-sm leading-relaxed text-gray-300 ring-1 ring-transparent transition-all hover:bg-gray-800 hover:ring-violet-500/20"
                onClick={() => setEditingNote(true)}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="whitespace-pre-wrap">{note}</p>
                  <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNote(true)}
                className="w-full rounded-lg border border-dashed border-violet-500/20 bg-gray-900/30 p-4 text-left text-sm text-gray-400 transition-colors hover:border-violet-500/30 hover:text-gray-400"
              >
                Click to add notes about this agent...
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  badge?: string;
}> = ({ icon: Icon, title, badge }) => (
  <div className="flex items-center gap-2">
    <Icon className="h-4 w-4 text-violet-400" />
    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
      {title}
    </h3>
    {badge && (
      <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
        {badge}
      </span>
    )}
  </div>
);

const InfoField: React.FC<{
  label: string;
  value: string | null | undefined;
  icon?: React.ElementType;
  mono?: boolean;
}> = ({ label, value, icon: Icon, mono }) => (
  <div className="flex items-start gap-3">
    {Icon && (
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-800/80">
        <Icon className="h-3.5 w-3.5 text-gray-500" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm text-gray-200",
          mono && "font-mono text-xs"
        )}
        title={value ?? undefined}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

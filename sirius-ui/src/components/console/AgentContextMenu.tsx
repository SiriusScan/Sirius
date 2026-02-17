import React, { useEffect, useRef, useCallback } from "react";
import {
  Crosshair,
  ScanLine,
  Activity,
  ExternalLink,
  Copy,
  Tag,
  StickyNote,
} from "lucide-react";

interface ContextMenuPosition {
  x: number;
  y: number;
}

interface AgentContextMenuProps {
  agentId: string;
  agentName: string;
  agentIp?: string;
  position: ContextMenuPosition;
  onClose: () => void;
  onSelect: () => void;
  onRunScan: () => void;
  onCheckStatus: () => void;
  onViewHost: () => void;
  onCopyIp: () => void;
  onCopyId: () => void;
  onAddTag: () => void;
  onAddNote: () => void;
}

export const AgentContextMenu: React.FC<AgentContextMenuProps> = ({
  position,
  onClose,
  onSelect,
  onRunScan,
  onCheckStatus,
  onViewHost,
  onCopyIp,
  onCopyId,
  onAddTag,
  onAddNote,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  const adjustedPosition = useCallback(() => {
    const menuWidth = 200;
    const menuHeight = 320;
    let x = position.x;
    let y = position.y;
    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 8;
    return { x, y };
  }, [position]);

  const pos = adjustedPosition();

  const items = [
    { icon: Crosshair, label: "Select", action: onSelect },
    { icon: ScanLine, label: "Run Scan", action: onRunScan },
    { icon: Activity, label: "Check Status", action: onCheckStatus },
    { type: "separator" as const },
    { icon: ExternalLink, label: "View Host Page", action: onViewHost },
    { icon: Copy, label: "Copy IP", action: onCopyIp },
    { icon: Copy, label: "Copy Agent ID", action: onCopyId },
    { type: "separator" as const },
    { icon: Tag, label: "Add Tag", action: onAddTag },
    { icon: StickyNote, label: "Add Note", action: onAddNote },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-48 overflow-hidden rounded-lg border border-violet-500/20 bg-gray-900 shadow-xl shadow-black/30"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="py-1">
        {items.map((item, i) => {
          if ("type" in item && item.type === "separator") {
            return (
              <div
                key={`sep-${i}`}
                className="my-1 border-t border-violet-500/10"
              />
            );
          }
          const { icon: Icon, label, action } = item as {
            icon: React.ElementType;
            label: string;
            action: () => void;
          };
          return (
            <button
              key={label}
              onClick={() => {
                action();
                onClose();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-xs text-gray-300 transition-colors hover:bg-violet-500/10 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5 text-gray-500" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

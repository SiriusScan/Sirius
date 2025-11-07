import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Button } from "~/components/lib/ui/button";
import {
  expandCIDR,
  expandRange,
  type ParsedTarget,
} from "~/utils/targetParser";
import { Badge } from "~/components/lib/ui/badge";
import { Network, AlertTriangle } from "lucide-react";

interface TargetExpansionModalProps {
  target: ParsedTarget | null;
  isOpen: boolean;
  onClose: () => void;
  onAddHosts?: (hosts: string[]) => void;
}

const TargetExpansionModal: React.FC<TargetExpansionModalProps> = ({
  target,
  isOpen,
  onClose,
  onAddHosts,
}) => {
  const [selectedHosts, setSelectedHosts] = useState<Set<string>>(new Set());

  const expandedHosts = useMemo(() => {
    if (!target) return [];

    if (target.type === "cidr") {
      return expandCIDR(target.value);
    } else if (target.type === "range") {
      return expandRange(target.value);
    }

    return [];
  }, [target]);

  const handleSelectAll = () => {
    setSelectedHosts(new Set(expandedHosts));
  };

  const handleDeselectAll = () => {
    setSelectedHosts(new Set());
  };

  const handleToggleHost = (host: string) => {
    setSelectedHosts((prev) => {
      const next = new Set(prev);
      if (next.has(host)) {
        next.delete(host);
      } else {
        next.add(host);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    if (onAddHosts) {
      onAddHosts(Array.from(selectedHosts));
    }
    onClose();
  };

  if (!target) return null;

  const showWarning = expandedHosts.length > 1000;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Expand {target.type.toUpperCase()}: {target.value}
          </DialogTitle>
          <DialogDescription>
            This {target.type} expands to{" "}
            {expandedHosts.length.toLocaleString()} hosts. Select which hosts to
            add to your scan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary */}
          <div className="flex items-center justify-between rounded-lg border border-violet-100/20 bg-gray-800/20 p-3">
            <div>
              <div className="text-sm font-medium text-white">
                {expandedHosts.length.toLocaleString()} Hosts
              </div>
              <div className="text-xs text-gray-400">
                {selectedHosts.size > 0
                  ? `${selectedHosts.size} selected`
                  : "None selected"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>

          {/* Warning for large ranges */}
          {showWarning && (
            <div className="flex items-start gap-2 rounded border border-yellow-500/30 bg-yellow-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-500" />
              <div className="text-xs">
                <div className="font-medium text-yellow-400">Large Range</div>
                <div className="text-yellow-400/80">
                  This range contains over 1,000 hosts. Scanning may take
                  significant time. Consider narrowing your target range.
                </div>
              </div>
            </div>
          )}

          {/* Host List */}
          <div className="rounded-lg border border-violet-100/20 bg-gray-800/10">
            <div className="border-b border-violet-100/20 p-2">
              <div className="text-xs font-medium text-gray-400">
                Expanded IP Addresses
              </div>
            </div>
            <div className="h-[300px] overflow-y-auto">
              <div className="space-y-1 p-2">
                {expandedHosts.slice(0, 500).map((host) => (
                  <label
                    key={host}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-gray-800/50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedHosts.has(host)}
                      onChange={() => handleToggleHost(host)}
                      className="rounded border-violet-100/30"
                    />
                    <code className="font-mono text-sm text-violet-100">
                      {host}
                    </code>
                  </label>
                ))}
                {expandedHosts.length > 500 && (
                  <div className="py-4 text-center text-xs text-gray-400">
                    ... and {(expandedHosts.length - 500).toLocaleString()} more
                    hosts
                    <br />
                    <span className="text-xs text-gray-500">
                      Use &quot;Select All&quot; to include all hosts
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAddSelected}
            disabled={selectedHosts.size === 0}
            className="bg-violet-600 hover:bg-violet-500"
          >
            Add {selectedHosts.size > 0 ? selectedHosts.size : ""} Host
            {selectedHosts.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TargetExpansionModal;

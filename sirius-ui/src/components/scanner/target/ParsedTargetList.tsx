import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { type ParsedTarget } from "~/utils/targetParser";
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface ParsedTargetListProps {
  targets: ParsedTarget[];
  onRemoveTarget: (targetId: string) => void;
  exclusions: string[];
}

const ParsedTargetList: React.FC<ParsedTargetListProps> = ({
  targets,
  onRemoveTarget,
  exclusions,
}) => {
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(
    new Set()
  );
  const [filter, setFilter] = useState<
    "all" | "valid" | "invalid" | "warnings"
  >("all");

  const toggleExpand = (targetId: string) => {
    setExpandedTargets((prev) => {
      const next = new Set(prev);
      if (next.has(targetId)) {
        next.delete(targetId);
      } else {
        next.add(targetId);
      }
      return next;
    });
  };

  const getStatusIcon = (target: ParsedTarget) => {
    if (!target.isValid) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (target.warning) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (target: ParsedTarget) => {
    if (!target.isValid) {
      return (
        <Badge variant="destructive" className="text-xs">
          Invalid
        </Badge>
      );
    }
    if (target.warning) {
      return (
        <Badge
          variant="outline"
          className="border-yellow-500 text-xs text-yellow-500"
        >
          Warning
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-green-500 text-xs text-green-500"
      >
        Valid
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      ip: "bg-blue-500/20 text-blue-300",
      cidr: "bg-purple-500/20 text-purple-300",
      range: "bg-indigo-500/20 text-indigo-300",
      domain: "bg-pink-500/20 text-pink-300",
    };

    return (
      <Badge
        className={`text-xs ${
          colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-300"
        }`}
      >
        {type.toUpperCase()}
      </Badge>
    );
  };

  const filteredTargets = targets.filter((target) => {
    if (filter === "valid") return target.isValid && !target.warning;
    if (filter === "invalid") return !target.isValid;
    if (filter === "warnings") return target.warning !== undefined;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "ghost"}
          onClick={() => setFilter("all")}
          className={`h-8 px-3 text-xs ${
            filter === "all"
              ? "bg-violet-600 text-white hover:bg-violet-500"
              : "text-gray-400 hover:bg-violet-500/10 hover:text-violet-200"
          }`}
        >
          All ({targets.length})
        </Button>
        <Button
          size="sm"
          variant={filter === "valid" ? "default" : "ghost"}
          onClick={() => setFilter("valid")}
          className={`h-8 px-3 text-xs ${
            filter === "valid"
              ? "bg-green-600 text-white hover:bg-green-500"
              : "text-gray-400 hover:bg-green-500/10 hover:text-green-200"
          }`}
        >
          <CheckCircle className="mr-1 h-3 w-3" />
          Valid ({targets.filter((t) => t.isValid && !t.warning).length})
        </Button>
        <Button
          size="sm"
          variant={filter === "invalid" ? "default" : "ghost"}
          onClick={() => setFilter("invalid")}
          className={`h-8 px-3 text-xs ${
            filter === "invalid"
              ? "bg-red-600 text-white hover:bg-red-500"
              : "text-gray-400 hover:bg-red-500/10 hover:text-red-200"
          }`}
        >
          <XCircle className="mr-1 h-3 w-3" />
          Invalid ({targets.filter((t) => !t.isValid).length})
        </Button>
        <Button
          size="sm"
          variant={filter === "warnings" ? "default" : "ghost"}
          onClick={() => setFilter("warnings")}
          className={`h-8 px-3 text-xs ${
            filter === "warnings"
              ? "bg-yellow-600 text-white hover:bg-yellow-500"
              : "text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-200"
          }`}
        >
          <AlertTriangle className="mr-1 h-3 w-3" />
          Warnings ({targets.filter((t) => t.warning).length})
        </Button>
      </div>

      {/* Target List */}
      <div className="max-h-[400px] space-y-2 overflow-y-auto rounded-lg bg-gray-900/30 p-3">
        {filteredTargets.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No targets match the current filter
          </div>
        ) : (
          filteredTargets.map((target) => {
            const isExpanded = expandedTargets.has(target.id);
            const canExpand = target.type === "cidr" || target.type === "range";

            return (
              <div
                key={target.id}
                className="rounded-lg border border-violet-500/20 bg-gradient-to-r from-gray-800/40 to-gray-900/40 p-3 transition-all hover:border-violet-500/30 hover:from-gray-800/60 hover:to-gray-900/60"
              >
                <div className="flex items-center justify-between gap-3">
                  {/* Status Icon & Value */}
                  <div className="flex flex-1 items-center gap-3">
                    {getStatusIcon(target)}
                    <code className="font-mono text-base font-medium text-white">
                      {target.value}
                    </code>
                    {getTypeBadge(target.type)}
                    {getStatusBadge(target)}
                    {target.hostCount !== undefined && target.hostCount > 1 && (
                      <span className="text-xs text-violet-300">
                        ({target.hostCount.toLocaleString()} hosts)
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canExpand && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(target.id)}
                        className="h-8 w-8 p-0 text-violet-300 hover:bg-violet-500/20 hover:text-violet-200"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveTarget(target.id)}
                      className="h-8 px-3 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                </div>

                {/* Error or Warning Message */}
                {(target.error || target.warning) && (
                  <div className="mt-2 flex items-start gap-2 rounded bg-gray-900/50 p-2">
                    {target.error ? (
                      <>
                        <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                        <span className="text-xs text-red-400">
                          {target.error}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0 text-yellow-500" />
                        <span className="text-xs text-yellow-400">
                          {target.warning}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Expansion Preview (for CIDR/Range) */}
                {isExpanded && canExpand && (
                  <div className="mt-2 rounded bg-gray-900/50 p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Expands to {target.hostCount} hosts
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                      >
                        Preview All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParsedTargetList;

import React, { useMemo } from "react";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Badge } from "~/components/lib/ui/badge";
import { Checkbox } from "~/components/lib/ui/checkbox";
import type { NmapScript } from "../nmap/mockScriptsData";

interface ScriptTableProps {
  scripts: NmapScript[];
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSelectScript?: (script: NmapScript) => void;
  showCheckboxes?: boolean;
  selectedScripts?: string[];
  onToggleScript?: (scriptId: string) => void;
  isLoading?: boolean;
}

const ScriptTable: React.FC<ScriptTableProps> = ({
  scripts,
  searchQuery = "",
  onSearchChange,
  onSelectScript,
  showCheckboxes = false,
  selectedScripts = [],
  onToggleScript,
  isLoading = false,
}) => {
  const filteredScripts = useMemo(() => {
    if (!searchQuery.trim()) return scripts;

    const query = searchQuery.toLowerCase().trim();
    return scripts.filter((script) => {
      return (
        script.name.toLowerCase().includes(query) ||
        script.author.toLowerCase().includes(query) ||
        (script.protocol && script.protocol.toLowerCase().includes(query)) ||
        (script.tags &&
          Array.isArray(script.tags) &&
          script.tags.some(
            (tag) =>
              tag &&
              typeof tag === "string" &&
              tag.toLowerCase().includes(query)
          ))
      );
    });
  }, [searchQuery, scripts]);

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading scripts...</div>;
  }

  if (!scripts || scripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4">
        <p className="text-gray-400">No scripts available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onSearchChange && (
        <div>
          <Label
            htmlFor="scriptSearch"
            className="mb-2 block text-sm font-semibold text-gray-400"
          >
            Search Scripts
          </Label>
          <Input
            id="scriptSearch"
            type="text"
            className="w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
            placeholder="Search by name, author, protocol, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-md border border-gray-700">
        <table className="w-full text-white">
          <thead className="bg-gray-800/50">
            <tr>
              {showCheckboxes && <th className="w-12 px-4 py-2 text-left"></th>}
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Author</th>
              <th className="px-4 py-2 text-left">Protocol</th>
              <th className="px-4 py-2 text-left">Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredScripts.map((script) => {
              const isSelected = selectedScripts.includes(script.id);
              return (
                <tr
                  key={script.id}
                  className={`cursor-pointer border-t border-gray-700 transition-colors hover:bg-violet-600/10 ${
                    isSelected ? "bg-violet-600/5" : ""
                  }`}
                  onClick={() => {
                    if (showCheckboxes && onToggleScript) {
                      onToggleScript(script.id);
                    } else if (onSelectScript) {
                      onSelectScript(script);
                    }
                  }}
                >
                  {showCheckboxes && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleScript?.(script.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">{script.name}</td>
                  <td className="px-4 py-3">{script.author}</td>
                  <td className="px-4 py-3">
                    {script.protocol && (
                      <Badge
                        variant="outline"
                        className="bg-violet-800/20 text-xs"
                      >
                        {script.protocol}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {script.tags && script.tags.length > 0 ? (
                        script.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-violet-600/20 text-xs"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No tags</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredScripts.length === 0 && (
          <div className="py-6 text-center text-gray-400">
            No scripts match your search criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptTable;

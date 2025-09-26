import React, { useEffect, useState, useMemo } from "react";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Badge } from "~/components/lib/ui/badge";
import { Skeleton } from "~/components/lib/ui/skeleton";
import { api } from "~/utils/api";
import { fallbackScripts, type NmapScript } from "./mockScriptsData";

interface NmapScriptsTabProps {
  onSelectScript: (script: NmapScript) => void;
}

const NmapScriptsTab: React.FC<NmapScriptsTabProps> = ({ onSelectScript }) => {
  const utils = api.useContext();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch scripts from Redis via TRPC
  const {
    data: scripts,
    isLoading,
    error,
  } = api.store.getNseScripts.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    onError: (err) => {
      console.error("Failed to load NSE scripts:", err);
    },
  });

  const { mutate: initializeScripts } =
    api.store.initializeNseScripts.useMutation({
      onSuccess: () => {
        // Refresh the scripts list after initialization
        utils.store.getNseScripts.invalidate();
      },
    });

  useEffect(() => {
    // If no scripts are found, initialize with mock data
    if (!isLoading && (!scripts || scripts.length === 0)) {
      initializeScripts();
    }
  }, [scripts, isLoading, initializeScripts]);

  // Use the scripts from the API or fallback to mock data if there's an error
  const availableScripts: NmapScript[] = useMemo(() => {
    return scripts || fallbackScripts;
  }, [scripts]);

  const filteredScripts = useMemo(() => {
    if (!searchQuery.trim()) return availableScripts;

    const query = searchQuery.toLowerCase().trim();
    return availableScripts.filter((script) => {
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
  }, [searchQuery, availableScripts]);

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading scripts...</div>;
  }

  if (!scripts || scripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4">
        <p className="text-gray-400">No scripts found</p>
        <button
          onClick={() => initializeScripts()}
          className="rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
        >
          Initialize with Default Scripts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error ? (
        // Show error state
        <div className="rounded-md border border-red-800 bg-red-900/20 p-4 text-white">
          <p className="font-medium">Failed to load NSE scripts</p>
          <p className="text-sm text-gray-300">
            Using fallback data. The Redis server may be unavailable.
          </p>
        </div>
      ) : (
        // Show table with scripts
        <div className="overflow-hidden rounded-md border border-gray-700">
          <table className="w-full text-white">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Author</th>
                <th className="px-4 py-2 text-left">Protocol</th>
                <th className="px-4 py-2 text-left">Tags</th>
              </tr>
            </thead>
            <tbody>
              {filteredScripts.map((script) => (
                <tr
                  key={script.id}
                  className="cursor-pointer border-t border-gray-700 transition-colors hover:bg-violet-600/10"
                  onClick={() => onSelectScript(script)}
                >
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
              ))}
            </tbody>
          </table>

          {filteredScripts.length === 0 && (
            <div className="py-6 text-center text-gray-400">
              No scripts match your search criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NmapScriptsTab;

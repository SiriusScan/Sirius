import React, { useEffect, useState, useMemo } from "react";
import { api } from "~/utils/api";
import { fallbackScripts, type NmapScript } from "./mockScriptsData";
import ScriptTable from "../shared/ScriptTable";

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
      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/20 p-4 text-white">
          <p className="font-medium">Failed to load NSE scripts</p>
          <p className="text-sm text-gray-300">
            Using fallback data. The Redis server may be unavailable.
          </p>
        </div>
      )}

      <ScriptTable
        scripts={availableScripts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectScript={onSelectScript}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NmapScriptsTab;

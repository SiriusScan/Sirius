import React, { useEffect, useMemo } from "react";
import { api } from "~/utils/api";
import { type NmapScript } from "./mockScriptsData";
import { ScriptLibrary } from "./ScriptLibrary";

interface NmapScriptsTabProps {
  onSelectScript: (script: NmapScript) => void;
  onCreateNew: () => void;
  onDeleteScript: (script: NmapScript) => void;
}

const NmapScriptsTab: React.FC<NmapScriptsTabProps> = ({
  onSelectScript,
  onCreateNew,
  onDeleteScript,
}) => {
  const utils = api.useContext();

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
        utils.store.getNseScripts.invalidate();
      },
    });

  useEffect(() => {
    // Only auto-initialize when we have a clean empty-state response.
    if (!isLoading && !error && scripts && scripts.length === 0) {
      initializeScripts();
    }
  }, [scripts, isLoading, error, initializeScripts]);

  // Use scripts from the canonical store source only.
  const availableScripts: NmapScript[] = useMemo(() => {
    return scripts || [];
  }, [scripts]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md border border-red-800 bg-red-900/20 p-4 text-white">
          <p className="font-medium">Failed to load NSE scripts</p>
          <p className="text-sm text-gray-300">
            Unable to load scripts from the canonical store source.
          </p>
        </div>
      )}

      <ScriptLibrary
        scripts={availableScripts}
        onCreateNew={onCreateNew}
        onView={onSelectScript}
        onDelete={onDeleteScript}
        isLoading={isLoading}
      />
    </div>
  );
};

export default NmapScriptsTab;

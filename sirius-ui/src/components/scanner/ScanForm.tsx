// src/components/scanner/ScanForm.tsx
import React from "react";
import { Button } from "~/components/lib/ui/button";
import { ProfileSelector } from "./ProfileSelector";
import { type ScanProfile } from "~/types/scanTypes";
import { type ParsedTarget } from "~/utils/targetParser";
import { Play } from "lucide-react";

interface ScanFormProps {
  startScan: () => void;
  selectedProfile: ScanProfile;
  setSelectedProfile: (profile: ScanProfile) => void;
  hasTargets: boolean;
  isLoading?: boolean;
}

const ScanForm: React.FC<ScanFormProps> = ({
  startScan,
  selectedProfile,
  setSelectedProfile,
  hasTargets,
  isLoading = false,
}) => {
  return (
    <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-gray-900/50 to-gray-800/30 p-6 shadow-xl">
      <div className="flex items-center gap-6">
        <div className="flex-1">
          <label className="mb-2 block text-sm font-medium text-violet-200">
            Scan Profile
          </label>
          <ProfileSelector
            value={selectedProfile}
            onChange={setSelectedProfile}
          />
        </div>

        <div className="flex flex-col items-end">
          <div className="mb-2 text-sm font-medium text-transparent">.</div>
          <Button
            onClick={startScan}
            disabled={!hasTargets || isLoading}
            className="h-12 bg-gradient-to-r from-violet-600 to-purple-600 px-8 text-base font-semibold text-white shadow-lg hover:from-violet-500 hover:to-purple-500 disabled:opacity-50"
          >
            <Play className="mr-2 h-5 w-5 fill-current" />
            {isLoading ? "Scanning..." : "Start Scan"}
          </Button>
        </div>
      </div>

      {!hasTargets && (
        <div className="mt-4 rounded-lg bg-gray-900/50 p-3 text-center text-sm text-gray-400">
          Add at least one target to begin scanning
        </div>
      )}
    </div>
  );
};

export default React.memo(ScanForm);

import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";

interface CustomScriptsTabProps {
  customScripts: string;
  setCustomScripts: (value: string) => void;
}

const CustomScriptsTab: React.FC<CustomScriptsTabProps> = ({
  customScripts,
  setCustomScripts,
}) => {
  return (
    <div>
      <Label
        htmlFor="customScripts"
        className="mb-2 block text-sm font-semibold text-gray-400"
      >
        Custom Scripts
      </Label>
      <Textarea
        id="customScripts"
        className="h-40 w-full rounded-md border border-gray-600 bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500"
        placeholder="Enter custom scripts or commands..."
        value={customScripts}
        onChange={(e) => setCustomScripts(e.target.value)}
      />
      <span className="mt-1 text-xs text-gray-500">
        Advanced users only: Enter custom scanner scripts (NSE, Nuclei
        templates, etc.)
      </span>
    </div>
  );
};

export default CustomScriptsTab; 
import React from "react";
import { Label } from "~/components/lib/ui/label";
import { Textarea } from "~/components/lib/ui/textarea";
import MonacoEditor from "~/components/editor/MonacoEditor";

interface CustomScriptsTabProps {
  customScripts: string;
  setCustomScripts: (value: string) => void;
}

const CustomScriptsTab: React.FC<CustomScriptsTabProps> = ({
  customScripts,
  setCustomScripts,
}) => {
  return (
    <div className="w-full space-y-4">
      <Label
        htmlFor="customScripts"
        className="block text-sm font-semibold text-gray-400"
      >
        Custom Scripts
      </Label>
      <div className="w-full">
        <MonacoEditor
          value={customScripts}
          language="shell"
          onChange={(value) => setCustomScripts(value || "")}
          height="400px"
          theme="catppuccin-mocha"
        />
      </div>
      <span className="block text-xs text-gray-500">
        Advanced users only: Enter custom scanner scripts (NSE, Nuclei
        templates, etc.) with full syntax highlighting and validation.
      </span>
    </div>
  );
};

export default CustomScriptsTab;

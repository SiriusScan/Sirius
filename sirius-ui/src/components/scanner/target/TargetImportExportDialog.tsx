import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Button } from "~/components/lib/ui/button";
import { Upload, Download } from "lucide-react";
import { type ParsedTarget } from "~/utils/targetParser";

interface TargetImportExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport?: (targets: ParsedTarget[]) => void;
  onExport?: (targets: ParsedTarget[]) => void;
  currentTargets?: ParsedTarget[];
}

const TargetImportExportDialog: React.FC<TargetImportExportDialogProps> = ({
  isOpen,
  onClose,
  onImport,
  currentTargets = [],
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      // Simple parsing - one target per line
      const lines = text.split("\n").filter((line) => line.trim());
      // Convert to ParsedTarget format
      const targets: ParsedTarget[] = lines.map((line, index) => ({
        id: `imported-${Date.now()}-${index}`,
        raw: line.trim(),
        value: line.trim(),
        type: "ip", // Will be validated by parser
        isValid: true,
      }));
      onImport(targets);
      onClose();
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    if (!currentTargets || currentTargets.length === 0) return;

    const text = currentTargets.map((t) => t.value).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan-targets-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import / Export Targets</DialogTitle>
          <DialogDescription>
            Import targets from a file or export your current targets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Import Section */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-white">
              <Upload className="h-4 w-4" />
              Import Targets
            </h4>
            <div className="rounded-lg border border-dashed border-violet-100/30 bg-gray-800/10 p-6 text-center">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-sm text-violet-300 hover:text-violet-200"
              >
                Click to upload a file (.txt or .csv)
              </label>
              <p className="mt-2 text-xs text-gray-400">
                One target per line: IPs, CIDR, ranges, or domains
              </p>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-white">
              <Download className="h-4 w-4" />
              Export Targets
            </h4>
            <Button
              onClick={handleExport}
              disabled={currentTargets.length === 0}
              variant="outline"
              className="w-full"
            >
              Export {currentTargets.length} Target
              {currentTargets.length !== 1 ? "s" : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TargetImportExportDialog;


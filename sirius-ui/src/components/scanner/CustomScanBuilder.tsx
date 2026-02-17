import React, { useState, useMemo } from "react";
import { api } from "~/utils/api";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { type Template } from "~/server/api/routers/templates";

interface CustomScanBuilderProps {
  initialTemplateId: string;
  onSave: (templateId: string) => void;
  onCancel: () => void;
}

const CustomScanBuilder: React.FC<CustomScanBuilderProps> = ({
  initialTemplateId,
  onSave,
  onCancel,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScripts, setSelectedScripts] = useState<string[]>([]);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const { data: template } = api.templates.getTemplate.useQuery({
    id: initialTemplateId,
  });
  const { data: scripts, isLoading } = api.scripts.getScripts.useQuery();
  const createTemplateMutation = api.templates.createTemplate.useMutation();
  const utils = api.useContext();

  // Initialize selected scripts from template
  React.useEffect(() => {
    if (template && selectedScripts.length === 0) {
      setSelectedScripts(template.enabled_scripts);
    }
  }, [template, selectedScripts.length]);

  // Group scripts by protocol
  const scriptsByProtocol = useMemo(() => {
    if (!scripts) return {};

    const grouped: Record<string, typeof scripts> = {};
    scripts.forEach((script) => {
      const protocol = script.protocol || "other";
      if (!grouped[protocol]) {
        grouped[protocol] = [];
      }
      grouped[protocol]!.push(script);
    });

    return grouped;
  }, [scripts]);

  // Filter scripts based on search
  const filteredProtocols = useMemo(() => {
    if (!searchQuery) return scriptsByProtocol;

    const filtered: Record<string, typeof scripts> = {};
    Object.entries(scriptsByProtocol).forEach(([protocol, protocolScripts]) => {
      const matchingScripts = protocolScripts?.filter(
        (script) =>
          script.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          script.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchingScripts && matchingScripts.length > 0) {
        filtered[protocol] = matchingScripts;
      }
    });

    return filtered;
  }, [scriptsByProtocol, searchQuery]);

  const handleToggleScript = (scriptId: string) => {
    setSelectedScripts((prev) =>
      prev.includes(scriptId)
        ? prev.filter((id) => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const handleToggleProtocol = (protocol: string) => {
    const protocolScripts = scriptsByProtocol[protocol] || [];
    const protocolScriptIds = protocolScripts.map((s) => s.id);
    const allSelected = protocolScriptIds.every((id) =>
      selectedScripts.includes(id)
    );

    if (allSelected) {
      // Deselect all scripts in this protocol
      setSelectedScripts((prev) =>
        prev.filter((id) => !protocolScriptIds.includes(id))
      );
    } else {
      // Select all scripts in this protocol
      setSelectedScripts((prev) => [
        ...prev.filter((id) => !protocolScriptIds.includes(id)),
        ...protocolScriptIds,
      ]);
    }
  };

  const handleSelectAll = () => {
    if (scripts) {
      setSelectedScripts(scripts.map((s) => s.id));
    }
  };

  const handleDeselectAll = () => {
    setSelectedScripts([]);
  };

  const handleSave = async () => {
    if (saveAsTemplate) {
      // Create new template
      if (!templateName) {
        alert("Please enter a template name");
        return;
      }

      try {
        const newTemplate = await createTemplateMutation.mutateAsync({
          id: templateName.toLowerCase().replace(/\s+/g, "-"),
          name: templateName,
          description: templateDescription || "Custom scan template",
          type: "custom",
          enabled_scripts: selectedScripts,
          scan_options: template?.scan_options || {
            scan_types: ["enumeration", "vulnerability"],
            port_range: "1-10000",
            aggressive: false,
            max_retries: 2,
            parallel: true,
          },
        });

        await utils.templates.getTemplates.invalidate();
        onSave(newTemplate.id);
      } catch (error) {
        console.error("Failed to create template:", error);
        alert("Failed to create template. Please try again.");
      }
    } else {
      // Use for this scan only (create a temporary template ID)
      const tempId = `temp-${Date.now()}`;
      onSave(tempId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-violet-100">Loading scripts...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-violet-100/30 bg-violet-950/20 p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-violet-100">
          Customize Scan
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-violet-100 hover:bg-violet-800/20"
        >
          Cancel
        </Button>
      </div>

      {/* Search and Actions */}
      <div className="flex gap-2">
        <Input
          placeholder="Search scripts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-violet-100/30 bg-transparent text-violet-100"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="border-violet-100/30 text-violet-100"
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeselectAll}
          className="border-violet-100/30 text-violet-100"
        >
          Deselect All
        </Button>
      </div>

      {/* Script Selection */}
      <div className="max-h-96 overflow-y-auto rounded-md border border-violet-100/20 bg-violet-950/10 p-4">
        <div className="space-y-4">
          {Object.entries(filteredProtocols).map(
            ([protocol, protocolScripts]) => {
              const allSelected = protocolScripts?.every((s) =>
                selectedScripts.includes(s.id)
              );
              const someSelected = protocolScripts?.some((s) =>
                selectedScripts.includes(s.id)
              );

              return (
                <div key={protocol} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = !allSelected && !!someSelected;
                        }
                      }}
                      onChange={() => handleToggleProtocol(protocol)}
                      className="h-4 w-4 rounded border-violet-100/30"
                    />
                    <span className="font-medium capitalize text-violet-100">
                      {protocol} ({protocolScripts?.length || 0})
                    </span>
                  </div>
                  <div className="ml-6 space-y-1">
                    {protocolScripts?.map((script) => (
                      <div key={script.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedScripts.includes(script.id)}
                          onChange={() => handleToggleScript(script.id)}
                          className="h-4 w-4 rounded border-violet-100/30"
                        />
                        <label className="text-sm text-violet-200">
                          {script.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Selected Count */}
      <div className="text-sm text-violet-300">
        {selectedScripts.length} script{selectedScripts.length !== 1 ? "s" : ""}{" "}
        selected
      </div>

      {/* Save Options */}
      <div className="space-y-3 rounded-md border border-violet-100/20 bg-violet-950/10 p-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="h-4 w-4 rounded border-violet-100/30"
          />
          <label className="text-sm text-violet-100">
            Save as reusable template
          </label>
        </div>

        {saveAsTemplate && (
          <div className="space-y-2">
            <Input
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="border-violet-100/30 bg-transparent text-violet-100"
            />
            <Input
              placeholder="Template description (optional)"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              className="border-violet-100/30 bg-transparent text-violet-100"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-violet-100/30 text-violet-100"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          
          disabled={selectedScripts.length === 0}
        >
          {saveAsTemplate ? "Save Template" : "Use for Scan"}
        </Button>
      </div>
    </div>
  );
};

export default CustomScanBuilder;




import React from "react";
import { api } from "~/utils/api";

interface TemplateSelectorProps {
  value: string; // template ID
  onChange: (templateId: string) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  value,
  onChange,
}) => {
  const { data: templates, isLoading } = api.templates.getTemplates.useQuery();

  const selectedTemplate = templates?.find((t) => t.id === value);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-violet-100">
        Scan Template
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-md border border-violet-100/30 bg-transparent px-3 text-violet-100"
        disabled={isLoading}
      >
        {isLoading ? (
          <option>Loading templates...</option>
        ) : templates && templates.length > 0 ? (
          templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))
        ) : (
          <option>No templates available</option>
        )}
      </select>
      {selectedTemplate && (
        <div className="text-xs text-violet-300">
          {selectedTemplate.description}
        </div>
      )}
    </div>
  );
};

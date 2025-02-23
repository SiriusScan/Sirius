import { type ScanTemplate } from "~/types/scanTypes";

interface TemplatePickerProps {
  value: ScanTemplate;
  onChange: (template: ScanTemplate) => void;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-violet-100">Scan Template</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ScanTemplate)}
        className="rounded-md border border-violet-700/10 bg-transparent p-2 text-violet-100"
      >
        <option value="quick">Quick Scan</option>
        <option value="full">Full Scan</option>
      </select>
    </div>
  );
}; 
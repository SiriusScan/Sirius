import React, { useState, useMemo } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { TemplateFilters } from "./TemplateFilters";
import {
  Plus,
  Eye,
  Edit,
  Play,
  Trash2,
  Monitor,
  Apple,
  HardDrive,
  FileText,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { SeverityBadge } from "~/components/shared/SeverityBadge";
import type { AgentTemplate } from "~/types/agentTemplateTypes";
import type {
  TemplateLibraryFilters,
  TemplateViewMode,
} from "~/types/templateBuilderTypes";
import { initialFilterState } from "~/types/templateBuilderTypes";
import { cn } from "~/components/lib/utils";

interface TemplateLibraryProps {
  templates: AgentTemplate[];
  onCreateNew: () => void;
  onView: (template: AgentTemplate) => void;
  onEdit: (template: AgentTemplate) => void;
  onRun: (template: AgentTemplate) => void;
  onDelete: (template: AgentTemplate) => void;
  isLoading?: boolean;
}

const severityColors: Record<string, string> = {
  critical: "border-red-500/50 bg-red-500/10",
  high: "border-orange-500/50 bg-orange-500/10",
  medium: "border-yellow-500/50 bg-yellow-500/10",
  low: "border-green-500/50 bg-green-500/10",
  info: "border-blue-500/50 bg-blue-500/10",
};

const platformIcons: Record<string, React.ReactNode> = {
  linux: <Monitor className="h-4 w-4" />,
  darwin: <Apple className="h-4 w-4" />,
  windows: <HardDrive className="h-4 w-4" />,
};

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  templates,
  onCreateNew,
  onView,
  onEdit,
  onRun,
  onDelete,
  isLoading = false,
}) => {
  const [filters, setFilters] =
    useState<TemplateLibraryFilters>(initialFilterState);
  const [viewMode, setViewMode] = useState<TemplateViewMode>("grid");
  const [expandedSections, setExpandedSections] = useState<{
    standard: boolean;
    custom: boolean;
  }>({ standard: true, custom: true });

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Apply search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.id.toLowerCase().includes(search) ||
          t.author.toLowerCase().includes(search) ||
          (t as any).tags?.some((tag: string) =>
            tag.toLowerCase().includes(search)
          )
      );
    }

    // Apply severity filter
    if (filters.severity.length > 0) {
      result = result.filter((t) => filters.severity.includes(t.severity));
    }

    // Apply platform filter
    if (filters.platforms.length > 0) {
      result = result.filter((t) =>
        filters.platforms.some((p) => t.platforms?.includes(p))
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      result = result.filter((t) => filters.type.includes(t.type));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "severity":
          const severityOrder = ["critical", "high", "medium", "low", "info"];
          comparison =
            severityOrder.indexOf(a.severity) -
            severityOrder.indexOf(b.severity);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return filters.sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [templates, filters]);

  // Group templates by type
  const groupedTemplates = useMemo(() => {
    return {
      standard: filteredTemplates.filter((t) => t.type === "repository"),
      custom: filteredTemplates.filter((t) => t.type === "custom"),
    };
  }, [filteredTemplates]);

  const toggleSection = (section: "standard" | "custom") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-400">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Template Library</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage vulnerability detection templates
          </p>
        </div>
        <Button
          onClick={onCreateNew}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <TemplateFilters
        filters={filters}
        onFiltersChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalCount={templates.length}
        filteredCount={filteredTemplates.length}
      />

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="scanner-section border-gray-700 bg-gray-800/50">
          <div className="scanner-section-padding flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No templates found
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              {filters.search ||
              filters.severity.length > 0 ||
              filters.platforms.length > 0 ||
              filters.type.length > 0
                ? "Try adjusting your filters"
                : "Get started by creating your first template"}
            </p>
            {templates.length === 0 && (
              <Button
                onClick={onCreateNew}
                className="mt-4"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Standard Templates */}
      {groupedTemplates.standard.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("standard")}
            className="flex w-full items-center gap-2 text-left"
          >
            {expandedSections.standard ? (
              <ChevronDown className="h-5 w-5 text-violet-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-violet-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              Repository Templates
            </h3>
            <Badge className="bg-gray-700 text-gray-300">
              {groupedTemplates.standard.length}
            </Badge>
          </button>

          {expandedSections.standard && (
            <div
              className={cn(
                "gap-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col"
              )}
            >
              {groupedTemplates.standard.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onView={onView}
                  onEdit={onEdit}
                  onRun={onRun}
                  onDelete={onDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Templates */}
      {groupedTemplates.custom.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("custom")}
            className="flex w-full items-center gap-2 text-left"
          >
            {expandedSections.custom ? (
              <ChevronDown className="h-5 w-5 text-violet-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-violet-400" />
            )}
            <h3 className="text-lg font-semibold text-white">
              Custom Templates
            </h3>
            <Badge className="bg-gray-700 text-gray-300">
              {groupedTemplates.custom.length}
            </Badge>
          </button>

          {expandedSections.custom && (
            <div
              className={cn(
                "gap-4",
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col"
              )}
            >
              {groupedTemplates.custom.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onView={onView}
                  onEdit={onEdit}
                  onRun={onRun}
                  onDelete={onDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: AgentTemplate;
  onView: (template: AgentTemplate) => void;
  onEdit: (template: AgentTemplate) => void;
  onRun: (template: AgentTemplate) => void;
  onDelete: (template: AgentTemplate) => void;
  viewMode: TemplateViewMode;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onView,
  onEdit,
  onRun,
  onDelete,
  viewMode,
}) => {
  const isCustom = template.type === "custom";
  const tags = (template as any).tags || [];
  const displayTags = tags.slice(0, 3);
  const remainingTags = tags.length - 3;

  if (viewMode === "list") {
    return (
      <div
        className={cn(
          "scanner-section border-2 transition-all hover:shadow-lg hover:shadow-violet-500/20",
          severityColors[template.severity] || "border-gray-700 bg-gray-800/50"
        )}
      >
        <div className="scanner-section-padding flex items-center gap-4 overflow-hidden p-4">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-2">
              <h4 className="truncate text-base font-semibold text-white">
                {template.name}
              </h4>
              <SeverityBadge
                severity={template.severity}
                className="flex-shrink-0"
              />
              <Badge className="flex-shrink-0 bg-gray-700 text-xs text-gray-300">
                {template.type}
              </Badge>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-gray-400">
              {template.description}
            </p>
          </div>

          {/* Platforms */}
          {template.platforms && template.platforms.length > 0 && (
            <div className="flex flex-shrink-0 items-center gap-2 text-gray-400">
              {template.platforms.map((platform) => (
                <div key={platform}>{platformIcons[platform]}</div>
              ))}
            </div>
          )}

          {/* Tags */}
          {displayTags.length > 0 && (
            <div className="hidden flex-shrink-0 items-center gap-1.5 md:flex">
              {displayTags.map((tag: string) => (
                <Badge
                  key={tag}
                  className="bg-gray-700 text-xs text-gray-300"
                >
                  {tag}
                </Badge>
              ))}
              {remainingTags > 0 && (
                <Badge className="bg-gray-700 text-xs text-gray-300">
                  +{remainingTags}
                </Badge>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center gap-1.5">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onView(template)}
              className="h-8 w-8 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onRun(template)}
              className="h-8 w-8 border-violet-500/30 text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/10"
            >
              <Play className="h-4 w-4" />
            </Button>
            {isCustom && (
              <>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(template)}
                  className="h-8 w-8 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onDelete(template)}
                  className="h-8 w-8 border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className={cn(
        "scanner-section group border-2 transition-all hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/20",
        severityColors[template.severity] || "border-gray-700 bg-gray-800/50"
      )}
    >
      <div className="scanner-section-padding space-y-3 p-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-2 flex-1 text-base font-semibold text-white">
              {template.name}
            </h4>
            <SeverityBadge
              severity={template.severity}
              className="flex-shrink-0"
            />
          </div>
          <Badge className="bg-gray-700 text-xs text-gray-300">
            {template.type}
          </Badge>
        </div>

        {/* Description */}
        <p className="line-clamp-2 text-sm text-gray-400">
          {template.description}
        </p>

        {/* Platforms */}
        {template.platforms && template.platforms.length > 0 && (
          <div className="flex items-center gap-2 text-gray-400">
            {template.platforms.map((platform) => (
              <span key={platform}>{platformIcons[platform]}</span>
            ))}
          </div>
        )}

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTags.map((tag: string) => (
              <Badge key={tag} className="bg-gray-700 text-xs text-gray-300">
                {tag}
              </Badge>
            ))}
            {remainingTags > 0 && (
              <Badge className="bg-gray-700 text-xs text-gray-300">
                +{remainingTags}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 border-t border-gray-700 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(template)}
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            <Eye className="mr-1 h-3 w-3" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRun(template)}
            className="flex-1 border-violet-500/30 text-violet-400 hover:border-violet-500/50 hover:bg-violet-500/10"
          >
            <Play className="mr-1 h-3 w-3" />
            Run
          </Button>
        </div>

        {isCustom && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(template)}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            >
              <Edit className="mr-1 h-3 w-3" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(template)}
              className="flex-1 border-red-500/30 text-red-400 hover:border-red-500/50 hover:bg-red-500/10"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { api } from "~/utils/api";
import { TemplateLibrary } from "../templates/TemplateLibrary";
import { TemplateBuilder } from "../templates/TemplateBuilder";
import { TemplateViewer } from "../templates/TemplateViewer";
import type { AgentTemplate } from "~/types/agentTemplateTypes";
import type {
  TemplateBuilderView,
  TemplateFormState,
} from "~/types/templateBuilderTypes";
import {
  convertFormToYAML,
  generateTemplateFilename,
} from "~/utils/templateYaml";

const AgentTemplatesTab: React.FC = () => {
  const [currentView, setCurrentView] =
    useState<TemplateBuilderView>("library");
  const [viewingTemplate, setViewingTemplate] = useState<AgentTemplate | null>(
    null
  );
  const [editingTemplate, setEditingTemplate] = useState<AgentTemplate | null>(
    null
  );

  const { data: templates, isLoading } =
    api.agentTemplates.getTemplates.useQuery();
  const uploadMutation = api.agentTemplates.uploadTemplate.useMutation();
  const updateMutation = api.agentTemplates.updateTemplate.useMutation();
  const deleteMutation = api.agentTemplates.deleteTemplate.useMutation();
  const testMutation = api.agentTemplates.testTemplate.useMutation();
  const utils = api.useContext();

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setCurrentView("builder");
  };

  // Both flows go through the authenticated tRPC procedure so the
  // X-API-Key header is injected by apiFetch. A raw fetch() against
  // /api/agent-templates/<id> bypasses that and is rejected 401 by the
  // global APIKeyMiddleware in sirius-api.
  const handleView = async (template: AgentTemplate) => {
    try {
      const fullTemplate = await utils.agentTemplates.getTemplate.fetch({
        id: template.id,
      });
      if (!fullTemplate) {
        throw new Error(`Template ${template.id} not found`);
      }
      setViewingTemplate(fullTemplate);
      setCurrentView("viewer");
    } catch (error) {
      console.error("Failed to fetch template:", error);
      const detail = error instanceof Error ? error.message : String(error);
      alert(`Failed to load template: ${detail}`);
    }
  };

  const handleEdit = async (template: AgentTemplate) => {
    try {
      const fullTemplate = await utils.agentTemplates.getTemplate.fetch({
        id: template.id,
      });
      if (!fullTemplate) {
        throw new Error(`Template ${template.id} not found`);
      }
      setEditingTemplate(fullTemplate);
      setCurrentView("builder");
    } catch (error) {
      console.error("Failed to fetch template for editing:", error);
      const detail = error instanceof Error ? error.message : String(error);
      alert(`Failed to load template for editing: ${detail}`);
    }
  };

  const handleRun = async (template: AgentTemplate) => {
    try {
      await testMutation.mutateAsync({
        templateId: template.id,
        agentId: "all",
      });
      alert(`Template "${template.name}" execution initiated on all agents`);
    } catch (error) {
      alert("Failed to run template");
    }
  };

  const handleDelete = async (template: AgentTemplate) => {
    if (
      !confirm(`Are you sure you want to delete template "${template.name}"?`)
    ) {
      return;
    }

    try {
      await deleteMutation.mutateAsync({ id: template.id });
      await utils.agentTemplates.getTemplates.invalidate();
      if (viewingTemplate?.id === template.id) {
        setViewingTemplate(null);
      }
    } catch (error) {
      alert("Failed to delete template");
    }
  };

  const handleSaveTemplate = async (template: TemplateFormState) => {
    try {
      // Convert form state to YAML
      const yamlContent = convertFormToYAML(template);
      const filename = generateTemplateFilename(template.id);

      // Debug logging
      console.log("🔍 Form Data:", template);
      console.log("📄 Generated YAML:\n", yamlContent);

      if (editingTemplate) {
        await updateMutation.mutateAsync({
          id: editingTemplate.id,
          content: yamlContent,
          filename: filename,
          author: template.author,
        });
      } else {
        await uploadMutation.mutateAsync({
          content: yamlContent,
          filename: filename,
          author: template.author,
        });
      }

      await utils.agentTemplates.getTemplates.invalidate();

      // Clear edit target so the next Save Changes doesn't accidentally
      // re-target an old id when the operator opens a different template.
      setEditingTemplate(null);
      setCurrentView("library");
    } catch (error) {
      console.error("Failed to save template:", error);
      throw error; // Re-throw so TemplateBuilder can handle it
    }
  };

  // Render based on current view
  if (currentView === "viewer" && viewingTemplate) {
    return (
      <TemplateViewer
        template={viewingTemplate}
        onClose={() => {
          setCurrentView("library");
          setViewingTemplate(null);
        }}
        onEdit={handleEdit}
        onRun={handleRun}
      />
    );
  }

  if (currentView === "builder") {
    return (
      <TemplateBuilder
        onCancel={() => setCurrentView("library")}
        onSave={handleSaveTemplate}
        editingTemplate={editingTemplate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Template Library */}
      <TemplateLibrary
        templates={templates || []}
        onCreateNew={handleCreateNew}
        onView={handleView}
        onEdit={handleEdit}
        onRun={handleRun}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      {/* TODO: Template Viewer Modal will be added in Phase 4 */}
    </div>
  );
};

export default AgentTemplatesTab;

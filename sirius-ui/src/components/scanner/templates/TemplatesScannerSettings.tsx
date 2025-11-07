import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/lib/ui/tabs";
import TemplateListTab from "./TemplateListTab";
import TemplateEditorTab from "./TemplateEditorTab";
import TemplateSettingsTab from "./TemplateSettingsTab";

const TemplatesScannerSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [editingTemplateId, setEditingTemplateId] = useState<
    string | undefined
  >();

  const handleEditTemplate = (templateId: string) => {
    setEditingTemplateId(templateId);
    setActiveTab("editor");
  };

  const handleCreateNew = () => {
    setEditingTemplateId(undefined);
    setActiveTab("editor");
  };

  const handleEditorClose = () => {
    setEditingTemplateId(undefined);
    setActiveTab("list");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Template Management</h3>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800/50">
          <TabsTrigger value="list">Templates</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <TemplateListTab
            onEdit={handleEditTemplate}
            onCreateNew={handleCreateNew}
          />
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <TemplateEditorTab
            templateId={editingTemplateId}
            onClose={handleEditorClose}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <TemplateSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatesScannerSettings;

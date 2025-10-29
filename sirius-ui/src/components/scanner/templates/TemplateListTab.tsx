import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Edit, Trash2, Plus } from "lucide-react";
import { api } from "~/utils/api";

interface TemplateListTabProps {
  onEdit: (templateId: string) => void;
  onCreateNew: () => void;
}

const TemplateListTab: React.FC<TemplateListTabProps> = ({
  onEdit,
  onCreateNew,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const utils = api.useContext();
  const { data: templates, isLoading } = api.templates.getTemplates.useQuery();

  const deleteMutation = api.templates.deleteTemplate.useMutation({
    onSuccess: () => {
      utils.templates.getTemplates.invalidate();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
  });

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate({ id: templateToDelete });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading templates...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-medium text-white">Scan Profiles</h4>
          <p className="text-xs text-gray-400">
            Manage reusable scan configurations with custom NSE scripts
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-violet-600 text-white hover:bg-violet-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Profile
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-gray-700">
        <table className="w-full text-white">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-2 text-left">Profile Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">NSE Scripts</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates && templates.length > 0 ? (
              templates.map((template) => {
                const isSystem = template.type === "system";
                const scriptCount = template.enabled_scripts?.length || 0;

                return (
                  <tr
                    key={template.id}
                    className="border-t border-gray-700 transition-colors hover:bg-violet-600/5"
                  >
                    <td className="px-4 py-3 font-medium">{template.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {template.description || "No description"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className="bg-violet-800/20 text-violet-200"
                      >
                        {scriptCount} {scriptCount === 1 ? "script" : "scripts"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {isSystem ? (
                        <Badge
                          variant="secondary"
                          className="bg-blue-600/20 text-blue-200"
                        >
                          System
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-gray-700/20 text-gray-300"
                        >
                          Custom
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(template.id)}
                          className="border-gray-600 hover:bg-violet-600/10"
                          title={isSystem ? "View profile" : "Edit profile"}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {!isSystem && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteClick(template.id)}
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                            title="Delete profile"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  No scan profiles available. Create your first profile to get
                  started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Scan Profile</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this scan profile? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={deleteMutation.isLoading}
            >
              {deleteMutation.isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemplateListTab;

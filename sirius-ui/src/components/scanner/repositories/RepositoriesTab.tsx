import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { Badge } from "~/components/lib/ui/badge";
import { Card, CardContent } from "~/components/lib/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/lib/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { Switch } from "~/components/lib/ui/switch";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/lib/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "~/components/lib/ui/alert";
import { api } from "~/utils/api";
import type { Repository, AddRepositoryInput } from "~/types/repositoryTypes";
import { cn } from "~/components/lib/utils";

export const RepositoriesTab: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRepository, setSelectedRepository] =
    useState<Repository | null>(null);
  const [formData, setFormData] = useState<AddRepositoryInput>({
    name: "",
    url: "",
    branch: "main",
    priority: 1,
    enabled: true,
  });

  // Query repositories
  const {
    data: repositories,
    isLoading,
    refetch,
  } = api.repositories.list.useQuery();
  const trpcContext = api.useContext();

  // Mutations
  const addMutation = api.repositories.add.useMutation({
    onSuccess: () => {
      toast.success("Repository added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      trpcContext.repositories.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to add repository", {
        description: error.message,
      });
    },
  });

  const updateMutation = api.repositories.update.useMutation({
    onSuccess: () => {
      toast.success("Repository updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRepository(null);
      trpcContext.repositories.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to update repository", {
        description: error.message,
      });
    },
  });

  const deleteMutation = api.repositories.delete.useMutation({
    onSuccess: () => {
      toast.success("Repository deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedRepository(null);
      trpcContext.repositories.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to delete repository", {
        description: error.message,
      });
    },
  });

  const syncMutation = api.repositories.sync.useMutation({
    onSuccess: () => {
      toast.success("Sync started", {
        description: "Repository sync has been queued",
      });
      trpcContext.repositories.list.invalidate();
    },
    onError: (error) => {
      toast.error("Failed to start sync", {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      branch: "main",
      priority: 1,
      enabled: true,
    });
  };

  const handleAdd = () => {
    addMutation.mutate(formData);
  };

  const handleEdit = (repo: Repository) => {
    setSelectedRepository(repo);
    setFormData({
      name: repo.name,
      url: repo.url,
      branch: repo.branch,
      priority: repo.priority,
      enabled: repo.enabled,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!selectedRepository) return;
    updateMutation.mutate({
      id: selectedRepository.id,
      ...formData,
    });
  };

  const handleDelete = (repo: Repository) => {
    setSelectedRepository(repo);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedRepository) return;
    deleteMutation.mutate({ id: selectedRepository.id });
  };

  const handleSync = (repo: Repository) => {
    syncMutation.mutate({ id: repo.id });
  };

  const getStatusBadge = (
    status: Repository["status"],
    errorMessage: string | null
  ) => {
    switch (status) {
      case "synced":
        return (
          <Badge className="border-green-500/50 bg-green-500/10 text-green-400">
            <CheckCircle className="mr-1 h-3 w-3" />
            Synced
          </Badge>
        );
      case "syncing":
        return (
          <Badge className="border-blue-500/50 bg-blue-500/10 text-blue-400">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Syncing
          </Badge>
        );
      case "error":
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="cursor-help border-red-500/50 bg-red-500/10 text-red-400">
                  <XCircle className="mr-1 h-3 w-3" />
                  Error
                </Badge>
              </TooltipTrigger>
              {errorMessage && (
                <TooltipContent className="max-w-md border-red-500/50 bg-red-950/90 text-red-200">
                  <p className="text-sm">{errorMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        );
      case "never_synced":
        return (
          <Badge className="border-gray-500/50 bg-gray-500/10 text-gray-400">
            <AlertCircle className="mr-1 h-3 w-3" />
            Never Synced
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Repositories</h2>
          <p className="mt-1 text-sm text-gray-400">
            Manage template repository sources
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-violet-600 text-white hover:bg-violet-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Repository
        </Button>
      </div>

      {/* Repositories Table */}
      {isLoading ? (
        <Card className="border-gray-700 bg-gray-800/50">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
          </CardContent>
        </Card>
      ) : repositories && repositories.length > 0 ? (
        <Card className="border-gray-700 bg-gray-800/50">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-700/50">
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">URL</TableHead>
                <TableHead className="text-gray-400">Branch</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Templates</TableHead>
                <TableHead className="text-gray-400">Last Sync</TableHead>
                <TableHead className="text-gray-400">Priority</TableHead>
                <TableHead className="text-gray-400">Enabled</TableHead>
                <TableHead className="text-right text-gray-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repo) => (
                <TableRow
                  key={repo.id}
                  className="border-gray-700 hover:bg-gray-700/50"
                >
                  <TableCell className="font-medium text-white">
                    {repo.name}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-violet-400 hover:text-violet-300 hover:underline"
                    >
                      {repo.url.replace("https://", "").substring(0, 30)}...
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <Badge className="border border-gray-600 bg-gray-700/50 text-gray-300">
                      {repo.branch}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(repo.status, repo.error_message)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {repo.template_count}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {formatDate(repo.last_sync)}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {repo.priority}
                  </TableCell>
                  <TableCell>
                    <Switch checked={repo.enabled} disabled />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(repo)}
                        disabled={
                          syncMutation.isLoading || repo.status === "syncing"
                        }
                        className="border-gray-700 text-gray-300 hover:bg-gray-700"
                      >
                        <RefreshCw
                          className={cn(
                            "h-4 w-4",
                            (syncMutation.isLoading ||
                              repo.status === "syncing") &&
                              "animate-spin"
                          )}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(repo)}
                        className="border-gray-700 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(repo)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <Card className="border-gray-700 bg-gray-800/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-medium text-white">
              No repositories configured
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              Add a repository to start syncing templates
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="mt-4 bg-violet-600 text-white hover:bg-violet-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Repository
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Repository Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="border-gray-700 bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Repository</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new template repository source
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Templates"
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label htmlFor="url" className="text-gray-300">
                Repository URL
              </Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://github.com/myorg/templates"
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label htmlFor="branch" className="text-gray-300">
                Branch
              </Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                placeholder="main"
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-gray-300">
                Priority
              </Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="border-gray-700 bg-gray-900 text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                Lower number = higher priority. Template conflicts fail sync and
                require manual resolution.
              </p>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled" className="text-gray-300">
                Enabled
              </Label>
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                resetForm();
              }}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                addMutation.isLoading || !formData.name || !formData.url
              }
              className="bg-violet-600 text-white hover:bg-violet-500"
            >
              {addMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Repository
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Repository Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="border-gray-700 bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Repository</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update repository configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-gray-300">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-url" className="text-gray-300">
                Repository URL
              </Label>
              <Input
                id="edit-url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-branch" className="text-gray-300">
                Branch
              </Label>
              <Input
                id="edit-branch"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div>
              <Label htmlFor="edit-priority" className="text-gray-300">
                Priority
              </Label>
              <Input
                id="edit-priority"
                type="number"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="border-gray-700 bg-gray-900 text-white"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-enabled" className="text-gray-300">
                Enabled
              </Label>
              <Switch
                id="edit-enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, enabled: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setSelectedRepository(null);
                resetForm();
              }}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isLoading}
              className="bg-violet-600 text-white hover:bg-violet-500"
            >
              {updateMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Repository"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="border-gray-700 bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Repository</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedRepository?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedRepository(null);
              }}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              {deleteMutation.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Repository
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

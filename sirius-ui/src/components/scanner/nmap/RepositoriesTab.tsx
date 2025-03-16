import React, { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { api } from "~/utils/api";
import type { Repository } from "~/server/api/routers/store";
import { toast } from "sonner";

const RepositoriesTab: React.FC = () => {
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoUrl, setNewRepoUrl] = useState("");
  const [nameError, setNameError] = useState("");
  const [urlError, setUrlError] = useState("");

  const utils = api.useContext();

  // Fetch repositories
  const {
    data: repoData,
    isLoading,
    error,
  } = api.store.getNseRepositories.useQuery();

  // Initialize repositories if needed
  const { mutate: initializeRepos } =
    api.store.initializeNseRepositories.useMutation({
      onSuccess: () => {
        utils.store.getNseRepositories.invalidate();
      },
    });

  // Add repository mutation
  const { mutate: addRepository, isLoading: isAdding } =
    api.store.addNseRepository.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Repository added successfully");
          setNewRepoName("");
          setNewRepoUrl("");
          utils.store.getNseRepositories.invalidate();
        } else {
          toast.error("Failed to add repository", {
            description: data.error,
          });
        }
      },
      onError: (error) => {
        toast.error("Failed to add repository", {
          description: error.message,
        });
      },
    });

  // Remove repository mutation
  const { mutate: removeRepository } =
    api.store.removeNseRepository.useMutation({
      onSuccess: (data) => {
        if (data.success) {
          toast.success("Repository removed successfully");
          utils.store.getNseRepositories.invalidate();
        } else {
          toast.error("Failed to remove repository", {
            description: data.error,
          });
        }
      },
      onError: (error) => {
        toast.error("Failed to remove repository", {
          description: error.message,
        });
      },
    });

  const validateForm = (): boolean => {
    let isValid = true;
    setNameError("");
    setUrlError("");

    if (!newRepoName.trim()) {
      setNameError("Repository name is required");
      isValid = false;
    }

    if (!newRepoUrl.trim()) {
      setUrlError("Repository URL is required");
      isValid = false;
    } else if (
      !newRepoUrl.startsWith("http://") &&
      !newRepoUrl.startsWith("https://") &&
      !newRepoUrl.startsWith("git@")
    ) {
      setUrlError("Repository URL must be a valid git URL");
      isValid = false;
    }

    return isValid;
  };

  const handleAddRepository = () => {
    if (!validateForm()) return;

    addRepository({
      name: newRepoName.trim(),
      url: newRepoUrl.trim(),
    });
  };

  const handleRemoveRepository = (name: string) => {
    if (confirm(`Are you sure you want to remove the repository '${name}'?`)) {
      removeRepository({
        name,
      });
    }
  };

  // Initialize repositories if none exist
  if (!isLoading && (!repoData || repoData.repositories.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-4">
        <p className="text-gray-400">No repositories found</p>
        <Button
          onClick={() => initializeRepos()}
          variant="default"
          className="bg-violet-600 hover:bg-violet-700"
        >
          Initialize with Default Repository
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading repositories...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-800 bg-red-900/20 p-4 text-white">
        <p className="font-medium">Failed to load repositories</p>
        <p className="text-sm text-gray-300">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-white">
          NSE Script Repositories
        </h3>
        <p className="text-sm text-gray-400">
          Manage Git repositories for NSE scripts. These repositories will be
          synced when scripts are initialized.
        </p>
      </div>

      {/* Repository List */}
      <div className="overflow-hidden rounded-md border border-gray-700">
        <table className="w-full text-white">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">URL</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {repoData?.repositories.map((repo: Repository) => (
              <tr
                key={repo.name}
                className="border-t border-gray-700 transition-colors hover:bg-violet-600/10"
              >
                <td className="px-4 py-3">{repo.name}</td>
                <td className="px-4 py-3">
                  <code className="rounded bg-gray-800 px-2 py-1 text-xs">
                    {repo.url}
                  </code>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRepository(repo.name)}
                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Repository Form */}
      <div className="space-y-4 rounded-md border border-gray-700 p-4">
        <h4 className="text-md font-medium text-white">Add New Repository</h4>

        <div className="space-y-2">
          <Label htmlFor="repoName" className="text-sm text-gray-400">
            Repository Name
          </Label>
          <Input
            id="repoName"
            placeholder="e.g., sirius-nse"
            value={newRepoName}
            onChange={(e) => {
              setNewRepoName(e.target.value);
              setNameError("");
            }}
            className={`w-full rounded-md border ${
              nameError ? "border-red-500" : "border-gray-600"
            } bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500`}
          />
          {nameError && <p className="text-xs text-red-500">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="repoUrl" className="text-sm text-gray-400">
            Repository URL
          </Label>
          <Input
            id="repoUrl"
            placeholder="e.g., https://github.com/SiriusScan/sirius-nse.git"
            value={newRepoUrl}
            onChange={(e) => {
              setNewRepoUrl(e.target.value);
              setUrlError("");
            }}
            className={`w-full rounded-md border ${
              urlError ? "border-red-500" : "border-gray-600"
            } bg-gray-800/20 px-4 py-2 text-white placeholder-gray-500`}
          />
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
        </div>

        <Button
          onClick={handleAddRepository}
          disabled={isAdding}
          className="mt-2 bg-violet-600 text-white hover:bg-violet-700"
        >
          {isAdding ? "Adding..." : "Add Repository"}
        </Button>
      </div>
    </div>
  );
};

export default RepositoriesTab;

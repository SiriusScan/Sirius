import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Badge } from "~/components/lib/ui/badge";
import { type ParsedTarget } from "~/utils/targetParser";
import { Save, Trash2, Download } from "lucide-react";

interface SavedTargetList {
  id: string;
  name: string;
  targets: ParsedTarget[];
  createdAt: string;
  lastUsed?: string;
}

interface SavedTargetListsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadList?: (targets: ParsedTarget[]) => void;
  currentTargets?: ParsedTarget[];
}

const STORAGE_KEY = "sirius-saved-target-lists";

const SavedTargetListsDialog: React.FC<SavedTargetListsDialogProps> = ({
  isOpen,
  onClose,
  onLoadList,
  currentTargets = [],
}) => {
  const [savedLists, setSavedLists] = useState<SavedTargetList[]>([]);
  const [newListName, setNewListName] = useState("");

  // Load saved lists from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedLists(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load saved lists:", e);
      }
    }
  }, [isOpen]);

  // Save lists to localStorage
  const persistLists = (lists: SavedTargetList[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
    setSavedLists(lists);
  };

  const handleSaveCurrentList = () => {
    if (!newListName.trim() || currentTargets.length === 0) return;

    const newList: SavedTargetList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      targets: currentTargets,
      createdAt: new Date().toISOString(),
    };

    persistLists([...savedLists, newList]);
    setNewListName("");
  };

  const handleLoadList = (list: SavedTargetList) => {
    if (onLoadList) {
      onLoadList(list.targets);

      // Update last used
      const updated = savedLists.map((l) =>
        l.id === list.id ? { ...l, lastUsed: new Date().toISOString() } : l
      );
      persistLists(updated);
    }
    onClose();
  };

  const handleDeleteList = (listId: string) => {
    persistLists(savedLists.filter((l) => l.id !== listId));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Saved Target Lists</DialogTitle>
          <DialogDescription>
            Save and load frequently used target lists for quick scanning.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Save Current List */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-white">
              <Save className="h-4 w-4" />
              Save Current Targets
            </h4>
            <div className="flex gap-2">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="flex-1 border-violet-100/30 bg-gray-800/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveCurrentList();
                  }
                }}
              />
              <Button
                onClick={handleSaveCurrentList}
                disabled={!newListName.trim() || currentTargets.length === 0}
                className="bg-violet-600 hover:bg-violet-500"
              >
                Save ({currentTargets.length})
              </Button>
            </div>
          </div>

          {/* Saved Lists */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-sm font-medium text-white">
              <Download className="h-4 w-4" />
              Saved Lists ({savedLists.length})
            </h4>

            {savedLists.length === 0 ? (
              <div className="rounded-lg border border-dashed border-violet-100/30 bg-gray-800/10 p-6 text-center">
                <p className="text-sm text-gray-400">
                  No saved lists yet. Save your current targets to create one.
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] space-y-2 overflow-y-auto">
                {savedLists.map((list) => (
                  <div
                    key={list.id}
                    className="flex items-center justify-between rounded-lg border border-gray-700/50 bg-gray-800/30 p-3 hover:bg-gray-800/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-white">{list.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {list.targets.length} targets
                        </Badge>
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Created: {formatDate(list.createdAt)}
                        {list.lastUsed && (
                          <span className="ml-2">
                            • Last used: {formatDate(list.lastUsed)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadList(list)}
                        className="bg-violet-600 hover:bg-violet-500"
                      >
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteList(list.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SavedTargetListsDialog;


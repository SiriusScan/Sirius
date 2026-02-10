import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/lib/ui/dialog";
import { Button } from "~/components/lib/ui/button";
import { Input } from "~/components/lib/ui/input";
import { Label } from "~/components/lib/ui/label";
import { PlatformSelector } from "../../shared/PlatformSelector";
import { WeightSlider } from "../../shared/WeightSlider";
import type {
  FileHashStepData,
  HashAlgorithm,
} from "~/types/templateBuilderTypes";
import type { Platform } from "~/types/agentTemplateTypes";
import { cn } from "~/components/lib/utils";

interface FileHashStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (step: FileHashStepData) => void;
  editingStep?: FileHashStepData | null;
}

const hashAlgorithms: HashAlgorithm[] = ["sha256", "sha1", "md5", "sha512"];

export const FileHashStepModal: React.FC<FileHashStepModalProps> = React.memo(
  ({ isOpen, onClose, onSave, editingStep }) => {
    const [formData, setFormData] = useState<Omit<FileHashStepData, "id">>({
      type: "file_hash",
      path: "",
      hash: "",
      algorithm: "sha256",
      platforms: [],
      weight: 1.0,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
      // Only reset when modal is opening, not closing
      if (!isOpen) return;

      if (editingStep) {
        setFormData({
          type: "file_hash",
          path: editingStep.path,
          hash: editingStep.hash,
          algorithm: editingStep.algorithm,
          platforms: editingStep.platforms,
          weight: editingStep.weight,
        });
      } else {
        // Reset form when opening for new step
        setFormData({
          type: "file_hash",
          path: "",
          hash: "",
          algorithm: "sha256",
          platforms: [],
          weight: 1.0,
        });
      }
      setErrors({});
    }, [editingStep, isOpen]);

    const validate = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.path.trim()) {
        newErrors.path = "File path is required";
      }

      if (!formData.hash.trim()) {
        newErrors.hash = "Expected hash is required";
      } else {
        // Validate hash format based on algorithm
        const hashLengths: Record<HashAlgorithm, number> = {
          md5: 32,
          sha1: 40,
          sha256: 64,
          sha512: 128,
        };
        const expectedLength = hashLengths[formData.algorithm];
        const cleanHash = formData.hash.replace(/[^a-fA-F0-9]/g, "");

        if (cleanHash.length !== expectedLength) {
          newErrors.hash = `${formData.algorithm.toUpperCase()} hash must be ${expectedLength} characters (found ${
            cleanHash.length
          })`;
        }
      }

      if (formData.platforms.length === 0) {
        newErrors.platforms = "Select at least one platform";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
      if (!validate()) {
        return;
      }

      const step: FileHashStepData = {
        ...formData,
        id: editingStep?.id || `step-${Date.now()}`,
      };

      onSave(step);
      onClose();
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl border-gray-700 bg-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingStep ? "Edit" : "Add"} File Hash Check
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Detect vulnerable files by comparing their hash values
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Path */}
            <div className="space-y-2">
              <Label htmlFor="file-path" className="text-gray-200">
                File Path <span className="text-red-400">*</span>
              </Label>
              <Input
                id="file-path"
                value={formData.path}
                onChange={(e) =>
                  setFormData({ ...formData, path: e.target.value })
                }
                placeholder="/usr/lib/example.so"
                className={cn(
                  "border-gray-700 bg-gray-900 font-mono text-white",
                  errors.path && "border-red-500"
                )}
              />
              <p className="text-xs text-gray-400">
                Absolute path to the file to check
              </p>
              {errors.path && (
                <p className="text-xs text-red-400">{errors.path}</p>
              )}
            </div>

            {/* Expected Hash */}
            <div className="space-y-2">
              <Label htmlFor="expected-hash" className="text-gray-200">
                Expected Hash <span className="text-red-400">*</span>
              </Label>
              <Input
                id="expected-hash"
                value={formData.hash}
                onChange={(e) =>
                  setFormData({ ...formData, hash: e.target.value })
                }
                placeholder="abc123def456..."
                className={cn(
                  "border-gray-700 bg-gray-900 font-mono text-sm text-white",
                  errors.hash && "border-red-500"
                )}
              />
              <p className="text-xs text-gray-400">
                Hash value to compare against (
                {formData.algorithm.toUpperCase()})
              </p>
              {errors.hash && (
                <p className="text-xs text-red-400">{errors.hash}</p>
              )}
            </div>

            {/* Hash Algorithm */}
            <div className="space-y-2">
              <Label className="text-gray-200">Hash Algorithm</Label>
              <div className="grid grid-cols-4 gap-2">
                {hashAlgorithms.map((algo) => (
                  <button
                    key={algo}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, algorithm: algo })
                    }
                    className={cn(
                      "rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
                      formData.algorithm === algo
                        ? "border-violet-500 bg-violet-500/20 text-violet-400"
                        : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                    )}
                  >
                    {algo.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div className="space-y-2">
              <PlatformSelector
                selected={formData.platforms}
                onChange={(platforms: Platform[]) =>
                  setFormData({ ...formData, platforms })
                }
              />
              {errors.platforms && (
                <p className="text-xs text-red-400">{errors.platforms}</p>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <WeightSlider
                value={formData.weight}
                onChange={(weight: number) =>
                  setFormData({ ...formData, weight })
                }
                helperText="How confident are you that this hash indicates the vulnerability?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              
            >
              {editingStep ? "Update Step" : "Add Step"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

FileHashStepModal.displayName = "FileHashStepModal";

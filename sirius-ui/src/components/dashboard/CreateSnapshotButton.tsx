import { useState } from "react";
import { Button } from "~/components/lib/ui/button";
import { api } from "~/utils/api";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "~/components/Toast";

export const CreateSnapshotButton: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { showToast } = useToast();
  const utils = api.useContext();

  const createSnapshot = api.statistics.createSnapshot.useMutation({
    onSuccess: (data) => {
      showToast(data.message || "Snapshot created successfully", "success");
      // Invalidate trends query to refresh chart
      void utils.statistics.getVulnerabilityTrends.invalidate();
      void utils.statistics.listSnapshots.invalidate();
      setIsCreating(false);
    },
    onError: (error) => {
      showToast(error.message || "Failed to create snapshot", "error");
      setIsCreating(false);
    },
  });

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await createSnapshot.mutateAsync();
    } catch (error) {
      // Error handling is done in onError callback
      console.error("Error creating snapshot:", error);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isCreating}
      size="sm"
      variant="outline"
      className="gap-2"
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          Create Snapshot
        </>
      )}
    </Button>
  );
};

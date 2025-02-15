// src/components/scanner/ScanNavigator.tsx
import React from "react";
import { Button } from "~/components/lib/ui/button";

interface ScanNavigatorProps {
  handleViewNavigator: (view: string) => void;
  view: string;
}

const ScanNavigator: React.FC<ScanNavigatorProps> = ({ handleViewNavigator, view }) => {
  return (
    <div className="flex gap-2">
      <Button
        variant={view === "scan" ? "secondary" : "default"}
        onClick={() => handleViewNavigator("scan")}
      >
        Scan Monitor
      </Button>
      <Button
        variant={view === "config" ? "secondary" : "default"}
        onClick={() => handleViewNavigator("config")}
      >
        Configuration
      </Button>
      <Button
        variant={view === "advanced" ? "secondary" : "default"}
        onClick={() => handleViewNavigator("advanced")}
      >
        Advanced
      </Button>
    </div>
  );
};

export default React.memo(ScanNavigator);
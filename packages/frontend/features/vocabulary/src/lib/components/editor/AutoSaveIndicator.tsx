import React from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSavedAt?: Date;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSavedAt,
}) => {
  if (status === "saving") {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
        Saving...
      </div>
    );
  }

  if (status === "saved") {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
        Saved {lastSavedAt ? `at ${lastSavedAt.toLocaleTimeString()}` : ""}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center text-sm text-destructive">
        <AlertCircle className="h-3 w-3 mr-2" />
        Failed to save
      </div>
    );
  }

  return null;
};

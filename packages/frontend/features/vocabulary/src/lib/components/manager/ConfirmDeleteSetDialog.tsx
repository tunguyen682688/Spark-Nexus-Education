import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@spark-nest-ed/frontend-shared-components";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDeleteSetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setTitle?: string;
  wordCount?: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

const ConfirmDeleteSetDialog: React.FC<ConfirmDeleteSetDialogProps> = ({
  open,
  onOpenChange,
  setTitle,
  wordCount = 0,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Vocabulary Set</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 space-y-2">
            <p>
              Are you sure you want to delete{" "}
              {setTitle ? (
                <>
                  the vocabulary set <strong className="text-foreground">"{setTitle}"</strong>
                </>
              ) : (
                "this vocabulary set"
              )}
              ?
            </p>
            {wordCount > 0 && (
              <p className="text-sm text-muted-foreground">
                This set contains <strong>{wordCount}</strong> word{wordCount !== 1 ? "s" : ""}.
                All words in this set will be removed.
              </p>
            )}
            <p className="text-sm font-medium text-destructive">
              This action cannot be undone.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Set"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDeleteSetDialog;


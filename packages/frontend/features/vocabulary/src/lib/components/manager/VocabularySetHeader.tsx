import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@spark-nest-ed/frontend-shared-components";
import { ChevronLeft, BookOpen, Share, Play, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ROUTES } from "@spark-nest-ed/frontend-core-constants";
import type { VocabularySet } from "../../types";
import ConfirmDeleteSetDialog from "./ConfirmDeleteSetDialog";

export interface VocabularySetHeaderProps {
  vocabularySet?: VocabularySet;
  onShare?: () => void;
  onPractice?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  canEdit?: boolean;
}

const VocabularySetHeader: React.FC<VocabularySetHeaderProps> = ({
  vocabularySet,
  onShare,
  onPractice,
  onEdit,
  onDelete,
  isDeleting = false,
  canEdit = false,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDeleteDialogOpen(false);
  };

  return (
    <>
      <ConfirmDeleteSetDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        setTitle={vocabularySet?.title}
        wordCount={vocabularySet?.entryCount}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    <div className="mb-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to={ROUTES.VOCABULARIES.COMMUNITY}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Community Lists
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between gap-4 items-start">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">
            {vocabularySet?.title || "Vocabulary Set"}
          </h1>
          {vocabularySet?.description && (
            <div className="text-muted-foreground mb-4">
              {vocabularySet.description}
            </div>
          )}
          <div className="flex flex-wrap gap-3 items-center text-sm text-muted-foreground">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>
                {vocabularySet?.entryCount || 0} words
              </span>
            </div>
            {vocabularySet?.tags && vocabularySet.tags.length > 0 && (
              <div className="flex items-center gap-2">
                {vocabularySet.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full bg-muted text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 self-start">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share className="h-4 w-4 mr-2" /> Share
          </Button>
          <Button size="sm" onClick={onPractice}>
            <Play className="h-4 w-4 mr-2" /> Practice Now
          </Button>
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Set
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDeleteClick}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Set
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default VocabularySetHeader;


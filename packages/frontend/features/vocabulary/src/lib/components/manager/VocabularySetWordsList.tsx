import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Input,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@spark-nest-ed/frontend-shared-components";
import { Search, ListFilter, ArrowUpDown, ExternalLink, Star, Trash2 } from "lucide-react";
import { ROUTES } from "@spark-nest-ed/frontend-core-constants";
import { WordStatus } from "../../types";
import { WORDS_FILTER_CONSTANTS } from "../../constants";
import ConfirmDeleteWordDialog from "./ConfirmDeleteWordDialog";

export interface WordItem {
  id: string;
  displayWord: {
    id: string;
    word: string;
    pronunciation?: string | null;
    partOfSpeech?: string | null;
    definition: string;
    example?: string | null;
    status?: WordStatus;
    masteryLevel?: number;
  };
  customDefinition?: string | null;
  customExample?: string | null;
}

export interface VocabularySetWordsListProps {
  totalWords: number;
  filteredItems: WordItem[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  difficultyFilter: string;
  onDifficultyFilterChange: (value: string) => void;
  vocabularySetId: string;
  paginationMeta?: {
    page: number;
    totalPages: number;
  };
  // Delete functionality
  onDeleteWord?: (wordId: string) => void;
  isDeletingWord?: boolean;
  canEdit?: boolean;
}

const statusFilters = WORDS_FILTER_CONSTANTS.STATUS_FILTERS;
const difficultyFilters = WORDS_FILTER_CONSTANTS.DIFFICULTY_FILTERS;

const getStatusLabel = (status: WordStatus): string => {
  switch (status) {
    case WordStatus.NEW:
      return WORDS_FILTER_CONSTANTS.LABELS.NOT_STARTED;
    case WordStatus.LEARNING:
      return WORDS_FILTER_CONSTANTS.LABELS.LEARNING;
    case WordStatus.REVIEWING:
      return WORDS_FILTER_CONSTANTS.LABELS.REVIEWING;
    case WordStatus.MASTERED:
      return WORDS_FILTER_CONSTANTS.LABELS.MASTERED;
    default:
      return WORDS_FILTER_CONSTANTS.LABELS.NOT_STARTED;
  }
};

const VocabularySetWordsList: React.FC<VocabularySetWordsListProps> = ({
  totalWords,
  filteredItems,
  isLoading,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  difficultyFilter,
  onDifficultyFilterChange,
  vocabularySetId,
  paginationMeta,
  onDeleteWord,
  isDeletingWord = false,
  canEdit = false,
}) => {
  const navigate = useNavigate();
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wordToDelete, setWordToDelete] = useState<{
    id: string;
    word: string;
  } | null>(null);

  const handleDeleteClick = (wordId: string, wordText: string) => {
    setWordToDelete({ id: wordId, word: wordText });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (wordToDelete && onDeleteWord) {
      onDeleteWord(wordToDelete.id);
      setDeleteDialogOpen(false);
      setWordToDelete(null);
    }
  };

  return (
    <>
      <ConfirmDeleteWordDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        wordText={wordToDelete?.word}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingWord}
      />
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Words List ({totalWords} words)</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search words..."
                className="pl-8 w-full md:w-[200px]"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <ListFilter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="text-sm font-medium mr-2">
            {WORDS_FILTER_CONSTANTS.LABELS.STATUS}
          </div>
          {statusFilters.map((status) => (
            <div
              key={status}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
              onClick={() => onStatusFilterChange(status)}
            >
              {status}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="text-sm font-medium mr-2">
            {WORDS_FILTER_CONSTANTS.LABELS.DIFFICULTY}
          </div>
          {difficultyFilters.map((difficulty) => (
            <div
              key={difficulty}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                difficultyFilter === difficulty
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
              onClick={() => onDifficultyFilterChange(difficulty)}
            >
              {difficulty}
            </div>
          ))}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Word</TableHead>
                <TableHead>Meaning</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead className="w-[100px]">Difficulty</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const word = item.displayWord;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        <div>{word.word}</div>
                        {word.pronunciation && (
                          <div className="text-xs text-muted-foreground">
                            {word.pronunciation}
                          </div>
                        )}
                        {word.partOfSpeech && (
                          <div className="text-xs text-muted-foreground italic">
                            {word.partOfSpeech}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="line-clamp-2">
                          {item.customDefinition || word.definition}
                        </div>
                        {(item.customExample || word.example) && (
                          <div className="text-xs text-muted-foreground italic mt-1">
                            "{item.customExample || word.example}"
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            word.status === WordStatus.MASTERED
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : ""
                          } ${
                            word.status === WordStatus.LEARNING ||
                            word.status === WordStatus.REVIEWING
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : ""
                          } ${
                            word.status === WordStatus.NEW
                              ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                              : ""
                          }`}
                        >
                          {getStatusLabel(word.status ?? WordStatus.NEW)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {word.masteryLevel !== undefined ? (
                          <div className="flex items-center">
                            {[1, 2, 3].map((level) => (
                              <Star
                                key={level}
                                className={`h-3 w-3 ${
                                  level <= (word.masteryLevel || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() =>
                              navigate(
                                ROUTES.VOCABULARIES.DETAIL_WORD_VOCABULARY.replace(
                                  ":id",
                                  vocabularySetId
                                ).replace(":wordId", word.id)
                              )
                            }
                            variant="ghost"
                            size="sm"
                          >
                            Details
                          </Button>
                          {canEdit && onDeleteWord && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10"
                                    onClick={() => handleDeleteClick(item.id, word.word)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete word</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No words found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {totalWords} words
          {paginationMeta && (
            <span className="ml-2">
              (Page {paginationMeta.page} of {paginationMeta.totalPages})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" /> Sort
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </CardFooter>
    </Card>
    </>
  );
};

export default VocabularySetWordsList;


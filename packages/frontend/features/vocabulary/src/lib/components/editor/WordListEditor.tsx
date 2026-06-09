import React from 'react';
import {
  UseFormReturn,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
} from 'react-hook-form';
import { Button, Skeleton } from '@spark-nest-ed/frontend-shared-components';
import { Plus } from 'lucide-react';
import {
  VocabularySetFormValues,
  DEFAULT_WORD_ITEM,
  WordItemFormValues,
} from '../../constants/editor';
import { EDITOR_UI } from '../../constants/ui';
import { WordItemEditor } from './WordItemEditor';
import { BulkImportDialog } from './BulkImportDialog';

interface WordListEditorProps {
  form: UseFormReturn<VocabularySetFormValues>;
  fields: FieldArrayWithId<VocabularySetFormValues, 'words', 'id'>[];
  append: UseFieldArrayAppend<VocabularySetFormValues, 'words'>;
  remove: UseFieldArrayRemove;
  onBulkAdd: (
    words: WordItemFormValues[],
    onProgress?: (percent: number) => void
  ) => Promise<{
    success: number;
    failed: number;
    failedItems: WordItemFormValues[];
  }>;
  loadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  isLoadingWords?: boolean;
}

export const WordListEditor: React.FC<WordListEditorProps> = ({
  form,
  fields,
  append,
  remove,
  onBulkAdd,
  loadMore,
  hasMore,
  isLoadingMore,
  isLoadingWords,
}) => {
  const handleBulkImport = async (
    words: WordItemFormValues[],
    onProgress?: (percent: number) => void
  ) => {
    return await onBulkAdd(words, onProgress);
  };

  const existingWords = fields.map((field) => field.word);

  if (isLoadingWords && fields.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {EDITOR_UI.WORD_LIST.TITLE} ({fields.length})
        </h3>
        <div className="flex space-x-2">
          <BulkImportDialog
            onImport={handleBulkImport}
            existingWords={existingWords}
          />
          <Button
            onClick={() => append(DEFAULT_WORD_ITEM)}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {EDITOR_UI.WORD_LIST.ADD_WORD_BUTTON}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <WordItemEditor
            key={field.id}
            index={index}
            form={form}
            onRemove={remove}
          />
        ))}

        {hasMore && (
          <div className="flex justify-center py-4">
            <Button
              variant="ghost"
              onClick={() => loadMore && loadMore()}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? 'Loading...' : 'Load More Words'}
            </Button>
          </div>
        )}
      </div>

      <Button
        onClick={() => append(DEFAULT_WORD_ITEM)}
        className="w-full py-8 border-dashed"
        variant="outline"
      >
        <Plus className="h-6 w-6 mr-2" />
        {EDITOR_UI.WORD_LIST.ADD_CARD_BUTTON}
      </Button>
    </div>
  );
};

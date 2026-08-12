import type { UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import type { VocabularySetFormValues, WordItemFormValues } from '../constants/editor';
import type { SyncVocabularySetItemsDto } from '../types';

const API_TIMEOUT = 300000;
const BATCH_SIZE = 10;

const vocabularyKeys = {
  detail: (setId: string) => ['vocabulary', 'sets', 'detail', setId] as const,
};

interface UseEditorImportDeps {
  currentSetId: string | undefined;
  syncItemsMutation: UseMutationResult<
    void,
    Error,
    {
      setId: string;
      payload: SyncVocabularySetItemsDto;
      config?: Record<string, unknown>;
    }
  >;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any;
  queryClient: QueryClient;
  append: UseFieldArrayAppend<VocabularySetFormValues, 'words'>;
  remove: UseFieldArrayRemove;
  setLastAppendedPage: (page: number) => void;
  setIsImporting: (importing: boolean) => void;
  lastSavedData: React.MutableRefObject<VocabularySetFormValues | undefined>;
}

export function createBulkAddWords(deps: UseEditorImportDeps) {
  return async function bulkAddWords(
    words: WordItemFormValues[],
    onProgress?: (percent: number) => void
  ): Promise<{
    success: number;
    failed: number;
    failedItems: WordItemFormValues[];
  }> {
    if (deps.currentSetId) {
      return importWordsToSet(deps, words, onProgress);
    }

    deps.append(words);
    deps.toast({
      title: 'Words Added',
      description: `Added ${words.length} words to the list. Save the set to persist changes.`,
    });
    return { success: words.length, failed: 0, failedItems: [] };
  };
}

async function importWordsToSet(
  deps: UseEditorImportDeps,
  words: WordItemFormValues[],
  onProgress?: (percent: number) => void
): Promise<{
  success: number;
  failed: number;
  failedItems: WordItemFormValues[];
}> {
  deps.setIsImporting(true);
  const totalWords = words.length;
  let processedCount = 0;
  let failedCount = 0;
  let failedItems: WordItemFormValues[] = [];

  const { id: toastId, update } = deps.toast({
    title: 'Importing words...',
    description: `Starting import of ${totalWords} words.`,
  });

  try {
    for (let i = 0; i < totalWords; i += BATCH_SIZE) {
      const chunk = words.slice(i, i + BATCH_SIZE);
      const payload: SyncVocabularySetItemsDto = {
        items: chunk.map((w) => ({
          word: {
            word: w.word,
            definition: w.definition,
            example: w.example,
            notes: w.notes,
            partOfSpeech: w.partOfSpeech,
          },
        })),
      };

      try {
        await deps.syncItemsMutation.mutateAsync({
          setId: deps.currentSetId!,
          payload,
          config: { timeout: API_TIMEOUT },
        });
        processedCount += chunk.length;
      } catch (chunkError) {
        console.error('Chunk import failed', chunkError);
        failedCount += chunk.length;
        failedItems = [...failedItems, ...chunk];
      }

      const currentProgress = Math.round(
        ((processedCount + failedCount) / totalWords) * 100
      );
      onProgress?.(currentProgress);

      update({
        id: toastId,
        title: 'Importing words...',
        description: `Processed ${
          processedCount + failedCount
        } of ${totalWords} words. Success: ${processedCount}, Failed: ${failedCount}.`,
      });
    }

    update({
      id: toastId,
      title: 'Finalizing...',
      description: 'Refreshing list...',
    });

    if (deps.lastSavedData.current) {
      deps.lastSavedData.current = {
        ...deps.lastSavedData.current,
        words: [],
      };
    }

    deps.remove();
    deps.setLastAppendedPage(0);

    await deps.queryClient.resetQueries({
      queryKey: vocabularyKeys.detail(deps.currentSetId!),
    });

    if (failedCount > 0) {
      update({
        id: toastId,
        title: 'Import Completed with Errors',
        description: `Imported ${processedCount} words. Failed to import ${failedCount} words.`,
        variant: 'destructive',
      });
    } else {
      update({
        id: toastId,
        title: 'Import Complete',
        description: `Successfully imported ${totalWords} words.`,
        variant: 'default',
      });
    }

    return { success: processedCount, failed: failedCount, failedItems };
  } catch (error: unknown) {
    console.error('Import process failed', error);
    update({
      id: toastId,
      title: 'Import Failed',
      description: 'A critical error occurred during the import process.',
      variant: 'destructive',
    });
    return {
      success: processedCount,
      failed: totalWords - processedCount,
      failedItems: words.slice(processedCount),
    };
  } finally {
    deps.setIsImporting(false);
  }
}

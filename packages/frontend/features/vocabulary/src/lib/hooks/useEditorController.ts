import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { debounce, isEqual } from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import {
  VocabularySetFormValues,
  VocabularySetFormSchema,
  defaultVocabularySetValues,
  WordItemFormValues,
} from '../constants/editor';
import {
  useCreateVocabularySet,
  useUpdateVocabularySet,
  useSyncVocabularySetItems,
  vocabularyKeys,
  useInfiniteSetWords,
} from './use-vocabulary-sets';
import {
  CreateVocabularySetDto,
  UpdateVocabularySetDto,
  SyncVocabularySetItemsDto,
  Language,
  PARTS_OF_SPEECH,
} from '../types';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

const API_TIMEOUT = 300000; // 5 minutes

export const useEditorController = (
  setId?: string,
  initialData?: VocabularySetFormValues
) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSetId, setCurrentSetId] = useState<string | undefined>(setId);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | undefined>(undefined);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [lastAppendedPage, setLastAppendedPage] = useState(0);
  const lastSavedData = useRef<VocabularySetFormValues | undefined>(
    initialData
  );
  const isAppendingRef = useRef(false);

  const createSetMutation = useCreateVocabularySet();
  const updateSetMutation = useUpdateVocabularySet();
  const syncItemsMutation = useSyncVocabularySetItems();

  const infiniteQueryParams = useMemo(() => ({ limit: 20 }), []);

  // Infinite Scroll Logic
  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingWords,
  } = useInfiniteSetWords(currentSetId, infiniteQueryParams);

  const totalServerItems = useMemo(() => {
    return infiniteData?.pages?.[0]?.meta?.total ?? 0;
  }, [infiniteData]);

  const form = useForm<VocabularySetFormValues>({
    resolver: zodResolver(VocabularySetFormSchema),
    defaultValues: initialData || defaultVocabularySetValues,
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isDirty, isValid, errors },
  } = form;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'words',
  });

  // Sync infinite data to form fields
  useEffect(() => {
    if (infiniteData && infiniteData.pages.length > lastAppendedPage) {
      const newPages = infiniteData.pages.slice(lastAppendedPage);
      const newItems: WordItemFormValues[] = newPages.flatMap((page) =>
        page.data.map((item) => {
          const pos =
            PARTS_OF_SPEECH.find((p) => p === item.wordMinimum?.partOfSpeech) ||
            'noun';
          return {
            id: item.id,
            word: item.wordMinimum?.word || item.customWord || '',
            definition:
              item.wordMinimum?.definition || item.customDefinition || '',
            example: item.wordMinimum?.example || item.customExample || '',
            notes: item.notes || '',
            partOfSpeech: pos as WordItemFormValues['partOfSpeech'],
          };
        })
      );

      if (newItems.length > 0) {
        isAppendingRef.current = true;

        // Filter out duplicates based on ID
        // This prevents issues with StrictMode double-invocation or race conditions
        const currentIds = new Set(fields.map((f) => f.id));
        const uniqueNewItems = newItems.filter(
          (item) => !item.id || !currentIds.has(item.id)
        );

        if (uniqueNewItems.length > 0) {
          append(uniqueNewItems, { shouldFocus: false });

          // Update lastSavedData to include these new items so they aren't marked as new/dirty
          if (lastSavedData.current) {
            lastSavedData.current = {
              ...lastSavedData.current,
              words: [...lastSavedData.current.words, ...uniqueNewItems],
            };
          }
        }

        // Use setTimeout to ensure the watch callback has fired (if it was going to) before we reset the flag
        // This protects against any async behavior in RHF's watch subscription
        setTimeout(() => {
          isAppendingRef.current = false;
        }, 100);
      }
      setLastAppendedPage(infiniteData.pages.length);
    }
  }, [infiniteData, lastAppendedPage, append, fields.length, fields]);

  // Synchronize server-assigned IDs back to local form fields and update lastSavedData
  useEffect(() => {
    if (!infiniteData || !infiniteData.pages) return;

    const serverWords = infiniteData.pages.flatMap((page) => page.data);
    const localWords = form.getValues().words || [];
    let hasUpdates = false;

    localWords.forEach((localWord, index) => {
      if (!localWord.id) {
        // Try matching by index + word text first
        const serverWord = serverWords[index];
        if (
          serverWord &&
          (serverWord.wordMinimum?.word === localWord.word ||
            serverWord.customWord === localWord.word)
        ) {
          form.setValue(`words.${index}.id`, serverWord.id, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
          fields[index].id = serverWord.id;
          hasUpdates = true;
        } else {
          // Find matching word by text anywhere in serverWords, avoiding double matches
          const matchedServerWord = serverWords.find(
            (sw) =>
              (sw.wordMinimum?.word === localWord.word ||
                sw.customWord === localWord.word) &&
              !localWords.some((lw) => lw.id === sw.id)
          );
          if (matchedServerWord) {
            form.setValue(`words.${index}.id`, matchedServerWord.id, {
              shouldDirty: false,
              shouldTouch: false,
              shouldValidate: false,
            });
            fields[index].id = matchedServerWord.id;
            hasUpdates = true;
          }
        }
      }
    });

    if (hasUpdates) {
      const currentValues = form.getValues();
      lastSavedData.current = JSON.parse(JSON.stringify(currentValues));
    }
  }, [infiniteData, form, fields]);

  // Clean up React Query cache on unmount to isolate sessions and prevent cache bleeding
  useEffect(() => {
    return () => {
      if (currentSetId) {
        queryClient.removeQueries({
          queryKey: vocabularyKeys.detail(currentSetId),
        });
      }
    };
  }, [currentSetId, queryClient]);

  const bulkAddWords = async (
    words: WordItemFormValues[],
    onProgress?: (percent: number) => void
  ): Promise<{
    success: number;
    failed: number;
    failedItems: WordItemFormValues[];
  }> => {
    if (currentSetId) {
      setIsImporting(true);
      const BATCH_SIZE = 10; // Increased batch size slightly
      const totalWords = words.length;
      let processedCount = 0;
      let failedCount = 0;
      let failedItems: WordItemFormValues[] = [];

      // Initial Toast
      const { id: toastId, update } = toast({
        title: 'Importing words...',
        description: `Starting import of ${totalWords} words.`,
      });

      try {
        // Chunking logic
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
            // Pass timeout config
            await syncItemsMutation.mutateAsync({
              setId: currentSetId,
              payload,
              config: { timeout: API_TIMEOUT },
            });

            // Update progress only, do not append optimistically to avoid ID issues
            processedCount += chunk.length;
          } catch (chunkError) {
            console.error('Chunk import failed', chunkError);
            failedCount += chunk.length;
            failedItems = [...failedItems, ...chunk];
            // Continue to next chunk
          }

          const currentProgress = Math.round(
            ((processedCount + failedCount) / totalWords) * 100
          );
          if (onProgress) {
            onProgress(currentProgress);
          }

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

        // Reset UI and fetch fresh data from server
        // 1. Prevent auto-save from detecting deletions by resetting lastSavedData
        if (lastSavedData.current) {
          lastSavedData.current = { ...lastSavedData.current, words: [] };
        }

        // 2. Clear current form fields
        remove();

        // 3. Reset pagination state
        setLastAppendedPage(0);

        // 4. Invalidate and reset queries to force a fresh fetch of page 1
        await queryClient.resetQueries({
          queryKey: vocabularyKeys.detail(currentSetId),
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
        setIsImporting(false);
      }
    } else {
      append(words);
      toast({
        title: 'Words Added',
        description: `Added ${words.length} words to the list. Save the set to persist changes.`,
      });
      return { success: words.length, failed: 0, failedItems: [] };
    }
  };

  const handleRemove = (index?: number | number[]) => {
    const currentValues = form.getValues().words || [];

    if (typeof index === 'number') {
      const item = currentValues[index];
      if (item && item.id) {
        setDeletedItemIds((prev) => [...prev, item.id as string]);
      }
      remove(index);
    } else if (Array.isArray(index)) {
      const idsToDelete: string[] = [];
      index.forEach((i) => {
        const item = currentValues[i];
        if (item && item.id) {
          idsToDelete.push(item.id as string);
        }
      });
      if (idsToDelete.length > 0) {
        setDeletedItemIds((prev) => [...prev, ...idsToDelete]);
      }
      remove(index);
    } else {
      // If index is undefined, it removes all fields
      // We should track all IDs that are being removed
      const idsToDelete = currentValues
        .map((f) => f.id)
        .filter((id): id is string => !!id);
      if (idsToDelete.length > 0) {
        setDeletedItemIds((prev) => [...prev, ...idsToDelete]);
      }
      remove();
    }
  };

  const mapToCreateDto = (
    data: VocabularySetFormValues
  ): CreateVocabularySetDto => ({
    title: data.title,
    description: data.description,
    language: Language.ENGLISH, // Defaulting to English for now, should be in form
    type: data.type,
    difficulty: data.difficulty,
    tags: data.tags || [],
    initialWords: data.words.map((w) => ({
      word: w.word,
      definition: w.definition,
      example: w.example,
      notes: w.notes,
      partOfSpeech: w.partOfSpeech,
    })),
  });

  const mapToUpdateDto = (
    data: VocabularySetFormValues,
    isExplicitPublish = false
  ): UpdateVocabularySetDto => ({
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    tags: data.tags || [],
    ...(isExplicitPublish
      ? { visibility: 'PUBLIC' }
      : data.visibility === 'PRIVATE'
      ? { visibility: 'PRIVATE' }
      : {}),
  });

  const mapToSyncDto = (
    data: VocabularySetFormValues,
    previousData?: VocabularySetFormValues
  ): SyncVocabularySetItemsDto => {
    const itemsToSync = data.words.filter((word) => {
      // If it's a new item (no ID), always sync
      if (!word.id) return true;

      // Check if it changed since last save
      if (!previousData) return true;

      const prevWord = previousData.words.find((w) => w.id === word.id);
      if (!prevWord) return true;

      return !isEqual(word, prevWord);
    });

    return {
      items: itemsToSync.map((w) => ({
        id: w.id,
        word: {
          word: w.word,
          definition: w.definition,
          example: w.example,
          notes: w.notes,
          partOfSpeech: w.partOfSpeech,
        },
      })),
      deleteIds: deletedItemIds,
    };
  };

  const isSavingRef = useRef(false);
  const pendingSaveDataRef = useRef<VocabularySetFormValues | null>(null);

  const saveDraft = async (
    data: VocabularySetFormValues,
    isExplicitPublish = false
  ): Promise<{ success: boolean; setId?: string }> => {
    // If already saving, queue this data as pending and return
    if (isSavingRef.current) {
      pendingSaveDataRef.current = data;
      return { success: false };
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      let targetSetId = currentSetId;
      let isNew = false;

      if (!targetSetId) {
        isNew = true;
        const newSet = await createSetMutation.mutateAsync(
          mapToCreateDto(data)
        );
        targetSetId = newSet.id;
        setCurrentSetId(newSet.id);
      }

      if (targetSetId) {
        // Check if set info changed
        const prev = lastSavedData.current;
        const setInfoChanged =
          !prev ||
          prev.title !== data.title ||
          prev.description !== data.description ||
          prev.difficulty !== data.difficulty ||
          (isExplicitPublish && prev.visibility !== data.visibility) ||
          !isEqual(prev.tags, data.tags);

        // Sync words first to update entryCount in backend before setting visibility to PUBLIC (only for existing sets)
        if (!isNew) {
          const syncPayload = mapToSyncDto(data, lastSavedData.current);
          if (
            syncPayload.items.length > 0 ||
            (syncPayload.deleteIds && syncPayload.deleteIds.length > 0)
          ) {
            await syncItemsMutation.mutateAsync({
              setId: targetSetId,
              payload: syncPayload,
              config: { timeout: API_TIMEOUT },
            });
          }
        }

        // Update set metadata second, so that visibility validations check the correct entryCount
        if (setInfoChanged || isExplicitPublish || (isNew && isExplicitPublish)) {
          await updateSetMutation.mutateAsync({
            setId: targetSetId,
            payload: mapToUpdateDto(data, isExplicitPublish),
          });
        }

        if (!isNew) {
          setDeletedItemIds([]); // Clear deleted IDs after sync
        }
      }

      lastSavedData.current = JSON.parse(JSON.stringify(data));

      setSaveStatus('saved');
      setLastSavedAt(new Date());
      return { success: true, setId: targetSetId };
    } catch (error: unknown) {
      setSaveStatus('error');
      console.error('Failed to save draft', error);

      // Enhanced error handling for timeouts and other errors
      let errorMessage =
        isExplicitPublish
          ? 'Failed to publish vocabulary set. Please check requirements.'
          : 'Could not save your changes. Please check your connection and try again.';
      
      interface AxiosErrorLike {
        message?: string;
        response?: {
          data?: {
            message?: string | string[];
            errors?: Array<{ detail?: string; title?: string }>;
          };
        };
      }

      const isAxiosError = error && typeof error === 'object' && 'isAxiosError' in error;
      if (isAxiosError) {
        const axiosError = error as AxiosErrorLike;
        const data = axiosError.response?.data;
        if (data) {
          if (Array.isArray(data.errors) && data.errors.length > 0) {
            errorMessage = data.errors.map((e) => e.detail || e.title).filter(Boolean).join(', ');
          } else if (Array.isArray(data.message)) {
            errorMessage = data.message.join(', ');
          } else if (typeof data.message === 'string') {
            errorMessage = data.message;
          }
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      }

      const errorCode =
        error instanceof Error && 'code' in error
          ? (error as NodeJS.ErrnoException).code
          : undefined;
      if (errorCode === 'ECONNABORTED' || errorMessage?.includes('timeout')) {
        toast({
          title: isExplicitPublish ? 'Publish Timeout' : 'Auto-save Timeout',
          description:
            'The operation took too long. Your changes may have been saved, but please verify.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: isExplicitPublish ? 'Publish Failed' : 'Auto-save Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      return { success: false };
    } finally {
      isSavingRef.current = false;
      // If there is pending data that arrived while we were saving, process it now
      if (pendingSaveDataRef.current) {
        const nextData = pendingSaveDataRef.current;
        pendingSaveDataRef.current = null;
        // Call saveDraft again with the pending data
        // We use setTimeout to break the call stack and allow UI updates if needed
        setTimeout(() => saveDraft(nextData), 0);
      }
    }
  };

  const saveDraftRef = useRef(saveDraft);
  saveDraftRef.current = saveDraft;

  const debouncedSave = useMemo(
    () =>
      debounce((data: VocabularySetFormValues) => {
        saveDraftRef.current(data);
      }, 2000),
    []
  );

  // Watch for changes and trigger auto-save using deep equality check
  useEffect(() => {
    const subscription = watch((value) => {
      const currentValues = value as VocabularySetFormValues;
      const hasChanges =
        !lastSavedData.current ||
        !isEqual(lastSavedData.current, currentValues);

      if (hasChanges && !isImporting && !isAppendingRef.current) {
        debouncedSave(currentValues);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, debouncedSave, isImporting]);

  const onPublish = async (data: VocabularySetFormValues) => {
    const result = await saveDraft(data, true);
    if (!result.success || !result.setId) return;

    // Update form state reactively so the UI reflects the published state instantly
    form.setValue("visibility", "PUBLIC");

    toast({
      title: 'Vocabulary Set Published',
      description: 'Your vocabulary set has been published successfully.',
    });
    navigate(
      ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(
        ':id',
        result.setId
      )
    );
  };

  const onPublishError = (errors: unknown) => {
    console.error('Validation errors on publish', errors);
    toast({
      title: 'Publish Failed',
      description: 'Please check form requirements. Make sure all words have valid spelling and definitions.',
      variant: 'destructive',
    });
  };

  return {
    form,
    fields,
    append,
    remove: handleRemove,
    move,
    bulkAddWords,
    saveStatus,
    lastSavedAt,
    handlePublish: handleSubmit(onPublish, onPublishError),
    saveDraft,
    isDirty,
    isValid,
    errors,
    // Infinite Scroll Props
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoadingWords,
    totalServerItems,
  };
};

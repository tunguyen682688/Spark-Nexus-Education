import { useState, useEffect, useRef, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { PARTS_OF_SPEECH } from '../types';
import { createBulkAddWords } from './use-editor-import';
import { createSaveDraft, createPublishHandler, createPublishErrorHandler } from './use-editor-publish';
import { useEditorAutosave } from './use-editor-autosave';

export const useEditorController = (
  setId?: string,
  initialData?: VocabularySetFormValues
) => {
  const queryClient = useQueryClient();
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
  const isSavingRef = useRef(false);
  const pendingSaveDataRef = useRef<VocabularySetFormValues | null>(null);

  const createSetMutation = useCreateVocabularySet();
  const updateSetMutation = useUpdateVocabularySet();
  const syncItemsMutation = useSyncVocabularySetItems();

  const infiniteQueryParams = useMemo(() => ({ limit: 20 }), []);

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

        const currentIds = new Set(fields.map((f) => f.id));
        const uniqueNewItems = newItems.filter(
          (item) => !item.id || !currentIds.has(item.id)
        );

        if (uniqueNewItems.length > 0) {
          append(uniqueNewItems, { shouldFocus: false });

          if (lastSavedData.current) {
            lastSavedData.current = {
              ...lastSavedData.current,
              words: [...lastSavedData.current.words, ...uniqueNewItems],
            };
          }
        }

        setTimeout(() => {
          isAppendingRef.current = false;
        }, 100);
      }
      setLastAppendedPage(infiniteData.pages.length);
    }
  }, [infiniteData, lastAppendedPage, append, fields.length, fields]);

  useEffect(() => {
    if (!infiniteData || !infiniteData.pages) return;

    const serverWords = infiniteData.pages.flatMap((page) => page.data);
    const localWords = form.getValues().words || [];
    let hasUpdates = false;

    localWords.forEach((localWord, index) => {
      if (!localWord.id) {
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

  useEffect(() => {
    return () => {
      if (currentSetId) {
        queryClient.removeQueries({
          queryKey: vocabularyKeys.detail(currentSetId),
        });
      }
    };
  }, [currentSetId, queryClient]);

  const bulkAddWords = useMemo(
    () =>
      createBulkAddWords({
        currentSetId,
        syncItemsMutation,
        toast,
        queryClient,
        append,
        remove,
        setLastAppendedPage,
        setIsImporting,
        lastSavedData,
      }),
    [currentSetId, syncItemsMutation, toast, queryClient, append, remove]
  );

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
      const idsToDelete = currentValues
        .map((f) => f.id)
        .filter((id): id is string => !!id);
      if (idsToDelete.length > 0) {
        setDeletedItemIds((prev) => [...prev, ...idsToDelete]);
      }
      remove();
    }
  };

  const saveDraft = useMemo(
    () =>
      createSaveDraft({
        currentSetId,
        setCurrentSetId,
        createSetMutation,
        updateSetMutation,
        syncItemsMutation,
        deletedItemIds,
        setDeletedItemIds,
        setSaveStatus,
        setLastSavedAt,
        lastSavedData,
        isSavingRef,
        pendingSaveDataRef,
        toast,
      }),
    [
      currentSetId,
      createSetMutation,
      updateSetMutation,
      syncItemsMutation,
      deletedItemIds,
      toast,
    ]
  );

  const onPublish = useMemo(
    () =>
      createPublishHandler({
        saveDraft,
        form,
        toast,
      }),
    [saveDraft, form, toast]
  );

  const onPublishError = useMemo(
    () => createPublishErrorHandler(toast),
    [toast]
  );

  useEditorAutosave({
    watch,
    isImporting,
    isAppendingRef,
    lastSavedData,
    saveDraft,
  });

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
    loadMore: fetchNextPage,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,
    isLoadingWords,
    totalServerItems,
  };
};

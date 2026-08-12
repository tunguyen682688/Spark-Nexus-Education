import type { UseFormReturn } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import type { VocabularySetFormValues } from '../constants/editor';
import type {
  CreateVocabularySetDto,
  UpdateVocabularySetDto,
  SyncVocabularySetItemsDto,
  Language,
} from '../types';

const API_TIMEOUT = 300000;

function mapToCreateDto(data: VocabularySetFormValues): CreateVocabularySetDto {
  return {
    title: data.title,
    description: data.description,
    language: 'en' as Language,
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
  };
}

function mapToUpdateDto(
  data: VocabularySetFormValues,
  isExplicitPublish = false
): UpdateVocabularySetDto {
  return {
    title: data.title,
    description: data.description,
    difficulty: data.difficulty,
    tags: data.tags || [],
    ...(isExplicitPublish
      ? { visibility: 'PUBLIC' }
      : data.visibility === 'PRIVATE'
      ? { visibility: 'PRIVATE' }
      : {}),
  };
}

function mapToSyncDto(
  data: VocabularySetFormValues,
  previousData: VocabularySetFormValues | undefined,
  deletedItemIds: string[]
): SyncVocabularySetItemsDto {
  const itemsToSync = data.words.filter((word) => {
    if (!word.id) return true;
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
}

interface AxiosErrorLike {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
      errors?: Array<{ detail?: string; title?: string }>;
    };
  };
}

function extractErrorMessage(error: unknown): string {
  const isAxiosError =
    error && typeof error === 'object' && 'isAxiosError' in error;
  if (isAxiosError) {
    const axiosError = error as AxiosErrorLike;
    const data = axiosError.response?.data;
    if (data) {
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors
          .map((e) => e.detail || e.title)
          .filter(Boolean)
          .join(', ');
      } else if (Array.isArray(data.message)) {
        return data.message.join(', ');
      } else if (typeof data.message === 'string') {
        return data.message;
      }
    } else if (axiosError.message) {
      return axiosError.message;
    }
  }

  const errorCode =
    error instanceof Error && 'code' in error
      ? (error as NodeJS.ErrnoException).code
      : undefined;
  if (errorCode === 'ECONNABORTED') {
    return 'timeout';
  }

  return '';
}

interface UseEditorPublishDeps {
  currentSetId: string | undefined;
  setCurrentSetId: (id: string) => void;
  createSetMutation: UseMutationResult<
    any,
    Error,
    CreateVocabularySetDto
  >;
  updateSetMutation: UseMutationResult<
    any,
    Error,
    { setId: string; payload: UpdateVocabularySetDto }
  >;
  syncItemsMutation: UseMutationResult<
    void,
    Error,
    {
      setId: string;
      payload: SyncVocabularySetItemsDto;
      config?: Record<string, unknown>;
    }
  >;
  deletedItemIds: string[];
  setDeletedItemIds: React.Dispatch<React.SetStateAction<string[]>>;
  setSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void;
  setLastSavedAt: (date: Date | undefined) => void;
  lastSavedData: React.MutableRefObject<VocabularySetFormValues | undefined>;
  isSavingRef: React.MutableRefObject<boolean>;
  pendingSaveDataRef: React.MutableRefObject<VocabularySetFormValues | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any;
}

export function createSaveDraft(deps: UseEditorPublishDeps) {
  const saveDraft = async (
    data: VocabularySetFormValues,
    isExplicitPublish = false
  ): Promise<{ success: boolean; setId?: string }> => {
    if (deps.isSavingRef.current) {
      deps.pendingSaveDataRef.current = data;
      return { success: false };
    }

    deps.isSavingRef.current = true;
    deps.setSaveStatus('saving');

    try {
      let targetSetId = deps.currentSetId;
      let isNew = false;

      if (!targetSetId) {
        isNew = true;
        const newSet = await deps.createSetMutation.mutateAsync(
          mapToCreateDto(data)
        );
        targetSetId = newSet.id;
        deps.setCurrentSetId(newSet.id);
      }

      if (targetSetId) {
        const prev = deps.lastSavedData.current;
        const setInfoChanged =
          !prev ||
          prev.title !== data.title ||
          prev.description !== data.description ||
          prev.difficulty !== data.difficulty ||
          (isExplicitPublish && prev.visibility !== data.visibility) ||
          !isEqual(prev.tags, data.tags);

        if (!isNew) {
          const syncPayload = mapToSyncDto(
            data,
            deps.lastSavedData.current,
            deps.deletedItemIds
          );
          if (
            syncPayload.items.length > 0 ||
            (syncPayload.deleteIds && syncPayload.deleteIds.length > 0)
          ) {
            await deps.syncItemsMutation.mutateAsync({
              setId: targetSetId,
              payload: syncPayload,
              config: { timeout: API_TIMEOUT },
            });
          }
        }

        if (setInfoChanged || isExplicitPublish || (isNew && isExplicitPublish)) {
          await deps.updateSetMutation.mutateAsync({
            setId: targetSetId,
            payload: mapToUpdateDto(data, isExplicitPublish),
          });
        }

        if (!isNew) {
          deps.setDeletedItemIds([]);
        }
      }

      deps.lastSavedData.current = JSON.parse(JSON.stringify(data));

      deps.setSaveStatus('saved');
      deps.setLastSavedAt(new Date());
      return { success: true, setId: targetSetId };
    } catch (error: unknown) {
      deps.setSaveStatus('error');
      console.error('Failed to save draft', error);

      const errorMessage = extractErrorMessage(error);
      const displayMessage = errorMessage || isExplicitPublish
        ? 'Failed to publish vocabulary set. Please check requirements.'
        : 'Could not save your changes. Please check your connection and try again.';

      if (errorMessage === 'timeout') {
        deps.toast({
          title: isExplicitPublish ? 'Publish Timeout' : 'Auto-save Timeout',
          description:
            'The operation took too long. Your changes may have been saved, but please verify.',
          variant: 'destructive',
        });
      } else {
        deps.toast({
          title: isExplicitPublish ? 'Publish Failed' : 'Auto-save Failed',
          description: displayMessage,
          variant: 'destructive',
        });
      }
      return { success: false };
    } finally {
      deps.isSavingRef.current = false;
      if (deps.pendingSaveDataRef.current) {
        const nextData = deps.pendingSaveDataRef.current;
        deps.pendingSaveDataRef.current = null;
        setTimeout(() => saveDraft(nextData), 0);
      }
    }
  };

  return saveDraft;
}

interface UsePublishHandlerDeps {
  saveDraft: (
    data: VocabularySetFormValues,
    isExplicitPublish?: boolean
  ) => Promise<{ success: boolean; setId?: string }>;
  form: UseFormReturn<VocabularySetFormValues>;
  toast: (opts: { title: string; description: string }) => void;
}

export function createPublishHandler(deps: UsePublishHandlerDeps) {
  const navigate = useNavigate();

  return async function onPublish(data: VocabularySetFormValues) {
    const result = await deps.saveDraft(data, true);
    if (!result.success || !result.setId) return;

    deps.form.setValue('visibility', 'PUBLIC');

    deps.toast({
      title: 'Vocabulary Set Published',
      description: 'Your vocabulary set has been published successfully.',
    });
    navigate(
      ROUTES.VOCABULARIES.DETAIL_SET_VOCABULARY.replace(':id', result.setId)
    );
  };
}

export function createPublishErrorHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast: any
) {
  return function onPublishError(errors: unknown) {
    console.error('Validation errors on publish', errors);
    toast({
      title: 'Publish Failed',
      description:
        'Please check form requirements. Make sure all words have valid spelling and definitions.',
      variant: 'destructive',
    });
  };
}

import { useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import type { UseMutationResult } from '@tanstack/react-query';
import type {
  StudioFormValues,
  CreateArticlePayload,
} from '../types';
import type { SaveStatus } from './use-studio-autosave';

interface UseStudioPublishOptions {
  form: UseFormReturn<StudioFormValues>;
  dirtyRef: React.MutableRefObject<boolean>;
  draftId: string | null;
  setDraftId: (id: string | null) => void;
  setSaveStatus: (s: SaveStatus) => void;
  setLastSavedAt: (d: Date | null) => void;
  isManualSaveRef: React.MutableRefObject<boolean>;
  createMutation: UseMutationResult<any, Error, CreateArticlePayload>;
  updateMutation: UseMutationResult<any, Error, { id: string; payload: Partial<CreateArticlePayload> }>;
  deleteMutation: UseMutationResult<any, Error, string>;
  buildPayload: (status?: 'DRAFT' | 'REVIEW' | 'PUBLISHED') => CreateArticlePayload;
  wordCount: number;
}

export function useStudioPublish({
  form,
  dirtyRef,
  draftId,
  setDraftId,
  setSaveStatus,
  setLastSavedAt,
  isManualSaveRef,
  createMutation,
  updateMutation,
  deleteMutation,
  buildPayload,
  wordCount,
}: UseStudioPublishOptions) {
  const watchedTitle = form.watch('title') || '';
  const watchedContentType = form.watch('contentType');
  const watchedCategory = form.watch('category') || '';
  const watchedDifficulty = form.watch('difficulty') || '';

  const canPublish =
    watchedTitle.trim().length >= 3 &&
    (watchedContentType === 'book' || wordCount >= 50) &&
    watchedCategory.length > 0 &&
    watchedDifficulty.length > 0;

  const checklist = {
    hasTitle: watchedTitle.trim().length >= 3,
    hasContent: wordCount >= 50,
    hasCategory: watchedCategory.length > 0,
    hasDifficulty: watchedDifficulty.length > 0,
  };

  const handleSaveDraft = useCallback(
    async (isManual = false) => {
      isManualSaveRef.current = isManual;
      setSaveStatus('saving');
      const payload = buildPayload('DRAFT');

      if (draftId) {
        updateMutation.mutate({ id: draftId, payload });
      } else {
        createMutation.mutate(payload);
      }
      dirtyRef.current = false;
    },
    [buildPayload, draftId, updateMutation, createMutation, isManualSaveRef, setSaveStatus, dirtyRef]
  );

  const handlePublish = useCallback(async () => {
    if (!canPublish) return;

    setSaveStatus('saving');
    const payload = buildPayload('PUBLISHED');

    if (draftId) {
      updateMutation.mutate({
        id: draftId,
        payload: { ...payload, status: 'PUBLISHED' },
      });
    } else {
      createMutation.mutate({ ...payload, status: 'PUBLISHED' });
    }
    dirtyRef.current = false;
  }, [canPublish, buildPayload, draftId, updateMutation, createMutation, setSaveStatus, dirtyRef]);

  const handleDiscard = useCallback(async () => {
    if (draftId) {
      deleteMutation.mutate(draftId);
    }
    form.reset();
    setDraftId(null);
    setSaveStatus('idle');
    setLastSavedAt(null);
    dirtyRef.current = false;
  }, [draftId, deleteMutation, form, setDraftId, setSaveStatus, setLastSavedAt, dirtyRef]);

  return {
    canPublish,
    checklist,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleSaveDraft,
    handlePublish,
    handleDiscard,
  };
}

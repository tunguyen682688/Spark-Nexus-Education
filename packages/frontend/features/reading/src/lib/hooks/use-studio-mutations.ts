import { useMutation } from '@tanstack/react-query';
import { readingApi } from '../api/reading-api';
import type { CreateArticlePayload } from '../types';
import { STUDIO_UI_TEXT } from '../constants/studio-ui-text';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import type { SaveStatus } from './use-studio-autosave';

interface UseStudioMutationsOptions {
  setDraftId: (id: string | null) => void;
  setSaveStatus: (s: SaveStatus) => void;
  setLastSavedAt: (d: Date | null) => void;
  isManualSaveRef: React.MutableRefObject<boolean>;
}

export function useStudioMutations({
  setDraftId,
  setSaveStatus,
  setLastSavedAt,
  isManualSaveRef,
}: UseStudioMutationsOptions) {
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (payload: CreateArticlePayload) =>
      readingApi.createStudioArticle(payload),
    onSuccess: (data) => {
      setDraftId(data.id);
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      if (isManualSaveRef.current) {
        toast({
          title: STUDIO_UI_TEXT.TOAST_TITLE_SUCCESS,
          description: STUDIO_UI_TEXT.TOAST_DRAFT_SAVED,
          variant: 'default',
        });
      }
    },
    onError: () => {
      setSaveStatus('error');
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_ERROR,
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateArticlePayload>;
    }) => readingApi.updateArticle(id, payload),
    onSuccess: () => {
      setSaveStatus('saved');
      setLastSavedAt(new Date());
      if (isManualSaveRef.current) {
        toast({
          title: STUDIO_UI_TEXT.TOAST_TITLE_SUCCESS,
          description: STUDIO_UI_TEXT.TOAST_DRAFT_SAVED,
          variant: 'default',
        });
      }
    },
    onError: () => {
      setSaveStatus('error');
      toast({
        title: STUDIO_UI_TEXT.TOAST_TITLE_ERROR,
        description: STUDIO_UI_TEXT.TOAST_ERROR,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => readingApi.deleteArticle(id),
  });

  return { createMutation, updateMutation, deleteMutation };
}

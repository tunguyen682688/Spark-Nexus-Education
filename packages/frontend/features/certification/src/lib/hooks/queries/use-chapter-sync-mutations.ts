import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CollectionEditorResponse } from '../../types';
import { updateEditorCache } from '../../services/exam-cache-helpers.service';

type EditorExam = CollectionEditorResponse['chapters'][number]['exams'][number];
type EditorChapter = CollectionEditorResponse['chapters'][number];

export const useSyncChapters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type SyncVariables = {
    collectionId: string;
    chapters: Array<{ id?: string; title: string; description?: string | null; order: number }>;
    silent?: boolean;
  };

  return useMutation<
    Array<{ id: string }>,
    Error,
    SyncVariables,
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ collectionId, chapters, silent: _silent }) =>
      CertificationApi.syncChapters(collectionId, chapters),

    onMutate: async (variables) => {
      const queryKey = ['certification', 'collection-editor', variables.collectionId];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<CollectionEditorResponse>(queryKey);

      updateEditorCache(queryClient, variables.collectionId, (old) => {
        const incomingMap = new Map(variables.chapters.map((chapter) => [chapter.id, chapter]));
        const existingIds = new Set(old.chapters.map((chapter) => chapter.id));

        const kept = old.chapters
          .filter((chapter) => incomingMap.has(chapter.id))
          .map((chapter, idx) => {
            const incoming = incomingMap.get(chapter.id);
            return {
              ...chapter,
              title: incoming?.title ?? chapter.title,
              description: incoming?.description ?? chapter.description ?? '',
              number: idx + 1,
            };
          });

        const newChapters = variables.chapters
          .filter((chapter) => chapter.id && !existingIds.has(chapter.id))
          .map((chapter, idx) => ({
            id: chapter.id || `optimistic-${Date.now()}-${idx}`,
            number: kept.length + idx + 1,
            title: chapter.title,
            description: chapter.description || '',
            examCount: 0,
            exams: [] as EditorExam[],
          } as EditorChapter));

        return { ...old, chapters: [...kept, ...newChapters] };
      });

      return { previousData };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.updateCollectionSuccess);
    },

    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousData,
        );
      }
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.updateCollectionError, variant: 'destructive' });
    },
  });
};

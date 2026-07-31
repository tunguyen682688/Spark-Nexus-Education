import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { STALE_TIME_COLLECTIONS, STALE_TIME_STATIC_EXAM } from './use-query-constants';
import type { CollectionEditorResponse, ExamBuilderResponse, Exam } from '../../types';

// ===== Queries =====

export const useCollectionEditorData = (id: string) => {
  return useQuery<CollectionEditorResponse | null>({
    queryKey: ['certification', 'collection-editor', id],
    queryFn: () => CertificationApi.getCollectionEditorData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

export const useExamBuilderData = (id: string) => {
  return useQuery<ExamBuilderResponse | null>({
    queryKey: ['certification', 'exam-builder', id],
    queryFn: () => CertificationApi.getExamBuilderData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};

export const useExamDetail = (id: string) => {
  return useQuery<Exam | null>({
    queryKey: ['certification', 'exam', id],
    queryFn: () => CertificationApi.getExam(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};

// ===== Helper: update collection-editor cache =====

type EditorExam = CollectionEditorResponse['chapters'][number]['exams'][number];

function updateEditorCache(
  queryClient: ReturnType<typeof useQueryClient>,
  collectionId: string,
  updater: (data: CollectionEditorResponse) => CollectionEditorResponse,
) {
  queryClient.setQueryData<CollectionEditorResponse>(
    ['certification', 'collection-editor', collectionId],
    (old) => (old ? updater(old) : old),
  );
}

// ===== Exam CRUD Mutations =====

export const useCreateExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; title: string; collectionId: string },
    Error,
    {
      collectionId: string;
      title: string;
      description?: string | null;
      duration?: number;
      totalQuestions?: number;
      maxScore?: number;
      passScore?: number;
      examType?: string;
      certificationType?: string;
      chapterId?: string;
      sections?: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number }>;
    },
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ collectionId, ...dto }) => CertificationApi.createExam(collectionId, dto),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });

      const previousData = queryClient.getQueryData<CollectionEditorResponse>(
        ['certification', 'collection-editor', variables.collectionId],
      );

      const optimisticExam: EditorExam = {
        id: `optimistic-${Date.now()}`,
        number: 0,
        title: variables.title,
        subTitle: variables.description || '',
        questionsCount: variables.totalQuestions || 0,
        durationMinutes: variables.duration || 0,
        difficulty: 'Medium',
        status: 'Draft',
        iconType: variables.examType || 'default',
        chapterId: variables.chapterId,
      };

      updateEditorCache(queryClient, variables.collectionId, (old) => {
        const chapters = old.chapters.map((ch) => {
          if (variables.chapterId && ch.id === variables.chapterId) {
            return {
              ...ch,
              examCount: ch.examCount + 1,
              exams: [...ch.exams, { ...optimisticExam, number: ch.exams.length + 1 }],
            };
          }
          return ch;
        });

        // If no chapter matched, add to first chapter or create orphans
        if (!variables.chapterId || !chapters.some((ch) => ch.id === variables.chapterId)) {
          if (chapters.length > 0) {
            const first = chapters[0];
            chapters[0] = {
              ...first,
              examCount: first.examCount + 1,
              exams: [...first.exams, { ...optimisticExam, number: first.exams.length + 1 }],
            };
          } else {
            chapters.push({
              id: `orphans-${variables.collectionId}`,
              number: 1,
              title: 'Unsorted Exams',
              description: 'Exams not yet assigned to a chapter.',
              examCount: 1,
              exams: [{ ...optimisticExam, number: 1 }],
            });
          }
        }

        return { ...old, chapters };
      });

      return { previousData };
    },
    onSuccess: (_data, variables) => {
      // Refetch to replace optimistic data with real data
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      toast(CERTIFICATION_UI_TEXT.toast.createExamSuccess);
    },
    onError: (_err, variables, context) => {
      // Rollback
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousData,
        );
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.createExamError, variant: 'destructive' });
    },
  });
};

export const useUpdateExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    { id: string },
    Error,
    {
      examId: string;
      collectionId: string;
      title?: string;
      description?: string | null;
      duration?: number;
      totalQuestions?: number;
      maxScore?: number;
      passScore?: number;
      publishStatus?: string;
      silent?: boolean;
    },
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ examId, collectionId: _collectionId, silent: _silent, ...dto }) => CertificationApi.updateExam(examId, dto),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });

      const previousData = queryClient.getQueryData<CollectionEditorResponse>(
        ['certification', 'collection-editor', variables.collectionId],
      );

      updateEditorCache(queryClient, variables.collectionId, (old) => ({
        ...old,
        chapters: old.chapters.map((ch) => ({
          ...ch,
          exams: ch.exams.map((ex) =>
            ex.id === variables.examId
              ? {
                  ...ex,
                  title: variables.title ?? ex.title,
                  subTitle: variables.description !== undefined ? (variables.description || '') : ex.subTitle,
                  durationMinutes: variables.duration ?? ex.durationMinutes,
                  questionsCount: variables.totalQuestions ?? ex.questionsCount,
                  status: variables.publishStatus === 'published' ? ('Published' as const) : variables.publishStatus === 'draft' ? ('Draft' as const) : ex.status,
                }
              : ex,
          ),
        })),
      }));

      return { previousData };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'exam-builder', variables.examId] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.updateExamSuccess);
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousData,
        );
      }
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.updateExamError, variant: 'destructive' });
    },
  });
};

export const useDeleteExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    { deleted: boolean },
    Error,
    { examId: string; collectionId: string },
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ examId }) => CertificationApi.deleteExam(examId),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });

      const previousData = queryClient.getQueryData<CollectionEditorResponse>(
        ['certification', 'collection-editor', variables.collectionId],
      );

      updateEditorCache(queryClient, variables.collectionId, (old) => ({
        ...old,
        chapters: old.chapters
          .map((ch) => ({
            ...ch,
            exams: ch.exams.filter((ex) => ex.id !== variables.examId),
            examCount: ch.exams.filter((ex) => ex.id !== variables.examId).length,
          }))
          .filter((ch) => ch.exams.length > 0 || ch.id.startsWith('orphans-')),
      }));

      return { previousData };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      toast(CERTIFICATION_UI_TEXT.toast.deleteExamSuccess);
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousData,
        );
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteExamError, variant: 'destructive' });
    },
  });
};

// ===== Chapter Sync =====

export const useSyncChapters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    Array<{ id: string }>,
    Error,
    { collectionId: string; chapters: Array<{ id?: string; title: string; description?: string | null; order: number }>; silent?: boolean },
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ collectionId, chapters }) => CertificationApi.syncChapters(collectionId, chapters),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });

      const previousData = queryClient.getQueryData<CollectionEditorResponse>(
        ['certification', 'collection-editor', variables.collectionId],
      );

      // Optimistically update chapter titles and order
      updateEditorCache(queryClient, variables.collectionId, (old) => {
        const incomingMap = new Map(variables.chapters.map((ch) => [ch.id, ch]));
        const kept = old.chapters
          .filter((ch) => incomingMap.has(ch.id))
          .map((ch, idx) => {
            const incoming = incomingMap.get(ch.id)!;
            return {
              ...ch,
              title: incoming.title,
              description: incoming.description || '',
              number: idx + 1,
            };
          });

        // Add new chapters (no matching id in old chapters)
        const newChapters = variables.chapters
          .filter((ch) => ch.id && !old.chapters.some((oc) => oc.id === ch.id))
          .map((ch, idx) => ({
            id: ch.id!,
            number: kept.length + idx + 1,
            title: ch.title,
            description: ch.description || '',
            examCount: 0,
            exams: [],
          }));

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

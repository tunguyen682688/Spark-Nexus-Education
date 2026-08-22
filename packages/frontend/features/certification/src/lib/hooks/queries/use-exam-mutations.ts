import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { CollectionEditorResponse } from '../../types';
import { updateEditorCache, type EditorExam, type EditorChapter } from '../../services/exam-cache-helpers.service';

// ─── Create Exam ─────────────────────────────────────────────────────────────

export const useCreateExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type CreateVariables = {
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
    sections?: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number; questionCount?: number }>;
    silent?: boolean;
  };

  return useMutation<
    { id: string; title: string; collectionId: string },
    Error,
    CreateVariables,
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ collectionId, silent: _silent, ...dto }) =>
      CertificationApi.createExam(collectionId, dto),

    onMutate: async (variables) => {
      const queryKey = ['certification', 'collection-editor', variables.collectionId];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<CollectionEditorResponse>(queryKey);

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
        const chapters = [...old.chapters];
        const targetIdx = variables.chapterId
          ? chapters.findIndex((ch) => ch.id === variables.chapterId)
          : -1;

        if (targetIdx >= 0) {
          const target = chapters[targetIdx];
          chapters[targetIdx] = {
            ...target,
            examCount: target.examCount + 1,
            exams: [...target.exams, { ...optimisticExam, number: target.exams.length + 1 }],
          };
        } else if (chapters.length > 0) {
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
          } as EditorChapter);
        }

        return { ...old, chapters };
      });

      return { previousData };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.createExamSuccess);
    },

    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousData,
        );
      }
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.createExamError, variant: 'destructive' });
    },
  });
};

// ─── Delete Exam ─────────────────────────────────────────────────────────────

export const useDeleteExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation<
    { deleted: boolean },
    Error,
    { examId: string; collectionId: string; silent?: boolean },
    { previousData: CollectionEditorResponse | undefined }
  >({
    mutationFn: ({ examId, silent: _silent }) => CertificationApi.deleteExam(examId),

    onMutate: async (variables) => {
      const queryKey = ['certification', 'collection-editor', variables.collectionId];
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<CollectionEditorResponse>(queryKey);

      updateEditorCache(queryClient, variables.collectionId, (old) => ({
        ...old,
        chapters: old.chapters
          .map((ch) => {
            const remaining = ch.exams.filter((ex) => ex.id !== variables.examId);
            return { ...ch, exams: remaining, examCount: remaining.length };
          })
          .filter((ch) => ch.exams.length > 0 || ch.id.startsWith('orphans-')),
      }));

      return { previousData };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'collection-editor', variables.collectionId] });
      if (!variables.silent) toast(CERTIFICATION_UI_TEXT.toast.deleteExamSuccess);
    },

    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'collection-editor', variables.collectionId],
          context.previousData,
        );
      }
      if (!variables.silent) toast({ ...CERTIFICATION_UI_TEXT.toast.deleteExamError, variant: 'destructive' });
    },
  });
};



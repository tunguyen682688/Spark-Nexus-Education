import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { STALE_TIME_SESSION, STALE_TIME_STATIC_EXAM } from '../../constants/query-cache-times.constants';
import type { QuestionBuilderData, QuestionVersion, SaveQuestionDto, SaveQuestionResult } from '../../types';

// ===== Queries =====

export const useQuestionBuilderData = (id: string) => {
  return useQuery<QuestionBuilderData | null>({
    queryKey: ['certification', 'question-builder', id],
    queryFn: () => CertificationApi.getQuestionBuilderData(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_STATIC_EXAM,
    refetchOnWindowFocus: false,
  });
};

export const useQuestionHistory = (id: string) => {
  return useQuery<QuestionVersion[]>({
    queryKey: ['certification', 'question-history', id],
    queryFn: () => CertificationApi.getQuestionHistory(id),
    enabled: Boolean(id),
    staleTime: STALE_TIME_SESSION,
    refetchOnWindowFocus: false,
  });
};

// ===== Mutations =====

export const useSaveQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    SaveQuestionResult,
    Error,
    SaveQuestionDto & { silent?: boolean; examId?: string; sectionId?: string },
    { previousData: QuestionBuilderData | undefined }
  >({
    mutationFn: ({ silent: _silent, examId: _examId, sectionId: _sectionId, ...dto }) =>
      CertificationApi.saveQuestion(dto),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'question-builder', variables.id] });

      const previousData = queryClient.getQueryData<QuestionBuilderData>(
        ['certification', 'question-builder', variables.id],
      );

      // Optimistically update question builder cache
      if (previousData) {
        queryClient.setQueryData<QuestionBuilderData>(
          ['certification', 'question-builder', variables.id],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              questionText: variables.questionText || old.questionText,
              questionType: variables.questionType || old.questionType,
              difficulty: variables.difficulty || old.difficulty,
              shuffleOptions: variables.shuffleOptions ?? old.shuffleOptions,
              options: variables.options || old.options,
              explanation: variables.explanation || old.explanation,
              status: 'All changes saved',
              properties: {
                ...old.properties,
                points: variables.points ?? old.properties.points,
                lastUpdatedDate: new Date().toLocaleDateString(),
              },
            };
          },
        );
      }

      return { previousData };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['certification', 'question-builder', result.id],
      });
      if (variables.examId) {
        queryClient.invalidateQueries({
          queryKey: ['certification', 'exam-builder', variables.examId],
        });
        if (variables.sectionId) {
          queryClient.invalidateQueries({
            queryKey: ['certification', 'section-questions', variables.examId, variables.sectionId],
          });
        }
      }
      if (!variables.silent) {
        const msg = result.savedToBank
          ? CERTIFICATION_UI_TEXT.toast.saveQuestionToBankSuccess
          : CERTIFICATION_UI_TEXT.toast.saveQuestionSuccess;
        toast(msg);
      }
    },
    onError: (_err, variables, context) => {
      if (context?.previousData && variables.id) {
        queryClient.setQueryData(
          ['certification', 'question-builder', variables.id],
          context.previousData,
        );
      }
      if (!variables.silent) {
        toast({ ...CERTIFICATION_UI_TEXT.toast.saveQuestionError, variant: 'destructive' });
      }
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    { id: string; deleted: boolean },
    Error,
    { id: string; examId?: string; sectionId?: string },
    { previousData: QuestionBuilderData | undefined }
  >({
    mutationFn: ({ id }) => CertificationApi.deleteQuestion(id),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['certification', 'question-builder', variables.id] });

      const previousData = queryClient.getQueryData<QuestionBuilderData>(
        ['certification', 'question-builder', variables.id],
      );

      // Optimistically mark as deleted
      if (previousData) {
        queryClient.setQueryData<QuestionBuilderData>(
          ['certification', 'question-builder', variables.id],
          (old) => (old ? { ...old, status: 'Deleted' } : old),
        );
      }

      return { previousData };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['certification', 'question-builder', result.id],
      });
      if (variables.examId) {
        queryClient.invalidateQueries({
          queryKey: ['certification', 'exam-builder', variables.examId],
        });
        if (variables.sectionId) {
          queryClient.invalidateQueries({
            queryKey: ['certification', 'section-questions', variables.examId, variables.sectionId],
          });
        }
      }
      toast(CERTIFICATION_UI_TEXT.toast.deleteQuestionSuccess);
    },
    onError: (_err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['certification', 'question-builder', variables.id],
          context.previousData,
        );
      }
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteQuestionError, variant: 'destructive' });
    },
  });
};

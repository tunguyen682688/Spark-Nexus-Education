import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import type { ExamBuilderResponse } from '../../types';
import { updateExamBuilderCache } from '../../services/exam-cache-helpers.service';

export const useLinkQuestionToExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type LinkVariables = {
    examId: string;
    questionId: string;
    order?: number;
    points?: number;
    sectionId?: string;
    silent?: boolean;
    audioUrl?: string;
    imageUrl?: string;
    partNumber?: number;
    gapNumber?: number;
    writingTaskType?: string;
    speakingPrompt?: string;
    isGridIn?: boolean;
    formatMetadata?: unknown;
  };

  return useMutation<
    { examQuestionId: string },
    Error,
    LinkVariables,
    { previousSections: ExamBuilderResponse['sections'] | undefined }
  >({
    mutationFn: ({ examId, questionId, order, points, sectionId, audioUrl, imageUrl, partNumber, gapNumber, writingTaskType, speakingPrompt, isGridIn, formatMetadata, silent: _silent }) =>
      CertificationApi.linkQuestionToExam({ examId, questionId, order, points, sectionId, audioUrl, imageUrl, partNumber, gapNumber, writingTaskType, speakingPrompt, isGridIn, formatMetadata }),

    onMutate: async (variables) => {
      const queryKey = ['certification', 'exam-builder', variables.examId];
      await queryClient.cancelQueries({ queryKey });

      const previousSections = queryClient.getQueryData<ExamBuilderResponse>(queryKey)?.sections;

      updateExamBuilderCache(queryClient, variables.examId, (old) => ({
        ...old,
        sections: old.sections.map((sec) =>
          sec.id === variables.sectionId
            ? { ...sec, questionCount: (sec.questionCount ?? 0) + 1 }
            : sec,
        ),
      }));

      return { previousSections };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'exam-builder', variables.examId] });
      if (variables.sectionId) {
        queryClient.invalidateQueries({
          queryKey: ['certification', 'section-questions', variables.examId, variables.sectionId],
        });
      }
      if (!variables.silent) {
        toast({ title: 'Question linked', description: 'Question added to exam.' });
      }
    },

    onError: (_err, variables, context) => {
      if (context?.previousSections && variables.examId) {
        queryClient.setQueryData<ExamBuilderResponse>(
          ['certification', 'exam-builder', variables.examId],
          (old) => (old ? { ...old, sections: context.previousSections ?? old.sections } : old),
        );
      }
      if (!variables.silent) {
        toast({ title: 'Link failed', description: 'Could not link question to exam.', variant: 'destructive' });
      }
    },
  });
};

export const useUnlinkQuestionFromExam = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type UnlinkVariables = {
    examId: string;
    questionId: string;
    sectionId?: string;
    silent?: boolean;
  };

  return useMutation<
    void,
    Error,
    UnlinkVariables,
    { previousSections: ExamBuilderResponse['sections'] | undefined }
  >({
    mutationFn: ({ examId, questionId, silent: _silent }) =>
      CertificationApi.unlinkQuestionFromExam(examId, questionId),

    onMutate: async (variables) => {
      const queryKey = ['certification', 'exam-builder', variables.examId];
      await queryClient.cancelQueries({ queryKey });

      const previousSections = queryClient.getQueryData<ExamBuilderResponse>(queryKey)?.sections;

      updateExamBuilderCache(queryClient, variables.examId, (old) => ({
        ...old,
        sections: old.sections.map((sec) =>
          sec.id === variables.sectionId
            ? { ...sec, questionCount: Math.max(0, (sec.questionCount ?? 0) - 1) }
            : sec,
        ),
      }));

      return { previousSections };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'exam-builder', variables.examId] });
      if (variables.sectionId) {
        queryClient.invalidateQueries({
          queryKey: ['certification', 'section-questions', variables.examId, variables.sectionId],
        });
      }
      if (!variables.silent) {
        toast({ title: 'Question unlinked', description: 'Question removed from exam.' });
      }
    },

    onError: (_err, variables, context) => {
      if (context?.previousSections && variables.examId) {
        queryClient.setQueryData<ExamBuilderResponse>(
          ['certification', 'exam-builder', variables.examId],
          (old) => (old ? { ...old, sections: context.previousSections ?? old.sections } : old),
        );
      }
      if (!variables.silent) {
        toast({ title: 'Unlink failed', description: 'Could not remove question from exam.', variant: 'destructive' });
      }
    },
  });
};

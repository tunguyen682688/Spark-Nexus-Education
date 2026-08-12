import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import type { ExamBuilderResponse } from '../../types';
import { updateExamBuilderCache } from '../../services/exam-cache-helpers.service';

export const useSaveExamSections = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  type SectionVariables = {
    examId: string;
    sections: Array<{
      id?: string;
      title: string;
      sectionType?: string;
      instruction?: string | null;
      order: number;
      durationMinutes?: number;
    }>;
    silent?: boolean;
  };

  return useMutation<
    Array<{ id: string }>,
    Error,
    SectionVariables,
    { previousSections: ExamBuilderResponse['sections'] | undefined }
  >({
    mutationFn: ({ examId, sections, silent: _silent }) =>
      CertificationApi.saveExamSections(examId, sections),

    onMutate: async (variables) => {
      const queryKey = ['certification', 'exam-builder', variables.examId];
      await queryClient.cancelQueries({ queryKey });

      const previousSections = queryClient.getQueryData<ExamBuilderResponse>(queryKey)?.sections;

      updateExamBuilderCache(queryClient, variables.examId, (old) => ({
        ...old,
        sections: old.sections.map((sec, idx) => {
          const incoming = variables.sections[idx];
          if (!incoming) return sec;
          return {
            ...sec,
            title: incoming.title || sec.title,
            sectionType: incoming.sectionType || sec.sectionType,
            description: incoming.instruction || sec.description,
            durationMinutes: incoming.durationMinutes ?? sec.durationMinutes,
          };
        }),
      }));

      return { previousSections };
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['certification', 'exam-builder', variables.examId] });
      if (!variables.silent) {
        toast({ title: 'Sections saved', description: 'Exam sections updated successfully.' });
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
        toast({ title: 'Save failed', description: 'Could not save sections.', variant: 'destructive' });
      }
    },
  });
};

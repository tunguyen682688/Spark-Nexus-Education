import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { STALE_TIME_SESSION, STALE_TIME_STATIC_EXAM } from './use-query-constants';
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

  return useMutation<SaveQuestionResult, Error, SaveQuestionDto>({
    mutationFn: (dto: SaveQuestionDto) => CertificationApi.saveQuestion(dto),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['certification', 'question-builder', result.id],
      });
      const msg = result.savedToBank
        ? CERTIFICATION_UI_TEXT.toast.saveQuestionToBankSuccess
        : CERTIFICATION_UI_TEXT.toast.saveQuestionSuccess;
      toast(msg);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveQuestionError, variant: 'destructive' });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<{ id: string; deleted: boolean }, Error, string>({
    mutationFn: (id: string) => CertificationApi.deleteQuestion(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ['certification', 'question-builder', result.id],
      });
      toast(CERTIFICATION_UI_TEXT.toast.deleteQuestionSuccess);
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.deleteQuestionError, variant: 'destructive' });
    },
  });
};

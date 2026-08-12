import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@spark-nest-ed/frontend-shared-components';
import { CertificationApi } from '../../api/certification-api';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import { STALE_TIME_SESSION, STALE_TIME_COLLECTIONS } from '../../constants/query-cache-times.constants';
import type { ExamSession, ExamResult, SessionAnswer, SessionViolation, SaveSessionAnswerDto, RecordSessionViolationDto } from '../../types';

// ===== Queries =====

export const useExamSession = (sessionId: string) => {
  return useQuery<ExamSession | null>({
    queryKey: ['certification', 'session', sessionId],
    queryFn: () => CertificationApi.getExamSession(sessionId),
    enabled: Boolean(sessionId),
    staleTime: STALE_TIME_SESSION,
    refetchOnWindowFocus: false,
  });
};

export const useExamResult = (resultId: string) => {
  return useQuery<ExamResult | null>({
    queryKey: ['certification', 'result', resultId],
    queryFn: () => CertificationApi.getExamResult(resultId),
    enabled: Boolean(resultId),
    staleTime: STALE_TIME_COLLECTIONS,
    refetchOnWindowFocus: false,
  });
};

// ===== Mutations =====

export const useStartExamSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ExamSession, Error, string>({
    mutationFn: (examId: string) => CertificationApi.startExamSession(examId),
    onSuccess: (sessionData) => {
      queryClient.setQueryData(['certification', 'session', sessionData.id], sessionData);
      queryClient.invalidateQueries({ queryKey: ['certification', 'dashboard'] });
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.startSessionError, variant: 'destructive' });
    },
  });
};

export const useSaveSessionAnswer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<SessionAnswer, Error, { sessionId: string; dto: SaveSessionAnswerDto }>({
    mutationFn: ({ sessionId, dto }) => CertificationApi.saveSessionAnswer(sessionId, dto),
    onSuccess: (savedAnswer, variables) => {
      queryClient.setQueryData<ExamSession | undefined>(
        ['certification', 'session', variables.sessionId],
        (oldSession) => {
          if (!oldSession) return oldSession;
          const existingAnswerIndex = oldSession.answers.findIndex(
            (answer) => answer.questionId === variables.dto.questionId
          );
          let updatedAnswers: SessionAnswer[];
          if (existingAnswerIndex >= 0) {
            updatedAnswers = [...oldSession.answers];
            updatedAnswers[existingAnswerIndex] = {
              ...updatedAnswers[existingAnswerIndex],
              answerText: variables.dto.answerText ?? null,
              choiceIds: variables.dto.choiceIds ?? [],
              savedAt: new Date().toISOString(),
            };
          } else {
            updatedAnswers = [
              ...oldSession.answers,
              {
                id: savedAnswer.id,
                sessionId: variables.sessionId,
                questionId: variables.dto.questionId,
                answerText: variables.dto.answerText ?? null,
                choiceIds: variables.dto.choiceIds ?? [],
                savedAt: new Date().toISOString(),
              },
            ];
          }
          return {
            ...oldSession,
            answers: updatedAnswers,
          };
        }
      );
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.saveAnswerError, variant: 'destructive' });
    },
  });
};

export const useRecordSessionViolation = () => {
  const { toast } = useToast();

  return useMutation<SessionViolation, Error, { sessionId: string; dto: RecordSessionViolationDto }>({
    mutationFn: ({ sessionId, dto }) => CertificationApi.recordSessionViolation(sessionId, dto),
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.recordViolationError, variant: 'destructive' });
    },
  });
};

export const useSubmitExamSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ExamResult, Error, string>({
    mutationFn: (sessionId: string) => CertificationApi.submitExamSession(sessionId),
    onSuccess: (resultData) => {
      queryClient.setQueryData(['certification', 'result', resultData.id], resultData);
      queryClient.invalidateQueries({ queryKey: ['certification', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['certification', 'study-plan'] });
    },
    onError: () => {
      toast({ ...CERTIFICATION_UI_TEXT.toast.submitSessionError, variant: 'destructive' });
    },
  });
};

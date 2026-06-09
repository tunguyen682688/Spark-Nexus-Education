import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grammarApi } from '../api/grammar-api';
import type { PracticeQuestion } from '../types';
import { grammarKeys } from './grammar-keys';

export function useDailyQuizQuestions() {
  return useQuery({
    queryKey: [...grammarKeys.root, 'daily-quiz'] as const,
    queryFn: () => grammarApi.getDailyQuiz(),
    staleTime: 0, // Always load fresh daily quiz
  });
}

export function useSubmitDailyQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ score, xpEarned }: { score: number; xpEarned: number }) =>
      grammarApi.submitDailyQuiz(score, xpEarned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

export function useGrammarPracticeQuestions(filters: { level?: string; category?: string; type?: string }) {
  return useQuery<PracticeQuestion[]>({
    queryKey: [...grammarKeys.root, 'practice-questions', filters] as const,
    queryFn: () => grammarApi.getPracticeQuestions(filters),
    staleTime: 0,
  });
}

export function useSrsDueQuizzes() {
  return useQuery({
    queryKey: [...grammarKeys.root, 'srs-due-quizzes'] as const,
    queryFn: () => grammarApi.getSrsDueQuizzes(),
    staleTime: 0, // Always fresh
  });
}

export function useSubmitSrsFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ quizId, isCorrect }: { quizId: string; isCorrect: boolean }) =>
      grammarApi.submitSrsFeedback(quizId, isCorrect),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'srs-due-quizzes'] });
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

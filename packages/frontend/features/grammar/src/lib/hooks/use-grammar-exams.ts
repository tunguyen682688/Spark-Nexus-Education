import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grammarApi } from '../api/grammar-api';
import { grammarKeys } from './grammar-keys';
import type { GrammarExamSet, ExamQuestion } from '../types';

export function useSubmitLevelGraduation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ level, percentage }: { level: string; percentage: number }) =>
      grammarApi.submitGraduation(level, percentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

export function useGrammarExamSets(level?: string, examType?: string, search?: string) {
  return useQuery({
    queryKey: [...grammarKeys.root, 'exam-sets', { level, examType, search }] as const,
    queryFn: () => grammarApi.getExamSets(level, examType, search),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateGrammarExamSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; description: string; level: string; examType: GrammarExamSet['examType']; examMetadata?: Record<string, unknown>; timeLimit: number; questions: ExamQuestion[] }) =>
      grammarApi.createExamSet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'exam-sets'] });
    }
  });
}

export function useUpvoteGrammarExamSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => grammarApi.upvoteExamSet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'exam-sets'] });
    }
  });
}

export function useSubmitGrammarExamAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, correctCount, totalCount }: { id: string; correctCount: number; totalCount: number }) =>
      grammarApi.submitExamAttempt(id, { correctCount, totalCount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'exam-sets'] });
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'certificates'] });
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

export function useUserGrammarCertificates() {
  return useQuery({
    queryKey: [...grammarKeys.root, 'certificates'] as const,
    queryFn: () => grammarApi.getUserCertificates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

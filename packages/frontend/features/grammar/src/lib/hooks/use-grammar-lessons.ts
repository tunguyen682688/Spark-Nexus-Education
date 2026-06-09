import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grammarApi } from '../api/grammar-api';
import type { GrammarRoadmapResponse, SaveGrammarLessonDto } from '../types';
import { grammarKeys } from './grammar-keys';

export function useGrammarRoadmap() {
  return useQuery<GrammarRoadmapResponse>({
    queryKey: grammarKeys.roadmap(),
    queryFn: () => grammarApi.getRoadmap(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateGrammarLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveGrammarLessonDto) => grammarApi.createLesson(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

export function useUpdateGrammarLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveGrammarLessonDto }) => 
      grammarApi.updateLesson(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

export function useGrammarLesson(id: string | null | undefined) {
  return useQuery({
    queryKey: [...grammarKeys.root, 'lessons', id ?? 'unknown'] as const,
    queryFn: () => grammarApi.getLessonDetail(id as string),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCompleteGrammarLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => grammarApi.completeLesson(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'lessons', id] });
    }
  });
}

export function useUpdateGrammarProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status?: string; proficiency?: number; quickNotes?: string } }) =>
      grammarApi.updateProgress(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'lessons', id] });
    }
  });
}

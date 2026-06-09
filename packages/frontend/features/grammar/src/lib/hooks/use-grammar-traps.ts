import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grammarApi } from '../api/grammar-api';
import type { SaveGrammarTrapDto, UserGrammarTrap } from '../types';
import { grammarKeys } from './grammar-keys';

export function useGrammarTraps(status?: string) {
  return useQuery<UserGrammarTrap[]>({
    queryKey: [...grammarKeys.root, 'trap-diary', { status }] as const,
    queryFn: () => grammarApi.getGrammarTraps(status),
    staleTime: 5 * 1000, // 5 seconds
  });
}

export function useSaveGrammarTrap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveGrammarTrapDto) => grammarApi.saveGrammarTrap(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'trap-diary'] });
    }
  });
}

export function useBreakGrammarTrap() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => grammarApi.breakGrammarTrap(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'trap-diary'] });
      queryClient.invalidateQueries({ queryKey: grammarKeys.roadmap() });
    }
  });
}

export function useGenerateAiTrapAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => grammarApi.generateAiTrapAnalysis(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'trap-diary'] });
    }
  });
}

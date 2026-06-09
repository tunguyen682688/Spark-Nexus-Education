import { useQuery } from '@tanstack/react-query';
import { grammarApi } from '../api/grammar-api';
import type { GrammarAnalyticsResponse } from '../types';
import { grammarKeys } from './grammar-keys';

export function useGrammarAnalytics() {
  return useQuery<GrammarAnalyticsResponse>({
    queryKey: [...grammarKeys.root, 'analytics'] as const,
    queryFn: () => grammarApi.getAnalyticsSummary(),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useGrammarLeaderboard(timeframe: 'week' | 'month' | 'all-time' = 'all-time') {
  return useQuery({
    queryKey: [...grammarKeys.root, 'leaderboard', timeframe] as const,
    queryFn: () => grammarApi.getLeaderboard(timeframe),
    staleTime: 60 * 1000,
  });
}


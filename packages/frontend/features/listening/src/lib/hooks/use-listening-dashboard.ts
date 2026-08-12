import { useQuery } from '@tanstack/react-query';
import { listeningApi } from '../api/listening-api';
import { listeningKeys } from './listening-keys';

export function useListeningUserStats() {
  return useQuery({
    queryKey: listeningKeys.userStats(),
    queryFn: () => listeningApi.getUserStats(),
  });
}

export function useListeningWeeklyActivity() {
  return useQuery({
    queryKey: listeningKeys.weeklyActivity(),
    queryFn: () => listeningApi.getWeeklyActivity(),
  });
}

export function useListeningLeaderboard(limit?: number) {
  return useQuery({
    queryKey: listeningKeys.leaderboard(limit),
    queryFn: () => listeningApi.getListeningLeaderboard(limit),
  });
}

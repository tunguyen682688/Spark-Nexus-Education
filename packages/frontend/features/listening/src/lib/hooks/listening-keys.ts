export const listeningKeys = {
  root: ['listening'] as const,
  materials: () => [...listeningKeys.root, 'materials'] as const,
  list: (params?: unknown) => [...listeningKeys.materials(), 'list', params] as const,
  infiniteList: (params?: unknown) => [...listeningKeys.materials(), 'infinite', params] as const,
  detail: (id: string) => [...listeningKeys.materials(), 'detail', id] as const,
  userStats: () => [...listeningKeys.root, 'user-stats'] as const,
  weeklyActivity: () => [...listeningKeys.root, 'weekly-activity'] as const,
  leaderboard: (limit?: number) => [...listeningKeys.root, 'leaderboard', limit] as const,
} as const;

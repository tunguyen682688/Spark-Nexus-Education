/**
 * Listening API – Axios abstraction layer.
 * Provides JSON:API aware helpers that can be reused by React Query hooks.
 */

import { ListeningMaterial, ListeningUserStats, WeeklyActivityItem, ListeningLeaderboardEntry } from '../types';

const ENDPOINTS = {
  materials: '/listening/materials',
  material: (id: string) => `/listening/materials/${id}`,
  progress: (id: string) => `/listening/materials/${id}/progress`,
  vote: (id: string) => `/listening/materials/${id}/vote`,
  bookmark: (id: string) => `/listening/materials/${id}/bookmark`,
  userStats: '/listening/user-stats',
  weeklyActivity: '/listening/weekly-activity',
  leaderboard: '/listening/leaderboard',
} as const;

export interface SimplifiedListeningPaginatedResponse {
  items: ListeningMaterial[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapListeningMaterial(item: unknown): ListeningMaterial {
  if (!isRecord(item)) {
    throw new Error('Invalid JSON:API resource object');
  }

  const id = typeof item.id === 'string' ? item.id : '';
  const attr = isRecord(item.attributes) ? item.attributes : {};
  
  // Extract and format userProgress cleanly without using type assertions with "any"
  const rawProgress = isRecord(attr.userProgress) ? attr.userProgress : null;
  const progressVal = typeof attr.progress === 'number' ? attr.progress : undefined;

  const userProgress = rawProgress 
    ? {
        progress: typeof rawProgress.progress === 'number' ? rawProgress.progress : 0,
        timeSpent: typeof rawProgress.timeSpent === 'number' ? rawProgress.timeSpent : 0,
        lastPosition: typeof rawProgress.lastPosition === 'number' ? rawProgress.lastPosition : 0,
        completedAt: typeof rawProgress.completedAt === 'string' ? rawProgress.completedAt : null,
      }
    : progressVal !== undefined
    ? {
        progress: progressVal,
        timeSpent: typeof attr.timeSpent === 'number' ? attr.timeSpent : 0,
        lastPosition: typeof attr.lastPosition === 'number' ? attr.lastPosition : 0,
        completedAt: typeof attr.completedAt === 'string' ? attr.completedAt : null,
      }
    : null;

  return {
    id,
    ...attr,
    userProgress,
  } as unknown as ListeningMaterial;
}

export const listeningApi = {
  async getListeningMaterials(params?: {
    category?: string;
    difficulty?: string;
    isCommunity?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<SimplifiedListeningPaginatedResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get(ENDPOINTS.materials, { params });
    const rawData = response.data;
    
    const items = isRecord(rawData) && Array.isArray(rawData.data)
      ? rawData.data.map(mapListeningMaterial)
      : [];

    const meta = isRecord(rawData) && isRecord(rawData.meta) && isRecord(rawData.meta.pagination)
      ? {
          page: typeof rawData.meta.pagination.page === 'number' ? rawData.meta.pagination.page : 1,
          limit: typeof rawData.meta.pagination.limit === 'number' ? rawData.meta.pagination.limit : 20,
          total: typeof rawData.meta.pagination.total === 'number' ? rawData.meta.pagination.total : 0,
          totalPages: typeof rawData.meta.pagination.totalPages === 'number' ? rawData.meta.pagination.totalPages : 1,
        }
      : { total: items.length, page: 1, limit: 20, totalPages: 1 };

    return {
      items,
      meta,
    };
  },

  async getListeningMaterialDetail(id: string): Promise<ListeningMaterial> {
    const axios = await getAxiosInstance();
    const response = await axios.get(ENDPOINTS.material(id));
    const rawData = response.data;
    
    if (isRecord(rawData) && isRecord(rawData.data)) {
      return mapListeningMaterial(rawData.data);
    }
    throw new Error('Invalid JSON:API response');
  },

  async updateListeningProgress(
    id: string,
    progress: number,
    lastPosition: number,
    timeSpent: number,
    completed?: boolean
  ): Promise<unknown> {
    const axios = await getAxiosInstance();
    const response = await axios.post(ENDPOINTS.progress(id), {
      progress,
      lastPosition,
      timeSpent,
      completed,
    });
    return response.data;
  },

  async voteListeningMaterial(id: string, vote: number): Promise<unknown> {
    const axios = await getAxiosInstance();
    const response = await axios.post(ENDPOINTS.vote(id), {
      vote,
    });
    return response.data;
  },

  async createListeningMaterial(data: unknown): Promise<unknown> {
    const axios = await getAxiosInstance();
    const response = await axios.post(ENDPOINTS.materials, data);
    return response.data;
  },

  async toggleListeningBookmark(id: string): Promise<unknown> {
    const axios = await getAxiosInstance();
    const response = await axios.post(ENDPOINTS.bookmark(id));
    return response.data;
  },

  async getUserStats(): Promise<ListeningUserStats> {
    const axios = await getAxiosInstance();
    const response = await axios.get(ENDPOINTS.userStats);
    const rawData = response.data;
    if (isRecord(rawData) && isRecord(rawData.data)) {
      const id = typeof rawData.data.id === 'string' ? rawData.data.id : '';
      const attributes = isRecord(rawData.data.attributes) ? rawData.data.attributes : {};
      return { id, ...attributes } as unknown as ListeningUserStats;
    }
    return { totalMaterials: 0, totalTime: 0, masteryLevel: 'beginner', streak: 0 };
  },

  async getWeeklyActivity(): Promise<WeeklyActivityItem[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get(ENDPOINTS.weeklyActivity);
    const rawData = response.data;
    if (isRecord(rawData) && isRecord(rawData.data) && isRecord(rawData.data.attributes)) {
      return (Array.isArray(rawData.data.attributes.activity) ? rawData.data.attributes.activity : []) as WeeklyActivityItem[];
    }
    return [];
  },

  async getListeningLeaderboard(limit?: number): Promise<ListeningLeaderboardEntry[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get(ENDPOINTS.leaderboard, { params: { limit } });
    const rawData = response.data;
    if (isRecord(rawData) && isRecord(rawData.data) && isRecord(rawData.data.attributes)) {
      return (Array.isArray(rawData.data.attributes.entries) ? rawData.data.attributes.entries : []) as ListeningLeaderboardEntry[];
    }
    return [];
  },
};

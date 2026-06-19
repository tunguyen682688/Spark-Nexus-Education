import { getAxiosClient } from '@spark-nest-ed/frontend-core-api';
import { ListeningMaterial } from '../types';

export const listeningApi = {
  async getListeningMaterials(params?: {
    category?: string;
    difficulty?: string;
    isCommunity?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const client = getAxiosClient();
    const response = await client.get('/listening/materials', { params });
    // Parse JSON:API format
    const rawData = response.data;
    const items = Array.isArray(rawData.data)
      ? rawData.data.map((item: any) => ({
          id: item.id,
          ...item.attributes,
        }))
      : [];

    return {
      items: items as ListeningMaterial[],
      meta: rawData.meta || { total: 0, page: 1, limit: 20, totalPages: 0 },
    };
  },

  async getListeningMaterialDetail(id: string) {
    const client = getAxiosClient();
    const response = await client.get(`/listening/materials/${id}`);
    const rawData = response.data;
    
    if (rawData && rawData.data) {
      const item = rawData.data;
      return {
        id: item.id,
        ...item.attributes,
      } as ListeningMaterial;
    }
    throw new Error('Invalid JSON:API response');
  },

  async updateListeningProgress(
    id: string,
    progress: number,
    lastPosition: number,
    timeSpent: number,
    completed?: boolean
  ) {
    const client = getAxiosClient();
    const response = await client.post(`/listening/materials/${id}/progress`, {
      progress,
      lastPosition,
      timeSpent,
      completed,
    });
    return response.data;
  },

  async voteListeningMaterial(id: string, vote: number) {
    const client = getAxiosClient();
    const response = await client.post(`/listening/materials/${id}/vote`, {
      vote,
    });
    return response.data;
  },

  async createListeningMaterial(data: any) {
    const client = getAxiosClient();
    const response = await client.post('/listening/materials', data);
    return response.data;
  },
};

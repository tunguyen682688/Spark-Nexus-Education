import type {
  ExamCollection,
  CollectionDiscussion,
  CreateCollectionReviewDto,
  CreateCollectionDiscussionDto,
  CollectionEditorResponse,
} from '../types';
import type { SimplifiedPaginatedResponse } from '@spark-nest-ed/frontend-core-api';
import { getAxiosInstance, unwrapJsonApiResponse, unwrapPaginatedJsonApiResponse } from './api-helpers';

export class CollectionApi {
  static async getFeaturedCollections(
    exam?: string,
    search?: string,
    page?: number,
    limit?: number
  ): Promise<SimplifiedPaginatedResponse<ExamCollection>> {
    const client = await getAxiosInstance();
    const params: Record<string, string | number> = {};
    if (exam && exam !== 'All') params.exam = exam;
    if (search) params.search = search;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await client.get('/certification/collections/featured', { params });
    return unwrapPaginatedJsonApiResponse<ExamCollection>(response.data);
  }

  static async getTrendingCollections(
    page?: number,
    limit?: number
  ): Promise<SimplifiedPaginatedResponse<ExamCollection>> {
    const client = await getAxiosInstance();
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await client.get('/certification/collections/trending', { params });
    return unwrapPaginatedJsonApiResponse<ExamCollection>(response.data);
  }

  static async getOfficialCollections(
    page?: number,
    limit?: number
  ): Promise<SimplifiedPaginatedResponse<ExamCollection>> {
    const client = await getAxiosInstance();
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await client.get('/certification/collections/official', { params });
    return unwrapPaginatedJsonApiResponse<ExamCollection>(response.data);
  }

  static async getCommunityCollections(
    page?: number,
    limit?: number
  ): Promise<SimplifiedPaginatedResponse<ExamCollection>> {
    const client = await getAxiosInstance();
    const params: Record<string, string | number> = {};
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const response = await client.get('/certification/collections/community', { params });
    return unwrapPaginatedJsonApiResponse<ExamCollection>(response.data);
  }

  static async getCollection(id: string): Promise<ExamCollection | null> {
    if (!id) return null;
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${id}`);
    return unwrapJsonApiResponse<ExamCollection>(response.data);
  }

  static async getCollectionItems(collectionId: string): Promise<Array<{ id: string; title: string; type: string; duration?: number; totalQuestions?: number; certificationType?: string | null }>> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${collectionId}/items`);
    const data = unwrapJsonApiResponse<{ itemsList?: Array<{ id: string; title: string; type: string; duration?: number; totalQuestions?: number; certificationType?: string | null }> }>(response.data);
    if (data && Array.isArray(data.itemsList)) {
      return data.itemsList;
    }
    return [];
  }

  static async getCollectionReviews(collectionId: string): Promise<Array<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }>> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${collectionId}/reviews`);
    const data = unwrapJsonApiResponse<{ items?: Array<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }> }>(response.data);
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  }

  static async addCollectionReview(collectionId: string, dto: CreateCollectionReviewDto): Promise<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/reviews`, dto);
    return unwrapJsonApiResponse<{ id: string; author: string; avatar?: string; rating: number; date: string; text: string }>(response.data);
  }

  static async getCollectionDiscussions(collectionId: string): Promise<CollectionDiscussion[]> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${collectionId}/discussions`);
    const data = unwrapJsonApiResponse<{ discussions?: CollectionDiscussion[] }>(response.data);
    if (data && Array.isArray(data.discussions)) {
      return data.discussions;
    }
    return [];
  }

  static async addCollectionDiscussion(collectionId: string, dto: CreateCollectionDiscussionDto): Promise<{ success: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/discussions`, dto);
    return unwrapJsonApiResponse<{ success: boolean }>(response.data);
  }

  static async getCollectionActivities(collectionId: string): Promise<Array<{ user: string; action: string; time: string }>> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${collectionId}/activities`);
    const data = unwrapJsonApiResponse<{ activities?: Array<{ user: string; action: string; time: string }> }>(response.data);
    if (data && Array.isArray(data.activities)) {
      return data.activities;
    }
    return [];
  }

  static async saveCollection(collectionId: string): Promise<{ saved: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/save`);
    const data = unwrapJsonApiResponse<{ success?: boolean; saved?: boolean }>(response.data);
    return { saved: Boolean(data?.saved ?? data?.success ?? true) };
  }

  static async getSavedCollections(): Promise<ExamCollection[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/saved');
    const data = unwrapJsonApiResponse<{ items?: ExamCollection[] }>(response.data);
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  }

  static async getMyCollections(): Promise<ExamCollection[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/my');
    const data = unwrapJsonApiResponse<{ items?: ExamCollection[] }>(response.data);
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  }

  static async cloneCollection(collectionId: string): Promise<{ cloned: boolean; newCollectionId: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/clone`);
    const data = unwrapJsonApiResponse<{ newCollectionId?: string; id?: string; cloned?: boolean }>(response.data);
    return {
      cloned: Boolean(data?.cloned ?? true),
      newCollectionId: String(data?.newCollectionId || data?.id || collectionId)
    };
  }

  static async reportCollection(collectionId: string, reason = 'Inappropriate content'): Promise<{ reported: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/report`, { reason: reason || 'Inappropriate content' });
    const data = unwrapJsonApiResponse<{ reported?: boolean; success?: boolean }>(response.data);
    return { reported: Boolean(data?.reported ?? data?.success ?? true) };
  }

  static async createCollection(dto: { title: string; description?: string | null }): Promise<{ id: string; title: string; description: string | null }> {
    const client = await getAxiosInstance();
    const response = await client.post('/certification/collections', dto);
    return unwrapJsonApiResponse<{ id: string; title: string; description: string | null }>(response.data);
  }

  static async updateCollection(collectionId: string, dto: {
    title?: string;
    description?: string | null;
    subtitle?: string | null;
    level?: string | null;
    tags?: string[];
    visibility?: string;
    allowDownloads?: boolean;
    coverImage?: string | null;
    publishStatus?: string
  }): Promise<{ id: string }> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/collections/${collectionId}`, dto);
    return unwrapJsonApiResponse<{ id: string }>(response.data);
  }

  static async deleteCollection(collectionId: string): Promise<{ deleted: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.delete(`/certification/collections/${collectionId}`);
    return unwrapJsonApiResponse<{ deleted: boolean }>(response.data);
  }

  static async getCollectionEditorData(id: string): Promise<CollectionEditorResponse | null> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${id}/editor`);
    return unwrapJsonApiResponse<CollectionEditorResponse>(response.data);
  }

  static async syncChapters(collectionId: string, chapters: Array<{ id?: string; title: string; description?: string | null; order: number }>): Promise<Array<{ id: string }>> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/collections/${collectionId}/chapters`, { chapters });
    return unwrapJsonApiResponse<Array<{ id: string }>>(response.data);
  }
}

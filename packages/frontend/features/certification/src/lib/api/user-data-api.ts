import type {
  CertificateItem,
  PracticeHistoryResponse,
  CompletedCollectionsResponse,
  FavoritesResponse,
  BookmarksResponse,
  DownloadsResponse,
  PurchasedCollectionsResponse,
} from '../types';
import { getAxiosInstance, unwrapJsonApiResponse } from './api-helpers';

export class UserDataApi {
  static async getPracticeHistory(): Promise<PracticeHistoryResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/history');
    return unwrapJsonApiResponse<PracticeHistoryResponse>(response.data) || { id: '', userId: '', totalSessions: 0, items: [] };
  }

  static async getCompletedCollections(): Promise<CompletedCollectionsResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/completed');
    return unwrapJsonApiResponse<CompletedCollectionsResponse>(response.data) || { id: '', userId: '', totalCompleted: 0, items: [] };
  }

  static async getFavorites(): Promise<FavoritesResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/favorites');
    return unwrapJsonApiResponse<FavoritesResponse>(response.data) || { id: '', userId: '', totalFavorites: 0, items: [] };
  }

  static async addFavorite(collectionId: string): Promise<{ favorited: boolean }> {
    const client = await getAxiosInstance();
    await client.post(`/certification/collections/${collectionId}/favorite`);
    return { favorited: true };
  }

  static async removeFavorite(id: string): Promise<boolean> {
    const client = await getAxiosInstance();
    await client.delete(`/certification/favorites/${id}`);
    return true;
  }

  static async getBookmarks(): Promise<BookmarksResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/bookmarks');
    return unwrapJsonApiResponse<BookmarksResponse>(response.data) || { id: '', userId: '', totalBookmarks: 0, items: [] };
  }

  static async addBookmark(dto: { itemId: string; itemType?: string; title?: string; folderName?: string }): Promise<{ success: boolean; bookmarkId: string }> {
    const client = await getAxiosInstance();
    const response = await client.post('/certification/bookmarks', dto);
    const data = unwrapJsonApiResponse<{ success?: boolean; id?: string; bookmarkId?: string }>(response.data);
    return {
      success: Boolean(data?.success ?? true),
      bookmarkId: String(data?.bookmarkId || data?.id || dto.itemId),
    };
  }

  static async removeBookmark(id: string): Promise<boolean> {
    const client = await getAxiosInstance();
    await client.delete(`/certification/bookmarks/${id}`);
    return true;
  }

  static async getDownloads(): Promise<DownloadsResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/downloads');
    return unwrapJsonApiResponse<DownloadsResponse>(response.data) || { id: '', userId: '', totalDownloads: 0, items: [] };
  }

  static async deleteDownload(id: string): Promise<boolean> {
    const client = await getAxiosInstance();
    await client.delete(`/certification/downloads/${id}`);
    return true;
  }

  static async clearDownloads(): Promise<boolean> {
    const client = await getAxiosInstance();
    await client.delete('/certification/downloads');
    return true;
  }

  static async getPurchasedCollections(): Promise<PurchasedCollectionsResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/purchased');
    return unwrapJsonApiResponse<PurchasedCollectionsResponse>(response.data) || { id: '', userId: '', totalPurchased: 0, items: [] };
  }

  static async getCertificates(): Promise<CertificateItem[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/certificates');
    const items = unwrapJsonApiResponse<CertificateItem[]>(response.data);
    return Array.isArray(items) ? items : [];
  }

  static async downloadCertificate(certificateId: string): Promise<{ success: boolean; url: string }> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/certificates/${certificateId}/download`);
    const data = unwrapJsonApiResponse<{ success?: boolean; url?: string }>(response.data);
    return { success: true, url: data?.url || '#' };
  }

  static async getClonedCollections(): Promise<{ id: string; userId: string; totalCloned: number; items: Array<{ id: string; title: string; description: string; ownerId: string; publishStatus: string; createdAt: string; examCount: number; itemCount: number }> }> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/cloned');
    return unwrapJsonApiResponse(response.data) || { id: '', userId: '', totalCloned: 0, items: [] };
  }
}

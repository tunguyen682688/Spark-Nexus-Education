import type { 
  ExamCollection, 
  DashboardStats, 
  StudyPlanDay, 
  Contributor,
  Exam,
  ExamSession,
  SessionAnswer,
  SessionViolation,
  ExamResult,
  SaveSessionAnswerDto,
  RecordSessionViolationDto,
  CollectionDiscussion,
  CreateCollectionReviewDto,
  CreateCollectionDiscussionDto,
  SaveQuestionDto,
  SaveQuestionResult,
  CertificateItem,
  QuestionBuilderData,
  QuestionVersion,
  CreatorDashboardResponse,
  CollectionEditorResponse,
  ExamBuilderResponse,
  PracticeHistoryResponse,
  CompletedCollectionsResponse,
  FavoritesResponse,
  BookmarksResponse,
  DownloadsResponse,
  PurchasedCollectionsResponse,
} from '../types';

const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

function unwrapJsonApiResponse<T>(payload: Record<string, unknown> | null | undefined): T {
  if (!payload) return payload as unknown as T;
  const rawData = payload.data as Record<string, unknown> | Array<Record<string, unknown>> | undefined;
  if (rawData) {
    if (Array.isArray(rawData)) {
      return rawData.map((item) => {
        const attrs = item.attributes as Record<string, unknown> | undefined;
        return attrs ? { id: item.id, ...attrs } : item;
      }) as unknown as T;
    }
    const singleAttrs = rawData.attributes as Record<string, unknown> | undefined;
    if (singleAttrs) {
      return { id: rawData.id, ...singleAttrs } as unknown as T;
    }
    return rawData as unknown as T;
  }
  return payload as unknown as T;
}

export class CertificationApi {
  static async getDashboardStats(): Promise<DashboardStats> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/dashboard');
    return unwrapJsonApiResponse<DashboardStats>(response.data);
  }

  static async getCreatorDashboardData(): Promise<CreatorDashboardResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/creator-dashboard');
    return unwrapJsonApiResponse<CreatorDashboardResponse>(response.data);
  }

  static async getCollectionEditorData(id: string): Promise<CollectionEditorResponse | null> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${id}/editor`);
    return unwrapJsonApiResponse<CollectionEditorResponse>(response.data);
  }

  static async getExamBuilderData(id: string): Promise<ExamBuilderResponse | null> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${id}/builder`);
    return unwrapJsonApiResponse<ExamBuilderResponse>(response.data);
  }

  static async getQuestionBuilderData(id: string): Promise<QuestionBuilderData | null> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/questions/${id}/builder`);
    return unwrapJsonApiResponse<QuestionBuilderData>(response.data);
  }

  static async saveQuestion(dto: SaveQuestionDto): Promise<SaveQuestionResult> {
    const client = await getAxiosInstance();
    const response = await client.post('/certification/questions/save', dto);
    return unwrapJsonApiResponse<SaveQuestionResult>(response.data);
  }

  static async deleteQuestion(id: string): Promise<{ id: string; deleted: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.delete(`/certification/questions/${id}`);
    return unwrapJsonApiResponse<{ id: string; deleted: boolean }>(response.data);
  }

  static async getQuestionHistory(id: string): Promise<QuestionVersion[]> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/questions/${id}/history`);
    const unwrapped = unwrapJsonApiResponse<QuestionVersion[]>(response.data);
    return Array.isArray(unwrapped) ? unwrapped : [];
  }

  static async getFeaturedCollections(exam?: string, search?: string): Promise<ExamCollection[]> {
    const client = await getAxiosInstance();
    const params: Record<string, string> = {};
    if (exam && exam !== 'All') params.exam = exam;
    if (search) params.search = search;
    const response = await client.get('/certification/collections/featured', { params });
    const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
    return Array.isArray(items) ? items : [];
  }

  static async getTrendingCollections(): Promise<ExamCollection[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/trending');
    const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
    return Array.isArray(items) ? items : [];
  }

  static async getOfficialCollections(): Promise<ExamCollection[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/official');
    const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
    return Array.isArray(items) ? items : [];
  }

  static async getCommunityCollections(): Promise<ExamCollection[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/community');
    const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
    return Array.isArray(items) ? items : [];
  }

  static async getCollection(id: string): Promise<ExamCollection | null> {
    if (!id) return null;
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${id}`);
    return unwrapJsonApiResponse<ExamCollection>(response.data);
  }

  static async getCollectionItems(collectionId: string): Promise<Array<{ id: string; title: string; type: string; duration?: string; items?: string }>> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/collections/${collectionId}/items`);
    const data = unwrapJsonApiResponse<{ itemsList?: Array<{ id: string; title: string; type: string; duration?: string; items?: string }> }>(response.data);
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

  static async getStudyPlan(): Promise<StudyPlanDay[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/study-plan');
    const data = unwrapJsonApiResponse<{ tasks?: StudyPlanDay[] }>(response.data);
    if (data && Array.isArray(data.tasks)) {
      return data.tasks;
    }
    if (Array.isArray(data)) {
      return data as unknown as StudyPlanDay[];
    }
    return [];
  }

  static async getTopContributors(): Promise<Contributor[]> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/contributors/top');
    const data = unwrapJsonApiResponse<{ contributors?: Contributor[] }>(response.data);
    if (data && Array.isArray(data.contributors)) {
      return data.contributors;
    }
    if (Array.isArray(data)) {
      return data as unknown as Contributor[];
    }
    return [];
  }

  static async getExam(id: string): Promise<Exam | null> {
    if (!id) return null;
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${id}`);
    return unwrapJsonApiResponse<Exam>(response.data);
  }

  static async startExamSession(examId: string): Promise<ExamSession> {
    const client = await getAxiosInstance();
    const response = await client.post('/certification/sessions/start', { examId });
    return unwrapJsonApiResponse<ExamSession>(response.data);
  }

  static async getExamSession(sessionId: string): Promise<ExamSession | null> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/sessions/${sessionId}`);
    return unwrapJsonApiResponse<ExamSession>(response.data);
  }

  static async saveSessionAnswer(sessionId: string, dto: SaveSessionAnswerDto): Promise<SessionAnswer> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/sessions/${sessionId}/answers`, dto);
    return unwrapJsonApiResponse<SessionAnswer>(response.data);
  }

  static async recordSessionViolation(sessionId: string, dto: RecordSessionViolationDto): Promise<SessionViolation> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/sessions/${sessionId}/violations`, dto);
    return unwrapJsonApiResponse<SessionViolation>(response.data);
  }

  static async submitExamSession(sessionId: string): Promise<ExamResult> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/sessions/${sessionId}/submit`);
    return unwrapJsonApiResponse<ExamResult>(response.data);
  }

  static async getExamResult(resultId: string): Promise<ExamResult | null> {
    if (!resultId) return null;
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/results/${resultId}`);
    return unwrapJsonApiResponse<ExamResult>(response.data);
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

  static async getPurchasedCollections(): Promise<PurchasedCollectionsResponse> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/purchased');
    return unwrapJsonApiResponse<PurchasedCollectionsResponse>(response.data) || { id: '', userId: '', totalPurchased: 0, items: [] };
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

  // ===== Collection CRUD =====

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

  // ===== Exam CRUD =====

  static async createExam(collectionId: string, dto: { title: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; examType?: string; certificationType?: string; chapterId?: string; sections?: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number }> }): Promise<{ id: string; title: string; collectionId: string; examType?: string; certificationType?: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/exams`, dto);
    return unwrapJsonApiResponse<{ id: string; title: string; collectionId: string }>(response.data);
  }

  static async updateExam(examId: string, dto: { title?: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; publishStatus?: string }): Promise<{ id: string }> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/exams/${examId}`, dto);
    return unwrapJsonApiResponse<{ id: string }>(response.data);
  }

  static async deleteExam(examId: string): Promise<{ deleted: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.delete(`/certification/exams/${examId}`);
    return unwrapJsonApiResponse<{ deleted: boolean }>(response.data);
  }

  // ===== Chapter CRUD =====

  static async syncChapters(collectionId: string, chapters: Array<{ id?: string; title: string; description?: string | null; order: number }>): Promise<Array<{ id: string }>> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/collections/${collectionId}/chapters`, { chapters });
    return unwrapJsonApiResponse<Array<{ id: string }>>(response.data);
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

  static async getInProgressSessions(): Promise<{ id: string; userId: string; totalInProgress: number; items: Array<{ id: string; examId: string; title: string; status: string; startedAt: string; timeAgo: string; examTitle: string; totalQuestions: number }> }> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/sessions/in-progress');
    return unwrapJsonApiResponse(response.data) || { id: '', userId: '', totalInProgress: 0, items: [] };
  }

  static async getClonedCollections(): Promise<{ id: string; userId: string; totalCloned: number; items: Array<{ id: string; title: string; description: string; ownerId: string; publishStatus: string; createdAt: string; examCount: number; itemCount: number }> }> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/collections/cloned');
    return unwrapJsonApiResponse(response.data) || { id: '', userId: '', totalCloned: 0, items: [] };
  }
}

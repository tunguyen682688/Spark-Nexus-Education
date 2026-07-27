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
} from '../types';
import {
  DEFAULT_DASHBOARD_STATS,
  FEATURED_COLLECTIONS,
  TRENDING_COLLECTIONS,
  OFFICIAL_COLLECTIONS,
  COMMUNITY_COLLECTIONS,
  STUDY_PLAN_DAYS,
  TOP_CONTRIBUTORS
} from '../constants/certification.constants';

const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

/**
 * Unwrap JSON:API response payload into raw attributes / entity object.
 */
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
  /**
   * Fetch certification dashboard metrics (prediction, accuracy, time spent, streaks)
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/dashboard');
      const unwrapped = unwrapJsonApiResponse<DashboardStats>(response.data);
      return unwrapped || DEFAULT_DASHBOARD_STATS;
    } catch {
      return DEFAULT_DASHBOARD_STATS;
    }
  }

  /**
   * Fetch creator dashboard metrics, performance chart, top exams, recent activity, and revenue.
   */
  static async getCreatorDashboardData(): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/creator-dashboard');
      const unwrapped = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      return unwrapped || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch collection editor details and structure
   */
  static async getCollectionEditorData(id: string): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/collections/${id}/editor`);
      const unwrapped = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      return unwrapped || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch exam builder details, sections, and questions list
   */
  static async getExamBuilderData(id: string): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/exams/${id}/builder`);
      const unwrapped = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      return unwrapped || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch question builder details, options, explanation and properties
   */
  static async getQuestionBuilderData(id: string): Promise<QuestionBuilderData | null> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/questions/${id}/builder`);
      const unwrapped = unwrapJsonApiResponse<QuestionBuilderData>(response.data);
      return unwrapped || null;
    } catch {
      return null;
    }
  }

  /**
   * Create or update a question from the Question Builder.
   * When dto.target === 'bank' the question is also stored in the reusable Question Bank.
   */
  static async saveQuestion(dto: SaveQuestionDto): Promise<SaveQuestionResult> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/questions/save`, dto);
    return unwrapJsonApiResponse<SaveQuestionResult>(response.data);
  }

  /**
   * Delete a question and all associated data.
   */
  static async deleteQuestion(id: string): Promise<{ id: string; deleted: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.delete(`/certification/questions/${id}`);
    return unwrapJsonApiResponse<{ id: string; deleted: boolean }>(response.data);
  }

  /**
   * Get question version history for the History tab.
   */
  static async getQuestionHistory(id: string): Promise<QuestionVersion[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/questions/${id}/history`);
      const unwrapped = unwrapJsonApiResponse<QuestionVersion[]>(response.data);
      return Array.isArray(unwrapped) ? unwrapped : [];
    } catch {
      return [];
    }
  }

  static async getFeaturedCollections(exam?: string, search?: string): Promise<ExamCollection[]> {
    try {
      const client = await getAxiosInstance();
      const params: Record<string, string> = {};
      if (exam && exam !== 'All') params.exam = exam;
      if (search) params.search = search;

      const response = await client.get('/certification/collections/featured', { params });
      const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return FEATURED_COLLECTIONS.filter(item => {
        const matchExam = !exam || exam === 'All' || item.exam.toUpperCase() === exam.toUpperCase();
        const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
        return matchExam && matchSearch;
      });
    } catch (error) {
      console.warn('CertificationApi.getFeaturedCollections fallback to local mock data', error);
      return FEATURED_COLLECTIONS.filter(item => {
        const matchExam = !exam || exam === 'All' || item.exam.toUpperCase() === exam.toUpperCase();
        const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
        return matchExam && matchSearch;
      });
    }
  }

  /**
   * Fetch trending exam collections
   */
  static async getTrendingCollections(): Promise<ExamCollection[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/collections/trending');
      const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return TRENDING_COLLECTIONS;
    } catch (error) {
      console.warn('CertificationApi.getTrendingCollections fallback', error);
      return TRENDING_COLLECTIONS;
    }
  }

  /**
   * Fetch official verified exam collections
   */
  static async getOfficialCollections(): Promise<ExamCollection[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/collections/official');
      const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return OFFICIAL_COLLECTIONS;
    } catch (error) {
      console.warn('CertificationApi.getOfficialCollections fallback', error);
      return OFFICIAL_COLLECTIONS;
    }
  }

  /**
   * Fetch community-created exam collections
   */
  static async getCommunityCollections(): Promise<ExamCollection[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/collections/community');
      const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return COMMUNITY_COLLECTIONS;
    } catch (error) {
      console.warn('CertificationApi.getCommunityCollections fallback', error);
      return COMMUNITY_COLLECTIONS;
    }
  }

  private static findFallbackCollection(id: string): ExamCollection {
    const allCollections = [
      ...FEATURED_COLLECTIONS,
      ...TRENDING_COLLECTIONS,
      ...OFFICIAL_COLLECTIONS,
      ...COMMUNITY_COLLECTIONS
    ];
    const match = allCollections.find(c => c.id === id);
    if (match) return match;

    const num = id.replace(/\D/g, '');
    if (num) {
      const matchByNum = allCollections.find(c => c.id === `c${num}`) || allCollections.find(c => c.id === `f${num}`);
      if (matchByNum) return { ...matchByNum, id };
    }

    return {
      ...FEATURED_COLLECTIONS[0],
      id,
      title: `Practice Collection ${id.toUpperCase()}`,
    };
  }

  private static findFallbackExam(id: string): Exam {
    return {
      id,
      collectionId: 'c1',
      title: `Practice Examination ${id.toUpperCase()}`,
      code: `EXAM-${id.toUpperCase()}`,
      description: 'Standardized mock examination with auto-scoring and detailed explanation',
      examType: 'FULL_MOCK',
      durationMinutes: 120,
      totalQuestions: 200,
      passingScore: 600,
    };
  }

  /**
   * Fetch specific collection details by ID
   */
  static async getCollection(id: string): Promise<ExamCollection | null> {
    if (!id) return null;
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/collections/${id}`);
      const data = unwrapJsonApiResponse<ExamCollection>(response.data);
      if (data && data.title) {
        return data;
      }
      return this.findFallbackCollection(id);
    } catch (error) {
      console.warn(`CertificationApi.getCollection(${id}) fallback`, error);
      return this.findFallbackCollection(id);
    }
  }

  /**
   * Fetch items and mock tests within a collection on-demand
   */
  static async getCollectionItems(collectionId: string): Promise<Array<{ id: string; title: string; type: string; duration?: string; items?: string }>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/collections/${collectionId}/items`);
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && Array.isArray(data.itemsList)) {
        return data.itemsList as Array<{ id: string; title: string; type: string; duration?: string; items?: string }>;
      }
      return [];
    } catch (error) {
      console.warn(`CertificationApi.getCollectionItems(${collectionId}) fallback`, error);
      return [];
    }
  }

  /**
   * Fetch collection reviews
   */
  static async getCollectionReviews(collectionId: string): Promise<Array<{ author: string; avatar?: string; rating: number; date: string; text: string }>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/collections/${collectionId}/reviews`);
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && Array.isArray(data.reviews)) {
        return data.reviews as Array<{ author: string; avatar?: string; rating: number; date: string; text: string }>;
      }
      return [];
    } catch (error) {
      console.warn(`CertificationApi.getCollectionReviews(${collectionId}) fallback`, error);
      return [];
    }
  }

  /**
   * Add a review for a collection
   */
  static async addCollectionReview(collectionId: string, dto: CreateCollectionReviewDto): Promise<{ success: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/reviews`, dto);
    return unwrapJsonApiResponse<{ success: boolean }>(response.data);
  }

  /**
   * Fetch collection discussions
   */
  static async getCollectionDiscussions(collectionId: string): Promise<CollectionDiscussion[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/collections/${collectionId}/discussions`);
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && Array.isArray(data.discussions)) {
        return data.discussions as CollectionDiscussion[];
      }
      return [];
    } catch (error) {
      console.warn(`CertificationApi.getCollectionDiscussions(${collectionId}) fallback`, error);
      return [];
    }
  }

  /**
   * Post a discussion thread for a collection
   */
  static async addCollectionDiscussion(collectionId: string, dto: CreateCollectionDiscussionDto): Promise<{ success: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/discussions`, dto);
    return unwrapJsonApiResponse<{ success: boolean }>(response.data);
  }

  /**
   * Fetch collection live activities
   */
  static async getCollectionActivities(collectionId: string): Promise<Array<{ user: string; action: string; time: string }>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/collections/${collectionId}/activities`);
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && Array.isArray(data.activities)) {
        return data.activities as Array<{ user: string; action: string; time: string }>;
      }
      return [];
    } catch (error) {
      console.warn(`CertificationApi.getCollectionActivities(${collectionId}) fallback`, error);
      return [];
    }
  }

  /**
   * Fetch personalized study plan
   */
  static async getStudyPlan(): Promise<StudyPlanDay[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/study-plan');
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && Array.isArray(data.tasks)) {
        return data.tasks as StudyPlanDay[];
      }
      if (Array.isArray(data)) {
        return data as unknown as StudyPlanDay[];
      }
      return STUDY_PLAN_DAYS;
    } catch (error) {
      console.warn('CertificationApi.getStudyPlan fallback', error);
      return STUDY_PLAN_DAYS;
    }
  }

  /**
   * Fetch top community contributors
   */
  static async getTopContributors(): Promise<Contributor[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/contributors/top');
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && Array.isArray(data.contributors)) {
        return data.contributors as Contributor[];
      }
      if (Array.isArray(data)) {
        return data as unknown as Contributor[];
      }
      return TOP_CONTRIBUTORS;
    } catch (error) {
      console.warn('CertificationApi.getTopContributors fallback', error);
      return TOP_CONTRIBUTORS;
    }
  }

  /**
   * Fetch full exam details by ID
   */
  static async getExam(id: string): Promise<Exam | null> {
    if (!id) return null;
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/exams/${id}`);
      const data = unwrapJsonApiResponse<Exam>(response.data);
      if (data && data.title) {
        return data;
      }
      return this.findFallbackExam(id);
    } catch (error) {
      console.warn(`CertificationApi.getExam(${id}) fallback`, error);
      return this.findFallbackExam(id);
    }
  }

  /**
   * Start a new exam session when user clicks "Start Exam"
   */
  static async startExamSession(examId: string): Promise<ExamSession> {
    const client = await getAxiosInstance();
    const response = await client.post('/certification/sessions/start', { examId });
    return unwrapJsonApiResponse<ExamSession>(response.data);
  }

  /**
   * Get active exam session state
   */
  static async getExamSession(sessionId: string): Promise<ExamSession | null> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/sessions/${sessionId}`);
      return unwrapJsonApiResponse<ExamSession>(response.data);
    } catch (error) {
      console.warn(`CertificationApi.getExamSession(${sessionId}) fallback`, error);
      return null;
    }
  }

  /**
   * Save or update an answer in real-time as user chooses answers
   */
  static async saveSessionAnswer(sessionId: string, dto: SaveSessionAnswerDto): Promise<SessionAnswer> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/sessions/${sessionId}/answers`, dto);
    return unwrapJsonApiResponse<SessionAnswer>(response.data);
  }

  /**
   * Record a rule violation (tab-switching) during exam session
   */
  static async recordSessionViolation(sessionId: string, dto: RecordSessionViolationDto): Promise<SessionViolation> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/sessions/${sessionId}/violations`, dto);
    return unwrapJsonApiResponse<SessionViolation>(response.data);
  }

  /**
   * Submit exam session and fetch AI evaluation scorecard
   */
  static async submitExamSession(sessionId: string): Promise<ExamResult> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/sessions/${sessionId}/submit`);
    return unwrapJsonApiResponse<ExamResult>(response.data);
  }

  /**
   * Fetch completed exam result scorecard
   */
  static async getExamResult(resultId: string): Promise<ExamResult | null> {
    if (!resultId) return null;
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/results/${resultId}`);
      return unwrapJsonApiResponse<ExamResult>(response.data);
    } catch (error) {
      console.warn(`CertificationApi.getExamResult(${resultId}) fallback`, error);
      return null;
    }
  }

  /**
   * Save/Bookmark a collection
   */
  static async saveCollection(collectionId: string): Promise<{ saved: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/save`);
    const data = unwrapJsonApiResponse<{ success?: boolean; saved?: boolean }>(response.data);
    return { saved: Boolean(data?.saved ?? data?.success ?? true) };
  }

  /**
   * Fetch user's saved/bookmarked collections
   */
  static async getSavedCollections(): Promise<ExamCollection[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/collections/saved');
      const items = unwrapJsonApiResponse<ExamCollection[]>(response.data);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return [];
    } catch (error) {
      console.warn('CertificationApi.getSavedCollections fallback', error);
      return [];
    }
  }

  /**
   * Clone a collection into personal library
   */
  static async cloneCollection(collectionId: string): Promise<{ cloned: boolean; newCollectionId: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/clone`);
    const data = unwrapJsonApiResponse<{ newCollectionId?: string; id?: string; cloned?: boolean }>(response.data);
    return {
      cloned: Boolean(data?.cloned ?? true),
      newCollectionId: String(data?.newCollectionId || data?.id || collectionId)
    };
  }

  /**
   * Report a collection for review
   */
  static async reportCollection(collectionId: string, reason = 'Inappropriate content'): Promise<{ reported: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/report`, { reason: reason || 'Inappropriate content' });
    const data = unwrapJsonApiResponse<{ reported?: boolean; success?: boolean }>(response.data);
    return { reported: Boolean(data?.reported ?? data?.success ?? true) };
  }

  /**
   * Fetch practice history
   */
  static async getPracticeHistory(): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/history');
      return unwrapJsonApiResponse<Record<string, unknown>>(response.data) || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch completed collections
   */
  static async getCompletedCollections(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/collections/completed', { params });
      return unwrapJsonApiResponse<Record<string, unknown>>(response.data) || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch favorites
   */
  static async getFavorites(): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/favorites');
      return unwrapJsonApiResponse<Record<string, unknown>>(response.data) || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch bookmarks
   */
  static async getBookmarks(params?: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/bookmarks', { params });
      return unwrapJsonApiResponse<Record<string, unknown>>(response.data) || {};
    } catch {
      return {};
    }
  }

  /**
   * Add a new item to bookmarks
   */
  static async addBookmark(dto: { itemId: string; itemType?: string; title?: string; folderName?: string }): Promise<{ success: boolean; bookmarkId: string }> {
    try {
      const client = await getAxiosInstance();
      const response = await client.post('/certification/bookmarks', dto);
      const data = unwrapJsonApiResponse<{ success?: boolean; id?: string; bookmarkId?: string }>(response.data);
      return {
        success: Boolean(data?.success ?? true),
        bookmarkId: String(data?.bookmarkId || data?.id || dto.itemId),
      };
    } catch {
      return { success: true, bookmarkId: dto.itemId };
    }
  }

  /**
   * Remove bookmark item by ID
   */
  static async removeBookmark(id: string): Promise<boolean> {
    try {
      const client = await getAxiosInstance();
      await client.delete(`/certification/bookmarks/${id}`);
      return true;
    } catch {
      return true; // Optimistic fallback
    }
  }

  /**
   * Fetch downloads
   */
  static async getDownloads(): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/downloads');
      return unwrapJsonApiResponse<Record<string, unknown>>(response.data) || {};
    } catch {
      return {};
    }
  }

  /**
   * Fetch purchased collections
   */
  static async getPurchasedCollections(): Promise<Record<string, unknown>> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/collections/purchased');
      return unwrapJsonApiResponse<Record<string, unknown>>(response.data) || {};
    } catch {
      return {};
    }
  }

  /**
   * Remove favorite item
   */
  static async removeFavorite(id: string): Promise<boolean> {
    try {
      const client = await getAxiosInstance();
      await client.delete(`/certification/favorites/${id}`);
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Delete download item
   */
  static async deleteDownload(id: string): Promise<boolean> {
    try {
      const client = await getAxiosInstance();
      await client.delete(`/certification/downloads/${id}`);
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Clear all downloads
   */
  static async clearDownloads(): Promise<boolean> {
    try {
      const client = await getAxiosInstance();
      await client.delete('/certification/downloads');
      return true;
    } catch {
      return true;
    }
  }

  /**
   * Fetch user official certificates
   */
  static async getCertificates(): Promise<CertificateItem[]> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get('/certification/certificates');
      const items = unwrapJsonApiResponse<CertificateItem[]>(response.data);
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Download / Generate certificate PDF
   */
  static async downloadCertificate(certificateId: string): Promise<{ success: boolean; url: string }> {
    try {
      const client = await getAxiosInstance();
      const response = await client.get(`/certification/certificates/${certificateId}/download`);
      const data = unwrapJsonApiResponse<{ success?: boolean; url?: string }>(response.data);
      return { success: true, url: data?.url || '#' };
    } catch {
      return { success: true, url: '#' };
    }
  }
}

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
  CreateCollectionDiscussionDto
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
      const data = unwrapJsonApiResponse<Record<string, unknown>>(response.data);
      if (data && typeof data === 'object') {
        return {
          scorePrediction: data.scorePrediction ? String(data.scorePrediction) : undefined,
          scoreRange: data.scoreRange ? String(data.scoreRange) : undefined,
          accuracy: data.accuracy ? String(data.accuracy) : undefined,
          timeSpent: data.timeSpent ? String(data.timeSpent) : undefined,
          completedMocks: data.completedMocks ? String(data.completedMocks) : '0',
          targetExam: data.targetExam ? String(data.targetExam) : undefined,
          targetScore: data.targetScore ? String(data.targetScore) : undefined,
          daysRemaining: data.daysRemaining ? Number(data.daysRemaining) : undefined,
        };
      }
      return DEFAULT_DASHBOARD_STATS;
    } catch (error) {
      console.warn('CertificationApi.getDashboardStats fallback to local default data', error);
      return DEFAULT_DASHBOARD_STATS;
    }
  }

  /**
   * Fetch featured exam collections filtered by exam type or search keyword
   */
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
}

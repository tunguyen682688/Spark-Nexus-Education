import type { 
  GrammarRoadmapResponse, 
  SaveGrammarLessonDto, 
  GrammarLessonDetailResponse,
  GrammarExamSet,
  CommunityGrammarCertificate,
  SaveGrammarTrapDto,
  UserGrammarTrap,
  GrammarAnalyticsResponse,
  PracticeQuestion,
  CommunityPost,
  CrowdsourcedQuiz,
  ExamQuestion
} from '../types';

// Helper to get Axios Client instance dynamically
const getAxiosInstance = async () => {
  const { getAxiosClient } = await import('@spark-nest-ed/frontend-core-api');
  return getAxiosClient();
};

export const grammarApi = {
  async getRoadmap(): Promise<GrammarRoadmapResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<GrammarRoadmapResponse>('/grammar/roadmap');
    return response.data;
  },

  async getLessonDetail(id: string): Promise<GrammarLessonDetailResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<any>(`/grammar/lessons/${id}`);
    
    // Add default values for compatibility with frontend models if properties are missing
    return {
      ...response.data,
      theory: response.data.theory || '',
      formula: response.data.formula || [],
    };
  },

  async createLesson(payload: SaveGrammarLessonDto): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post('/grammar/lessons', payload);
    return { success: true, data: response.data };
  },

  async updateLesson(id: string, payload: SaveGrammarLessonDto): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.put(`/grammar/lessons/${id}`, payload);
    return { success: true, data: response.data };
  },

  async completeLesson(id: string): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post(`/grammar/lessons/${id}/complete`);
    return { success: true, data: response.data };
  },

  async updateProgress(
    id: string,
    payload: { status?: string; proficiency?: number; quickNotes?: string }
  ): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.put(`/grammar/lessons/${id}/progress`, payload);
    return { success: true, data: response.data };
  },

  async getDailyQuiz(): Promise<ExamQuestion[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ExamQuestion[]>('/grammar/daily-quiz');
    return response.data;
  },

  async submitDailyQuiz(score: number, xpEarned: number): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post('/grammar/daily-quiz/submit', { score, xpEarned });
    return { success: true, data: response.data };
  },

  async getPracticeQuestions(filters: { level?: string; category?: string; type?: string }): Promise<PracticeQuestion[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<PracticeQuestion[]>('/grammar/practice/questions', { params: filters });
    return response.data;
  },

  async submitGraduation(level: string, percentage: number): Promise<{ success: boolean; isPassed: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/graduation/${level}/submit`, { percentage });
    return {
      success: response.data.success,
      isPassed: response.data.isPassed,
      data: response.data.data,
    };
  },

  async getLeaderboard(timeframe?: string): Promise<Array<{ id: string; name: string; xp: number; avatar: string; rank: number; isCurrentUser?: boolean }>> {
    const axios = await getAxiosInstance();
    const response = await axios.get<any[]>('/grammar/leaderboard', { params: { timeframe } });
    return response.data;
  },

  async getCommunityPosts(tag?: string, search?: string): Promise<CommunityPost[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<CommunityPost[]>('/grammar/community/posts', { params: { tag, search } });
    return response.data;
  },

  async createCommunityPost(payload: {
    title: string;
    content: string;
    tags: string[];
    hasQuiz?: boolean;
    quizType?: CommunityPost['quizType'];
    quizData?: CommunityPost['quizData'];
  }): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post('/grammar/community/posts', payload);
    return { success: true, data: response.data };
  },

  async addCommunityComment(postId: string, content: string): Promise<{ success: boolean; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post(`/grammar/community/posts/${postId}/comments`, { content });
    return { success: true, data: response.data };
  },

  async likeCommunityPost(postId: string): Promise<{ success: boolean; likesCount: number }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/community/posts/${postId}/like`);
    return {
      success: response.data.success,
      likesCount: response.data.likesCount,
    };
  },

  async submitCrowdsourcedQuiz(
    lessonId: string,
    payload: { questionType: CrowdsourcedQuiz['questionType']; questionData: CrowdsourcedQuiz['questionData']; explanation: string }
  ): Promise<{ success: boolean; status: string; message: string; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/lessons/${lessonId}/crowdsourced`, payload);
    return {
      success: response.data.success,
      status: response.data.status,
      message: response.data.message,
      data: response.data.data,
    };
  },

  async upvoteCrowdsourcedQuiz(quizId: string): Promise<{ success: boolean; upvotes: number; status: string }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/quizzes/crowdsourced/${quizId}/upvote`);
    return {
      success: response.data.success,
      upvotes: response.data.upvotes,
      status: response.data.status,
    };
  },

  async getCrowdsourcedQuizzes(lessonId: string): Promise<CrowdsourcedQuiz[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<CrowdsourcedQuiz[]>(`/grammar/lessons/${lessonId}/crowdsourced`);
    return response.data;
  },

  async getSrsDueQuizzes(): Promise<ExamQuestion[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ExamQuestion[]>('/grammar/practice/srs');
    return response.data;
  },

  async submitSrsFeedback(quizId: string, isCorrect: boolean): Promise<{ success: boolean; nextReviewDate: string; intervalDays: number; data: unknown }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/practice/srs/${quizId}/submit`, { isCorrect });
    return {
      success: response.data.success,
      nextReviewDate: response.data.nextReviewDate,
      intervalDays: response.data.intervalDays,
      data: response.data.data,
    };
  },

  async getExamSets(level?: string, examType?: string, search?: string): Promise<GrammarExamSet[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<GrammarExamSet[]>('/grammar/exams', { params: { level, examType, search } });
    return response.data;
  },

  async createExamSet(payload: {
    title: string;
    description: string;
    level: string;
    examType: GrammarExamSet['examType'];
    examMetadata?: Record<string, unknown>;
    timeLimit: number;
    questions: ExamQuestion[];
  }): Promise<GrammarExamSet> {
    const axios = await getAxiosInstance();
    const response = await axios.post<GrammarExamSet>('/grammar/exams', payload);
    return response.data;
  },

  async upvoteExamSet(id: string): Promise<{ success: boolean; upvotes: number }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/exams/${id}/upvote`);
    return {
      success: response.data.success,
      upvotes: response.data.upvotes,
    };
  },

  async submitExamAttempt(
    id: string,
    payload: { correctCount: number; totalCount: number }
  ): Promise<{
    success: boolean;
    proficiency: number;
    isPassed: boolean;
    xpEarned: number;
    newCertificateIssued: boolean;
    certificate: CommunityGrammarCertificate | null;
  }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/exams/${id}/submit`, payload);
    return {
      success: response.data.success,
      proficiency: response.data.proficiency,
      isPassed: response.data.isPassed,
      xpEarned: response.data.xpEarned,
      newCertificateIssued: response.data.newCertificateIssued,
      certificate: response.data.certificate,
    };
  },

  async getUserCertificates(): Promise<CommunityGrammarCertificate[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<CommunityGrammarCertificate[]>('/grammar/exams/certificates');
    return response.data;
  },

  async saveGrammarTrap(payload: SaveGrammarTrapDto): Promise<{ success: boolean; data: UserGrammarTrap }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>('/grammar/trap-diary', payload);
    return {
      success: response.data.success,
      data: response.data.data,
    };
  },

  async getGrammarTraps(status?: string): Promise<UserGrammarTrap[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<UserGrammarTrap[]>('/grammar/trap-diary', { params: { status } });
    return response.data;
  },

  async breakGrammarTrap(id: string): Promise<{ success: boolean; xpEarned: number; data: UserGrammarTrap | undefined }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/trap-diary/${id}/break`);
    return {
      success: response.data.success,
      xpEarned: response.data.xpEarned,
      data: response.data.data,
    };
  },

  async generateAiTrapAnalysis(id: string): Promise<{ success: boolean; aiAnalysis: string; data: UserGrammarTrap | null }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<any>(`/grammar/trap-diary/${id}/ai-analysis`);
    return {
      success: response.data.success,
      aiAnalysis: response.data.aiAnalysis,
      data: response.data.data,
    };
  },

  async getAnalyticsSummary(): Promise<GrammarAnalyticsResponse> {
    const axios = await getAxiosInstance();
    const response = await axios.get<GrammarAnalyticsResponse>('/grammar/analytics');
    return response.data;
  },
};

import type {
  Exam,
  ExamBuilderResponse,
  SectionQuestionsResponse,
  SaveQuestionDto,
  SaveQuestionResult,
  QuestionBuilderData,
  QuestionVersion,
} from '../types';
import { getAxiosInstance, unwrapJsonApiResponse, unwrapPaginatedJsonApiResponse } from './api-helpers';

export class ExamApi {
  static async getExam(id: string): Promise<Exam | null> {
    if (!id) return null;
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${id}`);
    return unwrapJsonApiResponse<Exam>(response.data);
  }

  static async getExamBuilderData(id: string): Promise<ExamBuilderResponse | null> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${id}/builder`);
    return unwrapJsonApiResponse<ExamBuilderResponse>(response.data);
  }

  static async getSectionQuestions(
    examId: string,
    sectionId: string,
    page = 1,
    pageSize = 10,
    search?: string
  ): Promise<SectionQuestionsResponse | null> {
    const client = await getAxiosInstance();
    const params: Record<string, string | number> = { page, pageSize };
    if (search) params.search = search;
    const response = await client.get(`/certification/exams/${examId}/sections/${sectionId}/questions`, { params });
    const paginated = unwrapPaginatedJsonApiResponse<{
      examQuestionId: string;
      id: string;
      number: number;
      title: string;
      partTag: string;
      type: string;
      difficulty: string;
      points: number;
      imageUrl: string | null;
      audioUrl: string | null;
      partNumber: number | null;
      passageId: string | null;
      modelAnswer: string | null;
      formatMetadata: unknown | null;
    }>(response.data);
    return {
      questions: paginated.data,
      totalCount: paginated.meta.total,
      page: paginated.meta.page,
      pageSize: paginated.meta.limit,
      totalPages: paginated.meta.totalPages,
    };
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
    const unwrapped = unwrapJsonApiResponse<{ versions?: QuestionVersion[] }>(response.data);
    return unwrapped?.versions ?? [];
  }

  static async createExam(collectionId: string, dto: { title: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; examType?: string; certificationType?: string; chapterId?: string; sections?: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number }> }): Promise<{ id: string; title: string; collectionId: string; examType?: string; certificationType?: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/exams`, dto);
    return unwrapJsonApiResponse<{ id: string; title: string; collectionId: string }>(response.data);
  }

  static async updateExam(examId: string, dto: { title?: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; publishStatus?: string; examType?: string; certificationType?: string }): Promise<{ id: string }> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/exams/${examId}`, dto);
    return unwrapJsonApiResponse<{ id: string }>(response.data);
  }

  static async deleteExam(examId: string): Promise<{ deleted: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.delete(`/certification/exams/${examId}`);
    return unwrapJsonApiResponse<{ deleted: boolean }>(response.data);
  }

  static async saveExamSections(examId: string, sections: Array<{ id?: string; title: string; sectionType?: string; instruction?: string | null; order: number; durationMinutes?: number }>): Promise<Array<{ id: string }>> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/exams/${examId}/sections`, { sections });
    return unwrapJsonApiResponse<Array<{ id: string }>>(response.data);
  }

  static async linkQuestionToExam(dto: {
    examId: string;
    questionId: string;
    order?: number;
    points?: number;
    sectionId?: string;
    audioUrl?: string;
    imageUrl?: string;
    partNumber?: number;
    gapNumber?: number;
    writingTaskType?: string;
    speakingPrompt?: string;
    isGridIn?: boolean;
    formatMetadata?: unknown;
  }): Promise<{ examQuestionId: string }> {
    const client = await getAxiosInstance();
    const response = await client.post('/certification/exams/link-question', dto);
    return unwrapJsonApiResponse<{ examQuestionId: string }>(response.data);
  }

  static async unlinkQuestionFromExam(examId: string, questionId: string): Promise<void> {
    const client = await getAxiosInstance();
    await client.delete(`/certification/exams/${examId}/questions/${questionId}`);
  }
}

import type {
  Exam,
  ExamBuilderResponse,
} from '../types';
import { getAxiosInstance, unwrapJsonApiResponse } from './api-helpers';

export class ExamApi {
  static async getExam(id: string): Promise<Exam | null> {
    if (!id) return null;
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${id}`);
    return unwrapJsonApiResponse<Exam>(response.data);
  }

  static async getExamBuilderData(id: string): Promise<ExamBuilderResponse> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${id}/builder`);
    const data = unwrapJsonApiResponse<ExamBuilderResponse>(response.data);
    if (!data) {
      throw new Error('Exam not found');
    }
    return data;
  }

  static async createExam(collectionId: string, dto: { title: string; description?: string | null; duration?: number; totalQuestions?: number; maxScore?: number; passScore?: number; examType?: string; certificationType?: string; chapterId?: string; sections?: Array<{ title: string; sectionType: string; instruction?: string; durationMinutes?: number; questionCount?: number }> }): Promise<{ id: string; title: string; collectionId: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/collections/${collectionId}/exams`, dto);
    return unwrapJsonApiResponse<{ id: string; title: string; collectionId: string }>(response.data);
  }

  static async initializeExamQuestions(examId: string, certificationType: string): Promise<{ examId: string; sectionsCreated: number; questionsCreated: number }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/exams/${examId}/initialize-questions`, { certificationType });
    return unwrapJsonApiResponse<{ examId: string; sectionsCreated: number; questionsCreated: number }>(response.data);
  }

  static async getExamInitializationStatus(examId: string): Promise<{
    id: string;
    initializationStatus: string;
    progress: {
      questionsCreated: number;
      totalQuestions: number;
      percentage: number;
      currentSection: string;
      status: string;
    } | null;
  }> {
    const client = await getAxiosInstance();
    const response = await client.get(`/certification/exams/${examId}/initialization-status`);
    return unwrapJsonApiResponse(response.data);
  }

  static async retryExamInitialization(examId: string): Promise<{ id: string; status: string; message: string }> {
    const client = await getAxiosInstance();
    const response = await client.post(`/certification/exams/${examId}/retry-initialization`);
    return unwrapJsonApiResponse<{ id: string; status: string; message: string }>(response.data);
  }

  static async deleteExam(examId: string): Promise<{ deleted: boolean }> {
    const client = await getAxiosInstance();
    const response = await client.delete(`/certification/exams/${examId}`);
    return unwrapJsonApiResponse<{ deleted: boolean }>(response.data);
  }

  static async getSectionQuestions(
    examId: string,
    sectionId: string,
    params?: { page?: number; pageSize?: number; search?: string },
  ): Promise<{
    questions: Array<{
      id: string;
      examQuestionId: string;
      number: number;
      title: string;
      partTag: string;
      type: string;
      difficulty: string;
      points: number;
      imageUrl: string | null;
      audioUrl: string | null;
      passageId: string | null;
      passageText: string | null;
      modelAnswer: string | null;
      explanation: string | null;
      estimatedTime: number | null;
      metadataPoints: number | null;
      partNumber: number | null;
      passageGroupId: string | null;
      passageType: string | null;
      passageTitle: string | null;
      blankNumber: number | null;
      subQuestionNumber: number | null;
      formatMetadata: unknown | null;
    }>;
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null> {
    const client = await getAxiosInstance();
    const response = await client.get(
      `/certification/exams/${examId}/sections/${sectionId}/questions`,
      { params },
    );
    return unwrapJsonApiResponse<{
      questions: Array<{
        id: string;
        examQuestionId: string;
        number: number;
        title: string;
        partTag: string;
        type: string;
        difficulty: string;
        points: number;
        imageUrl: string | null;
        audioUrl: string | null;
        passageId: string | null;
        passageText: string | null;
        modelAnswer: string | null;
        explanation: string | null;
        estimatedTime: number | null;
        metadataPoints: number | null;
        partNumber: number | null;
        passageGroupId: string | null;
        passageType: string | null;
        passageTitle: string | null;
        blankNumber: number | null;
        subQuestionNumber: number | null;
        formatMetadata: unknown | null;
      }>;
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(response.data);
  }

  static async saveExamContent(examId: string, dto: {
    title?: string;
    description?: string;
    level?: string;
    duration?: number;
    passScore?: number;
    maxScore?: number;
    examType?: string;
    certificationType?: string;
    publishStatus?: string;
    sections: Array<{
      id?: string;
      title: string;
      subtitle?: string;
      sectionType: string;
      instruction?: string;
      order: number;
      durationMinutes?: number;
      isBreak?: boolean;
      audioUrl?: string;
      scriptText?: string;
      passageText?: string;
      passageTitle?: string;
      passageType?: string;
      questions: Array<{
        id?: string;
        questionType: string;
        questionText: string;
        difficulty: string;
        options: Array<{ id?: string; label: string; text: string; isCorrect: boolean }>;
        modelAnswer?: string;
        rubric?: unknown;
        explanation?: string;
        points: number;
        estimatedTime?: number;
        audioUrl?: string;
        imageUrl?: string;
        passageGroupId?: string;
        passageText?: string;
        passageType?: string;
        passageTitle?: string;
        blankNumber?: number;
        subQuestionNumber?: number;
        formatMetadata?: Record<string, unknown>;
      }>;
    }>;
  }): Promise<{ examId: string; sectionsCreated: number; questionsCreated: number }> {
    const client = await getAxiosInstance();
    const response = await client.put(`/certification/exams/${examId}/content`, dto);
    return unwrapJsonApiResponse<{ examId: string; sectionsCreated: number; questionsCreated: number }>(response.data);
  }

  static async patchExamContent(examId: string, dto: {
    examSettings?: {
      title?: string;
      description?: string;
      level?: string;
      duration?: number;
      passScore?: number;
      maxScore?: number;
      examType?: string;
      certificationType?: string;
    };
    sections?: Array<{
      id?: string;
      title?: string;
      subtitle?: string;
      sectionType?: string;
      instruction?: string;
      order?: number;
      durationMinutes?: number;
      isBreak?: boolean;
      audioUrl?: string;
      scriptText?: string;
      passageText?: string;
      passageTitle?: string;
      passageType?: string;
      questions: Array<{
        id?: string;
        questionType: string;
        questionText: string;
        difficulty: string;
        options: Array<{ id?: string; label: string; text: string; isCorrect: boolean }>;
        modelAnswer?: string;
        rubric?: unknown;
        explanation?: string;
        points: number;
        estimatedTime?: number;
        audioUrl?: string;
        imageUrl?: string;
        passageGroupId?: string;
        passageText?: string;
        passageType?: string;
        passageTitle?: string;
        blankNumber?: number;
        subQuestionNumber?: number;
        formatMetadata?: Record<string, unknown>;
      }>;
    }>;
    removedQuestionIds?: string[];
    sectionMetadata?: Array<{
      id: string;
      title?: string;
      subtitle?: string;
      instruction?: string;
      order?: number;
      durationMinutes?: number;
    }>;
  }): Promise<{ examId: string; sectionsUpdated: number; questionsUpdated: number; tempIdMap?: Record<string, string> }> {
    const client = await getAxiosInstance();
    const response = await client.patch(`/certification/exams/${examId}/content`, dto);
    return unwrapJsonApiResponse<{ examId: string; sectionsUpdated: number; questionsUpdated: number; tempIdMap?: Record<string, string> }>(response.data);
  }
}

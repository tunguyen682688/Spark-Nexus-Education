import type {
  ExamSession,
  SessionAnswer,
  SessionViolation,
  ExamResult,
  SaveSessionAnswerDto,
  RecordSessionViolationDto,
} from '../types';
import { getAxiosInstance, unwrapJsonApiResponse } from './api-helpers';

export class SessionApi {
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

  static async getInProgressSessions(): Promise<{ id: string; userId: string; totalInProgress: number; items: Array<{ id: string; examId: string; title: string; status: string; startedAt: string; timeAgo: string; examTitle: string; totalQuestions: number }> }> {
    const client = await getAxiosInstance();
    const response = await client.get('/certification/sessions/in-progress');
    return unwrapJsonApiResponse(response.data) || { id: '', userId: '', totalInProgress: 0, items: [] };
  }
}

import type {
  GrammarExamSet,
  ExamQuestion,
  CommunityGrammarCertificate,
} from '../types';

import type { ResourceResponse, ResourceListResponse } from './api-helpers';
import { getAxiosInstance, extractResource, extractCollection } from './api-helpers';

const ENDPOINTS = {
  exams: '/grammar/exams',
  upvoteExam: (id: string) => `/grammar/exams/${id}/upvote`,
  submitExam: (id: string) => `/grammar/exams/${id}/submit`,
  certificates: '/grammar/exams/certificates',
} as const;

export const grammarExamsApi = {
  async getExamSets(level?: string, examType?: string, search?: string): Promise<GrammarExamSet[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<GrammarExamSet>>(ENDPOINTS.exams, { params: { level, examType, search } });
    return extractCollection<GrammarExamSet>(response.data);
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
    const response = await axios.post<ResourceResponse<GrammarExamSet>>(ENDPOINTS.exams, payload);
    return extractResource<GrammarExamSet>(response.data);
  },

  async upvoteExamSet(id: string): Promise<{ success: boolean; upvotes: number }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; upvotes: number }>>(ENDPOINTS.upvoteExam(id));
    const attributes = extractResource<{ success: boolean; upvotes: number }>(response.data);
    return {
      success: attributes.success,
      upvotes: attributes.upvotes,
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
    const response = await axios.post<ResourceResponse<{
      success: boolean;
      proficiency: number;
      isPassed: boolean;
      xpEarned: number;
      newCertificateIssued: boolean;
      certificate: CommunityGrammarCertificate | null;
    }>>(ENDPOINTS.submitExam(id), payload);
    const attributes = extractResource<{
      success: boolean;
      proficiency: number;
      isPassed: boolean;
      xpEarned: number;
      newCertificateIssued: boolean;
      certificate: CommunityGrammarCertificate | null;
    }>(response.data);
    return {
      success: attributes.success,
      proficiency: attributes.proficiency,
      isPassed: attributes.isPassed,
      xpEarned: attributes.xpEarned,
      newCertificateIssued: attributes.newCertificateIssued,
      certificate: attributes.certificate,
    };
  },

  async getUserCertificates(): Promise<CommunityGrammarCertificate[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<CommunityGrammarCertificate>>(ENDPOINTS.certificates);
    return extractCollection<CommunityGrammarCertificate>(response.data);
  },
};

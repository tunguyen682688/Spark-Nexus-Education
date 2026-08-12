import type {
  CommunityPost,
  CrowdsourcedQuiz,
  CommunityComment,
} from '../types';

import type { ResourceResponse, ResourceListResponse } from './api-helpers';
import { getAxiosInstance, extractResource, extractCollection } from './api-helpers';

const ENDPOINTS = {
  communityPosts: '/grammar/community/posts',
  communityComments: (postId: string) => `/grammar/community/posts/${postId}/comments`,
  likeCommunityPost: (postId: string) => `/grammar/community/posts/${postId}/like`,
  crowdsourcedQuizzes: (lessonId: string) => `/grammar/lessons/${lessonId}/crowdsourced`,
  upvoteCrowdsourced: (quizId: string) => `/grammar/quizzes/crowdsourced/${quizId}/upvote`,
} as const;

export const grammarCommunityApi = {
  async getCommunityPosts(tag?: string, search?: string): Promise<CommunityPost[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<CommunityPost>>(ENDPOINTS.communityPosts, { params: { tag, search } });
    return extractCollection<CommunityPost>(response.data);
  },

  async createCommunityPost(payload: {
    title: string;
    content: string;
    tags: string[];
    hasQuiz?: boolean;
    quizType?: CommunityPost['quizType'];
    quizData?: CommunityPost['quizData'];
  }): Promise<{ success: boolean; data: CommunityPost }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<CommunityPost>>(ENDPOINTS.communityPosts, payload);
    return { success: true, data: extractResource<CommunityPost>(response.data) };
  },

  async addCommunityComment(postId: string, content: string): Promise<{ success: boolean; data: CommunityComment }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<CommunityComment>>(ENDPOINTS.communityComments(postId), { content });
    return { success: true, data: extractResource<CommunityComment>(response.data) };
  },

  async likeCommunityPost(postId: string): Promise<{ success: boolean; likesCount: number }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; likesCount: number }>>(ENDPOINTS.likeCommunityPost(postId));
    const attributes = extractResource<{ success: boolean; likesCount: number }>(response.data);
    return {
      success: attributes.success,
      likesCount: attributes.likesCount,
    };
  },

  async submitCrowdsourcedQuiz(
    lessonId: string,
    payload: { questionType: CrowdsourcedQuiz['questionType']; questionData: CrowdsourcedQuiz['questionData']; explanation: string }
  ): Promise<{ success: boolean; status: string; message: string; data: CrowdsourcedQuiz }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; status: string; message: string; data: CrowdsourcedQuiz }>>(ENDPOINTS.crowdsourcedQuizzes(lessonId), payload);
    const attributes = extractResource<{ success: boolean; status: string; message: string; data: CrowdsourcedQuiz }>(response.data);
    return {
      success: attributes.success,
      status: attributes.status,
      message: attributes.message,
      data: attributes.data,
    };
  },

  async upvoteCrowdsourcedQuiz(quizId: string): Promise<{ success: boolean; upvotes: number; status: string }> {
    const axios = await getAxiosInstance();
    const response = await axios.post<ResourceResponse<{ success: boolean; upvotes: number; status: string }>>(ENDPOINTS.upvoteCrowdsourced(quizId));
    const attributes = extractResource<{ success: boolean; upvotes: number; status: string }>(response.data);
    return {
      success: attributes.success,
      upvotes: attributes.upvotes,
      status: attributes.status,
    };
  },

  async getCrowdsourcedQuizzes(lessonId: string): Promise<CrowdsourcedQuiz[]> {
    const axios = await getAxiosInstance();
    const response = await axios.get<ResourceListResponse<CrowdsourcedQuiz>>(ENDPOINTS.crowdsourcedQuizzes(lessonId));
    return extractCollection<CrowdsourcedQuiz>(response.data);
  },
};

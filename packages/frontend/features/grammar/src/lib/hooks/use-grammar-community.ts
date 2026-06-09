import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { grammarApi } from '../api/grammar-api';
import { grammarKeys } from './grammar-keys';
import type { CommunityPost, CrowdsourcedQuiz } from '../types';

export function useGrammarCommunityPosts(tag?: string, search?: string) {
  return useQuery({
    queryKey: [...grammarKeys.root, 'community-posts', { tag, search }] as const,
    queryFn: () => grammarApi.getCommunityPosts(tag, search),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; content: string; tags: string[]; hasQuiz?: boolean; quizType?: CommunityPost['quizType']; quizData?: CommunityPost['quizData'] }) =>
      grammarApi.createCommunityPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'community-posts'] });
    }
  });
}

export function useAddCommunityComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      grammarApi.addCommunityComment(postId, content),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'community-posts'] });
    }
  });
}

export function useLikeCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => grammarApi.likeCommunityPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'community-posts'] });
    }
  });
}

export function useSubmitCrowdsourcedQuiz() {
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: { questionType: CrowdsourcedQuiz['questionType']; questionData: CrowdsourcedQuiz['questionData']; explanation: string } }) =>
      grammarApi.submitCrowdsourcedQuiz(lessonId, payload),
  });
}

export function useUpvoteCrowdsourcedQuiz(lessonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (quizId: string) => grammarApi.upvoteCrowdsourcedQuiz(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...grammarKeys.root, 'crowdsourced-quizzes', lessonId] });
    }
  });
}

export function useCrowdsourcedQuizzes(lessonId: string) {
  return useQuery({
    queryKey: [...grammarKeys.root, 'crowdsourced-quizzes', lessonId] as const,
    queryFn: () => grammarApi.getCrowdsourcedQuizzes(lessonId),
    enabled: Boolean(lessonId),
  });
}

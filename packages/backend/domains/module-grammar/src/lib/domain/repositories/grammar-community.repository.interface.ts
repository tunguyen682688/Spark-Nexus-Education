import { GrammarCommunityPostEntity } from '../entities/grammar-community-post.entity';
import { GrammarCrowdsourcedQuizEntity } from '../entities/grammar-crowdsourced-quiz.entity';
import { GrammarCommunityCommentEntity } from '../entities/grammar-community-comment.entity';

export interface IGrammarCommunityRepository {
  findPosts(tag?: string, search?: string): Promise<GrammarCommunityPostEntity[]>;
  createPost(
    userId: string,
    data: {
      title: string;
      content: string;
      tags: string[];
      hasQuiz?: boolean;
      quizType?: string;
      quizData?: unknown;
    }
  ): Promise<GrammarCommunityPostEntity>;
  addComment(userId: string, postId: string, content: string): Promise<GrammarCommunityCommentEntity>;
  likePost(postId: string): Promise<number>;
  findCrowdsourcedQuizzes(lessonId: string, status?: string): Promise<GrammarCrowdsourcedQuizEntity[]>;
  findCrowdsourcedQuizById(id: string): Promise<GrammarCrowdsourcedQuizEntity | null>;
  createCrowdsourcedQuiz(
    userId: string,
    lessonId: string,
    data: { questionType: string; questionData: unknown; explanation: string; status: string }
  ): Promise<GrammarCrowdsourcedQuizEntity>;
  upvoteCrowdsourcedQuiz(id: string, upvotes: number, status?: string): Promise<GrammarCrowdsourcedQuizEntity>;
}

export const GRAMMAR_COMMUNITY_REPOSITORY = 'IGrammarCommunityRepository';

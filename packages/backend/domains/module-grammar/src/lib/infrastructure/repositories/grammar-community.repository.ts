import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { IGrammarCommunityRepository } from '../../domain/repositories/grammar-community.repository.interface';
import { GrammarCommunityPostEntity } from '../../domain/entities/grammar-community-post.entity';
import { GrammarCommunityCommentEntity } from '../../domain/entities/grammar-community-comment.entity';
import { GrammarCrowdsourcedQuizEntity } from '../../domain/entities/grammar-crowdsourced-quiz.entity';
import { Prisma } from '@prisma/client';

@Injectable()
export class GrammarCommunityRepository implements IGrammarCommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPosts(tag?: string, search?: string): Promise<GrammarCommunityPostEntity[]> {
    const where: Prisma.GrammarCommunityPostWhereInput = {};
    if (tag) {
      where.tags = { has: tag };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.grammarCommunityPost.findMany({
      where,
      include: {
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => {
      const comments = (record.comments || []).map((c) => new GrammarCommunityCommentEntity({
        id: c.id,
        postId: c.postId,
        userId: c.userId,
        content: c.content,
        createdAt: c.createdAt,
      }));
      return new GrammarCommunityPostEntity({
        id: record.id,
        userId: record.userId,
        title: record.title,
        content: record.content,
        likesCount: record.likesCount,
        tags: record.tags,
        hasQuiz: record.hasQuiz,
        quizType: record.quizType,
        quizData: record.quizData,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        comments,
      });
    });
  }

  async createPost(
    userId: string,
    data: {
      title: string;
      content: string;
      tags: string[];
      hasQuiz?: boolean;
      quizType?: string;
      quizData?: unknown;
    }
  ): Promise<GrammarCommunityPostEntity> {
    const record = await this.prisma.grammarCommunityPost.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        hasQuiz: data.hasQuiz || false,
        quizType: data.quizType || null,
        quizData: data.quizData !== undefined && data.quizData !== null
          ? (data.quizData as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    });

    return new GrammarCommunityPostEntity({
      id: record.id,
      userId: record.userId,
      title: record.title,
      content: record.content,
      likesCount: record.likesCount,
      tags: record.tags,
      hasQuiz: record.hasQuiz,
      quizType: record.quizType,
      quizData: record.quizData,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      comments: [],
    });
  }

  async addComment(userId: string, postId: string, content: string): Promise<GrammarCommunityCommentEntity> {
    const record = await this.prisma.grammarCommunityComment.create({
      data: {
        postId,
        userId,
        content,
      },
    });

    return new GrammarCommunityCommentEntity({
      id: record.id,
      postId: record.postId,
      userId: record.userId,
      content: record.content,
      createdAt: record.createdAt,
    });
  }

  async likePost(postId: string): Promise<number> {
    const post = await this.prisma.grammarCommunityPost.update({
      where: { id: postId },
      data: {
        likesCount: { increment: 1 },
      },
    });
    return post.likesCount;
  }

  async findCrowdsourcedQuizzes(lessonId: string, status?: string): Promise<GrammarCrowdsourcedQuizEntity[]> {
    const where: Prisma.GrammarCrowdsourcedQuizWhereInput = {};
    if (lessonId !== 'ALL') {
      where.lessonId = lessonId;
    }
    if (status) {
      where.status = status;
    }
    const records = await this.prisma.grammarCrowdsourcedQuiz.findMany({
      where,
      orderBy: { upvotes: 'desc' },
    });

    return records.map((r) => new GrammarCrowdsourcedQuizEntity({
      id: r.id,
      lessonId: r.lessonId,
      contributorId: r.contributorId,
      questionType: r.questionType,
      questionData: r.questionData,
      explanation: r.explanation,
      status: r.status,
      upvotes: r.upvotes,
      createdAt: r.createdAt,
    }));
  }

  async findCrowdsourcedQuizById(id: string): Promise<GrammarCrowdsourcedQuizEntity | null> {
    const r = await this.prisma.grammarCrowdsourcedQuiz.findUnique({
      where: { id },
    });
    return r ? new GrammarCrowdsourcedQuizEntity({
      id: r.id,
      lessonId: r.lessonId,
      contributorId: r.contributorId,
      questionType: r.questionType,
      questionData: r.questionData,
      explanation: r.explanation,
      status: r.status,
      upvotes: r.upvotes,
      createdAt: r.createdAt,
    }) : null;
  }

  async createCrowdsourcedQuiz(
    userId: string,
    lessonId: string,
    data: { questionType: string; questionData: unknown; explanation: string; status: string }
  ): Promise<GrammarCrowdsourcedQuizEntity> {
    const r = await this.prisma.grammarCrowdsourcedQuiz.create({
      data: {
        lessonId,
        contributorId: userId,
        questionType: data.questionType,
        questionData: data.questionData as Prisma.InputJsonValue,
        explanation: data.explanation,
        status: data.status,
        upvotes: 0,
      },
    });

    return new GrammarCrowdsourcedQuizEntity({
      id: r.id,
      lessonId: r.lessonId,
      contributorId: r.contributorId,
      questionType: r.questionType,
      questionData: r.questionData,
      explanation: r.explanation,
      status: r.status,
      upvotes: r.upvotes,
      createdAt: r.createdAt,
    });
  }

  async upvoteCrowdsourcedQuiz(id: string, upvotes: number, status?: string): Promise<GrammarCrowdsourcedQuizEntity> {
    const data: Prisma.GrammarCrowdsourcedQuizUpdateInput = { upvotes };
    if (status) {
      data.status = status;
    }
    const r = await this.prisma.grammarCrowdsourcedQuiz.update({
      where: { id },
      data,
    });

    return new GrammarCrowdsourcedQuizEntity({
      id: r.id,
      lessonId: r.lessonId,
      contributorId: r.contributorId,
      questionType: r.questionType,
      questionData: r.questionData,
      explanation: r.explanation,
      status: r.status,
      upvotes: r.upvotes,
      createdAt: r.createdAt,
    });
  }
}

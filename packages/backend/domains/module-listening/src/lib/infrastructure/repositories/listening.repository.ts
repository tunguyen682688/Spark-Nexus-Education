import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import {
  IListeningRepository,
  ListeningMaterialWithProgress,
  ListeningMaterialDetail,
  ListeningLeaderboardEntry,
  UserListeningStatsWithStreak,
} from '../../domain/repositories/listening.repository.interface';
import {
  ListeningMaterial,
  ListeningSubtitle,
  ListeningQuestion,
  Prisma,
} from '@prisma/client';
import { GetListeningMaterialsQueryDto } from '../../application/dtos/get-materials-query.dto';
import { CreateListeningMaterialDto } from '../../application/dtos/create-material.dto';
import { ListeningCacheService } from '../cache/listening-cache.service';

@Injectable()
export class ListeningRepository implements IListeningRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: ListeningCacheService
  ) {}

  async findMaterials(queryParams: GetListeningMaterialsQueryDto, userId?: string) {
    const { category, difficulty, isCommunity, q, page = 1, limit = 20 } = queryParams;
    const skip = (page - 1) * limit;

    const where: Prisma.ListeningMaterialWhereInput = {
      deleted: false,
      isPublished: true,
    };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (isCommunity !== undefined) {
      where.isCommunity = isCommunity;
    }

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
      ];
    }

    const cacheKey = `listening:materials:raw:cat:${category || 'all'}:diff:${difficulty || 'all'}:comm:${isCommunity !== undefined ? isCommunity : 'all'}:q:${q || ''}:p:${page}:l:${limit}`;
    let cached = await this.cacheService.get<{ items: ListeningMaterial[]; total: number }>(cacheKey);

    if (!cached) {
      const [items, total] = await Promise.all([
        this.prisma.listeningMaterial.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.listeningMaterial.count({ where }),
      ]);
      cached = { items, total };
      await this.cacheService.set(cacheKey, cached, 300); // 5 mins TTL
    }

    const { items, total } = cached;

    let resultItems: ListeningMaterialWithProgress[];

    if (userId && items.length > 0) {
      const materialIds = items.map((item) => item.id);
      const [progresses, bookmarks] = await Promise.all([
        this.prisma.listeningProgress.findMany({
          where: {
            userId,
            materialId: { in: materialIds },
          },
        }),
        this.prisma.userListeningBookmark.findMany({
          where: {
            userId,
            materialId: { in: materialIds },
          },
        }),
      ]);

      const progressMap = new Map(progresses.map((p) => [p.materialId, p]));
      const bookmarkSet = new Set(bookmarks.map((b) => b.materialId));

      resultItems = items.map((item) => {
        const prog = progressMap.get(item.id);
        return {
          ...item,
          progress: prog ? prog.progress : 0,
          lastPosition: prog ? prog.lastPosition : 0,
          timeSpent: prog ? prog.timeSpent : 0,
          completedAt: prog ? prog.completedAt : null,
          isBookmarked: bookmarkSet.has(item.id),
        };
      });
    } else {
      resultItems = items.map((item) => ({
        ...item,
        progress: 0,
        lastPosition: 0,
        timeSpent: 0,
        completedAt: null,
        isBookmarked: false,
      }));
    }

    return {
      data: resultItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findMaterialById(id: string, userId?: string): Promise<ListeningMaterialDetail | null> {
    const cacheKey = `listening:material:${id}:raw`;
    let material = await this.cacheService.get<ListeningMaterial & { subtitles: ListeningSubtitle[]; questions: ListeningQuestion[] }>(cacheKey);

    if (!material) {
      material = await this.prisma.listeningMaterial.findFirst({
        where: {
          id,
          deleted: false,
        },
        include: {
          subtitles: {
            orderBy: { order: 'asc' },
          },
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (material) {
        await this.cacheService.set(cacheKey, material, 300); // 5 mins TTL
      }
    }

    if (!material) return null;

    let progress = null;
    let isBookmarked = false;
    let userVote = 0;

    if (userId) {
      const [prog, bookmark, vote] = await Promise.all([
        this.prisma.listeningProgress.findUnique({
          where: {
            idx_user_listening_material: {
              userId,
              materialId: id,
            },
          },
        }),
        this.prisma.userListeningBookmark.findUnique({
          where: {
            userId_materialId: {
              userId,
              materialId: id,
            },
          },
        }),
        this.prisma.listeningVote.findUnique({
          where: {
            userId_materialId: {
              userId,
              materialId: id,
            },
          },
        }),
      ]);

      progress = prog;
      isBookmarked = !!bookmark;
      userVote = vote ? vote.vote : 0;
    }

    return {
      ...material,
      userProgress: progress ? {
        progress: progress.progress,
        lastPosition: progress.lastPosition,
        timeSpent: progress.timeSpent,
        completedAt: progress.completedAt,
      } : null,
      isBookmarked,
      userVote,
    };
  }

  async incrementViewCount(id: string) {
    await this.prisma.listeningMaterial.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async findMaterialRawById(id: string) {
    return this.prisma.listeningMaterial.findFirst({
      where: { id, deleted: false },
    });
  }

  async findProgress(userId: string, materialId: string) {
    return this.prisma.listeningProgress.findUnique({
      where: {
        idx_user_listening_material: {
          userId,
          materialId,
        },
      },
    });
  }

  async upsertProgress(
    userId: string,
    materialId: string,
    data: {
      progress: number;
      lastPosition: number;
      timeSpent: number;
      completedAt: Date | null;
    }
  ) {
    return this.prisma.listeningProgress.upsert({
      where: {
        idx_user_listening_material: {
          userId,
          materialId,
        },
      },
      update: {
        progress: data.progress,
        lastPosition: data.lastPosition,
        timeSpent: data.timeSpent,
        completedAt: data.completedAt || undefined,
      },
      create: {
        userId,
        materialId,
        progress: data.progress,
        lastPosition: data.lastPosition,
        timeSpent: data.timeSpent,
        completedAt: data.completedAt,
      },
    });
  }

  async findAllProgressByUserId(userId: string) {
    return this.prisma.listeningProgress.findMany({
      where: { userId },
    });
  }

  async upsertUserStats(userId: string, totalMaterials: number, totalTime: number) {
    return this.prisma.userListeningStats.upsert({
      where: { userId },
      update: {
        totalMaterials,
        totalTime,
      },
      create: {
        userId,
        totalMaterials,
        totalTime,
        masteryLevel: 'A1',
      },
    });
  }

  async createSession(userId: string, materialId: string, duration: number) {
    return this.prisma.listeningSession.create({
      data: {
        userId,
        materialId,
        duration,
      },
    });
  }

  async findBookmark(userId: string, materialId: string) {
    return this.prisma.userListeningBookmark.findUnique({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
    });
  }

  async createBookmark(userId: string, materialId: string) {
    try {
      return await this.prisma.userListeningBookmark.create({
        data: {
          userId,
          materialId,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        // Safe fallback if already bookmarked concurrently
        return this.prisma.userListeningBookmark.findUniqueOrThrow({
          where: {
            userId_materialId: {
              userId,
              materialId,
            },
          },
        });
      }
      throw err;
    }
  }

  async deleteBookmark(userId: string, materialId: string) {
    await this.prisma.userListeningBookmark.delete({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
    });
  }

  async findVote(userId: string, materialId: string) {
    return this.prisma.listeningVote.findUnique({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
    });
  }

  async createVote(userId: string, materialId: string, vote: number) {
    return this.prisma.listeningVote.create({
      data: {
        userId,
        materialId,
        vote,
      },
    });
  }

  async updateVote(userId: string, materialId: string, vote: number) {
    return this.prisma.listeningVote.update({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
      data: { vote },
    });
  }

  async deleteVote(userId: string, materialId: string) {
    await this.prisma.listeningVote.delete({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
    });
  }

  async countVotes(materialId: string, voteValue: number) {
    return this.prisma.listeningVote.count({
      where: { materialId, vote: voteValue },
    });
  }

  async updateMaterialVotes(materialId: string, upvotes: number, downvotes: number) {
    const updated = await this.prisma.listeningMaterial.update({
      where: { id: materialId },
      data: {
        upvotes,
        downvotes,
      },
    });
    
    // Invalidate caches asynchronously
    this.cacheService.delete(`listening:material:${materialId}:raw`).catch(err =>
      console.error('Failed to delete cached material:', err)
    );
    this.cacheService.clearPattern('listening:materials:raw:*').catch(err =>
      console.error('Failed to clear cached lists:', err)
    );

    return updated;
  }

  async createMaterial(dto: CreateListeningMaterialDto, creatorId: string) {
    const {
      title,
      description,
      category,
      difficulty,
      mediaUrl,
      youtubeId,
      thumbnailUrl,
      duration,
      author,
      isCommunity,
      tags,
      vocabularySetId,
      subtitles,
      questions,
    } = dto;

    const created = await this.prisma.listeningMaterial.create({
      data: {
        title,
        description,
        category,
        difficulty,
        mediaUrl,
        youtubeId,
        thumbnailUrl,
        duration,
        author,
        isCommunity: isCommunity || false,
        isPublished: true,
        tags: tags || [],
        creatorId,
        vocabularySetId,
        subtitles: subtitles && subtitles.length > 0 ? {
          create: subtitles.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            text: s.text,
            translation: s.translation,
            order: s.order,
          })),
        } : undefined,
        questions: questions && questions.length > 0 ? {
          create: questions.map((q) => ({
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            audioTimestamp: q.audioTimestamp,
            order: q.order,
          })),
        } : undefined,
      },
      include: {
        subtitles: true,
        questions: true,
      },
    });

    // Invalidate list caches asynchronously
    this.cacheService.clearPattern('listening:materials:raw:*').catch(err =>
      console.error('Failed to clear cached lists:', err)
    );

    return created;
  }

  async findUserStats(userId: string): Promise<UserListeningStatsWithStreak | null> {
    const cacheKey = `listening:user-stats:${userId}`;
    const cached = await this.cacheService.get<UserListeningStatsWithStreak>(cacheKey);
    if (cached) return cached;

    const [stats, streakRecord] = await Promise.all([
      this.prisma.userListeningStats.findUnique({
        where: { userId },
      }),
      this.prisma.userDailyStreak.findUnique({
        where: { userId },
      }),
    ]);

    const result = {
      totalMaterials: stats?.totalMaterials || 0,
      totalTime: stats?.totalTime || 0,
      masteryLevel: stats?.masteryLevel || 'A1',
      streak: streakRecord?.streakCount || 0,
    };

    await this.cacheService.set(cacheKey, result, 120); // 2 min TTL
    return result;
  }

  async findWeeklyActivity(userId: string): Promise<{ day: string; minutes: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessions = await this.prisma.listeningSession.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { duration: true, createdAt: true },
    });

    const dayMap: Record<string, number> = {};
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      dayMap[dayNames[d.getDay()]] = 0;
    }

    sessions.forEach((s) => {
      const dayName = dayNames[new Date(s.createdAt).getDay()];
      dayMap[dayName] = (dayMap[dayName] || 0) + Math.round(s.duration / 60);
    });

    return Object.entries(dayMap).map(([day, minutes]) => ({ day, minutes }));
  }

  async findLeaderboard(limit = 5): Promise<ListeningLeaderboardEntry[]> {
    const cacheKey = `listening:leaderboard:${limit}`;
    const cached = await this.cacheService.get<ListeningLeaderboardEntry[]>(cacheKey);
    if (cached) return cached;

    const statsList = await this.prisma.userListeningStats.findMany({
      orderBy: { totalTime: 'desc' },
      take: limit,
    });

    if (statsList.length === 0) {
      await this.cacheService.set(cacheKey, [], 300);
      return [];
    }

    const userIds = statsList.map((s) => s.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, picture: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const result = statsList.map((s) => {
      const u = userMap.get(s.userId);
      return {
        userId: s.userId,
        totalTime: s.totalTime,
        masteryLevel: s.masteryLevel,
        userName: u?.name || 'Học viên ẩn danh',
        userPicture: u?.picture || null,
      };
    });

    await this.cacheService.set(cacheKey, result, 300);
    return result;
  }
}

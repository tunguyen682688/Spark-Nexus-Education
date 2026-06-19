import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListeningMaterialDetailQuery } from './get-material-detail.query';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { NotFoundException } from '@nestjs/common';

@QueryHandler(GetListeningMaterialDetailQuery)
export class GetListeningMaterialDetailQueryHandler implements IQueryHandler<GetListeningMaterialDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetListeningMaterialDetailQuery) {
    const { id, userId } = query;

    const material = await this.prisma.listeningMaterial.findFirst({
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

    if (!material) {
      throw new NotFoundException(`Listening material with ID ${id} not found`);
    }

    // Increment view count asynchronously
    this.prisma.listeningMaterial.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(err => console.error('Failed to increment view count:', err));

    let progress = null;
    let isBookmarked = false;
    let userVote = 0; // 0: no vote, 1: upvoted, -1: downvoted

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
}

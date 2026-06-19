import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetListeningMaterialsQuery } from './get-materials.query';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

@QueryHandler(GetListeningMaterialsQuery)
export class GetListeningMaterialsQueryHandler implements IQueryHandler<GetListeningMaterialsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetListeningMaterialsQuery) {
    const { dto, userId } = query;
    const { category, difficulty, isCommunity, q, page = 1, limit = 20 } = dto;

    const skip = (page - 1) * limit;

    const where: any = {
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

    const [items, total] = await Promise.all([
      this.prisma.listeningMaterial.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.listeningMaterial.count({ where }),
    ]);

    // Attach user progress if userId is provided
    let resultItems = items;
    if (userId && items.length > 0) {
      const materialIds = items.map((item) => item.id);
      const progresses = await this.prisma.listeningProgress.findMany({
        where: {
          userId,
          materialId: { in: materialIds },
        },
      });

      const progressMap = new Map(progresses.map((p) => [p.materialId, p]));

      resultItems = items.map((item) => {
        const prog = progressMap.get(item.id);
        return {
          ...item,
          progress: prog ? prog.progress : 0,
          lastPosition: prog ? prog.lastPosition : 0,
          timeSpent: prog ? prog.timeSpent : 0,
          completedAt: prog ? prog.completedAt : null,
        } as any;
      });
    } else {
      resultItems = items.map((item) => ({
        ...item,
        progress: 0,
        lastPosition: 0,
        timeSpent: 0,
        completedAt: null,
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
}

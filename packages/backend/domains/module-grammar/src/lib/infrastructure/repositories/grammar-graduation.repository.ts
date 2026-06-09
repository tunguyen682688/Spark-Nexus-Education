import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { IGrammarGraduationRepository } from '../../domain/repositories/grammar-graduation.repository.interface';
import { UserLevelGraduationEntity } from '../../domain/entities/user-level-graduation.entity';

@Injectable()
export class GrammarGraduationRepository implements IGrammarGraduationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findGraduation(userId: string, level: string): Promise<UserLevelGraduationEntity | null> {
    const record = await this.prisma.userLevelGraduation.findUnique({
      where: {
        idx_user_level_graduation: {
          userId,
          level,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  async upsertGraduation(
    userId: string,
    level: string,
    data: { isPassed: boolean; bestScore: number; certificateUrl?: string | null }
  ): Promise<UserLevelGraduationEntity> {
    const updateData: any = {
      isPassed: data.isPassed,
      bestScore: data.bestScore,
    };
    if (data.certificateUrl !== undefined) {
      updateData.certificateUrl = data.certificateUrl;
    }

    const record = await this.prisma.userLevelGraduation.upsert({
      where: {
        idx_user_level_graduation: {
          userId,
          level,
        },
      },
      update: updateData,
      create: {
        userId,
        level,
        isPassed: data.isPassed,
        bestScore: data.bestScore,
        certificateUrl: data.certificateUrl || null,
      },
    });

    return this.toDomain(record);
  }

  private toDomain(r: any): UserLevelGraduationEntity {
    return new UserLevelGraduationEntity({
      id: r.id,
      userId: r.userId,
      level: r.level,
      isPassed: r.isPassed,
      bestScore: r.bestScore,
      certificateUrl: r.certificateUrl,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    });
  }
}

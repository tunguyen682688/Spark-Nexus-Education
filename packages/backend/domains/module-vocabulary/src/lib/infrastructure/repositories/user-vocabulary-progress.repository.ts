import { Injectable } from '@nestjs/common';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { UserVocabularyProgressEntity } from '../../domain/entities/user-vocabulary-progress.entity';
import { IUserVocabularyProgressRepository } from '../../domain/repositories/user-vocabulary-progress.repository.interface';

/**
 * UserVocabularyProgressRepository
 * Prisma implementation of IUserVocabularyProgressRepository
 */
@Injectable()
export class UserVocabularyProgressRepository implements IUserVocabularyProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find progress by ID
   */
  async findById(id: string): Promise<UserVocabularyProgressEntity | null> {
    const record = await this.prisma.userVocabularyProgress.findUnique({
      where: { id },
    });
    return record ? this.toDomain(record) : null;
  }

  /**
   * Find progress for a specific user and vocabulary set item
   */
  async findByUserAndItem(userId: string, itemId: string): Promise<UserVocabularyProgressEntity | null> {
    const record = await this.prisma.userVocabularyProgress.findUnique({
      where: {
        idx_progress_user_item: {
          userId,
          itemId,
        },
      },
    });
    return record ? this.toDomain(record) : null;
  }

  /**
   * Find all progress entries for a user in a list of item IDs
   */
  async findByUserAndItems(userId: string, itemIds: string[]): Promise<UserVocabularyProgressEntity[]> {
    if (itemIds.length === 0) {
      return [];
    }
    const records = await this.prisma.userVocabularyProgress.findMany({
      where: {
        userId,
        itemId: { in: itemIds },
      },
    });
    return records.map((record) => this.toDomain(record));
  }

  /**
   * Save or update progress using upsert
   */
  async save(progress: UserVocabularyProgressEntity): Promise<UserVocabularyProgressEntity> {
    const data = progress.toPersistence();

    const saved = await this.prisma.userVocabularyProgress.upsert({
      where: {
        idx_progress_user_item: {
          userId: data.userId,
          itemId: data.itemId,
        },
      },
      update: {
        status: data.status,
        streak: data.streak,
        masteryLevel: data.masteryLevel,
        lastReview: data.lastReview,
        nextReviewAt: data.nextReviewAt,
        interval: data.interval,
        easeFactor: data.easeFactor,
        repetitions: data.repetitions,
      },
      create: {
        id: data.id,
        userId: data.userId,
        itemId: data.itemId,
        status: data.status,
        streak: data.streak,
        masteryLevel: data.masteryLevel,
        lastReview: data.lastReview,
        nextReviewAt: data.nextReviewAt,
        interval: data.interval,
        easeFactor: data.easeFactor,
        repetitions: data.repetitions,
      },
    });

    return this.toDomain(saved);
  }

  /**
   * Get the current streak (maximum streak among studied items) of the user
   */
  async getUserStreak(userId: string): Promise<number> {
    const result = await this.prisma.userVocabularyProgress.aggregate({
      where: { userId },
      _max: { streak: true },
    });
    return result._max.streak || 0;
  }

  /**
   * Convert Prisma DB Model to Domain Entity
   */
  private toDomain(record: {
    id: string;
    userId: string;
    itemId: string;
    status: string;
    streak: number;
    masteryLevel: number;
    lastReview: Date | null;
    nextReviewAt: Date | null;
    interval: number;
    easeFactor: number;
    repetitions: number;
    createdAt: Date;
    updatedAt: Date;
  }): UserVocabularyProgressEntity {
    return UserVocabularyProgressEntity.fromPersistence({
      id: record.id,
      userId: record.userId,
      itemId: record.itemId,
      status: record.status,
      streak: record.streak,
      masteryLevel: record.masteryLevel,
      lastReview: record.lastReview,
      nextReviewAt: record.nextReviewAt,
      interval: record.interval,
      easeFactor: record.easeFactor,
      repetitions: record.repetitions,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}

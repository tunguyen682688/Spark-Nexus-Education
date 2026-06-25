import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LISTENING_REPOSITORY } from '../repositories/listening.repository.interface';
import type { IListeningRepository } from '../repositories/listening.repository.interface';
import { CreateListeningMaterialDto } from '../../application/dtos/create-material.dto';
import { UpdateListeningProgressDto } from '../../application/dtos/update-progress.dto';

@Injectable()
export class ListeningService {
  constructor(
    @Inject(LISTENING_REPOSITORY)
    private readonly listeningRepository: IListeningRepository
  ) {}

  async createMaterial(dto: CreateListeningMaterialDto, creatorId: string) {
    return this.listeningRepository.createMaterial(dto, creatorId);
  }

  async toggleBookmark(userId: string, materialId: string) {
    const material = await this.listeningRepository.findMaterialRawById(materialId);
    if (!material) {
      throw new NotFoundException(`Listening material with ID ${materialId} not found`);
    }

    const existingBookmark = await this.listeningRepository.findBookmark(userId, materialId);
    let isBookmarked = false;
    if (existingBookmark) {
      await this.listeningRepository.deleteBookmark(userId, materialId);
    } else {
      await this.listeningRepository.createBookmark(userId, materialId);
      isBookmarked = true;
    }

    return {
      materialId,
      userId,
      isBookmarked,
    };
  }

  async voteMaterial(userId: string, materialId: string, vote: number) {
    const material = await this.listeningRepository.findMaterialRawById(materialId);
    if (!material) {
      throw new NotFoundException(`Listening material with ID ${materialId} not found`);
    }

    const existingVote = await this.listeningRepository.findVote(userId, materialId);
    if (existingVote) {
      if (existingVote.vote === vote) {
        await this.listeningRepository.deleteVote(userId, materialId);
      } else {
        await this.listeningRepository.updateVote(userId, materialId, vote);
      }
    } else {
      await this.listeningRepository.createVote(userId, materialId, vote);
    }

    const upvotesCount = await this.listeningRepository.countVotes(materialId, 1);
    const downvotesCount = await this.listeningRepository.countVotes(materialId, -1);

    const updatedMaterial = await this.listeningRepository.updateMaterialVotes(
      materialId,
      upvotesCount,
      downvotesCount
    );

    return {
      id: updatedMaterial.id,
      upvotes: updatedMaterial.upvotes,
      downvotes: updatedMaterial.downvotes,
    };
  }

  async updateProgress(
    userId: string,
    materialId: string,
    dto: UpdateListeningProgressDto
  ) {
    const { progress, lastPosition, timeSpent, completed } = dto;

    const material = await this.listeningRepository.findMaterialRawById(materialId);
    if (!material) {
      throw new NotFoundException(`Listening material with ID ${materialId} not found`);
    }

    const completedAt = (completed || progress >= 100) ? new Date() : null;

    const record = await this.listeningRepository.upsertProgress(userId, materialId, {
      progress,
      lastPosition,
      timeSpent,
      completedAt,
    });

    try {
      await this.listeningRepository.createSession(userId, materialId, timeSpent);
    } catch (err) {
      console.error('Failed to log listening session:', err);
    }

    return record;
  }

  async getUserStats(userId: string) {
    const stats = await this.listeningRepository.findUserStats(userId);
    return stats || { totalMaterials: 0, totalTime: 0, masteryLevel: 'beginner' };
  }

  async getWeeklyActivity(userId: string) {
    return this.listeningRepository.findWeeklyActivity(userId);
  }

  async getLeaderboard(limit?: number) {
    return this.listeningRepository.findLeaderboard(limit);
  }

  async getMaterialDetail(id: string, userId: string) {
    const material = await this.listeningRepository.findMaterialById(id, userId);
    if (!material) {
      throw new NotFoundException(`Listening material with ID ${id} not found`);
    }
    this.listeningRepository.incrementViewCount(id).catch((err) =>
      console.error('Failed to increment view count:', err)
    );
    return material;
  }
}

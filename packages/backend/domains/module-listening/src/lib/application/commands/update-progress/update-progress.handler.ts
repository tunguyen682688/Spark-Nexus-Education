import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { UpdateListeningProgressCommand } from './update-progress.command';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateListeningProgressCommand)
export class UpdateListeningProgressCommandHandler implements ICommandHandler<UpdateListeningProgressCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdateListeningProgressCommand) {
    const { materialId, userId, dto } = command;
    const { progress, lastPosition, timeSpent, completed } = dto;

    // Check if material exists
    const material = await this.prisma.listeningMaterial.findFirst({
      where: { id: materialId, deleted: false },
    });

    if (!material) {
      throw new NotFoundException(`Listening material with ID ${materialId} not found`);
    }

    const completedAt = (completed || progress >= 100) ? new Date() : null;

    // 1. Update or create progress
    const record = await this.prisma.listeningProgress.upsert({
      where: {
        idx_user_listening_material: {
          userId,
          materialId,
        },
      },
      update: {
        progress,
        lastPosition,
        timeSpent,
        completedAt: completedAt || undefined,
      },
      create: {
        userId,
        materialId,
        progress,
        lastPosition,
        timeSpent,
        completedAt,
      },
    });

    // 2. Aggregate and update UserListeningStats
    try {
      const allProgress = await this.prisma.listeningProgress.findMany({
        where: { userId },
      });

      const totalMaterials = allProgress.filter((p) => p.progress >= 100 || p.completedAt !== null).length;
      const totalTime = allProgress.reduce((sum, p) => sum + p.timeSpent, 0);

      await this.prisma.userListeningStats.upsert({
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
    } catch (err) {
      console.error('Failed to update UserListeningStats:', err);
    }

    // 3. Log a listening session
    try {
      await this.prisma.listeningSession.create({
        data: {
          userId,
          materialId,
          duration: timeSpent,
        },
      });
    } catch (err) {
      console.error('Failed to log listening session:', err);
    }

    return record;
  }
}

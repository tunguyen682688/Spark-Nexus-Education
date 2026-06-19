import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { VoteListeningMaterialCommand } from './vote-material.command';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(VoteListeningMaterialCommand)
export class VoteListeningMaterialCommandHandler implements ICommandHandler<VoteListeningMaterialCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: VoteListeningMaterialCommand) {
    const { materialId, userId, dto } = command;
    const { vote } = dto;

    const material = await this.prisma.listeningMaterial.findFirst({
      where: { id: materialId, deleted: false },
    });

    if (!material) {
      throw new NotFoundException(`Listening material with ID ${materialId} not found`);
    }

    const existingVote = await this.prisma.listeningVote.findUnique({
      where: {
        userId_materialId: {
          userId,
          materialId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.vote === vote) {
        // Toggle vote off if user clicks same button
        await this.prisma.listeningVote.delete({
          where: {
            userId_materialId: {
              userId,
              materialId,
            },
          },
        });
      } else {
        // Change vote direction
        await this.prisma.listeningVote.update({
          where: {
            userId_materialId: {
              userId,
              materialId,
            },
          },
          data: { vote },
        });
      }
    } else {
      // Create a new vote
      await this.prisma.listeningVote.create({
        data: {
          userId,
          materialId,
          vote,
        },
      });
    }

    // Recalculate upvotes and downvotes
    const upvotesCount = await this.prisma.listeningVote.count({
      where: { materialId, vote: 1 },
    });

    const downvotesCount = await this.prisma.listeningVote.count({
      where: { materialId, vote: -1 },
    });

    const updatedMaterial = await this.prisma.listeningMaterial.update({
      where: { id: materialId },
      data: {
        upvotes: upvotesCount,
        downvotes: downvotesCount,
      },
    });

    return {
      id: updatedMaterial.id,
      upvotes: updatedMaterial.upvotes,
      downvotes: updatedMaterial.downvotes,
    };
  }
}

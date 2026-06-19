import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { CreateListeningMaterialCommand } from './create-material.command';
import { PrismaService } from '@spark-nest-ed/infrastructure-database';

@CommandHandler(CreateListeningMaterialCommand)
export class CreateListeningMaterialCommandHandler implements ICommandHandler<CreateListeningMaterialCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreateListeningMaterialCommand) {
    const { dto, creatorId } = command;
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

    return this.prisma.listeningMaterial.create({
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
        isPublished: true, // Auto publish for seeded / contributed materials
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
  }
}

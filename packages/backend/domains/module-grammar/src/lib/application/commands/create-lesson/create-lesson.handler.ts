import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateLessonCommand } from './create-lesson.command';
import { Inject } from '@nestjs/common';
import { GRAMMAR_LESSON_REPOSITORY } from '../../../domain/repositories/grammar-lesson.repository.interface';
import type { IGrammarLessonRepository } from '../../../domain/repositories/grammar-lesson.repository.interface';
import { GrammarLessonEntity } from '../../../domain/entities/grammar-lesson.entity';
import { CefrLevelVO } from '../../../domain/value-objects/cefr-level.vo';
import { LessonStatusVO } from '../../../domain/value-objects/lesson-status.vo';
import { slugify, sanitizeBlocks } from '../../../common/utils/grammar.utils';

@CommandHandler(CreateLessonCommand)
export class CreateLessonHandler implements ICommandHandler<CreateLessonCommand, any> {
  constructor(
    @Inject(GRAMMAR_LESSON_REPOSITORY)
    private readonly lessonRepository: IGrammarLessonRepository
  ) {}

  async execute(command: CreateLessonCommand): Promise<any> {
    const { dto } = command;
    const baseSlug = slugify(dto.title);
    const uniqueHash = Math.random().toString(36).substring(2, 6);
    const lessonId = baseSlug ? `${baseSlug}-${uniqueHash}` : `lesson-${uniqueHash}`;
    
    const blocks = sanitizeBlocks(dto.blocks || []);
    const outline = dto.outline && dto.outline.length > 0
      ? dto.outline
      : blocks.map((block, idx) => ({
          id: block.id,
          label: block.blockLabel || `Mục ${idx + 1}: ${block.type.toUpperCase()}`,
          status: idx === 0 ? 'ACTIVE' : 'PENDING',
        }));

    const entity = new GrammarLessonEntity({
      id: lessonId,
      title: dto.title,
      vietnameseTitle: dto.vietnameseTitle || null,
      level: new CefrLevelVO((dto.level || 'B1') as any),
      status: new LessonStatusVO((dto.status || 'DRAFT') as any),
      tags: dto.tags || [],
      outline,
      blocks,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.lessonRepository.create(entity);
    return {
      success: true,
      data: saved,
    };
  }
}

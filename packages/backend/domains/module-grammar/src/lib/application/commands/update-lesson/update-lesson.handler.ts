import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateLessonCommand } from './update-lesson.command';
import { Inject, NotFoundException } from '@nestjs/common';
import { GRAMMAR_LESSON_REPOSITORY } from '../../../domain/repositories/grammar-lesson.repository.interface';
import type { IGrammarLessonRepository } from '../../../domain/repositories/grammar-lesson.repository.interface';
import { sanitizeBlocks } from '../../../common/utils/grammar.utils';

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonHandler implements ICommandHandler<UpdateLessonCommand, any> {
  constructor(
    @Inject(GRAMMAR_LESSON_REPOSITORY)
    private readonly lessonRepository: IGrammarLessonRepository
  ) {}

  async execute(command: UpdateLessonCommand): Promise<any> {
    const { id, dto } = command;
    const lesson = await this.lessonRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học để cập nhật: ${id}`);
    }

    const blocks = dto.blocks ? sanitizeBlocks(dto.blocks) : lesson.blocks;
    const outline = dto.outline && dto.outline.length > 0
      ? dto.outline
      : dto.blocks
      ? sanitizeBlocks(dto.blocks).map((block, idx) => ({
          id: block.id,
          label: block.blockLabel || `Mục ${idx + 1}: ${block.type.toUpperCase()}`,
          status: idx === 0 ? 'ACTIVE' : 'PENDING',
        }))
      : lesson.outline;

    const updated = await this.lessonRepository.update(id, {
      title: dto.title ?? lesson.title,
      vietnameseTitle: dto.vietnameseTitle !== undefined ? dto.vietnameseTitle : lesson.vietnameseTitle,
      level: dto.level ?? lesson.level,
      status: dto.status ?? lesson.status,
      tags: dto.tags ?? lesson.tags,
      outline,
      blocks,
    });

    return {
      success: true,
      data: updated,
    };
  }
}

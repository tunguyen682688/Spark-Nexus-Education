import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetLessonDetailQuery } from './get-lesson-detail.query';
import { Inject, NotFoundException } from '@nestjs/common';
import { GRAMMAR_LESSON_REPOSITORY } from '../../../domain/repositories/grammar-lesson.repository.interface';
import type { IGrammarLessonRepository } from '../../../domain/repositories/grammar-lesson.repository.interface';
import { GRAMMAR_PROGRESS_REPOSITORY } from '../../../domain/repositories/grammar-progress.repository.interface';
import type { IGrammarProgressRepository } from '../../../domain/repositories/grammar-progress.repository.interface';

@QueryHandler(GetLessonDetailQuery)
export class GetLessonDetailHandler implements IQueryHandler<GetLessonDetailQuery, any> {
  constructor(
    @Inject(GRAMMAR_LESSON_REPOSITORY)
    private readonly lessonRepository: IGrammarLessonRepository,
    @Inject(GRAMMAR_PROGRESS_REPOSITORY)
    private readonly progressRepository: IGrammarProgressRepository
  ) {}

  async execute(query: GetLessonDetailQuery): Promise<any> {
    const { id, userId } = query;
    const lesson = await this.lessonRepository.findById(id);

    if (!lesson) {
      throw new NotFoundException(`Không tìm thấy bài học với ID: ${id}`);
    }

    let progress = await this.progressRepository.findByUserAndLesson(userId, id);
    if (!progress) {
      progress = await this.progressRepository.upsert(userId, id, {
        status: 'IN_PROGRESS',
        proficiency: 0,
        quickNotes: 'Jot down key takeaways here...',
      });
    }

    const allLessons = await this.lessonRepository.findAll({ deleted: false });
    const publishedLessons = allLessons.filter((l: any) => l.status?.value === 'PUBLISHED');

    const currentIndex = publishedLessons.findIndex((l) => l.id === id);
    let nextLesson = null;
    if (currentIndex !== -1 && currentIndex < publishedLessons.length - 1) {
      const next = publishedLessons[currentIndex + 1] as any;
      nextLesson = {
        id: next.id,
        title: next.title,
        level: next.level?.value,
        icon: next.icon,
      };
    }

    return {
      id: lesson.id,
      title: lesson.title,
      vietnameseTitle: lesson.vietnameseTitle,
      status: progress.status,
      level: lesson.level?.value,
      tags: lesson.tags,
      outline: lesson.outline,
      blocks: lesson.blocks,
      quickNotes: progress.quickNotes,
      nextLesson,
      proficiency: progress.proficiency,
    };
  }
}

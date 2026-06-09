import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetRoadmapQuery } from './get-roadmap.query';
import { Inject } from '@nestjs/common';
import { GRAMMAR_LESSON_REPOSITORY } from '../../../domain/repositories/grammar-lesson.repository.interface';
import type { IGrammarLessonRepository } from '../../../domain/repositories/grammar-lesson.repository.interface';
import { GRAMMAR_PROGRESS_REPOSITORY } from '../../../domain/repositories/grammar-progress.repository.interface';
import type { IGrammarProgressRepository } from '../../../domain/repositories/grammar-progress.repository.interface';
import { UserGrammarProgressEntity } from '../../../domain/entities/user-grammar-progress.entity';
import { GRAMMAR_TRAP_REPOSITORY } from '../../../domain/repositories/grammar-trap.repository.interface';
import type { IGrammarTrapRepository } from '../../../domain/repositories/grammar-trap.repository.interface';
import { GRAMMAR_STREAK_REPOSITORY } from '../../../domain/repositories/grammar-streak.repository.interface';
import type { IGrammarStreakRepository } from '../../../domain/repositories/grammar-streak.repository.interface';
import {
  CEFR_LEVELS,
  CEFR_LEVEL_NAMES,
  SKILL_CATEGORIES,
  TAG_TO_CATEGORY_MAP,
} from '../../../common/constants/grammar.constants';

@QueryHandler(GetRoadmapQuery)
export class GetRoadmapHandler implements IQueryHandler<GetRoadmapQuery, any> {
  constructor(
    @Inject(GRAMMAR_LESSON_REPOSITORY)
    private readonly lessonRepository: IGrammarLessonRepository,
    @Inject(GRAMMAR_PROGRESS_REPOSITORY)
    private readonly progressRepository: IGrammarProgressRepository,
    @Inject(GRAMMAR_TRAP_REPOSITORY)
    private readonly trapRepository: IGrammarTrapRepository,
    @Inject(GRAMMAR_STREAK_REPOSITORY)
    private readonly streakRepository: IGrammarStreakRepository
  ) {}

  async execute(query: GetRoadmapQuery): Promise<any> {
    const { userId } = query;

    // 1. Fetch lessons
    const lessons = await this.lessonRepository.findAll({ deleted: false });

    // 2. Fetch user progress
    const userProgress = await this.progressRepository.findByUser(userId);
    const progressMap = new Map<string, UserGrammarProgressEntity>(
      userProgress.map((p) => [p.lessonId, p])
    );

    // 3. Fetch user traps
    const trappedTraps = await this.trapRepository.findByUser(userId, 'TRAPPED');
    const categoryTrapsCount: Record<string, number> = {
      syntax: 0,
      tenses: 0,
      morphology: 0,
      modality: 0,
    };

    trappedTraps.forEach((trap) => {
      const cat = trap.category.toLowerCase();
      if (cat in categoryTrapsCount) {
        categoryTrapsCount[cat]++;
      }
    });

    // 4. Group lessons by level
    const levelsMap = new Map<string, any[]>();
    const publishedLessons = lessons.filter((l) => l.status?.value === 'PUBLISHED');

    for (const lesson of lessons) {
      const lvl = lesson.level?.value?.toUpperCase() || 'B1';
      if (!levelsMap.has(lvl)) {
        levelsMap.set(lvl, []);
      }

      const progress = progressMap.get(lesson.id);
      let computedStatus = 'LOCKED';

      if (lesson.status?.value === 'DRAFT') {
        computedStatus = 'DRAFT';
      } else if (progress) {
        computedStatus = progress.status;
      } else {
        const pubIndex = publishedLessons.findIndex((pl) => pl.id === lesson.id);
        if (pubIndex === 0) {
          computedStatus = 'IN_PROGRESS';
        } else if (pubIndex > 0) {
          const prevLesson = publishedLessons[pubIndex - 1];
          const prevProgress = progressMap.get(prevLesson.id);
          if (prevProgress && prevProgress.status === 'MASTERED') {
            computedStatus = 'IN_PROGRESS';
          } else {
            computedStatus = 'LOCKED';
          }
        }
      }

      let hasLeak = false;
      let trapCount = 0;
      for (const tag of lesson.tags || []) {
        const mappedCat = TAG_TO_CATEGORY_MAP[tag.toUpperCase()];
        if (mappedCat && categoryTrapsCount[mappedCat] > 0) {
          hasLeak = true;
          trapCount = Math.max(trapCount, categoryTrapsCount[mappedCat]);
        }
      }

      levelsMap.get(lvl)?.push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.vietnameseTitle || 'Không có mô tả chi tiết.',
        status: computedStatus,
        successRate: progress?.status === 'MASTERED' ? '100% SUCCESS' : undefined,
        proficiency: progress ? progress.proficiency : 0,
        icon: lesson.icon || '📖',
        hasLeak,
        trapCount,
      });
    }

    const levels = CEFR_LEVELS.filter((lvl) => levelsMap.has(lvl)).map((lvl) => ({
      level: lvl,
      name: CEFR_LEVEL_NAMES[lvl]?.name || `Trình độ ${lvl}`,
      subName: CEFR_LEVEL_NAMES[lvl]?.subName || 'GRAMMAR SKILL LEVEL',
      lessons: levelsMap.get(lvl) || [],
    }));

    const allLessonsCount = lessons.length;
    const completedCount = userProgress.filter((p) => p.status === 'MASTERED').length;
    const percentComplete = allLessonsCount > 0 
      ? parseFloat(((completedCount / allLessonsCount) * 100).toFixed(1))
      : 0;

    const skills = SKILL_CATEGORIES.map((category) => {
      const categoryLessons = lessons.filter((l) =>
        l.tags?.some((t: string) => (category.tags as unknown as string[]).includes(t.toUpperCase()))
      );
      const total = categoryLessons.length;
      const completed = categoryLessons.filter((l) =>
        progressMap.get(l.id)?.status === 'MASTERED'
      ).length;

      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: category.name,
        value: percentage,
      };
    });

    let streakRecord = await this.streakRepository.findByUser(userId);
    if (!streakRecord) {
      streakRecord = await this.streakRepository.upsertStreak(userId, {
        streakCount: 0,
        totalXP: 0,
      });
    }

    return {
      percentComplete,
      completedLessons: completedCount,
      totalLessons: allLessonsCount,
      streakDays: streakRecord.streakCount,
      currentXP: streakRecord.totalXP,
      levels,
      skills,
    };
  }
}

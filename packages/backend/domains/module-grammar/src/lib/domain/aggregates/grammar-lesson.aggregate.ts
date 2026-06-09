import { GrammarLessonEntity } from '../entities/grammar-lesson.entity';
import { UserGrammarProgressEntity } from '../entities/user-grammar-progress.entity';
import { TrapBrokenEvent } from '../events/trap-broken.event';

// Aggregate Root quản lý mối quan hệ giữa Lesson và User Progress
export class GrammarLessonAggregate {
  constructor(
    public readonly lesson: GrammarLessonEntity,
    public readonly userProgress?: UserGrammarProgressEntity
  ) {}

  public checkAccessAndStart(userLevel: string): { allowed: boolean; reason?: string } {
    const userLevelVO = new (require('../value-objects/cefr-level.vo').CefrLevelVO)(userLevel);
    
    if (!this.lesson.canUserAccess(userLevelVO)) {
      return { allowed: false, reason: 'User level insufficient for this lesson' };
    }
    
    if (!this.lesson.status.isPublished()) {
      return { allowed: false, reason: 'Lesson is not published yet' };
    }

    return { allowed: true };
  }

  public finishLesson(score: number): TrapBrokenEvent | null {
    if (!this.userProgress) {
      throw new Error('User progress not initialized');
    }

    const previousScore = this.userProgress.proficiency;
    this.userProgress.submitAttempt(score);

    // Logic: Nếu vừa mới vượt qua ngưỡng đỗ sau nhiều lần trượt
    if (!this.userProgress.isCompleted() && score >= 70) {
       // Thực tế event sẽ được handle kỹ hơn, đây là ví dụ logic
    }

    if (this.userProgress.isCompleted() && previousScore < 70) {
      return new TrapBrokenEvent(this.lesson.id, this.userProgress.userId);
    }

    return null;
  }
}
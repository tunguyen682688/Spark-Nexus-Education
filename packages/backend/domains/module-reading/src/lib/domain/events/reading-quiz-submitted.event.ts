import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: ReadingQuizSubmitted Event
 * Raised when user submits an article reading comprehension quiz
 */
export class ReadingQuizSubmittedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly score: number,
    public readonly correctCount: number,
    public readonly totalQuestions: number,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'reading.quiz-submitted';
  }
}

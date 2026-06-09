import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class DailyQuizSubmittedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly score: number,
    public readonly xpEarned: number,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'grammar.daily-quiz-submitted';
  }
}

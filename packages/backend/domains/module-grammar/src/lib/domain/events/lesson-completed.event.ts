import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

export class LessonCompletedEvent extends DomainEvent {
  constructor(
    public readonly lessonId: string,
    public readonly userId: string,
    public readonly score: number,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'grammar.lesson-completed';
  }
}

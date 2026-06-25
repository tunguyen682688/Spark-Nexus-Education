import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: ReadingProgressUpdated Event
 * Raised when user updates reading progress or completes an article
 */
export class ReadingProgressUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly articleId: string,
    public readonly progress: number,
    public readonly timeSpent: number,
    public readonly completedAt: Date | null,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'reading.progress-updated';
  }
}

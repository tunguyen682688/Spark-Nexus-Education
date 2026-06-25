import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: ListeningProgressUpdatedEvent
 * Raised when user updates listening progress or completes a material
 */
export class ListeningProgressUpdatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly materialId: string,
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
    return 'listening-progress.updated';
  }
}

import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: ListeningMaterialCreatedEvent
 * Raised when a new listening material is created
 */
export class ListeningMaterialCreatedEvent extends DomainEvent {
  constructor(
    public readonly materialId: string,
    public readonly creatorId: string,
    public readonly title: string,
    public readonly category: string,
    public readonly difficulty: string,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'listening-material.created';
  }
}

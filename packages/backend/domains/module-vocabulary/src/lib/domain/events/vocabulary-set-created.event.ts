import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: VocabularySetCreated
 * Raised when a new vocabulary set is created
 */
export class VocabularySetCreatedEvent extends DomainEvent {
  constructor(
    public readonly vocabularySetId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly language: string,
    public readonly type: string,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'vocabulary-set.created';
  }
}

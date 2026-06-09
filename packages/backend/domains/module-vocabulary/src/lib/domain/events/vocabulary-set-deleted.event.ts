import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: VocabularySetDeleted
 * Raised when a vocabulary set is deleted (soft delete)
 */
export class VocabularySetDeletedEvent extends DomainEvent {
  constructor(
    public readonly vocabularySetId: string,
    public readonly userId: string,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'vocabulary-set.deleted';
  }
}

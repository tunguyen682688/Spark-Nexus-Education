import { DomainEvent } from '@spark-nest-ed/shared-libs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Domain Event: VocabularySetPublished
 * Raised when a vocabulary set is published (made public)
 */
export class VocabularySetPublishedEvent extends DomainEvent {
  constructor(
    public readonly vocabularySetId: string,
    public readonly userId: string,
    public readonly title: string,
    public readonly entryCount: number,
    eventId?: string
  ) {
    super(eventId);
  }

  protected generateEventId(): string {
    return uuidv4();
  }

  getEventName(): string {
    return 'vocabulary-set.published';
  }
}

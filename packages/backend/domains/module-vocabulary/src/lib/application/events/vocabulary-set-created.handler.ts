import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { VocabularySetCreatedEvent } from '../../domain/events/vocabulary-set-created.event';

/**
 * VocabularySetCreatedHandler
 *
 * Event Handler cho VocabularySetCreatedEvent
 * Xử lý side effects sau khi vocabulary set được tạo
 *
 * Responsibilities:
 * - Analytics tracking
 * - Cache invalidation
 * - Notification sending
 */
@EventsHandler(VocabularySetCreatedEvent)
export class VocabularySetCreatedHandler
  implements IEventHandler<VocabularySetCreatedEvent>
{
  private readonly logger = new Logger(VocabularySetCreatedHandler.name);

  async handle(event: VocabularySetCreatedEvent): Promise<void> {
    this.logger.log(
      `Vocabulary set created: ${event.vocabularySetId} by user ${event.userId}`
    );

    // TODO: Implement side effects
    // - Update user statistics
    // - Invalidate cache
    // - Send notifications
    // - Update analytics
  }
}

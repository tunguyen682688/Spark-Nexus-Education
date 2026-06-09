import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntryAddedToSetEvent } from '../../domain/events/entry-added-to-set.event';

/**
 * EntryAddedToSetHandler
 *
 * Event Handler cho EntryAddedToSetEvent
 * Xử lý side effects khi entry được thêm vào vocabulary set
 *
 * Responsibilities:
 * - Update analytics
 * - Update user statistics
 * - Send notifications
 */
@EventsHandler(EntryAddedToSetEvent)
export class EntryAddedToSetHandler
  implements IEventHandler<EntryAddedToSetEvent>
{
  private readonly logger = new Logger(EntryAddedToSetHandler.name);

  async handle(event: EntryAddedToSetEvent): Promise<void> {
    this.logger.log(
      `Entry ${event.entryId} added to vocabulary set ${event.vocabularySetId} by user ${event.userId}`
    );

    // TODO: Implement side effects
    // - Update vocabulary set analytics
    // - Update user learning statistics
    // - Send notifications
    // - Update cache
  }
}

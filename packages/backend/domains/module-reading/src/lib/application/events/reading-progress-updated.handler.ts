import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReadingProgressUpdatedEvent } from '../../domain/events/reading-progress-updated.event';

/**
 * ReadingProgressUpdatedHandler
 *
 * Application-layer Event Handler for ReadingProgressUpdatedEvent.
 * Handles side effects immediately after domain event is published to the EventBus.
 *
 * Responsibilities:
 * - Analytics tracking / logging
 * - Cache invalidation for user progress data
 * - Triggering downstream notifications (e.g. badge unlocks, milestone alerts)
 *
 * Heavy async work (e.g. recalculating WPM, updating streaks) is delegated
 * to the BullMQ queue via ReadingSaga.
 */
@EventsHandler(ReadingProgressUpdatedEvent)
export class ReadingProgressUpdatedHandler
  implements IEventHandler<ReadingProgressUpdatedEvent>
{
  private readonly logger = new Logger(ReadingProgressUpdatedHandler.name);

  async handle(event: ReadingProgressUpdatedEvent): Promise<void> {
    this.logger.log(
      `[Event] ReadingProgressUpdated: user=${event.userId}, article=${event.articleId}, progress=${event.progress}%`
    );

    if (event.progress >= 100) {
      this.logger.log(
        `[Event] Article completed by user ${event.userId}. Completed at: ${event.completedAt?.toISOString() ?? 'N/A'}`
      );
      // TODO: Invalidate user progress cache
      // TODO: Trigger completion badge evaluation
      // TODO: Send push notification via notification service
    }

    // TODO: Update real-time analytics dashboard cache
    // TODO: Update daily reading activity tracker
  }
}

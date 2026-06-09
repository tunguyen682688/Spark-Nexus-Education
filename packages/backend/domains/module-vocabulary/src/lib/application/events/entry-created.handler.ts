import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { EntryCreatedEvent } from '../../domain/events/entry-created.event';

/**
 * EntryCreatedHandler
 *
 * Event Handler cho EntryCreatedEvent
 * Xử lý side effects khi entry mới được tạo (draft, needs approval)
 *
 * Responsibilities:
 * - Notify admin for approval
 * - Update analytics
 * - Send notification to user
 */
@EventsHandler(EntryCreatedEvent)
export class EntryCreatedHandler implements IEventHandler<EntryCreatedEvent> {
  private readonly logger = new Logger(EntryCreatedHandler.name);

  async handle(event: EntryCreatedEvent): Promise<void> {
    this.logger.log(
      `Entry created: ${event.entryId} (${event.word}) by user ${event.userId}`
    );

    if (event.needsApproval) {
      this.logger.log(
        `Entry ${event.entryId} needs approval before publishing to community`
      );

      // TODO: Implement approval workflow
      // - Queue approval request
      // - Notify admin
      // - Send notification to user
    }

    // TODO: Implement other side effects
    // - Update analytics
    // - Update user statistics
  }
}

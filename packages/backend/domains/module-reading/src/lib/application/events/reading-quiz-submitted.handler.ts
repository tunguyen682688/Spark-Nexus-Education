import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReadingQuizSubmittedEvent } from '../../domain/events/reading-quiz-submitted.event';

/**
 * ReadingQuizSubmittedHandler
 *
 * Application-layer Event Handler for ReadingQuizSubmittedEvent.
 * Handles immediate side effects after a quiz result is published to the EventBus.
 *
 * Responsibilities:
 * - Analytics tracking / logging quiz scores
 * - Cache invalidation for article quiz state
 * - Trigger mastery-level updates or achievement unlock evaluation
 *
 * Heavy async work (e.g. updating mastery indicators across CEFR levels) is delegated
 * to the BullMQ queue via ReadingSaga.
 */
@EventsHandler(ReadingQuizSubmittedEvent)
export class ReadingQuizSubmittedHandler
  implements IEventHandler<ReadingQuizSubmittedEvent>
{
  private readonly logger = new Logger(ReadingQuizSubmittedHandler.name);

  async handle(event: ReadingQuizSubmittedEvent): Promise<void> {
    this.logger.log(
      `[Event] ReadingQuizSubmitted: user=${event.userId}, article=${event.articleId}, score=${event.score}% (${event.correctCount}/${event.totalQuestions})`
    );

    if (event.score >= 80) {
      this.logger.log(
        `[Event] High quiz score (>= 80%) for user ${event.userId}. Eligible for mastery progression.`
      );
      // TODO: Trigger mastery level evaluation
      // TODO: Unlock achievement badge if applicable
    }

    // TODO: Invalidate article quiz result cache for user
    // TODO: Record score in user learning analytics
    // TODO: Send congratulatory notification if perfect score
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, mergeMap, map, catchError, EMPTY } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ReadingProgressUpdatedEvent } from '../events/reading-progress-updated.event';
import { ReadingQuizSubmittedEvent } from '../events/reading-quiz-submitted.event';

/**
 * ReadingSaga
 *
 * NestJS CQRS Saga implementation for the Reading context.
 * Listens to domain events and triggers asynchronous/background workflow actions.
 */
@Injectable()
export class ReadingSaga {
  private readonly logger = new Logger(ReadingSaga.name);

  constructor(
    @InjectQueue('reading-tasks')
    private readonly readingQueue: Queue
  ) {}

  /**
   * Saga: Handle ReadingProgressUpdatedEvent
   *
   * Triggers when user saves/updates progress.
   * If the article is completed (progress === 100), pushes a job to process completion analytics.
   */
  @Saga()
  readingProgressUpdated = (
    events$: Observable<ReadingProgressUpdatedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ReadingProgressUpdatedEvent),
      mergeMap(async (event: ReadingProgressUpdatedEvent) => {
        this.logger.log(
          `Saga: ReadingProgressUpdatedEvent received. User: ${event.userId}, Article: ${event.articleId}, Progress: ${event.progress}%`
        );

        if (event.progress === 100) {
          this.logger.log(
            `Article completed! Queuing background analytics for user ${event.userId}, article ${event.articleId}`
          );

          await this.readingQueue.add(
            'process-reading-completion',
            {
              userId: event.userId,
              articleId: event.articleId,
              timeSpent: event.timeSpent,
              completedAt: event.completedAt,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 2000,
              },
            }
          );
        }
      }),
      map(() => undefined),
      catchError((error) => {
        this.logger.error('Saga: Error in readingProgressUpdated handler', error);
        return EMPTY;
      })
    );
  };

  /**
   * Saga: Handle ReadingQuizSubmittedEvent
   *
   * Triggers when user submits a quiz.
   * Queues a background job to process result metrics and adjust mastery levels.
   */
  @Saga()
  readingQuizSubmitted = (
    events$: Observable<ReadingQuizSubmittedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ReadingQuizSubmittedEvent),
      mergeMap(async (event: ReadingQuizSubmittedEvent) => {
        this.logger.log(
          `Saga: ReadingQuizSubmittedEvent received. User: ${event.userId}, Article: ${event.articleId}, Score: ${event.score}%`
        );

        await this.readingQueue.add(
          'process-quiz-result',
          {
            userId: event.userId,
            articleId: event.articleId,
            score: event.score,
            correctCount: event.correctCount,
            totalQuestions: event.totalQuestions,
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
          }
        );
      }),
      map(() => undefined),
      catchError((error) => {
        this.logger.error('Saga: Error in readingQuizSubmitted handler', error);
        return EMPTY;
      })
    );
  };
}

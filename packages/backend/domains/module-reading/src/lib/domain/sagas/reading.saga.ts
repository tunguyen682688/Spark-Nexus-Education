import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, mergeMap, map, catchError, EMPTY } from 'rxjs';

import { ReadingProgressUpdatedEvent } from '../events/reading-progress-updated.event';
import { ReadingQuizSubmittedEvent } from '../events/reading-quiz-submitted.event';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

@Injectable()
export class ReadingSaga {
  private readonly logger = new Logger(ReadingSaga.name);

  constructor(private readonly bullMQ: BullMQService) {}

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
          await this.bullMQ.add(
            'reading-tasks',
            'process-reading-completion',
            {
              userId: event.userId,
              articleId: event.articleId,
              timeSpent: event.timeSpent,
              completedAt: event.completedAt,
            },
            { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
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

        await this.bullMQ.add(
          'reading-tasks',
          'process-quiz-result',
          {
            userId: event.userId,
            articleId: event.articleId,
            score: event.score,
            correctCount: event.correctCount,
            totalQuestions: event.totalQuestions,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
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

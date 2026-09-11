import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, mergeMap, map, catchError, EMPTY } from 'rxjs';
import { ExamSessionSubmittedEvent } from '../events/exam-session-submitted.event';
import { ExamSessionStartedEvent } from '../events/exam-session-started.event';
import { CertificationCacheService } from '../../infrastructure/cache/certification-cache.service';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

@Injectable()
export class CertificationSaga {
  private readonly logger = new Logger(CertificationSaga.name);

  constructor(
    private readonly bullMQ: BullMQService,
    private readonly cacheService: CertificationCacheService
  ) {}

  @Saga()
  sessionStarted = (
    events$: Observable<ExamSessionStartedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ExamSessionStartedEvent),
      mergeMap(async (event: ExamSessionStartedEvent) => {
        this.logger.log(
          `Saga: ExamSessionStartedEvent received for session ${event.sessionId}, user ${event.userId}`
        );

        const cacheKey = `certification:dashboard:${event.userId}`;
        await this.cacheService.delete(cacheKey);
        this.logger.log(`Saga: Invalidated cache key: ${cacheKey}`);
      }),
      map(() => undefined),
      catchError((error) => {
        this.logger.error('Saga: Error in sessionStarted handler', error);
        return EMPTY;
      })
    );
  };

  @Saga()
  sessionSubmitted = (
    events$: Observable<ExamSessionSubmittedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ExamSessionSubmittedEvent),
      mergeMap(async (event: ExamSessionSubmittedEvent) => {
        this.logger.log(
          `Saga: ExamSessionSubmittedEvent received for session ${event.sessionId}, user ${event.userId}`
        );

        await Promise.all([
          this.cacheService.delete(`certification:dashboard:${event.userId}`),
          this.cacheService.delete(`certification:study-plan:${event.userId}`),
        ]);

        // Queue scoring job
        await this.bullMQ.add('certification-tasks', 'calculate-exam-score', {
          sessionId: event.sessionId,
          examId: event.examId,
          userId: event.userId,
        });

        // Queue analytics job
        await this.bullMQ.add('certification-tasks', 'process-exam-analytics', {
          sessionId: event.sessionId,
          examId: event.examId,
          userId: event.userId,
          score: event.score,
          passed: event.passed,
          submittedAt: event.submittedAt,
        });
      }),
      map(() => undefined),
      catchError((error) => {
        this.logger.error('Saga: Error in sessionSubmitted handler', error);
        return EMPTY;
      })
    );
  };
}

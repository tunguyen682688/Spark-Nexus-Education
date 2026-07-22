import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, mergeMap, map, catchError, EMPTY } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExamSessionSubmittedEvent } from '../events/exam-session-submitted.event';
import { ExamSessionStartedEvent } from '../events/exam-session-started.event';
import { CertificationCacheService } from '../../infrastructure/cache/certification-cache.service';

@Injectable()
export class CertificationSaga {
  private readonly logger = new Logger(CertificationSaga.name);

  constructor(
    @InjectQueue('certification-tasks')
    private readonly certificationQueue: Queue,
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

        // Invalidate dashboard cache when a session starts
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

        // 1. Invalidate caches
        const dashboardCacheKey = `certification:dashboard:${event.userId}`;
        const studyPlanCacheKey = `certification:study-plan:${event.userId}`;
        
        await Promise.all([
          this.cacheService.delete(dashboardCacheKey),
          this.cacheService.delete(studyPlanCacheKey),
        ]);
        
        this.logger.log(`Saga: Invalidated cache keys: ${dashboardCacheKey}, ${studyPlanCacheKey}`);

        // 2. Queue background analytics/processing
        await this.certificationQueue.add(
          'process-exam-analytics',
          {
            sessionId: event.sessionId,
            examId: event.examId,
            userId: event.userId,
            score: event.score,
            passed: event.passed,
            submittedAt: event.submittedAt,
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
        this.logger.error('Saga: Error in sessionSubmitted handler', error);
        return EMPTY;
      })
    );
  };
}

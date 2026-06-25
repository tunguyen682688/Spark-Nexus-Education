import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, mergeMap, map, catchError, EMPTY } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { ListeningMaterialCreatedEvent } from '../events/listening-material-created.event';
import { ListeningProgressUpdatedEvent } from '../events/listening-progress-updated.event';

/**
 * ListeningSaga
 *
 * NestJS CQRS Saga implementation for the Listening context.
 * Listens to domain events and triggers background/asynchronous workflow actions.
 */
@Injectable()
export class ListeningSaga {
  private readonly logger = new Logger(ListeningSaga.name);

  constructor(
    @InjectQueue('listening-tasks')
    private readonly queue: Queue
  ) {}

  /**
   * Saga: Handle ListeningMaterialCreatedEvent
   *
   * Queues a background job to warm up caches when a new material is created.
   */
  @Saga()
  materialCreated = (
    events$: Observable<ListeningMaterialCreatedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ListeningMaterialCreatedEvent),
      mergeMap(async (event: ListeningMaterialCreatedEvent) => {
        this.logger.log(
          `Saga: ListeningMaterialCreatedEvent received for material ${event.materialId}`
        );

        await this.queue.add(
          'warm-material-cache',
          {
            materialId: event.materialId,
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
        this.logger.error('Saga: Error in materialCreated saga handler', error);
        return EMPTY;
      })
    );
  };

  /**
   * Saga: Handle ListeningProgressUpdatedEvent
   *
   * Queues a background job to perform stats aggregation and daily streak analysis
   * when a user updates progress or completes a listening material.
   */
  @Saga()
  progressUpdated = (
    events$: Observable<ListeningProgressUpdatedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ListeningProgressUpdatedEvent),
      mergeMap(async (event: ListeningProgressUpdatedEvent) => {
        this.logger.log(
          `Saga: ListeningProgressUpdatedEvent received for user ${event.userId}, material ${event.materialId}, progress: ${event.progress}%`
        );

        this.logger.log(
          `Queuing background stats aggregation for user ${event.userId}`
        );

        await this.queue.add(
          'aggregate-user-listening-stats',
          {
            userId: event.userId,
            materialId: event.materialId,
            timeSpent: event.timeSpent,
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
        this.logger.error('Saga: Error in progressUpdated saga handler', error);
        return EMPTY;
      })
    );
  };
}

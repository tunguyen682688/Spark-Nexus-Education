import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, mergeMap, map, catchError, EMPTY } from 'rxjs';

import { ListeningMaterialCreatedEvent } from '../events/listening-material-created.event';
import { ListeningProgressUpdatedEvent } from '../events/listening-progress-updated.event';
import { BullMQService } from '@spark-nest-ed/infrastructure-cache';

@Injectable()
export class ListeningSaga {
  private readonly logger = new Logger(ListeningSaga.name);

  constructor(private readonly bullMQ: BullMQService) {}

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

        await this.bullMQ.add(
          'listening-tasks',
          'warm-material-cache',
          { materialId: event.materialId },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
        );
      }),
      map(() => undefined),
      catchError((error) => {
        this.logger.error('Saga: Error in materialCreated saga handler', error);
        return EMPTY;
      })
    );
  };

  @Saga()
  progressUpdated = (
    events$: Observable<ListeningProgressUpdatedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(ListeningProgressUpdatedEvent),
      mergeMap(async (event: ListeningProgressUpdatedEvent) => {
        this.logger.log(
          `Saga: ListeningProgressUpdatedEvent received for user ${event.userId}, material ${event.materialId}`
        );

        await this.bullMQ.add(
          'listening-tasks',
          'aggregate-user-listening-stats',
          {
            userId: event.userId,
            materialId: event.materialId,
            timeSpent: event.timeSpent,
          },
          { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
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

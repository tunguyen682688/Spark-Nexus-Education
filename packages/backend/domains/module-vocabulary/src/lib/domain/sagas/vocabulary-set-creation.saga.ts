import { Injectable, Logger } from '@nestjs/common';
import { ofType, Saga } from '@nestjs/cqrs';
import { Observable, map, mergeMap, catchError, EMPTY } from 'rxjs';

import { VocabularySetCreatedEvent } from '../events/vocabulary-set-created.event';
import { EntryCreatedEvent } from '../events/entry-created.event';
import { EntryAddedToSetEvent } from '../events/entry-added-to-set.event';

/**
 * VocabularySetCreationSaga
 *
 * NestJS CQRS Saga implementation
 * Lắng nghe domain events và orchestrate complex workflows
 *
 * Saga Pattern theo NestJS CQRS:
 * - Sử dụng @Saga() decorator
 * - Observable stream lắng nghe events
 * - Có thể trigger commands mới
 * - Sử dụng RxJS operators
 *
 * Workflow:
 * 1. VocabularySetCreatedEvent → Queue background job (if large batch)
 * 2. EntryCreatedEvent → Notify admin for approval
 * 3. EntryAddedToSetEvent → Update analytics, notifications
 */
@Injectable()
export class VocabularySetCreationSaga {
  private readonly logger = new Logger(VocabularySetCreationSaga.name);

  constructor() {
    // empty constructor
  }

  /**
   * Saga: Handle VocabularySetCreatedEvent
   *
   * Nếu vocabulary set có nhiều words (>50), queue background job
   * Nếu không, các operations đã được xử lý synchronously
   */
  @Saga()
  vocabularySetCreated = (
    events$: Observable<VocabularySetCreatedEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(VocabularySetCreatedEvent),
      map((event: VocabularySetCreatedEvent) => {
        this.logger.log(
          `Saga: VocabularySetCreatedEvent received for set ${event.vocabularySetId}`
        );

        // Note: Background job queuing is handled in Handler
        // Saga here can handle additional side effects like:
        // - Analytics tracking
        // - Notification sending
        // - Cache invalidation

        // TODO: Implement side effects
        // - Update analytics
        // - Send notifications
        // - Invalidate cache

        return undefined;
      }),
      catchError((error) => {
        this.logger.error(
          'Saga: Error handling VocabularySetCreatedEvent',
          error
        );
        return EMPTY;
      })
    );
  };

  /**
   * Saga: Handle EntryCreatedEvent
   *
   * Khi entry mới được tạo (draft, needs approval):
   * - Notify admin for approval
   * - Update analytics
   * - Send notification to user
   */
  @Saga()
  entryCreated = (events$: Observable<EntryCreatedEvent>): Observable<void> => {
    return events$.pipe(
      ofType(EntryCreatedEvent),
      mergeMap((event: EntryCreatedEvent) => {
        this.logger.log(
          `Saga: EntryCreatedEvent received for entry ${event.entryId} (${event.word})`
        );

        if (event.needsApproval) {
          this.logger.log(
            `Entry ${event.entryId} needs approval before publishing to community`
          );

          // TODO: Trigger approval workflow command
          // return this.commandBus.execute(new RequestEntryApprovalCommand(...));
        }

        return EMPTY;
      }),
      catchError((error) => {
        this.logger.error('Saga: Error handling EntryCreatedEvent', error);
        return EMPTY;
      })
    );
  };

  /**
   * Saga: Handle EntryAddedToSetEvent
   *
   * Khi entry được thêm vào vocabulary set:
   * - Update analytics
   * - Update user statistics
   * - Send notifications
   */
  @Saga()
  entryAddedToSet = (
    events$: Observable<EntryAddedToSetEvent>
  ): Observable<void> => {
    return events$.pipe(
      ofType(EntryAddedToSetEvent),
      mergeMap((event: EntryAddedToSetEvent) => {
        this.logger.log(
          `Saga: EntryAddedToSetEvent received - Entry ${event.entryId} added to set ${event.vocabularySetId}`
        );

        // TODO: Trigger analytics update command
        // await this.commandBus.execute(new UpdateVocabularySetAnalyticsCommand(...));

        return EMPTY;
      }),
      catchError((error) => {
        this.logger.error('Saga: Error handling EntryAddedToSetEvent', error);
        return EMPTY;
      })
    );
  };
}

import { Entity } from './entity.base.js';
import { DomainEvent } from './domain-event.base.js';

/**
 * AggregateRoot base class
 *
 * An Aggregate Root is an Entity that serves as the entry point to an Aggregate.
 * It ensures consistency boundaries and manages domain events.
 *
 * Following DDD (Domain-Driven Design) principles:
 * - Only Aggregate Roots can be loaded from repositories
 * - Aggregate Roots are responsible for maintaining consistency within their aggregate
 * - Domain events are raised by Aggregate Roots to communicate changes
 *
 * @template TId - Type of the aggregate identifier
 */
export abstract class AggregateRoot<TId = string> extends Entity<TId> {
  private readonly _domainEvents: DomainEvent[] = [];

  /**
   * Get all uncommitted domain events
   */
  public getDomainEvents(): readonly DomainEvent[] {
    return Object.freeze([...this._domainEvents]);
  }

  /**
   * Add a domain event to the aggregate
   * Events will be published after the aggregate is persisted
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  /**
   * Clear all domain events after they have been published
   */
  public clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }

  /**
   * Check if there are uncommitted domain events
   */
  public hasDomainEvents(): boolean {
    return this._domainEvents.length > 0;
  }

  /**
   * Mark the aggregate as updated and increment version
   * This should be called whenever the aggregate state changes
   */
  protected override markAsUpdated(): void {
    super.markAsUpdated();
    this.incrementVersion();
  }
}

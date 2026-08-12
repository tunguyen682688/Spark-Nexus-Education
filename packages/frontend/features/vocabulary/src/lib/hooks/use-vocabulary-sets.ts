/**
 * Vocabulary hooks – enterprise-ready Create Vocabulary Set hook.
 *
 * Key characteristics:
 * - Query Key factory for consistent cache operations
 * - JSON:API aware mutation response handling
 * - Optimistic update with rollback safety
 * - Automatic cache invalidation for related queries
 */

export * from './use-vocabulary-queries';
export * from './use-vocabulary-mutations';

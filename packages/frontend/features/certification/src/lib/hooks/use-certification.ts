/**
 * Barrel re-export — tất cả React Query hooks được tách theo domain.
 * File này giữ nguyên để backward compat: tất cả import hiện tại vẫn hoạt động.
 */
export { STALE_TIME_DASHBOARD, STALE_TIME_COLLECTIONS, STALE_TIME_STATIC_EXAM, STALE_TIME_SESSION } from './queries/use-query-constants';

export * from './queries/use-dashboard-queries';
export * from './queries/use-collection-queries';
export * from './queries/use-collection-mutations';
export * from './queries/use-collection-review-hooks';
export * from './queries/use-exam-hooks';
export * from './queries/use-question-hooks';
export * from './queries/use-session-hooks';
export * from './queries/use-user-data-queries';
export * from './queries/use-user-data-mutations';

/**
 * Barrel re-export — tất cả React Query hooks được tách theo domain.
 * File này giữ nguyên để backward compat: tất cả import hiện tại vẫn hoạt động.
 */
export { STALE_TIME_DASHBOARD, STALE_TIME_COLLECTIONS, STALE_TIME_STATIC_EXAM, STALE_TIME_SECTION_QUESTIONS, STALE_TIME_SESSION } from '../constants/query-cache-times.constants';

export * from './queries/use-dashboard-queries';
export * from './queries/use-collection-queries';
export * from './queries/use-collection-mutations';
export * from './queries/use-collection-review-hooks';
export * from './queries/use-exam-queries';
export * from './queries/use-exam-mutations';
export * from './queries/use-section-mutations';
export * from './queries/use-exam-link-mutations';
export * from './queries/use-chapter-sync-mutations';
export * from './queries/use-question-hooks';
export * from './queries/use-session-hooks';
export * from './queries/use-user-data-queries';
export * from './queries/use-user-data-mutations';

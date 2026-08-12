// Standardized Query Cache Time Constants
export const STALE_TIME_DASHBOARD = 5 * 60 * 1000; // 5 minutes cache
export const STALE_TIME_COLLECTIONS = 10 * 60 * 1000; // 10 minutes cache
export const STALE_TIME_STATIC_EXAM = 15 * 60 * 1000; // 15 minutes cache
export const STALE_TIME_SECTION_QUESTIONS = 2 * 60 * 1000; // 2 minutes cache for section questions (frequent changes)
export const STALE_TIME_SESSION = 30 * 1000; // 30 seconds cache for active sessions

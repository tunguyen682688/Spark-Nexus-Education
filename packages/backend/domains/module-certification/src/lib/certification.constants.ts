/**
 * Certification module constants.
 * Centralizes magic numbers that were previously scattered across handlers and repositories.
 */

// ── Transaction Timeouts (ms) ──
/** Default transaction: long-running operations (clone, batch init) */
export const TX_TIMEOUT_DEFAULT = { maxWait: 60_000, timeout: 120_000 } as const;

/** Medium transaction: patch operations with moderate data volume */
export const TX_TIMEOUT_MEDIUM = { maxWait: 30_000, timeout: 60_000 } as const;

/** Short transaction: simple upserts (choices, single records) */
export const TX_TIMEOUT_SHORT = { maxWait: 10_000, timeout: 30_000 } as const;

// ── Query Limits ──
/** Maximum items fetched for creator dashboard overview */
export const CREATOR_DASHBOARD_LIMIT = 200;

/** Maximum flashcard items per study session */
export const FLASHCARD_SESSION_LIMIT = 1000;

/** Leaderboard page size */
export const LEADERBOARD_LIMIT = 50;

/** Weak words fetch limit */
export const WEAK_WORDS_LIMIT = 50;

// ── JWT / Auth ──
/** Timeout for Auth0 userinfo HTTP call (ms) */
export const AUTH0_USERINFO_TIMEOUT = 3_000;

// ── Fallback URLs ──
/** DiceBear avatar fallback URL pattern */
export const DICEBEAR_AVATAR_URL = 'https://api.dicebear.com/7.x/adventurer/svg';

/** DiceBear identicon fallback URL pattern (for comments) */
export const DICEBEAR_IDENTICON_URL = 'https://api.dicebear.com/7.x/identicon/svg';

/**
 * Các hằng số sử dụng trong module Grammar.
 * Giúp tránh hard-coded values và magic numbers.
 */

/** Level CEFR chuẩn */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/** Tên hiển thị cho các level CEFR */
export const CEFR_LEVEL_NAMES: Record<string, { name: string; subName: string }> = {
  A1: { name: 'Sơ cấp: Nền móng Cấu trúc', subName: 'FOUNDATION & BASIC STRUCTURES' },
  A2: { name: 'Tiền trung cấp: Mở rộng bối cảnh', subName: 'PRE-INTERMEDIATE EXPANSION' },
  B1: { name: 'Trung cấp: Giao tiếp tự tin', subName: 'INTERMEDIATE COMMUNICATION' },
  B2: { name: 'Trung cao cấp: Làm chủ ngữ pháp', subName: 'UPPER-INTERMEDIATE MASTERY' },
  C1: { name: 'Cao cấp: Học thuật chuyên sâu', subName: 'ADVANCED SCHOLARLY ENGLISH' },
  C2: { name: 'Thành thạo: Bản xứ chuyên nghiệp', subName: 'PROFICIENT FLUENCY' },
};

/** Phân loại kỹ năng ngữ pháp */
export const SKILL_CATEGORIES = [
  { name: 'Syntax (Cú pháp)', tags: ['CONDITIONALS', 'CLAUSES', 'STRUCTURE', 'SENTENCES'] },
  { name: 'Tense & Aspect (Thì)', tags: ['TENSES', 'VERBS', 'ASPECT', 'PRESENT', 'PAST', 'FUTURE'] },
  { name: 'Modality (Sắc thái)', tags: ['MODALS', 'SUBJUNCTIVE', 'EMPHASIS', 'ADVERBS'] },
  { name: 'Morphology (Hình thái)', tags: ['NOUNS', 'PRONOUNS', 'ADJECTIVES', 'PASSIVE', 'ADVANCED', 'GERUNDS', 'INFINITIVES'] },
] as const;

/** Map từ tag bài học sang category bẫy */
export const TAG_TO_CATEGORY_MAP: Record<string, string> = {
  ...Object.fromEntries(SKILL_CATEGORIES[0].tags.map(tag => [tag, 'syntax'])),
  ...Object.fromEntries(SKILL_CATEGORIES[1].tags.map(tag => [tag, 'tenses'])),
  ...Object.fromEntries(SKILL_CATEGORIES[2].tags.map(tag => [tag, 'modality'])),
  ...Object.fromEntries(SKILL_CATEGORIES[3].tags.map(tag => [tag, 'morphology'])),
};

/** Loại block hợp lệ trong bài học */
export const VALID_BLOCK_TYPES = ['text', 'formula', 'example', 'quiz', 'media', 'callout'] as const;

/** Trạng thái bài học */
export const LESSON_STATUS = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

/** Trạng thái tiến độ học */
export const PROGRESS_STATUS = ['LOCKED', 'IN_PROGRESS', 'MASTERED'] as const;

/** Trạng thái bẫy lỗi sai */
export const TRAP_STATUS = ['TRAPPED', 'ANALYZING', 'BROKEN'] as const;

/** Điểm XP thưởng khi hoàn thành bài học */
export const XP_REWARDS = {
  LESSON_COMPLETED: 50,
  DAILY_QUIZ_COMPLETED: 10,
  EXAM_PASSED: 100,
} as const;

/** Giới hạn phân trang mặc định */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

/** Thời gian streak (giờ) */
export const STREAK_THRESHOLDS = {
  MIN_GAP_HOURS: 12,
  RESET_GAP_HOURS: 36,
} as const;

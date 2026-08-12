export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SEARCH_KEYWORD = '';

// ===== STANDARDIZED CERTIFICATION UI CONSTANTS & FILTER OPTIONS =====

export const COMMUNITY_SORT_FILTERS = [
  'All Collections',
  'Trending',
  'Most Cloned',
  'Top Rated',
] as const;

export const EXAM_CATEGORY_OPTIONS = [
  'All Exams',
  'IELTS',
  'TOEIC',
  'Cambridge',
] as const;

export const EXAM_LIBRARY_CATEGORIES = [
  'All',
  'IELTS',
  'TOEIC',
  'TOEFL',
  'Cambridge',
  'VSTEP',
  'SAT',
] as const;

export const OFFICIAL_EXAM_CATEGORIES = [
  'All Exams',
  'IELTS',
  'TOEIC',
  'TOEFL',
  'Cambridge',
  'VSTEP',
] as const;

export const EDITORIAL_LEVEL_FILTERS = [
  'All Picks',
  'Intermediate',
  'Advanced',
  'Upper-Intermediate',
] as const;

export const DIFFICULTY_LEVEL_OPTIONS = [
  'All Levels',
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

export const POPULAR_EXAM_BADGES: Array<{
  type: string;
  badge: string;
  badgeType: 'default' | 'destructive' | 'secondary' | 'outline';
}> = [
  { type: 'TOEIC', badge: 'Most Popular', badgeType: 'default' },
  { type: 'IELTS', badge: 'High Demand', badgeType: 'destructive' },
  { type: 'TOEFL', badge: 'Updated 2025', badgeType: 'secondary' },
  { type: 'Cambridge', badge: 'B2 - C1', badgeType: 'outline' },
  { type: 'VSTEP', badge: 'B1 - C1', badgeType: 'secondary' },
  { type: 'SAT', badge: 'Math & Verbal', badgeType: 'outline' },
];

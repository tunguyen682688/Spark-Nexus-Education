export const ICON_BG_CLASSES = [
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
  'bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
];

export const CATEGORY_BADGE_MAP: Array<{ keywords: string[]; category: string; badge: string; badgeClass: string }> = [
  { keywords: ['TOEIC'], category: 'Full Test', badge: 'TOEIC', badgeClass: 'bg-blue-600 text-white' },
  { keywords: ['IELTS'], category: 'Full Test', badge: 'IELTS', badgeClass: 'bg-indigo-600 text-white' },
  { keywords: ['READING', 'READ'], category: 'Reading', badge: 'READING', badgeClass: 'bg-teal-600 text-white' },
  { keywords: ['LISTENING', 'LISTEN'], category: 'Listening', badge: 'LISTENING', badgeClass: 'bg-indigo-600 text-white' },
  { keywords: ['GRAMMAR'], category: 'Grammar', badge: 'GRAMMAR', badgeClass: 'bg-emerald-600 text-white' },
  { keywords: ['VOCAB'], category: 'Vocabulary', badge: 'VOCAB', badgeClass: 'bg-rose-600 text-white' },
];

export const FALLBACK_BADGE = { category: 'General', badge: 'OTHER', badgeClass: 'bg-gray-600 text-white' };

export function getCategoryBadge(title: string) {
  const upper = title.toUpperCase();
  return CATEGORY_BADGE_MAP.find((entry) => entry.keywords.some((kw) => upper.includes(kw))) ?? FALLBACK_BADGE;
}

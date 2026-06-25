import type { Article } from '../types';
import type { ParsedContent } from './reader-parser';

export type ReaderContentKind =
  | 'book'
  | 'story'
  | 'news'
  | 'report'
  | 'academic'
  | 'blog'
  | 'article';

export interface ReaderContentProfile {
  kind: ReaderContentKind;
  label: string;
  noun: string;
  summaryTitle: string;
  summaryFallback: string;
  tocTitle: string;
  sectionLabel: string;
  currentLabel: string;
  completedLabel: string;
  startLabel: string;
  continueLabel: string;
  restartLabel: string;
  backLabel: string;
  sourceLabel: string;
  readingRate: number;
  overviewFirst: boolean;
  accent: {
    text: string;
    bg: string;
    border: string;
    badge: string;
    button: string;
    buttonHover: string;
  };
}

const DEFAULT_ACCENT = {
  text: 'text-blue-600 dark:text-blue-400',
  bg: 'bg-blue-50 dark:bg-blue-950/30',
  border: 'border-blue-100 dark:border-blue-900/50',
  badge: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900/50',
  button: 'bg-blue-600 text-white',
  buttonHover: 'hover:bg-blue-700',
};

const PROFILES: Record<ReaderContentKind, Omit<ReaderContentProfile, 'kind'>> = {
  book: {
    label: 'Book',
    noun: 'book',
    summaryTitle: 'Book overview',
    summaryFallback: 'This book does not have an overview yet. Start reading to explore the content.',
    tocTitle: 'Chapters',
    sectionLabel: 'Chapter',
    currentLabel: 'Reading',
    completedLabel: 'Read',
    startLabel: 'Start book',
    continueLabel: 'Continue reading',
    restartLabel: 'Read from start',
    backLabel: 'Back to book overview',
    sourceLabel: 'Library',
    readingRate: 210,
    overviewFirst: true,
    accent: DEFAULT_ACCENT,
  },
  story: {
    label: 'Story',
    noun: 'story',
    summaryTitle: 'Story overview',
    summaryFallback: 'This story does not have a synopsis yet. Start reading to discover the plot.',
    tocTitle: 'Story parts',
    sectionLabel: 'Part',
    currentLabel: 'Reading',
    completedLabel: 'Read',
    startLabel: 'Start story',
    continueLabel: 'Continue story',
    restartLabel: 'Read from start',
    backLabel: 'Back to story overview',
    sourceLabel: 'Stories',
    readingRate: 220,
    overviewFirst: true,
    accent: {
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-100 dark:border-rose-900/50',
      badge: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-900/50',
      button: 'bg-rose-600 text-white',
      buttonHover: 'hover:bg-rose-700',
    },
  },
  news: {
    label: 'News',
    noun: 'news article',
    summaryTitle: 'News brief',
    summaryFallback: 'This news item does not have a brief yet.',
    tocTitle: 'In this news',
    sectionLabel: 'Section',
    currentLabel: 'Reading',
    completedLabel: 'Read',
    startLabel: 'Read news',
    continueLabel: 'Continue news',
    restartLabel: 'Read again',
    backLabel: 'Back to news brief',
    sourceLabel: 'News',
    readingRate: 230,
    overviewFirst: false,
    accent: {
      text: 'text-cyan-700 dark:text-cyan-300',
      bg: 'bg-cyan-50 dark:bg-cyan-950/30',
      border: 'border-cyan-100 dark:border-cyan-900/50',
      badge: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-800 dark:text-cyan-300 border-cyan-100 dark:border-cyan-900/50',
      button: 'bg-cyan-700 text-white',
      buttonHover: 'hover:bg-cyan-800',
    },
  },
  report: {
    label: 'Report',
    noun: 'report',
    summaryTitle: 'Executive summary',
    summaryFallback: 'This report does not have an executive summary yet.',
    tocTitle: 'Report sections',
    sectionLabel: 'Section',
    currentLabel: 'Reading',
    completedLabel: 'Reviewed',
    startLabel: 'Start report',
    continueLabel: 'Continue report',
    restartLabel: 'Review from start',
    backLabel: 'Back to report overview',
    sourceLabel: 'Reports',
    readingRate: 165,
    overviewFirst: true,
    accent: {
      text: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      badge: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/50',
      button: 'bg-emerald-700 text-white',
      buttonHover: 'hover:bg-emerald-800',
    },
  },
  academic: {
    label: 'Academic',
    noun: 'academic text',
    summaryTitle: 'Research overview',
    summaryFallback: 'This academic text does not have a research overview yet.',
    tocTitle: 'Academic sections',
    sectionLabel: 'Section',
    currentLabel: 'Reading',
    completedLabel: 'Reviewed',
    startLabel: 'Start reading',
    continueLabel: 'Continue study',
    restartLabel: 'Study from start',
    backLabel: 'Back to overview',
    sourceLabel: 'Academic',
    readingRate: 160,
    overviewFirst: true,
    accent: {
      text: 'text-violet-700 dark:text-violet-300',
      bg: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-100 dark:border-violet-900/50',
      badge: 'bg-violet-50 dark:bg-violet-950/30 text-violet-800 dark:text-violet-300 border-violet-100 dark:border-violet-900/50',
      button: 'bg-violet-700 text-white',
      buttonHover: 'hover:bg-violet-800',
    },
  },
  blog: {
    label: 'Blog',
    noun: 'blog post',
    summaryTitle: 'Post summary',
    summaryFallback: 'This post does not have a summary yet.',
    tocTitle: 'Post sections',
    sectionLabel: 'Section',
    currentLabel: 'Reading',
    completedLabel: 'Read',
    startLabel: 'Read post',
    continueLabel: 'Continue post',
    restartLabel: 'Read again',
    backLabel: 'Back to post summary',
    sourceLabel: 'Blog',
    readingRate: 220,
    overviewFirst: false,
    accent: DEFAULT_ACCENT,
  },
  article: {
    label: 'Article',
    noun: 'article',
    summaryTitle: 'Article summary',
    summaryFallback: 'This article does not have a summary yet.',
    tocTitle: 'Article sections',
    sectionLabel: 'Section',
    currentLabel: 'Reading',
    completedLabel: 'Read',
    startLabel: 'Start reading',
    continueLabel: 'Continue reading',
    restartLabel: 'Read again',
    backLabel: 'Back to article summary',
    sourceLabel: 'Reading Hub',
    readingRate: 200,
    overviewFirst: false,
    accent: DEFAULT_ACCENT,
  },
};

const STORY_KEYWORDS = ['story', 'stories', 'fiction', 'novel', 'truyen'];
const REPORT_KEYWORDS = ['report', 'bao-cao', 'baocao', 'research-report', 'whitepaper'];
const ACADEMIC_KEYWORDS = ['academic', 'research', 'paper', 'journal', 'study'];

const hasKeyword = (values: string[], keywords: string[]): boolean =>
  values.some((value) => keywords.some((keyword) => value.includes(keyword)));

export const getReaderContentProfile = (
  article: Article,
  parsed: ParsedContent
): ReaderContentProfile => {
  const values = [
    article.category,
    article.contentType || '',
    article.title,
    ...(article.tags || []),
  ].map((value) => value.toLowerCase().trim());

  let kind: ReaderContentKind = 'article';

  if (parsed.isBook || hasKeyword(values, ['book'])) {
    kind = hasKeyword(values, STORY_KEYWORDS) ? 'story' : 'book';
  } else if (hasKeyword(values, STORY_KEYWORDS)) {
    kind = 'story';
  } else if (hasKeyword(values, REPORT_KEYWORDS)) {
    kind = 'report';
  } else if (hasKeyword(values, ACADEMIC_KEYWORDS)) {
    kind = 'academic';
  } else if (hasKeyword(values, ['news', 'tin-tuc', 'tintuc'])) {
    kind = 'news';
  } else if (hasKeyword(values, ['blog'])) {
    kind = 'blog';
  }

  return {
    kind,
    ...PROFILES[kind],
    overviewFirst:
      PROFILES[kind].overviewFirst ||
      Boolean(parsed.isBook && parsed.chapters && parsed.chapters.length > 1),
  };
};

export const formatReaderDate = (value: string | null | undefined): string => {
  if (!value) return 'Draft';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Draft';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const estimateReadingMinutes = (
  wordCount: number,
  wordsPerMinute: number
): number => Math.max(1, Math.ceil((wordCount || 1) / wordsPerMinute));

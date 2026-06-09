import type { VocabularySet, VocabularySetItem } from '../types';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';

export interface MasteryLevelData {
  level: string;
  count: number;
}

export interface LearningStats {
  learnedCount: number;
  totalCount: number;
  masteryLevelData: MasteryLevelData[];
}

/**
 * Calculate learning statistics for a vocabulary set
 * @param vocabularySet - The vocabulary set data
 * @param wordsData - Array of words in the set
 * @returns Learning statistics including learned count, total count, and mastery level distribution
 */
export function calculateLearningStats(
  vocabularySet: VocabularySet | null | undefined,
  wordsData: VocabularySetItem[] | null | undefined
): LearningStats {
  if (!vocabularySet || !wordsData) {
    return {
      learnedCount: 0,
      totalCount: 0,
      masteryLevelData: [
        { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_1, count: 0 },
        { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_2, count: 0 },
        { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_3, count: 0 },
        { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_4, count: 0 },
        { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LONG_TERM, count: 0 },
      ],
    };
  }

  const words = wordsData ?? [];
  const totalCount = words.length > 0 ? words.length : (vocabularySet.entryCount || 0);

  let learnedCount = 0;
  let lvl1 = 0;
  let lvl2 = 0;
  let lvl3 = 0;
  let lvl4 = 0;
  let lvl5 = 0;

  for (const w of words) {
    const progress = (w as any)?.userProgress;
    if (progress && progress.status !== 'NEW' && progress.repetitions > 0) {
      learnedCount++;
      const reps = progress.repetitions;
      if (reps === 1) lvl1++;
      else if (reps === 2) lvl2++;
      else if (reps === 3) lvl3++;
      else if (reps === 4) lvl4++;
      else if (reps >= 5) lvl5++;
    }
  }

  const masteryLevelData: MasteryLevelData[] = [
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_1, count: lvl1 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_2, count: lvl2 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_3, count: lvl3 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_4, count: lvl4 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LONG_TERM, count: lvl5 },
  ];

  return {
    learnedCount,
    totalCount,
    masteryLevelData,
  };
}

export function calculateMasteryLevelDistribution(
  wordsData: VocabularySetItem[]
): MasteryLevelData[] {
  let lvl1 = 0;
  let lvl2 = 0;
  let lvl3 = 0;
  let lvl4 = 0;
  let lvl5 = 0;

  for (const w of wordsData) {
    const progress = (w as any)?.userProgress;
    if (progress && progress.status !== 'NEW' && progress.repetitions > 0) {
      const reps = progress.repetitions;
      if (reps === 1) lvl1++;
      else if (reps === 2) lvl2++;
      else if (reps === 3) lvl3++;
      else if (reps === 4) lvl4++;
      else if (reps >= 5) lvl5++;
    }
  }

  return [
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_1, count: lvl1 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_2, count: lvl2 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_3, count: lvl3 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LEVEL_4, count: lvl4 },
    { level: VOCABULARY_UI_TEXT.STATS_LEVELS.LONG_TERM, count: lvl5 },
  ];
}

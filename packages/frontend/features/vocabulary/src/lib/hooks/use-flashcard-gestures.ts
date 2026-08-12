import type { FlashcardSessionResponse, FlashcardWord } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface FlashcardStats {
  newCount: number;
  learningCount: number;
  masteredCount: number;
  accuracyRate: number;
  avgResponseTime: number;
}

export interface FlashcardStatsDashboard {
  total: number;
  mastered: number;
  learning: number;
  newCount: number;
  difficultCount: number;
}

export interface SrsUpdateResult {
  status: string;
  streak: number;
  masteryLevel: number;
  repetitions: number;
  interval: number;
  easeFactor: number;
}

// =============================================================================
// Pure Functions
// =============================================================================

/**
 * Compute live vocabulary dashboard statistics from session data.
 */
export function computeStatsDashboard(
  sessionData: FlashcardSessionResponse | undefined
): FlashcardStatsDashboard {
  if (!sessionData?.words) {
    return { total: 0, mastered: 0, learning: 0, newCount: 0, difficultCount: 0 };
  }

  const total = sessionData.words.length;
  let mastered = 0;
  let learning = 0;
  let newCount = 0;
  let difficultCount = 0;

  sessionData.words.forEach((w) => {
    const status = w.progress?.status;
    if (status === 'MASTERED') {
      mastered++;
    } else if (status === 'LEARNING') {
      learning++;
      difficultCount++;
    } else {
      newCount++;
    }
  });

  return { total, mastered, learning, newCount, difficultCount };
}

/**
 * Calculate SM-2 SRS update for a flashcard grade.
 */
export function calculateSrsUpdate(
  quality: number,
  currentProgress: {
    easeFactor?: number;
    interval?: number;
    repetitions?: number;
    streak?: number;
  } | null
): SrsUpdateResult {
  const currentEaseFactor = currentProgress?.easeFactor ?? 2.5;
  const currentInterval = currentProgress?.interval ?? 0;
  const currentRepetitions = currentProgress?.repetitions ?? 0;

  const newRepetitions = quality < 3 ? 0 : currentRepetitions + 1;
  let newInterval = 1;
  if (quality >= 3) {
    if (newRepetitions === 1) newInterval = 1;
    else if (newRepetitions === 2) newInterval = 6;
    else newInterval = Math.round(currentInterval * currentEaseFactor);
  }
  const newEaseFactor = Math.max(
    1.3,
    currentEaseFactor +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  const nextStatus =
    newRepetitions >= 5 ? 'MASTERED' : newRepetitions > 0 ? 'LEARNING' : 'NEW';
  const nextMastery = Math.max(
    0.0,
    Math.min(1.0, newRepetitions * 0.2 + (newEaseFactor - 2.0) * 0.1)
  );

  return {
    status: nextStatus,
    streak: quality >= 3 ? (currentProgress?.streak ?? 0) + 1 : 0,
    masteryLevel: nextMastery,
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: newEaseFactor,
  };
}

/**
 * Convert session words to FlashcardWord format.
 */
export function mapSessionToFlashcardWords(
  words: FlashcardSessionResponse['words']
): FlashcardWord[] {
  return words.map((word) => ({
    item: word.item,
    progress: word.progress
      ? {
          id: word.progress.id,
          status: word.progress.status,
          streak: word.progress.streak,
          masteryLevel: word.progress.masteryLevel,
          repetitions: word.progress.repetitions,
          interval: word.progress.interval,
          easeFactor: word.progress.easeFactor,
        }
      : null,
  }));
}

/**
 * Filter cards by study mode.
 */
export function filterCardsByMode(
  cards: FlashcardWord[],
  mode: 'all' | 'difficult' | 'new'
): FlashcardWord[] {
  if (mode === 'difficult') {
    return cards.filter((c) => c.progress && c.progress.status === 'LEARNING');
  } else if (mode === 'new') {
    return cards.filter((c) => !c.progress || c.progress.status === 'NEW');
  }
  return cards;
}

/**
 * Compute elapsed time string from seconds (MM:SS).
 */
export function formatElapsedTime(elapsedSeconds: number): string {
  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Compute average response time from an array of response times.
 */
export function computeAvgResponseTime(responseTimes: number[]): number {
  if (responseTimes.length === 0) return 0;
  const sum = responseTimes.reduce((acc, t) => acc + t, 0);
  return parseFloat((sum / responseTimes.length).toFixed(1));
}

/**
 * Compute remaining time estimate string.
 */
export function computeRemainingTime(
  totalCards: number,
  currentIndex: number,
  avgResponseTime: number
): string {
  const totalRemainingCards = totalCards - (currentIndex + 1);
  if (totalRemainingCards <= 0) return '00:00';

  const factor = avgResponseTime > 0 ? avgResponseTime : 5;
  const estRemainingSeconds = Math.round(totalRemainingCards * factor);

  const mins = Math.floor(estRemainingSeconds / 60);
  const secs = estRemainingSeconds % 60;
  return `~${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Compute dynamic session statistics.
 */
export function computeSessionStats(
  originalCards: FlashcardWord[],
  sessionGrades: { [itemId: string]: number },
  avgResponseTime: number
): FlashcardStats {
  const uniqueCards: FlashcardWord[] = [];
  const seenIds = new Set<string>();
  originalCards.forEach((card) => {
    if (!seenIds.has(card.item.id)) {
      seenIds.add(card.item.id);
      uniqueCards.push(card);
    }
  });

  let newCount = 0;
  let learningCount = 0;
  let masteredCount = 0;

  uniqueCards.forEach((card) => {
    const prog = card.progress;
    if (!prog || prog.status === 'NEW') {
      newCount++;
    } else if (prog.status === 'LEARNING') {
      learningCount++;
    } else if (prog.status === 'MASTERED') {
      masteredCount++;
    }
  });

  const gradeValues = Object.values(sessionGrades);
  let accuracyRate = 100;
  if (gradeValues.length > 0) {
    const goodGrades = gradeValues.filter((g) => g >= 4).length;
    accuracyRate = Math.round((goodGrades / gradeValues.length) * 100);
  }

  return {
    newCount,
    learningCount,
    masteredCount,
    accuracyRate,
    avgResponseTime,
  };
}

/**
 * Read auto-play audio setting from localStorage.
 */
export function readAutoPlaySetting(): boolean {
  const saved = localStorage.getItem('spark_vocab_autoplay');
  return saved !== null ? saved === 'true' : true;
}

/**
 * Read auto-show hint setting from localStorage.
 */
export function readAutoShowHintSetting(): boolean {
  const saved = localStorage.getItem('spark_vocab_autoshowhint');
  return saved !== null ? saved === 'true' : false;
}

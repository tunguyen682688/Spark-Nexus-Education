import type { QuizWord, LearningQuizQuestion, FlashcardSessionResponse } from '../types';

// =============================================================================
// Types
// =============================================================================

export interface QuizQuestionGenerationOptions {
  cards: QuizWord[];
  allCardsPool?: QuizWord[];
}

export interface QuizStatsDashboard {
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
 * Fisher-Yates Shuffle utility.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate quiz questions with smart distractor choices.
 */
export function generateQuestions(
  cards: QuizWord[],
  allCardsPool: QuizWord[] = cards
): LearningQuizQuestion[] {
  if (cards.length === 0) return [];

  return cards.map((card, index) => {
    const correctWord =
      card.item.customWord ||
      card.item.wordMinimum?.word ||
      card.item.wordDetails?.word ||
      '';
    const promptDefinition =
      card.item.customDefinition ||
      card.item.wordMinimum?.definition ||
      card.item.wordDetails?.definition ||
      '';

    const otherWordsPool = allCardsPool
      .map(
        (c) =>
          c.item.customWord ||
          c.item.wordMinimum?.word ||
          c.item.wordDetails?.word ||
          ''
      )
      .filter((w) => w !== '' && w !== correctWord);

    const uniquePool = Array.from(new Set(otherWordsPool));
    const shuffledPool = shuffleArray(uniquePool);
    const distractors = shuffledPool.slice(0, Math.min(3, shuffledPool.length));

    const rawOptions = [correctWord, ...distractors];
    const shuffledOptions = shuffleArray(rawOptions);
    const correctIndex = shuffledOptions.indexOf(correctWord);

    return {
      questionIndex: index,
      card,
      question: promptDefinition,
      options: shuffledOptions,
      correctIndex,
    };
  });
}

/**
 * Compute live vocabulary dashboard statistics from session data.
 */
export function computeStatsDashboard(
  sessionData: FlashcardSessionResponse | undefined
): QuizStatsDashboard {
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
 * Calculate SM-2 SRS update for a quiz answer.
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
 * Convert session words to QuizWord format.
 */
export function mapSessionToQuizWords(
  words: FlashcardSessionResponse['words']
): QuizWord[] {
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
  cards: QuizWord[],
  mode: 'all' | 'difficult' | 'new'
): QuizWord[] {
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
 * Read auto-play audio setting from localStorage.
 */
export function readAutoPlaySetting(): boolean {
  const saved = localStorage.getItem('spark_vocab_quiz_autoplay');
  return saved !== null ? saved === 'true' : true;
}

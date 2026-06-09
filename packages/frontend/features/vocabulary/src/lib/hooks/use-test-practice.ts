/**
 * useTestPractice – Advanced Exam Mode Hook
 *
 * Manages state and logic for the Advanced Test Practice feature:
 * - Generates a mixed question bank from vocabulary words (MCQ, fill-blank, matching)
 * - Runs a countdown exam timer (optional time limit)
 * - Tracks user answers and calculates scores per question type
 * - Provides restart capability for wrong answers
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { VOCABULARY_UI_TEXT } from '../constants/vocabulary-ui-text';
import type {
  QuizWord,
  TestQuestion,
  TestQuestionType,
  TestSessionAnswer,
  TestSessionConfig,
  TestCompletionStats,
} from '../types';

// ============================================================================
// Internal helpers
// ============================================================================

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWord(card: QuizWord): string {
  return card.item.customWord || card.item.wordMinimum?.word || '';
}

function getDefinition(card: QuizWord): string {
  return (
    card.item.customDefinition ||
    card.item.wordMinimum?.definition ||
    card.item.wordDetails?.definition ||
    ''
  );
}

/** Generate a MCQ question – show definition, guess the word */
function generateMCQ(
  card: QuizWord,
  allCards: QuizWord[],
  idx: number
): TestQuestion {
  const correctWord = getWord(card);
  const definition = getDefinition(card);

  // Pick 3 distractors different from correct
  const distractors = shuffle(
    allCards
      .filter((c) => getWord(c) !== correctWord && getWord(c).trim() !== '')
      .map((c) => getWord(c))
  ).slice(0, 3);

  const options = shuffle([correctWord, ...distractors]);
  const correctIndex = options.indexOf(correctWord);

  return {
    id: `mcq-${idx}`,
    type: 'mcq',
    card,
    question: definition || `${VOCABULARY_UI_TEXT.PRACTICE.TEST.WORD_PREFIX}${correctWord}`,
    options,
    correctAnswer: correctWord,
    correctIndex,
  };
}

/** Generate a fill-in-blank question – show definition, type the word */
function generateFillBlank(card: QuizWord, idx: number): TestQuestion {
  const correctWord = getWord(card);
  const definition = getDefinition(card);

  return {
    id: `fill-${idx}`,
    type: 'fill-blank',
    card,
    question: definition || VOCABULARY_UI_TEXT.PRACTICE.TEST.FILL_IN_BLANK,
    correctAnswer: correctWord.toLowerCase().trim(),
  };
}

/** Generate a matching question – match word to definition (4 pairs) */
function generateMatching(cards: QuizWord[], startIdx: number): TestQuestion {
  const pairs = cards.slice(0, 4).map((c) => ({
    left: getWord(c),
    right: getDefinition(c),
  }));

  return {
    id: `match-${startIdx}`,
    type: 'matching',
    card: cards[0],
    question: VOCABULARY_UI_TEXT.PRACTICE.TEST.MATCHING,
    correctAnswer: JSON.stringify(pairs.map((p) => p.left)),
    matchPairs: pairs,
  };
}

/** Create a mixed question bank from the given word cards */
function generateQuestions(
  cards: QuizWord[],
  config: TestSessionConfig
): TestQuestion[] {
  const validCards = cards.filter(
    (c) => getWord(c).trim() !== '' && getDefinition(c).trim() !== ''
  );
  if (validCards.length < 4) return [];

  const { questionCount, types } = config;
  const questions: TestQuestion[] = [];
  const shuffled = shuffle(validCards);
  let idx = 0;

  const typePool = [...types, ...types, ...types]; // repeat for distribution
  let typeIdx = 0;

  while (questions.length < questionCount && idx < shuffled.length) {
    const type: TestQuestionType = typePool[typeIdx % typePool.length];
    typeIdx++;

    if (type === 'mcq' && shuffled.length >= 4) {
      questions.push(generateMCQ(shuffled[idx], shuffled, idx));
      idx++;
    } else if (type === 'fill-blank') {
      questions.push(generateFillBlank(shuffled[idx], idx));
      idx++;
    } else if (type === 'matching' && shuffled.length >= 4) {
      const matchCards = shuffled.slice(idx, idx + 4);
      if (matchCards.length === 4) {
        questions.push(generateMatching(matchCards, idx));
        idx += 4;
      } else {
        idx++;
      }
    } else {
      idx++;
    }
  }

  return questions.slice(0, questionCount);
}

// ============================================================================
// Elapsed time formatter
// ============================================================================

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

// ============================================================================
// Hook
// ============================================================================

export interface UseTestPracticeReturn {
  // Config / flow state
  activeConfig: TestSessionConfig | null;
  isCompleted: boolean;

  // Question state
  questions: TestQuestion[];
  currentIndex: number;
  currentQuestion: TestQuestion | null;
  totalQuestions: number;

  // Answer state
  answers: Record<string, TestSessionAnswer>;
  selectedOption: number | null;
  fillInput: string;
  matchSelections: Record<string, string>;
  isAnswered: boolean;

  // Timer
  elapsedTime: string;
  remainingTime: string | null;
  isTimeUp: boolean;

  // Stats
  score: { correct: number; total: number };
  completionStats: TestCompletionStats | null;
  sessionQuestions: TestQuestion[];

  // Actions
  startSession: (cards: QuizWord[], config: TestSessionConfig) => void;
  selectMCQOption: (index: number) => void;
  updateFillInput: (value: string) => void;
  submitFillAnswer: () => void;
  setMatchSelection: (left: string, right: string) => void;
  submitMatchAnswer: () => void;
  skipQuestion: () => void;
  goNext: () => void;
  submitExam: () => void;
  restartWithWrongAnswers: () => void;
  resetSession: () => void;
}

export function useTestPractice(): UseTestPracticeReturn {
  const [activeConfig, setActiveConfig] = useState<TestSessionConfig | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, TestSessionAnswer>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [fillInput, setFillInput] = useState('');
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Timer refs
  const elapsedRef = useRef(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const questionStartRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentQuestion = questions[currentIndex] ?? null;
  const totalQuestions = questions.length;

  const score = useMemo(() => {
    const correct = Object.values(answers).filter((a) => a.isCorrect).length;
    return { correct, total: Object.keys(answers).length };
  }, [answers]);

  const elapsedTime = formatSeconds(elapsedSec);

  const remainingTime = useMemo(() => {
    if (!activeConfig?.timeLimitSeconds) return null;
    const remaining = activeConfig.timeLimitSeconds - elapsedSec;
    return formatSeconds(Math.max(0, remaining));
  }, [activeConfig, elapsedSec]);

  // Start/stop global timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setElapsedSec(elapsedRef.current);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Check time up
  useEffect(() => {
    if (!activeConfig?.timeLimitSeconds) return;
    if (elapsedSec >= activeConfig.timeLimitSeconds && !isCompleted) {
      setIsTimeUp(true);
      stopTimer();
      setIsCompleted(true);
    }
  }, [elapsedSec, activeConfig, isCompleted, stopTimer]);

  // Cleanup on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  const startSession = useCallback(
    (cards: QuizWord[], config: TestSessionConfig) => {
      const qs = generateQuestions(cards, config);
      setQuestions(qs);
      setActiveConfig(config);
      setCurrentIndex(0);
      setAnswers({});
      setSelectedOption(null);
      setFillInput('');
      setMatchSelections({});
      setIsAnswered(false);
      setIsCompleted(false);
      setIsTimeUp(false);
      elapsedRef.current = 0;
      setElapsedSec(0);
      questionStartRef.current = Date.now();
      startTimer();
    },
    [startTimer]
  );

  const recordAnswer = useCallback(
    (q: TestQuestion, userAnswer: string, isCorrect: boolean) => {
      const timeSpentMs = Date.now() - questionStartRef.current;
      setAnswers((prev) => ({
        ...prev,
        [q.id]: {
          questionId: q.id,
          type: q.type,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          timeSpentMs,
        },
      }));
      setIsAnswered(true);
    },
    []
  );

  const selectMCQOption = useCallback(
    (index: number) => {
      if (!currentQuestion || isAnswered) return;
      setSelectedOption(index);
      const option = currentQuestion.options?.[index] ?? '';
      const isCorrect = index === currentQuestion.correctIndex;
      recordAnswer(currentQuestion, option, isCorrect);
    },
    [currentQuestion, isAnswered, recordAnswer]
  );

  const updateFillInput = useCallback((value: string) => {
    setFillInput(value);
  }, []);

  const submitFillAnswer = useCallback(() => {
    if (!currentQuestion || isAnswered) return;
    const normalized = fillInput.toLowerCase().trim();
    const isCorrect = normalized === currentQuestion.correctAnswer.toLowerCase().trim();
    recordAnswer(currentQuestion, fillInput, isCorrect);
  }, [currentQuestion, isAnswered, fillInput, recordAnswer]);

  const setMatchSelection = useCallback((left: string, right: string) => {
    setMatchSelections((prev) => ({ ...prev, [left]: right }));
  }, []);

  const submitMatchAnswer = useCallback(() => {
    if (!currentQuestion || isAnswered || currentQuestion.type !== 'matching') return;
    const pairs = currentQuestion.matchPairs ?? [];
    let allCorrect = true;
    for (const pair of pairs) {
      if (matchSelections[pair.left] !== pair.right) {
        allCorrect = false;
        break;
      }
    }
    recordAnswer(currentQuestion, JSON.stringify(matchSelections), allCorrect);
  }, [currentQuestion, isAnswered, matchSelections, recordAnswer]);

  const skipQuestion = useCallback(() => {
    if (!currentQuestion || isAnswered) return;
    recordAnswer(currentQuestion, '__skipped__', false);
  }, [currentQuestion, isAnswered, recordAnswer]);

  const goNext = useCallback(() => {
    if (currentIndex + 1 >= totalQuestions) {
      stopTimer();
      setIsCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setFillInput('');
      setMatchSelections({});
      setIsAnswered(false);
      questionStartRef.current = Date.now();
    }
  }, [currentIndex, totalQuestions, stopTimer]);

  const submitExam = useCallback(() => {
    stopTimer();
    setIsCompleted(true);
  }, [stopTimer]);

  const completionStats = useMemo<TestCompletionStats | null>(() => {
    if (!isCompleted || questions.length === 0) return null;

    const byType: Record<TestQuestionType, { correct: number; total: number }> = {
      mcq: { correct: 0, total: 0 },
      'fill-blank': { correct: 0, total: 0 },
      matching: { correct: 0, total: 0 },
    };

    let correct = 0;
    let skipped = 0;

    for (const q of questions) {
      const ans = answers[q.id];
      byType[q.type].total += 1;
      if (!ans) {
        skipped += 1;
      } else if (ans.isCorrect) {
        correct += 1;
        byType[q.type].correct += 1;
      }
    }

    const total = questions.length;
    return {
      totalQuestions: total,
      correctCount: correct,
      wrongCount: total - correct - skipped,
      skippedCount: skipped,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      totalTimeSeconds: elapsedRef.current,
      byType,
    };
  }, [isCompleted, questions, answers]);

  const restartWithWrongAnswers = useCallback(() => {
    if (!activeConfig) return;
    const wrongQuestions = questions.filter((q) => {
      const ans = answers[q.id];
      return !ans || !ans.isCorrect;
    });
    if (wrongQuestions.length === 0) return;

    setQuestions(wrongQuestions);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setFillInput('');
    setMatchSelections({});
    setIsAnswered(false);
    setIsCompleted(false);
    setIsTimeUp(false);
    elapsedRef.current = 0;
    setElapsedSec(0);
    questionStartRef.current = Date.now();
    startTimer();
  }, [activeConfig, questions, answers, startTimer]);

  const resetSession = useCallback(() => {
    stopTimer();
    setActiveConfig(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setFillInput('');
    setMatchSelections({});
    setIsAnswered(false);
    setIsCompleted(false);
    setIsTimeUp(false);
    elapsedRef.current = 0;
    setElapsedSec(0);
  }, [stopTimer]);

  return {
    activeConfig,
    isCompleted,
    questions,
    currentIndex,
    currentQuestion,
    totalQuestions,
    answers,
    selectedOption,
    fillInput,
    matchSelections,
    isAnswered,
    elapsedTime,
    remainingTime,
    isTimeUp,
    score,
    completionStats,
    sessionQuestions: questions,
    startSession,
    selectMCQOption,
    updateFillInput,
    submitFillAnswer,
    setMatchSelection,
    submitMatchAnswer,
    skipQuestion,
    goNext,
    submitExam,
    restartWithWrongAnswers,
    resetSession,
  };
}

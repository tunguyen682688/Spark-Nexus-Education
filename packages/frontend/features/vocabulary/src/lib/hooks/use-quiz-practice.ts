import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { vocabularyKeys } from './use-vocabulary-sets';
import type { FlashcardSessionResponse, QuizWord, LearningQuizQuestion } from '../types';

export interface UseQuizPracticeProps {
  setId: string;
  sessionData: FlashcardSessionResponse | undefined;
  reviewAll: boolean;
  setReviewAll: React.Dispatch<React.SetStateAction<boolean>>;
  reviewMutation: any;
}

// Fisher-Yates Shuffle utility
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const useQuizPractice = ({
  setId,
  sessionData,
  reviewAll,
  setReviewAll,
  reviewMutation,
}: UseQuizPracticeProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State Management
  const [questions, setQuestions] = useState<LearningQuizQuestion[]>([]);
  const [originalQuestions, setOriginalQuestions] = useState<LearningQuizQuestion[]>([]);
  const [failedItemIds, setFailedItemIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [sessionAnswers, setSessionAnswers] = useState<{
    [questionIndex: number]: { selected: number; correct: number; isCorrect: boolean };
  }>({});
  const [firstAttemptAnswers, setFirstAttemptAnswers] = useState<{
    [questionIndex: number]: { selected: number; correct: number; isCorrect: boolean };
  }>({});
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [activeStudyMode, setActiveStudyMode] = useState<'due' | 'all' | 'difficult' | 'new' | null>(null);

  // Settings
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(() => {
    const saved = localStorage.getItem('spark_vocab_quiz_autoplay');
    return saved !== null ? saved === 'true' : true;
  });

  // Timers & Statistics
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const questionLoadTimeRef = useRef<number>(Date.now());
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Guard Set to prevent duplicate API submission of the same question index
  const [gradedQuestions, setGradedQuestions] = useState<Set<number>>(new Set());

  const [prevSetId, setPrevSetId] = useState<string>(setId);
  const [prevReviewAll, setPrevReviewAll] = useState<boolean>(reviewAll);

  // Compute live vocabulary dashboard statistics
  const statsDashboard = useMemo(() => {
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
        difficultCount++; // Only learning words are considered difficult/unmemorized
      } else {
        newCount++;
      }
    });

    return { total, mastered, learning, newCount, difficultCount };
  }, [sessionData]);

  // Helper to generate Quiz Questions with smart distractor choices
  const generateQuestions = useCallback((cards: QuizWord[], allCardsPool: QuizWord[] = cards): LearningQuizQuestion[] => {
    if (cards.length === 0) return [];

    return cards.map((card, index) => {
      const correctWord = card.item.customWord || card.item.wordMinimum?.word || card.item.wordDetails?.word || '';
      const promptDefinition = card.item.customDefinition || card.item.wordMinimum?.definition || card.item.wordDetails?.definition || '';

      const otherWordsPool = allCardsPool
        .map(c => c.item.customWord || c.item.wordMinimum?.word || c.item.wordDetails?.word || '')
        .filter(w => w !== '' && w !== correctWord);

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
  }, []);

  // Initialize/reset session questions when API data loads
  useEffect(() => {
    if (sessionData?.words) {
      const cards: QuizWord[] = sessionData.words.map((word) => ({
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

      if (setId !== prevSetId || reviewAll !== prevReviewAll || !hasInitialized) {
        if (!reviewAll && cards.length > 0) {
          const generated = generateQuestions(cards);
          setQuestions(generated);
          setOriginalQuestions(generated);
          setActiveStudyMode('due');
          setCurrentIndex(0);
          setSelectedOption(null);
          setIsAnswered(false);
          setSessionAnswers({});
          setFirstAttemptAnswers({});
          setCurrentStreak(0);
          setIsCompleted(false);
          setElapsedSeconds(0);
          setResponseTimes([]);
          setGradedQuestions(new Set());
          setFailedItemIds(new Set());
          setHasInitialized(true);
          setPrevSetId(setId);
          setPrevReviewAll(reviewAll);
          questionLoadTimeRef.current = Date.now();
        } else if (reviewAll) {
          setQuestions([]);
          setOriginalQuestions([]);
          setActiveStudyMode(null);
          setCurrentIndex(0);
          setSelectedOption(null);
          setIsAnswered(false);
          setSessionAnswers({});
          setFirstAttemptAnswers({});
          setCurrentStreak(0);
          setIsCompleted(false);
          setElapsedSeconds(0);
          setResponseTimes([]);
          setGradedQuestions(new Set());
          setFailedItemIds(new Set());
          setHasInitialized(true);
          setPrevSetId(setId);
          setPrevReviewAll(reviewAll);
        }
      }
    }
  }, [sessionData, setId, prevSetId, reviewAll, prevReviewAll, hasInitialized, generateQuestions]);

  const handleStartStudyMode = useCallback((mode: 'all' | 'difficult' | 'new') => {
    if (!sessionData?.words) return;

    const cards: QuizWord[] = sessionData.words.map((word) => ({
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

    let filteredCards = cards;
    if (mode === 'difficult') {
      filteredCards = cards.filter(
        (c) => c.progress && c.progress.status === 'LEARNING'
      );
    } else if (mode === 'new') {
      filteredCards = cards.filter((c) => !c.progress || c.progress.status === 'NEW');
    }

    const generated = generateQuestions(filteredCards, cards);
    setQuestions(generated);
    setOriginalQuestions(generated);
    setActiveStudyMode(mode);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setSessionAnswers({});
    setFirstAttemptAnswers({});
    setCurrentStreak(0);
    setIsCompleted(false);
    setElapsedSeconds(0);
    setResponseTimes([]);
    setGradedQuestions(new Set());
    setFailedItemIds(new Set());
    questionLoadTimeRef.current = Date.now();
  }, [sessionData, generateQuestions]);

  const handleRestart = useCallback(() => {
    if (sessionData?.words) {
      const cards: QuizWord[] = sessionData.words.map((word) => ({
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

      let filteredCards = cards;
      if (activeStudyMode === 'difficult') {
        filteredCards = cards.filter(
          (c) => c.progress && c.progress.status === 'LEARNING'
        );
      } else if (activeStudyMode === 'new') {
        filteredCards = cards.filter((c) => !c.progress || c.progress.status === 'NEW');
      }

      const generated = generateQuestions(filteredCards, cards);
      setQuestions(generated);
      setOriginalQuestions(generated);
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setSessionAnswers({});
      setFirstAttemptAnswers({});
      setCurrentStreak(0);
      setIsCompleted(false);
      setElapsedSeconds(0);
      setResponseTimes([]);
      setGradedQuestions(new Set());
      setFailedItemIds(new Set());
      questionLoadTimeRef.current = Date.now();

      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    }
  }, [sessionData, activeStudyMode, generateQuestions]);

  const handleRestartFailedQuestions = useCallback(() => {
    if (originalQuestions.length === 0) return;

    // Filter unique failed questions to restart them cleanly
    const failedQuestions: LearningQuizQuestion[] = [];
    const seenFailedIds = new Set<string>();
    originalQuestions.forEach((q, idx) => {
      const ans = firstAttemptAnswers[idx];
      if (ans && !ans.isCorrect && !seenFailedIds.has(q.card.item.id)) {
        seenFailedIds.add(q.card.item.id);
        failedQuestions.push(q);
      }
    });

    if (failedQuestions.length === 0) return;

    const failedCards = failedQuestions.map(q => q.card);
    const generated = generateQuestions(failedCards, originalQuestions.map(q => q.card));

    setQuestions(generated);
    setOriginalQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setSessionAnswers({});
    setFirstAttemptAnswers({});
    setCurrentStreak(0);
    setIsCompleted(false);
    setElapsedSeconds(0);
    setResponseTimes([]);
    setGradedQuestions(new Set());
    setFailedItemIds(new Set());
    questionLoadTimeRef.current = Date.now();

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
  }, [originalQuestions, firstAttemptAnswers, generateQuestions]);

  useEffect(() => {
    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const elapsedTimeStr = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  const avgResponseTime = useMemo(() => {
    if (responseTimes.length === 0) return 0;
    const sum = responseTimes.reduce((acc, t) => acc + t, 0);
    return parseFloat((sum / responseTimes.length).toFixed(1));
  }, [responseTimes]);

  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlayAudio((prev) => {
      localStorage.setItem('spark_vocab_quiz_autoplay', String(!prev));
      return !prev;
    });
  }, []);

  const handlePlayAudio = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const wordDetails = currentQ.card.item.wordDetails;
    const wordMinimum = currentQ.card.item.wordMinimum;
    const audioUrl = wordDetails?.audioUrl;
    const wordText = currentQ.card.item.customWord || wordMinimum?.word || wordDetails?.word || '';

    const speakFallback = (text: string) => {
      if (!text || !window.speechSynthesis) return;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    };

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.warn('Audio URL playback failed, falling back to TTS speech:', err);
        speakFallback(wordText);
      });
    } else {
      speakFallback(wordText);
    }
  }, [questions, currentIndex]);

  const handleNext = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    const isLast = currentIndex >= questions.length - 1;

    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      questionLoadTimeRef.current = Date.now();
    } else {
      // Evaluate if we should start a new round or complete the session
      const activeFailedIds = new Set(failedItemIds);

      if (activeFailedIds.size > 0) {
        // Start a new round with newly generated questions for the failed cards
        const failedCards = originalQuestions
          .filter((q) => activeFailedIds.has(q.card.item.id))
          .map((q) => q.card);
        
        // Deduplicate failed cards
        const uniqueFailedCards: QuizWord[] = [];
        const seenIds = new Set<string>();
        failedCards.forEach((c) => {
          if (!seenIds.has(c.item.id)) {
            seenIds.add(c.item.id);
            uniqueFailedCards.push(c);
          }
        });

        const generated = generateQuestions(uniqueFailedCards, originalQuestions.map(q => q.card));
        setQuestions(generated);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setFailedItemIds(new Set());
        setGradedQuestions(new Set());
        setSessionAnswers({}); // Reset round answers so progress bar is clean for new round
        questionLoadTimeRef.current = Date.now();
      } else {
        setIsCompleted(true);
        queryClient.invalidateQueries({
          queryKey: vocabularyKeys.detail(setId),
        });
      }
    }
  }, [currentIndex, questions.length, failedItemIds, originalQuestions, generateQuestions, queryClient, setId]);

  const handleSelectOption = useCallback((optionIndex: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ || isAnswered) return;
    if (gradedQuestions.has(currentIndex)) return;

    const isCorrect = optionIndex === currentQ.correctIndex;
    const itemId = currentQ.card.item.id;

    const timeSpent = (Date.now() - questionLoadTimeRef.current) / 1000;
    setResponseTimes((prev) => [...prev, timeSpent]);

    setGradedQuestions((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    setSelectedOption(optionIndex);
    setIsAnswered(true);

    // Find the original index of this question to record the first attempt
    const originalIdx = originalQuestions.findIndex((q) => q.card.item.id === itemId);

    setFirstAttemptAnswers((prev) => {
      if (originalIdx === -1 || prev[originalIdx] !== undefined) return prev;
      return {
        ...prev,
        [originalIdx]: {
          selected: optionIndex,
          correct: currentQ.correctIndex,
          isCorrect,
        },
      };
    });

    setSessionAnswers((prev) => ({
      ...prev,
      [currentIndex]: {
        selected: optionIndex,
        correct: currentQ.correctIndex,
        isCorrect,
      },
    }));

    if (!isCorrect) {
      setFailedItemIds((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      });
    }

    setCurrentStreak((prev) => (isCorrect ? prev + 1 : 0));

    const srsQuality = isCorrect ? 4 : 1;

    // 1. Calculate SM-2 Client-side Optimistic State Update for Quiz
    const currentProg = currentQ.card.progress;
    const currentEaseFactor = currentProg?.easeFactor ?? 2.5;
    const currentInterval = currentProg?.interval ?? 0;
    const currentRepetitions = currentProg?.repetitions ?? 0;

    const newRepetitions = srsQuality < 3 ? 0 : currentRepetitions + 1;
    let newInterval = 1;
    if (srsQuality >= 3) {
      if (newRepetitions === 1) newInterval = 1;
      else if (newRepetitions === 2) newInterval = 6;
      else newInterval = Math.round(currentInterval * currentEaseFactor);
    }
    const newEaseFactor = Math.max(1.3, currentEaseFactor + (0.1 - (5 - srsQuality) * (0.08 + (5 - srsQuality) * 0.02)));
    const nextStatus = newRepetitions >= 5 ? 'MASTERED' : newRepetitions > 0 ? 'LEARNING' : 'NEW';
    const nextMastery = Math.max(0.0, Math.min(1.0, newRepetitions * 0.2 + (newEaseFactor - 2.0) * 0.1));

    // Update questions state instantly
    setQuestions((prevQ) => {
      return prevQ.map((q, idx) => {
        if (idx !== currentIndex) return q;
        return {
          ...q,
          card: {
            ...q.card,
            progress: {
              id: q.card.progress?.id ?? 'temp',
              status: nextStatus as any,
              streak: srsQuality >= 3 ? (q.card.progress?.streak ?? 0) + 1 : 0,
              masteryLevel: nextMastery,
              repetitions: newRepetitions,
              interval: newInterval,
              easeFactor: newEaseFactor,
            },
          },
        };
      });
    });

    setOriginalQuestions((prevQ) => {
      return prevQ.map((q) => {
        if (q.card.item.id !== itemId) return q;
        return {
          ...q,
          card: {
            ...q.card,
            progress: {
              id: q.card.progress?.id ?? 'temp',
              status: nextStatus as any,
              streak: srsQuality >= 3 ? (q.card.progress?.streak ?? 0) + 1 : 0,
              masteryLevel: nextMastery,
              repetitions: newRepetitions,
              interval: newInterval,
              easeFactor: newEaseFactor,
            },
          },
        };
      });
    });

    // 2. Đẩy API Mutation lưu vào cơ sở dữ liệu ngầm (Background Save)
    reviewMutation.mutate(
      { itemId, quality: srsQuality },
      {
        onSuccess: (result: any) => {
          setQuestions((prevQ) =>
            prevQ.map((q, idx) => {
              if (idx !== currentIndex) return q;
              return {
                ...q,
                card: {
                  ...q.card,
                  progress: {
                    id: result.id,
                    status: result.status,
                    streak: result.streak,
                    masteryLevel: result.masteryLevel,
                    repetitions: result.repetitions,
                    interval: result.interval,
                    easeFactor: result.easeFactor,
                  },
                },
              };
            })
          );
          setOriginalQuestions((prevQ) =>
            prevQ.map((q) => {
              if (q.card.item.id !== itemId) return q;
              return {
                ...q,
                card: {
                  ...q.card,
                  progress: {
                    id: result.id,
                    status: result.status,
                    streak: result.streak,
                    masteryLevel: result.masteryLevel,
                    repetitions: result.repetitions,
                    interval: result.interval,
                    easeFactor: result.easeFactor,
                  },
                },
              };
            })
          );
        },
        onError: (err: any) => {
          console.error('[Quiz] Failed to record SRS review for item:', itemId, err);
        },
      }
    );

    if (isCorrect) {
      autoAdvanceTimerRef.current = setTimeout(() => {
        handleNext();
      }, 1500);
    }
  }, [questions, currentIndex, isAnswered, gradedQuestions, originalQuestions, reviewMutation, handleNext]);

  const handleGoHome = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: vocabularyKeys.detail(setId),
    });
    navigate(ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(':id', setId));
  }, [navigate, setId, queryClient]);

  const handleNavigateToFlashcards = useCallback(() => {
    navigate(ROUTES.VOCABULARIES.FLASHCARD.replace(':id', setId));
  }, [navigate, setId]);

  const handleChangeStudyMode = useCallback(() => {
    setActiveStudyMode(null);
    setQuestions([]);
  }, []);

  return {
    questions: isCompleted ? originalQuestions : questions,
    currentIndex,
    currentQuestion: questions[currentIndex] || null,
    selectedOption,
    isAnswered,
    sessionAnswers: isCompleted ? firstAttemptAnswers : sessionAnswers,
    currentStreak,
    isCompleted,
    autoPlayAudio,
    elapsedTime: elapsedTimeStr,
    avgResponseTime,
    statsDashboard,
    activeStudyMode,
    handleSelectOption,
    handleNext,
    handlePlayAudio,
    handleToggleAutoPlay,
    handleRestart,
    handleRestartFailedQuestions,
    handleGoHome,
    handleNavigateToFlashcards,
    handleChangeStudyMode,
    handleStartStudyMode,
  };
};

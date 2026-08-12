import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { vocabularyKeys } from './use-vocabulary-queries';
import type { FlashcardSessionResponse, QuizWord, LearningQuizQuestion } from '../types';
import {
  generateQuestions,
  computeStatsDashboard,
  calculateSrsUpdate,
  mapSessionToQuizWords,
  filterCardsByMode,
  formatElapsedTime,
  computeAvgResponseTime,
  readAutoPlaySetting,
} from './quiz-state-machine';

export interface UseQuizPracticeProps {
  setId: string;
  sessionData: FlashcardSessionResponse | undefined;
  reviewAll: boolean;
  setReviewAll: React.Dispatch<React.SetStateAction<boolean>>;
  reviewMutation: any;
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

  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(readAutoPlaySetting);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const questionLoadTimeRef = useRef<number>(Date.now());
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gradedQuestions, setGradedQuestions] = useState<Set<number>>(new Set());

  const [prevSetId, setPrevSetId] = useState<string>(setId);
  const [prevReviewAll, setPrevReviewAll] = useState<boolean>(reviewAll);

  const statsDashboard = useMemo(() => computeStatsDashboard(sessionData), [sessionData]);

  const elapsedTimeStr = useMemo(() => formatElapsedTime(elapsedSeconds), [elapsedSeconds]);

  const avgResponseTime = useMemo(() => computeAvgResponseTime(responseTimes), [responseTimes]);

  const resetSessionState = useCallback(() => {
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
  }, []);

  const initFromSession = useCallback(() => {
    if (!sessionData?.words) return;

    const cards = mapSessionToQuizWords(sessionData.words);

    if (setId !== prevSetId || reviewAll !== prevReviewAll || !hasInitialized) {
      if (!reviewAll && cards.length > 0) {
        const generated = generateQuestions(cards);
        setQuestions(generated);
        setOriginalQuestions(generated);
        setActiveStudyMode('due');
        resetSessionState();
        setHasInitialized(true);
        setPrevSetId(setId);
        setPrevReviewAll(reviewAll);
      } else if (reviewAll) {
        setQuestions([]);
        setOriginalQuestions([]);
        setActiveStudyMode(null);
        resetSessionState();
        setHasInitialized(true);
        setPrevSetId(setId);
        setPrevReviewAll(reviewAll);
      }
    }
  }, [sessionData, setId, prevSetId, reviewAll, prevReviewAll, hasInitialized, resetSessionState]);

  useEffect(() => { initFromSession(); }, [initFromSession]);

  const handleStartStudyMode = useCallback((mode: 'all' | 'difficult' | 'new') => {
    if (!sessionData?.words) return;

    const cards = mapSessionToQuizWords(sessionData.words);
    const filteredCards = filterCardsByMode(cards, mode);
    const generated = generateQuestions(filteredCards, cards);

    setQuestions(generated);
    setOriginalQuestions(generated);
    setActiveStudyMode(mode);
    resetSessionState();
  }, [sessionData, resetSessionState]);

  const handleRestart = useCallback(() => {
    if (!sessionData?.words) return;

    const cards = mapSessionToQuizWords(sessionData.words);
    const filteredCards = activeStudyMode && activeStudyMode !== 'due'
      ? filterCardsByMode(cards, activeStudyMode)
      : cards;
    const generated = generateQuestions(filteredCards, cards);

    setQuestions(generated);
    setOriginalQuestions(generated);
    resetSessionState();

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
  }, [sessionData, activeStudyMode, resetSessionState]);

  const handleRestartFailedQuestions = useCallback(() => {
    if (originalQuestions.length === 0) return;

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

    const failedCards = failedQuestions.map((q) => q.card);
    const generated = generateQuestions(failedCards, originalQuestions.map((q) => q.card));

    setQuestions(generated);
    setOriginalQuestions(generated);
    resetSessionState();

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
  }, [originalQuestions, firstAttemptAnswers, resetSessionState]);

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
      const activeFailedIds = new Set(failedItemIds);

      if (activeFailedIds.size > 0) {
        const failedCards = originalQuestions
          .filter((q) => activeFailedIds.has(q.card.item.id))
          .map((q) => q.card);

        const uniqueFailedCards: QuizWord[] = [];
        const seenIds = new Set<string>();
        failedCards.forEach((c) => {
          if (!seenIds.has(c.item.id)) {
            seenIds.add(c.item.id);
            uniqueFailedCards.push(c);
          }
        });

        const generated = generateQuestions(uniqueFailedCards, originalQuestions.map((q) => q.card));
        setQuestions(generated);
        setCurrentIndex(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setFailedItemIds(new Set());
        setGradedQuestions(new Set());
        setSessionAnswers({});
        questionLoadTimeRef.current = Date.now();
      } else {
        setIsCompleted(true);
        queryClient.invalidateQueries({
          queryKey: vocabularyKeys.detail(setId),
        });
      }
    }
  }, [currentIndex, questions.length, failedItemIds, originalQuestions, queryClient, setId]);

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
    const srsResult = calculateSrsUpdate(srsQuality, currentQ.card.progress);

    setQuestions((prevQ) =>
      prevQ.map((q, idx) => {
        if (idx !== currentIndex) return q;
        return {
          ...q,
          card: {
            ...q.card,
            progress: {
              id: q.card.progress?.id ?? 'temp',
              status: srsResult.status as any,
              streak: srsResult.streak,
              masteryLevel: srsResult.masteryLevel,
              repetitions: srsResult.repetitions,
              interval: srsResult.interval,
              easeFactor: srsResult.easeFactor,
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
              id: q.card.progress?.id ?? 'temp',
              status: srsResult.status as any,
              streak: srsResult.streak,
              masteryLevel: srsResult.masteryLevel,
              repetitions: srsResult.repetitions,
              interval: srsResult.interval,
              easeFactor: srsResult.easeFactor,
            },
          },
        };
      })
    );

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

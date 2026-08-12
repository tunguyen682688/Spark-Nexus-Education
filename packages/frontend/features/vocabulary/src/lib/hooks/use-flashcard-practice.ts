import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { vocabularyKeys } from './use-vocabulary-queries';
import type { FlashcardSessionResponse, FlashcardWord } from '../types';
import {
  computeStatsDashboard,
  calculateSrsUpdate,
  mapSessionToFlashcardWords,
  filterCardsByMode,
  formatElapsedTime,
  computeAvgResponseTime,
  computeRemainingTime,
  computeSessionStats,
  readAutoPlaySetting,
  readAutoShowHintSetting,
} from './use-flashcard-gestures';

export interface UseFlashcardPracticeProps {
  setId: string;
  sessionData: FlashcardSessionResponse | undefined;
  reviewAll: boolean;
  setReviewAll: React.Dispatch<React.SetStateAction<boolean>>;
  reviewMutation: any;
}

export const useFlashcardPractice = ({
  setId,
  sessionData,
  reviewAll,
  setReviewAll,
  reviewMutation,
}: UseFlashcardPracticeProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sessionCards, setSessionCards] = useState<FlashcardWord[]>([]);
  const [originalCards, setOriginalCards] = useState<FlashcardWord[]>([]);
  const [failedItemIds, setFailedItemIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(readAutoPlaySetting);
  const [autoShowHint, setAutoShowHint] = useState<boolean>(readAutoShowHintSetting);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const cardLoadTimeRef = useRef<number>(Date.now());

  const [sessionGrades, setSessionGrades] = useState<{ [itemId: string]: number }>({});
  const [gradedIndices, setGradedIndices] = useState<Set<number>>(new Set());

  const [prevSetId, setPrevSetId] = useState<string>(setId);
  const [prevReviewAll, setPrevReviewAll] = useState<boolean>(reviewAll);

  const [activeStudyMode, setActiveStudyMode] = useState<'due' | 'all' | 'difficult' | 'new' | null>(null);

  const statsDashboard = useMemo(() => computeStatsDashboard(sessionData), [sessionData]);

  const elapsedTimeStr = useMemo(() => formatElapsedTime(elapsedSeconds), [elapsedSeconds]);

  const avgResponseTime = useMemo(() => computeAvgResponseTime(responseTimes), [responseTimes]);

  const remainingTimeStr = useMemo(
    () => computeRemainingTime(sessionCards.length, currentIndex, avgResponseTime),
    [sessionCards.length, currentIndex, avgResponseTime]
  );

  const stats = useMemo(
    () => computeSessionStats(originalCards, sessionGrades, avgResponseTime),
    [originalCards, sessionGrades, avgResponseTime]
  );

  const resetSessionState = useCallback(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setIsCompleted(false);
    setElapsedSeconds(0);
    setResponseTimes([]);
    setSessionGrades({});
    setGradedIndices(new Set());
    setFailedItemIds(new Set());
    cardLoadTimeRef.current = Date.now();
  }, []);

  const initFromSession = useCallback(() => {
    if (!sessionData?.words) return;

    const cards = mapSessionToFlashcardWords(sessionData.words);

    if (setId !== prevSetId || reviewAll !== prevReviewAll || !hasInitialized) {
      if (!reviewAll && cards.length > 0) {
        setSessionCards(cards);
        setOriginalCards(cards);
        setActiveStudyMode('due');
        resetSessionState();
        setHasInitialized(true);
        setPrevSetId(setId);
        setPrevReviewAll(reviewAll);
      } else if (reviewAll) {
        setSessionCards([]);
        setOriginalCards([]);
        setActiveStudyMode(null);
        resetSessionState();
        setHasInitialized(true);
        setPrevSetId(setId);
        setPrevReviewAll(reviewAll);
      }
    } else {
      setSessionCards((prev) =>
        prev.map((localCard) => {
          const freshWord = sessionData.words.find((w) => w.item.id === localCard.item.id);
          if (freshWord) {
            return {
              ...localCard,
              progress: freshWord.progress
                ? {
                    id: freshWord.progress.id,
                    status: freshWord.progress.status,
                    streak: freshWord.progress.streak,
                    masteryLevel: freshWord.progress.masteryLevel,
                    repetitions: freshWord.progress.repetitions,
                    interval: freshWord.progress.interval,
                    easeFactor: freshWord.progress.easeFactor,
                  }
                : null,
            };
          }
          return localCard;
        })
      );
    }
  }, [sessionData, setId, prevSetId, reviewAll, prevReviewAll, hasInitialized, resetSessionState]);

  useEffect(() => { initFromSession(); }, [initFromSession]);

  const handleStartStudyMode = useCallback((mode: 'all' | 'difficult' | 'new') => {
    if (!sessionData?.words) return;

    const cards = mapSessionToFlashcardWords(sessionData.words);
    const filteredCards = filterCardsByMode(cards, mode);

    setSessionCards(filteredCards);
    setOriginalCards(filteredCards);
    setActiveStudyMode(mode);
    resetSessionState();
  }, [sessionData, resetSessionState]);

  const handleRestart = useCallback(() => {
    if (!sessionData?.words) return;

    const cards = mapSessionToFlashcardWords(sessionData.words);
    const filteredCards = activeStudyMode && activeStudyMode !== 'due'
      ? filterCardsByMode(cards, activeStudyMode)
      : cards;

    setSessionCards(filteredCards);
    setOriginalCards(filteredCards);
    resetSessionState();
  }, [sessionData, activeStudyMode, resetSessionState]);

  const handleRestartFailedCards = useCallback(() => {
    if (originalCards.length === 0) return;

    const failedCards: FlashcardWord[] = [];
    const seenFailedIds = new Set<string>();
    originalCards.forEach((card) => {
      const grade = sessionGrades[card.item.id];
      if (grade === 1 && !seenFailedIds.has(card.item.id)) {
        seenFailedIds.add(card.item.id);
        failedCards.push(card);
      }
    });

    if (failedCards.length === 0) return;

    setSessionCards(failedCards);
    setOriginalCards(failedCards);
    resetSessionState();
  }, [originalCards, sessionGrades, resetSessionState]);

  const handleNavigateToQuiz = useCallback(() => {
    navigate(ROUTES.VOCABULARIES.QUIZ.replace(':id', setId));
  }, [navigate, setId]);

  const handleChangeStudyMode = useCallback(() => {
    setActiveStudyMode(null);
    setSessionCards([]);
  }, []);

  const handleGoHome = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: vocabularyKeys.detail(setId),
    });
    navigate(ROUTES.VOCABULARIES.OVERVIEW_SET_VOCABULARY_LEARNING.replace(':id', setId));
  }, [navigate, setId, queryClient]);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleToggleAutoPlay = useCallback(() => {
    setAutoPlayAudio((prev) => {
      localStorage.setItem('spark_vocab_autoplay', String(!prev));
      return !prev;
    });
  }, []);

  const handleToggleAutoShowHint = useCallback(() => {
    setAutoShowHint((prev) => {
      localStorage.setItem('spark_vocab_autoshowhint', String(!prev));
      return !prev;
    });
  }, []);

  const currentCard = sessionCards[currentIndex] || null;

  const speakFallback = useCallback((text?: string) => {
    if (!text || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }, []);

  const handlePlayAudio = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    if (!currentCard) return;

    const audioUrl = currentCard.item.wordDetails?.audioUrl;
    const wordText = currentCard.item.customWord || currentCard.item.wordMinimum?.word;

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((err) => {
        console.warn('Audio URL playback failed, falling back to TTS:', err);
        speakFallback(wordText);
      });
    } else {
      speakFallback(wordText);
    }
  }, [currentCard, speakFallback]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleGrade = useCallback((quality: number) => {
    if (!currentCard) return;

    const itemId = currentCard.item.id;
    if (gradedIndices.has(currentIndex)) return;

    const cardIndex = currentIndex;
    const isLastCard = cardIndex >= sessionCards.length - 1;

    const timeSpent = (Date.now() - cardLoadTimeRef.current) / 1000;
    setResponseTimes((prev) => [...prev, timeSpent]);

    setSessionGrades((prev) => {
      if (prev[itemId] !== undefined) return prev;
      return { ...prev, [itemId]: quality };
    });

    setGradedIndices((prev) => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });

    if (quality < 3) {
      setFailedItemIds((prev) => {
        const next = new Set(prev);
        next.add(itemId);
        return next;
      });
    }

    const srsResult = calculateSrsUpdate(quality, currentCard.progress);

    setSessionCards((prevCards) =>
      prevCards.map((card) => {
        if (card.item.id !== itemId) return card;
        return {
          ...card,
          progress: {
            id: card.progress?.id ?? 'temp',
            status: srsResult.status as any,
            streak: srsResult.streak,
            masteryLevel: srsResult.masteryLevel,
            repetitions: srsResult.repetitions,
            interval: srsResult.interval,
            easeFactor: srsResult.easeFactor,
          },
        };
      })
    );

    if (!isLastCard) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      cardLoadTimeRef.current = Date.now();
    } else {
      const activeFailedIds = new Set(failedItemIds);
      if (quality < 3) {
        activeFailedIds.add(itemId);
      }

      if (activeFailedIds.size > 0) {
        setSessionCards((prevCards) =>
          prevCards.filter((c) => activeFailedIds.has(c.item.id))
        );
        setCurrentIndex(0);
        setFailedItemIds(new Set());
        setGradedIndices(new Set());
        setIsFlipped(false);
        setShowHint(false);
        cardLoadTimeRef.current = Date.now();
      } else {
        setIsCompleted(true);
        setIsFlipped(false);
        setShowHint(false);
      }
    }

    reviewMutation.mutate(
      { itemId, quality },
      {
        onSuccess: (result: any) => {
          setSessionCards((prevCards) =>
            prevCards.map((card) => {
              if (card.item.id !== itemId) return card;
              return {
                ...card,
                progress: {
                  id: result.id,
                  status: result.status,
                  streak: result.streak,
                  masteryLevel: result.masteryLevel,
                  repetitions: result.repetitions,
                  interval: result.interval,
                  easeFactor: result.easeFactor,
                },
              };
            })
          );
        },
        onError: (error: any) => {
          console.error('[Flashcard] Failed to record review for item:', itemId, error);
        },
      }
    );

    if (isLastCard) {
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(setId),
      });
    }
  }, [currentCard, currentIndex, sessionCards.length, reviewMutation, gradedIndices, queryClient, setId, failedItemIds]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHint(false);
      cardLoadTimeRef.current = Date.now();
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      cardLoadTimeRef.current = Date.now();
    }
  }, [currentIndex, sessionCards.length]);

  const handlePageSelect = useCallback((index: number) => {
    if (index >= 0 && index < sessionCards.length) {
      setCurrentIndex(index);
      setIsFlipped(false);
      setShowHint(false);
      cardLoadTimeRef.current = Date.now();
    }
  }, [sessionCards.length]);

  return {
    sessionCards: isCompleted ? originalCards : sessionCards,
    currentIndex,
    currentCard,
    isFlipped,
    showHint,
    focusMode,
    autoPlayAudio,
    autoShowHint,
    elapsedTime: elapsedTimeStr,
    remainingTime: remainingTimeStr,
    stats,
    statsDashboard,
    activeStudyMode,
    isCompleted,
    sessionGrades,
    setFocusMode,
    setShowHint,
    handleFlip,
    handleGrade,
    handlePrev,
    handleNext,
    handleRestart,
    handleRestartFailedCards,
    handlePageSelect,
    handleStartStudyMode,
    handleNavigateToQuiz,
    handleChangeStudyMode,
    handleGoHome,
    handleToggleAutoPlay,
    handleToggleAutoShowHint,
    handlePlayAudio,
  };
};

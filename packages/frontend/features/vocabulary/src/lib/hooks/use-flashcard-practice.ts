
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';
import { vocabularyKeys } from './use-vocabulary-sets';
import type { FlashcardSessionResponse, FlashcardWord } from '../types';

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

  // State Management
  const [sessionCards, setSessionCards] = useState<FlashcardWord[]>([]);
  const [originalCards, setOriginalCards] = useState<FlashcardWord[]>([]);
  const [failedItemIds, setFailedItemIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Quick Settings
  const [autoPlayAudio, setAutoPlayAudio] = useState<boolean>(() => {
    const saved = localStorage.getItem('spark_vocab_autoplay');
    return saved !== null ? saved === 'true' : true;
  });
  const [autoShowHint, setAutoShowHint] = useState<boolean>(() => {
    const saved = localStorage.getItem('spark_vocab_autoshowhint');
    return saved !== null ? saved === 'true' : false;
  });

  // Timers & Statistics
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const cardLoadTimeRef = useRef<number>(Date.now());

  // Keep track of cards graded in this active session
  const [sessionGrades, setSessionGrades] = useState<{ [itemId: string]: number }>({});
  const [gradedIndices, setGradedIndices] = useState<Set<number>>(new Set());

  const [prevSetId, setPrevSetId] = useState<string>(setId);
  const [prevReviewAll, setPrevReviewAll] = useState<boolean>(reviewAll);

  const [activeStudyMode, setActiveStudyMode] = useState<'due' | 'all' | 'difficult' | 'new' | null>(null);

  // Compute live vocabulary dashboard statistics for Flashcards
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

  // Initialize and sync session cards when data loads
  useEffect(() => {
    if (sessionData?.words) {
      const cards: FlashcardWord[] = sessionData.words.map((word) => ({
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

      // If switching sets, switching modes, or on first initial load
      if (setId !== prevSetId || reviewAll !== prevReviewAll || !hasInitialized) {
        if (!reviewAll && cards.length > 0) {
          // Standard Spaced Repetition Due mode
          setSessionCards(cards);
          setOriginalCards(cards);
          setActiveStudyMode('due');
          setCurrentIndex(0);
          setIsFlipped(false);
          setShowHint(false);
          setIsCompleted(false);
          setSessionGrades({});
          setGradedIndices(new Set());
          setFailedItemIds(new Set());
          setHasInitialized(true);
          setPrevSetId(setId);
          setPrevReviewAll(reviewAll);
          cardLoadTimeRef.current = Date.now();
        } else if (reviewAll) {
          // Loaded all words – showing Smart Dashboard, active session cards are empty until user selects a mode!
          setSessionCards([]);
          setOriginalCards([]);
          setActiveStudyMode(null);
          setCurrentIndex(0);
          setIsFlipped(false);
          setShowHint(false);
          setIsCompleted(false);
          setSessionGrades({});
          setGradedIndices(new Set());
          setFailedItemIds(new Set());
          setHasInitialized(true);
          setPrevSetId(setId);
          setPrevReviewAll(reviewAll);
        }
      } else {
        // Background update: merge progress details without altering index/order
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
    }
  }, [sessionData, setId, prevSetId, reviewAll, prevReviewAll, hasInitialized]);

  // Start specific study mode from dashboard selection
  const handleStartStudyMode = useCallback((mode: 'all' | 'difficult' | 'new') => {
    if (!sessionData?.words) return;

    const cards: FlashcardWord[] = sessionData.words.map((word) => ({
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

    setSessionCards(filteredCards);
    setOriginalCards(filteredCards);
    setActiveStudyMode(mode);
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
  }, [sessionData]);

  // Restart Study Session helper
  const handleRestart = useCallback(() => {
    if (sessionData?.words) {
      const cards: FlashcardWord[] = sessionData.words.map((word) => ({
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

      setSessionCards(filteredCards);
      setOriginalCards(filteredCards);
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
    }
  }, [sessionData, activeStudyMode]);

  // Restart session with only cards marked as "Chưa thuộc" (quality === 1) in this active session
  const handleRestartFailedCards = useCallback(() => {
    if (originalCards.length === 0) return;

    // Filter unique failed cards to avoid duplicating them upon restart
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
  }, [originalCards, sessionGrades]);

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

  // Elapsed Timer effect
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Format Elapsed Time: MM:SS
  const elapsedTimeStr = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // Average Response Time
  const avgResponseTime = useMemo(() => {
    if (responseTimes.length === 0) return 0;
    const sum = responseTimes.reduce((acc, t) => acc + t, 0);
    return parseFloat((sum / responseTimes.length).toFixed(1));
  }, [responseTimes]);

  // Remaining Time estimate: ~MM:SS
  const remainingTimeStr = useMemo(() => {
    const totalRemainingCards = sessionCards.length - (currentIndex + 1);
    if (totalRemainingCards <= 0) return '00:00';

    const factor = avgResponseTime > 0 ? avgResponseTime : 5;
    const estRemainingSeconds = Math.round(totalRemainingCards * factor);
    
    const mins = Math.floor(estRemainingSeconds / 60);
    const secs = estRemainingSeconds % 60;
    return `~${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [sessionCards.length, currentIndex, avgResponseTime]);

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

  // Dynamic Statistics for current session
  const stats = useMemo(() => {
    let newCount = 0;
    let learningCount = 0;
    let masteredCount = 0;

    // Filter unique cards by item.id so we don't count duplicates
    const uniqueCards: FlashcardWord[] = [];
    const seenIds = new Set<string>();
    originalCards.forEach((card) => {
      if (!seenIds.has(card.item.id)) {
        seenIds.add(card.item.id);
        uniqueCards.push(card);
      }
    });

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
  }, [sessionCards, sessionGrades, avgResponseTime]);

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
      // Only set the grade if it hasn't been graded yet in this session (first attempt)
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

    // 1. Calculate SM-2 Client-side Optimistic State Update
    const currentProg = currentCard.progress;
    const currentEaseFactor = currentProg?.easeFactor ?? 2.5;
    const currentInterval = currentProg?.interval ?? 0;
    const currentRepetitions = currentProg?.repetitions ?? 0;

    const newRepetitions = quality < 3 ? 0 : currentRepetitions + 1;
    let newInterval = 1;
    if (quality >= 3) {
      if (newRepetitions === 1) newInterval = 1;
      else if (newRepetitions === 2) newInterval = 6;
      else newInterval = Math.round(currentInterval * currentEaseFactor);
    }
    const newEaseFactor = Math.max(1.3, currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    const nextStatus = newRepetitions >= 5 ? 'MASTERED' : newRepetitions > 0 ? 'LEARNING' : 'NEW';
    const nextMastery = Math.max(0.0, Math.min(1.0, newRepetitions * 0.2 + (newEaseFactor - 2.0) * 0.1));

    // Update sessionCards state instantly
    setSessionCards((prevCards) => {
      return prevCards.map((card) => {
        if (card.item.id !== itemId) return card;
        return {
          ...card,
          progress: {
            id: card.progress?.id ?? 'temp',
            status: nextStatus as any,
            streak: quality >= 3 ? (card.progress?.streak ?? 0) + 1 : 0,
            masteryLevel: nextMastery,
            repetitions: newRepetitions,
            interval: newInterval,
            easeFactor: newEaseFactor,
          },
        };
      });
    });

    // 2. Chuyển sang thẻ tiếp theo không chờ đợi (Zero Latency)
    if (!isLastCard) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
      cardLoadTimeRef.current = Date.now();
    } else {
      // Evaluate if we should start a new round or complete the session
      const activeFailedIds = new Set(failedItemIds);
      if (quality < 3) {
        activeFailedIds.add(itemId);
      }

      if (activeFailedIds.size > 0) {
        // Start a new round containing only the failed cards
        setSessionCards((prevCards) => {
          return prevCards.filter((c) => activeFailedIds.has(c.item.id));
        });
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

    // 3. Đẩy API Mutation lưu vào cơ sở dữ liệu ngầm (Background Save)
    reviewMutation.mutate(
      { itemId, quality },
      {
        onSuccess: (result: any) => {
          // Sync exact state from API response once saved successfully
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

    // Invalidate the detail query key only when session is completed (last card)
    if (isLastCard) {
      queryClient.invalidateQueries({
        queryKey: vocabularyKeys.detail(setId),
      });
    }
  }, [currentCard, currentIndex, sessionCards.length, reviewMutation, gradedIndices, queryClient, setId]);

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

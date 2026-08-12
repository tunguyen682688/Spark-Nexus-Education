import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListeningMaterialDetail, useUpdateListeningProgress } from './index';

export function useGapFillWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const updateProgressMutation = useUpdateListeningProgress();
  const lastSaveTimeRef = useRef(Date.now());
  const [completedSentences, setCompletedSentences] = useState<Set<number>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completedSentencesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    completedSentencesRef.current = completedSentences;
  }, [completedSentences]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        performSave(completedSentencesRef.current, false);
      }
    };
  }, []);

  // Fetch material detail
  const {
    data: material,
    isLoading,
    error,
  } = useListeningMaterialDetail(id || '');

  // Workspace states
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [singleSentenceLimit, setSingleSentenceLimit] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Gap-fill state
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const subtitles = material?.subtitles || [];
  const currentSub = subtitles[selectedSubIndex];

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Reset inputs when switching sentences
  useEffect(() => {
    setUserAnswers({});
    setIsSubmitted(false);
    setShowHints(false);
    setSingleSentenceLimit(null);
  }, [selectedSubIndex]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;

    if (singleSentenceLimit && time >= singleSentenceLimit.end) {
      audioRef.current.pause();
      setSingleSentenceLimit(null);
    }
  };

  const playSentence = (startTime: number, endTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTime;
    setSingleSentenceLimit({ start: startTime, end: endTime });
    audioRef.current
      .play()
      .catch((err) => console.error('Play sentence failed:', err));
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const cleanWord = (w: string) =>
    w
      .toLowerCase()
      .replace(/[.,\\/#!$%\\^&\\*;:{}=\-_`~()?]/g, '')
      .trim();

  // Seeded random number generator to keep the same blanks for the same sentence
  const seededRandom = (seed: string) => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
  };

  // Generate blank indices stably for current sentence
  const blankedIndices = useMemo<number[]>(() => {
    if (!currentSub) return [];
    const words = currentSub.text.split(/\s+/).filter(Boolean);
    const rand = seededRandom(currentSub.id);

    const candidates: number[] = [];
    words.forEach((w, idx) => {
      if (cleanWord(w).length > 3) {
        candidates.push(idx);
      }
    });

    if (candidates.length === 0) return [];

    const blanksCount = Math.min(
      3,
      Math.max(1, Math.round(candidates.length * 0.25))
    );

    const selected: number[] = [];
    const tempCandidates = [...candidates];

    for (let i = 0; i < blanksCount && tempCandidates.length > 0; i++) {
      const randIdx = Math.floor(rand() * tempCandidates.length);
      const chosenWordIdx = tempCandidates.splice(randIdx, 1)[0];
      selected.push(chosenWordIdx);
    }

    return selected.sort((a, b) => a - b);
  }, [currentSub]);

  const wordsList = useMemo(() => {
    if (!currentSub) return [];
    return currentSub.text.split(/\s+/).filter(Boolean);
  }, [currentSub]);

  // Score answers
  const scoreStats = useMemo(() => {
    if (blankedIndices.length === 0)
      return { correct: 0, total: 0, accuracy: 0 };
    let correct = 0;
    blankedIndices.forEach((idx) => {
      const originalCleaned = cleanWord(wordsList[idx]);
      const userCleaned = cleanWord(userAnswers[idx] || '');
      if (originalCleaned === userCleaned) {
        correct++;
      }
    });
    const accuracy = Math.round((correct / blankedIndices.length) * 100);
    return { correct, total: blankedIndices.length, accuracy };
  }, [blankedIndices, userAnswers, wordsList]);

  function performSave(currentCompleted: Set<number>, forceCompleted = false) {
    if (!material || subtitles.length === 0) return;
    const now = Date.now();
    const deltaSeconds = Math.round((now - lastSaveTimeRef.current) / 1000);
    lastSaveTimeRef.current = now;

    const progressVal = forceCompleted
      ? 100
      : Math.min(Math.round((currentCompleted.size / subtitles.length) * 100), 99);

    updateProgressMutation.mutate({
      id: material.id,
      progress: progressVal,
      lastPosition: 0,
      timeSpent: Math.max(deltaSeconds, 1),
      completed: forceCompleted || progressVal >= 100,
    });
  }

  const saveProgress = (currentCompleted: Set<number>, forceCompleted = false) => {
    if (forceCompleted) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      performSave(currentCompleted, true);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSave(currentCompleted, false);
    }, 3000);
  };

  const handleSubmitGapFill = () => {
    setIsSubmitted(true);
    setCompletedSentences((prev) => {
      const next = new Set(prev);
      next.add(selectedSubIndex);
      const allCompleted = subtitles.length > 0 && next.size === subtitles.length;
      saveProgress(next, allCompleted);
      return next;
    });
  };

  return {
    id,
    navigate,
    audioRef,
    material,
    isLoading,
    error,
    selectedSubIndex,
    setSelectedSubIndex,
    singleSentenceLimit,
    setSingleSentenceLimit,
    playbackSpeed,
    setPlaybackSpeed,
    userAnswers,
    setUserAnswers,
    isSubmitted,
    setIsSubmitted,
    showHints,
    setShowHints,
    subtitles,
    currentSub,
    handleTimeUpdate,
    playSentence,
    changeSpeed,
    cleanWord,
    blankedIndices,
    wordsList,
    scoreStats,
    completedSentences,
    handleSubmitGapFill,
  };
}

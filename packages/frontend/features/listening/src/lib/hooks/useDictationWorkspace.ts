import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useListeningMaterialDetail,
  useUpdateListeningProgress,
} from './index';

export function useDictationWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Subtitle / Dictation state
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranslation, setShowTranslation] = useState(false);

  // Dictation work progress
  const [typedTexts, setTypedTexts] = useState<Record<string, string>>({});
  const [submittedDictations, setSubmittedDictations] = useState<
    Record<string, boolean>
  >({});
  const [singleSentenceLimit, setSingleSentenceLimit] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // Timer states
  const [secondsSpent, setSecondsSpent] = useState(0);

  // Fetch material detail
  const {
    data: material,
    isLoading,
    error,
  } = useListeningMaterialDetail(id || '');
  const updateProgressMutation = useUpdateListeningProgress();
  const lastSaveTimeRef = useRef(Date.now());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const submittedDictationsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    submittedDictationsRef.current = submittedDictations;
  }, [submittedDictations]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        performSave(submittedDictationsRef.current, false);
      }
    };
  }, []);

  const subtitles = material?.subtitles || [];
  const currentSub = subtitles[selectedSubIndex];

  // Duration check
  useEffect(() => {
    if (audioRef.current && material) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, material]);

  // Practice Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSpent((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const handleAudioEnded = () => {
    const allCompleted = subtitles.length > 0 && subtitles.every((sub) => submittedDictations[sub.id]);
    saveProgress(submittedDictations, allCompleted);
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  function performSave(updatedSubmitted: Record<string, boolean>, forceCompleted = false) {
    if (!material || subtitles.length === 0) return;
    const now = Date.now();
    const deltaSeconds = Math.round((now - lastSaveTimeRef.current) / 1000);
    lastSaveTimeRef.current = now;

    const submittedCount = Object.keys(updatedSubmitted).filter(
      (k) => updatedSubmitted[k]
    ).length;

    const progressVal = forceCompleted
      ? 100
      : Math.min(
          Math.round(
            (submittedCount / subtitles.length) * 100
          ),
          99
        );

    updateProgressMutation.mutate({
      id: material.id,
      progress: progressVal,
      lastPosition: audioRef.current?.currentTime || 0,
      timeSpent: Math.max(deltaSeconds, 1),
      completed: forceCompleted || progressVal >= 100,
    });
  }

  const saveProgress = (updatedSubmitted: Record<string, boolean>, forceCompleted = false) => {
    if (forceCompleted) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      performSave(updatedSubmitted, true);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSave(updatedSubmitted, false);
    }, 3000);
  };

  const handleSubmitDictation = () => {
    if (!currentSub) return;
    const updated = { ...submittedDictations, [currentSub.id]: true };
    setSubmittedDictations(updated);
    const allCompleted = subtitles.length > 0 && subtitles.every((sub) => updated[sub.id]);
    saveProgress(updated, allCompleted);
  };

  const cleanWord = (w: string) =>
    w
      .toLowerCase()
      .replace(/[.,\\/#!$%\\^&\\*;:{}=\-_`~()?]/g, '')
      .trim();

  const getDictationStats = (original: string, typed: string) => {
    const originalWords = original.split(/\s+/).filter(Boolean);
    const typedWords = (typed || '')
      .split(/\s+/)
      .filter(Boolean)
      .map(cleanWord);

    let correctCount = 0;
    originalWords.forEach((word, idx) => {
      const cleaned = cleanWord(word);
      const typedCleaned = typedWords[idx] || '';
      if (cleaned === typedCleaned) {
        correctCount++;
      }
    });

    const accuracy =
      originalWords.length > 0
        ? Math.round((correctCount / originalWords.length) * 100)
        : 0;
    return { correctCount, totalCount: originalWords.length, accuracy };
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleResetCurrent = () => {
    if (!currentSub) return;
    setTypedTexts({ ...typedTexts, [currentSub.id]: '' });
    setSubmittedDictations({ ...submittedDictations, [currentSub.id]: false });
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
    playbackSpeed,
    showTranslation,
    setShowTranslation,
    typedTexts,
    setTypedTexts,
    submittedDictations,
    setSubmittedDictations,
    singleSentenceLimit,
    setSingleSentenceLimit,
    secondsSpent,
    subtitles,
    currentSub,
    handleTimeUpdate,
    playSentence,
    handleAudioEnded,
    changeSpeed,
    saveProgress,
    handleSubmitDictation,
    cleanWord,
    getDictationStats,
    formatTime,
    handleResetCurrent,
  };
}

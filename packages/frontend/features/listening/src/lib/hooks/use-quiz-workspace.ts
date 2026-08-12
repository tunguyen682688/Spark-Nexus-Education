import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListeningMaterialDetail, useUpdateListeningProgress } from './index';

export function useQuizWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [submittedAnswers, setSubmittedAnswers] = useState<
    Record<string, boolean>
  >({});

  const updateProgressMutation = useUpdateListeningProgress();
  const lastSaveTimeRef = useRef(Date.now());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const submittedAnswersRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    submittedAnswersRef.current = submittedAnswers;
  }, [submittedAnswers]);

  // Fetch material detail
  const {
    data: material,
    isLoading,
    error,
  } = useListeningMaterialDetail(id || '');

  const questions = material?.questions || [];

  const performSave = useCallback((updatedSubmitted: Record<string, boolean>, forceCompleted = false) => {
    if (!material) return;
    const now = Date.now();
    const deltaSeconds = Math.round((now - lastSaveTimeRef.current) / 1000);
    lastSaveTimeRef.current = now;

    const submittedCount = Object.keys(updatedSubmitted).filter((k) => updatedSubmitted[k]).length;
    const progressVal = forceCompleted
      ? 100
      : Math.min(Math.round((submittedCount / Math.max(questions.length, 1)) * 100), 99);

    updateProgressMutation.mutate({
      id: material.id,
      progress: progressVal,
      lastPosition: 0,
      timeSpent: Math.max(deltaSeconds, 1),
      completed: forceCompleted || progressVal >= 100,
    });
  }, [material, questions.length, updateProgressMutation]);

  const performSaveRef = useRef(performSave);
  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        performSaveRef.current(submittedAnswersRef.current, false);
      }
    };
  }, []);

  // Sync speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .catch((err) => console.error('Play failed:', err));
      setIsPlaying(true);
    }
  }, [isPlaying]);

  // Keyboard shortcuts for audio control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowLeft') {
        if (audioRef.current) {
          e.preventDefault();
          const seekTime = Math.max(0, audioRef.current.currentTime - 5);
          audioRef.current.currentTime = seekTime;
          setCurrentTime(seekTime);
        }
      } else if (e.code === 'ArrowRight') {
        if (audioRef.current) {
          e.preventDefault();
          const seekTime = Math.min(duration, audioRef.current.currentTime + 5);
          audioRef.current.currentTime = seekTime;
          setCurrentTime(seekTime);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isPlaying, handlePlayPause]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || material?.duration || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const handleReplaySegment = (timestamp: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = timestamp;
    setCurrentTime(timestamp);
    audioRef.current
      .play()
      .catch((err) => console.error('Play timestamp failed:', err));
    setIsPlaying(true);
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (submittedAnswers[questionId]) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const saveProgress = useCallback((updatedSubmitted: Record<string, boolean>, forceCompleted = false) => {
    if (forceCompleted) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      performSave(updatedSubmitted, true);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSave(updatedSubmitted, false);
    }, 3000);
  }, [performSave]);

  const handleSubmitAnswer = (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    const updated = { ...submittedAnswers, [questionId]: true };
    setSubmittedAnswers(updated);
    const allSubmitted = questions.every((q) => updated[q.id]);
    saveProgress(updated, allSubmitted);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const submittedCount = Object.keys(submittedAnswers).filter(
    (k) => submittedAnswers[k]
  ).length;

  const correctCount = questions.filter((q) => {
    const selectedOption = selectedAnswers[q.id];
    const isSubmitted = submittedAnswers[q.id];
    if (!isSubmitted) return false;

    if (!q.options || q.options.length === 0) {
      return (
        (selectedOption || '').trim().toLowerCase() ===
        q.correctAnswer.trim().toLowerCase()
      );
    }
    return selectedOption === q.correctAnswer;
  }).length;

  return {
    id,
    navigate,
    audioRef,
    material,
    isLoading,
    error,
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    playbackSpeed,
    setPlaybackSpeed,
    selectedAnswers,
    setSelectedAnswers,
    submittedAnswers,
    setSubmittedAnswers,
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleAudioEnded,
    handleSeek,
    changeSpeed,
    handleReplaySegment,
    handleSelectOption,
    handleSubmitAnswer,
    formatTime,
    questions,
    submittedCount,
    correctCount,
  };
}

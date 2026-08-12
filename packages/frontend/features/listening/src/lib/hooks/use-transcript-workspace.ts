import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListeningMaterialDetail, useUpdateListeningProgress } from './index';

export function useTranscriptWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const subtitleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch material detail
  const { data: material, isLoading, error } = useListeningMaterialDetail(id || '');
  const updateProgressMutation = useUpdateListeningProgress();
  const lastSaveTimeRef = useRef(Date.now());

  // Subtitle synchronization state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);

  const saveProgress = useCallback((forceCompleted = false) => {
    if (!audioRef.current || !material) return;

    const now = Date.now();
    const deltaSeconds = Math.round((now - lastSaveTimeRef.current) / 1000);
    lastSaveTimeRef.current = now;

    const currentPos = audioRef.current.currentTime;
    const totalDuration = duration || material.duration || 100;
    const progressVal = forceCompleted ? 100 : Math.min(Math.round((currentPos / totalDuration) * 100), 100);

    updateProgressMutation.mutate({
      id: material.id,
      progress: progressVal,
      lastPosition: currentPos,
      timeSpent: Math.max(deltaSeconds, 1),
      completed: forceCompleted || progressVal >= 99,
    });
  }, [material, duration, updateProgressMutation]);

  // Periodically save progress with ref to avoid stale closures
  const saveProgressRef = useRef<(forceCompleted?: boolean) => void>(() => { return; });
  useEffect(() => {
    saveProgressRef.current = saveProgress;
  }, [saveProgress]);

  useEffect(() => {
    if (!isPlaying || !material) return;

    const interval = setInterval(() => {
      saveProgressRef.current();
    }, 10000); // every 10s

    return () => clearInterval(interval);
  }, [isPlaying, material]);

  // Set speed
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
      saveProgress();
    } else {
      lastSaveTimeRef.current = Date.now();
      audioRef.current.play().catch((err) => console.error('Play failed:', err));
      setIsPlaying(true);
    }
  }, [isPlaying, saveProgress]);

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
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    const activeSub = material?.subtitles?.find(
      (sub) => time >= sub.startTime && time <= sub.endTime
    );

    if (activeSub) {
      const activeEl = subtitleRefs.current[activeSub.id];
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || material?.duration || 0);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    saveProgress(true);
  };

  const handleSubtitleClick = (startTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTime;
    setCurrentTime(startTime);
    if (!isPlaying) {
      audioRef.current.play().catch((err) => console.error('Play failed:', err));
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat((e.target as HTMLInputElement).value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  const getActiveSubtitleId = () => {
    const active = material?.subtitles?.find(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    return active ? active.id : null;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return {
    id,
    navigate,
    audioRef,
    subtitleRefs,
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
    showTranslation,
    setShowTranslation,
    saveProgress,
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleAudioEnded,
    handleSubtitleClick,
    handleSeek,
    changeSpeed,
    getActiveSubtitleId,
    formatTime,
  };
}

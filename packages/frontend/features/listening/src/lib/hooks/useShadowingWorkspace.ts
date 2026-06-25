import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListeningMaterialDetail, useUpdateListeningProgress } from './index';

export function useShadowingWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const updateProgressMutation = useUpdateListeningProgress();
  const lastSaveTimeRef = useRef(Date.now());
  const [practisedSentences, setPractisedSentences] = useState<Set<number>>(new Set());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const practisedSentencesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    practisedSentencesRef.current = practisedSentences;
  }, [practisedSentences]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        performSave(practisedSentencesRef.current, false);
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

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  const subtitles = material?.subtitles || [];
  const currentSub = subtitles[selectedSubIndex];

  // Sync playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Clean up recorded audio url on change sentence or unmount
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    };
  }, [recordedAudioUrl]);

  // Reset recording state on sentence switch
  useEffect(() => {
    setRecordedAudioUrl(null);
    setMicError(null);
    if (isRecording) {
      stopRecording();
    }
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

  // Recording Handlers
  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      setMicError(
        'Vui lòng cấp quyền truy cập Microphone trong trình duyệt của bạn để luyện Shadowing.'
      );
    }
  };

  function performSave(currentPractised: Set<number>, forceCompleted = false) {
    if (!material || subtitles.length === 0) return;
    const now = Date.now();
    const deltaSeconds = Math.round((now - lastSaveTimeRef.current) / 1000);
    lastSaveTimeRef.current = now;

    const progressVal = forceCompleted
      ? 100
      : Math.min(Math.round((currentPractised.size / subtitles.length) * 100), 99);

    updateProgressMutation.mutate({
      id: material.id,
      progress: progressVal,
      lastPosition: 0,
      timeSpent: Math.max(deltaSeconds, 1),
      completed: forceCompleted || progressVal >= 100,
    });
  }

  const saveProgress = (currentPractised: Set<number>, forceCompleted = false) => {
    if (forceCompleted) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      performSave(currentPractised, true);
      return;
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      performSave(currentPractised, false);
    }, 3000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      setPractisedSentences((prev) => {
        const next = new Set(prev);
        next.add(selectedSubIndex);
        const allCompleted = subtitles.length > 0 && next.size === subtitles.length;
        saveProgress(next, allCompleted);
        return next;
      });
    }
  };

  const handlePlayUserAudio = () => {
    if (userAudioRef.current) {
      userAudioRef.current
        .play()
        .catch((err) => console.error('Play user audio failed:', err));
    }
  };

  const changeSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
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
    userAudioRef,
    material,
    isLoading,
    error,
    selectedSubIndex,
    setSelectedSubIndex,
    singleSentenceLimit,
    setSingleSentenceLimit,
    playbackSpeed,
    setPlaybackSpeed,
    isRecording,
    setIsRecording,
    recordedAudioUrl,
    setRecordedAudioUrl,
    micError,
    setMicError,
    subtitles,
    currentSub,
    handleTimeUpdate,
    playSentence,
    startRecording,
    stopRecording,
    handlePlayUserAudio,
    changeSpeed,
    formatTime,
    practisedSentences,
    saveProgress,
  };
}

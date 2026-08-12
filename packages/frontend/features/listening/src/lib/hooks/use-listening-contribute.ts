import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateListeningMaterial } from './index';

export interface SubtitleLine {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  translation: string;
  order: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'multiple-choice' | 'gap-fill';
  options: string[];
  correctAnswer: string;
  explanation: string;
  audioTimestamp: number;
  order: number;
}

// Helper utility to parse YouTube Video ID
const getYoutubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export function useListeningContribute() {
  const navigate = useNavigate();
  const createMaterialMutation = useCreateListeningMaterial();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // STEP 1: METADATA & MEDIA STATES
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<'podcast' | 'audio' | 'exam' | 'video'>('podcast');
  const [difficulty, setDifficulty] = useState<string>('B1');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(180);
  const [tagsText, setTagsText] = useState<string>('');

  // STEP 2: TRANSCRIPT STUDIO STATES
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [bulkText, setBulkText] = useState<string>('');
  const [isBulkInputOpen, setIsBulkInputOpen] = useState<boolean>(false);
  const [activeSyncIndex, setActiveSyncIndex] = useState<number>(0);

  // STEP 3: QUIZ BUILDER STATES
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Studio Player states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<boolean>(false);
  const [audioTime, setAudioTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);

  // Form submit notifications
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Sync YouTube details on mediaUrl changes
  useEffect(() => {
    const ytId = getYoutubeId(mediaUrl);
    if (ytId) {
      if (!thumbnailUrl) {
        setThumbnailUrl(`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`);
      }
      if (category !== 'video') {
        setCategory('video');
      }
    }
  }, [mediaUrl, category, thumbnailUrl]);

  // Audio Playback progress tracking
  useEffect(() => {
    const player = audioRef.current;
    if (!player) return;

    const onTimeUpdate = () => {
      setAudioTime(player.currentTime);
    };

    const onLoadedMetadata = () => {
      setAudioDuration(player.duration);
      setDuration(Math.round(player.duration));
    };

    const onPlay = () => setAudioPlaying(true);
    const onPause = () => setAudioPlaying(false);

    player.addEventListener('timeupdate', onTimeUpdate);
    player.addEventListener('loadedmetadata', onLoadedMetadata);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('timeupdate', onTimeUpdate);
      player.removeEventListener('loadedmetadata', onLoadedMetadata);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [mediaUrl]);

  const togglePlayback = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          setErrorMsg('Không thể phát tệp âm thanh. Vui lòng kiểm tra lại liên kết tệp.');
        });
      }
    }
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setAudioTime(seconds);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Bulk Parse Transcript
  const handleBulkParse = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsedLines: SubtitleLine[] = lines.map((text, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      startTime: 0,
      endTime: 0,
      text,
      translation: '',
      order: idx + 1,
    }));

    setSubtitles(parsedLines);
    setBulkText('');
    setIsBulkInputOpen(false);
    setActiveSyncIndex(0);
    setErrorMsg('');
  };

  const handleAddSubtitleRow = () => {
    const nextOrder = subtitles.length + 1;
    const newRow: SubtitleLine = {
      id: `sub-${Date.now()}-${nextOrder}`,
      startTime: 0,
      endTime: 0,
      text: '',
      translation: '',
      order: nextOrder,
    };
    setSubtitles([...subtitles, newRow]);
  };

  const handleRemoveSubtitleRow = (id: string) => {
    const updated = subtitles
      .filter((sub) => sub.id !== id)
      .map((sub, idx) => ({
        ...sub,
        order: idx + 1,
      }));
    setSubtitles(updated);
  };

  const handleUpdateSubtitleField = <K extends keyof SubtitleLine>(id: string, field: K, value: SubtitleLine[K]) => {
    const updated = subtitles.map((sub) => {
      if (sub.id === id) {
        return { ...sub, [field]: value };
      }
      return sub;
    });
    setSubtitles(updated);
  };

  const handleSyncCurrentTime = () => {
    if (activeSyncIndex >= subtitles.length) return;

    const targetSub = subtitles[activeSyncIndex];
    const roundedTime = Math.round(audioTime * 100) / 100;

    if (targetSub.startTime === 0 && targetSub.endTime === 0) {
      handleUpdateSubtitleField(targetSub.id, 'startTime', roundedTime);
    } else {
      const updated = subtitles.map((sub, idx) => {
        if (sub.id === targetSub.id) {
          return { ...sub, endTime: roundedTime };
        }
        if (idx === activeSyncIndex + 1 && sub.startTime === 0) {
          return { ...sub, startTime: roundedTime };
        }
        return sub;
      });
      setSubtitles(updated);
      setActiveSyncIndex(activeSyncIndex + 1);
    }
  };

  const handleResetSyncIndex = (idx: number) => {
    if (idx >= 0 && idx < subtitles.length) {
      setActiveSyncIndex(idx);
    }
  };

  // STEP 3: QUIZ BUILDER HANDLERS
  const handleAddQuestion = () => {
    const nextOrder = questions.length + 1;
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}-${nextOrder}`,
      questionText: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      audioTimestamp: 0,
      order: nextOrder,
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleRemoveQuestion = (id: string) => {
    const updated = questions
      .filter((q) => q.id !== id)
      .map((q, idx) => ({
        ...q,
        order: idx + 1,
      }));
    setQuestions(updated);
  };

  const handleUpdateQuestion = (id: string, updatedFields: Partial<QuizQuestion>) => {
    const updated = questions.map((q) => {
      if (q.id === id) {
        return { ...q, ...updatedFields };
      }
      return q;
    });
    setQuestions(updated);
  };

  const handleGhimQuestionAudioTimestamp = (id: string) => {
    const roundedTime = Math.round(audioTime);
    handleUpdateQuestion(id, { audioTimestamp: roundedTime });
  };

  // STEP 4: SUBMIT AND UPLOAD
  const handleSubmitPublish = async () => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập Tiêu đề bài nghe.');
      setCurrentStep(1);
      return;
    }
    if (!mediaUrl.trim()) {
      setErrorMsg('Vui lòng nhập Đường dẫn âm thanh.');
      setCurrentStep(1);
      return;
    }
    if (subtitles.length === 0) {
      setErrorMsg('Vui lòng nhập hoặc biên dịch Lời thoại (Transcript) ở Bước 2.');
      setCurrentStep(2);
      return;
    }

    const tagsList = tagsText
      ? tagsText.split(',').map((t) => t.trim()).filter(Boolean)
      : [category];

    const payloadSubtitles = subtitles.map((sub) => ({
      startTime: sub.startTime,
      endTime: sub.endTime,
      text: sub.text,
      translation: sub.translation || undefined,
      order: sub.order,
    }));

    const payloadQuestions = questions.map((q) => ({
      questionText: q.questionText,
      options: q.type === 'gap-fill' ? [] : q.options.filter(Boolean),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || undefined,
      audioTimestamp: q.audioTimestamp || undefined,
      order: q.order,
    }));

    const ytId = getYoutubeId(mediaUrl);

    try {
      await createMaterialMutation.mutateAsync({
        title,
        author: author || 'Spark Nexus Instructor',
        description: description || 'Tài liệu biên dịch luyện nghe.',
        category,
        difficulty,
        mediaUrl,
        youtubeId: ytId || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        duration: duration || 120,
        isCommunity: true,
        tags: tagsList,
        subtitles: payloadSubtitles,
        questions: payloadQuestions,
      });

      setSuccessMsg('Đã xuất bản tài liệu luyện nghe thành công! Đang chuyển trang chủ...');
      setErrorMsg('');

      setTimeout(() => {
        navigate('/listening');
      }, 2500);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMsg(error?.response?.data?.message || error?.message || 'Lỗi khi gửi dữ liệu lên máy chủ.');
    }
  };

  // Mock preview material
  const mockMaterialPreview = {
    id: 'preview-material',
    title: title || 'Biên soạn Luyện nghe (Xem thử)',
    description: description || 'Mô tả bài nghe thử.',
    category,
    difficulty,
    mediaUrl,
    youtubeId: getYoutubeId(mediaUrl) || undefined,
    thumbnailUrl: thumbnailUrl || undefined,
    duration: duration || 120,
    author: author || 'Xem trước',
    viewCount: 0,
    isCommunity: true,
    upvotes: 0,
    downvotes: 0,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: tagsText ? tagsText.split(',') : [],
    subtitles: subtitles.map((s, idx) => ({
      id: `preview-sub-${idx}`,
      materialId: 'preview-material',
      startTime: s.startTime,
      endTime: s.endTime,
      text: s.text,
      translation: s.translation,
      order: s.order,
    })),
    questions: questions.map((q, idx) => ({
      id: `preview-q-${idx}`,
      materialId: 'preview-material',
      questionText: q.questionText,
      options: q.type === 'gap-fill' ? [] : q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      audioTimestamp: q.audioTimestamp,
      order: q.order,
    })),
    userProgress: null,
  };

  return {
    navigate,
    currentStep,
    setCurrentStep,
    title,
    setTitle,
    author,
    setAuthor,
    description,
    setDescription,
    category,
    setCategory,
    difficulty,
    setDifficulty,
    mediaUrl,
    setMediaUrl,
    thumbnailUrl,
    setThumbnailUrl,
    duration,
    setDuration,
    tagsText,
    setTagsText,
    subtitles,
    setSubtitles,
    bulkText,
    setBulkText,
    isBulkInputOpen,
    setIsBulkInputOpen,
    activeSyncIndex,
    setActiveSyncIndex,
    questions,
    setQuestions,
    audioRef,
    audioPlaying,
    setAudioPlaying,
    audioTime,
    audioDuration,
    errorMsg,
    setErrorMsg,
    successMsg,
    setSuccessMsg,
    togglePlayback,
    seekTo,
    formatDuration,
    handleBulkParse,
    handleAddSubtitleRow,
    handleRemoveSubtitleRow,
    handleUpdateSubtitleField,
    handleSyncCurrentTime,
    handleResetSyncIndex,
    handleAddQuestion,
    handleRemoveQuestion,
    handleUpdateQuestion,
    handleGhimQuestionAudioTimestamp,
    handleSubmitPublish,
    mockMaterialPreview,
    createMaterialMutation,
  };
}

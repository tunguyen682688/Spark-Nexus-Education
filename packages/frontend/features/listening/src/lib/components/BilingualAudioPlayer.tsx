import { useRef, useState, useEffect } from 'react';
import { ListeningMaterial } from '../types';
import { useUpdateListeningProgress } from '../hooks';
import { Play, Pause, RotateCcw, Volume2, Languages, HelpCircle, FileText, Gauge, Sparkles } from 'lucide-react';
import { LISTENING_WORKSPACE_TEXT } from '../constants';
import PlayerTranscriptTab from './PlayerTranscriptTab';
import PlayerDictationTab from './PlayerDictationTab';
import PlayerQuizTab from './PlayerQuizTab';

interface BilingualAudioPlayerProps {
  material: ListeningMaterial;
  onBack: () => void;
}

export default function BilingualAudioPlayer({ material, onBack }: BilingualAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const subtitleRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(material.duration || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranslation, setShowTranslation] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'quiz' | 'dictation'>('transcript');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  // Dictation/Shadow Writing states
  const [selectedSubIndex, setSelectedSubIndex] = useState(0);
  const [typedTexts, setTypedTexts] = useState<Record<string, string>>({});
  const [submittedDictations, setSubmittedDictations] = useState<Record<string, boolean>>({});
  const [singleSentenceLimit, setSingleSentenceLimit] = useState<{ start: number; end: number } | null>(null);

  const updateProgressMutation = useUpdateListeningProgress();

  // Load progress if exists
  useEffect(() => {
    if (audioRef.current && material.userProgress) {
      audioRef.current.currentTime = material.userProgress.lastPosition || 0;
    }
  }, [material.userProgress]);

  // Set speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Periodically save progress
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      saveProgress();
    }, 10000); // every 10s

    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const saveProgress = (forceCompleted = false) => {
    if (!audioRef.current) return;

    const currentPos = audioRef.current.currentTime;
    const progressVal = forceCompleted ? 100 : Math.min(Math.round((currentPos / duration) * 100), 100);

    updateProgressMutation.mutate({
      id: material.id,
      progress: progressVal,
      lastPosition: currentPos,
      timeSpent: 10, // approximate additional seconds spent
      completed: forceCompleted || progressVal >= 99,
    });
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      saveProgress();
    } else {
      audioRef.current.play().catch((err: any) => console.error('Play failed:', err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);

    // Stop if we hit the limit of a single sentence play
    if (singleSentenceLimit && time >= singleSentenceLimit.end) {
      audioRef.current.pause();
      setIsPlaying(false);
      setSingleSentenceLimit(null);
    }

    // Auto-scroll active subtitle row into view
    if (activeTab !== 'dictation') {
      const activeSub = material.subtitles?.find(
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
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration || material.duration);
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
      audioRef.current.play().catch((err: any) => console.error('Play failed:', err));
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

  const playSentence = (startTime: number, endTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = startTime;
    setCurrentTime(startTime);
    setSingleSentenceLimit({ start: startTime, end: endTime });
    audioRef.current.play().catch((err: any) => console.error('Play sentence failed:', err));
    setIsPlaying(true);
  };


  const getActiveSubtitleId = () => {
    const active = material.subtitles?.find(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    );
    return active ? active.id : null;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Quiz handles
  const handleSelectOption = (questionId: string, option: string) => {
    if (submittedAnswers[questionId]) return; // locked once submitted
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    setSubmittedAnswers((prev) => ({ ...prev, [questionId]: true }));
  };

  const activeSubId = getActiveSubtitleId();

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Audio player ref */}
      <audio
        ref={audioRef}
        src={material.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Header Info */}
      <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] tracking-wider font-bold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              {material.difficulty} • {material.category}
            </span>
            <h1 className="text-lg font-extrabold text-slate-200 truncate max-w-lg mt-1">
              {material.title}
            </h1>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'transcript'
                ? 'bg-purple-600 text-white shadow shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {LISTENING_WORKSPACE_TEXT.PLAYER.TRANSCRIPT_TAB}
          </button>
          <button
            onClick={() => setActiveTab('dictation')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'dictation'
                ? 'bg-purple-600 text-white shadow shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {LISTENING_WORKSPACE_TEXT.PLAYER.SHADOW_WRITING_TAB}
          </button>
          {material.questions && material.questions.length > 0 && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'quiz'
                  ? 'bg-purple-600 text-white shadow shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {LISTENING_WORKSPACE_TEXT.PLAYER.QUIZ_TAB(material.questions.length)}
            </button>
          )}
        </div>
      </div>      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-955/40">
        {activeTab === 'transcript' ? (
          <PlayerTranscriptTab
            subtitles={material.subtitles}
            activeSubId={activeSubId}
            showTranslation={showTranslation}
            onSubtitleClick={handleSubtitleClick}
            onRegisterRef={(id, el) => {
              subtitleRefs.current[id] = el;
            }}
            formatTime={formatTime}
          />
        ) : activeTab === 'dictation' ? (
          <PlayerDictationTab
            subtitles={material.subtitles}
            selectedSubIndex={selectedSubIndex}
            onSelectSubIndex={(idx) => {
              setSelectedSubIndex(idx);
              setSingleSentenceLimit(null);
            }}
            typedTexts={typedTexts}
            onTypedTextChange={(id, value) => {
              setTypedTexts((prev) => ({ ...prev, [id]: value }));
              if (submittedDictations[id]) {
                setSubmittedDictations((prev) => ({ ...prev, [id]: false }));
              }
            }}
            submittedDictations={submittedDictations}
            onSubmittedDictationChange={(id, submitted) => {
              setSubmittedDictations((prev) => ({ ...prev, [id]: submitted }));
            }}
            playSentence={playSentence}
            showTranslation={showTranslation}
          />
        ) : (
          <PlayerQuizTab
            questions={material.questions}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={handleSelectOption}
            submittedAnswers={submittedAnswers}
            onSubmitAnswer={handleSubmitAnswer}
            onPlayTimestamp={handleSubtitleClick}
          />
        )}
      </div>

      {/* Footer Player Controls */}
      <div className="p-6 bg-slate-900 border-t border-slate-800 space-y-4">
        {/* Seekbar */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-mono w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-slate-950 rounded-full appearance-none cursor-pointer accent-purple-500 focus:outline-none"
          />
          <span className="text-xs text-slate-500 font-mono w-10">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action Panel */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Bilingual toggle */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${
                showTranslation
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Languages className="w-4 h-4" />
              {LISTENING_WORKSPACE_TEXT.PLAYER.BILINGUAL}
            </button>

            {/* Playback speed control */}
            <button
              onClick={changeSpeed}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <Gauge className="w-4 h-4" />
              {LISTENING_WORKSPACE_TEXT.PLAYER.SPEED_LABEL(playbackSpeed)}
            </button>
          </div>

          {/* Core play control */}
          <button
            onClick={handlePlayPause}
            className="flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all shadow-lg shadow-purple-600/20 transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Right spacer for centering */}
          <div className="w-36 flex items-center justify-end gap-2 text-slate-500 text-xs font-medium">
            <Volume2 className="w-4 h-4" />
            <span>{LISTENING_WORKSPACE_TEXT.PLAYER.VOLUME}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

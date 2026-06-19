import { useRef, useState, useEffect } from 'react';
import { ListeningMaterial } from '../types';
import { useUpdateListeningProgress } from '../hooks';
import { Play, Pause, RotateCcw, Volume2, Languages, HelpCircle, FileText, CheckCircle2, XCircle, Info, Gauge } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'transcript' | 'quiz'>('transcript');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

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

    // Auto-scroll active subtitle row into view
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
        {material.questions && material.questions.length > 0 && (
          <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('transcript')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'transcript'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Lời thoại
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'quiz'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Bài tập ({material.questions.length})
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-950/40">
        {activeTab === 'transcript' ? (
          /* Subtitles list */
          <div className="space-y-4 max-w-3xl mx-auto">
            {material.subtitles && material.subtitles.length > 0 ? (
              material.subtitles.map((sub) => {
                const isActive = activeSubId === sub.id;
                return (
                  <div
                    key={sub.id}
                    ref={(el) => {
                      subtitleRefs.current[sub.id] = el;
                    }}
                    onClick={() => handleSubtitleClick(sub.startTime)}
                    className={`group p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? 'bg-purple-600/10 border-purple-500/40 shadow-lg shadow-purple-500/5'
                        : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700/80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Seek timing indicator */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isActive 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                      }`}>
                        {formatTime(sub.startTime)}
                      </span>

                      {/* Transcripts Text */}
                      <div className="flex-1 space-y-1.5">
                        <p className={`text-base font-semibold transition-colors duration-300 leading-relaxed ${
                          isActive ? 'text-slate-100' : 'text-slate-300'
                        }`}>
                          {sub.text}
                        </p>
                        {showTranslation && sub.translation && (
                          <p className={`text-sm transition-colors duration-300 leading-relaxed ${
                            isActive ? 'text-purple-300/90' : 'text-slate-500'
                          }`}>
                            {sub.translation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-slate-500">
                <Info className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                Không tìm thấy phụ đề cho tài liệu nghe này.
              </div>
            )}
          </div>
        ) : (
          /* Quiz questions list */
          <div className="space-y-8 max-w-2xl mx-auto pb-12">
            {material.questions?.map((q, idx) => {
              const selectedOption = selectedAnswers[q.id];
              const isSubmitted = submittedAnswers[q.id];
              const isCorrect = isSubmitted && selectedOption === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-200 leading-relaxed">
                      Câu hỏi {idx + 1}: {q.questionText}
                    </h3>

                    {/* Question audio timestamp seeker */}
                    {q.audioTimestamp !== undefined && q.audioTimestamp !== null && (
                      <button
                        onClick={() => handleSubtitleClick(q.audioTimestamp!)}
                        className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Nghe lại
                      </button>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-5">
                    {q.options.map((opt) => {
                      const isSelected = selectedOption === opt;
                      const isOptionCorrectAnswer = opt === q.correctAnswer;
                      
                      let optionStyle = 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 text-slate-300';
                      if (isSelected) {
                        optionStyle = 'border-purple-500 bg-purple-500/10 text-purple-300';
                      }
                      if (isSubmitted) {
                        if (isOptionCorrectAnswer) {
                          optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                        } else if (isSelected) {
                          optionStyle = 'border-red-500 bg-red-500/10 text-red-400';
                        } else {
                          optionStyle = 'border-slate-800 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <div
                          key={opt}
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${optionStyle}`}
                        >
                          <span className="text-sm font-semibold">{opt}</span>
                          {isSubmitted && isOptionCorrectAnswer && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          {isSubmitted && isSelected && !isOptionCorrectAnswer && <XCircle className="w-5 h-5 text-red-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  {!isSubmitted ? (
                    <button
                      onClick={() => handleSubmitAnswer(q.id)}
                      disabled={!selectedOption}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-purple-600/10"
                    >
                      Kiểm tra đáp án
                    </button>
                  ) : (
                    /* Explanation block */
                    <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="text-emerald-400 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Chính xác</span>
                        ) : (
                          <span className="text-red-400 font-bold text-xs bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Sai rồi</span>
                        )}
                        <span className="text-xs text-slate-500">Đáp án: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          <strong>Giải thích:</strong> {q.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
              Song ngữ
            </button>

            {/* Playback speed control */}
            <button
              onClick={changeSpeed}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-950/40 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
            >
              <Gauge className="w-4 h-4" />
              Tốc độ: {playbackSpeed}x
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
            <span>Âm lượng</span>
          </div>
        </div>
      </div>
    </div>
  );
}

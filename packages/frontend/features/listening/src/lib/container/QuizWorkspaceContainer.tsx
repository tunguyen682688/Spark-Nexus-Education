import { useQuizWorkspace } from '../hooks';
import {
  ArrowLeft,
  Info,
  RefreshCw,
  Award,
  Trophy,
} from 'lucide-react';
import QuizAudioPlayerCard from '../components/QuizAudioPlayerCard';
import QuizQuestionsList from '../components/QuizQuestionsList';
import { LISTENING_WORKSPACE_TEXT, LISTENING_ROUTES } from '../constants';

export default function QuizWorkspaceContainer() {
  const {
    navigate,
    audioRef,
    material,
    isLoading,
    error,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    selectedAnswers,
    submittedAnswers,
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
  } = useQuizWorkspace();

  const common = LISTENING_WORKSPACE_TEXT.COMMON;
  const text = LISTENING_WORKSPACE_TEXT.QUIZ;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-sm font-medium animate-pulse">
          {common.LOADING_QUIZ}
        </p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <Info className="w-12 h-12 text-red-500/80 mb-3" />
        <h2 className="text-lg font-bold">{common.ERROR_QUIZ_TITLE}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {common.ERROR_MATERIAL_DESC}
        </p>
        <button
          onClick={() => navigate(LISTENING_ROUTES.STUDY(material?.id || ''))}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-slate-200 rounded-xl text-xs font-bold"
        >
          {common.BACK_TO_DASHBOARD}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={material.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Workspace Header */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-250 hover:bg-slate-850 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {text.MODE_LABEL}
              </span>
              <span className="text-xs text-slate-500">
                • {material.difficulty}
              </span>
            </div>
            <h1 className="text-base font-extrabold text-slate-202 mt-0.5 truncate max-w-md">
              {material.title}
            </h1>
          </div>
        </div>

        {/* Dashboard summary inline */}
        <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-850 rounded-xl">
            <Award className="w-4 h-4 text-purple-400" />
            <span>
              {text.STATS_DONE(submittedCount, questions.length)}
            </span>
          </div>
          {submittedCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <span>
                {text.STATS_CORRECT(correctCount, submittedCount)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-full mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)]">
        {/* Left Side: Audio Player Card */}
        <QuizAudioPlayerCard
          material={material}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          currentTime={currentTime}
          duration={duration}
          handlePlayPause={handlePlayPause}
          handleSeek={handleSeek}
          changeSpeed={changeSpeed}
          formatTime={formatTime}
        />

        {/* Right Side: Questions list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6 custom-scrollbar h-full pb-12">
          {submittedCount === questions.length && questions.length > 0 && (
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-indigo-950/40 border border-purple-500/30 rounded-2xl text-center space-y-5 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <Trophy className="w-16 h-16 text-yellow-450 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100">{text.CONGRATS_TITLE}</h3>
                <p className="text-xs text-slate-400">{text.CONGRATS_DESC}</p>
              </div>
              <div className="flex justify-center gap-8 py-2 text-xs font-bold uppercase tracking-wider">
                <div className="bg-slate-955/40 border border-slate-850 px-5 py-3.5 rounded-xl text-center min-w-[110px]">
                  <span className="text-emerald-400 text-3xl font-black block">{correctCount}</span>
                  <span className="text-slate-505 text-[10px]">{text.CONGRATS_CORRECT_VAL(correctCount, questions.length)}</span>
                </div>
                <div className="bg-slate-955/40 border border-slate-850 px-5 py-3.5 rounded-xl text-center min-w-[110px]">
                  <span className="text-purple-400 text-3xl font-black block">
                    {questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0}%
                  </span>
                  <span className="text-slate-500 text-[10px]">{text.CONGRATS_ACCURACY}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
                className="px-6 py-3 bg-purple-650 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-650/15 hover:scale-102 active:scale-98"
              >
                {common.CONGRATS_GO_BACK}
              </button>
            </div>
          )}

          <QuizQuestionsList
            questions={questions}
            selectedAnswers={selectedAnswers}
            submittedAnswers={submittedAnswers}
            handleReplaySegment={handleReplaySegment}
            handleSelectOption={handleSelectOption}
            handleSubmitAnswer={handleSubmitAnswer}
          />
        </div>
      </div>
    </div>
  );
}

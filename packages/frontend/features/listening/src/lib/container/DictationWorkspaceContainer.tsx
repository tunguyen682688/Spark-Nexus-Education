import { useDictationWorkspace } from '../hooks';
import {
  Info,
  ArrowLeft,
  RefreshCw,
  BarChart2,
  Trophy,
  Clock,
} from 'lucide-react';
import DictationSidebar from '../components/DictationSidebar';
import DictationExerciseCard from '../components/DictationExerciseCard';
import { LISTENING_WORKSPACE_TEXT, LISTENING_ROUTES } from '../constants';

export default function DictationWorkspaceContainer() {
  const {
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
  } = useDictationWorkspace();

  const common = LISTENING_WORKSPACE_TEXT.COMMON;
  const text = LISTENING_WORKSPACE_TEXT.DICTATION;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-sm font-medium">
          {common.LOADING_DICTATION}
        </p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <Info className="w-12 h-12 text-red-500/80 mb-3" />
        <h2 className="text-lg font-bold">{common.ERROR_MATERIAL_TITLE}</h2>
        <p className="text-sm text-slate-505 mt-1 max-w-sm">
          {common.ERROR_DICTATION_DESC}
        </p>
        <button
          onClick={() => navigate(LISTENING_ROUTES.HUB)}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-slate-202 rounded-xl text-xs font-bold"
        >
          {common.BACK_TO_HOME}
        </button>
      </div>
    );
  }

  const totalCompleted = Object.keys(submittedDictations).filter(
    (k) => submittedDictations[k]
  ).length;

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col">
      {/* Hidden Audio Ref */}
      <audio
        ref={audioRef}
        src={material.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleAudioEnded}
      />

      {/* Main Header */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
            className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-202 hover:bg-slate-800/60 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                {text.MODE_LABEL}
              </span>
              <span className="text-xs text-slate-505">
                • {material.difficulty}
              </span>
            </div>
            <h1 className="text-base font-extrabold text-slate-202 mt-0.5 truncate max-w-md">
              {material.title}
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            <div className="text-left">
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {text.STATS_TIME}
              </p>
              <p className="text-xs font-bold text-slate-202">
                {formatTime(secondsSpent)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <p className="text-[10px] text-slate-505 font-bold uppercase">
                {text.STATS_COMPLETED}
              </p>
              <p className="text-xs font-bold text-slate-202">
                {text.STATS_COMPLETED_VAL(totalCompleted, subtitles.length)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-full mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)]">
        {/* Left column: sentences selector list */}
        <DictationSidebar
          subtitles={subtitles}
          selectedSubIndex={selectedSubIndex}
          setSelectedSubIndex={setSelectedSubIndex}
          submittedDictations={submittedDictations}
          getDictationStats={getDictationStats}
          typedTexts={typedTexts}
        />

        {/* Right column: Dictation Workspace */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 h-full">
          {totalCompleted === subtitles.length && subtitles.length > 0 && (
            <div className="p-8 bg-gradient-to-br from-purple-500/10 to-indigo-950/40 border border-purple-500/30 rounded-2xl text-center space-y-5 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <Trophy className="w-16 h-16 text-yellow-455 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100">{common.CONGRATS_TITLE}</h3>
                <p className="text-xs text-slate-400">{text.CONGRATS_DESC(subtitles.length)}</p>
              </div>
              <button
                onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
                className="px-6 py-3 bg-purple-650 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-purple-650/15 hover:scale-102 active:scale-98"
              >
                {common.CONGRATS_GO_BACK}
              </button>
            </div>
          )}

          {currentSub ? (
            <DictationExerciseCard
              currentSub={currentSub}
              selectedSubIndex={selectedSubIndex}
              subtitles={subtitles}
              playbackSpeed={playbackSpeed}
              changeSpeed={changeSpeed}
              playSentence={playSentence}
              showTranslation={showTranslation}
              setShowTranslation={setShowTranslation}
              typedTexts={typedTexts}
              setTypedTexts={setTypedTexts}
              submittedDictations={submittedDictations}
              setSubmittedDictations={setSubmittedDictations}
              handleResetCurrent={handleResetCurrent}
              cleanWord={cleanWord}
              handleSubmitDictation={handleSubmitDictation}
              saveProgress={saveProgress}
              setSelectedSubIndex={setSelectedSubIndex}
              getDictationStats={getDictationStats}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-505 py-32 bg-slate-900/20 border border-slate-800 rounded-2xl">
              <Info className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-sm font-medium">
                {common.EMPTY_SUBTITLES}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

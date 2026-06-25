import { useTranscriptWorkspace } from '../hooks';
import { ArrowLeft, Languages, Gauge, Info, RefreshCw } from 'lucide-react';
import TranscriptSubtitlesList from '../components/TranscriptSubtitlesList';
import TranscriptAudioPlayerFooter from '../components/TranscriptAudioPlayerFooter';
import { LISTENING_WORKSPACE_TEXT, LISTENING_ROUTES } from '../constants';

export default function TranscriptWorkspaceContainer() {
  const {
    navigate,
    audioRef,
    subtitleRefs,
    material,
    isLoading,
    error,
    isPlaying,
    currentTime,
    duration,
    playbackSpeed,
    showTranslation,
    setShowTranslation,
    handlePlayPause,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleAudioEnded,
    handleSubtitleClick,
    handleSeek,
    changeSpeed,
    getActiveSubtitleId,
    formatTime,
  } = useTranscriptWorkspace();

  const common = LISTENING_WORKSPACE_TEXT.COMMON;
  const text = LISTENING_WORKSPACE_TEXT.TRANSCRIPT;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-sm font-medium">{common.LOADING_TRANSCRIPT}</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <Info className="w-12 h-12 text-red-500/80 mb-3" />
        <h2 className="text-lg font-bold">{common.ERROR_MATERIAL_TITLE}</h2>
        <p className="text-sm text-slate-500 mt-1">{common.ERROR_MATERIAL_DESC}</p>
        <button
          onClick={() => navigate(LISTENING_ROUTES.STUDY(material?.id || ''))}
          className="mt-6 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-350 hover:text-slate-200 rounded-xl text-xs font-bold"
        >
          {common.BACK_TO_DASHBOARD}
        </button>
      </div>
    );
  }

  const activeSubId = getActiveSubtitleId();
  const subtitles = material.subtitles || [];

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col h-screen overflow-hidden">
      {/* Hidden Audio Ref */}
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
              <span className="text-xs text-slate-500">• {material.difficulty}</span>
            </div>
            <h1 className="text-base font-extrabold text-slate-202 mt-0.5 truncate max-w-md">
              {material.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              showTranslation
                ? 'bg-purple-505/10 border-purple-500/30 text-purple-300'
                : 'bg-slate-955 border-slate-855 text-slate-400 hover:text-slate-202'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            {text.DUAL_LANG_BUTTON}
          </button>
          <button
            onClick={changeSpeed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-955 border border-slate-855 text-slate-400 hover:text-slate-202 rounded-xl transition-all"
          >
            <Gauge className="w-3.5 h-3.5" />
            {common.SPEED_TEMPLATE(playbackSpeed)}
          </button>
        </div>
      </header>

      {/* Main Transcript List (Scrollable Area) */}
      <main className="flex-1 overflow-y-auto px-6 py-8 max-w-4xl mx-auto w-full custom-scrollbar">
        <TranscriptSubtitlesList
          subtitles={subtitles}
          activeSubId={activeSubId}
          subtitleRefs={subtitleRefs}
          handleSubtitleClick={handleSubtitleClick}
          showTranslation={showTranslation}
          formatTime={formatTime}
        />
      </main>

      {/* Footer Audio Player Controls */}
      <TranscriptAudioPlayerFooter
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        handlePlayPause={handlePlayPause}
        handleSeek={handleSeek}
        formatTime={formatTime}
      />
    </div>
  );
}

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium">{common.LOADING_TRANSCRIPT}</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <Info className="w-12 h-12 text-red-500/80 mb-3" />
        <h2 className="text-lg font-bold">{common.ERROR_MATERIAL_TITLE}</h2>
        <p className="text-sm text-muted-foreground mt-1">{common.ERROR_MATERIAL_DESC}</p>
        <button
          onClick={() => navigate(LISTENING_ROUTES.STUDY(material?.id || ''))}
          className="mt-6 px-5 py-2.5 bg-secondary border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold"
        >
          {common.BACK_TO_DASHBOARD}
        </button>
      </div>
    );
  }

  const activeSubId = getActiveSubtitleId();
  const subtitles = material.subtitles || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen overflow-hidden">
      {/* Hidden Audio Ref */}
      <audio
        ref={audioRef}
        src={material.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
      />

      {/* Workspace Header */}
      <header className="bg-card border-b border-border backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
            className="flex items-center justify-center p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {text.MODE_LABEL}
              </span>
              <span className="text-xs text-muted-foreground">• {material.difficulty}</span>
            </div>
            <h1 className="text-base font-extrabold text-foreground mt-0.5 truncate max-w-md">
              {material.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              showTranslation
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            {text.DUAL_LANG_BUTTON}
          </button>
          <button
            onClick={changeSpeed}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-secondary border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
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

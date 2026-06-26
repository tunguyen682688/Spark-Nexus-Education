import { useGapFillWorkspace } from '../hooks';
import { ArrowLeft, Info, RefreshCw, Trophy } from 'lucide-react';
import GapFillSidebar from '../components/GapFillSidebar';
import GapFillExerciseCard from '../components/GapFillExerciseCard';
import { LISTENING_WORKSPACE_TEXT, LISTENING_ROUTES } from '../constants';

export default function GapFillWorkspaceContainer() {
  const {
    navigate,
    audioRef,
    material,
    isLoading,
    error,
    selectedSubIndex,
    setSelectedSubIndex,
    playbackSpeed,
    userAnswers,
    setUserAnswers,
    isSubmitted,
    setIsSubmitted,
    showHints,
    setShowHints,
    subtitles,
    currentSub,
    handleTimeUpdate,
    playSentence,
    changeSpeed,
    cleanWord,
    blankedIndices,
    wordsList,
    scoreStats,
    completedSentences,
    handleSubmitGapFill,
  } = useGapFillWorkspace();

  const common = LISTENING_WORKSPACE_TEXT.COMMON;
  const text = LISTENING_WORKSPACE_TEXT.GAPFILL;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-muted-foreground gap-3">
        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm font-medium">{common.LOADING_GAPFILL}</p>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-red-400 p-6 text-center">
        <Info className="w-12 h-12 text-red-500/80 mb-3" />
        <h2 className="text-lg font-bold">{common.ERROR_MATERIAL_TITLE}</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {common.ERROR_MATERIAL_DESC}
        </p>
        <button
          onClick={() => navigate(LISTENING_ROUTES.STUDY(material?.id || ''))}
          className="mt-6 px-5 py-2.5 bg-secondary border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold"
        >
          {common.BACK_TO_DASHBOARD}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hidden Audio Ref */}
      <audio
        ref={audioRef}
        src={material.mediaUrl}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Header */}
      <header className="bg-card border-b border-border backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
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
              <span className="text-xs text-muted-foreground">
                • {material.difficulty}
              </span>
            </div>
            <h1 className="text-base font-extrabold text-foreground mt-0.5 truncate max-w-md">
              {material.title}
            </h1>
          </div>
        </div>

        <button
          onClick={changeSpeed}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-secondary border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
        >
          {common.SPEED_LABEL(playbackSpeed)}
        </button>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-full mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)]">
        {/* Left column: Subtitle sentence selector list */}
        <GapFillSidebar
          subtitles={subtitles}
          selectedSubIndex={selectedSubIndex}
          setSelectedSubIndex={setSelectedSubIndex}
        />

        {/* Right column: Interactive Gap Fill Box */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-1 h-full">
          {completedSentences.size === subtitles.length && subtitles.length > 0 && (
            <div className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl text-center space-y-5 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <Trophy className="w-16 h-16 text-yellow-455 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-100">{common.CONGRATS_TITLE}</h3>
                <p className="text-xs text-slate-400">{text.CONGRATS_DESC(subtitles.length)}</p>
              </div>
              <button
                onClick={() => navigate(LISTENING_ROUTES.STUDY(material.id))}
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-primary/15 hover:scale-102 active:scale-98"
              >
                {common.CONGRATS_GO_BACK}
              </button>
            </div>
          )}

          {currentSub ? (
            <GapFillExerciseCard
              currentSub={currentSub}
              wordsList={wordsList}
              blankedIndices={blankedIndices}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
              isSubmitted={isSubmitted}
              setIsSubmitted={setIsSubmitted}
              showHints={showHints}
              setShowHints={setShowHints}
              scoreStats={scoreStats}
              playSentence={playSentence}
              cleanWord={cleanWord}
              handleSubmitGapFill={handleSubmitGapFill}
              selectedSubIndex={selectedSubIndex}
              setSelectedSubIndex={setSelectedSubIndex}
              subtitleCount={subtitles.length}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-32 bg-muted/20 border border-border rounded-2xl">
              <Info className="w-12 h-12 text-muted-foreground/60 mb-3" />
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

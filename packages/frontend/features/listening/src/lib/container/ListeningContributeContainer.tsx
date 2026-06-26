import { useListeningContribute } from '../hooks';
import ContributeMetadataStep from '../components/ContributeMetadataStep';
import ContributeSubtitlesStep from '../components/ContributeSubtitlesStep';
import ContributeQuestionsStep from '../components/ContributeQuestionsStep';
import ContributePreviewStep from '../components/ContributePreviewStep';
import { ArrowLeft, Sparkles, X } from 'lucide-react';
import { LISTENING_CONTRIBUTE_TEXT } from '../constants';

export default function ListeningContributeContainer() {
  const {
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
    bulkText,
    setBulkText,
    isBulkInputOpen,
    setIsBulkInputOpen,
    activeSyncIndex,
    questions,
    audioRef,
    audioPlaying,
    audioTime,
    audioDuration,
    errorMsg,
    setErrorMsg,
    successMsg,
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
  } = useListeningContribute();

  const text = LISTENING_CONTRIBUTE_TEXT;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      
      {/* Hidden background audio player for syncing */}
      {mediaUrl && (
        <audio
          ref={audioRef}
          src={mediaUrl}
          preload="metadata"
          className="hidden"
        />
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <button
              onClick={() => navigate('/listening')}
              className="flex items-center gap-2 text-xs font-extrabold text-muted-foreground hover:text-foreground transition-colors bg-card border border-border px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              {text.BACK_TO_LIST}
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-foreground pt-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              {text.HEADER_TITLE}
            </h1>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="flex items-center bg-card border border-border rounded-xl px-3 py-1.5 gap-2.5">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentStep === step
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="p-1 text-red-400/60 hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs font-bold rounded-xl animate-pulse">
            {successMsg}
          </div>
        )}

        {/* STEP 1: METADATA & MEDIA SETTINGS */}
        {currentStep === 1 && (
          <ContributeMetadataStep
            title={title}
            setTitle={setTitle}
            author={author}
            setAuthor={setAuthor}
            mediaUrl={mediaUrl}
            setMediaUrl={setMediaUrl}
            thumbnailUrl={thumbnailUrl}
            setThumbnailUrl={setThumbnailUrl}
            category={category}
            setCategory={setCategory}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            duration={duration}
            setDuration={setDuration}
            tagsText={tagsText}
            setTagsText={setTagsText}
            description={description}
            setDescription={setDescription}
            onNextStep={() => setCurrentStep(2)}
          />
        )}

        {/* STEP 2: TIME-SYNC SUBTITLE STUDIO */}
        {currentStep === 2 && (
          <ContributeSubtitlesStep
            title={title}
            duration={duration}
            audioTime={audioTime}
            audioDuration={audioDuration}
            audioPlaying={audioPlaying}
            activeSyncIndex={activeSyncIndex}
            subtitles={subtitles}
            bulkText={bulkText}
            setBulkText={setBulkText}
            isBulkInputOpen={isBulkInputOpen}
            setIsBulkInputOpen={setIsBulkInputOpen}
            togglePlayback={togglePlayback}
            seekTo={seekTo}
            formatDuration={formatDuration}
            handleSyncCurrentTime={handleSyncCurrentTime}
            handleResetSyncIndex={handleResetSyncIndex}
            handleBulkParse={handleBulkParse}
            handleAddSubtitleRow={handleAddSubtitleRow}
            handleRemoveSubtitleRow={handleRemoveSubtitleRow}
            handleUpdateSubtitleField={handleUpdateSubtitleField}
            onPrevStep={() => setCurrentStep(1)}
            onNextStep={() => setCurrentStep(3)}
          />
        )}

        {/* STEP 3: QUIZ & QUESTIONS BUILDER */}
        {currentStep === 3 && (
          <ContributeQuestionsStep
            title={title}
            duration={duration}
            audioTime={audioTime}
            audioDuration={audioDuration}
            audioPlaying={audioPlaying}
            questions={questions}
            togglePlayback={togglePlayback}
            seekTo={seekTo}
            formatDuration={formatDuration}
            handleAddQuestion={handleAddQuestion}
            handleRemoveQuestion={handleRemoveQuestion}
            handleUpdateQuestion={handleUpdateQuestion}
            handleGhimQuestionAudioTimestamp={handleGhimQuestionAudioTimestamp}
            onPrevStep={() => setCurrentStep(2)}
            onNextStep={() => setCurrentStep(4)}
          />
        )}

        {/* STEP 4: LIVE PREVIEW SIMULATOR & PUBLISH */}
        {currentStep === 4 && (
          <ContributePreviewStep
            mockMaterialPreview={mockMaterialPreview}
            isPublishing={createMaterialMutation.isPending}
            onPrevStep={() => setCurrentStep(3)}
            onSubmitPublish={handleSubmitPublish}
          />
        )}

      </div>
    </div>
  );
}
